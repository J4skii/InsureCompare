
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
        {/* Corporate Navigation Header */}
        <header className="bg-[#1a1a1a] border-b-4 border-[#C5A059] sticky top-0 z-50 print:hidden shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative w-8 h-10 flex flex-col justify-between items-center group-hover:scale-105 transition-transform">
                 <div className="w-full h-1 bg-[#C5A059] rounded-sm"></div>
                 <div className="flex gap-0.5 flex-1">
                   <div className="w-1 h-full bg-[#C5A059] opacity-40"></div>
                   <div className="w-1.5 h-full bg-[#C5A059]"></div>
                   <div className="w-1 h-full bg-[#C5A059] opacity-40"></div>
                 </div>
                 <div className="w-full h-1 bg-[#C5A059] rounded-sm"></div>
                 <div className="absolute top-0 right-[-10px] w-10 h-6 border-[6px] border-l-0 border-[#C5A059] rounded-r-full"></div>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tighter ml-3">PRAETO<span className="text-[#C5A059] italic ml-1 font-light tracking-widest text-lg uppercase">Portal</span></h1>
            </Link>
            <nav className="flex items-center gap-6">
              <Link to="/" className="text-[11px] font-black text-white/70 hover:text-[#C5A059] transition-colors uppercase tracking-[0.2em]">Dashboard</Link>
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
