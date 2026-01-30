// Supabase Edge Function: remove-admin
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase service configuration.');
    }
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: authHeader,
        apikey: SUPABASE_ANON_KEY
      }
    });

    if (!userResponse.ok) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const userData = await userResponse.json();
    const userId = userData?.id;

    const adminResponse = await fetch(`${SUPABASE_URL}/rest/v1/admins?id=eq.${userId}&select=role`, {
      headers: {
        Authorization: authHeader,
        apikey: SUPABASE_ANON_KEY
      }
    });

    if (!adminResponse.ok) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const adminData = await adminResponse.json();
    const role = adminData?.[0]?.role;

    if (role !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const { adminId } = await req.json();
    if (!adminId || typeof adminId !== 'string') {
      return new Response(JSON.stringify({ error: 'adminId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const deleteAdminResponse = await fetch(`${SUPABASE_URL}/rest/v1/admins?id=eq.${adminId}`, {
      method: 'DELETE',
      headers: {
        Authorization: authHeader,
        apikey: SUPABASE_ANON_KEY
      }
    });

    if (!deleteAdminResponse.ok) {
      const errorText = await deleteAdminResponse.text();
      return new Response(JSON.stringify({ error: errorText }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const deleteAuthResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${adminId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        apikey: SERVICE_ROLE_KEY
      }
    });

    if (!deleteAuthResponse.ok) {
      const errorText = await deleteAuthResponse.text();
      return new Response(JSON.stringify({ error: errorText }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('remove-admin error', error);
    return new Response(JSON.stringify({ error: 'Failed to remove admin.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
