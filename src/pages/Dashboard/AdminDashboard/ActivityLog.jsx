import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { FaHistory } from 'react-icons/fa';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import Loading from '../../../components/Loading';
import DashboardHeader from '../../../components/DashboardHeader';
import DataTable from '../../../components/DataTable';
import EmptyState from '../../../components/EmptyState';
import ExportCsvButton from '../../../components/ExportCsvButton';

const TYPE_FILTERS = [
    { value: '', label: 'Everything' },
    { value: 'application', label: 'Applications' },
    { value: 'scholarship', label: 'Scholarships' },
    { value: 'review', label: 'Reviews' },
    { value: 'user', label: 'Users' },
];

const typeClass = {
    application: 'bg-violet/10 text-violet',
    scholarship: 'bg-sun-50 text-sun-700',
    review: 'bg-mint-50 text-mint-700',
    user: 'bg-coral-50 text-coral-700',
};

const formatWhen = (value) => {
    const date = new Date(value);
    if (isNaN(date)) return '';
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
};

const ActivityLog = () => {
    const axiosSecure = useAxiosSecure();
    const [targetType, setTargetType] = useState('');

    const { data: logs = [], isLoading, isError } = useQuery({
        queryKey: ['activity', targetType],
        queryFn: async () => (await axiosSecure.get('/activity', { params: { limit: 200, ...(targetType && { targetType }) } })).data,
    });

    const columns = [
        {
            key: 'summary',
            label: 'What happened',
            primary: true,
            render: (log) => (
                <div className="min-w-0">
                    <p className="font-semibold text-ink">{log?.summary}</p>
                    <p className="mt-0.5 text-xs text-ink/50 xl:hidden">{formatWhen(log?.createdAt)}</p>
                </div>
            ),
        },
        {
            key: 'type',
            label: 'Area',
            render: (log) => (
                <span className={`rounded-full px-3 py-1 text-[11px] font-bold capitalize ${typeClass[log?.targetType] || 'bg-black/5 text-ink/60'}`}>
                    {log?.targetType}
                </span>
            ),
        },
        { key: 'actor', label: 'By', render: (log) => <span className="break-all text-ink/70">{log?.actorEmail}</span> },
        { key: 'createdAt', label: 'When', render: (log) => <span className="whitespace-nowrap text-ink/70">{formatWhen(log?.createdAt)}</span> },
    ];

    return (
        <div className="space-y-8">
            <Helmet>
                <title>Activity Log | Dream Scholar Hub</title>
            </Helmet>

            <DashboardHeader tag="Admin only" title="Activity Log" subtitle="Every change made by admins and moderators, newest first (last 200 entries).">
                <ExportCsvButton
                    rows={logs}
                    filename="activity-log"
                    columns={[
                        { label: 'When', value: (log) => log?.createdAt },
                        { label: 'By', value: (log) => log?.actorEmail },
                        { label: 'Area', value: (log) => log?.targetType },
                        { label: 'Action', value: (log) => log?.action },
                        { label: 'Summary', value: (log) => log?.summary },
                    ]}
                />
            </DashboardHeader>

            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Filter by area">
                {TYPE_FILTERS.map((filter) => (
                    <button
                        key={filter.value || 'all'}
                        role="tab"
                        aria-selected={targetType === filter.value}
                        onClick={() => setTargetType(filter.value)}
                        className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                            targetType === filter.value ? 'bg-ink text-white' : 'bg-white text-ink/60 shadow-[0_4px_20px_-10px_rgba(20,20,31,0.3)] hover:text-ink'
                        }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <Loading label="Loading activity..." />
            ) : isError ? (
                <p className="text-sm font-semibold text-coral">We could not load the activity log. Please refresh the page.</p>
            ) : logs.length === 0 ? (
                <EmptyState icon={FaHistory} title="No activity yet" text="Changes made by staff will be recorded here." />
            ) : (
                <DataTable columns={columns} rows={logs} />
            )}
        </div>
    );
};

export default ActivityLog;
