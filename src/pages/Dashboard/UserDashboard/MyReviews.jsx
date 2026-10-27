import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { FaStar } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import Loading from '../../../components/Loading';
import DashboardHeader from '../../../components/DashboardHeader';
import DataTable from '../../../components/DataTable';
import EmptyState from '../../../components/EmptyState';
import Modal from '../../../components/Modal';

const fieldClass = "w-full rounded-2xl border border-black/10 bg-cream px-4 py-3 text-ink placeholder:text-ink/30 focus:border-violet focus:outline-none";
const pillClass = "inline-flex items-center justify-center rounded-full px-3.5 py-2 text-xs font-bold transition-colors";

const Stars = ({ value }) => {
    return (
        <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5`}>
            {[1, 2, 3, 4, 5].map((n) => (
                <FaStar key={n} className={`text-sm ${Number(value) >= n ? 'text-sun' : 'text-black/10'}`} />
            ))}
        </span>
    );
};

const MyReviews = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [editingReview, setEditingReview] = useState(null);
    const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm();
    const rating = Number(watch('rating') || 0);

    const { data: myReviews = [], isLoading, isError } = useQuery({
        queryKey: ['reviews', 'mine', user?.email],
        enabled: !!user?.email,
        queryFn: async () => {
            const res = await axiosSecure.get(`/reviews/email/${user.email}`);
            return res.data;
        },
    });

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['reviews', 'mine', user?.email] });
        queryClient.invalidateQueries({ queryKey: ['reviews'] });
        queryClient.invalidateQueries({ queryKey: ['scholarships'] });
        queryClient.invalidateQueries({ queryKey: ['topScholarships'] });
        queryClient.invalidateQueries({ queryKey: ['scholarship'] });
    };

    const deleteMutation = useMutation({
        mutationFn: (id) => axiosSecure.delete(`/reviews/${id}`),
        onSuccess: invalidate,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, updates }) => axiosSecure.patch(`/reviews/${id}`, updates),
        onSuccess: invalidate,
    });

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete this review?",
            text: "You won't be able to undo this.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#FF6B57",
            cancelButtonColor: "#14141F",
            confirmButtonText: "Yes, delete it",
        });
        if (!result.isConfirmed) return;

        try {
            await deleteMutation.mutateAsync(id);
            Swal.fire({ title: "Deleted", text: "Your review has been removed.", icon: "success", confirmButtonColor: "#5B4CFB" });
        } catch {
            Swal.fire({ title: "Could not delete", text: "Please try again.", icon: "error", confirmButtonColor: "#5B4CFB" });
        }
    };

    const openEdit = (review) => {
        reset({ rating: String(review?.rating ?? ''), comment: review?.comment || '' });
        setEditingReview(review);
    };

    const closeEdit = () => setEditingReview(null);

    const onSaveEdit = async (data) => {
        try {
            await updateMutation.mutateAsync({
                id: editingReview._id,
                updates: { rating: Number(data.rating), comment: data.comment.trim() },
            });
            closeEdit();
            Swal.fire({ title: "Updated", text: "Your review has been updated.", icon: "success", confirmButtonColor: "#5B4CFB" });
        } catch {
            Swal.fire({ title: "Could not update", text: "Please try again.", icon: "error", confirmButtonColor: "#5B4CFB" });
        }
    };

    const columns = [
        {
            key: 'scholarship',
            label: 'Scholarship',
            primary: true,
            render: (review) => (
                <div className="min-w-0">
                    <p className="font-bold text-ink">{review?.scholarshipName}</p>
                    <p className="mt-0.5 text-xs text-ink/60">{review?.universityName}</p>
                    {review?.hidden && (
                        <span className="mt-2 inline-block rounded-full bg-black/5 px-2.5 py-0.5 text-[11px] font-bold text-ink/60">
                            Hidden by a moderator
                        </span>
                    )}
                </div>
            ),
        },
        { key: 'rating', label: 'Rating', render: (review) => <Stars value={review?.rating} /> },
        {
            key: 'comment',
            label: 'Comment',
            render: (review) => <p className="max-w-xs break-words text-xs leading-relaxed text-ink/70">{review?.comment}</p>,
        },
        { key: 'date', label: 'Date', render: (review) => <span className="whitespace-nowrap text-ink/70">{review?.date}</span> },
        {
            key: 'actions',
            label: 'Actions',
            actions: true,
            render: (review) => (
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => openEdit(review)} className={`${pillClass} border border-black/10 bg-white text-ink hover:bg-black/5`}>
                        Edit
                    </button>
                    <button onClick={() => handleDelete(review?._id)} className={`${pillClass} bg-coral-50 text-coral-700 hover:bg-coral hover:text-white`}>
                        Delete
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-8">
            <Helmet>
                <title>My Reviews | Dream Scholar Hub</title>
            </Helmet>

            <DashboardHeader tag="Your voice" title="My Reviews" subtitle="Reviews you left help other students choose the right scholarship.">
                {myReviews.length > 0 && (
                    <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-ink shadow-[0_4px_20px_-10px_rgba(20,20,31,0.3)]">
                        {myReviews.length} total
                    </span>
                )}
            </DashboardHeader>

            {isLoading ? (
                <Loading label="Loading your reviews..." />
            ) : isError ? (
                <p className="text-sm font-semibold text-coral">We could not load your reviews. Please refresh the page.</p>
            ) : myReviews.length === 0 ? (
                <EmptyState icon={FaStar} title="No reviews yet" text="After you apply, you can review the scholarship from My Applications.">
                    <Link to="/userDashboard/myApplication" className="inline-block rounded-full bg-violet px-6 py-3.5 text-sm font-bold text-white hover:bg-violet-600">
                        Go to My Applications
                    </Link>
                </EmptyState>
            ) : (
                <DataTable columns={columns} rows={myReviews} />
            )}

            {editingReview && (
                <Modal title="Edit review" subtitle={editingReview?.scholarshipName} onClose={closeEdit}>
                    <form onSubmit={handleSubmit(onSaveEdit)} className="space-y-5" noValidate>
                        <fieldset>
                            <legend className="mb-2 text-sm font-bold text-ink">Your rating</legend>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((value) => (
                                    <label key={value} className="cursor-pointer rounded-full p-1.5 focus-within:ring-2 focus-within:ring-violet">
                                        <input type="radio" value={value} className="sr-only" {...register('rating', { required: 'Please pick a rating' })} />
                                        <FaStar className={`text-2xl transition-colors ${rating >= value ? 'text-sun' : 'text-black/10 hover:text-sun/60'}`} />
                                        <span className="sr-only">{value} star{value > 1 ? 's' : ''}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.rating && <span className="mt-1 block text-xs font-semibold text-coral">{errors.rating.message}</span>}
                        </fieldset>

                        <div>
                            <label htmlFor="edit-review-comment" className="mb-1.5 block text-sm font-bold text-ink">Your review</label>
                            <textarea
                                id="edit-review-comment"
                                rows="4"
                                className={fieldClass}
                                {...register('comment', { validate: (value) => value?.trim().length >= 5 || 'Write at least 5 characters' })}
                            ></textarea>
                            {errors.comment && <span className="mt-1 block text-xs font-semibold text-coral">{errors.comment.message}</span>}
                        </div>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button type="button" onClick={closeEdit} className="rounded-full border border-black/10 bg-white px-6 py-3.5 text-sm font-bold text-ink hover:bg-black/5">
                                Cancel
                            </button>
                            <button type="submit" disabled={isSubmitting} className="rounded-full bg-violet px-6 py-3.5 text-sm font-bold text-white hover:bg-violet-600 disabled:opacity-60">
                                {isSubmitting ? 'Saving...' : 'Save changes'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default MyReviews;
