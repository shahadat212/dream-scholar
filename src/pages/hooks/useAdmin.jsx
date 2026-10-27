import { useQuery } from '@tanstack/react-query';
import useAuth from './useAuth';
import useAxiosSecure from './useAxiosSecure';

const useAdmin = () => {
    const { user, loading } = useAuth();
    const axiosSecure = useAxiosSecure();

    const { data: role, isLoading: isRoleLoading } = useQuery({
        queryKey: ['userRole', user?.email],
        enabled: !loading && !!user?.email,
        queryFn: async () => {
            const res = await axiosSecure.get(`/users/role/${user.email}`);
            return res.data;
        },
    });

    return {
        isAdmin: role?.admin || false,
        isModerator: role?.moderator || false,
        isAdminLoading: loading || (!!user?.email && isRoleLoading),
    };
};

export default useAdmin;
