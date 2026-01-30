import { useCallback, useEffect, useState } from 'react';
import { AdminUser } from '../types';
import { fetchAdminProfile } from '../services/supabaseService';
import { supabase } from '../supabaseClient';

interface AuthState {
  admin: AdminUser | null;
  loading: boolean;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({ admin: null, loading: true });

  const loadProfile = useCallback(async () => {
    try {
      const admin = await fetchAdminProfile();
      setState({ admin, loading: false });
    } catch (error) {
      console.error('Failed to load admin profile', error);
      setState({ admin: null, loading: false });
    }
  }, []);

  useEffect(() => {
    loadProfile();
    const { data } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, [loadProfile]);

  return state;
};
