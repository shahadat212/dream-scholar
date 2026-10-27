import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import useToast from '../../hooks/useToast';
import { FaStar } from 'react-icons/fa';
import { FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import Loading from '../../../components/Loading';
import DashboardHeader from '../../../components/DashboardHeader';
import EmptyState from '../../../components/EmptyState';
import Spinner from '../../../components/Spinner';

const avatarFor = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}`;

const ManageReviews = () => {
    const toast = useToast();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [visibilityFilter, setVisibilityFilter] = useState('all');

    const { data: reviews = [], isLoading, isError } = useQuery({
        queryKey: ['reviews', 'manage'],
        queryFn: async () => (await axiosSecure.get('/reviews/manage')).data,
    });

    const visibilityMutation = useMutation({
        mutationFn: ({ id, hidden }) => axiosSecure.patch(`/reviews/${id}/visibility`, { hidden }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
            queryClient.invalidateQueries({ queryKey: ['scholarships'] });
            queryClient.invalidateQueries({ queryKey: ['topScholarships'] });
            queryClient.invalidateQueries({ queryKey: ['scholarship'] });
        },
    });

    const handleVisibility = async (review) => {
        const hidden = !review?.hidden;
        try {
            await visibilityMutation.mutateAsync({ id: review._id, hidden });
            toast.fire({
                icon: 'success',
                title: hidden ? 'Review hidden' : 'Review restored',
                text: hidden ? 'Students no longer see it, and it no longer counts toward the rating.' : 'The review is public again.',
                timer: 1800,
                showConfirmButton: false,
            });
        } catch {
            toast.fire({ icon: 'error', title: 'Could not update the review', text: 'Please try again.' });
        }
    };

    const deleteMutation = useMutation({
        mutationFn: (id) => axiosSecure.delete(`/reviews/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
            queryClient.invalidateQueries({ queryKey: ['scholarships'] });
            queryClient.invalidateQueries({ queryKey: ['topScholarships'] });
            queryClient.invalidateQueries({ queryKey: ['scholarship'] });
        },
    });

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete this review?",
            text: "It will be removed from the scholarship page. You can't undo this.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#FF6B57",
            cancelButtonColor: "#14141F",
            confirmButtonText: "Yes, delete it",
        });
        if (!result.isConfirmed) return;

        try {
            await deleteMutation.mutateAsync(id);
            toast.fire({ title: "Deleted", text: "The review has been removed.", icon: "success" });
        } catch {
            toast.fire({ title: "Could not delete", text: "Please try again.", icon: "error" });
        }
    };

    const visibleReviews = visibilityFilter === 'all'
        ? reviews
        : reviews.filter((review) => (visibilityFilter === 'hidden' ? review?.hidden : !review?.hidden));

    const publicReviews = reviews.filter((review) => !review?.hidden);
    const averageRating = publicReviews.length
        ? (publicReviews.reduce((sum, review) => sum + (Number(review?.rating) || 0), 0) / publicReviews.length).toFixed(1)
        : null;

    return (
        <div className="space-y-8">
            <Helmet>
                <title>All Reviews | Dream Scholar Hub</title>
            </Helmet>

            <DashboardHeader tag="Moderation" title="All Reviews" subtitle="Everything students said about their scholarships. Hide reviews that break the rules, or delete them for good.">
                {reviews.length > 0 && (
                    <>
                        <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-ink shadow-[0_4px_20px_-10px_rgba(20,20,31,0.3)]">
                            {reviews.length} reviews
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-sun-50 px-4 py-2 text-xs font-bold text-sun-700">
                            <FaStar /> {averageRating ?? '—'} average
                        </span>
                    </>
                )}
            </DashboardHeader>

            {isLoading ? (
                <Loading label="Loading reviews..." />
            ) : isError ? (
                <p className="text-sm font-semibold text-coral">We could not load reviews. Please refresh the page.</p>
            ) : reviews.length === 0 ? (
                <EmptyState icon={FaStar} title="No reviews yet" text="Reviews appear here once students rate their scholarships." />
            ) : (
                <>
                    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Filter by visibility">
                        {[
                            { value: 'all', label: 'All', count: reviews.length },
                            { value: 'visible', label: 'Visible', count: reviews.filter((r) => !r?.hidden).length },
                            { value: 'hidden', label: 'Hidden', count: reviews.filter((r) => r?.hidden).length },
                        ].map((filter) => (
                            <button
                                key={filter.value}
                                role="tab"
                                aria-selected={visibilityFilter === filter.value}
                                onClick={() => setVisibilityFilter(filter.value)}
                                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                                    visibilityFilter === filter.value ? 'bg-ink text-white' : 'bg-white text-ink/60 shadow-[0_4px_20px_-10px_rgba(20,20,31,0.3)] hover:text-ink'
                                }`}
                            >
                                {filter.label}
                                <span className={`rounded-full px-2 py-0.5 text-[10px] ${visibilityFilter === filter.value ? 'bg-white/15' : 'bg-black/5'}`}>{filter.count}</span>
                            </button>
                        ))}
                    </div>
                    {visibleReviews.length === 0 ? (
                        <EmptyState icon={FaStar} title={`No ${visibilityFilter} reviews`} text="Try another filter." />
                    ) : (
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
                            {visibleReviews.map((review) => (
                                <article key={review?._id} className={`flex flex-col rounded-3xl bg-white p-6 shadow-[0_8px_30px_-15px_rgba(20,20,31,0.2)] ${review?.hidden ? 'opacity-70' : ''}`}>
                                    {review?.hidden && (
                                        <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-black/5 px-3 py-1 text-[11px] font-bold text-ink/60">
                                            <FiEyeOff /> Hidden from students
                                        </span>
                                    )}
                                    <div className="flex items-start gap-3">
                                        <img
                                            src={review?.userImage || avatarFor(review?.userName)}
                                            onError={(e) => { e.currentTarget.src = avatarFor(review?.userName); }}
                                            alt=""
                                            className="h-11 w-11 shrink-0 rounded-full border border-black/5 object-cover"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-bold text-ink">{review?.userName || 'Anonymous'}</p>
                                            <p className="text-xs text-ink/40">{review?.date}</p>
                                        </div>
                                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sun-50 px-2.5 py-1 text-xs font-bold text-sun-700">
                                            <FaStar className="text-[10px]" /> {review?.rating}
                                        </span>
                                    </div>

                                    <p className="mt-4 flex-1 text-sm leading-relaxed text-ink/70">&ldquo;{review?.comment}&rdquo;</p>

                                    <div className="mt-5 flex items-end justify-between gap-3 border-t border-black/5 pt-4">
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-bold text-ink">{review?.scholarshipName}</p>
                                            <p className="truncate text-xs text-ink/50">{review?.universityName}</p>
                                        </div>
                                        <div className="flex shrink-0 gap-2">
                                            <button
                                                onClick={() => handleVisibility(review)}
                                                disabled={visibilityMutation.isPending && visibilityMutation.variables?.id === review?._id}
                                                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-ink/70 transition-colors hover:bg-black/5 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                                                aria-label={review?.hidden ? 'Show review' : 'Hide review'}
                                                title={review?.hidden ? 'Show' : 'Hide'}
                                            >
                                                {visibilityMutation.isPending && visibilityMutation.variables?.id === review?._id
                                                    ? <Spinner className="h-3.5 w-3.5" />
                                                    : review?.hidden ? <FiEye /> : <FiEyeOff />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(review?._id)}
                                                disabled={deleteMutation.isPending && deleteMutation.variables === review?._id}
                                                className="flex h-9 w-9 items-center justify-center rounded-full bg-coral-50 text-coral-700 transition-colors hover:bg-coral hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                                                aria-label="Delete review"
                                                title="Delete"
                                            >
                                                {deleteMutation.isPending && deleteMutation.variables === review?._id ? <Spinner className="h-3.5 w-3.5" /> : <FiTrash2 />}
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ManageReviews;
