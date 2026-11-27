import { describe, expect, it, vi } from 'vitest';
vi.mock('react-native', () => ({ Platform: { select: (options: { default: unknown }) => options.default } }));
import { colors } from './tokens';

function luminance(hex: string) {
  const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255)
    .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

describe('small text foreground/background contrast', () => {
  it.each([
    ['muted', 'canvas'], ['muted', 'surface'], ['muted', 'primarySoft'], ['muted', 'coralSoft'],
    ['success', 'successSoft'], ['warning', 'warningSoft'], ['coralInk', 'coralSoft'],
    ['primary', 'primarySoft'], ['white', 'primary'], ['white', 'danger'],
  ] as const)('%s on %s meets the 4.5:1 normal-text threshold', (foreground, background) => {
    const values = [luminance(colors[foreground]), luminance(colors[background])].sort((a, b) => a - b);
    expect((values[1] + 0.05) / (values[0] + 0.05)).toBeGreaterThanOrEqual(4.5);
  });
});
