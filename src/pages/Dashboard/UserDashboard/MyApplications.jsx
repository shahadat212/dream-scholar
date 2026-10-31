import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import useToast from "../../hooks/useToast";
import { useForm } from "react-hook-form";
import { FaFileAlt, FaStar } from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import Loading from "../../../components/Loading";
import DashboardHeader from "../../../components/DashboardHeader";
import DataTable from "../../../components/DataTable";
import EmptyState from "../../../components/EmptyState";
import StatusBadge from "../../../components/StatusBadge";
import Modal from "../../../components/Modal";
import Spinner from "../../../components/Spinner";
import StatusTimeline from "../../../components/StatusTimeline";

const fieldClass = "w-full rounded-2xl border border-black/10 bg-cream px-4 py-3 text-ink placeholder:text-ink/30 focus:border-violet focus:outline-none";
const pillClass = "inline-flex items-center justify-center rounded-full px-3.5 py-2 text-xs font-bold transition-colors";

const statusNote = {
    pending: "Waiting for document verification.",
    processing: "Under review by the admissions committee.",
    completed: "Congratulations! You have been selected.",
};

const MyApplications = () => {
    const toast = useToast();
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [selectedApp, setSelectedApp] = useState(null);
    const [trackingApp, setTrackingApp] = useState(null);
    const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm();
    const rating = Number(watch("rating") || 0);

    const { data: myApplications = [], isLoading, isError } = useQuery({
        queryKey: ['applications', user?.email],
        enabled: !!user?.email,
        queryFn: async () => {
            const res = await axiosSecure.get(`/applications/email/${user.email}`);
            return res.data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => axiosSecure.delete(`/applications/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications', user?.email] }),
    });

    const reviewMutation = useMutation({
        mutationFn: (review) => axiosSecure.post('/reviews', review),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews', 'mine', user?.email] });
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
            queryClient.invalidateQueries({ queryKey: ['scholarships'] });
            queryClient.invalidateQueries({ queryKey: ['topScholarships'] });
            queryClient.invalidateQueries({ queryKey: ['scholarship'] });
        },
    });

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Cancel this application?",
            text: "This removes the application. You can't undo it.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#FF6B57",
            cancelButtonColor: "#14141F",
            confirmButtonText: "Yes, cancel it",
            cancelButtonText: "Keep it",
        });
        if (!result.isConfirmed) return;

        try {
            await deleteMutation.mutateAsync(id);
            toast.fire({ title: "Cancelled", text: "Your application has been removed.", icon: "success" });
        } catch {
            toast.fire({ title: "Could not cancel", text: "Please try again.", icon: "error" });
        }
    };

    const openReviewModal = (app) => {
        reset({ rating: "", comment: "" });
        setSelectedApp(app);
    };

    const closeReviewModal = () => setSelectedApp(null);

    const onSubmitReview = async (data) => {
        try {
            await reviewMutation.mutateAsync({
                rating: Number(data?.rating),
                comment: data?.comment?.trim(),
                scholarshipName: selectedApp?.scholarshipName,
                universityName: selectedApp?.university,
                universityId: selectedApp?.scholarShipId,
                userName: user?.displayName,
                userImage: user?.photoURL,
                userEmail: user?.email,
            });
            closeReviewModal();
            toast.fire({ title: "Thank you!", text: "Your review has been submitted.", icon: "success" });
        } catch {
            toast.fire({ title: "Could not submit review", text: "Please try again.", icon: "error" });
        }
    };

    const columns = [
        {
            key: 'scholarship',
            label: 'Scholarship',
            primary: true,
            render: (app) => (
                <div className="min-w-0">
                    <p className="font-bold text-ink">{app?.scholarshipName}</p>
                    <p className="mt-0.5 text-xs text-ink/60">{app?.university}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {app?.subject && <span className="rounded-full bg-violet/10 px-2.5 py-0.5 text-[11px] font-bold text-violet">{app?.subject}</span>}
                        {app?.degree && <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-[11px] font-bold text-ink/60">{app?.degree}</span>}
                    </div>
                </div>
            ),
        },
        {
            key: 'fees',
            label: 'Paid',
            render: (app) => (
                <div>
                    <p className="font-display font-bold text-ink">${(app?.applicationFees || 0) + (app?.serviceCharge || 0)}</p>
                    <p className="text-[11px] text-ink/40">incl. ${app?.serviceCharge || 0} service fee</p>
                </div>
            ),
        },
        { key: 'currentDate', label: 'Applied', render: (app) => <span className="whitespace-nowrap text-ink/70">{app?.currentDate}</span> },
        { key: 'status', label: 'Status', render: (app) => <StatusBadge status={app?.applicationStatus} /> },
        {
            key: 'feedback',
            label: 'Feedback',
            render: (app) => (
                <p className={`max-w-[16rem] text-xs leading-relaxed ${app?.feedback ? 'font-semibold text-coral-700' : 'text-ink/50'}`}>
                    {app?.feedback || statusNote[app?.applicationStatus] || 'No feedback yet.'}
                </p>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            actions: true,
            render: (app) => (
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setTrackingApp(app)} className={`${pillClass} bg-ink text-white hover:bg-black`}>
                        Track
                    </button>
                    <Link to={`/scholarships/details/${app?.scholarShipId}`} className={`${pillClass} border border-black/10 bg-white text-ink hover:bg-black/5`}>
                        Details
                    </Link>
                    {app?.applicationStatus === "pending" && (
                        <Link to={`/userDashboard/editApplication/${app?._id}`} className={`${pillClass} border border-black/10 bg-white text-ink hover:bg-black/5`}>
                            Edit
                        </Link>
                    )}
                    {app?.applicationStatus === "rejected" && (
                        <Link to={`/userDashboard/editApplication/${app?._id}`} className={`${pillClass} bg-coral text-white hover:bg-coral-600`}>
                            Fix & resubmit
                        </Link>
                    )}
                    <button onClick={() => openReviewModal(app)} className={`${pillClass} bg-violet text-white hover:bg-violet-600`}>
                        Review
                    </button>
                    <button
                        onClick={() => handleDelete(app?._id)}
                        disabled={deleteMutation.isPending && deleteMutation.variables === app?._id}
                        className={`${pillClass} gap-1.5 bg-coral-50 text-coral-700 hover:bg-coral hover:text-white disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                        {deleteMutation.isPending && deleteMutation.variables === app?._id ? <><Spinner className="h-3 w-3" /> Cancelling…</> : 'Cancel'}
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-8">
            <Helmet>
                <title>My Applications | Dream Scholar Hub</title>
            </Helmet>

            <DashboardHeader
                tag="Your applications"
                title="My Applications"
                subtitle="Track every scholarship you applied for, edit pending ones, and leave a review."
            >
                {myApplications.length > 0 && (
                    <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-ink shadow-[0_4px_20px_-10px_rgba(20,20,31,0.3)]">
                        {myApplications.length} total
                    </span>
                )}
            </DashboardHeader>

            {isLoading ? (
                <Loading label="Loading your applications..." />
            ) : isError ? (
                <p className="text-sm font-semibold text-coral">We could not load your applications. Please refresh the page.</p>
            ) : myApplications.length === 0 ? (
                <EmptyState icon={FaFileAlt} title="No applications yet" text="Find a scholarship that fits you and apply in a few minutes.">
                    <Link to="/scholarships" className="inline-block rounded-full bg-violet px-6 py-3.5 text-sm font-bold text-white hover:bg-violet-600">
                        Browse scholarships
                    </Link>
                </EmptyState>
            ) : (
                <DataTable columns={columns} rows={myApplications} />
            )}

            {trackingApp && (
                <Modal title="Application progress" subtitle={`${trackingApp?.scholarshipName} · ${trackingApp?.university}`} onClose={() => setTrackingApp(null)}>
                    <StatusTimeline application={trackingApp} />
                    {trackingApp?.feedback && (
                        <div className="mt-6 rounded-2xl bg-coral-50 p-4">
                            <p className="text-[11px] font-bold uppercase tracking-wide text-coral-700">Feedback from the committee</p>
                            <p className="mt-1 text-sm text-coral-700">{trackingApp.feedback}</p>
                        </div>
                    )}
                </Modal>
            )}

            {selectedApp && (
                <Modal title="Write a review" subtitle={`${selectedApp?.scholarshipName} · ${selectedApp?.university}`} onClose={closeReviewModal}>
                    <form onSubmit={handleSubmit(onSubmitReview)} className="space-y-5" noValidate>
                        <fieldset>
                            <legend className="mb-2 text-sm font-bold text-ink">Your rating</legend>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((value) => (
                                    <label key={value} className="cursor-pointer rounded-full p-1.5 focus-within:ring-2 focus-within:ring-violet">
                                        <input
                                            type="radio"
                                            value={value}
                                            className="sr-only"
                                            {...register("rating", { required: "Please pick a rating" })}
                                        />
                                        <FaStar className={`text-2xl transition-colors ${rating >= value ? 'text-sun' : 'text-black/10 hover:text-sun/60'}`} />
                                        <span className="sr-only">{value} star{value > 1 ? 's' : ''}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.rating && <span className="mt-1 block text-xs font-semibold text-coral">{errors.rating.message}</span>}
                        </fieldset>

                        <div>
                            <label htmlFor="review-comment" className="mb-1.5 block text-sm font-bold text-ink">Your review</label>
                            <textarea
                                id="review-comment"
                                rows="4"
                                placeholder="What was the application experience like?"
                                className={fieldClass}
                                {...register("comment", {
                                    validate: (value) => value?.trim().length >= 5 || "Write at least 5 characters",
                                })}
                            ></textarea>
                            {errors.comment && <span className="mt-1 block text-xs font-semibold text-coral">{errors.comment.message}</span>}
                        </div>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button type="button" onClick={closeReviewModal} className="rounded-full border border-black/10 bg-white px-6 py-3.5 text-sm font-bold text-ink hover:bg-black/5">
                                Cancel
                            </button>
                            <button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2 rounded-full bg-violet px-6 py-3.5 text-sm font-bold text-white hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60">
                                {isSubmitting && <Spinner />}
                                {isSubmitting ? "Submitting…" : "Submit review"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default MyApplications;
