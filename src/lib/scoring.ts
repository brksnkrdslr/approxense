export function calculateLogScore(guess: number, actual: number): number {
  const logDiff = Math.abs(Math.log10(guess) - Math.log10(actual));
  return Math.max(0, (1 - logDiff / 2)) * 10;
}

export function calculatePercentileScore(
  belowOrEqual: number,
  total: number
): number {
  if (total === 0) return 0;
  const percentile = (belowOrEqual / total) * 100;
  return percentile / 10;
}

export function calculateWValue(answerCount: number): number {
  return Math.min(1, answerCount / 1000);
}

export function calculateFinalScore(
  logScore: number,
  percentileScore: number,
  w: number
): number {
  return (1 - w) * logScore + w * percentileScore;
}

export function computeScore(
  guess: number | null,
  actual: number,
  belowOrEqualCount: number,
  totalAnswerCount: number
): { logScore: number; percentileScore: number; wValue: number; finalScore: number } {
  if (guess === null || guess <= 0) {
    return { logScore: 0, percentileScore: 0, wValue: calculateWValue(totalAnswerCount), finalScore: 0 };
  }

  const logScore = parseFloat(calculateLogScore(guess, actual).toFixed(2));
  const percentileScore = parseFloat(calculatePercentileScore(belowOrEqualCount, totalAnswerCount).toFixed(2));
  const wValue = parseFloat(calculateWValue(totalAnswerCount).toFixed(3));
  const finalScore = parseFloat(calculateFinalScore(logScore, percentileScore, wValue).toFixed(2));

  return { logScore, percentileScore, wValue, finalScore };
}
