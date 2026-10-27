import { useQuery } from '@tanstack/react-query';
import useAxiosPublic from './useAxiosPublic';

const useScholarships = () => {
    const axiosPublic = useAxiosPublic();

    const { data: scholarships = [], isLoading, isError } = useQuery({
        queryKey: ['scholarships'],
        queryFn: async () => (await axiosPublic.get('/scholarships')).data,
    });

    return { scholarships, isLoading, isError };
};

export default useScholarships;
