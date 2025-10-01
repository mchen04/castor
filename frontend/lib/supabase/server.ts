import { auth } from '@clerk/nextjs/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function createClient() {
  const { getToken } = await auth()

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      accessToken: async () => await getToken() ?? null
    }
  )
}