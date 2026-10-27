import React, { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import NavBar from '../pages/Shared/NavBar';
import Footer from '../pages/Shared/Footer';
import Loading from '../components/Loading';

const MainLayout = () => {
    const { pathname } = useLocation();

    return (
        <div className="flex min-h-screen flex-col">
            <NavBar></NavBar>
            <motion.main
                key={pathname}
                className="flex-1"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
                <Suspense fallback={<Loading label="Loading page..." />}>
                    <Outlet></Outlet>
                </Suspense>
            </motion.main>
            <Footer></Footer>
        </div>
    );
};

export default MainLayout;
