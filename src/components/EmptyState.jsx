import React from 'react';

const EmptyState = ({ icon: Icon, title, text, children }) => {
    return (
        <div className="flex flex-col items-center rounded-3xl bg-white px-6 py-14 text-center shadow-[0_8px_30px_-15px_rgba(20,20,31,0.2)]">
            {Icon && (
                <span className="blob-1 flex h-16 w-16 items-center justify-center bg-violet/10 text-2xl text-violet">
                    <Icon />
                </span>
            )}
            <p className="mt-5 font-display text-lg font-bold text-ink">{title}</p>
            {text && <p className="mt-1 max-w-sm text-sm text-ink/60">{text}</p>}
            {children && <div className="mt-6">{children}</div>}
        </div>
    );
};

export default EmptyState;
