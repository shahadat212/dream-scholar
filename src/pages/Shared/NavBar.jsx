import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut, FiGrid } from 'react-icons/fi';
import Swal from 'sweetalert2';
import useAuth from '../hooks/useAuth';
import NotificationBell from '../../components/NotificationBell';

const NavBar = () => {
    const { user, logOut, loading } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isProfileOpen) return;
        const handleClick = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileOpen(false);
        };
        const handleKey = (e) => {
            if (e.key === 'Escape') setIsProfileOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        window.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            window.removeEventListener('keydown', handleKey);
        };
    }, [isProfileOpen]);

    const handleLogOut = async () => {
        setIsProfileOpen(false);
        setIsMenuOpen(false);
        try {
            await logOut();
            navigate('/');
        } catch {
            Swal.fire({ icon: 'error', title: 'Could not log out', text: 'Please try again.', confirmButtonColor: '#5B4CFB' });
        }
    };

    const avatar = user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email || 'User')}`;

    const linkClass = ({ isActive }) =>
        `px-4 py-2 rounded-full text-sm font-semibold transition ${
            isActive ? 'bg-violet/10 text-violet' : 'text-ink/60 hover:bg-black/5'
        }`;

    return (
        <div className="sticky top-0 z-50 px-4 pt-5">
            <header className="mx-auto max-w-screen-xl rounded-full bg-white shadow-[0_8px_30px_-12px_rgba(20,20,31,0.15)]">
                <div className="flex items-center justify-between px-4 py-3 md:px-6">
                    <div className="flex items-center gap-3">
                        <button className="text-2xl text-ink lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu" aria-expanded={isMenuOpen}>
                            {isMenuOpen ? <FiX /> : <FiMenu />}
                        </button>
                        <NavLink to="/" className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet text-sm text-white">✦</span>
                            <span className="font-display text-lg font-bold text-ink">Dream Scholar</span>
                        </NavLink>
                    </div>

                    <nav className="hidden items-center gap-1 lg:flex">
                        <NavLink to="/" className={linkClass} end>Home</NavLink>
                        <NavLink to="/scholarships" className={linkClass}>All Scholarships</NavLink>
                    </nav>

                    <div className="flex items-center gap-3">
                        {loading ? (
                            <span className="h-9 w-9 rounded-full bg-black/5" aria-hidden="true"></span>
                        ) : user?.email ? (
                            <div className="flex items-center gap-2">
                                <NotificationBell />
                                <div className="relative" ref={profileRef}>
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center rounded-full ring-2 ring-transparent transition hover:ring-violet/20"
                                        aria-label="Open profile menu"
                                        aria-haspopup="menu"
                                        aria-expanded={isProfileOpen}
                                    >
                                        <img className="h-9 w-9 rounded-full border border-black/5 object-cover" src={avatar} alt="User avatar" />
                                    </button>

                                    {isProfileOpen && (
                                        <div role="menu" className="absolute right-0 top-full mt-3 w-64 rounded-3xl bg-white p-2 shadow-[0_20px_60px_-20px_rgba(20,20,31,0.35)]">
                                            <div className="flex items-center gap-3 px-3 py-3">
                                                <img className="h-10 w-10 shrink-0 rounded-full border border-black/5 object-cover" src={avatar} alt="" />
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-bold text-ink">{user?.displayName || 'Your account'}</p>
                                                    <p className="truncate text-xs text-ink/50">{user?.email}</p>
                                                </div>
                                            </div>
                                            <div className="my-1 h-px bg-black/5"></div>
                                            <NavLink
                                                to="/dashboard"
                                                role="menuitem"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-semibold text-ink/70 transition hover:bg-black/5 hover:text-ink"
                                            >
                                                <FiGrid className="text-base" /> Dashboard
                                            </NavLink>
                                            <button
                                                role="menuitem"
                                                onClick={handleLogOut}
                                                className="flex w-full items-center gap-3 rounded-full px-3 py-2.5 text-left text-sm font-semibold text-coral transition hover:bg-coral-50"
                                            >
                                                <FiLogOut className="text-base" /> Log Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="hidden items-center gap-3 lg:flex">
                                <NavLink to="/login" className="px-4 py-2 text-sm font-semibold text-ink/70 hover:text-ink">
                                    Login
                                </NavLink>
                                <NavLink to="/register" className="rounded-full bg-coral px-5 py-2.5 text-sm font-bold text-white transition hover:bg-coral-600">
                                    Get Started
                                </NavLink>
                            </div>
                        )}
                    </div>
                </div>

                {isMenuOpen && (
                    <div className="border-t border-black/5 px-4 py-4 lg:hidden">
                        <div className="flex flex-col gap-1">
                            <NavLink onClick={() => setIsMenuOpen(false)} to="/" className={linkClass} end>Home</NavLink>
                            <NavLink onClick={() => setIsMenuOpen(false)} to="/scholarships" className={linkClass}>All Scholarships</NavLink>
                        </div>
                        {!loading && !user?.email && (
                            <div className="mt-3 flex flex-col gap-2 border-t border-black/5 pt-3">
                                <NavLink to="/login" onClick={() => setIsMenuOpen(false)} className="rounded-full border border-black/10 px-5 py-2.5 text-center text-sm font-semibold text-ink">
                                    Login
                                </NavLink>
                                <NavLink to="/register" onClick={() => setIsMenuOpen(false)} className="rounded-full bg-coral px-5 py-2.5 text-center text-sm font-bold text-white">
                                    Get Started
                                </NavLink>
                            </div>
                        )}
                    </div>
                )}
            </header>
        </div>
    );
};

export default NavBar;
