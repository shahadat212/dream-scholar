import React from 'react';

const statusClass = {
    pending: 'bg-sun-50 text-sun-700',
    processing: 'bg-violet/10 text-violet',
    completed: 'bg-mint-50 text-mint-700',
    rejected: 'bg-coral-50 text-coral-700',
};

const dotClass = {
    pending: 'bg-sun',
    processing: 'bg-violet',
    completed: 'bg-mint',
    rejected: 'bg-coral',
};

const StatusBadge = ({ status }) => {
    return (
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold capitalize ${statusClass[status] || 'bg-black/5 text-ink/60'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${dotClass[status] || 'bg-ink/30'}`} aria-hidden="true"></span>
            {status || 'unknown'}
        </span>
    );
};

export default StatusBadge;
