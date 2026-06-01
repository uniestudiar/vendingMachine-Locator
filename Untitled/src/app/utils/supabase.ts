import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://axawjnoxdlnbicnsxlwj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4YXdqbm94ZGxuYmljbnN4bHdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNjkzMzEsImV4cCI6MjA5NTg0NTMzMX0.FVg-2ah8ZK5AQwFhoLAubrxDO-Rxk4FzEiBRgZ9hb_I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const API_URL = `https://${supabaseUrl.split('//')[1].split('.')[0]}.supabase.co/functions/v1/make-server-de060722`;

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  emailTemplate?: string;
}

// Helper to get auth header
export const getAuthHeader = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ? `Bearer ${data.session.access_token}` : null;
};

// API call helper
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const authHeader = await getAuthHeader();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authHeader ? { Authorization: authHeader } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};
