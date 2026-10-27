import React from 'react';
import { FiCheck, FiX } from 'react-icons/fi';

const formatDateTime = (value) => {
    if (!value) return '';
    const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value);
    if (isNaN(date)) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const StatusTimeline = ({ application }) => {
    const history = Array.isArray(application?.statusHistory) ? application.statusHistory : [];
    const current = application?.applicationStatus || 'pending';
    const lastAt = (status) => [...history].reverse().find((entry) => entry?.status === status)?.at;

    const finalStep = current === 'rejected'
        ? { key: 'rejected', label: 'Not accepted', text: 'The committee decided not to accept this application.' }
        : { key: 'completed', label: 'Accepted', text: 'Congratulations, you were selected.' };

    const steps = [
        { key: 'pending', label: 'Submitted', text: 'Payment confirmed and application received.', at: lastAt('pending') || application?.currentDate },
        { key: 'processing', label: 'Under review', text: 'The admissions team is reviewing your documents.', at: lastAt('processing') },
        { ...finalStep, at: lastAt(finalStep.key) },
    ];

    const order = { pending: 0, processing: 1, completed: 2, rejected: 2 };
    const currentIndex = order[current] ?? 0;

    return (
        <ol className="relative space-y-6">
            {steps.map((step, index) => {
                const skippedReview = step.key === 'processing' && current === 'rejected' && !step.at;
                const isDone = !skippedReview && (index === 0 || index < currentIndex || (index === steps.length - 1 && currentIndex === steps.length - 1));
                const isCurrent = index === currentIndex && current !== 'completed' && current !== 'rejected';
                const isRejected = step.key === 'rejected' && current === 'rejected';
                const isReached = !skippedReview && index <= currentIndex;

                return (
                    <li key={step.key} className="relative flex gap-4">
                        {index < steps.length - 1 && (
                            <span
                                className={`absolute left-[15px] top-8 h-[calc(100%-0.5rem)] w-0.5 ${index < currentIndex ? 'bg-violet' : 'bg-black/10'}`}
                                aria-hidden="true"
                            ></span>
                        )}
                        <span
                            className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
                                isRejected
                                    ? 'bg-coral text-white'
                                    : isDone
                                        ? (step.key === 'completed' ? 'bg-mint text-white' : 'bg-violet text-white')
                                        : isCurrent
                                            ? 'bg-violet/10 text-violet ring-2 ring-violet'
                                            : 'bg-black/5 text-ink/30'
                            }`}
                        >
                            {isRejected ? <FiX /> : isDone ? <FiCheck /> : <span className="h-2 w-2 rounded-full bg-current"></span>}
                        </span>
                        <div className="min-w-0 pt-0.5">
                            <p className={`text-sm font-bold ${isReached ? 'text-ink' : 'text-ink/40'}`}>
                                {step.label}
                                {isCurrent && <span className="ml-2 rounded-full bg-violet/10 px-2 py-0.5 text-[10px] font-bold text-violet">Current</span>}
                            </p>
                            <p className={`mt-0.5 text-xs ${isReached ? 'text-ink/60' : 'text-ink/30'}`}>{step.text}</p>
                            {isReached && step.at && <p className="mt-1 text-[11px] font-semibold text-ink/40">{formatDateTime(step.at)}</p>}
                        </div>
                    </li>
                );
            })}
        </ol>
    );
};

export default StatusTimeline;
