
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI, Type } from "@google/genai";
import { ComparisonSession, PlanType, ClientProfile } from '../types';
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
    familyComposition: '',
    incomeBracket: '',
    region: '',
    primaryPriority: ''
  });

  const [categories, setCategories] = useState<any[]>([
    { title: 'Hospital Benefits', items: [{ label: '', valueA: '', valueB: '' }] },
    { title: 'Day-to-Day Benefits', items: [{ label: '', valueA: '', valueB: '' }] },
    { title: 'Extra Benefits', items: [{ label: '', valueA: '', valueB: '' }] }
  ]);

  const [providerAUnderwriter, setProviderAUnderwriter] = useState('');
  const [providerBUnderwriter, setProviderBUnderwriter] = useState('');
  const [providerAPlan, setProviderAPlan] = useState('');
  const [providerBPlan, setProviderBPlan] = useState('');

  const handleAiSmartImport = async () => {
    if (!rawText.trim()) return;
    setIsAiLoading(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        Analyze the following insurance comparison text (which might be from an Excel or PDF OCR).
        Extract it into a structured JSON format matching this schema:
        - memberName: string
        - familyComposition: string
        - providerAUnderwriter: string
        - providerBUnderwriter: string
        - providerAPlan: string
        - providerBPlan: string
        - categories: Array of { title: string, items: Array of { label: string, valueA: string, valueB: string } }
        
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
              familyComposition: { type: Type.STRING },
              providerAUnderwriter: { type: Type.STRING },
              providerBUnderwriter: { type: Type.STRING },
              providerAPlan: { type: Type.STRING },
              providerBPlan: { type: Type.STRING },
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
                          valueA: { type: Type.STRING },
                          valueB: { type: Type.STRING }
                        },
                        required: ["label", "valueA", "valueB"]
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
      setProfile(prev => ({ ...prev, memberName: data.memberName, familyComposition: data.familyComposition }));
      setProviderAUnderwriter(data.providerAUnderwriter);
      setProviderBUnderwriter(data.providerBUnderwriter);
      setProviderAPlan(data.providerAPlan);
      setProviderBPlan(data.providerBPlan);
      setCategories(data.categories);
      setStep(3); // Skip to preview
    } catch (err) {
      console.error("AI Import Error:", err);
      alert("AI was unable to parse that text. Please try pasting a clearer selection or fill in manually.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSave = () => {
    const newSession: ComparisonSession = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || `${providerAUnderwriter} vs ${providerBUnderwriter}`,
      date: new Date().toISOString().split('T')[0],
      type,
      clientProfile: profile,
      providerAUnderwriter,
      providerBUnderwriter,
      providerAPlan,
      providerBPlan,
      categories
    };
    onSave(newSession);
    navigate(`/view/${newSession.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Build New Comparison</h2>
        <p className="text-slate-500">Create a gold-standard report or use AI to import from Excel/PDF</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Progress Bar */}
        <div className="flex bg-slate-50 border-b border-slate-200">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex-1 py-4 text-center text-xs font-bold uppercase tracking-widest ${step === s ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>
              Step {s}: {s === 1 ? 'Import' : s === 2 ? 'Profile' : 'Data'}
            </div>
          ))}
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800">Start with AI Smart Import</h3>
                <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded uppercase">Experimental</span>
              </div>
              <p className="text-sm text-slate-500 mb-4">Paste text from your Excel sheets or PDF OCR here. Our AI will automatically map the benefits to the comparison grid.</p>
              <textarea 
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste benefit tables or list here..."
                className="w-full h-48 p-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 outline-none font-mono text-sm leading-relaxed"
              />
              <div className="flex gap-4">
                <button 
                  onClick={handleAiSmartImport}
                  disabled={!rawText.trim() || isAiLoading}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isAiLoading ? <span className="animate-pulse">Analyzing Data...</span> : <><Icons.Sparkles /> AI Smart Import</>}
                </button>
                <button 
                  onClick={() => setStep(2)}
                  className="px-8 bg-slate-100 text-slate-600 py-4 rounded-xl font-bold hover:bg-slate-200"
                >
                  Skip to Manual
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-800">Section 1: Client Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput label="Report Name" value={name} onChange={setName} placeholder="e.g. Ernie Comparison 2025" />
                <FormInput label="Member Name" value={profile.memberName} onChange={(v) => setProfile({...profile, memberName: v})} placeholder="e.g. Ernie" />
                <FormInput label="Family Composition" value={profile.familyComposition} onChange={(v) => setProfile({...profile, familyComposition: v})} placeholder="e.g. Single, Couple + 2" />
                <FormInput label="Income Bracket" value={profile.incomeBracket} onChange={(v) => setProfile({...profile, incomeBracket: v})} placeholder="e.g. R20k - R40k" />
                <FormInput label="Region" value={profile.region} onChange={(v) => setProfile({...profile, region: v})} placeholder="e.g. Western Cape" />
                <FormInput label="Primary Priority" value={profile.primaryPriority} onChange={(v) => setProfile({...profile, primaryPriority: v})} placeholder="e.g. Hospitalization" />
              </div>
              <div className="flex gap-4 mt-8">
                <button onClick={() => setStep(1)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-xl font-bold hover:bg-slate-200">Back</button>
                <button onClick={() => setStep(3)} className="flex-[2] bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200">Continue to Comparison Data</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                <FormInput label="Provider A Underwriter" value={providerAUnderwriter} onChange={setProviderAUnderwriter} />
                <FormInput label="Provider B Underwriter" value={providerBUnderwriter} onChange={setProviderBUnderwriter} />
                <FormInput label="Provider A Plan Name" value={providerAPlan} onChange={setProviderAPlan} />
                <FormInput label="Provider B Plan Name" value={providerBPlan} onChange={setProviderBPlan} />
              </div>
              
              <div className="space-y-10">
                {categories.map((cat, catIdx) => (
                  <div key={catIdx} className="space-y-4">
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <input 
                        className="bg-transparent font-bold text-slate-800 outline-none w-full" 
                        value={cat.title} 
                        onChange={(e) => {
                          const newCats = [...categories];
                          newCats[catIdx].title = e.target.value;
                          setCategories(newCats);
                        }}
                      />
                      <button 
                        onClick={() => {
                          const newCats = [...categories];
                          newCats[catIdx].items.push({ label: '', valueA: '', valueB: '' });
                          setCategories(newCats);
                        }}
                        className="text-blue-600 text-xs font-bold hover:underline"
                      >
                        + Add Row
                      </button>
                    </div>
                    {cat.items.map((item: any, itemIdx: number) => (
                      <div key={itemIdx} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-xl bg-white shadow-sm">
                        <FormInput label="Benefit Type" value={item.label} onChange={(v) => {
                          const newCats = [...categories];
                          newCats[catIdx].items[itemIdx].label = v;
                          setCategories(newCats);
                        }} />
                        <FormInput label="Provider A Value" value={item.valueA} onChange={(v) => {
                          const newCats = [...categories];
                          newCats[catIdx].items[itemIdx].valueA = v;
                          setCategories(newCats);
                        }} />
                        <FormInput label="Provider B Value" value={item.valueB} onChange={(v) => {
                          const newCats = [...categories];
                          newCats[catIdx].items[itemIdx].valueB = v;
                          setCategories(newCats);
                        }} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-8 pt-6 border-t border-slate-100">
                <button onClick={() => setStep(2)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-xl font-bold hover:bg-slate-200">Back</button>
                <button onClick={handleSave} className="flex-[3] bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition-all">
                  Save & View Gold Report
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
  <div>
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm"
    />
  </div>
);

export default CreateComparison;
