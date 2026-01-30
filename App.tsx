
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ComparisonView from './pages/ComparisonView';
import CreateComparison from './pages/CreateComparison';
import Login from './pages/Login';
import AdminManagement from './pages/AdminManagement';
import AuditLog from './pages/AuditLog';
import ProtectedRoute from './components/ProtectedRoute';
import { ComparisonSession } from './types';
import {
  createComparisonSession,
  deleteComparisonSession,
  fetchComparisonSessions,
  signOut,
  updateComparisonSession
} from './services/supabaseService';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  const { admin, loading } = useAuth();
  const [sessions, setSessions] = useState<ComparisonSession[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const envConfigured = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

  useEffect(() => {
    if (!envConfigured) {
      setDataLoading(false);
      setDataError('Set Supabase environment variables to load comparisons.');
      return;
    }
    if (!admin) {
      setSessions([]);
      setDataLoading(false);
      return;
    }
    setDataLoading(true);
    fetchComparisonSessions()
      .then((data) => {
        setSessions(data);
        setDataError(null);
      })
      .catch((error) => {
        console.error('Failed to load sessions', error);
        setDataError('Unable to load comparisons.');
      })
      .finally(() => setDataLoading(false));
  }, [admin, envConfigured]);

  const addSession = async (session: ComparisonSession) => {
    const saved = await createComparisonSession(session);
    setSessions(prev => [saved, ...prev]);
  };

  const updateSession = async (session: ComparisonSession) => {
    const saved = await updateComparisonSession(session);
    setSessions(prev => prev.map(s => s.id === saved.id ? saved : s));
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!window.confirm('Delete this comparison?')) return;
    try {
      await deleteComparisonSession(sessionId);
      setSessions(prev => prev.filter(session => session.id !== sessionId));
    } catch (error) {
      console.error('Failed to delete comparison', error);
      alert('Unable to delete comparison right now.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out', error);
      alert('Unable to sign out right now.');
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col print:bg-white">
        {/* Corporate Navigation Header */}
        {admin && (
          <header className="bg-[#1a1a1a] border-b-4 border-[#C5A059] sticky top-0 z-50 print:hidden shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3 group">
                <img
                  src="/praeto-logo-v3.png"
                  alt="Praeto Portal"
                  className="h-14 w-auto object-contain"
                />
              </Link>
              <nav className="flex items-center gap-6">
                <Link to="/" className="text-[11px] font-black text-white/70 hover:text-[#C5A059] transition-colors uppercase tracking-[0.2em]">Dashboard</Link>
                <Link to="/create" className="bg-[#C5A059] text-white text-[11px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-xl hover:bg-[#b08e4d] shadow-lg transition-all flex items-center gap-2">
                  Create Comparison
                </Link>
                <Link to="/admins" className="text-[11px] font-black text-white/70 hover:text-[#C5A059] transition-colors uppercase tracking-[0.2em]">Admins</Link>
                <Link to="/audit" className="text-[11px] font-black text-white/70 hover:text-[#C5A059] transition-colors uppercase tracking-[0.2em]">Audit Trail</Link>
                <button
                  onClick={handleSignOut}
                  className="text-[11px] font-black text-white/70 hover:text-[#C5A059] transition-colors uppercase tracking-[0.2em]"
                >
                  Sign Out
                </button>
              </nav>
            </div>
          </header>
        )}

        <main className="flex-1">
          {admin && dataLoading && (
            <div className="max-w-5xl mx-auto px-4 py-12 text-sm text-slate-500">Loading comparisons...</div>
          )}
          {admin && dataError && (
            <div className="max-w-5xl mx-auto px-4 py-12 text-sm text-red-600">{dataError}</div>
          )}
          <Routes>
            <Route path="/login" element={admin ? <Navigate to="/" replace /> : <Login />} />
            <Route
              path="/"
              element={
                envConfigured ? (
                  <ProtectedRoute admin={admin} loading={loading}>
                    <Dashboard sessions={sessions} onDelete={handleDeleteSession} />
                  </ProtectedRoute>
                ) : (
                  <div className="max-w-5xl mx-auto px-4 py-12 text-sm text-slate-500">
                    Configure Supabase environment variables to enable the admin dashboard.
                  </div>
                )
              }
            />
            <Route
              path="/view/:id"
              element={
                <ProtectedRoute admin={admin} loading={loading}>
                  <ComparisonView sessions={sessions} onUpdate={updateSession} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create"
              element={
                <ProtectedRoute admin={admin} loading={loading}>
                  <CreateComparison onSave={addSession} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admins"
              element={
                <ProtectedRoute admin={admin} loading={loading}>
                  {admin ? <AdminManagement currentAdmin={admin} /> : null}
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit"
              element={
                <ProtectedRoute admin={admin} loading={loading}>
                  <AuditLog />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        <footer className="bg-white border-t border-slate-200 py-10 print:hidden">
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-slate-300">
              <div className="w-8 h-px bg-slate-200"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.5em]">Praeto Insurance Management</span>
              <div className="w-8 h-px bg-slate-200"></div>
            </div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              &copy; {new Date().getFullYear()} Praeto Financial Services &bull; FSP 1457 &bull; Licensed Financial Services Provider
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
