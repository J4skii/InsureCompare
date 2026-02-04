import { supabase, isSupabaseConfigured } from './supabase';
import { comparisonApi, clientApi, dataApi, auditApi, userApi } from './api';
import { INITIAL_COMPARISONS } from '../constants';
import type {
    ComparisonSession,
    ClientProfile,
    Provider,
    BenefitCategory,
    DatabaseComparisonSession,
    DatabaseClient,
} from '../types';

// Data source type
export type DataSource = 'supabase' | 'localstorage';

// Current data source
let currentDataSource: DataSource = 'localstorage';

// User context for audit logging
let currentUserId: string | null = null;

// ==================== Migration Helpers ====================

export const migrateLocalStorageToSupabase = async (): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured, cannot migrate');
        return false;
    }

    // Get data from localStorage
    const saved = localStorage.getItem('insurance_comparisons_v2');
    if (!saved) {
        console.log('No localStorage data to migrate');
        return true;
    }

    const localSessions: ComparisonSession[] = JSON.parse(saved);

    // Import sessions to Supabase
    const result = await dataApi.importData({
        sessions: localSessions.map((session) => ({
            user_id: currentUserId || 'anonymous',
            client_id: null,
            name: session.name,
            date: session.date,
            type: session.type,
            providers: session.providers,
            categories: session.categories,
            report_title_override: session.reportTitleOverride || null,
        })),
    });

    console.log(`Migration complete: ${result.sessions} sessions imported`);

    // Clear localStorage after successful migration
    localStorage.removeItem('insurance_comparisons_v2');

    return true;
};

// ==================== Data Layer API ====================

