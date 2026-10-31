import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { FaFileAlt } from 'react-icons/fa';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import useToast from '../../hooks/useToast';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import Loading from '../../../components/Loading';
import DashboardHeader from '../../../components/DashboardHeader';
import DataTable from '../../../components/DataTable';
import EmptyState from '../../../components/EmptyState';
import StatusBadge from '../../../components/StatusBadge';
import Modal from '../../../components/Modal';
import Spinner from '../../../components/Spinner';
import StatusTimeline from '../../../components/StatusTimeline';
import ExportCsvButton from '../../../components/ExportCsvButton';

const avatarFor = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Applicant')}`;

const isEmpty = (value) => value === undefined || value === null || value === '';

const fieldClass = "w-full rounded-2xl border border-black/10 bg-cream px-4 py-3 text-ink placeholder:text-ink/30 focus:border-violet focus:outline-none";
const pillClass = "inline-flex items-center justify-center rounded-full px-3.5 py-2 text-xs font-bold transition-colors";

const filters = ['all', 'pending', 'processing', 'completed', 'rejected'];

const ManageApplications = () => {
    const toast = useToast();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [feedbackApp, setFeedbackApp] = useState(null);
    const [detailsApp, setDetailsApp] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState([]);
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

    const { data: applications = [], isLoading, isError } = useQuery({
        queryKey: ['applications'],
        queryFn: async () => (await axiosSecure.get('/applications')).data,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, updates }) => axiosSecure.patch(`/applications/${id}`, updates),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications'] }),
    });

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateMutation.mutateAsync({ id, updates: { applicationStatus: newStatus } });
            toast.fire({
                icon: 'success',
                title: 'Status updated',
                text: `Status changed to "${newStatus}".`,
                timer: 1500,
                showConfirmButton: false,
            });
        } catch {
            toast.fire({ icon: 'error', title: 'Could not update status', text: 'Please try again.' });
        }
    };

    const openFeedback = (app) => {
        reset({ feedback: '' });
        setFeedbackApp(app);
    };

    const closeFeedback = () => setFeedbackApp(null);

    const handleFeedbackSubmit = async ({ feedback }) => {
        try {
            await updateMutation.mutateAsync({
                id: feedbackApp._id,
                updates: { feedback: feedback.trim(), applicationStatus: 'rejected' },
            });
            closeFeedback();
            toast.fire({
                icon: 'success',
                title: 'Feedback sent',
                text: 'The application has been rejected with your feedback.',
                timer: 1500,
                showConfirmButton: false,
            });
        } catch {
            toast.fire({ icon: 'error', title: 'Could not send feedback', text: 'Please try again.' });
        }
    };

    const bulkMutation = useMutation({
        mutationFn: ({ ids, status }) => axiosSecure.patch('/applications/bulk/status', { ids, status }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications'] }),
    });

    const toggleSelected = (id) => {
        setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    };

    const changeFilter = (filter) => {
        setStatusFilter(filter);
        setSelectedIds([]);
    };

    const handleBulkStatus = async (status) => {
        const result = await Swal.fire({
            title: `Mark ${selectedIds.length} as ${status}?`,
            text: 'Each student will get a notification about the change.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#5B4CFB',
            cancelButtonColor: '#14141F',
            confirmButtonText: `Yes, mark ${status}`,
        });
        if (!result.isConfirmed) return;

        try {
            const res = await bulkMutation.mutateAsync({ ids: selectedIds, status });
            setSelectedIds([]);
            toast.fire({
                icon: 'success',
                title: 'Applications updated',
                text: `${res.data?.modified ?? 0} application${res.data?.modified === 1 ? '' : 's'} changed to ${status}.`,
                timer: 1800,
                showConfirmButton: false,
            });
        } catch (error) {
            toast.fire({ icon: 'error', title: 'Bulk update failed', text: error?.response?.data?.message || 'Please try again.' });
        }
    };

    const countFor = (status) => status === 'all' ? applications.length : applications.filter((app) => app?.applicationStatus === status).length;
    const visibleApplications = statusFilter === 'all' ? applications : applications.filter((app) => app?.applicationStatus === statusFilter);

    const columns = [
        {
            key: 'applicant',
            label: 'Applicant',
            primary: true,
            render: (app) => (
                <div className="flex min-w-0 items-center gap-3">
                    <input
                        type="checkbox"
                        checked={selectedIds.includes(app?._id)}
                        onChange={() => toggleSelected(app?._id)}
                        aria-label={`Select ${app?.userName || 'applicant'}'s application`}
                        className="h-4 w-4 shrink-0 cursor-pointer accent-violet"
                    />
                    <img
                        src={app?.applicantPhoto || avatarFor(app?.userName)}
                        onError={(e) => { e.currentTarget.src = avatarFor(app?.userName); }}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-full border border-black/5 object-cover"
                    />
                    <div className="min-w-0">
                        <p className="truncate font-bold text-ink">{app?.userName || 'Unnamed applicant'}</p>
                        <p className="truncate text-xs text-ink/50">{app?.userEmail}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'scholarship',
            label: 'Scholarship',
            render: (app) => (
                <div className="min-w-0">
                    <p className="font-semibold text-ink">{app?.scholarshipName}</p>
                    <p className="text-xs text-ink/50">{app?.university}</p>
                </div>
            ),
        },
        {
            key: 'fees',
            label: 'Paid',
            render: (app) => <span className="font-display font-bold text-ink">${(app?.applicationFees || 0) + (app?.serviceCharge || 0)}</span>,
        },
        { key: 'currentDate', label: 'Applied', render: (app) => <span className="whitespace-nowrap text-ink/70">{app?.currentDate}</span> },
        {
            key: 'status',
            label: 'Status',
            render: (app) => (
                <div className="flex flex-col items-end gap-2 xl:items-start">
                    <StatusBadge status={app?.applicationStatus} />
                    <div className="flex items-center gap-2">
                        {updateMutation.isPending && updateMutation.variables?.id === app?._id && <Spinner className="h-3.5 w-3.5 text-violet" />}
                        <select
                            value={app?.applicationStatus}
                            onChange={(e) => handleStatusChange(app?._id, e.target.value)}
                            disabled={updateMutation.isPending && updateMutation.variables?.id === app?._id}
                            aria-label={`Change status for ${app?.userName || 'applicant'}`}
                            className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-ink focus:border-violet focus:outline-none disabled:cursor-wait disabled:opacity-60"
                        >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="rejected" disabled>Rejected</option>
                        </select>
                    </div>
                </div>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            actions: true,
            render: (app) => (
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setDetailsApp(app)} className={`${pillClass} bg-ink text-white hover:bg-black`}>
                        Details
                    </button>
                    <button onClick={() => openFeedback(app)} className={`${pillClass} bg-coral-50 text-coral-700 hover:bg-coral hover:text-white`}>
                        Reject with feedback
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-8">
            <Helmet>
                <title>All Applications | Dream Scholar Hub</title>
            </Helmet>

            <DashboardHeader tag="Admissions" title="All Applications" subtitle="Review what students submitted, move them through the pipeline, or reject with feedback.">
                <ExportCsvButton
                    rows={visibleApplications}
                    filename={`applications-${statusFilter}`}
                    columns={[
                        { label: 'Applicant', value: (app) => app?.userName },
                        { label: 'Email', value: (app) => app?.userEmail },
                        { label: 'Date of birth', value: (app) => app?.dateOfBirth },
                        { label: 'Nationality', value: (app) => app?.nationality },
                        { label: 'Phone', value: (app) => app?.phoneNumber },
                        { label: 'Address', value: (app) => app?.address },
                        { label: 'Scholarship', value: (app) => app?.scholarshipName },
                        { label: 'University', value: (app) => app?.university },
                        { label: 'Subject', value: (app) => app?.subject },
                        { label: 'Degree', value: (app) => app?.degree },
                        { label: 'SSC', value: (app) => app?.sscResult },
                        { label: 'HSC', value: (app) => app?.hscResult },
                        { label: 'Institution', value: (app) => app?.currentInstitution },
                        { label: "Bachelor's CGPA", value: (app) => app?.bachelorCgpa },
                        { label: 'English test', value: (app) => (app?.englishTest && app.englishTest !== 'None' ? `${app.englishTest} ${app?.englishScore}` : app?.englishTest) },
                        { label: 'Paid', value: (app) => (app?.applicationFees || 0) + (app?.serviceCharge || 0) },
                        { label: 'Applied on', value: (app) => app?.currentDate },
                        { label: 'Status', value: (app) => app?.applicationStatus },
                        { label: 'Feedback', value: (app) => app?.feedback },
                    ]}
                />
            </DashboardHeader>

            {isLoading ? (
                <Loading label="Loading applications..." />
            ) : isError ? (
                <p className="text-sm font-semibold text-coral">We could not load applications. Please refresh the page.</p>
            ) : applications.length === 0 ? (
                <EmptyState icon={FaFileAlt} title="No applications yet" text="Applications will appear here as soon as students apply." />
            ) : (
                <>
                    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Filter by status">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                role="tab"
                                aria-selected={statusFilter === filter}
                                onClick={() => changeFilter(filter)}
                                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold capitalize transition-colors ${
                                    statusFilter === filter ? 'bg-ink text-white' : 'bg-white text-ink/60 shadow-[0_4px_20px_-10px_rgba(20,20,31,0.3)] hover:text-ink'
                                }`}
                            >
                                {filter}
                                <span className={`rounded-full px-2 py-0.5 text-[10px] ${statusFilter === filter ? 'bg-white/15' : 'bg-black/5'}`}>{countFor(filter)}</span>
                            </button>
                        ))}
                    </div>

                    {visibleApplications.length > 0 && (
                        <div className={`flex flex-wrap items-center gap-2 rounded-3xl p-3 transition-colors ${selectedIds.length ? 'bg-ink text-white' : 'bg-white shadow-[0_4px_20px_-10px_rgba(20,20,31,0.3)]'}`}>
                            <button
                                type="button"
                                onClick={() => setSelectedIds(selectedIds.length === visibleApplications.length ? [] : visibleApplications.map((app) => app?._id))}
                                className={`rounded-full px-4 py-2 text-xs font-bold ${selectedIds.length ? 'bg-white/10 hover:bg-white/20' : 'text-ink hover:bg-black/5'}`}
                            >
                                {selectedIds.length === visibleApplications.length ? 'Clear selection' : `Select all ${visibleApplications.length}`}
                            </button>
                            {selectedIds.length > 0 ? (
                                <>
                                    <span className="px-2 text-xs font-semibold text-white/70">{selectedIds.length} selected</span>
                                    <span className="ml-auto flex flex-wrap gap-2">
                                        {['pending', 'processing', 'completed'].map((status) => (
                                            <button
                                                key={status}
                                                type="button"
                                                onClick={() => handleBulkStatus(status)}
                                                disabled={bulkMutation.isPending}
                                                className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold capitalize text-ink hover:bg-cream disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {bulkMutation.isPending && bulkMutation.variables?.status === status ? <><Spinner className="h-3 w-3" /> Updating…</> : `Mark ${status}`}
                                            </button>
                                        ))}
                                    </span>
                                </>
                            ) : (
                                <span className="px-2 text-xs text-ink/50">Tick applications to update several at once.</span>
                            )}
                        </div>
                    )}

                    {visibleApplications.length === 0 ? (
                        <EmptyState icon={FaFileAlt} title={`No ${statusFilter} applications`} text="Try another status filter." />
                    ) : (
                        <DataTable columns={columns} rows={visibleApplications} />
                    )}
                </>
            )}

            {detailsApp && (
                <Modal title={detailsApp?.userName || 'Unnamed applicant'} subtitle={detailsApp?.userEmail} onClose={() => setDetailsApp(null)} size="lg">
                    <div className="flex items-center gap-4">
                        <img
                            src={detailsApp?.applicantPhoto || avatarFor(detailsApp?.userName)}
                            onError={(e) => { e.currentTarget.src = avatarFor(detailsApp?.userName); }}
                            alt={detailsApp?.userName || 'Applicant'}
                            className="h-16 w-16 shrink-0 rounded-full border border-black/5 object-cover"
                        />
                        <StatusBadge status={detailsApp?.applicationStatus} />
                    </div>

                    {[
                        {
                            title: 'Personal',
                            rows: [
                                ['Date of birth', detailsApp?.dateOfBirth],
                                ['Gender', detailsApp?.gender],
                                ['Nationality', detailsApp?.nationality],
                            ],
                        },
                        {
                            title: 'Contact',
                            rows: [
                                ['Phone', detailsApp?.phoneNumber],
                                ['Email', detailsApp?.userEmail],
                                ['Address', detailsApp?.address],
                            ],
                        },
                        {
                            title: 'Academics',
                            rows: [
                                ['Applying for', detailsApp?.degree],
                                ['Institution', detailsApp?.currentInstitution],
                                ['SSC GPA', detailsApp?.sscResult !== undefined ? `${detailsApp.sscResult}${detailsApp?.sscYear ? ` (${detailsApp.sscYear})` : ''}` : null],
                                ['HSC GPA', detailsApp?.hscResult !== undefined ? `${detailsApp.hscResult}${detailsApp?.hscYear ? ` (${detailsApp.hscYear})` : ''}` : null],
                                ...(detailsApp?.bachelorCgpa !== null && detailsApp?.bachelorCgpa !== undefined ? [["Bachelor's CGPA", detailsApp.bachelorCgpa]] : []),
                                ['Study gap', detailsApp?.studyGap],
                                ['English test', detailsApp?.englishTest ? (detailsApp.englishTest === 'None' ? 'Not taken' : `${detailsApp.englishTest} · ${detailsApp?.englishScore}`) : null],
                            ],
                        },
                        {
                            title: 'Scholarship',
                            rows: [
                                ['Scholarship', detailsApp?.scholarshipName],
                                ['University', detailsApp?.university],
                                ['Category', detailsApp?.category],
                                ['Subject', detailsApp?.subject],
                                ['Fees paid', `$${(detailsApp?.applicationFees || 0) + (detailsApp?.serviceCharge || 0)}`],
                                ['Applied on', detailsApp?.currentDate],
                            ],
                        },
                    ].map((group) => (
                        <section key={group.title} className="mt-6 border-t border-black/5 pt-5">
                            <h3 className="text-[11px] font-bold uppercase tracking-wide text-ink/40">{group.title}</h3>
                            <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                                {group.rows.map(([label, value]) => (
                                    <div key={label} className={label === 'Address' ? 'sm:col-span-2' : ''}>
                                        <dt className="text-xs text-ink/50">{label}</dt>
                                        <dd className="break-words font-semibold text-ink">
                                            {isEmpty(value) ? <span className="font-normal text-ink/40">Not provided</span> : value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </section>
                    ))}

                    {detailsApp?.certificates && Object.values(detailsApp.certificates).some(Boolean) && (
                        <section className="mt-6 border-t border-black/5 pt-5">
                            <h3 className="text-[11px] font-bold uppercase tracking-wide text-ink/40">Documents</h3>
                            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {[
                                    ['ssc', 'SSC certificate'],
                                    ['hsc', 'HSC certificate'],
                                    ['bachelor', "Bachelor's certificate"],
                                    ['english', `${detailsApp?.englishTest || 'English'} report`],
                                ].filter(([key]) => detailsApp.certificates?.[key]).map(([key, label]) => (
                                    <a
                                        key={key}
                                        href={detailsApp.certificates[key]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group block overflow-hidden rounded-2xl border border-black/10 bg-cream transition hover:border-violet"
                                    >
                                        <img src={detailsApp.certificates[key]} alt={label} className="h-24 w-full object-cover transition group-hover:opacity-90" />
                                        <span className="block truncate px-3 py-2 text-xs font-semibold text-ink group-hover:text-violet">{label}</span>
                                    </a>
                                ))}
                            </div>
                            <p className="mt-2 text-[11px] text-ink/40">Click a document to open it full size in a new tab.</p>
                        </section>
                    )}

                    {detailsApp?.statementOfPurpose && (
                        <section className="mt-6 border-t border-black/5 pt-5">
                            <h3 className="text-[11px] font-bold uppercase tracking-wide text-ink/40">Personal statement</h3>
                            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink/80">{detailsApp.statementOfPurpose}</p>
                        </section>
                    )}

                    {detailsApp?.declarations?.accuracy && (
                        <p className="mt-6 rounded-2xl bg-mint-50 px-4 py-3 text-xs font-semibold text-mint-700">
                            The applicant confirmed eligibility, document readiness and the accuracy declaration{detailsApp.declarations?.acceptedAt ? ` on ${detailsApp.declarations.acceptedAt.split('T')[0]}` : ''}.
                        </p>
                    )}

                    <section className="mt-6 border-t border-black/5 pt-5">
                        <h3 className="mb-4 text-[11px] font-bold uppercase tracking-wide text-ink/40">Progress</h3>
                        <StatusTimeline application={detailsApp} />
                    </section>

                    {detailsApp?.feedback && (
                        <section className="mt-6 border-t border-black/5 pt-5">
                            <h3 className="text-[11px] font-bold uppercase tracking-wide text-ink/40">Feedback sent</h3>
                            <p className="mt-2 rounded-2xl bg-coral-50 p-4 text-sm text-coral-700">{detailsApp?.feedback}</p>
                        </section>
                    )}
                </Modal>
            )}

            {feedbackApp && (
                <Modal
                    title="Reject with feedback"
                    subtitle={`${feedbackApp?.userName || 'Applicant'} · ${feedbackApp?.scholarshipName}`}
                    onClose={closeFeedback}
                >
                    <form onSubmit={handleSubmit(handleFeedbackSubmit)} className="space-y-5" noValidate>
                        <div>
                            <label htmlFor="feedback-text" className="mb-1.5 block text-sm font-bold text-ink">Feedback for the student</label>
                            <textarea
                                id="feedback-text"
                                rows="4"
                                placeholder="Explain why the application was not accepted..."
                                className={fieldClass}
                                {...register('feedback', { validate: (value) => value?.trim().length >= 5 || 'Write at least 5 characters' })}
                            ></textarea>
                            {errors.feedback && <span className="mt-1 block text-xs font-semibold text-coral">{errors.feedback.message}</span>}
                            <p className="mt-1 text-xs text-ink/40">Sending feedback sets the status to rejected.</p>
                        </div>
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button type="button" onClick={closeFeedback} className="rounded-full border border-black/10 bg-white px-6 py-3.5 text-sm font-bold text-ink hover:bg-black/5">
                                Cancel
                            </button>
                            <button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2 rounded-full bg-coral px-6 py-3.5 text-sm font-bold text-white hover:bg-coral-600 disabled:cursor-not-allowed disabled:opacity-60">
                                {isSubmitting && <Spinner />}
                                {isSubmitting ? 'Sending…' : 'Reject & send'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default ManageApplications;
