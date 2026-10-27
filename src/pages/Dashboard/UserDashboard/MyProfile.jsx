import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { FaFileAlt, FaCheckCircle, FaClock, FaStar, FaGraduationCap, FaUsers, FaArrowRight, FaCalendarAlt } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import useAdmin from '../../hooks/useAdmin';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import Loading from '../../../components/Loading';
import StatusBadge from '../../../components/StatusBadge';

const cardClass = "rounded-3xl bg-white p-6 shadow-[0_8px_30px_-15px_rgba(20,20,31,0.2)]";
const fieldClass = "w-full rounded-2xl border border-black/10 bg-cream px-4 py-3 text-ink placeholder:text-ink/30 focus:border-violet focus:outline-none";

const avatarFor = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}`;

const formatDate = (value, options) => {
    if (!value) return '';
    const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value);
    return isNaN(date) ? '' : date.toLocaleDateString('en-US', options);
};

const MyProfile = () => {
    const { user, setUser, updateUserProfile } = useAuth();
    const { isAdmin, isModerator, isAdminLoading } = useAdmin();
    const axiosPublic = useAxiosPublic();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    const isStaff = isAdmin || isModerator;
    const canLoad = !isAdminLoading && !!user?.email;

    const applicationsQuery = useQuery({
        queryKey: ['applications', user?.email],
        enabled: canLoad && !isStaff,
        queryFn: async () => (await axiosSecure.get(`/applications/email/${user.email}`)).data,
    });

    const myReviewsQuery = useQuery({
        queryKey: ['reviews', 'mine', user?.email],
        enabled: canLoad && !isStaff,
        queryFn: async () => (await axiosSecure.get(`/reviews/email/${user.email}`)).data,
    });

    const scholarshipsQuery = useQuery({
        queryKey: ['scholarships'],
        enabled: canLoad && isStaff,
        queryFn: async () => (await axiosPublic.get('/scholarships')).data,
    });

    const reviewsQuery = useQuery({
        queryKey: ['reviews'],
        enabled: canLoad && isStaff,
        queryFn: async () => (await axiosPublic.get('/reviews')).data,
    });

    const allApplicationsQuery = useQuery({
        queryKey: ['applications'],
        enabled: canLoad && isStaff,
        queryFn: async () => (await axiosSecure.get('/applications')).data,
    });

    const usersQuery = useQuery({
        queryKey: ['users'],
        enabled: canLoad && isAdmin,
        queryFn: async () => (await axiosSecure.get('/users')).data,
    });

    const profileMutation = useMutation({
        mutationFn: (updates) => axiosSecure.patch(`/users/profile/${user.email}`, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    const { register, handleSubmit, reset, formState: { errors, isDirty, isSubmitting } } = useForm({
        defaultValues: { name: user?.displayName || '', photoURL: user?.photoURL || '' },
    });

    useEffect(() => {
        reset({ name: user?.displayName || '', photoURL: user?.photoURL || '' });
    }, [user?.displayName, user?.photoURL, reset]);

    if (isAdminLoading) {
        return <Loading label="Loading your profile..." />;
    }

    const myApplications = applicationsQuery.data || [];
    const myReviews = myReviewsQuery.data || [];

    const statQueries = isStaff
        ? [scholarshipsQuery, reviewsQuery, allApplicationsQuery, ...(isAdmin ? [usersQuery] : [])]
        : [applicationsQuery, myReviewsQuery];
    const statsLoading = statQueries.some((q) => q.isLoading);
    const statsError = statQueries.some((q) => q.isError);

    const stats = isStaff
        ? [
            { label: 'Scholarships', value: scholarshipsQuery.data?.length || 0, icon: FaGraduationCap, tone: 'bg-violet/10 text-violet' },
            { label: 'Reviews', value: reviewsQuery.data?.length || 0, icon: FaStar, tone: 'bg-sun-50 text-sun-700' },
            { label: 'Applications', value: allApplicationsQuery.data?.length || 0, icon: FaFileAlt, tone: 'bg-coral-50 text-coral-700' },
            ...(isAdmin
                ? [{ label: 'Applicants', value: (usersQuery.data || []).filter((u) => u?.role === 'user').length, icon: FaUsers, tone: 'bg-mint-50 text-mint-700' }]
                : []),
        ]
        : [
            { label: 'Applications', value: myApplications.length, icon: FaFileAlt, tone: 'bg-violet/10 text-violet' },
            { label: 'Completed', value: myApplications.filter((app) => app?.applicationStatus === 'completed').length, icon: FaCheckCircle, tone: 'bg-mint-50 text-mint-700' },
            { label: 'Processing', value: myApplications.filter((app) => app?.applicationStatus === 'processing').length, icon: FaClock, tone: 'bg-coral-50 text-coral-700' },
            { label: 'Reviews', value: myReviews.length, icon: FaStar, tone: 'bg-sun-50 text-sun-700' },
        ];

    const recentApplications = myApplications.slice(0, 3);
    const roleLabel = isAdmin ? 'Admin' : isModerator ? 'Moderator' : 'Student';
    const roleClass = isAdmin ? 'bg-violet/10 text-violet' : isModerator ? 'bg-sun-50 text-sun-700' : 'bg-mint-50 text-mint-700';
    const memberSince = formatDate(user?.metadata?.creationTime, { month: 'long', year: 'numeric' });
    const avatar = user?.photoURL || avatarFor(user?.displayName || user?.email);

    const onSubmit = async ({ name, photoURL }) => {
        const displayName = name.trim();
        const photo = photoURL.trim() || avatarFor(displayName);

        try {
            await updateUserProfile({ displayName, photoURL: photo });
            setUser(Object.assign(Object.create(Object.getPrototypeOf(user)), user, { displayName, photoURL: photo }));
        } catch {
            Swal.fire({ title: 'Update failed', text: 'We could not update your profile. Please try again.', icon: 'error', confirmButtonColor: '#5B4CFB' });
            return;
        }

        try {
            await profileMutation.mutateAsync({ name: displayName, photoURL: photo });
            Swal.fire({ title: 'Profile updated', text: 'Your name and photo are saved.', icon: 'success', confirmButtonColor: '#5B4CFB' });
        } catch (error) {
            Swal.fire({
                title: 'Partly saved',
                text: error?.response?.data?.message || 'Your login profile changed, but we could not sync it to your account record.',
                icon: 'warning',
                confirmButtonColor: '#5B4CFB',
            });
        }
    };

    return (
        <div className="space-y-8">
            <Helmet>
                <title>My Profile | Dream Scholar Hub</title>
            </Helmet>

            <section className={`${cardClass} relative overflow-hidden`}>
                <div className="blob-1 pointer-events-none absolute -right-16 -top-20 h-56 w-56 bg-violet/10" aria-hidden="true"></div>
                <div className="blob-2 pointer-events-none absolute -bottom-24 right-24 h-40 w-40 bg-sun/20" aria-hidden="true"></div>

                <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:text-left">
                    <img
                        src={avatar}
                        onError={(e) => { e.currentTarget.src = avatarFor(user?.displayName || user?.email); }}
                        alt="Profile"
                        className="h-24 w-24 shrink-0 rounded-full border-4 border-cream object-cover md:h-28 md:w-28"
                    />
                    <div className="min-w-0">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${roleClass}`}>{roleLabel}</span>
                        <h1 className="mt-2 break-words font-display text-2xl font-extrabold text-ink md:text-3xl">
                            {user?.displayName || 'Add your name below'}
                        </h1>
                        <p className="mt-1 break-all text-sm text-ink/60">{user?.email}</p>
                        {memberSince && (
                            <p className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-ink/40">
                                <FaCalendarAlt /> Member since {memberSince}
                            </p>
                        )}
                    </div>
                </div>
            </section>

            <section>
                <h2 className="font-display text-xl font-bold text-ink">Your activity</h2>
                {statsLoading ? (
                    <Loading label="Loading your activity..." />
                ) : statsError ? (
                    <p className="mt-4 text-sm font-semibold text-coral">We could not load your activity. Please refresh the page.</p>
                ) : (
                    <div className={`mt-4 grid grid-cols-2 gap-4 ${stats.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
                        {stats.map((stat) => (
                            <div key={stat.label} className={`${cardClass} flex flex-col gap-4 sm:flex-row sm:items-center`}>
                                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg ${stat.tone}`}>
                                    <stat.icon />
                                </span>
                                <div>
                                    <p className="font-display text-2xl font-bold text-ink md:text-3xl">{stat.value}</p>
                                    <p className="text-xs font-semibold text-ink/60">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <div className={`grid gap-8 ${isStaff ? '' : 'lg:grid-cols-2'}`}>
                {!isStaff && (
                    <section className={cardClass}>
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="font-display text-xl font-bold text-ink">Recent applications</h2>
                            {recentApplications.length > 0 && (
                                <Link to="/userDashboard/myApplication" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-violet hover:text-violet-700">
                                    View all <FaArrowRight className="text-xs" />
                                </Link>
                            )}
                        </div>

                        {applicationsQuery.isLoading ? (
                            <Loading label="Loading applications..." />
                        ) : applicationsQuery.isError ? (
                            <p className="mt-4 text-sm font-semibold text-coral">We could not load your applications.</p>
                        ) : recentApplications.length === 0 ? (
                            <div className="mt-6 rounded-2xl bg-cream px-6 py-10 text-center">
                                <p className="font-display text-lg font-bold text-ink">No applications yet</p>
                                <p className="mt-1 text-sm text-ink/60">Find a scholarship that fits you and apply in a few minutes.</p>
                                <Link to="/scholarships" className="mt-5 inline-block rounded-full bg-violet px-6 py-3.5 text-sm font-bold text-white hover:bg-violet-600">
                                    Browse scholarships
                                </Link>
                            </div>
                        ) : (
                            <ul className="mt-4 divide-y divide-black/5">
                                {recentApplications.map((app) => (
                                    <li key={app?._id}>
                                        <Link to="/userDashboard/myApplication" className="-mx-3 flex items-center justify-between gap-4 rounded-2xl px-3 py-4 transition-colors hover:bg-black/[0.03]">
                                            <div className="min-w-0">
                                                <p className="truncate font-bold text-ink">{app?.scholarshipName}</p>
                                                <p className="truncate text-sm text-ink/60">{app?.university}</p>
                                                <p className="mt-1 text-xs text-ink/40">{formatDate(app?.currentDate, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                            <StatusBadge status={app?.applicationStatus} />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                )}

                <section className={`${cardClass} ${isStaff ? 'lg:max-w-2xl' : ''}`}>
                    <h2 className="font-display text-xl font-bold text-ink">Edit profile</h2>
                    <p className="mt-1 text-sm text-ink/60">This is how you appear across Dream Scholar Hub.</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
                        <div>
                            <label htmlFor="profile-name" className="mb-1.5 block text-sm font-bold text-ink">Name</label>
                            <input
                                id="profile-name"
                                type="text"
                                autoComplete="name"
                                className={fieldClass}
                                {...register('name', {
                                    validate: (value) => {
                                        const trimmed = value.trim();
                                        if (!trimmed) return 'Name is required';
                                        if (trimmed.length < 2) return 'Name must be at least 2 characters';
                                        if (trimmed.length > 60) return 'Name must be 60 characters or fewer';
                                        return true;
                                    },
                                })}
                            />
                            {errors.name && <span className="mt-1 block text-xs font-semibold text-coral">{errors.name.message}</span>}
                        </div>

                        <div>
                            <label htmlFor="profile-photo" className="mb-1.5 block text-sm font-bold text-ink">Photo URL</label>
                            <input
                                id="profile-photo"
                                type="url"
                                placeholder="https://..."
                                className={fieldClass}
                                {...register('photoURL', {
                                    validate: (value) => !value.trim() || /^https?:\/\/\S+$/i.test(value.trim()) || 'Enter a valid link starting with http:// or https://',
                                })}
                            />
                            {errors.photoURL
                                ? <span className="mt-1 block text-xs font-semibold text-coral">{errors.photoURL.message}</span>
                                : <span className="mt-1 block text-xs text-ink/40">Leave empty to use your initials.</span>}
                        </div>

                        <button
                            type="submit"
                            disabled={!isDirty || isSubmitting}
                            className="w-full rounded-full bg-violet px-8 py-3.5 text-sm font-bold text-white transition-colors hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                        >
                            {isSubmitting ? 'Saving...' : 'Save changes'}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default MyProfile;
