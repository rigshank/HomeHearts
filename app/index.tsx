import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import LandingExperience from '../src/components/landingExperience';
import { colors } from '../src/design/tokens';
import { hasCompletedLanding } from '../src/state/landingSession';
import { useHomeHeartsStore } from '../src/state/useHomeHeartsStore';

export default function Index() {
  const [hydrated, setHydrated] = useState(useHomeHeartsStore.persist.hasHydrated());
  const hasJourney = useHomeHeartsStore((state) => Boolean(state.intake.issue || state.savedPlanProgramId || state.planTasks.length));

  useEffect(() => {
    const unsubscribe = useHomeHeartsStore.persist.onFinishHydration(() => setHydrated(true));
    return unsubscribe;
  }, []);

  if (!hydrated) return <View style={{ flex: 1, backgroundColor: colors.harborDeep }} />;
  if (hasCompletedLanding() || hasJourney) return <Redirect href="/(tabs)" />;
  return <LandingExperience />;
}
