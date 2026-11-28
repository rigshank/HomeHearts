import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Button, HText, Screen } from './ui';
import { useCatalogStore } from '../state/useCatalogStore';
import { useHomeHeartsStore } from '../state/useHomeHeartsStore';
import { colors, spacing } from '../design/tokens';

/** Recovery never initializes, clears or replaces saved progress. */
export function ProgramRecovery({ message = 'This program is unavailable.', showSavedPlan = true }: { message?: string; showSavedPlan?: boolean }) {
  const router = useRouter();
  const refresh = useCatalogStore((state) => state.refresh);
  const syncing = useCatalogStore((state) => state.syncing);
  const savedId = useHomeHeartsStore((state) => state.savedPlanProgramId);
  const [feedback, setFeedback] = useState('');
  const retry = async () => {
    setFeedback('');
    try { await refresh(); setFeedback(useCatalogStore.getState().error ?? 'Provider list refreshed. If this program is still unavailable, return to matches.'); }
    catch { setFeedback('The provider list could not refresh. Your saved progress is unchanged.'); }
  };
  return <Screen contentStyle={{ gap: spacing.md }}>
    <HText variant="title">{message}</HText>
    <HText color={colors.muted}>Your saved checklist and documents have been kept. Try refreshing the provider list or choose another match.</HText>
    <Button onPress={retry} disabled={syncing}>{syncing ? 'Refreshing…' : 'Retry'}</Button>
    <Button variant="secondary" onPress={() => router.replace('/matches')}>Return to matches</Button>
    {showSavedPlan && savedId && <Button variant="ghost" onPress={() => router.replace('/plan')}>View saved plan</Button>}
    {Boolean(feedback) && <HText accessibilityLiveRegion="polite" aria-live="polite" variant="caption">{feedback}</HText>}
  </Screen>;
}
