import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zleqsdfpjepdangitcxv.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsZXFzZGZwamVwZGFuZ2l0Y3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMjk2NDIsImV4cCI6MjA3MDcwNTY0Mn0.xp7LP1luSL17pvzOP7F2l_-wG8N9dmmHDhBqrByXG4E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
