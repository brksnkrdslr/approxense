export function calculateLogScore(guess: number, actual: number): number {
  const logDiff = Math.abs(Math.log10(guess) - Math.log10(actual));
  return Math.max(0, (1 - logDiff / 2)) * 10;
}

export function calculatePercentileScore(guess: number, allAnswers: number[]): number {
  if (allAnswers.length === 0) return 0;
  const below = allAnswers.filter((a) => a < guess).length;
  const equal = allAnswers.filter((a) => a === guess).length;
  const percentile = ((below + equal * 0.5) / allAnswers.length) * 100;
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
  allAnswers: number[],
  answerCount: number
): { logScore: number; percentileScore: number; wValue: number; finalScore: number } {
  if (guess === null || guess <= 0) {
    return { logScore: 0, percentileScore: 0, wValue: calculateWValue(answerCount), finalScore: 0 };
  }

  const logScore = parseFloat(calculateLogScore(guess, actual).toFixed(2));
  const percentileScore = parseFloat(calculatePercentileScore(guess, allAnswers).toFixed(2));
  const wValue = parseFloat(calculateWValue(answerCount).toFixed(3));
  const finalScore = parseFloat(calculateFinalScore(logScore, percentileScore, wValue).toFixed(2));

  return { logScore, percentileScore, wValue, finalScore };
}
