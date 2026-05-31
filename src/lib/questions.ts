import { Category, Question, QuestionPublic, GameSettings, ALL_CATEGORIES } from '@/types';

const QUESTIONS_PER_GAME = 10;

export function selectQuestions(questions: Question[], settings: GameSettings): Question[] {
  const activeCategories = settings.categories.length > 0 ? settings.categories : ALL_CATEGORIES;
  const pool = questions.filter((q) => q.active && activeCategories.includes(q.category));
  return [...pool].sort(() => Math.random() - 0.5).slice(0, QUESTIONS_PER_GAME);
}

// Eski isim — geriye dönük uyumluluk
export function selectBalancedQuestions(questions: Question[]): Question[] {
  return selectQuestions(questions, { duration: 30, categories: ALL_CATEGORIES });
}

export function toPublicQuestion(q: Question): QuestionPublic {
  return {
    id: q.id,
    category: q.category,
    question_text: q.question_text,
    unit: q.unit,
  };
}

export function getSettings(): GameSettings {
  if (typeof window === 'undefined') return { duration: 30, categories: ALL_CATEGORIES };
  try {
    const raw = localStorage.getItem('approxense_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.duration && Array.isArray(parsed.categories) && parsed.categories.length > 0) {
        return parsed as GameSettings;
      }
    }
  } catch {}
  return { duration: 30, categories: [...ALL_CATEGORIES] };
}

export function saveSettings(settings: GameSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('approxense_settings', JSON.stringify(settings));
}
