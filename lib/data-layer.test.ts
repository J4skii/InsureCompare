import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dataLayer } from './data-layer';
import * as supabaseModule from './supabase';
import { INITIAL_COMPARISONS } from '../constants';

vi.mock('./supabase', () => ({
    supabase: {
        auth: {
            getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
            getUser: vi.fn(() => Promise.resolve({ data: { user: null } })),
        },
    },
    isSupabaseConfigured: vi.fn(() => false),
}));

describe('dataLayer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should initialize with localstorage when supabase is not configured', async () => {
        const source = await dataLayer.init();
        expect(source).toBe('localstorage');
        expect(dataLayer.getDataSource()).toBe('localstorage');
    });

    it('should get sessions from localStorage if supabase is not used', async () => {
        const mockSessions = [{ id: '1', name: 'Test' }];
        localStorage.setItem('insurance_comparisons_v2', JSON.stringify(mockSessions));

        const sessions = await dataLayer.getSessions();
        expect(sessions).toEqual(mockSessions);
    });

    it('should return INITIAL_COMPARISONS if localStorage is empty', async () => {
        const sessions = await dataLayer.getSessions();
        expect(sessions).toEqual(INITIAL_COMPARISONS);
    });

    it('should add a session to localStorage', async () => {
        const newSession = { id: 'new-1', name: 'New Session', providers: [], categories: [] } as any;
        const success = await dataLayer.addSession(newSession);

        expect(success).toBe(true);
        const saved = JSON.parse(localStorage.getItem('insurance_comparisons_v2') || '[]');
        expect(saved[0]).toEqual(newSession);
    });

    it('should update a session in localStorage', async () => {
        const mockSessions = [{ id: '1', name: 'Old' }];
        localStorage.setItem('insurance_comparisons_v2', JSON.stringify(mockSessions));

        const updatedSession = { id: '1', name: 'Updated' } as any;
        const success = await dataLayer.updateSession(updatedSession);

        expect(success).toBe(true);
        const saved = JSON.parse(localStorage.getItem('insurance_comparisons_v2') || '[]');
        expect(saved[0].name).toBe('Updated');
    });
});
