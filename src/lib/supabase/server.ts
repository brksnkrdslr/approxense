import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createClient() {
  // DB sorguları için Pooler URL kullan (direkt bağlantı yerine)
  // Bu sayede DB bağlantı sınırına yaklaşınca yavaşlama değil hard cutoff yaşanır
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}
