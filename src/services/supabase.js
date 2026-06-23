import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tfhjcosfsexbecpmxyau.supabase.co'
const supabaseKey = 'sb_publishable_ptY-8ErlG2gkfx833zDdyg_H9YXE7Nb'
export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)


