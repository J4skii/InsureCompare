import React, { useEffect, useState } from 'react';
import { AuditLogEntry } from '../types';
import { fetchAuditLogs } from '../services/supabaseService';

const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs()
      .then((data) => setLogs(data))
      .catch((error) => {
        console.error('Failed to load audit logs', error);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Audit Trail</h2>
        <p className="text-slate-500">All admin actions are logged for accountability.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-slate-500">Loading audit history...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-widest">
              <tr>
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-left">Actor</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Action</th>
                <th className="px-4 py-3 text-left">Target</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">{log.actorEmail ?? 'Unknown'}</td>
                  <td className="px-4 py-3 uppercase text-xs text-slate-500">{log.actorRole ?? 'N/A'}</td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{log.action}</td>
                  <td className="px-4 py-3">{log.targetType}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500" colSpan={5}>
                    No audit log entries yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AuditLog;
