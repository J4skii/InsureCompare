import React, { useState, useEffect } from 'react';
import { dataLayer } from '../lib/data-layer';
import { Icons } from '../constants';

interface AuditLogEntry {
    id: string;
    action: string;
    created_at: string;
    user_id?: string;
    session_id?: string;
    client_id?: string;
    old_data?: Record<string, unknown>;
    new_data?: Record<string, unknown>;
}

const AuditLogs: React.FC = () => {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const auditLogs = await dataLayer.getAuditLogs();
            setLogs(auditLogs as AuditLogEntry[]);
        } catch (error) {
            console.error('Error loading audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action: string) => {
        if (action.includes('create')) return 'bg-green-100 text-green-700';
        if (action.includes('update')) return 'bg-blue-100 text-blue-700';
        if (action.includes('delete')) return 'bg-red-100 text-red-700';
        return 'bg-slate-100 text-slate-700';
    };

    const getActionIcon = (action: string) => {
        if (action.includes('create')) return '➕';
        if (action.includes('update')) return '✏️';
        if (action.includes('delete')) return '🗑️';
        return '📋';
    };

    const filteredLogs = filter === 'all'
        ? logs
        : logs.filter((log) => log.action.includes(filter));

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-ZA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Audit Trail</h2>
                    <p className="text-slate-500">Track all changes made to comparisons and clients</p>
                </div>
                <button
                    onClick={loadLogs}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                    <Icons.ArrowLeft />
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
                {['all', 'create', 'update', 'delete'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${filter === f
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        {f === 'all' ? 'All Actions' : f}
                    </button>
                ))}
            </div>

            {/* Audit Log Table */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                </div>
            ) : filteredLogs.length === 0 ? (
                <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-12 text-center">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icons.FileText />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">No audit logs found</h3>
                    <p className="text-slate-500">
                        Actions will appear here once you start using the system with Supabase.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Action
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Details
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Timestamp
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Changes
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{getActionIcon(log.action)}</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                                                {log.action.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-600">
                                            {log.session_id && <div>Session: {log.session_id.slice(0, 8)}...</div>}
                                            {log.client_id && <div>Client: {log.client_id.slice(0, 8)}...</div>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {formatDate(log.created_at)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            className="text-blue-600 text-sm hover:underline"
                                            onClick={() => {
                                                // Could expand to show detailed changes
                                                console.log('Show changes:', log.old_data, log.new_data);
                                            }}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AuditLogs;
