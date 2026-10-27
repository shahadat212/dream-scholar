import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaUsers } from 'react-icons/fa';
import { FiTrash2 } from 'react-icons/fi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import useToast from '../../hooks/useToast';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import Loading from '../../../components/Loading';
import DashboardHeader from '../../../components/DashboardHeader';
import DataTable from '../../../components/DataTable';
import EmptyState from '../../../components/EmptyState';
import Spinner from '../../../components/Spinner';

const avatarFor = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}`;

const roleFilters = [
    { value: 'all', label: 'All' },
    { value: 'user', label: 'Students' },
    { value: 'moderator', label: 'Moderators' },
    { value: 'admin', label: 'Admins' },
];

const roleClass = {
    admin: 'bg-violet/10 text-violet',
    moderator: 'bg-sun-50 text-sun-700',
    user: 'bg-mint-50 text-mint-700',
};

const AllUsers = () => {
    const toast = useToast();
    const { user: currentUser } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [selectedRole, setSelectedRole] = useState('all');

    const { data: users = [], isLoading, isError } = useQuery({
        queryKey: ['users'],
        queryFn: async () => (await axiosSecure.get('/users')).data,
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => axiosSecure.delete(`/users/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    });

    const roleMutation = useMutation({
        mutationFn: ({ id, role }) => axiosSecure.patch(`/users/role/${id}`, { role }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    });

    const handleDeleteUser = async (user) => {
        const result = await Swal.fire({
            title: "Delete this user?",
            text: `${user?.name || user?.email} will be removed. You can't undo this.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#FF6B57",
            cancelButtonColor: "#14141F",
            confirmButtonText: "Yes, delete",
        });
        if (!result.isConfirmed) return;

        try {
            await deleteMutation.mutateAsync(user._id);
            toast.fire({ title: "Deleted", text: "User has been deleted.", icon: "success" });
        } catch {
            toast.fire({ title: "Could not delete", text: "Please try again.", icon: "error" });
        }
    };

    const handleRoleUpdate = async (user, newRole) => {
        try {
            await roleMutation.mutateAsync({ id: user._id, role: newRole });
            toast.fire({ title: "Role updated", text: `${user?.name || user?.email} is now ${newRole}.`, icon: "success" });
        } catch {
            toast.fire({ title: "Could not update role", text: "Please try again.", icon: "error" });
        }
    };

    const countFor = (role) => role === 'all' ? users.length : users.filter((user) => user?.role === role).length;
    const filteredUsers = selectedRole === 'all' ? users : users.filter((user) => user?.role === selectedRole);

    const columns = [
        {
            key: 'user',
            label: 'User',
            primary: true,
            render: (user) => (
                <div className="flex min-w-0 items-center gap-3">
                    <img
                        src={user?.photoURL || avatarFor(user?.name || user?.email)}
                        onError={(e) => { e.currentTarget.src = avatarFor(user?.name || user?.email); }}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-full border border-black/5 object-cover"
                    />
                    <div className="min-w-0">
                        <p className="truncate font-bold text-ink">
                            {user?.name || 'Unnamed user'}
                            {user?.email === currentUser?.email && <span className="ml-2 text-[11px] font-semibold text-ink/40">(you)</span>}
                        </p>
                        <p className="truncate text-xs text-ink/50">{user?.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'currentRole',
            label: 'Current role',
            render: (user) => (
                <span className={`rounded-full px-3 py-1 text-[11px] font-bold capitalize ${roleClass[user?.role] || 'bg-black/5 text-ink/60'}`}>
                    {user?.role === 'user' ? 'student' : user?.role}
                </span>
            ),
        },
        {
            key: 'role',
            label: 'Change role',
            render: (user) => (
                <div className="flex items-center gap-2">
                    {roleMutation.isPending && roleMutation.variables?.id === user?._id && <Spinner className="h-3.5 w-3.5 text-violet" />}
                    <select
                        value={user?.role}
                        onChange={(e) => handleRoleUpdate(user, e.target.value)}
                        disabled={user?.role === 'admin' || (roleMutation.isPending && roleMutation.variables?.id === user?._id)}
                        aria-label={`Change role for ${user?.name || user?.email}`}
                        className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-ink focus:border-violet focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="user">Student</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            actions: true,
            align: 'right',
            render: (user) => (
                <div className="flex xl:justify-end">
                    <button
                        onClick={() => handleDeleteUser(user)}
                        disabled={user?.email === currentUser?.email || (deleteMutation.isPending && deleteMutation.variables === user?._id)}
                        className="inline-flex items-center gap-2 rounded-full bg-coral-50 px-3.5 py-2 text-xs font-bold text-coral-700 transition-colors hover:bg-coral hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-coral-50 disabled:hover:text-coral-700"
                        aria-label={`Delete ${user?.name || user?.email}`}
                    >
                        {deleteMutation.isPending && deleteMutation.variables === user?._id ? <><Spinner className="h-3 w-3" /> Deleting…</> : <><FiTrash2 /> Delete</>}
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-8">
            <Helmet>
                <title>Manage Users | Dream Scholar Hub</title>
            </Helmet>

            <DashboardHeader tag="Admin only" title="Manage Users" subtitle="Promote students to moderators, or remove accounts." />

            {isLoading ? (
                <Loading label="Loading users..." />
            ) : isError ? (
                <p className="text-sm font-semibold text-coral">We could not load users. Please refresh the page.</p>
            ) : users.length === 0 ? (
                <EmptyState icon={FaUsers} title="No users yet" text="Accounts appear here when people register." />
            ) : (
                <>
                    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Filter by role">
                        {roleFilters.map((filter) => (
                            <button
                                key={filter.value}
                                role="tab"
                                aria-selected={selectedRole === filter.value}
                                onClick={() => setSelectedRole(filter.value)}
                                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                                    selectedRole === filter.value ? 'bg-ink text-white' : 'bg-white text-ink/60 shadow-[0_4px_20px_-10px_rgba(20,20,31,0.3)] hover:text-ink'
                                }`}
                            >
                                {filter.label}
                                <span className={`rounded-full px-2 py-0.5 text-[10px] ${selectedRole === filter.value ? 'bg-white/15' : 'bg-black/5'}`}>{countFor(filter.value)}</span>
                            </button>
                        ))}
                    </div>

                    {filteredUsers.length === 0 ? (
                        <EmptyState icon={FaUsers} title="Nobody here" text="No users have this role yet." />
                    ) : (
                        <DataTable columns={columns} rows={filteredUsers} />
                    )}
                </>
            )}
        </div>
    );
};

export default AllUsers;
