import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import Swal from 'sweetalert2';
import useAuth from '../hooks/useAuth';
import useAxiosPublic from '../hooks/useAxiosPublic';
import useAxiosSecure from '../hooks/useAxiosSecure';
import useMyApplications from '../hooks/useMyApplications';
import ErrorPage from '../../components/ErrorPage';
import Loading from '../../components/Loading';

const PaymentPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const axiosPublic = useAxiosPublic();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paidTransactionId, setPaidTransactionId] = useState(null);
    const { findApplication, isMyApplicationsLoading } = useMyApplications();
    const application = location.state?.application?.scholarShipId === id ? location.state.application : null;

    const { data: scholarship, isLoading } = useQuery({
        queryKey: ['scholarship', id],
        queryFn: async () => {
            const res = await axiosPublic.get(`/scholarships/${id}`);
            return res.data;
        },
    });

    const paymentMutation = useMutation({
        mutationFn: (payment) => axiosSecure.post('/payments', payment),
    });

    const applicationMutation = useMutation({
        mutationFn: (newApplication) => axiosSecure.post('/applications', newApplication),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            queryClient.invalidateQueries({ queryKey: ['payments'] });
        },
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

    if (!paidTransactionId && (findApplication(id) || (!!scholarship?.applicationDeadline && scholarship.applicationDeadline < new Date().toISOString().split('T')[0]))) {
        return <Navigate to={`/scholarships/details/${id}`} replace></Navigate>;
    }

    const totalDue = (scholarship.applicationFees || 0) + (scholarship.serviceCharge || 0);

    const handleMockPayment = async () => {
        setIsProcessing(true);

        if (!paidTransactionId) {
            const transactionId = `txn-mock-${Date.now()}`;
            try {
                await paymentMutation.mutateAsync({
                    studentEmail: user?.email,
                    scholarshipName: scholarship.scholarshipName,
                    amount: totalDue,
                    transactionId,
                });
                setPaidTransactionId(transactionId);
            } catch {
                setIsProcessing(false);
                Swal.fire({ icon: 'error', title: 'Payment failed', text: 'Payment could not be processed. Please try again.', confirmButtonColor: '#5B4CFB' });
                return;
            }
        }

        try {
            await applicationMutation.mutateAsync(application);
            await Swal.fire({
                icon: 'success',
                title: 'Application submitted',
                text: 'Your payment was confirmed and your application is now pending review.',
                confirmButtonColor: '#5B4CFB',
            });
            navigate('/userDashboard/myApplication', { replace: true });
        } catch (error) {
            const status = error?.response?.status;
            const isFinal = status === 400 || status === 404 || status === 409;
            Swal.fire({
                icon: 'error',
                title: 'Application not submitted',
                text: isFinal
                    ? `${error?.response?.data?.message || 'This application cannot be submitted.'} Your payment is on file; please contact support for a refund.`
                    : 'Your payment is recorded, but we could not submit your application. Press the button again to retry; you will not be charged twice.',
                confirmButtonColor: '#5B4CFB',
            });
        } finally {
            setIsProcessing(false);
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
                            <span className="font-display text-lg font-extrabold text-violet">${totalDue}</span>
                        </div>
                    </div>

                    <p className="mt-5 text-xs leading-relaxed text-ink/40">
                        Payment is simulated for now — no real card details are collected.
                        Real card payment via Stripe can replace this once a payment provider is connected.
                    </p>

                    <button
                        onClick={handleMockPayment}
                        disabled={isProcessing}
                        className="mt-6 w-full rounded-full bg-violet py-3.5 text-sm font-bold text-white shadow-lg shadow-violet/25 transition hover:bg-violet-600 disabled:opacity-60"
                    >
                        {isProcessing ? 'Processing…' : paidTransactionId ? 'Retry Submitting Application' : `Pay $${totalDue} & Submit`}
                    </button>

                    {!paidTransactionId && (
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
