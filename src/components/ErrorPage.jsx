import React from 'react';
import { Link } from 'react-router-dom';

const ErrorPage = () => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-cream px-4 text-center">
            <span className="inline-block rounded-full bg-sun/30 px-4 py-1.5 text-xs font-bold text-sun-700">Page not found</span>
            <h1 className="font-display text-7xl font-extrabold text-violet">404</h1>
            <p className="max-w-sm text-ink/60">
                This page doesn&apos;t exist, or it may have moved.
            </p>
            <Link
                to="/"
                className="mt-2 rounded-full bg-coral px-7 py-3 text-sm font-bold text-white shadow-lg shadow-coral/25 transition hover:bg-coral-600"
            >
                Return to Home
            </Link>
        </div>
    );
};

export default ErrorPage;
