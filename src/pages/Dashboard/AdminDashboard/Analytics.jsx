import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { FaChartBar } from 'react-icons/fa';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import Loading from '../../../components/Loading';
import DashboardHeader from '../../../components/DashboardHeader';
import EmptyState from '../../../components/EmptyState';

const cardClass = "rounded-3xl bg-white p-6 shadow-[0_8px_30px_-15px_rgba(20,20,31,0.2)]";
const MONTHS_SHOWN = 6;

const STATUS_ROWS = [
    { key: 'pending', label: 'Pending', bar: 'bg-sun' },
    { key: 'processing', label: 'Processing', bar: 'bg-violet' },
    { key: 'completed', label: 'Accepted', bar: 'bg-mint' },
    { key: 'rejected', label: 'Rejected', bar: 'bg-coral' },
];

const lastMonths = (count) => {
    const now = new Date();
    return Array.from({ length: count }, (_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
        return {
            key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
            label: date.toLocaleDateString('en-US', { month: 'short' }),
            fullLabel: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        };
    });
};

const monthKey = (value) => (typeof value === 'string' ? value.slice(0, 7) : '');

const niceMax = (value) => {
    if (value <= 0) return 1;
    const magnitude = 10 ** Math.floor(Math.log10(value));
    const step = [1, 2, 2.5, 5, 10].find((s) => s * magnitude >= value) || 10;
    return step * magnitude;
};

