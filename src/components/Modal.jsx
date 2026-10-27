import React, { useEffect, useId } from 'react';
import { FiX } from 'react-icons/fi';

const sizeClass = {
    md: 'max-w-md',
    lg: 'max-w-2xl',
};

const Modal = ({ title, subtitle, onClose, size = 'md', children }) => {
    const titleId = useId();

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKey);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKey);
        };
    }, [onClose]);

    return (
        <div onClick={onClose} className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/40 sm:items-center sm:p-4">
            <div
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className={`max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-[0_8px_30px_-15px_rgba(20,20,31,0.3)] sm:rounded-3xl md:p-8 ${sizeClass[size] || sizeClass.md}`}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h2 id={titleId} className="break-words font-display text-xl font-bold text-ink">{title}</h2>
                        {subtitle && <p className="mt-1 text-sm text-ink/60">{subtitle}</p>}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl text-ink/60 transition-colors hover:bg-black/5"
                        aria-label="Close"
                    >
                        <FiX />
                    </button>
                </div>
                <div className="mt-6">{children}</div>
            </div>
        </div>
    );
};

export default Modal;