export const dataLayer = {
    // Initialize the data layer
    async init(): Promise<DataSource> {
        if (isSupabaseConfigured()) {
            // Check if user is authenticated
            const session = await userApi.getSession();
            if (session) {
                currentDataSource = 'supabase';
                const user = await userApi.getCurrentUser();
                if (user) {
                    currentUserId = user.id;
                }
            }
        }
        return currentDataSource;
    },

    // Get current data source
    getDataSource(): DataSource {
        return currentDataSource;
    },

    // Set user context
    setUserContext(userId: string | null) {
        currentUserId = userId;
    },

    // ==================== Comparison Sessions ====================

    async getSessions(): Promise<ComparisonSession[]> {
        if (currentDataSource === 'supabase') {
            const dbSessions = await comparisonApi.getAll();
            return dbSessions.map(mapDbSessionToComparison);
        }

        // Fallback to localStorage
        const saved = localStorage.getItem('insurance_comparisons_v2');
        if (saved) {
            return JSON.parse(saved);
        }

        return INITIAL_COMPARISONS;
    },

    async addSession(session: ComparisonSession): Promise<boolean> {
        if (currentDataSource === 'supabase') {
            const dbSession: Omit<DatabaseComparisonSession, 'id' | 'created_at' | 'updated_at'> = {
                user_id: currentUserId || 'anonymous',
                client_id: null,
                name: session.name,
                date: session.date,
                type: session.type,
                providers: session.providers,
                categories: session.categories,
                report_title_override: session.reportTitleOverride || null,
            };

            const created = await comparisonApi.create(dbSession);
            if (created) {
                await auditApi.logAction('comparison_create', null, session, created.id);
                return true;
            }
            return false;
        }

        // Fallback to localStorage
        const saved = localStorage.getItem('insurance_comparisons_v2');
        const sessions: ComparisonSession[] = saved ? JSON.parse(saved) : INITIAL_COMPARISONS;
        sessions.unshift(session);
        localStorage.setItem('insurance_comparisons_v2', JSON.stringify(sessions));
        return true;
    },

    async updateSession(session: ComparisonSession): Promise<boolean> {
        if (currentDataSource === 'supabase') {
            const oldDbSession = await comparisonApi.getById(session.id);
            const updated = await comparisonApi.update(session.id, {
                name: session.name,
                date: session.date,
                type: session.type,
                providers: session.providers,
                categories: session.categories,
                report_title_override: session.reportTitleOverride || null,
            });

            if (updated) {
                await auditApi.logAction(
                    'comparison_update',
                    oldDbSession as unknown as Record<string, unknown>,
                    session,
                    session.id
                );
                return true;
            }
            return false;
        }

        // Fallback to localStorage
        const saved = localStorage.getItem('insurance_comparisons_v2');
        if (saved) {
            const sessions: ComparisonSession[] = JSON.parse(saved);
            const index = sessions.findIndex((s) => s.id === session.id);
            if (index !== -1) {
                sessions[index] = session;
                localStorage.setItem('insurance_comparisons_v2', JSON.stringify(sessions));
                return true;
            }
        }
        return false;
    },

    // ==================== Clients ====================

    async getClients(): Promise<DatabaseClient[]> {
        if (currentDataSource === 'supabase') {
            return clientApi.getAll();
        }
        return [];
    },

    async getClient(id: string): Promise<DatabaseClient | null> {
        if (currentDataSource === 'supabase') {
            return clientApi.getById(id);
        }
        return null;
    },

    async createClient(
        profile: ClientProfile
    ): Promise<{ client: DatabaseClient; session: ComparisonSession } | null> {
        if (currentDataSource === 'supabase') {
            const client = await clientApi.create({
                user_id: currentUserId || 'anonymous',
                member_name: profile.memberName,
                surname: profile.surname,
                id_number: profile.idNumber,
                age: profile.age,
                occupation: profile.occupation,
                family_composition: profile.familyComposition,
                income_bracket: profile.incomeBracket,
                region: profile.region,
                primary_priority: profile.primaryPriority,
            });

            if (client) {
                await auditApi.logAction('client_create', null, profile as unknown as Record<string, unknown>, undefined, client.id);
                return { client, session: createSessionFromProfile(profile) };
            }
            return null;
        }

        // For localStorage, just return the profile without creating a client
        return { client: null as any, session: createSessionFromProfile(profile) };
    },

    // ==================== Export/Import ====================

    async exportAllData(): Promise<string> {
        if (currentDataSource === 'supabase') {
            const data = await dataApi.exportAll();
            return JSON.stringify(data, null, 2);
        }

        const saved = localStorage.getItem('insurance_comparisons_v2');
        return saved || '[]';
    },

    async importData(jsonData: string): Promise<{ sessions: number; clients: number }> {
        if (currentDataSource === 'supabase') {
            const data = JSON.parse(jsonData);
            return dataApi.importData({
                clients: data.clients,
                sessions: data.sessions,
            });
        }

        // For localStorage, just save the sessions
        const sessions = JSON.parse(jsonData);
        localStorage.setItem('insurance_comparisons_v2', JSON.stringify(sessions));
        return { sessions: sessions.length, clients: 0 };
    },

    // ==================== Audit Logs ====================

    async getAuditLogs(sessionId?: string): Promise<unknown[]> {
        if (currentDataSource === 'supabase') {
            if (sessionId) {
                return auditApi.getBySessionId(sessionId);
            }
            return auditApi.getAll();
        }
        return [];
    },
};

// ==================== Helper Functions ====================

function mapDbSessionToComparison(dbSession: DatabaseComparisonSession): ComparisonSession {
    return {
        id: dbSession.id,
        name: dbSession.name,
        date: dbSession.date,
        type: dbSession.type as ComparisonSession['type'],
        clientProfile: {
            memberName: '',
            surname: '',
            idNumber: '',
            age: '',
            occupation: '',
            familyComposition: '',
            incomeBracket: '',
            region: '',
            primaryPriority: '',
        },
        providers: dbSession.providers as Provider[],
        categories: dbSession.categories as BenefitCategory[],
        reportTitleOverride: dbSession.report_title_override || undefined,
    };
}

function createSessionFromProfile(profile: ClientProfile): ComparisonSession {
    return {
        id: Math.random().toString(36).substr(2, 9),
        name: `${profile.memberName} ${profile.surname} - Comparison`,
        date: new Date().toISOString().split('T')[0],
        type: 'Medical Aid' as any,
        clientProfile: profile,
        providers: [],
        categories: [],
    };
}