const ColumnChart = ({ title, subtitle, data, formatValue = (v) => v, emptyText }) => {
    const max = niceMax(Math.max(...data.map((d) => d.value), 0));
    const ticks = [max, max / 2, 0];
    const hasData = data.some((d) => d.value > 0);

    return (
        <section className={cardClass}>
            <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
            {subtitle && <p className="text-sm text-ink/60">{subtitle}</p>}

            {!hasData ? (
                <p className="mt-10 pb-6 text-center text-sm text-ink/40">{emptyText}</p>
            ) : (
                <>
                    <div className="mt-6 flex h-52 gap-3" aria-hidden="true">
                        <div className="flex flex-col justify-between pb-6 text-right text-[11px] font-semibold text-ink/40">
                            {ticks.map((tick) => <span key={tick} className="-translate-y-1/2 leading-none">{formatValue(Math.round(tick * 100) / 100)}</span>)}
                        </div>
                        <div className="relative flex flex-1 flex-col">
                            <div className="pointer-events-none absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between">
                                {ticks.map((tick) => <span key={tick} className={`h-px w-full ${tick === 0 ? 'bg-black/20' : 'bg-black/5'}`}></span>)}
                            </div>
                            <div className="relative flex flex-1 items-end gap-[2px] pb-px">
                                {data.map((d) => (
                                    <div key={d.key} className="group relative flex h-full flex-1 items-end justify-center" tabIndex={0}>
                                        <div
                                            className="w-full max-w-10 rounded-t-[4px] bg-violet transition-colors group-hover:bg-violet-600 group-focus:bg-violet-600"
                                            style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? 2 : 0 }}
                                        ></div>
                                        <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-ink px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus:opacity-100">
                                            <span className="block text-white/60">{d.fullLabel}</span>
                                            <span className="font-bold">{formatValue(d.value)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex h-6 gap-[2px] pt-2">
                                {data.map((d) => (
                                    <span key={d.key} className="flex-1 text-center text-[11px] font-semibold text-ink/50">{d.label}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <table className="sr-only">
                        <caption>{title}</caption>
                        <thead><tr><th scope="col">Month</th><th scope="col">Value</th></tr></thead>
                        <tbody>
                            {data.map((d) => <tr key={d.key}><th scope="row">{d.fullLabel}</th><td>{formatValue(d.value)}</td></tr>)}
                        </tbody>
                    </table>
                </>
            )}
        </section>
    );
};

const BarList = ({ title, subtitle, rows, emptyText, valueSuffix = '' }) => {
    const max = Math.max(...rows.map((row) => row.value), 0) || 1;

    return (
        <section className={cardClass}>
            <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
            {subtitle && <p className="text-sm text-ink/60">{subtitle}</p>}
            {rows.length === 0 ? (
                <p className="mt-10 pb-6 text-center text-sm text-ink/40">{emptyText}</p>
            ) : (
                <ul className="mt-6 space-y-4">
                    {rows.map((row) => (
                        <li key={row.key}>
                            <div className="flex items-baseline justify-between gap-3 text-sm">
                                <span className="min-w-0 truncate font-semibold text-ink">{row.label}</span>
                                <span className="shrink-0 font-display font-bold text-ink">
                                    {row.value}{valueSuffix}
                                    {row.share !== undefined && <span className="ml-1.5 text-xs font-semibold text-ink/40">{row.share}%</span>}
                                </span>
                            </div>
                            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-black/5">
                                <div className={`h-full rounded-full ${row.bar || 'bg-violet'}`} style={{ width: `${(row.value / max) * 100}%` }}></div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};

const Analytics = () => {
    const axiosPublic = useAxiosPublic();
    const axiosSecure = useAxiosSecure();

    const applicationsQuery = useQuery({
        queryKey: ['applications'],
        queryFn: async () => (await axiosSecure.get('/applications')).data,
    });
    const paymentsQuery = useQuery({
        queryKey: ['payments'],
        queryFn: async () => (await axiosSecure.get('/payments')).data,
    });
    const scholarshipsQuery = useQuery({
        queryKey: ['scholarships'],
        queryFn: async () => (await axiosPublic.get('/scholarships')).data,
    });
    const reviewsQuery = useQuery({
        queryKey: ['reviews', 'manage'],
        queryFn: async () => (await axiosSecure.get('/reviews/manage')).data,
    });

    const queries = [applicationsQuery, paymentsQuery, scholarshipsQuery, reviewsQuery];
    if (queries.some((q) => q.isLoading)) {
        return <Loading label="Crunching the numbers..." />;
    }

    const applications = applicationsQuery.data || [];
    const payments = paymentsQuery.data || [];
    const scholarships = scholarshipsQuery.data || [];
    const reviews = reviewsQuery.data || [];
    const hasError = queries.some((q) => q.isError);

    const months = lastMonths(MONTHS_SHOWN);
    const applicationsByMonth = months.map((m) => ({ ...m, value: applications.filter((a) => monthKey(a?.currentDate) === m.key).length }));
    const revenueByMonth = months.map((m) => ({
        ...m,
        value: payments.filter((p) => monthKey(p?.date) === m.key).reduce((sum, p) => sum + (Number(p?.amount) || 0), 0),
    }));

    const countBy = (status) => applications.filter((a) => a?.applicationStatus === status).length;
    const completed = countBy('completed');
    const rejected = countBy('rejected');
    const decided = completed + rejected;
    const acceptanceRate = decided ? Math.round((completed / decided) * 100) : null;
    const revenue = payments.reduce((sum, p) => sum + (Number(p?.amount) || 0), 0);
    const visibleReviews = reviews.filter((r) => !r?.hidden);
    const averageRating = visibleReviews.length
        ? (visibleReviews.reduce((sum, r) => sum + (Number(r?.rating) || 0), 0) / visibleReviews.length).toFixed(1)
        : null;

    const statusRows = STATUS_ROWS.map((row) => {
        const value = countBy(row.key);
        return { ...row, value, share: applications.length ? Math.round((value / applications.length) * 100) : 0 };
    });

    const applicationsPerScholarship = applications.reduce((map, a) => {
        const key = String(a?.scholarShipId);
        map.set(key, { key, label: a?.scholarshipName || 'Unknown scholarship', value: (map.get(key)?.value || 0) + 1 });
        return map;
    }, new Map());
    const topScholarships = [...applicationsPerScholarship.values()].sort((a, b) => b.value - a.value).slice(0, 5);

    const today = new Date().toISOString().split('T')[0];
    const openScholarships = scholarships.filter((s) => !s?.applicationDeadline || s.applicationDeadline >= today).length;

    const kpis = [
        { label: 'Applications', value: applications.length, note: `${countBy('pending')} waiting for review` },
        { label: 'Acceptance rate', value: acceptanceRate === null ? '—' : `${acceptanceRate}%`, note: decided ? `${completed} of ${decided} decided` : 'No decisions yet' },
        { label: 'Fees collected', value: `$${revenue.toLocaleString('en-US')}`, note: `${payments.length} payments` },
        { label: 'Average rating', value: averageRating ?? '—', note: `${visibleReviews.length} visible reviews` },
        { label: 'Open scholarships', value: openScholarships, note: `${scholarships.length} listed in total` },
    ];

    return (
        <div className="space-y-8">
            <Helmet>
                <title>Analytics | Dream Scholar Hub</title>
            </Helmet>

            <DashboardHeader tag="Insights" title="Analytics" subtitle="How applications, payments and reviews are trending across the platform." />

            {hasError && (
                <p className="text-sm font-semibold text-coral">Some data could not be loaded, so a few numbers may be incomplete. Refresh to try again.</p>
            )}

            {applications.length === 0 && payments.length === 0 && scholarships.length === 0 ? (
                <EmptyState icon={FaChartBar} title="Nothing to analyse yet" text="Charts appear once scholarships are listed and students start applying." />
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-5">
                        {kpis.map((kpi) => (
                            <div key={kpi.label} className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_-15px_rgba(20,20,31,0.2)]">
                                <p className="text-xs font-semibold text-ink/50">{kpi.label}</p>
                                <p className="mt-2 font-display text-2xl font-bold text-ink md:text-3xl">{kpi.value}</p>
                                <p className="mt-1 text-[11px] text-ink/40">{kpi.note}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid gap-6 xl:grid-cols-2">
                        <ColumnChart
                            title="Applications per month"
                            subtitle={`Last ${MONTHS_SHOWN} months`}
                            data={applicationsByMonth}
                            emptyText="No applications in the last six months."
                        />
                        <ColumnChart
                            title="Fees collected per month"
                            subtitle={`Last ${MONTHS_SHOWN} months, in US dollars`}
                            data={revenueByMonth}
                            formatValue={(v) => `$${Number(v).toLocaleString('en-US')}`}
                            emptyText="No payments in the last six months."
                        />
                        <BarList
                            title="Applications by status"
                            subtitle="Where every application currently stands"
                            rows={applications.length ? statusRows : []}
                            emptyText="No applications yet."
                        />
                        <BarList
                            title="Most popular scholarships"
                            subtitle="Top 5 by number of applications"
                            rows={topScholarships}
                            emptyText="No applications yet."
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default Analytics;
