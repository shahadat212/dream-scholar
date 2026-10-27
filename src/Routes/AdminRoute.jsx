import React from 'react';
import { Navigate } from 'react-router-dom';
import useAdmin from '../pages/hooks/useAdmin';
import Loading from '../components/Loading';

const AdminRoute = ({ children, adminOnly = false }) => {
    const { isAdmin, isModerator, isAdminLoading } = useAdmin();

    if (isAdminLoading) {
        return <Loading label="Checking your access..."></Loading>;
    }
    if (!isAdmin && !isModerator) {
        return <Navigate to="/userDashboard/myProfile" replace></Navigate>;
    }
    if (adminOnly && !isAdmin) {
        return <Navigate to="/adminDashboard/myProfile" replace></Navigate>;
    }
    return children;
};

export default AdminRoute;
