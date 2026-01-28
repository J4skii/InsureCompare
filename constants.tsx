
import React from 'react';
import { PlanType, ComparisonSession } from './types';

export const INITIAL_COMPARISONS: ComparisonSession[] = [
  {
    id: '1',
    name: 'Discovery KeyCare vs Momentum Ingwe',
    date: '2025-01-20',
    type: PlanType.MEDICAL_AID,
    clientProfile: {
      memberName: 'Ernie',
      familyComposition: 'Main Member + 2 Children',
      incomeBracket: 'High Income',
      region: 'Gauteng',
      primaryPriority: 'Regional Hospitalization'
    },
    providerAUnderwriter: 'Discovery Health',
    providerBUnderwriter: 'Momentum Medical Scheme',
    providerAPlan: 'KeyCare Start Regional',
    providerBPlan: 'Ingwe Option',
    categories: [
      {
        title: 'Hospital Benefits',
        items: [
          { label: 'Monthly Premiums', valueA: 'Total: ≈ R4 968', valueB: 'Total: ≈ R5 189' },
          { label: 'Hospital Cover', valueA: 'Unlimited at 100% DHR in network', valueB: 'Unlimited at 100% MMSR in network' },
          { label: 'Co-payment (non-network)', valueA: 'R6 000 per admission', valueB: 'None if network used' },
          { label: 'ICU/High Care Limit', valueA: 'Unlimited (PMB & network)', valueB: 'Limited to 10 days/admission' },
          { label: 'Oncology (Cancer)', valueA: 'State facility; 80% DHR out-of-network', valueB: 'Limited PMB at state facilities' }
        ]
      },
      {
        title: 'Day-to-Day Benefits',
        items: [
          { label: 'Chronic Illness Cover', valueA: '27 PMB conditions', valueB: '26 PMB conditions' },
          { label: 'GP Visits', valueA: 'Unlimited via nominated GP', valueB: 'Unlimited in-network (after 10th visit)' },
          { label: 'Specialist Cover', valueA: 'Up to 2 visits (R2 780 per person)', valueB: 'Max 2 visits/family (R1 350 per visit)' }
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
};
