import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import useToast from '../hooks/useToast';
import useAuth from '../hooks/useAuth';
import useAxiosPublic from '../hooks/useAxiosPublic';
import useAxiosSecure from '../hooks/useAxiosSecure';
import useMyApplications from '../hooks/useMyApplications';
import ErrorPage from '../../components/ErrorPage';
import Loading from '../../components/Loading';
import CheckoutForm from '../../components/CheckoutForm';
import Spinner from '../../components/Spinner';

const publishableKey = import.meta.env.VITE_Payment_Gateway_PK;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

const PaymentPage = () => {
    const toast = useToast();
    const { id } = useParams();
    const { user } = useAuth();
    const axiosPublic = useAxiosPublic();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const [paidIntentId, setPaidIntentId] = useState(null);
    const [isPaymentRecorded, setIsPaymentRecorded] = useState(false);
    const [isSubmittingFree, setIsSubmittingFree] = useState(false);
    const { findApplication, isMyApplicationsLoading } = useMyApplications();
    const application = location.state?.application?.scholarShipId === id ? location.state.application : null;

    const { data: scholarship, isLoading } = useQuery({
        queryKey: ['scholarship', id],
        queryFn: async () => {
            const res = await axiosPublic.get(`/scholarships/${id}`);
            return res.data;
        },
    });

    const isOpen = !!scholarship && !(scholarship?.applicationDeadline && scholarship.applicationDeadline < new Date().toISOString().split('T')[0]);

    const { data: intent, isLoading: isIntentLoading, error: intentError } = useQuery({
        queryKey: ['paymentIntent', id, user?.email],
        enabled: !!application && isOpen && !isMyApplicationsLoading && !findApplication(id),
        staleTime: Infinity,
        retry: false,
        queryFn: async () => (await axiosSecure.post('/payments/create-intent', { scholarshipId: id })).data,
    });

    const paymentMutation = useMutation({
        mutationFn: (payment) => axiosSecure.post('/payments', payment),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
    });

    const applicationMutation = useMutation({
        mutationFn: (newApplication) => axiosSecure.post('/applications', newApplication),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications'] }),
    });

    if (!application) {
        return <Navigate to={`/applicationForm/${id}`} replace></Navigate>;
    }

    if (isLoading || isMyApplicationsLoading) {
        return <Loading label="Loading scholarship..." />;
    }

    if (!scholarship) {
        return <ErrorPage />;
    }

    if (!paidIntentId && (findApplication(id) || !isOpen)) {
        return <Navigate to={`/scholarships/details/${id}`} replace></Navigate>;
    }

    const totalDue = (Number(scholarship.applicationFees) || 0) + (Number(scholarship.serviceCharge) || 0);

    const submitApplication = async () => {
        try {
            await applicationMutation.mutateAsync(application);
            queryClient.removeQueries({ queryKey: ['paymentIntent', id] });
            toast.fire({ icon: 'success', title: 'Application submitted', text: 'Your application is now pending review.' });
            navigate('/userDashboard/myApplication', { replace: true });
        } catch (error) {
            const status = error?.response?.status;
            toast.fire({
                icon: 'error',
                title: 'Application not submitted',
                text: status === 400 || status === 404 || status === 409
                    ? `${error?.response?.data?.message || 'This application cannot be submitted.'} Your payment is on file; please contact support.`
                    : 'Your payment is safe. Press the button again to finish; you will not be charged twice.',
            });
        }
    };

    const handlePaid = async (paymentIntentId) => {
        setPaidIntentId(paymentIntentId);
        if (!isPaymentRecorded) {
            try {
                await paymentMutation.mutateAsync({ scholarshipId: id, paymentIntentId });
                setIsPaymentRecorded(true);
            } catch (error) {
                toast.fire({
                    icon: 'error',
                    title: 'Payment received, not yet saved',
                    text: error?.response?.data?.message || 'Press the button again to finish. You will not be charged twice.',
                });
                return;
            }
        }
        await submitApplication();
    };

    const handleFreeSubmit = async () => {
        setIsSubmittingFree(true);
        try {
            await paymentMutation.mutateAsync({ scholarshipId: id });
            await submitApplication();
        } catch (error) {
            toast.fire({ icon: 'error', title: 'Could not submit', text: error?.response?.data?.message || 'Please try again.' });
        } finally {
            setIsSubmittingFree(false);
        }
    };

    return (
        <div className="min-h-[70vh] py-16">
            <Helmet>
                <title>Payment | Dream Scholar Hub</title>
            </Helmet>
            <div className="mx-auto max-w-md px-6">
                <div className="text-center">
                    <span className="inline-block rounded-full bg-coral/10 px-4 py-1.5 text-xs font-bold text-coral">Step 2 of 2 · Payment</span>
                </div>
                <h1 className="mt-3 text-center font-display text-3xl font-extrabold text-ink">Confirm Payment</h1>
                <p className="mt-2 text-center text-sm text-ink/60">
                    Pay once to submit your application for {scholarship.scholarshipName}.
                </p>

                <div className="mt-8 rounded-3xl bg-white p-6 shadow-[0_8px_30px_-15px_rgba(20,20,31,0.2)]">
                    <div className="space-y-3">
                        <div className="flex justify-between border-b border-black/5 pb-3">
                            <span className="text-sm text-ink/50">Scholarship</span>
                            <span className="text-right text-sm font-semibold text-ink">{scholarship.scholarshipName}</span>
                        </div>
                        <div className="flex justify-between border-b border-black/5 pb-3">
                            <span className="text-sm text-ink/50">
                                University application fee
                                <span className="block text-[11px] text-ink/40">Set by the university to process your application</span>
                            </span>
                            <span className="font-semibold text-ink">{Number(scholarship.applicationFees) > 0 ? `$${scholarship.applicationFees}` : 'Free'}</span>
                        </div>
                        <div className="flex justify-between border-b border-black/5 pb-3">
                            <span className="text-sm text-ink/50">
                                Dream Scholar service fee
                                <span className="block text-[11px] text-ink/40">For checking and submitting your application</span>
                            </span>
                            <span className="font-semibold text-ink">${scholarship.serviceCharge}</span>
                        </div>
                        <div className="flex justify-between pt-1">
                            <span className="font-display font-bold text-ink">Total due today</span>
                            <span className="font-display text-lg font-extrabold text-violet">${totalDue.toLocaleString('en-US')}</span>
                        </div>
                    </div>

                    <div className="mt-6 border-t border-black/5 pt-6">
                        {!stripePromise ? (
                            <p className="text-sm font-semibold text-coral">Card payments are not configured. Please contact support.</p>
                        ) : isIntentLoading ? (
                            <Loading label="Preparing secure payment..." />
                        ) : intentError ? (
                            <p className="text-sm font-semibold text-coral">
                                {intentError?.response?.data?.message || 'We could not start the payment. Please refresh and try again.'}
                            </p>
                        ) : intent?.free ? (
                            <button
                                type="button"
                                onClick={handleFreeSubmit}
                                disabled={isSubmittingFree}
                                className="flex w-full items-center justify-center gap-2 rounded-full bg-violet py-3.5 text-sm font-bold text-white shadow-lg shadow-violet/25 transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmittingFree && <Spinner />}
                                {isSubmittingFree ? 'Submitting…' : 'Submit application (no fee)'}
                            </button>
                        ) : intent?.clientSecret ? (
                            <Elements stripe={stripePromise}>
                                <CheckoutForm
                                    clientSecret={intent.clientSecret}
                                    amount={intent.amount ?? totalDue}
                                    billingName={user?.displayName}
                                    billingEmail={user?.email}
                                    paidIntentId={paidIntentId}
                                    onPaid={handlePaid}
                                />
                            </Elements>
                        ) : null}
                    </div>

                    {!paidIntentId && (
                        <Link
                            to={`/applicationForm/${id}`}
                            state={{ application }}
                            className="mt-3 block rounded-full border border-black/10 bg-white py-3.5 text-center text-sm font-bold text-ink transition hover:bg-black/5"
                        >
                            Back to Edit Details
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
