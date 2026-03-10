
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ComparisonView from './pages/ComparisonView';
import CreateComparison from './pages/CreateComparison';
import Clients from './pages/Clients';
import AuditLogs from './pages/AuditLogs';
import { ComparisonSession } from './types';
import { dataLayer } from './lib/data-layer';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ComparisonSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      await dataLayer.init();
      const initialSessions = await dataLayer.getSessions();
      setSessions(initialSessions);
      setIsLoading(false);
    };
    initData();
  }, []);

  const addSession = async (session: ComparisonSession) => {
    const success = await dataLayer.addSession(session);
    if (success) {
      const updated = await dataLayer.getSessions();
      setSessions(updated);
    }
  };

  const updateSession = async (session: ComparisonSession) => {
    const success = await dataLayer.updateSession(session);
    if (success) {
      const updated = await dataLayer.getSessions();
      setSessions(updated);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-[#C5A059] font-black uppercase tracking-[0.3em] animate-pulse">
          Loading Praeto Portal...
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col print:bg-white">
        {/* Corporate Navigation Header */}
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
              <Link to="/clients" className="text-[11px] font-black text-white/70 hover:text-[#C5A059] transition-colors uppercase tracking-[0.2em]">Clients</Link>
              <Link to="/audit" className="text-[11px] font-black text-white/70 hover:text-[#C5A059] transition-colors uppercase tracking-[0.2em]">Audit Logs</Link>
              <Link to="/create" className="bg-[#C5A059] text-white text-[11px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-xl hover:bg-[#b08e4d] shadow-lg transition-all flex items-center gap-2">
                Create Comparison
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard sessions={sessions} />} />
            <Route path="/view/:id" element={<ComparisonView sessions={sessions} onUpdate={updateSession} />} />
            <Route path="/create" element={<CreateComparison onSave={addSession} />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/audit" element={<AuditLogs />} />
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
