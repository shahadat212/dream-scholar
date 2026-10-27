import { useQuery } from '@tanstack/react-query';
import useAuth from './useAuth';
import useAxiosSecure from './useAxiosSecure';

const useMyApplications = () => {
    const { user, loading } = useAuth();
    const axiosSecure = useAxiosSecure();

    const { data: myApplications = [], isLoading, isError } = useQuery({
        queryKey: ['applications', user?.email],
        enabled: !loading && !!user?.email,
        queryFn: async () => {
            const res = await axiosSecure.get(`/applications/email/${user.email}`);
            return res.data;
        },
    });

    const findApplication = (scholarshipId) =>
        myApplications.find((app) => String(app?.scholarShipId) === String(scholarshipId));

    return {
        myApplications,
        findApplication,
        isMyApplicationsLoading: loading || (!!user?.email && isLoading),
        isMyApplicationsError: isError,
    };
};

export default useMyApplications;
