import { describe, expect, it } from 'vitest';
import { almostEqual, formatMs, parseTimeStr, sumSplits } from '../lib/time';

describe('parseTimeStr', () => {
  const cases: Array<[string, number]> = [
    ['59.83', 59830],
    ['1:02.1', 62100],
    ['1:02.123', 62123],
    ['32', 32000],
    ['2:00', 120000]
  ];

  for (const [input, expected] of cases) {
    it(`parses ${input}`, () => {
      expect(parseTimeStr(input)).toBe(expected);
    });
  }
});

describe('formatMs', () => {
  it('shows hundredths by default', () => {
    expect(formatMs(59830)).toBe('59.83');
  });

  it('shows milliseconds when opted', () => {
    expect(formatMs(62123, { showHundredths: false })).toBe('1:02.123');
  });
});

describe('sumSplits', () => {
  it('sums and compares', () => {
    const splits = [15000, 16000, 17000];
    const total = sumSplits(splits);
    expect(total).toBe(48000);
    expect(almostEqual(total, 48100)).toBe(true);
    expect(almostEqual(total, 49000)).toBe(false);
  });
});
