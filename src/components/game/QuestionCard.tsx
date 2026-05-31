import { QuestionPublic } from '@/types';
import { numberToTurkish } from '@/lib/utils';

interface QuestionCardProps {
  question: QuestionPublic;
  round: number;
  total: number;
  inputValue: string;
}

function renderQuestionText(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} style={{ color: 'var(--color-accent)' }}>
        {part}
      </strong>
    ) : (
      part
    )
  );
}

export default function QuestionCard({ question, round, total, inputValue }: QuestionCardProps) {
  return (
    <div className="px-5 pt-6 pb-4">
      <div className="flex items-center justify-center mb-4">
        <span
          className="text-sm font-medium"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {round} / {total}
        </span>
      </div>

      <p
        className="text-xl font-medium leading-snug mb-8 text-center"
        style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-sans)' }}
      >
        {renderQuestionText(question.question_text)}
      </p>

      <div
        className="rounded-[12px] border px-4 py-4 text-right"
        style={{
          backgroundColor: 'var(--color-surface-alt)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-baseline justify-end gap-2">
          <span
            className="text-3xl font-mono font-medium tracking-tight"
            style={{ color: inputValue ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}
          >
            {inputValue ? parseInt(inputValue, 10).toLocaleString('tr-TR') : '—'}
          </span>
          {inputValue && (
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {question.unit}
            </span>
          )}
        </div>
        {inputValue && parseInt(inputValue, 10) >= 1000 && (
          <p
            className="text-xs mt-1 truncate"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {numberToTurkish(parseInt(inputValue, 10))}
          </p>
        )}
      </div>
    </div>
  );
}
