import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FiBell } from 'react-icons/fi';
import useAuth from '../pages/hooks/useAuth';
import useAxiosSecure from '../pages/hooks/useAxiosSecure';

const timeAgo = (value) => {
    const seconds = Math.max(Math.floor((Date.now() - new Date(value).getTime()) / 1000), 0);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const NotificationBell = ({ align = 'right' }) => {
    const { user, loading } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['notifications', user?.email],
        enabled: !loading && !!user?.email,
        refetchInterval: 60000,
        queryFn: async () => (await axiosSecure.get('/notifications')).data,
    });

    const items = data?.items || [];
    const unreadCount = data?.unreadCount || 0;

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['notifications', user?.email] });

    const readOneMutation = useMutation({
        mutationFn: (id) => axiosSecure.patch(`/notifications/${id}/read`),
        onSuccess: invalidate,
    });

    const readAllMutation = useMutation({
        mutationFn: () => axiosSecure.patch('/notifications/read-all'),
        onSuccess: invalidate,
    });

    useEffect(() => {
        if (!isOpen) return;
        const handleClick = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
        };
        const handleKey = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        window.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            window.removeEventListener('keydown', handleKey);
        };
    }, [isOpen]);

    if (!user?.email) return null;

    const openNotification = (item) => {
        setIsOpen(false);
        if (!item?.read) readOneMutation.mutate(item._id);
        if (item?.link) navigate(item.link);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg text-ink/70 transition-colors hover:bg-black/5 hover:text-ink"
                aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
                aria-haspopup="menu"
                aria-expanded={isOpen}
            >
                <FiBell />
                {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    role="menu"
                    className={`absolute top-full z-50 mt-3 w-[min(22rem,calc(100vw-2rem))] rounded-3xl bg-white p-2 shadow-[0_20px_60px_-20px_rgba(20,20,31,0.35)] ${align === 'left' ? 'left-0' : 'right-0'}`}
                >
                    <div className="flex items-center justify-between px-3 py-2">
                        <p className="font-display text-sm font-bold text-ink">Notifications</p>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => readAllMutation.mutate()}
                                disabled={readAllMutation.isPending}
                                className="text-xs font-bold text-violet hover:text-violet-700 disabled:opacity-50"
                            >
                                {readAllMutation.isPending ? 'Marking…' : 'Mark all read'}
                            </button>
                        )}
                    </div>
                    <div className="h-px bg-black/5"></div>

                    <div className="max-h-[22rem] overflow-y-auto py-1">
                        {isLoading ? (
                            <p className="px-3 py-6 text-center text-sm text-ink/50">Loading...</p>
                        ) : isError ? (
                            <p className="px-3 py-6 text-center text-sm font-semibold text-coral">Could not load notifications.</p>
                        ) : items.length === 0 ? (
                            <div className="px-3 py-8 text-center">
                                <p className="text-sm font-bold text-ink">You&apos;re all caught up</p>
                                <p className="mt-1 text-xs text-ink/50">Updates about your applications will show up here.</p>
                            </div>
                        ) : (
                            items.map((item) => (
                                <button
                                    key={item?._id}
                                    role="menuitem"
                                    onClick={() => openNotification(item)}
                                    className={`flex w-full gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-black/5 ${item?.read ? '' : 'bg-violet/5'}`}
                                >
                                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item?.read ? 'bg-transparent' : 'bg-violet'}`} aria-hidden="true"></span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-bold text-ink">{item?.title}</span>
                                        <span className="mt-0.5 block text-xs leading-relaxed text-ink/60">{item?.message}</span>
                                        <span className="mt-1 block text-[11px] font-semibold text-ink/40">{timeAgo(item?.createdAt)}</span>
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
