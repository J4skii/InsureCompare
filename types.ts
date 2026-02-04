
export enum PlanType {
  MEDICAL_AID = 'Medical Aid',
  HOSPITAL = 'Hospital Plan',
  GAP_COVER = 'Gap Cover'
}

export interface ClientProfile {
  memberName: string;
  surname: string;
  idNumber: string;
  age: string;
  occupation: string;
  familyComposition: string;
  incomeBracket: string;
  region: string;
  primaryPriority: string;
}

export interface Provider {
  underwriter: string;
  plan: string;
}

export interface BenefitItem {
  label: string;
  values: string[]; // Supports multiple providers
}

export interface BenefitCategory {
  title: string;
  items: BenefitItem[];
  notes?: string;
}

export interface ComparisonSession {
  id: string;
  name: string;
  date: string;
  clientProfile: ClientProfile;
  type: PlanType;
  providers: Provider[]; // Refactored from providerA/B
  categories: BenefitCategory[];
  reportTitleOverride?: string;
}

// ==================== Database Types ====================

export interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface DatabaseClient {
  id: string;
  user_id: string;
  member_name: string;
  surname: string | null;
  id_number: string | null;
  age: string | null;
  occupation: string | null;
  family_composition: string | null;
  income_bracket: string | null;
  region: string | null;
  primary_priority: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseComparisonSession {
  id: string;
  user_id: string;
  client_id: string | null;
  name: string;
  date: string;
  type: string;
  providers: Provider[];
  categories: BenefitCategory[];
  report_title_override: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseAuditLog {
  id: string;
  user_id: string | null;
  session_id: string | null;
  client_id: string | null;
  action: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
}

// ==================== API Response Types ====================

export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
}

