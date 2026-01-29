import React, { useEffect, useState } from 'react';
import { AdminUser } from '../types';
import { inviteAdmin, listAdmins, removeAdmin } from '../services/supabaseService';

interface AdminManagementProps {
  currentAdmin: AdminUser;
}

const AdminManagement: React.FC<AdminManagementProps> = ({ currentAdmin }) => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadAdmins = async () => {
    const data = await listAdmins();
    setAdmins(data);
  };

  useEffect(() => {
    loadAdmins().catch((error) => {
      console.error('Failed to load admins', error);
    });
  }, []);

  const handleInvite = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setStatus(null);
    try {
      await inviteAdmin(email.trim());
      setEmail('');
      setStatus('Invite sent successfully.');
      await loadAdmins();
    } catch (error) {
      console.error('Failed to invite admin', error);
      setStatus('Unable to invite admin.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (adminId: string) => {
    if (adminId === currentAdmin.id) {
      setStatus('You cannot remove your own admin account.');
      return;
    }
    if (!window.confirm('Remove this admin?')) return;
    setLoading(true);
    setStatus(null);
    try {
      await removeAdmin(adminId);
      setStatus('Admin removed.');
      await loadAdmins();
    } catch (error) {
      console.error('Failed to remove admin', error);
      setStatus('Unable to remove admin.');
    } finally {
      setLoading(false);
    }
  };

  const isSuperAdmin = currentAdmin.role === 'super_admin';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Admin Management</h2>
        <p className="text-slate-500">Invite new administrators and manage access.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Current Admins</h3>
          <div className="space-y-3">
            {admins.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{admin.email}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-widest">{admin.role}</p>
                </div>
                {isSuperAdmin && (
                  <button
                    onClick={() => handleRemove(admin.id)}
                    className="text-xs font-bold uppercase text-red-600 hover:text-red-700"
                    disabled={loading}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {admins.length === 0 && (
              <p className="text-sm text-slate-500">No admins found.</p>
            )}
          </div>
        </div>

        {isSuperAdmin ? (
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Invite New Admin</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@example.com"
                className="flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none text-sm"
              />
              <button
                onClick={handleInvite}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all disabled:opacity-60"
              >
                Send Invite
              </button>
            </div>
            {status && <p className="text-sm text-slate-500">{status}</p>}
          </div>
        ) : (
          <div className="border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-500">Only super-admins can invite or remove admins.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManagement;
