import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env'

// Only instantiate when real keys are present; mock mode doesn't use this.
export const supabase = createClient(
  env.supabaseUrl || 'https://placeholder.supabase.co',
  env.supabaseAnonKey || 'placeholder',
)
