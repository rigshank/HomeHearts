let completedInSession = false;

export function hasCompletedLanding() {
  return completedInSession;
}

export function markLandingCompleted() {
  completedInSession = true;
}
