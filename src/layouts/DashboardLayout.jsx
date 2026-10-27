import React, { Suspense, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut, FiChevronRight, FiArrowUpRight } from 'react-icons/fi';
import { FaUser, FaFileAlt, FaStar, FaGraduationCap, FaPlusCircle, FaReceipt, FaUsers, FaHome, FaHeart, FaChartBar, FaHistory } from 'react-icons/fa';
import useToast from '../pages/hooks/useToast';
import { motion } from 'framer-motion';
import useAuth from '../pages/hooks/useAuth';
import useAdmin from '../pages/hooks/useAdmin';
import Loading from '../components/Loading';
import NotificationBell from '../components/NotificationBell';
import Spinner from '../components/Spinner';

const DashboardLayout = () => {
    const toast = useToast();
    const { user, logOut } = useAuth();
    const { isAdmin, isModerator, isAdminLoading } = useAdmin();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        if (!isDrawerOpen) return;
        const handleKey = (e) => {
            if (e.key === 'Escape') setIsDrawerOpen(false);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isDrawerOpen]);

    if (isAdminLoading) {
        return <Loading label="Loading your dashboard..."></Loading>;
    }

    const isStaff = isAdmin || isModerator;
    const roleLabel = isAdmin ? 'Admin' : isModerator ? 'Moderator' : 'Student';
    const avatar = user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email || 'User')}`;

    const navGroups = isStaff
        ? [
            {
                label: 'Overview',
                links: [
                    { to: '/adminDashboard/myProfile', label: 'My Profile', icon: FaUser },
                    { to: '/adminDashboard/analytics', label: 'Analytics', icon: FaChartBar },
                ],
            },
            {
                label: 'Scholarships',
                links: [
                    { to: '/adminDashboard/manageScholarships', label: 'Manage Scholarships', icon: FaGraduationCap },
                    { to: '/adminDashboard/addScholarships', label: 'Add Scholarship', icon: FaPlusCircle },
                ],
            },
            {
                label: 'Students',
                links: [
                    { to: '/adminDashboard/manageApplications', label: 'All Applications', icon: FaFileAlt },
                    { to: '/adminDashboard/manageReviews', label: 'All Reviews', icon: FaStar },
                ],
            },
            { label: 'Finance', links: [{ to: '/adminDashboard/history', label: 'Payment History', icon: FaReceipt }] },
            ...(isAdmin
                ? [{
                    label: 'Admin',
                    links: [
                        { to: '/adminDashboard/users', label: 'Manage Users', icon: FaUsers },
                        { to: '/adminDashboard/activity', label: 'Activity Log', icon: FaHistory },
                    ],
                }]
                : []),
        ]
        : [
            { label: 'Overview', links: [{ to: '/userDashboard/myProfile', label: 'My Profile', icon: FaUser }] },
            {
                label: 'My activity',
                links: [
                    { to: '/userDashboard/myApplication', label: 'My Applications', icon: FaFileAlt },
                    { to: '/userDashboard/myReviews', label: 'My Reviews', icon: FaStar },
                    { to: '/userDashboard/wishlist', label: 'My Wishlist', icon: FaHeart },
                ],
            },
        ];

    const currentLabel = pathname.includes('/editApplication/')
        ? 'Edit Application'
        : navGroups.flatMap((group) => group.links).find((link) => pathname.startsWith(link.to))?.label || 'Overview';

    const linkClass = ({ isActive }) =>
        `group flex items-center gap-3 rounded-full py-2 pl-2 pr-4 text-sm transition-colors ${
            isActive ? 'bg-violet/10 font-bold text-violet' : 'font-semibold text-ink/60 hover:bg-black/5 hover:text-ink'
        }`;

    const iconClass = (isActive) =>
        `flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] transition-colors ${
            isActive ? 'bg-violet text-white' : 'bg-black/[0.04] text-ink/50 group-hover:text-ink'
        }`;

    const closeDrawer = () => setIsDrawerOpen(false);


    const handleLogOut = async () => {
        setIsLoggingOut(true);
        try {
            await logOut();
            navigate('/');
        } catch {
            toast.fire({
                icon: 'error',
                title: 'Could not log out',
                text: 'Please try again.',
            });
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <div className="min-h-screen bg-cream font-body text-ink lg:flex">
            <Helmet>
                <title>Dashboard | Dream Scholar Hub</title>
            </Helmet>

            {isDrawerOpen && (
                <div onClick={closeDrawer} className="fixed inset-0 z-40 bg-ink/40 lg:hidden" aria-hidden="true"></div>
            )}

            <aside
                id="dashboard-sidebar"
                className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-white shadow-[8px_0_40px_-24px_rgba(20,20,31,0.25)] transition-[transform,visibility] duration-300 ease-out lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:visible ${
                    isDrawerOpen ? 'visible translate-x-0' : 'invisible -translate-x-full'
                }`}
            >
                <div className="flex items-center justify-between px-6 pb-2 pt-6">
                    <Link to="/" onClick={closeDrawer} className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet text-sm text-white">✦</span>
                        <span className="font-display text-lg font-bold text-ink">Dream Scholar</span>
                    </Link>
                    <button
                        onClick={closeDrawer}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-ink/60 hover:bg-black/5 lg:hidden"
                        aria-label="Close menu"
                    >
                        <FiX />
                    </button>
                </div>

                <nav className="mt-4 flex-1 space-y-6 overflow-y-auto px-4 pb-4" aria-label="Dashboard">
                    {navGroups.map((group) => (
                        <div key={group.label}>
                            <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-ink/40">{group.label}</p>
                            <ul className="flex flex-col gap-1">
                                {group.links.map((link) => (
                                    <li key={link.to}>
                                        <NavLink to={link.to} onClick={closeDrawer} className={linkClass}>
                                            {({ isActive }) => (
                                                <>
                                                    <span className={iconClass(isActive)}><link.icon /></span>
                                                    {link.label}
                                                </>
                                            )}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>

                <div className="space-y-3 border-t border-black/5 p-4">
                    <NavLink to="/" end onClick={closeDrawer} className={linkClass}>
                        {({ isActive }) => (
                            <>
                                <span className={iconClass(isActive)}><FaHome /></span>
                                Back to Home
                            </>
                        )}
                    </NavLink>

                    <div className="flex items-center gap-3 rounded-full bg-cream py-2 pl-2 pr-2">
                        <img className="h-10 w-10 shrink-0 rounded-full border border-black/5 object-cover" src={avatar} alt="User avatar" />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-ink">{user?.displayName || user?.email}</p>
                            <p className="truncate text-[11px] font-semibold text-ink/50">{roleLabel}</p>
                        </div>
                        <button
                            onClick={handleLogOut}
                            disabled={isLoggingOut}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base text-coral transition-colors hover:bg-coral-50 disabled:cursor-wait"
                            aria-label={isLoggingOut ? 'Logging out' : 'Log out'}
                            title="Log out"
                        >
                            {isLoggingOut ? <Spinner className="h-4 w-4" /> : <FiLogOut />}
                        </button>
                    </div>
                </div>
            </aside>

            <div className="min-w-0 flex-1">
                <header className="sticky top-0 z-30 border-b border-black/5 bg-cream/90 backdrop-blur">
                    <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-4 px-4 py-3 md:px-8 lg:px-10">
                        <div className="flex min-w-0 items-center gap-3">
                            <button
                                onClick={() => setIsDrawerOpen(true)}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-xl text-ink shadow-[0_4px_20px_-10px_rgba(20,20,31,0.3)] lg:hidden"
                                aria-label="Open menu"
                                aria-expanded={isDrawerOpen}
                                aria-controls="dashboard-sidebar"
                            >
                                <FiMenu />
                            </button>
                            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
                                <span className="hidden font-semibold text-ink/40 sm:inline">Dashboard</span>
                                <FiChevronRight className="hidden shrink-0 text-ink/30 sm:inline" />
                                <span className="truncate font-bold text-ink">{currentLabel}</span>
                            </nav>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                            <Link
                                to="/scholarships"
                                className="hidden items-center gap-1.5 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-bold text-ink transition-colors hover:border-black/20 sm:inline-flex"
                            >
                                Browse scholarships <FiArrowUpRight />
                            </Link>
                            <NotificationBell />
                            <img className="h-9 w-9 rounded-full border border-black/5 object-cover" src={avatar} alt="User avatar" />
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-screen-xl px-4 py-6 md:px-8 md:py-8 lg:px-10 lg:py-10">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <Suspense fallback={<Loading label="Loading page..." />}>
                            <Outlet></Outlet>
                        </Suspense>
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
