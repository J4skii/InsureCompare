
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
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFiles([...files, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const removeFile = (idx: number) => {
    const next = [...files];
    next.splice(idx, 1);
    setFiles(next);
  };

  const fileToGenerativePart = async (file: File) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = (reader.result as string).split(',')[1];
        resolve({
          inlineData: {
            data: base64data,
            mimeType: file.type,
          },
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAiSmartImport = async () => {
    if (!rawText.trim() && files.length === 0) return;

    // Explicit API Key check to provide better user feedback
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your-gemini-api-key') {
      alert("API KEY MISSING: Please create a .env file and add VITE_GEMINI_API_KEY=your_key. See .env.example for reference.");
      return;
    }

    setIsAiLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey });

      // Check file sizes
      const MAX_TOTAL_SIZE = 18 * 1024 * 1024; // 18MB safety limit for base64
      const totalSize = files.reduce((acc, f) => acc + f.size, 0);
      if (totalSize > MAX_TOTAL_SIZE) {
        throw new Error("TOTAL_SIZE_EXCEEDED");
      }

      const fileParts = await Promise.all(
        files.map(file => fileToGenerativePart(file))
      );

      const prompt = `
        Analyze the following insurance comparison materials. 
        You may have been provided with:
        1. Raw text pasted from brochures.
        2. Image or PDF files of insurance tables/brochures.

        The documents provide details for TWO or MORE insurance providers and their respective plans/benefits.
        
        Extract the data into a structured JSON format with this EXACT schema:
        {
          "memberName": "string",
          "surname": "string",
          "idNumber": "string",
          "age": "string",
          "occupation": "string",
          "familyComposition": "string",
          "providers": [
            { "underwriter": "string", "plan": "string" }
          ],
          "categories": [
            { 
              "title": "string", 
              "items": [
                { "label": "string", "values": ["string (value for provider 1)", "string (value for provider 2)"] }
              ]
            }
          ]
        }
        
        Rules:
        - Identify all unique companies (underwriters) and plans mentioned.
        - Create a column for each unique plan identified.
        - Ensure the 'values' array length matches the 'providers' array length and follows the same order.
        - Use "---" for missing values.
        - Categories should group similar benefits (e.g., 'Hospital Benefits', 'Day-to-Day Benefits').
        
        Supplementary Text:
        ${rawText}
      `;

      // Using Gemini 1.5 Flash for multimodal capabilities and speed (Free Tier friendly)
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              ...(fileParts as any[])
            ]
          }
        ],
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
    } catch (err: any) {
      console.error("AI Import Error:", err);

      if (err.message === "TOTAL_SIZE_EXCEEDED") {
        alert("The uploaded files are too large (limit 15-20MB). Please try taking a screenshot of the benefit table instead, or upload a smaller PDF.");
      } else if (err.status === 403 || err.status === 401) {
        alert("AI Authentication Failed: Please check if your Gemini API Key is valid and active.");
      } else if (err.message?.includes("fetch")) {
        alert("Network Error: Could not reach the AI service. Please check your internet connection.");
      } else {
        alert("AI was unable to parse that document. Tip: If the PDF is very complex, try uploading a screenshot of the benefit table instead!");
      }
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
            <div className="space-y-8">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                    <Icons.Sparkles />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">AI Brochure Import</h3>
                    <p className="text-xs text-slate-500 font-medium">Extracting data from PDF, Images, or Text</p>
                  </div>
                </div>
                <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter">Multimodal v3</span>
              </div>

              {/* Upload Section */}
              <div
                className={`relative group border-2 border-dashed rounded-3xl p-10 transition-all text-center ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  multiple
                  accept="application/pdf,image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 mb-1">Upload Insurance Brochures</h4>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto">Drag and drop PDF files or benefit screenshots here, or click to browse.</p>
                </div>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl group/file">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-white rounded-lg border border-slate-100 text-blue-600 shrink-0">
                          <Icons.FileText />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-slate-700 truncate">{file.name}</p>
                          <p className="text-[10px] font-medium text-slate-400 capitalize">{file.type.split('/')[1]} &bull; {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(idx)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Text Area (Supplementary) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Pasted Text Reference (Optional)</label>
                  {rawText && <button onClick={() => setRawText('')} className="text-[10px] font-bold text-red-500 hover:underline">Clear Text</button>}
                </div>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Or paste table data here if you don't have a brochure file..."
                  className="w-full h-32 p-4 rounded-2xl border-2 border-slate-200 focus:border-blue-500 outline-none font-mono text-sm leading-relaxed"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleAiSmartImport}
                  disabled={(files.length === 0 && !rawText.trim()) || isAiLoading}
                  className="flex-[2] bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-2xl shadow-blue-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:shadow-none"
                >
                  {isAiLoading ? (
                    <div className="flex items-center gap-3">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      <span>AI Analysing Brochures...</span>
                    </div>
                  ) : (
                    <><Icons.Sparkles /> Run AI Smart Import</>
                  )}
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={isAiLoading}
                  className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Skip to Manual
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3">
                <div className="text-amber-500 shrink-0 mt-0.5"><Icons.Shield /></div>
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                  <strong className="block mb-1">AI Tip:</strong>
                  For the best result, upload clear brochures. AI will automatically build columns for every company it finds and group similar benefits together.
                </p>
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
