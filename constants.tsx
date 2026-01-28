
import React from 'react';
import { PlanType, ComparisonSession } from './types';

export const INITIAL_COMPARISONS: ComparisonSession[] = [
  {
    id: '1',
    name: 'Discovery vs Momentum vs Bonitas',
    date: '2025-01-20',
    type: PlanType.MEDICAL_AID,
    clientProfile: {
      memberName: 'Ernie',
      familyComposition: 'Main Member + 2 Children',
      incomeBracket: 'High Income',
      region: 'Gauteng',
      primaryPriority: 'Regional Hospitalization'
    },
    providers: [
      { underwriter: 'Discovery Health', plan: 'KeyCare Start Regional' },
      { underwriter: 'Momentum', plan: 'Ingwe Option' },
      { underwriter: 'Bonitas', plan: 'BonStart' }
    ],
    categories: [
      {
        title: 'Hospital Benefits',
        items: [
          { label: 'Monthly Premiums', values: ['Total: ≈ R4 968', 'Total: ≈ R5 189', 'Total: ≈ R4 850'] },
          { label: 'Hospital Cover', values: ['Unlimited at 100% DHR in network', 'Unlimited at 100% MMSR in network', 'Unlimited at 100% Scheme Rate'] },
          { label: 'Co-payment', values: ['R6 000 per admission', 'None if network used', 'R5 000 at non-network'] }
        ]
      },
      {
        title: 'Day-to-Day Benefits',
        items: [
          { label: 'Chronic Illness Cover', values: ['27 PMB conditions', '26 PMB conditions', '27 PMB conditions'] },
          { label: 'GP Visits', values: ['Unlimited via nominated GP', 'Unlimited in-network', 'Unlimited via network GP'] }
        ]
      }
    ]
  }
];

export const Icons = {
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7v14"/></svg>,
  ArrowLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7m7 7H5"/></svg>,
  FileText: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Shield: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Printer: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  Sparkles: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
};
