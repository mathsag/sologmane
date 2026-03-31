import { createClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const svc  = process.env.SUPABASE_SERVICE_KEY!

// Brukes på nettsiden (public read)
export const supabase = createClient(url, anon)

// Brukes i admin (full tilgang) — kun server-side
export const supabaseAdmin = createClient(url, svc)