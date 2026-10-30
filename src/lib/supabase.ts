import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabase = Boolean(url && anonKey);
export const supabase = hasSupabase ? createClient(url as string, anonKey as string, { auth: { storage: undefined, autoRefreshToken: true, persistSession: false, detectSessionInUrl: false } }) : null;

