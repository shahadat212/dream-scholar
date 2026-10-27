import React from 'react';

const DashboardHeader = ({ tag, title, subtitle, children }) => {
    return (
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
                {tag && (
                    <span className="inline-block rounded-full bg-coral/10 px-4 py-1.5 text-xs font-bold text-coral">{tag}</span>
                )}
                <h1 className="mt-3 font-display text-2xl font-extrabold text-ink md:text-3xl">{title}</h1>
                {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-ink/60">{subtitle}</p>}
            </div>
            {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
        </div>
    );
};

export default DashboardHeader;
