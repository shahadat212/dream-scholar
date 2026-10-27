import React from 'react';
import { Navigate } from 'react-router-dom';
import useAdmin from '../pages/hooks/useAdmin';
import Loading from '../components/Loading';

const DashboardRedirect = () => {
    const { isAdmin, isModerator, isAdminLoading } = useAdmin();

    if (isAdminLoading) {
        return <Loading label="Opening your dashboard..."></Loading>;
    }
    if (isAdmin || isModerator) {
        return <Navigate to="/adminDashboard/myProfile" replace></Navigate>;
    }
    return <Navigate to="/userDashboard/myProfile" replace></Navigate>;
};

export default DashboardRedirect;
