import { supabase } from '../supabaseClient';
import { AdminUser, AuditLogEntry, ComparisonSession } from '../types';

const mapComparisonSession = (row: any): ComparisonSession => ({
  id: row.id,
  name: row.name,
  date: row.date,
  type: row.type,
  clientProfile: row.client_profile ?? {},
  providers: row.providers ?? [],
  categories: row.categories ?? [],
  reportTitleOverride: row.report_title_override ?? undefined
});

const mapAdmin = (row: any): AdminUser => ({
  id: row.id,
  email: row.email,
  role: row.role,
  createdAt: row.created_at
});

const mapAuditLog = (row: any): AuditLogEntry => ({
  id: row.id,
  action: row.action,
  targetType: row.target_type,
  targetId: row.target_id,
  meta: row.meta,
  createdAt: row.created_at,
  actorEmail: row.actor?.email ?? undefined,
  actorRole: row.actor?.role ?? undefined
});

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const getCurrentUser = async () => {
  if (!supabaseUrlConfigured()) {
    return null;
  }
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    throw error;
  }
  return data.user;
};

export const signInWithPassword = async (email: string, password: string) => {
  if (!supabaseUrlConfigured()) {
    throw new Error('Missing Supabase environment variables.');
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }
  return data;
};

export const signOut = async () => {
  if (!supabaseUrlConfigured()) {
    return;
  }
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
};

export const fetchAdminProfile = async () => {
  if (!supabaseUrlConfigured()) {
    return null;
  }
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }
  const { data, error } = await supabase
    .from('admins')
    .select('id, email, role, created_at')
    .eq('id', user.id)
    .single();
  if (error) {
    throw error;
  }
  return mapAdmin(data);
};

export const listAdmins = async () => {
  ensureSupabaseConfigured();
  const { data, error } = await supabase
    .from('admins')
    .select('id, email, role, created_at')
    .order('created_at', { ascending: false });
  if (error) {
    throw error;
  }
  return data.map(mapAdmin);
};

export const inviteAdmin = async (email: string) => {
  ensureSupabaseConfigured();
  const { data, error } = await supabase.functions.invoke('invite-admin', {
    body: { email }
  });
  if (error) {
    throw error;
  }
  return data;
};

export const removeAdmin = async (adminId: string) => {
  ensureSupabaseConfigured();
  const { data, error } = await supabase.functions.invoke('remove-admin', {
    body: { adminId }
  });
  if (error) {
    throw error;
  }
  return data;
};

export const fetchComparisonSessions = async () => {
  ensureSupabaseConfigured();
  const { data, error } = await supabase
    .from('comparison_sessions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    throw error;
  }
  return data.map(mapComparisonSession);
};

export const createComparisonSession = async (session: ComparisonSession) => {
  ensureSupabaseConfigured();
  const { data, error } = await supabase
    .from('comparison_sessions')
    .insert({
      name: session.name,
      date: session.date,
      type: session.type,
      client_profile: session.clientProfile,
      providers: session.providers,
      categories: session.categories,
      report_title_override: session.reportTitleOverride ?? null
    })
    .select('*')
    .single();
  if (error) {
    throw error;
  }
  return mapComparisonSession(data);
};

export const updateComparisonSession = async (session: ComparisonSession) => {
  ensureSupabaseConfigured();
  const { data, error } = await supabase
    .from('comparison_sessions')
    .update({
      name: session.name,
      date: session.date,
      type: session.type,
      client_profile: session.clientProfile,
      providers: session.providers,
      categories: session.categories,
      report_title_override: session.reportTitleOverride ?? null,
      updated_at: new Date().toISOString()
    })
    .eq('id', session.id)
    .select('*')
    .single();
  if (error) {
    throw error;
  }
  return mapComparisonSession(data);
};

export const deleteComparisonSession = async (sessionId: string) => {
  ensureSupabaseConfigured();
  const { error } = await supabase
    .from('comparison_sessions')
    .delete()
    .eq('id', sessionId);
  if (error) {
    throw error;
  }
};

export const fetchAuditLogs = async () => {
  ensureSupabaseConfigured();
  const { data, error } = await supabase
    .from('audit_logs')
    .select('id, action, target_type, target_id, meta, created_at, actor:admins(email, role)')
    .order('created_at', { ascending: false });
  if (error) {
    throw error;
  }
  return data.map(mapAuditLog);
};

export const parseComparisonWithAi = async (rawText: string) => {
  ensureSupabaseConfigured();
  const { data, error } = await supabase.functions.invoke('parse-comparison', {
    body: { rawText }
  });
  if (error) {
    throw error;
  }
  return data;
};

const supabaseUrlConfigured = () => Boolean(supabaseUrl && supabaseAnonKey);

const ensureSupabaseConfigured = () => {
  if (!supabaseUrlConfigured()) {
    throw new Error('Missing Supabase environment variables.');
  }
};
