
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ComparisonSession, BenefitCategory, BenefitItem, Provider, PlanType } from '../types';
import { Icons } from '../constants';

interface ComparisonViewProps {
  sessions: ComparisonSession[];
  onUpdate: (session: ComparisonSession) => void;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ sessions, onUpdate }) => {
  const { id } = useParams<{ id: string }>();
  const initialSession = sessions.find(s => s.id === id);
  const [session, setSession] = useState<ComparisonSession | undefined>(initialSession);
  const [draftSession, setDraftSession] = useState<ComparisonSession | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);

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

  const currentSession = isEditing && draftSession ? draftSession : session;

  const handleUpdate = (updated: ComparisonSession) => {
    if (isEditing) {
      setDraftSession(updated);
    } else {
      setSession(updated);
      onUpdate(updated);
    }
  };

  const handleEnterEditMode = () => {
    setDraftSession({ ...session });
    setIsEditing(true);
  };

  const handleSaveChanges = () => {
    if (draftSession) {
      setSession(draftSession);
      onUpdate(draftSession);
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 3000);
    }
    setIsEditing(false);
    setDraftSession(undefined);
  };

  const handleCancelChanges = () => {
    setIsEditing(false);
    setDraftSession(undefined);
  };

  const handleProfileChange = (key: string, value: string) => {
    handleUpdate({
      ...currentSession,
      clientProfile: { ...currentSession.clientProfile, [key]: value }
    });
  };

  const handleProviderChange = (idx: number, key: keyof Provider, value: string) => {
    const newProviders = [...currentSession.providers];
    newProviders[idx] = { ...newProviders[idx], [key]: value };
    handleUpdate({ ...currentSession, providers: newProviders });
  };

  const handleAddProvider = () => {
    const newProviders = [...currentSession.providers, { underwriter: 'New Provider', plan: 'New Plan' }];
    const newCategories = currentSession.categories.map(cat => ({
      ...cat,
      items: cat.items.map(item => ({
        ...item,
        values: [...item.values, '']
      }))
    }));
    handleUpdate({ ...currentSession, providers: newProviders, categories: newCategories });
  };

  const handleRemoveProvider = (idx: number) => {
    if (currentSession.providers.length <= 1) return;
    const newProviders = [...currentSession.providers];
    newProviders.splice(idx, 1);
    const newCategories = currentSession.categories.map(cat => ({
      ...cat,
      items: cat.items.map(item => {
        const newValues = [...item.values];
        newValues.splice(idx, 1);
        return { ...item, values: newValues };
      })
    }));
    handleUpdate({ ...currentSession, providers: newProviders, categories: newCategories });
  };

  const handleBenefitLabelChange = (catIdx: number, itemIdx: number, value: string) => {
    const newCategories = [...currentSession.categories];
    newCategories[catIdx].items[itemIdx].label = value;
    handleUpdate({ ...currentSession, categories: newCategories });
  };

  const handleBenefitValueChange = (catIdx: number, itemIdx: number, providerIdx: number, value: string) => {
    const newCategories = [...currentSession.categories];
    newCategories[catIdx].items[itemIdx].values[providerIdx] = value;
    handleUpdate({ ...currentSession, categories: newCategories });
  };

  const handleAddRow = (catIdx: number) => {
    const newCategories = [...currentSession.categories];
    newCategories[catIdx].items.push({
      label: 'New Benefit',
      values: Array(currentSession.providers.length).fill('')
    });
    handleUpdate({ ...currentSession, categories: newCategories });
  };

  const handleRemoveRow = (catIdx: number, itemIdx: number) => {
    const newCategories = [...currentSession.categories];
    newCategories[catIdx].items.splice(itemIdx, 1);
    handleUpdate({ ...currentSession, categories: newCategories });
  };

  const handleAddCategory = () => {
    const newCategories = [...currentSession.categories, {
      title: 'New Benefit Section',
      items: [{ label: 'Benefit Item', values: Array(currentSession.providers.length).fill('') }]
    }];
    handleUpdate({ ...currentSession, categories: newCategories });
  };

  const handleRemoveCategory = (catIdx: number) => {
    if (!window.confirm("Are you sure you want to delete this entire section?")) return;
    const newCategories = [...currentSession.categories];
    newCategories.splice(catIdx, 1);
    handleUpdate({ ...currentSession, categories: newCategories });
  };

  const handleCategoryTitleChange = (catIdx: number, value: string) => {
    const newCategories = [...currentSession.categories];
    newCategories[catIdx].title = value;
    handleUpdate({ ...currentSession, categories: newCategories });
  };

  const handleCategoryNotesChange = (catIdx: number, value: string) => {
    const newCategories = [...currentSession.categories];
    newCategories[catIdx].notes = value;
    handleUpdate({ ...currentSession, categories: newCategories });
  };

  const handleReportTitleChange = (value: string) => {
    handleUpdate({ ...currentSession, reportTitleOverride: value });
  };

  const handleComparisonTypeChange = (value: string) => {
    handleUpdate({ ...currentSession, type: value as PlanType });
  };

  const handleDateChange = (value: string) => {
    handleUpdate({ ...currentSession, date: value });
  };

  const printReport = () => {
    setExporting(true);
    setTimeout(() => {
      window.print();
      setExporting(false);
    }, 100);
  };

  const hasValidationErrors = () => {
    if (!isEditing) return false;
    // Check provider names/plans
    const hasEmptyProvider = currentSession.providers.some(p => !p.underwriter?.trim() || !p.plan?.trim());
    // Check benefit labels
    const hasEmptyLabel = currentSession.categories.some(cat => 
      cat.items.some(item => !item.label?.trim())
    );
    return hasEmptyProvider || hasEmptyLabel;
  };

  const isMultiProvider = currentSession.providers.length > 2;

  return (
    <div className={`mx-auto px-4 py-8 print:p-0 print:m-0 ${isMultiProvider ? 'max-w-none' : 'max-w-7xl'}`}>
      {/* Action Header */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <Link to="/" className="inline-flex items-center text-slate-500 hover:text-blue-600 transition-colors">
          <Icons.ArrowLeft />
          <span className="ml-2 font-medium">Back to Dashboard</span>
        </Link>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancelChanges}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all bg-green-600 text-white shadow-lg hover:bg-green-700"
              >
                <Icons.Edit />
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={handleEnterEditMode}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <Icons.Edit />
              Admin Edit Mode
            </button>
          )}
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

      {/* Save Confirmation Toast */}
      {showSaveToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-in print:hidden">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">Changes saved successfully!</span>
        </div>
      )}

      {/* Main Report Document */}
      <div id="report-container" className="bg-[#111] print:bg-white print:shadow-none shadow-2xl border border-slate-200 print:border-0 rounded-2xl print:rounded-none overflow-hidden mb-12 print:mb-0 relative">

        {/* GOLD STANDARD PRAETO BRANDING BLOCK - EXACT RECREATION */}
        {/* GOLD STANDARD PRAETO BRANDING BLOCK - RIBBON STYLE */}
        <div className="relative z-10 py-6 text-center bg-[#111] border-b-4 border-[#C5A059] flex flex-col items-center justify-center print:py-4 print:bg-[#111] print:border-b-2 print:text-[#C5A059]">
          <div className="w-full flex justify-center">
            <img
              src="/praeto-logo-v3.png"
              alt="Praeto Header Banner"
              className="h-24 w-auto object-contain print:h-16"
            />
          </div>
        </div>

        {/* Comparison Data Section (White Background) */}
        <div className="bg-white relative z-10 min-h-screen">
          {/* Report Metadata */}
          <div className="p-10 border-t-[8px] border-[#C5A059] print:p-6 print:border-t-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {isEditing && (
                  <div className="mb-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Custom Report Title (Optional)</label>
                    <input
                      className="w-full max-w-2xl text-2xl font-black text-slate-900 uppercase tracking-tight border-2 border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-[#C5A059] transition-colors"
                      value={currentSession.reportTitleOverride || ''}
                      onChange={(e) => handleReportTitleChange(e.target.value)}
                      placeholder="Leave empty to use default"
                    />
                  </div>
                )}
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight print:text-xl">
                  {currentSession.reportTitleOverride || `${currentSession.type} Comparison Report`}
                </h2>
                <div className="mt-3 inline-flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-lg">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Client Name</span>
                  {isEditing ? (
                    <input
                      className="text-sm font-black text-[#C5A059] uppercase border border-slate-200 rounded px-3 py-1 outline-none focus:border-[#C5A059] transition-colors"
                      value={currentSession.clientProfile.memberName}
                      onChange={(e) => handleProfileChange('memberName', e.target.value)}
                    />
                  ) : (
                    <span className="text-sm font-black text-[#C5A059] uppercase">{currentSession.clientProfile.memberName}</span>
                  )}
                </div>
                {isEditing && (
                  <div className="mt-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Comparison Type</label>
                    <select
                      className="text-sm font-bold text-slate-800 border-2 border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#C5A059] transition-colors"
                      value={currentSession.type}
                      onChange={(e) => handleComparisonTypeChange(e.target.value)}
                    >
                      <option value="Medical Aid">Medical Aid</option>
                      <option value="Hospital Plan">Hospital Plan</option>
                      <option value="Gap Cover">Gap Cover</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Generated Date</span>
                {isEditing ? (
                  <input
                    type="date"
                    className="text-sm font-bold text-slate-800 border-2 border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#C5A059] transition-colors"
                    value={currentSession.date}
                    onChange={(e) => handleDateChange(e.target.value)}
                  />
                ) : (
                  <span className="text-sm font-bold text-slate-800">{currentSession.date}</span>
                )}
              </div>
            </div>
          </div>

          {/* Profile Context Grid */}
          <div className="px-10 pb-10 print:px-6 print:pb-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8 shadow-sm print:rounded-none print:border print:p-4 print:gap-4 print:bg-white">
              <ProfileItem label="Family Composition" value={currentSession.clientProfile.familyComposition} isEditing={isEditing} onEdit={(v) => handleProfileChange('familyComposition', v)} />
              <ProfileItem label="Income Bracket" value={currentSession.clientProfile.incomeBracket} isEditing={isEditing} onEdit={(v) => handleProfileChange('incomeBracket', v)} />
              <ProfileItem label="Region" value={currentSession.clientProfile.region} isEditing={isEditing} onEdit={(v) => handleProfileChange('region', v)} />
              <ProfileItem label="Primary Priority" value={currentSession.clientProfile.primaryPriority} isEditing={isEditing} onEdit={(v) => handleProfileChange('primaryPriority', v)} />
            </div>
          </div>

          {/* Comparison Grid */}
          <div className="px-10 pb-16 space-y-16 print:px-6 print:pb-10 print:space-y-8">
            {currentSession.categories.map((cat, catIdx) => (
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

                {/* Category Notes */}
                {isEditing && (
                  <div className="bg-amber-50 border-x border-slate-200 px-6 py-4 print:hidden">
                    <label className="text-xs font-black text-slate-600 uppercase tracking-widest block mb-2">Category Notes (Optional)</label>
                    <textarea
                      className="w-full bg-white border-2 border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#C5A059] transition-colors resize-none"
                      rows={3}
                      value={cat.notes || ''}
                      onChange={(e) => handleCategoryNotesChange(catIdx, e.target.value)}
                      placeholder="Add notes about this category (visible in view mode)"
                    />
                  </div>
                )}
                {!isEditing && cat.notes && cat.notes.trim() && (
                  <div className="bg-blue-50 border-x border-slate-200 px-6 py-4 print:bg-white print:border print:rounded-none">
                    <p className="text-sm text-slate-700 italic leading-relaxed">{cat.notes}</p>
                  </div>
                )}

                <div className="overflow-x-auto border-x border-b border-slate-200 rounded-b-xl print:border-slate-300 print:rounded-none">
                  <table className="w-full text-sm print:text-[10px] table-fixed border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <th className="p-5 text-left w-72 min-w-[220px] sticky left-0 bg-slate-50 z-10 border-r border-slate-200 font-black uppercase tracking-widest text-[10px] print:p-2">Benefit Summary</th>
                        {currentSession.providers.map((p, pIdx) => (
                          <th key={pIdx} className="p-5 text-center border-r border-slate-200 last:border-r-0 bg-white relative group/th">
                            <div className="flex flex-col gap-1.5">
                              {isEditing ? (
                                <>
                                  <input 
                                    className={`w-full text-center bg-slate-50 border-2 rounded px-2 py-1.5 font-black text-slate-900 text-[11px] uppercase tracking-tighter ${!p.underwriter?.trim() ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                                    value={p.underwriter} 
                                    onChange={(e) => handleProviderChange(pIdx, 'underwriter', e.target.value)} 
                                    placeholder="Provider name required"
                                  />
                                  <input 
                                    className={`w-full text-center bg-slate-50 border-2 rounded px-2 py-1.5 text-[#C5A059] font-black text-[10px] uppercase tracking-widest ${!p.plan?.trim() ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                                    value={p.plan} 
                                    onChange={(e) => handleProviderChange(pIdx, 'plan', e.target.value)} 
                                    placeholder="Plan name required"
                                  />
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
                              <input 
                                className={`w-full bg-white border-2 px-3 py-2 rounded font-bold text-slate-800 outline-none ${!item.label?.trim() ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:border-[#C5A059]'}`}
                                value={item.label} 
                                onChange={(e) => handleBenefitLabelChange(catIdx, itemIdx, e.target.value)} 
                                placeholder="Benefit label required"
                              />
                            ) : item.label}
                          </td>
                          {item.values.map((val, pIdx) => (
                            <td key={pIdx} className="p-5 text-center border-r border-slate-100 last:border-r-0 whitespace-pre-wrap leading-relaxed print:p-2 print:text-[9px]">
                              {isEditing ? (
                                <textarea 
                                  className={`w-full bg-white border-2 px-3 py-2 rounded min-h-[100px] text-xs outline-none ${!val?.trim() ? 'border-amber-400 bg-amber-50' : 'border-slate-200 focus:border-[#C5A059]'}`}
                                  value={val} 
                                  onChange={(e) => handleBenefitValueChange(catIdx, itemIdx, pIdx, e.target.value)} 
                                  placeholder="Value recommended"
                                />
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
                <img src="/praeto-logo-v3.png" alt="Praeto Footer Logo" className="h-12 w-auto opacity-80 grayscale hover:grayscale-0 transition-all" />
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
        
        @keyframes slide-in {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
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
