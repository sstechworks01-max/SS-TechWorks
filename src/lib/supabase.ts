import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 20 &&
    !supabaseUrl.includes('placeholder')
  );
};

// Create a safe client instance that does not throw if env vars are unconfigured
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export interface ConnectionStatus {
  isConfigured: boolean;
  message: string;
}

export const checkSupabaseConnection = async (): Promise<ConnectionStatus> => {
  if (!isSupabaseConfigured()) {
    return {
      isConfigured: false,
      message: 'Supabase credentials are not yet configured in environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).',
    };
  }

  try {
    const { error } = await supabase.from('services').select('count', { count: 'exact', head: true });
    if (error) {
      return {
        isConfigured: true,
        message: `Connected to Supabase, but encountered database query issue: ${error.message}. Please ensure migrations are applied.`,
      };
    }
    return {
      isConfigured: true,
      message: 'Successfully connected to Supabase backend and database tables are reachable.',
    };
  } catch (err: any) {
    return {
      isConfigured: false,
      message: `Failed to connect to Supabase: ${err?.message || 'Network error'}`,
    };
  }
};
