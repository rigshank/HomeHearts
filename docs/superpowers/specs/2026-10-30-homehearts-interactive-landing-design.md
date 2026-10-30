# HomeHearts Interactive Landing Design

## Intent

Replace the current static Home screen hero with a compact, interactive launch surface inspired by the supplied three-phone reference. The landing page should feel like the app opening up into useful possibilities, while keeping a person in housing crisis one tap away from a real next step.

The reference is used for composition and energy only. HomeHearts will not copy the smart-home content, use generated photography, or introduce a marketing-style onboarding wall.

## Goals

- Make the first viewport visually active without becoming wordy.
- Show three real HomeHearts capabilities: find help, compare paths, and prepare to call.
- Keep the primary route to intake obvious and reachable immediately.
- Use a controlled user-driven reveal: the active feature changes with compact controls, not an auto-rotating carousel.
- Preserve native Expo behavior, safe areas, reduced-motion support, and 44pt touch targets.
- Keep the landing page credible and calm: vector marks, restrained surfaces, and short labels.

## Non-goals

- No authentication or account creation on the landing page.
- No new backend data, provider catalog changes, or upload policy changes.
- No downloaded screenshots or generated photos inside the app.
- No mandatory multi-screen onboarding before intake.
- No DOM-only 21st.dev or shadcn components. Their composition patterns are adapted into native Expo primitives already used by this app.

## Approaches considered

### 1. Interactive three-feature rail — selected

One active feature preview appears beneath a short hero. Previous/next controls and labeled dots expose all three features without requiring swipe-only interaction. Each feature has a real route and a short contextual CTA.

This is the selected approach because it preserves the reference image’s sense of multiple app surfaces while keeping HomeHearts useful on the first tap.

### 2. Scenario-first launch choices

Three large crisis scenarios would route directly to urgent shelter, rent help, or move planning. This is highly actionable but would hide the broader product story and feel more like a form than the supplied reference.

### 3. Full-screen onboarding carousel

Three intro slides would closely match the reference but would add friction before someone can access help. It is rejected for the crisis context.

## Landing composition

1. Small brand/location line.
2. Short hero: “Find your next step.” with one supporting sentence.
3. Feature rail with one large active preview card and a quiet layered edge treatment suggesting the other two surfaces.
4. Compact controls: previous, feature position, next. Each control has an accessible label and the feature position is announced as selected.
5. Dynamic primary CTA tied to the active feature:
   - Find help → “Start with 3 questions” → `/intake`
   - Compare paths → “Compare stay or move” → `/compare`
   - Prepare to call → “Prepare a call” → `/plan` when a plan exists, otherwise `/intake`
6. One-line trust note: “No account needed.”
7. Existing saved-plan surface remains below the feature rail for returning users.

## Feature previews

The previews are small native compositions, not fake screenshots:

- Find help: a visual intake card with three short issue chips and a purple “matched help” status mark.
- Compare paths: two compact cost metrics and a simple relative bar comparison.
- Prepare to call: a checklist row, document mark, and call mark.

Visible copy stays to labels and values. Full explanations remain on the destination screens.

## Motion and interaction

- On first render, the rail enters with a single opacity/translate reveal using the existing Reanimated `Reveal` pattern.
- Changing the active feature uses a short fade/translate transition, approximately 220–280ms.
- No automatic rotation; users control the state so the interaction does not interrupt reading.
- `useReducedMotion()` renders the selected state immediately and skips non-essential transitions.
- Press feedback changes opacity only and never shifts layout.

## Architecture

- Add a focused `HomeFeatureRail` native component in `src/components/homeLanding.tsx`.
- Keep feature metadata and route selection in the component as typed data, with a pure `getLandingFeature` helper exported for unit tests.
- Reuse `VisualMark`, `MetricTile`, `IconRow`, `Button`, `Card`, `Reveal`, and the existing design tokens.
- Update `app/(tabs)/index.tsx` to compose the rail and remove the static “Choose a path” duplication.
- Add unit tests for feature ordering, wraparound navigation, and the no-plan call CTA fallback.

## Confirmed behavior decisions

- The landing page always opens on “Find help”; it does not persist the last selected feature.
- “Prepare to call” routes to the existing intake flow when no saved plan exists. No new intake context or state is added.

## Acceptance criteria

- Home opens with a visible feature rail and a clear action within the first viewport at 375px width.
- All three feature states are reachable by labeled controls without swiping.
- Each state routes to an existing functional HomeHearts flow.
- No visible landing copy requires more than a quick scan.
- No content is hidden under the bottom tab bar or safe areas.
- Reduced motion, large text, and narrow widths do not break the rail.
- Existing tests, typecheck, iOS export, Android export, and Expo web export remain green.

## Rollback

The pre-redesign version is committed and pushed as `735372f` on `origin/main`. The redesign must be implemented as later commits so it can be reverted or recovered with Git without losing the current working app.
