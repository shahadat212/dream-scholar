import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { FaReceipt } from 'react-icons/fa';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import Loading from '../../../components/Loading';
import DashboardHeader from '../../../components/DashboardHeader';
import DataTable from '../../../components/DataTable';
import EmptyState from '../../../components/EmptyState';
import ExportCsvButton from '../../../components/ExportCsvButton';

const PaymentHistory = () => {
    const axiosSecure = useAxiosSecure();

    const { data: payments = [], isLoading, isError } = useQuery({
        queryKey: ['payments'],
        queryFn: async () => (await axiosSecure.get('/payments')).data,
    });

    const totalCollected = payments.reduce((sum, payment) => sum + (Number(payment?.amount) || 0), 0);

    const columns = [
        {
            key: 'student',
            label: 'Student',
            primary: true,
            render: (payment) => <p className="break-all font-bold text-ink">{payment?.studentEmail}</p>,
        },
        { key: 'scholarshipName', label: 'Scholarship', render: (payment) => <span className="text-ink/70">{payment?.scholarshipName}</span> },
        {
            key: 'amount',
            label: 'Amount',
            render: (payment) => <span className="font-display font-bold text-mint-700">${payment?.amount}</span>,
        },
        {
            key: 'transactionId',
            label: 'Transaction',
            render: (payment) => (
                <code className="break-all rounded-lg bg-black/5 px-2 py-1 font-mono text-[11px] text-ink/60">{payment?.transactionId}</code>
            ),
        },
        { key: 'date', label: 'Date', render: (payment) => <span className="whitespace-nowrap text-ink/70">{payment?.date}</span> },
    ];

    return (
        <div className="space-y-8">
            <Helmet>
                <title>Payment History | Dream Scholar Hub</title>
            </Helmet>

            <DashboardHeader tag="Finance" title="Payment History" subtitle="Every application fee paid on the platform.">
                <ExportCsvButton
                    rows={payments}
                    filename="payments"
                    columns={[
                        { label: 'Student email', value: (payment) => payment?.studentEmail },
                        { label: 'Scholarship', value: (payment) => payment?.scholarshipName },
                        { label: 'Amount', value: (payment) => payment?.amount },
                        { label: 'Transaction ID', value: (payment) => payment?.transactionId },
                        { label: 'Date', value: (payment) => payment?.date },
                    ]}
                />
                {payments.length > 0 && (
                    <>
                        <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-ink shadow-[0_4px_20px_-10px_rgba(20,20,31,0.3)]">
                            {payments.length} payments
                        </span>
                        <span className="rounded-full bg-mint-50 px-4 py-2 text-xs font-bold text-mint-700">
                            ${totalCollected.toLocaleString('en-US')} collected
                        </span>
                    </>
                )}
            </DashboardHeader>

            {isLoading ? (
                <Loading label="Loading payment history..." />
            ) : isError ? (
                <p className="text-sm font-semibold text-coral">We could not load payments. Please refresh the page.</p>
            ) : payments.length === 0 ? (
                <EmptyState icon={FaReceipt} title="No payments yet" text="Payments show up here when students pay their application fee." />
            ) : (
                <DataTable columns={columns} rows={payments} />
            )}
        </div>
    );
};

export default PaymentHistory;
