
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ComparisonSession, BenefitCategory, BenefitItem, Provider } from '../types';
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

  const handleUpdate = (updated: ComparisonSession) => {
    setSession(updated);
    onUpdate(updated);
  };

  const handleProfileChange = (key: string, value: string) => {
    handleUpdate({ 
      ...session, 
      clientProfile: { ...session.clientProfile, [key]: value } 
    });
  };

  const handleProviderChange = (idx: number, key: keyof Provider, value: string) => {
    const newProviders = [...session.providers];
    newProviders[idx] = { ...newProviders[idx], [key]: value };
    handleUpdate({ ...session, providers: newProviders });
  };

  const handleAddProvider = () => {
    const newProviders = [...session.providers, { underwriter: 'New Provider', plan: 'New Plan' }];
    const newCategories = session.categories.map(cat => ({
      ...cat,
      items: cat.items.map(item => ({
        ...item,
        values: [...item.values, '']
      }))
    }));
    handleUpdate({ ...session, providers: newProviders, categories: newCategories });
  };

  const handleRemoveProvider = (idx: number) => {
    if (session.providers.length <= 1) return;
    const newProviders = [...session.providers];
    newProviders.splice(idx, 1);
    const newCategories = session.categories.map(cat => ({
      ...cat,
      items: cat.items.map(item => {
        const newValues = [...item.values];
        newValues.splice(idx, 1);
        return { ...item, values: newValues };
      })
    }));
    handleUpdate({ ...session, providers: newProviders, categories: newCategories });
  };

  const handleBenefitLabelChange = (catIdx: number, itemIdx: number, value: string) => {
    const newCategories = [...session.categories];
    newCategories[catIdx].items[itemIdx].label = value;
    handleUpdate({ ...session, categories: newCategories });
  };

  const handleBenefitValueChange = (catIdx: number, itemIdx: number, providerIdx: number, value: string) => {
    const newCategories = [...session.categories];
    newCategories[catIdx].items[itemIdx].values[providerIdx] = value;
    handleUpdate({ ...session, categories: newCategories });
  };

  const handleAddRow = (catIdx: number) => {
    const newCategories = [...session.categories];
    newCategories[catIdx].items.push({ 
      label: 'New Benefit', 
      values: Array(session.providers.length).fill('') 
    });
    handleUpdate({ ...session, categories: newCategories });
  };

  const handleRemoveRow = (catIdx: number, itemIdx: number) => {
    const newCategories = [...session.categories];
    newCategories[catIdx].items.splice(itemIdx, 1);
    handleUpdate({ ...session, categories: newCategories });
  };

  const handleAddCategory = () => {
    const newCategories = [...session.categories, {
      title: 'New Benefit Section',
      items: [{ label: 'Benefit Item', values: Array(session.providers.length).fill('') }]
    }];
    handleUpdate({ ...session, categories: newCategories });
  };

  const handleRemoveCategory = (catIdx: number) => {
    if (!window.confirm("Are you sure you want to delete this entire section?")) return;
    const newCategories = [...session.categories];
    newCategories.splice(catIdx, 1);
    handleUpdate({ ...session, categories: newCategories });
  };

  const handleCategoryTitleChange = (catIdx: number, value: string) => {
    const newCategories = [...session.categories];
    newCategories[catIdx].title = value;
    handleUpdate({ ...session, categories: newCategories });
  };

  const printReport = () => {
    setExporting(true);
    setTimeout(() => {
      window.print();
      setExporting(false);
    }, 100);
  };

  const isMultiProvider = session.providers.length > 2;

  return (
    <div className={`mx-auto px-4 py-8 print:p-0 print:m-0 ${isMultiProvider ? 'max-w-none' : 'max-w-7xl'}`}>
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
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-sm transition-all ${exporting ? 'bg-slate-400 cursor-wait' : 'bg-[#C5A059] text-white hover:bg-[#b08e4d]'}`}
          >
            <Icons.Printer />
            {exporting ? 'Preparing PDF...' : 'Export to PDF'}
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <Icons.Sparkles />
            <span className="text-sm font-medium">Admin Mode: Add companies, edit benefits, or restructure rows.</span>
          </div>
          <button 
            onClick={handleAddProvider}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-sm"
          >
            + Add Company Column
          </button>
        </div>
      )}

      {/* Main Report Document */}
      <div id="report-container" className="bg-[#111] print:bg-white print:shadow-none shadow-2xl border border-slate-200 print:border-0 rounded-2xl print:rounded-none overflow-hidden mb-12 print:mb-0 relative">
        
        {/* GOLD STANDARD PRAETO BRANDING BLOCK - EXACT RECREATION */}
        <div className="relative z-10 p-12 text-center bg-[#111] text-[#C5A059] flex flex-col items-center print:bg-[#111] print:text-[#C5A059] print:p-8">
          
          {/* Main Logo Container */}
          <div className="flex items-center justify-center gap-0 mb-2">
            {/* The Stylized Column P */}
            <div className="relative w-20 h-28 flex flex-col justify-between items-center print:w-16 print:h-24">
               {/* Column Capital */}
               <div className="w-full h-2.5 bg-[#C5A059] rounded-sm mb-1.5"></div>
               {/* Column Shaft */}
               <div className="flex gap-1.5 flex-1 w-full justify-center">
                 <div className="w-2.5 h-full bg-[#C5A059] opacity-30"></div>
                 <div className="w-4 h-full bg-[#C5A059]"></div>
                 <div className="w-2.5 h-full bg-[#C5A059] opacity-30"></div>
               </div>
               {/* Column Base */}
               <div className="w-full h-3 bg-[#C5A059] rounded-sm mt-1.5"></div>
               {/* The P arc - accurately positioned */}
               <div className="absolute top-0 left-[60%] w-[120%] h-[60%] border-[14px] border-l-0 border-[#C5A059] rounded-r-full print:border-[10px]"></div>
            </div>
            
            {/* The "RAETO" Text with Inline Style */}
            <div className="relative ml-8 flex items-baseline">
              <h1 className="text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-[#C5A059] relative print:text-6xl">
                RAETO
                {/* Replicating the inline horizontal line detail seen in image */}
                <div className="absolute inset-0 flex flex-col justify-center pointer-events-none px-1">
                  <div className="w-full h-px bg-[#111] opacity-40 mb-2"></div>
                  <div className="w-full h-px bg-[#111] opacity-40"></div>
                </div>
              </h1>
            </div>
          </div>

          {/* Slogan */}
          <h3 className="text-lg font-black uppercase tracking-[0.25em] mb-4 text-white print:text-sm">
            Risk and Insurance Management Solutions
          </h3>
          
          {/* Divider with Date */}
          <div className="flex items-center w-full max-w-2xl gap-4 mb-6">
            <div className="flex-1 h-[3px] bg-[#C5A059]"></div>
            <span className="text-xs font-black uppercase tracking-widest text-[#C5A059] whitespace-nowrap">Est. 1998</span>
            <div className="flex-1 h-[3px] bg-[#C5A059]"></div>
          </div>

          {/* Icon Row - stylized gold icons based on image */}
          <div className="flex items-center justify-center gap-8 mb-8 opacity-90 print:gap-6 print:mb-6">
            <Icons.ChartGold />
            <Icons.FinanceGold />
            <Icons.AgricultureGold />
            <Icons.HomeGold />
            <Icons.FamilyGold />
            <Icons.HealthGold />
          </div>

          {/* Compliance Pill Container */}
          <div className="bg-white rounded-full px-10 py-3 flex items-center gap-10 shadow-xl border border-[#C5A059]/30 print:px-8 print:py-2 print:gap-8">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Proud Member Of</span>
              <div className="flex items-center gap-2">
                 {/* FIA stylized text logo */}
                 <span className="text-2xl font-black text-black italic leading-none lowercase tracking-tighter">fia</span>
                 <div className="w-[1px] h-8 bg-slate-200"></div>
                 <div className="flex flex-col text-[7px] text-slate-500 font-bold uppercase leading-[1.1] text-left">
                   <span>Financial</span>
                   <span>Intermediaries</span>
                   <span>Association</span>
                   <span>Of Southern Africa</span>
                 </div>
              </div>
            </div>
            <div className="w-[1px] h-10 bg-slate-200"></div>
            <div className="flex flex-col items-center justify-center">
               <span className="text-lg font-black text-black tracking-tighter leading-none">FSP 1457</span>
            </div>
          </div>
        </div>

        {/* Comparison Data Section (White Background) */}
        <div className="bg-white relative z-10 min-h-screen">
          {/* Report Metadata */}
          <div className="p-10 border-t-[8px] border-[#C5A059] print:p-6 print:border-t-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight print:text-xl">
                  {session.type} Comparison Report
                </h2>
                <div className="mt-3 inline-flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-lg">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Client Name</span>
                  <span className="text-sm font-black text-[#C5A059] uppercase">{session.clientProfile.memberName}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Generated Date</span>
                <span className="text-sm font-bold text-slate-800">{session.date}</span>
              </div>
            </div>
          </div>

          {/* Profile Context Grid */}
          <div className="px-10 pb-10 print:px-6 print:pb-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8 shadow-sm print:rounded-none print:border print:p-4 print:gap-4 print:bg-white">
              <ProfileItem label="Family Composition" value={session.clientProfile.familyComposition} isEditing={isEditing} onEdit={(v) => handleProfileChange('familyComposition', v)} />
              <ProfileItem label="Income Bracket" value={session.clientProfile.incomeBracket} isEditing={isEditing} onEdit={(v) => handleProfileChange('incomeBracket', v)} />
              <ProfileItem label="Region" value={session.clientProfile.region} isEditing={isEditing} onEdit={(v) => handleProfileChange('region', v)} />
              <ProfileItem label="Primary Priority" value={session.clientProfile.primaryPriority} isEditing={isEditing} onEdit={(v) => handleProfileChange('primaryPriority', v)} />
            </div>
          </div>

          {/* Comparison Grid */}
          <div className="px-10 pb-16 space-y-16 print:px-6 print:pb-10 print:space-y-8">
            {session.categories.map((cat, catIdx) => (
              <div key={catIdx} className="group/cat print:break-inside-avoid">
                {/* Section Header */}
                <div className="bg-[#111] text-white px-6 py-3.5 flex items-center justify-between rounded-t-xl print:rounded-none print:px-4 print:py-2 print:bg-black">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-8 bg-[#C5A059]"></div>
                    {isEditing ? (
                      <input 
                        className="bg-slate-800/80 text-white font-black uppercase tracking-[0.2em] text-sm px-3 py-1.5 rounded border border-white/20 outline-none w-80" 
                        value={cat.title} 
                        onChange={(e) => handleCategoryTitleChange(catIdx, e.target.value)}
                      />
                    ) : (
                      <h3 className="font-black uppercase tracking-[0.2em] text-sm print:text-xs">{cat.title}</h3>
                    )}
                  </div>
                  {isEditing && (
                    <button onClick={() => handleRemoveCategory(catIdx)} className="text-[10px] font-black uppercase bg-red-600 px-3 py-1.5 rounded hover:bg-red-700 transition-colors print:hidden">
                      Delete Section
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto border-x border-b border-slate-200 rounded-b-xl print:border-slate-300 print:rounded-none">
                  <table className="w-full text-sm print:text-[10px] table-fixed border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <th className="p-5 text-left w-72 min-w-[220px] sticky left-0 bg-slate-50 z-10 border-r border-slate-200 font-black uppercase tracking-widest text-[10px] print:p-2">Benefit Summary</th>
                        {session.providers.map((p, pIdx) => (
                          <th key={pIdx} className="p-5 text-center border-r border-slate-200 last:border-r-0 bg-white relative group/th">
                            <div className="flex flex-col gap-1.5">
                              {isEditing ? (
                                <>
                                  <input className="w-full text-center bg-slate-50 border border-slate-200 rounded px-2 py-1.5 font-black text-slate-900 text-[11px] uppercase tracking-tighter" value={p.underwriter} onChange={(e) => handleProviderChange(pIdx, 'underwriter', e.target.value)} />
                                  <input className="w-full text-center bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-[#C5A059] font-black text-[10px] uppercase tracking-widest" value={p.plan} onChange={(e) => handleProviderChange(pIdx, 'plan', e.target.value)} />
                                  <button onClick={() => handleRemoveProvider(pIdx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/th:opacity-100 transition-opacity">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>
                                </>
                              ) : (
                                <>
                                  <span className="font-black text-slate-900 text-xs uppercase tracking-tight">{p.underwriter}</span>
                                  <span className="text-[#C5A059] font-black text-[10px] uppercase tracking-widest">{p.plan}</span>
                                </>
                              )}
                            </div>
                          </th>
                        ))}
                        {isEditing && <th className="p-3 w-14 bg-slate-50 print:hidden"></th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                      {cat.items.map((item, itemIdx) => (
                        <tr key={itemIdx} className="hover:bg-slate-50/50 transition-colors group/row">
                          <td className="p-5 font-black text-slate-800 bg-slate-50 sticky left-0 z-10 border-r border-slate-200 backdrop-blur-sm print:p-2 print:text-[9px]">
                            {isEditing ? (
                              <input className="w-full bg-white border border-slate-200 px-3 py-2 rounded font-bold text-slate-800 outline-none focus:border-[#C5A059]" value={item.label} onChange={(e) => handleBenefitLabelChange(catIdx, itemIdx, e.target.value)} />
                            ) : item.label}
                          </td>
                          {item.values.map((val, pIdx) => (
                            <td key={pIdx} className="p-5 text-center border-r border-slate-100 last:border-r-0 whitespace-pre-wrap leading-relaxed print:p-2 print:text-[9px]">
                              {isEditing ? (
                                <textarea className="w-full bg-white border border-slate-200 px-3 py-2 rounded min-h-[100px] text-xs outline-none focus:border-[#C5A059]" value={val} onChange={(e) => handleBenefitValueChange(catIdx, itemIdx, pIdx, e.target.value)} />
                              ) : val || <span className="text-slate-300 italic">No Benefit Specified</span>}
                            </td>
                          ))}
                          {isEditing && (
                            <td className="p-2 text-center bg-slate-50/50 print:hidden">
                              <button onClick={() => handleRemoveRow(catIdx, itemIdx)} className="p-2 text-red-400 hover:text-red-600 transition-colors">
                                <Icons.Trash />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {isEditing && (
                  <div className="mt-4 flex justify-start print:hidden">
                    <button onClick={() => handleAddRow(catIdx)} className="px-6 py-3 text-[#C5A059] font-black text-xs uppercase tracking-[0.2em] hover:bg-[#C5A059]/10 rounded-xl flex items-center gap-2 border-2 border-dashed border-[#C5A059]/30 transition-all">
                      <Icons.Plus /> Add Benefit Parameter
                    </button>
                  </div>
                )}
              </div>
            ))}

            {isEditing && (
              <div className="flex justify-center pt-12 print:hidden">
                <button onClick={handleAddCategory} className="bg-[#111] text-[#C5A059] border-2 border-[#C5A059] hover:bg-white hover:text-[#111] px-12 py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-sm flex items-center gap-4 transition-all shadow-2xl">
                  <Icons.Plus />
                  Add New Analysis Category
                </button>
              </div>
            )}
          </div>

          {/* Detailed Legal Disclaimer / Corporate Footer */}
          <div className="bg-[#111] text-white p-16 print:p-8 text-center border-t-8 border-[#C5A059] print:bg-black print:text-white">
            <div className="flex items-center justify-center gap-6 mb-10">
               <div className="flex-1 h-px bg-[#C5A059]/40"></div>
               <div className="flex items-center gap-3">
                 <div className="w-8 h-10 bg-[#C5A059]/10 border-2 border-[#C5A059] flex items-center justify-center text-lg font-black text-[#C5A059]">P</div>
                 <span className="font-black uppercase tracking-[0.6em] text-[#C5A059] text-lg">PRAETO</span>
               </div>
               <div className="flex-1 h-px bg-[#C5A059]/40"></div>
            </div>
            
            <p className="font-black text-[#C5A059] mb-8 uppercase tracking-[0.4em] text-xs">Professional Risk Analysis & Management Solutions</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-[10px] text-slate-400 opacity-80 mb-12 print:opacity-100 print:gap-4 print:text-[8px]">
              <div className="flex flex-col gap-2">
                <span className="font-black text-white uppercase text-[11px] mb-1">Corporate Office</span>
                <span>1 Mirka, 63 Eight Avenue, Windermere</span>
                <span>Durban, 4001, South Africa</span>
              </div>
              <div className="flex flex-col gap-2 border-x border-white/10 print:border-none px-6">
                <span className="font-black text-white uppercase text-[11px] mb-1">Regional Presence</span>
                <span>Nelspruit Office: 3 Jones Street</span>
                <span>Nelspruit, 1200</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-black text-white uppercase text-[11px] mb-1">Digital & Support</span>
                <span>Tel: 031 205 0384 / 031 945 2031</span>
                <span>Email: clients@praeto.co.za</span>
              </div>
            </div>
            
            <div className="pt-10 border-t border-white/10 flex flex-col items-center gap-4">
              <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest print:text-[7px]">
                 CMS ORG3620 &bull; Licensed Financial Services Provider FSB 1457 &bull; Proud FIA Member
              </p>
              <div className="bg-slate-900 px-6 py-2 rounded-full text-[9px] font-bold text-[#C5A059] print:bg-transparent">
                PREPARED BY PRAETO FINANCIAL SERVICES - CONFIDENTIAL
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { 
            size: ${isMultiProvider ? 'A4 landscape' : 'A4 portrait'};
            margin: 0; 
          }
          body { 
            background-color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden { display: none !important; }
          #report-container {
            border: none !important;
            box-shadow: none !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border-radius: 0 !important;
          }
          .sticky { position: static !important; }
          .bg-slate-50 { background-color: #f8fafc !important; }
          .bg-white { background-color: #ffffff !important; }
          .bg-\\[\\#111\\] { background-color: #000000 !important; color: white !important; }
          .text-\\[\\#C5A059\\] { color: #C5A059 !important; }
          .bg-\\[\\#C5A059\\] { background-color: #C5A059 !important; }
          .border-\\[\\#C5A059\\] { border-color: #C5A059 !important; }
          tr { page-break-inside: avoid !important; }
          table { width: 100% !important; table-layout: fixed !important; }
        }
      `}</style>
    </div>
  );
};

const ProfileItem: React.FC<{ label: string; value: string; isEditing: boolean; onEdit: (v: string) => void }> = ({ label, value, isEditing, onEdit }) => (
  <div className="flex flex-col">
    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 print:text-[8px] print:mb-1">{label}</span>
    {isEditing ? (
      <input className="text-sm font-bold text-slate-800 border border-slate-200 px-3 py-2 rounded-lg focus:border-[#C5A059] outline-none transition-colors" value={value} onChange={(e) => onEdit(e.target.value)} />
    ) : (
      <span className="text-sm font-black text-slate-800 uppercase tracking-tight print:text-xs">{value || '---'}</span>
    )}
  </div>
);

export default ComparisonView;
