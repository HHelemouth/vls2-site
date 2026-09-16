import { createClient } from '@supabase/supabase-js'

// Clé "anon public" : elle est faite pour être visible côté client, la
// sécurité vient des policies RLS définies dans Supabase, pas du secret de
// cette clé.
const SUPABASE_URL = 'https://banqzmfknzntngyshumz.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhbnF6bWZrbnpudG5neXNodW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NTg0NzMsImV4cCI6MjEwNTEzNDQ3M30.UKc8huM1xRY88ZfYxHupuqsjsqN7adA2QABc2Jn_Zrc'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
