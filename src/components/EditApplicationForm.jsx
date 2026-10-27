import React, { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import useAxiosSecure from '../pages/hooks/useAxiosSecure';
import ErrorPage from './ErrorPage';
import Loading from './Loading';
import DashboardHeader from './DashboardHeader';
import StatusBadge from './StatusBadge';

const fieldClass = "w-full rounded-2xl border border-black/10 bg-cream px-4 py-3 text-ink placeholder:text-ink/30 focus:border-violet focus:outline-none";
const labelClass = "mb-1.5 block text-sm font-bold text-ink";

const EditApplicationForm = () => {
    const { id } = useParams();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: application, isLoading, isError } = useQuery({
        queryKey: ['application', id],
        queryFn: async () => {
            const res = await axiosSecure.get(`/applications/${id}`);
            return res.data;
        },
    });

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

    useEffect(() => {
        if (application) {
            reset(application);
        }
    }, [application, reset]);

    const updateMutation = useMutation({
        mutationFn: (updates) => axiosSecure.patch(`/applications/${id}`, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['application', id] });
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        },
    });

    if (isLoading) {
        return <Loading label="Loading application..." />;
    }

    if (isError || !application) {
        return <ErrorPage />;
    }

    const onSubmit = async (data) => {
        try {
            await updateMutation.mutateAsync({
                phoneNumber: data.phoneNumber,
                address: data.address,
                gender: data.gender,
            });
            Swal.fire({ title: 'Saved', text: 'Your application was updated.', icon: 'success', confirmButtonColor: '#5B4CFB' });
            navigate('/userDashboard/myApplication');
        } catch {
            Swal.fire({ title: 'Update failed', text: 'Please try again.', icon: 'error', confirmButtonColor: '#5B4CFB' });
        }
    };

    return (
        <div className="space-y-8">
            <Helmet>
                <title>Edit Application | Dream Scholar Hub</title>
            </Helmet>

            <DashboardHeader tag="Pending application" title="Edit Application" subtitle="You can change your contact details while the application is still pending." />

            <div className="grid max-w-4xl gap-6 lg:grid-cols-5">
                <aside className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_-15px_rgba(20,20,31,0.2)] lg:col-span-2 lg:self-start">
                    <StatusBadge status={application?.applicationStatus} />
                    <p className="mt-4 font-display text-lg font-bold text-ink">{application?.scholarshipName}</p>
                    <p className="text-sm text-ink/60">{application?.university}</p>
                    <dl className="mt-5 space-y-3 border-t border-black/5 pt-5 text-sm">
                        <div className="flex justify-between gap-4">
                            <dt className="text-ink/50">Subject</dt>
                            <dd className="text-right font-semibold text-ink">{application?.subject}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="text-ink/50">Degree</dt>
                            <dd className="text-right font-semibold text-ink">{application?.degree}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="text-ink/50">Applied on</dt>
                            <dd className="text-right font-semibold text-ink">{application?.currentDate}</dd>
                        </div>
                    </dl>
                </aside>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-3xl bg-white p-6 shadow-[0_8px_30px_-15px_rgba(20,20,31,0.2)] md:p-8 lg:col-span-3" noValidate>
                    <div>
                        <label htmlFor="edit-phone" className={labelClass}>Phone number</label>
                        <input
                            id="edit-phone"
                            type="tel"
                            {...register('phoneNumber', { required: 'Phone number is required' })}
                            className={fieldClass}
                        />
                        {errors.phoneNumber && <span className="mt-1 block text-xs font-semibold text-coral">{errors.phoneNumber.message}</span>}
                    </div>

                    <div>
                        <label htmlFor="edit-address" className={labelClass}>Address</label>
                        <input
                            id="edit-address"
                            {...register('address', { required: 'Address is required' })}
                            placeholder="Village, District, Country"
                            className={fieldClass}
                        />
                        {errors.address && <span className="mt-1 block text-xs font-semibold text-coral">{errors.address.message}</span>}
                    </div>

                    <div>
                        <label htmlFor="edit-gender" className={labelClass}>Gender</label>
                        <select id="edit-gender" {...register('gender', { required: 'Gender selection is required' })} className={fieldClass}>
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        {errors.gender && <span className="mt-1 block text-xs font-semibold text-coral">{errors.gender.message}</span>}
                    </div>

                    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                        <Link to="/userDashboard/myApplication" className="rounded-full border border-black/10 bg-white px-6 py-3.5 text-center text-sm font-bold text-ink hover:bg-black/5">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-full bg-violet px-8 py-3.5 text-sm font-bold text-white transition hover:bg-violet-600 disabled:opacity-60"
                        >
                            {isSubmitting ? 'Saving...' : 'Save changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditApplicationForm;
