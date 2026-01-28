
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ComparisonView from './pages/ComparisonView';
import CreateComparison from './pages/CreateComparison';
import { ComparisonSession } from './types';
import { INITIAL_COMPARISONS } from './constants';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ComparisonSession[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('insurance_comparisons_v2');
    if (saved) {
      setSessions(JSON.parse(saved));
    } else {
      setSessions(INITIAL_COMPARISONS);
    }
  }, []);

  const addSession = (session: ComparisonSession) => {
    const updated = [session, ...sessions];
    setSessions(updated);
    localStorage.setItem('insurance_comparisons_v2', JSON.stringify(updated));
  };

  const updateSession = (session: ComparisonSession) => {
    const updated = sessions.map(s => s.id === session.id ? session : s);
    setSessions(updated);
    localStorage.setItem('insurance_comparisons_v2', JSON.stringify(updated));
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col print:bg-white">
        {/* Navigation Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50 print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-slate-900 p-2 rounded-lg group-hover:bg-blue-600 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter">InsureCompare<span className="text-blue-600 italic">Pro</span></h1>
            </Link>
            <nav className="flex gap-4">
              <Link to="/" className="text-sm font-bold text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md transition-colors uppercase tracking-widest">Dashboard</Link>
              <Link to="/create" className="bg-blue-600 text-white text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-lg hover:bg-blue-700 shadow-md transition-all flex items-center gap-2">
                New Report
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard sessions={sessions} />} />
            <Route path="/view/:id" element={<ComparisonView sessions={sessions} onUpdate={updateSession} />} />
            <Route path="/create" element={<CreateComparison onSave={addSession} />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-slate-200 py-8 print:hidden">
          <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            &copy; {new Date().getFullYear()} InsureComparePro &bull; Powered by Gemini AI
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
