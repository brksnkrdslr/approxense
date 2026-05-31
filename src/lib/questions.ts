import { Category, Question, QuestionPublic } from '@/types';

const CATEGORIES: Category[] = ['distance', 'scale', 'space', 'time', 'human'];
const PER_CATEGORY = 2;

export function selectBalancedQuestions(questions: Question[]): Question[] {
  const byCategory: Record<Category, Question[]> = {
    distance: [],
    scale: [],
    space: [],
    time: [],
    human: [],
  };

  for (const q of questions) {
    if (q.active && byCategory[q.category]) {
      byCategory[q.category].push(q);
    }
  }

  const selected: Question[] = [];

  for (const category of CATEGORIES) {
    const pool = byCategory[category];
    const shuffled = pool.sort(() => Math.random() - 0.5);
    selected.push(...shuffled.slice(0, PER_CATEGORY));
  }

  return selected.sort(() => Math.random() - 0.5);
}

export function toPublicQuestion(q: Question): QuestionPublic {
  return {
    id: q.id,
    category: q.category,
    question_text: q.question_text,
    unit: q.unit,
  };
}
