import { describe, expect, it, vi } from 'vitest';
import { goBackSafely } from './back';

describe('direct-entry back navigation', () => {
  it('returns to an existing app history entry when there is one', () => {
    const navigation = { canGoBack: () => true, back: vi.fn(), replace: vi.fn() };
    goBackSafely(navigation, '/matches');
    expect(navigation.back).toHaveBeenCalledOnce();
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it('replaces a history-less screen with its contextual fallback instead of dispatching an invalid back', () => {
    const navigation = { canGoBack: () => false, back: vi.fn(), replace: vi.fn() };
    const program = { pathname: '/matches/[programId]' as const, params: { programId: 'dallas-county-welfare' } };
    goBackSafely(navigation, program);
    expect(navigation.replace).toHaveBeenCalledWith(program);
    expect(navigation.back).not.toHaveBeenCalled();
    navigation.replace.mockClear();
    goBackSafely(navigation);
    expect(navigation.replace).toHaveBeenCalledWith('/(tabs)');
  });
});
