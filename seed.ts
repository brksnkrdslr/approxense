// seed.ts — approxense klasöründen çalıştır: npx tsx seed.ts

import { createClient } from "@supabase/supabase-js";
import questions from "../data/questions.json";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("Hata: .env.local dosyasında NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY tanımlı olmalı.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  // Mevcut verileri bağımlılık sırasına göre temizle
  console.log("question_stats temizleniyor...");
  const { error: e1 } = await supabase.from("question_stats").delete().neq("question_id", "00000000-0000-0000-0000-000000000000");
  if (e1) { console.error("question_stats silme hatası:", e1.message); process.exit(1); }

  console.log("answers temizleniyor...");
  const { error: e2 } = await supabase.from("answers").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (e2) { console.error("answers silme hatası:", e2.message); process.exit(1); }

  console.log("questions temizleniyor...");
  const { error: e3 } = await supabase.from("questions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (e3) { console.error("questions silme hatası:", e3.message); process.exit(1); }

  console.log(`${questions.length} soru import ediliyor...`);

  // 500 soruyı 100'lük batch'lerle ekle (Supabase limit)
  const batchSize = 100;
  let inserted: { id: string }[] = [];

  for (let i = 0; i < questions.length; i += batchSize) {
    const batch = questions.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from("questions")
      .insert(batch)
      .select();

    if (error) {
      console.error(`Batch ${i / batchSize + 1} hatası:`, error.message);
      process.exit(1);
    }

    inserted = inserted.concat(data);
    console.log(`  Batch ${i / batchSize + 1}: ${data.length} soru eklendi`);
  }

  console.log(`✓ ${inserted.length} soru başarıyla import edildi.`);

  // Her soru için question_stats kaydı oluştur
  const stats = inserted.map((q) => ({
    question_id: q.id,
    answer_count: 0,
  }));

  for (let i = 0; i < stats.length; i += batchSize) {
    const batch = stats.slice(i, i + batchSize);
    const { error: statsError } = await supabase
      .from("question_stats")
      .insert(batch);

    if (statsError) {
      console.error("Stats oluşturma hatası:", statsError.message);
      process.exit(1);
    }
  }

  console.log(`✓ ${stats.length} question_stats kaydı oluşturuldu.`);
  console.log("Seed tamamlandı.");
}

seed();
