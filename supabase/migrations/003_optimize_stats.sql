-- 003: Optimize question_stats — remove answers array, add atomic increment RPC

-- 1. answers[] array kolonunu kaldır (artık answers tablosundan hesaplanıyor)
ALTER TABLE question_stats DROP COLUMN IF EXISTS answers;

-- 2. Atomik answer_count artırımı için RPC fonksiyonu
CREATE OR REPLACE FUNCTION increment_answer_count(qid UUID)
RETURNS void
LANGUAGE sql
AS $$
  INSERT INTO question_stats (question_id, answer_count)
  VALUES (qid, 1)
  ON CONFLICT (question_id)
  DO UPDATE SET
    answer_count = question_stats.answer_count + 1,
    updated_at = NOW();
$$;
