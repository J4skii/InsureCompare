
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ComparisonSession, BenefitCategory, BenefitItem } from '../types';
import { Icons } from '../constants';

interface ComparisonViewProps {
  sessions: ComparisonSession[];
  onUpdate: (session: ComparisonSession) => void;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ sessions, onUpdate }) => {
  const { id } = useParams<{ id: string }>();
  const initialSession = sessions.find(s => s.id === id);
  const [session, setSession] = useState<ComparisonSession | undefined>(initialSession);
  const [isEditing, setIsEditing] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setSession(sessions.find(s => s.id === id));
  }, [id, sessions]);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">Comparison not found</h2>
        <Link to="/" className="mt-4 text-blue-600 hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  const handleFieldChange = (key: string, value: any) => {
    const updated = { ...session, [key]: value };
    setSession(updated);
    onUpdate(updated);
  };

  const handleProfileChange = (key: string, value: string) => {
    const updated = { 
      ...session, 
      clientProfile: { ...session.clientProfile, [key]: value } 
    };
    setSession(updated);
    onUpdate(updated);
  };

  const handleBenefitChange = (catIdx: number, itemIdx: number, key: 'valueA' | 'valueB' | 'label', value: string) => {
    const newCategories = [...session.categories];
    newCategories[catIdx].items[itemIdx][key] = value;
    const updated = { ...session, categories: newCategories };
    setSession(updated);
    onUpdate(updated);
  };

  const handleAddRow = (catIdx: number) => {
    const newCategories = [...session.categories];
    newCategories[catIdx].items.push({ label: 'New Benefit', valueA: '', valueB: '' });
    const updated = { ...session, categories: newCategories };
    setSession(updated);
    onUpdate(updated);
  };

  const handleRemoveRow = (catIdx: number, itemIdx: number) => {
    const newCategories = [...session.categories];
    newCategories[catIdx].items.splice(itemIdx, 1);
    const updated = { ...session, categories: newCategories };
    setSession(updated);
    onUpdate(updated);
  };

  const handleAddCategory = () => {
    const newCategories = [...session.categories];
    newCategories.push({
      title: 'New Benefit Section',
      items: [{ label: 'Benefit Item', valueA: '', valueB: '' }]
    });
    const updated = { ...session, categories: newCategories };
    setSession(updated);
    onUpdate(updated);
  };

  const handleRemoveCategory = (catIdx: number) => {
    if (!window.confirm("Are you sure you want to delete this entire section?")) return;
    const newCategories = [...session.categories];
    newCategories.splice(catIdx, 1);
    const updated = { ...session, categories: newCategories };
    setSession(updated);
    onUpdate(updated);
  };

  const handleCategoryTitleChange = (catIdx: number, value: string) => {
    const newCategories = [...session.categories];
    newCategories[catIdx].title = value;
    const updated = { ...session, categories: newCategories };
    setSession(updated);
    onUpdate(updated);
  };

  const printReport = () => {
    setExporting(true);
    // Short delay to ensure any state-based styles update if needed
    setTimeout(() => {
      window.print();
      setExporting(false);
    }, 100);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 print:p-0 print:max-w-none print:m-0">
      {/* Action Header */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <Link to="/" className="inline-flex items-center text-slate-500 hover:text-blue-600 transition-colors">
          <Icons.ArrowLeft />
          <span className="ml-2 font-medium">Back to Dashboard</span>
        </Link>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isEditing ? 'bg-green-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            <Icons.Edit />
            {isEditing ? 'Save Changes' : 'Admin Edit Mode'}
          </button>
          <button 
            onClick={printReport}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-sm transition-all ${exporting ? 'bg-slate-400 cursor-wait' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
          >
            <Icons.Printer />
            {exporting ? 'Preparing PDF...' : 'Export to PDF'}
          </button>
        </div>
      </div>

      {/* Report Notification (Web Only) */}
      {isEditing && (
        <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl flex items-center gap-3 print:hidden">
          <Icons.Sparkles />
          <span className="text-sm font-medium">You are currently in <strong>Admin Edit Mode</strong>. You can add/remove rows and sections below. Click "Save Changes" when done.</span>
        </div>
      )}

      {/* Main Report Document */}
      <div id="report-container" className="bg-white print:shadow-none shadow-xl border border-slate-200 print:border-0 rounded-2xl print:rounded-none overflow-hidden mb-12 print:mb-0">
        {/* Gold Standard Header */}
        <div className="p-8 border-b-4 border-slate-900 flex justify-between items-start print:p-6 print:pb-4 print:border-b-2">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-100 flex items-center justify-center font-black text-2xl border-4 border-slate-800 text-slate-800 print:w-12 print:h-12 print:text-xl print:border-2">
              PR
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-slate-900 print:text-2xl">PRAETO</h1>
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500 print:text-[8px]">Risk and Insurance Management Solutions</p>
              <p className="text-[9px] font-medium text-slate-400 mt-1 italic print:text-[7px]">EST 1998 — Insurance is our business.</p>
            </div>
          </div>
          <div className="flex gap-4 items-center print:gap-2">
            <div className="border-2 border-amber-600 rounded-full w-14 h-14 flex flex-col items-center justify-center text-amber-800 leading-tight print:w-10 print:h-10 print:border">
              <span className="text-[8px] font-bold print:text-[6px]">FSP</span>
              <span className="text-xs font-black print:text-[10px]">1457</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-3 py-1 rounded text-[8px] font-bold text-slate-400 uppercase tracking-widest print:text-[6px] print:px-1">FIA Member</div>
            <div className="bg-slate-50 border border-slate-200 px-3 py-1 rounded text-[8px] font-bold text-slate-400 uppercase tracking-widest print:text-[6px] print:px-1">RMOSA</div>
          </div>
        </div>

        {/* Title and Intro */}
        <div className="p-8 bg-slate-50/50 print:p-6 print:bg-white print:border-b">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 border-b-2 border-slate-200 pb-2 inline-block print:text-xl">
            {session.type} Comparison – {isEditing ? (
              <input className="bg-white border px-2 py-0.5 rounded outline-none ring-2 ring-blue-200" value={session.providerAPlan} onChange={(e) => handleFieldChange('providerAPlan', e.target.value)} />
            ) : session.providerAPlan} vs {isEditing ? (
              <input className="bg-white border px-2 py-0.5 rounded outline-none ring-2 ring-blue-200" value={session.providerBPlan} onChange={(e) => handleFieldChange('providerBPlan', e.target.value)} />
            ) : session.providerBPlan}
          </h2>
          <div className="mt-4 text-blue-700 font-medium text-sm print:text-xs">
            {session.type} Comparison for {isEditing ? (
              <input 
                className="bg-white border px-2 py-0.5 rounded outline-none font-bold ring-2 ring-blue-200" 
                value={session.clientProfile.memberName}
                onChange={(e) => handleProfileChange('memberName', e.target.value)}
              />
            ) : session.clientProfile.memberName} ({session.clientProfile.familyComposition})
          </div>
          <p className="text-sm text-slate-500 mt-2 max-w-3xl leading-relaxed print:text-xs">
            This document provides a summary comparison of the {new Date().getFullYear()} {session.type.toLowerCase()} options. We encourage you to please refer to the underwriters brochure for a detailed explanation.
          </p>
          <div className="mt-4 inline-block bg-red-600 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider print:text-[10px] print:px-2">
            Benefits are applicable to full underwriting.
          </div>
        </div>

        {/* Client Profile Section */}
        <div className="px-8 pb-8 print:px-6 print:pb-4">
          <div className="bg-white border-2 border-blue-600/20 rounded-xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6 shadow-sm print:rounded-none print:border print:p-4 print:gap-4">
            <ProfileItem 
              label="Family Composition" 
              value={session.clientProfile.familyComposition} 
              isEditing={isEditing} 
              onEdit={(v) => handleProfileChange('familyComposition', v)}
            />
            <ProfileItem 
              label="Income Bracket" 
              value={session.clientProfile.incomeBracket} 
              isEditing={isEditing} 
              onEdit={(v) => handleProfileChange('incomeBracket', v)}
            />
            <ProfileItem 
              label="Region" 
              value={session.clientProfile.region} 
              isEditing={isEditing} 
              onEdit={(v) => handleProfileChange('region', v)}
            />
            <ProfileItem 
              label="Primary Priority" 
              value={session.clientProfile.primaryPriority} 
              isEditing={isEditing} 
              onEdit={(v) => handleProfileChange('primaryPriority', v)}
            />
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="px-8 pb-12 space-y-8 print:px-6 print:pb-8 print:space-y-4">
          {session.categories.map((cat, catIdx) => (
            <div key={catIdx} className="overflow-hidden rounded-lg border border-slate-200 group/cat print:rounded-none print:border-slate-300 print:break-inside-avoid">
              <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between print:px-3 print:py-1">
                <div className="flex items-center gap-2">
                  <Icons.Shield />
                  {isEditing ? (
                    <input 
                      className="bg-blue-700/50 text-white font-bold uppercase tracking-widest text-sm px-2 py-1 rounded border border-white/40 outline-none" 
                      value={cat.title} 
                      onChange={(e) => handleCategoryTitleChange(catIdx, e.target.value)}
                    />
                  ) : (
                    <h3 className="font-bold uppercase tracking-widest text-sm print:text-xs">{cat.title}</h3>
                  )}
                </div>
                {isEditing && (
                  <button 
                    onClick={() => handleRemoveCategory(catIdx)}
                    className="text-[10px] font-black uppercase bg-red-500/80 px-2 py-1 rounded hover:bg-red-600 transition-colors print:hidden"
                  >
                    Remove Section
                  </button>
                )}
              </div>
              <table className="w-full text-sm print:text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 print:bg-slate-100">
                    <th className="p-3 text-left w-1/4 print:p-2">Benefit Benefit</th>
                    <th className="p-3 text-center border-x border-slate-200 bg-blue-50/50 font-bold uppercase tracking-tight text-[11px] print:p-2 print:text-[9px] print:border-slate-300">
                      {session.providerAPlan}
                    </th>
                    <th className="p-3 text-center font-bold uppercase tracking-tight text-[11px] print:p-2 print:text-[9px]">
                      {session.providerBPlan}
                    </th>
                    {isEditing && <th className="p-3 w-10 bg-slate-200/50 print:hidden"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                  {cat.items.map((item, itemIdx) => (
                    <tr key={itemIdx} className="hover:bg-slate-50 transition-colors group/row print:break-inside-avoid">
                      <td className="p-3 font-semibold text-slate-700 bg-slate-50/30 print:p-2 print:bg-slate-50/50">
                        {isEditing ? (
                          <input className="w-full bg-white border border-blue-100 px-2 py-1 rounded font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-200" value={item.label} onChange={(e) => handleBenefitChange(catIdx, itemIdx, 'label', e.target.value)} />
                        ) : item.label}
                      </td>
                      <td className="p-3 text-center border-x border-slate-100 whitespace-pre-wrap leading-relaxed print:p-2 print:border-slate-200">
                        {isEditing ? (
                          <textarea className="w-full bg-white border border-blue-100 px-2 py-1 rounded min-h-[60px] text-xs outline-none focus:ring-2 focus:ring-blue-200" value={item.valueA} onChange={(e) => handleBenefitChange(catIdx, itemIdx, 'valueA', e.target.value)} />
                        ) : item.valueA}
                      </td>
                      <td className="p-3 text-center whitespace-pre-wrap leading-relaxed print:p-2">
                        {isEditing ? (
                          <textarea className="w-full bg-white border border-blue-100 px-2 py-1 rounded min-h-[60px] text-xs outline-none focus:ring-2 focus:ring-blue-200" value={item.valueB} onChange={(e) => handleBenefitChange(catIdx, itemIdx, 'valueB', e.target.value)} />
                        ) : item.valueB}
                      </td>
                      {isEditing && (
                        <td className="p-2 text-center bg-slate-50 print:hidden">
                          <button 
                            onClick={() => handleRemoveRow(catIdx, itemIdx)}
                            className="p-1.5 text-red-400 hover:text-red-600 transition-colors"
                            title="Remove Row"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {isEditing && (
                    <tr className="print:hidden">
                      <td colSpan={4} className="p-2 bg-slate-50 border-t border-slate-200">
                        <button 
                          onClick={() => handleAddRow(catIdx)}
                          className="w-full py-2 text-blue-600 font-bold text-xs uppercase tracking-widest hover:bg-blue-100/50 rounded-lg flex items-center justify-center gap-2 border-2 border-dashed border-blue-200 transition-colors"
                        >
                          <Icons.Plus />
                          Add Row to {cat.title}
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ))}

          {isEditing && (
            <div className="flex justify-center pt-4 print:hidden">
              <button 
                onClick={handleAddCategory}
                className="bg-white text-slate-800 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center gap-3 transition-all shadow-sm"
              >
                <div className="bg-slate-900 text-white p-1 rounded-full"><Icons.Plus /></div>
                Add New Comparison Section
              </button>
            </div>
          )}
        </div>

        {/* Corporate Footer */}
        <div className="bg-black text-white p-8 print:p-6 text-[10px] text-center leading-loose print:text-[8px] print:bg-black print:text-white print:mt-auto">
          <p className="font-bold opacity-80 mb-2 uppercase tracking-[0.3em] print:opacity-100">Corporate Headquarters & Contact Information</p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-1 opacity-60 italic print:opacity-90">
            <span>Head Office: 1 Mirka, 63 Eight Avenue, Windermere, Durban, 4001</span>
            <span>Mpumalanga Region: 3 Jones Street, Nelspruit, 1200</span>
            <span>Tel: 031 205 0384 / 031 945 2031</span>
            <span>Email: info@praeto.co.za</span>
            <span>Web: www.praeto.co.za</span>
          </div>
          <p className="mt-4 font-mono opacity-40 print:opacity-70">Reg. No. CK2003 / 049530 / 23 – CMS ORG3620 – FSB 1457</p>
        </div>
      </div>

      <style>{`
        @media print {
          @page { 
            size: A4;
            margin: 0cm; 
          }
          body { 
            background-color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden { display: none !important; }
          header, footer { display: none !important; }
          main { padding: 0 !important; }
          .max-w-7xl { 
            max-width: 100% !important; 
            margin: 0 !important; 
            width: 100% !important; 
          }
          #report-container {
            border: none !important;
            box-shadow: none !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border-radius: 0 !important;
          }
          /* Force standard colors in print */
          .bg-blue-600 { background-color: #2563eb !important; color: white !important; }
          .bg-black { background-color: #000000 !important; color: white !important; }
          .bg-red-600 { background-color: #dc2626 !important; color: white !important; }
          .bg-slate-100 { background-color: #f1f5f9 !important; }
          .bg-slate-50 { background-color: #f8fafc !important; }
          .bg-blue-50\\/50 { background-color: #eff6ff !important; }
          .text-white { color: white !important; }
          .text-blue-700 { color: #1d4ed8 !important; }
          .text-slate-900 { color: #0f172a !important; }
          
          tr { page-break-inside: avoid !important; }
          .print\\:break-inside-avoid { break-inside: avoid !important; }
        }
      `}</style>
    </div>
  );
};

const ProfileItem: React.FC<{ label: string; value: string; isEditing: boolean; onEdit: (v: string) => void }> = ({ label, value, isEditing, onEdit }) => (
  <div className="flex flex-col">
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 print:text-[7px]">{label}</span>
    {isEditing ? (
      <input className="text-sm font-bold text-slate-800 border border-blue-100 px-2 py-1 rounded focus:ring-2 focus:ring-blue-200 outline-none" value={value} onChange={(e) => onEdit(e.target.value)} />
    ) : (
      <span className="text-sm font-bold text-slate-800 print:text-xs">{value}</span>
    )}
  </div>
);

export default ComparisonView;
