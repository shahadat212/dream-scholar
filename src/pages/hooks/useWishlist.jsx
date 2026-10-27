import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import useToast from './useToast';
import useAuth from './useAuth';
import useAdmin from './useAdmin';
import useAxiosSecure from './useAxiosSecure';

const useWishlist = () => {
    const toast = useToast();
    const { user, loading } = useAuth();
    const { isAdmin, isModerator, isAdminLoading } = useAdmin();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const location = useLocation();

    const isStaff = isAdmin || isModerator;
    const canUseWishlist = !loading && !isAdminLoading && (!user?.email || !isStaff);

    const { data: wishlist = [], isLoading, isError } = useQuery({
        queryKey: ['wishlist', user?.email],
        enabled: !loading && !!user?.email && !isAdminLoading && !isStaff,
        queryFn: async () => (await axiosSecure.get('/wishlist')).data,
    });

    const savedIds = new Set(wishlist.map((entry) => String(entry?.scholarshipId)));

    const toggleMutation = useMutation({
        mutationFn: ({ scholarshipId, saved }) => saved
            ? axiosSecure.delete(`/wishlist/${scholarshipId}`)
            : axiosSecure.post('/wishlist', { scholarshipId }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist', user?.email] }),
    });

    const isSaved = (scholarshipId) => savedIds.has(String(scholarshipId));

    const toggleSaved = async (scholarshipId) => {
        if (!user?.email) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
        try {
            await toggleMutation.mutateAsync({ scholarshipId, saved: isSaved(scholarshipId) });
        } catch {
            toast.fire({ icon: 'error', title: 'Could not update your wishlist', text: 'Please try again.' });
        }
    };

    return {
        wishlist,
        isWishlistLoading: isLoading,
        isWishlistError: isError,
        canUseWishlist,
        isSaved,
        toggleSaved,
        isToggling: toggleMutation.isPending,
        pendingId: toggleMutation.isPending ? String(toggleMutation.variables?.scholarshipId) : null,
    };
};

export default useWishlist;
