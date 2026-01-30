
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI, Type } from "@google/genai";
import { ComparisonSession, PlanType, ClientProfile, Provider } from '../types';
import { Icons } from '../constants';

interface CreateComparisonProps {
  onSave: (session: ComparisonSession) => void;
}

const CreateComparison: React.FC<CreateComparisonProps> = ({ onSave }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [rawText, setRawText] = useState('');

  const [type, setType] = useState<PlanType>(PlanType.MEDICAL_AID);
  const [name, setName] = useState('');

  const [profile, setProfile] = useState<ClientProfile>({
    memberName: '',
    surname: '',
    idNumber: '',
    age: '',
    occupation: '',
    familyComposition: '',
    incomeBracket: '',
    region: '',
    primaryPriority: ''
  });

  const [providers, setProviders] = useState<Provider[]>([
    { underwriter: '', plan: '' },
    { underwriter: '', plan: '' }
  ]);

  const [categories, setCategories] = useState<any[]>([
    { title: 'Hospital Benefits', items: [{ label: 'Hospital Cover', values: ['', ''] }] },
    { title: 'Day-to-Day Benefits', items: [{ label: 'GP Visits', values: ['', ''] }] }
  ]);

  const handleAddProvider = () => {
    setProviders([...providers, { underwriter: '', plan: '' }]);
    setCategories(categories.map(cat => ({
      ...cat,
      items: cat.items.map((item: any) => ({
        ...item,
        values: [...item.values, '']
      }))
    })));
  };

  const handleRemoveProvider = (idx: number) => {
    if (providers.length <= 1) return;
    const newProviders = [...providers];
    newProviders.splice(idx, 1);
    setProviders(newProviders);
    setCategories(categories.map(cat => ({
      ...cat,
      items: cat.items.map((item: any) => {
        const newValues = [...item.values];
        newValues.splice(idx, 1);
        return { ...item, values: newValues };
      })
    })));
  };

  const handleAiSmartImport = async () => {
    if (!rawText.trim()) return;
    setIsAiLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        Analyze the following insurance comparison text (which might be from an Excel or PDF OCR).
        The text may compare TWO or MORE providers.
        Extract it into a structured JSON format matching this schema:
        Extract it into a structured JSON format matching this schema:
        - memberName: string
        - surname: string
        - idNumber: string
        - age: string
        - occupation: string
        - familyComposition: string
        - providers: Array of { underwriter: string, plan: string }
        - categories: Array of { title: string, items: Array of { label: string, values: Array of string (same length as providers) } }
        
        Important: Ensure the 'values' array in each item matches the order and length of the 'providers' array.
        
        Text to process:
        ${rawText}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              memberName: { type: Type.STRING },
              surname: { type: Type.STRING },
              idNumber: { type: Type.STRING },
              age: { type: Type.STRING },
              occupation: { type: Type.STRING },
              familyComposition: { type: Type.STRING },
              providers: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    underwriter: { type: Type.STRING },
                    plan: { type: Type.STRING }
                  },
                  required: ["underwriter", "plan"]
                }
              },
              categories: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    items: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          label: { type: Type.STRING },
                          values: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["label", "values"]
                      }
                    }
                  },
                  required: ["title", "items"]
                }
              }
            }
          }
        }
      });

      const data = JSON.parse(response.text);
      setProfile(prev => ({
        ...prev,
        memberName: data.memberName,
        surname: data.surname,
        idNumber: data.idNumber,
        age: data.age,
        occupation: data.occupation,
        familyComposition: data.familyComposition
      }));
      setProviders(data.providers);
      setCategories(data.categories);
      setStep(3);
    } catch (err) {
      console.error("AI Import Error:", err);
      alert("AI was unable to parse that text accurately. Please try a clearer text selection.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSave = () => {
    const newSession: ComparisonSession = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || providers.map(p => p.underwriter).join(' vs '),
      date: new Date().toISOString().split('T')[0],
      type,
      clientProfile: profile,
      providers,
      categories
    };
    onSave(newSession);
    navigate(`/view/${newSession.id}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Build New Comparison</h2>
        <p className="text-slate-500">Compare 2, 3, or more providers using the Praeto gold-standard template.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Progress Bar */}
        <div className="flex bg-slate-50 border-b border-slate-200">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex-1 py-4 text-center text-xs font-bold uppercase tracking-widest ${step === s ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>
              Step {s}: {s === 1 ? 'Import' : s === 2 ? 'Profile' : 'Data Entry'}
            </div>
          ))}
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800">AI Smart Import (Multi-Company Support)</h3>
                <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded uppercase">Smart v2</span>
              </div>
              <p className="text-sm text-slate-500 mb-4">Paste text from multiple brochures or a comparison sheet. AI will detect how many companies are present and build the columns for you.</p>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste multi-column benefit data here..."
                className="w-full h-48 p-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 outline-none font-mono text-sm leading-relaxed"
              />
              <div className="flex gap-4">
                <button
                  onClick={handleAiSmartImport}
                  disabled={!rawText.trim() || isAiLoading}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isAiLoading ? <span className="animate-pulse">Mapping Providers...</span> : <><Icons.Sparkles /> AI Smart Import</>}
                </button>
                <button onClick={() => setStep(2)} className="px-8 bg-slate-100 text-slate-600 py-4 rounded-xl font-bold hover:bg-slate-200">Manual Setup</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-800">Client Profile & Plan Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput label="Internal Report Name" value={name} onChange={setName} placeholder="e.g. 2025 Multi-Choice Analysis" />
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Comparison Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as PlanType)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 outline-none transition-all text-sm font-medium"
                  >
                    {Object.values(PlanType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <FormInput label="Member Name" value={profile.memberName} onChange={(v) => setProfile({ ...profile, memberName: v })} placeholder="e.g. Ernie" />
                <FormInput label="Surname" value={profile.surname} onChange={(v) => setProfile({ ...profile, surname: v })} placeholder="e.g. Els" />
                <div className="grid grid-cols-2 gap-4">
                  <FormInput label="ID Number" value={profile.idNumber} onChange={(v) => setProfile({ ...profile, idNumber: v })} placeholder="ID No." />
                  <FormInput label="Age" value={profile.age} onChange={(v) => setProfile({ ...profile, age: v })} placeholder="Age" />
                </div>
                <FormInput label="Occupation" value={profile.occupation} onChange={(v) => setProfile({ ...profile, occupation: v })} placeholder="e.g. Accountant" />
                <FormInput label="Family Composition" value={profile.familyComposition} onChange={(v) => setProfile({ ...profile, familyComposition: v })} placeholder="e.g. Main + 2" />
              </div>
              <div className="flex gap-4 mt-8">
                <button onClick={() => setStep(1)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-xl font-bold hover:bg-slate-200">Back</button>
                <button onClick={() => setStep(3)} className="flex-[2] bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg">Next: Provider Benefits</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Providers Configuration</h3>
                  <button onClick={handleAddProvider} className="text-blue-600 text-xs font-black uppercase hover:underline">+ Add Another Provider</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {providers.map((p, pIdx) => (
                    <div key={pIdx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group">
                      {providers.length > 1 && (
                        <button onClick={() => handleRemoveProvider(pIdx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      )}
                      <FormInput label={`Provider ${pIdx + 1} Underwriter`} value={p.underwriter} onChange={(v) => {
                        const next = [...providers];
                        next[pIdx].underwriter = v;
                        setProviders(next);
                      }} />
                      <div className="mt-2">
                        <FormInput label="Plan Name" value={p.plan} onChange={(v) => {
                          const next = [...providers];
                          next[pIdx].plan = v;
                          setProviders(next);
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-10">
                {categories.map((cat, catIdx) => (
                  <div key={catIdx} className="space-y-4">
                    <div className="flex justify-between items-center bg-slate-900 text-white p-3 rounded-t-lg">
                      <input className="bg-transparent font-bold text-white outline-none w-full" value={cat.title} onChange={(e) => {
                        const newCats = [...categories];
                        newCats[catIdx].title = e.target.value;
                        setCategories(newCats);
                      }} />
                      <button onClick={() => {
                        const newCats = [...categories];
                        newCats[catIdx].items.push({ label: '', values: Array(providers.length).fill('') });
                        setCategories(newCats);
                      }} className="text-blue-300 text-xs font-bold hover:text-white shrink-0">+ Add Benefit Row</button>
                    </div>
                    <div className="space-y-3">
                      {cat.items.map((item: any, itemIdx: number) => (
                        <div key={itemIdx} className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm space-y-4">
                          <FormInput label="Benefit Type / Name" value={item.label} onChange={(v) => {
                            const newCats = [...categories];
                            newCats[catIdx].items[itemIdx].label = v;
                            setCategories(newCats);
                          }} />
                          <div className={`grid gap-4 ${providers.length > 2 ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-2'}`}>
                            {item.values.map((val: string, pIdx: number) => (
                              <div key={pIdx}>
                                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 truncate">{providers[pIdx].underwriter || `Provider ${pIdx + 1}`} Value</label>
                                <textarea
                                  className="w-full px-3 py-2 text-xs border border-slate-100 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none min-h-[50px]"
                                  value={val}
                                  onChange={(e) => {
                                    const newCats = [...categories];
                                    newCats[catIdx].items[itemIdx].values[pIdx] = e.target.value;
                                    setCategories(newCats);
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-12 pt-8 border-t border-slate-100">
                <button onClick={() => setStep(2)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-xl font-bold hover:bg-slate-200">Back</button>
                <button onClick={handleSave} className="flex-[3] bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl transition-all">
                  Generate Comparison Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FormInput: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder?: string }> = ({ label, value, onChange, placeholder }) => (
  <div className="w-full">
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm font-medium"
    />
  </div>
);

export default CreateComparison;
