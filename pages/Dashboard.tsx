
import React from 'react';
import { Link } from 'react-router-dom';
import { ComparisonSession, PlanType } from '../types';
import { Icons } from '../constants';

interface DashboardProps {
  sessions: ComparisonSession[];
}

const Dashboard: React.FC<DashboardProps> = ({ sessions }) => {
  const getBadgeColor = (type: PlanType) => {
    switch (type) {
      case PlanType.MEDICAL_AID: return 'bg-blue-100 text-blue-700 border-blue-200';
      case PlanType.HOSPITAL: return 'bg-purple-100 text-purple-700 border-purple-200';
      case PlanType.GAP_COVER: return 'bg-teal-100 text-teal-700 border-teal-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Comparison Management</h2>
        <p className="text-slate-500">View and manage your insurance plan comparisons using the gold standard template.</p>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-12 text-center">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.FileText />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No comparisons found</h3>
          <p className="text-slate-500 mb-6">Start by creating your first side-by-side comparison session.</p>
          <Link to="/create" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all">
            <Icons.Plus />
            Create Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <Link 
              key={session.id} 
              to={`/view/${session.id}`}
              className="group bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-blue-300 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border ${getBadgeColor(session.type)}`}>
                  {session.type}
                </span>
                <span className="text-xs text-slate-400 font-medium">{session.date}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{session.name}</h3>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="font-semibold">Providers:</span>
                  <span>{session.providerAUnderwriter} vs {session.providerBUnderwriter}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="font-semibold">Family:</span>
                  <span className="truncate">{session.clientProfile.familyComposition}</span>
                </div>
              </div>
              <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                View Detailed Comparison
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
