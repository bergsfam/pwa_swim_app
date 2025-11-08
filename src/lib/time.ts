const msPerSecond = 1000;

const patternMinuteSecondFraction = /^(\d+):(\d{2})\.(\d{2,3})$/;
const patternMinuteSecond = /^(\d+):(\d{2})$/;
const patternSecondFraction = /^(\d{1,2})\.(\d{2,3})$/;
const patternSecond = /^(\d+)$/;

export const parseTimeStr = (input: string): number => {
  const value = input.trim();
  if (!value) {
    throw new Error('Empty time string');
  }

  let match = value.match(patternMinuteSecondFraction);
  if (match) {
    const minutes = Number(match[1]);
    const seconds = Number(match[2]);
    const fraction = match[3].padEnd(3, '0');
    return (minutes * 60 + seconds) * msPerSecond + Number(fraction);
  }

  match = value.match(patternMinuteSecond);
  if (match) {
    const minutes = Number(match[1]);
    const seconds = Number(match[2]);
    return (minutes * 60 + seconds) * msPerSecond;
  }

  match = value.match(patternSecondFraction);
  if (match) {
    const seconds = Number(match[1]);
    const fraction = match[2].padEnd(3, '0');
    return seconds * msPerSecond + Number(fraction);
  }

  match = value.match(patternSecond);
  if (match) {
    return Number(match[1]) * msPerSecond;
  }

  throw new Error(`Unsupported time format: ${input}`);
};

export const formatMs = (
  ms: number,
  options: { showHundredths?: boolean } = {}
): string => {
  const showHundredths = options.showHundredths !== false;
  const totalSeconds = Math.floor(ms / msPerSecond);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const remainder = ms % msPerSecond;

  const precision = showHundredths ? 2 : 3;
  const divisor = showHundredths ? 10 : 1;
  const rounded = Math.round(remainder / divisor);
  const padded = rounded.toString().padStart(precision, '0');

  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${padded}`;
  }

  return `${seconds}.${padded}`;
};

export const sumSplits = (splitsMs: number[]): number =>
  splitsMs.reduce((acc, split) => acc + split, 0);

export const almostEqual = (a: number, b: number, tolMs = 150): boolean =>
  Math.abs(a - b) <= tolMs;
