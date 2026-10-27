import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaPlus, FaMapMarkerAlt } from 'react-icons/fa';
import { FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import Loading from '../../../components/Loading';
import DashboardHeader from '../../../components/DashboardHeader';
import DataTable from '../../../components/DataTable';
import EmptyState from '../../../components/EmptyState';
import Modal from '../../../components/Modal';
import ScholarshipForm from '../../../components/ScholarshipForm';

const iconButtonClass = "flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-ink/70 transition-colors hover:bg-black/5 hover:text-ink";

const categoryClass = {
    'Full fund': 'bg-mint-50 text-mint-700',
    'Partial fund': 'bg-sun-50 text-sun-700',
    'Self-fund': 'bg-violet/10 text-violet',
};

const ManageScholarships = () => {
    const axiosPublic = useAxiosPublic();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [selectedScholarship, setSelectedScholarship] = useState(null);

    const { data: scholarships = [], isLoading, isError } = useQuery({
        queryKey: ['scholarships'],
        queryFn: async () => (await axiosPublic.get('/scholarships')).data,
    });

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['scholarships'] });
        queryClient.invalidateQueries({ queryKey: ['topScholarships'] });
    };

    const deleteMutation = useMutation({
        mutationFn: (id) => axiosSecure.delete(`/scholarships/${id}`),
        onSuccess: invalidate,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, updates }) => axiosSecure.patch(`/scholarships/${id}`, updates),
        onSuccess: (_, { id }) => {
            invalidate();
            queryClient.invalidateQueries({ queryKey: ['scholarship', id] });
        },
    });

    const handleDelete = async (scholarship) => {
        const result = await Swal.fire({
            title: 'Delete this scholarship?',
            text: `"${scholarship?.scholarshipName}" will be removed. You can't undo this.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#FF6B57',
            cancelButtonColor: '#14141F',
            confirmButtonText: 'Yes, delete it',
        });
        if (!result.isConfirmed) return;

        try {
            await deleteMutation.mutateAsync(scholarship._id);
            Swal.fire({ title: 'Deleted', text: 'The scholarship has been deleted.', icon: 'success', confirmButtonColor: '#5B4CFB' });
        } catch {
            Swal.fire({ title: 'Could not delete', text: 'Please try again.', icon: 'error', confirmButtonColor: '#5B4CFB' });
        }
    };

    const handleEdit = (scholarship) => setSelectedScholarship(scholarship);

    const closeEdit = () => setSelectedScholarship(null);

    const handleSaveEdit = async (updates) => {
        try {
            await updateMutation.mutateAsync({ id: selectedScholarship._id, updates });
            closeEdit();
            Swal.fire({ title: 'Updated', text: 'Scholarship has been updated.', icon: 'success', confirmButtonColor: '#5B4CFB' });
            return true;
        } catch (error) {
            Swal.fire({ title: 'Could not update', text: error?.response?.data?.message || 'Please try again.', icon: 'error', confirmButtonColor: '#5B4CFB' });
            return false;
        }
    };

    const columns = [
        {
            key: 'scholarship',
            label: 'Scholarship',
            primary: true,
            render: (scholarship) => (
                <div className="flex min-w-0 items-center gap-3">
                    <img
                        src={scholarship?.universityImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(scholarship?.universityName || 'U')}`}
                        onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(scholarship?.universityName || 'U')}`; }}
                        alt=""
                        className="h-11 w-11 shrink-0 rounded-full border border-black/5 object-cover"
                    />
                    <div className="min-w-0">
                        <p className="font-bold text-ink">{scholarship?.scholarshipName}</p>
                        <p className="mt-0.5 text-xs text-ink/60">{scholarship?.universityName}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-ink/40">
                            <FaMapMarkerAlt className="shrink-0" /> {scholarship?.universityCity}, {scholarship?.universityCountry}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: 'category',
            label: 'Category',
            render: (scholarship) => (
                <span className={`whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold ${categoryClass[scholarship?.scholarshipCategory] || 'bg-black/5 text-ink/60'}`}>
                    {scholarship?.scholarshipCategory}
                </span>
            ),
        },
        { key: 'subjectCategory', label: 'Subject', render: (scholarship) => <span className="text-ink/70">{scholarship?.subjectCategory}</span> },
        {
            key: 'fees',
            label: 'Fee',
            render: (scholarship) => <span className="font-display font-bold text-ink">${scholarship?.applicationFees}</span>,
        },
        {
            key: 'deadline',
            label: 'Deadline',
            render: (scholarship) => <span className="whitespace-nowrap font-semibold text-coral-700">{scholarship?.applicationDeadline}</span>,
        },
        {
            key: 'actions',
            label: 'Actions',
            actions: true,
            align: 'right',
            render: (scholarship) => (
                <div className="flex gap-2 xl:justify-end">
                    <Link to={`/scholarships/details/${scholarship?._id}`} className={iconButtonClass} aria-label="View scholarship" title="View">
                        <FiEye />
                    </Link>
                    <button onClick={() => handleEdit(scholarship)} className={iconButtonClass} aria-label="Edit scholarship" title="Edit">
                        <FiEdit2 />
                    </button>
                    <button
                        onClick={() => handleDelete(scholarship)}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-coral-50 text-coral-700 transition-colors hover:bg-coral hover:text-white"
                        aria-label="Delete scholarship"
                        title="Delete"
                    >
                        <FiTrash2 />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-8">
            <Helmet>
                <title>Manage Scholarships | Dream Scholar Hub</title>
            </Helmet>

            <DashboardHeader tag="Catalogue" title="Manage Scholarships" subtitle="Edit details, check deadlines and remove scholarships that are no longer offered.">
                {scholarships.length > 0 && (
                    <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-ink shadow-[0_4px_20px_-10px_rgba(20,20,31,0.3)]">
                        {scholarships.length} listed
                    </span>
                )}
                <Link to="/adminDashboard/addScholarships" className="inline-flex items-center gap-2 rounded-full bg-violet px-5 py-3 text-sm font-bold text-white hover:bg-violet-600">
                    <FaPlus className="text-xs" /> Add scholarship
                </Link>
            </DashboardHeader>

            {isLoading ? (
                <Loading label="Loading scholarships..." />
            ) : isError ? (
                <p className="text-sm font-semibold text-coral">We could not load scholarships. Please refresh the page.</p>
            ) : scholarships.length === 0 ? (
                <EmptyState icon={FaGraduationCap} title="No scholarships yet" text="Add the first scholarship so students can start applying." />
            ) : (
                <DataTable columns={columns} rows={scholarships} />
            )}

            {selectedScholarship && (
                <Modal title="Edit scholarship" subtitle={selectedScholarship?.scholarshipName} onClose={closeEdit} size="lg">
                    <ScholarshipForm
                        key={selectedScholarship?._id}
                        mode="edit"
                        variant="modal"
                        initialValues={selectedScholarship}
                        submitLabel="Save changes"
                        submittingLabel="Saving..."
                        postedBy={selectedScholarship?.postedEmail}
                        onSubmit={handleSaveEdit}
                        onCancel={closeEdit}
                    />
                </Modal>
            )}
        </div>
    );
};

export default ManageScholarships;
