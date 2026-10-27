import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useToast from '../../hooks/useToast';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { Helmet } from 'react-helmet-async';
import DashboardHeader from '../../../components/DashboardHeader';
import ScholarshipForm from '../../../components/ScholarshipForm';

const AddScholar = () => {
    const toast = useToast();
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    const addMutation = useMutation({
        mutationFn: (scholarship) => axiosSecure.post('/scholarships', scholarship),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['scholarships'] });
            queryClient.invalidateQueries({ queryKey: ['topScholarships'] });
        },
    });

    const handleCreate = async (scholarship) => {
        try {
            await addMutation.mutateAsync(scholarship);
            toast.fire({
                icon: "success",
                title: "Scholarship published",
                text: "It is now visible to students.",
            });
            return true;
        } catch (error) {
            toast.fire({
                icon: "error",
                title: "Could not add the scholarship",
                text: error?.response?.data?.message || "Please try again.",
            });
            return false;
        }
    };

    return (
        <div className="space-y-8">
            <Helmet>
                <title>Add Scholarship | Dream Scholar Hub</title>
            </Helmet>

            <DashboardHeader tag="Catalogue" title="Add Scholarship" subtitle="Publish a new scholarship. Students can apply as soon as you save it." />

            <ScholarshipForm
                mode="create"
                variant="page"
                submitLabel="Publish scholarship"
                submittingLabel="Publishing…"
                postedBy={user?.email}
                onSubmit={handleCreate}
            />
        </div>
    );
};

export default AddScholar;
