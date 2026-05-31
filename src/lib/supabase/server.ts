import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createClient() {
  // DB sorguları için Pooler URL kullan (direkt bağlantı yerine)
  // Bu sayede DB bağlantı sınırına yaklaşınca yavaşlama değil hard cutoff yaşanır
  const url = process.env.SUPABASE_DB_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return createSupabaseClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}
