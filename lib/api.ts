import { supabase } from './supabase';
import type {
    DatabaseUser,
    DatabaseClient,
    DatabaseComparisonSession,
    DatabaseAuditLog,
    ClientProfile,
    Provider,
    BenefitCategory,
    ComparisonSession,
    PlanType,
} from '../types';

// ==================== User API ====================

export const userApi = {
    async getCurrentUser(): Promise<DatabaseUser | null> {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) return null;

        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

        return user;
    },

    async createUser(email: string, name: string): Promise<DatabaseUser | null> {
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: { name },
        });

        if (authError) {
            console.error('Error creating user:', authError);
            return null;
        }

        const { data: user, error } = await supabase
            .from('users')
            .insert({
                id: authData.user.id,
                email,
                name,
            })
            .select()
            .single();

        if (error) {
            console.error('Error inserting user:', error);
            return null;
        }

        return user;
    },

    async signInWithEmail(email: string): Promise<{ user: DatabaseUser; session: unknown } | null> {
        const { data, error } = await supabase.auth.signInWithOtp({
            email,
        });

        if (error) {
            console.error('Error signing in:', error);
            return null;
        }

        return data as { user: DatabaseUser; session: unknown };
    },

    async signOut(): Promise<void> {
        await supabase.auth.signOut();
    },

    async getSession(): Promise<unknown> {
        const { data } = await supabase.auth.getSession();
        return data?.session;
    },
};

// ==================== Client API ====================

export const clientApi = {
    async getAll(): Promise<DatabaseClient[]> {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching clients:', error);
            return [];
        }

        return data || [];
    },

    async getById(id: string): Promise<DatabaseClient | null> {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching client:', error);
            return null;
        }

        return data;
    },

    async create(client: Omit<DatabaseClient, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseClient | null> {
        const { data, error } = await supabase
            .from('clients')
            .insert(client)
            .select()
            .single();

        if (error) {
            console.error('Error creating client:', error);
            return null;
        }

        return data;
    },

    async update(id: string, updates: Partial<DatabaseClient>): Promise<DatabaseClient | null> {
        const { data, error } = await supabase
            .from('clients')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating client:', error);
            return null;
        }

        return data;
    },

    async delete(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('clients')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting client:', error);
            return false;
        }

        return true;
    },

    async search(query: string): Promise<DatabaseClient[]> {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .or(`member_name.ilike.%${query}%,surname.ilike.%${query}%,id_number.ilike.%${query}%`)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error searching clients:', error);
            return [];
        }

        return data || [];
    },
};

// ==================== Comparison Session API ====================

export const comparisonApi = {
    async getAll(): Promise<DatabaseComparisonSession[]> {
        const { data, error } = await supabase
            .from('comparison_sessions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching sessions:', error);
            return [];
        }

        return data || [];
    },

    async getById(id: string): Promise<DatabaseComparisonSession | null> {
        const { data, error } = await supabase
            .from('comparison_sessions')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching session:', error);
            return null;
        }

        return data;
    },

    async create(
        session: Omit<DatabaseComparisonSession, 'id' | 'created_at' | 'updated_at'>
    ): Promise<DatabaseComparisonSession | null> {
        const { data, error } = await supabase
            .from('comparison_sessions')
            .insert(session)
            .select()
            .single();

        if (error) {
            console.error('Error creating session:', error);
            return null;
        }

        return data;
    },

    async update(
        id: string,
        updates: Partial<DatabaseComparisonSession>
    ): Promise<DatabaseComparisonSession | null> {
        const { data, error } = await supabase
            .from('comparison_sessions')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating session:', error);
            return null;
        }

        return data;
    },

    async delete(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('comparison_sessions')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting session:', error);
            return false;
        }

        return true;
    },

    async getByClientId(clientId: string): Promise<DatabaseComparisonSession[]> {
        const { data, error } = await supabase
            .from('comparison_sessions')
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching sessions by client:', error);
            return [];
        }

        return data || [];
    },
};

// ==================== Audit Log API ====================

export const auditApi = {
    async getAll(): Promise<DatabaseAuditLog[]> {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error('Error fetching audit logs:', error);
            return [];
        }

        return data || [];
    },

    async getBySessionId(sessionId: string): Promise<DatabaseAuditLog[]> {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching audit logs by session:', error);
            return [];
        }

        return data || [];
    },

    async getByClientId(clientId: string): Promise<DatabaseAuditLog[]> {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching audit logs by client:', error);
            return [];
        }

        return data || [];
    },

    async logAction(
        action: string,
        oldData?: object | null,
        newData?: object | null,
        sessionId?: string,
        clientId?: string
    ): Promise<boolean> {
        const { error } = await supabase.from('audit_logs').insert({
            action,
            old_data: oldData || null,
            new_data: newData || null,
            session_id: sessionId || null,
            client_id: clientId || null,
        });

        if (error) {
            console.error('Error logging audit action:', error);
            return false;
        }

        return true;
    },
};

// ==================== Import/Export API ====================

export const dataApi = {
    async exportAll(): Promise<{
        users: DatabaseUser[];
        clients: DatabaseClient[];
        sessions: DatabaseComparisonSession[];
        auditLogs: DatabaseAuditLog[];
    }> {
        const [users, clients, sessions, auditLogs] = await Promise.all([
            supabase.from('users').select('*'),
            supabase.from('clients').select('*'),
            supabase.from('comparison_sessions').select('*'),
            supabase.from('audit_logs').select('*'),
        ]);

        return {
            users: users.data || [],
            clients: clients.data || [],
            sessions: sessions.data || [],
            auditLogs: auditLogs.data || [],
        };
    },

    async importData(
        data: {
            clients?: Omit<DatabaseClient, 'id' | 'created_at' | 'updated_at'>[];
            sessions?: Omit<DatabaseComparisonSession, 'id' | 'created_at' | 'updated_at'>[];
        }
    ): Promise<{ clients: number; sessions: number }> {
        let clientsCount = 0;
        let sessionsCount = 0;

        if (data.clients && data.clients.length > 0) {
            const { count } = await supabase.from('clients').insert(data.clients);
            clientsCount = count || 0;
        }

        if (data.sessions && data.sessions.length > 0) {
            const { count } = await supabase.from('comparison_sessions').insert(data.sessions);
            sessionsCount = count || 0;
        }

        return { clients: clientsCount, sessions: sessionsCount };
    },
};
