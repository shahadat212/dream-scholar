import React from 'react';
import { FiDownload } from 'react-icons/fi';
import Swal from 'sweetalert2';

const escapeCell = (value) => {
    if (value === undefined || value === null) return '';
    const text = String(value);
    const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
    return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

const ExportCsvButton = ({ rows, columns, filename, label = 'Export CSV' }) => {
    const handleExport = () => {
        try {
            const header = columns.map((column) => escapeCell(column.label)).join(',');
            const lines = rows.map((row) => columns.map((column) => escapeCell(column.value(row))).join(','));
            const csv = String.fromCharCode(0xfeff) + [header, ...lines].join('\r\n');
            const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch {
            Swal.fire({ icon: 'error', title: 'Export failed', text: 'Please try again.', confirmButtonColor: '#5B4CFB' });
        }
    };

    return (
        <button
            type="button"
            onClick={handleExport}
            disabled={rows.length === 0}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-xs font-bold text-ink transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
            <FiDownload /> {label}
        </button>
    );
};

export default ExportCsvButton;
