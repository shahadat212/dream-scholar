import React from 'react';

const DataTable = ({ columns, rows, rowKey = '_id' }) => {
    return (
        <div className="xl:overflow-hidden xl:rounded-3xl xl:bg-white xl:shadow-[0_8px_30px_-15px_rgba(20,20,31,0.2)]">
            <table className="block w-full text-left text-sm xl:table">
                <thead className="hidden xl:table-header-group">
                    <tr className="border-b border-black/5">
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                scope="col"
                                className={`whitespace-nowrap px-5 py-4 text-[11px] font-bold uppercase tracking-wide text-ink/40 ${column.align === 'right' ? 'text-right' : ''}`}
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="grid gap-4 md:grid-cols-2 xl:table-row-group">
                    {rows.map((row, index) => (
                        <tr
                            key={row?.[rowKey] ?? index}
                            className="flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-[0_8px_30px_-15px_rgba(20,20,31,0.2)] transition-colors xl:table-row xl:rounded-none xl:border-b xl:border-black/5 xl:bg-transparent xl:p-0 xl:shadow-none xl:last:border-b-0 xl:hover:bg-cream"
                        >
                            {columns.map((column) => {
                                const content = column.render ? column.render(row, index) : row?.[column.key];

                                if (column.primary) {
                                    return (
                                        <td key={column.key} className="block min-w-0 xl:table-cell xl:px-5 xl:py-4 xl:align-middle">
                                            {content}
                                        </td>
                                    );
                                }

                                if (column.actions) {
                                    return (
                                        <td key={column.key} className={`mt-1 block border-t border-black/5 pt-4 xl:mt-0 xl:table-cell xl:border-0 xl:px-5 xl:py-4 xl:align-middle ${column.align === 'right' ? 'xl:text-right' : ''}`}>
                                            {content}
                                        </td>
                                    );
                                }

                                return (
                                    <td key={column.key} className={`flex items-start justify-between gap-4 xl:table-cell xl:px-5 xl:py-4 xl:align-middle ${column.align === 'right' ? 'xl:text-right' : ''}`}>
                                        <span className="shrink-0 text-xs font-semibold text-ink/40 xl:hidden">{column.label}</span>
                                        <div className={`min-w-0 text-right ${column.align === 'right' ? '' : 'xl:text-left'}`}>{content}</div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;
