# HomeHearts Branded Landing Design

## Intent

Replace the previous static Home screen hero with a branded, direct task chooser inspired by the supplied three-phone reference. The landing page should feel like HomeHearts opening into useful possibilities, while keeping a person in housing crisis one tap away from a real next step.

The reference is used for composition and energy only. HomeHearts will not copy the smart-home content, use generated photography, or introduce a marketing-style onboarding wall.

## Goals

- Make the first viewport visually active without becoming wordy.
- Show three real HomeHearts capabilities: find help, compare paths, and prepare to call.
- Keep the primary route to intake obvious and reachable immediately.
- Use a controlled staggered reveal for the page, not an auto-rotating carousel or hidden feature state.
- Preserve native Expo behavior, safe areas, reduced-motion support, and 44pt touch targets.
- Keep the landing page credible and calm: vector marks, restrained surfaces, and short labels.
- Stack secondary actions through 430pt so common iPhone widths never compress the action cards into unreadable columns.

## Non-goals

- No authentication or account creation on the landing page.
- No new backend data, provider catalog changes, or upload policy changes.
- No downloaded screenshots or generated photos inside the app.
- No mandatory multi-screen onboarding before intake.
- No DOM-only 21st.dev or shadcn components. Their composition patterns are adapted into native Expo primitives already used by this app.

## Approaches considered

### 1. Direct task chooser — selected

One primary action and two secondary actions appear beneath a short hero. All three capabilities are visible immediately, each has a real route, and each uses a short contextual description.

This is the selected approach because it preserves the reference image’s sense of distinct app surfaces while keeping HomeHearts understandable and useful on the first tap.

### 2. Scenario-first launch choices

Three large crisis scenarios would route directly to urgent shelter, rent help, or move planning. This is highly actionable but would hide the broader product story and feel more like a form than the supplied reference.

### 3. Full-screen onboarding carousel

Three intro slides would closely match the reference but would add friction before someone can access help. It is rejected for the crisis context.

## Landing composition

1. HomeHearts mark, wordmark, and Dallas location pill.
2. Short decision prompt: “What do you need right now?” with one supporting sentence.
3. Primary branded card: “Find help now” → `/intake`, with “No account needed” as a confidence cue.
4. Two compact secondary cards: “Compare costs” → `/compare`, and “Start your plan” → `/intake` for new users or “Open my plan” → `/plan` for returning users.
5. A saved-plan continuation card for returning users, or a quiet local-save note for new users.
6. A small trust note that clearly scopes the prototype without competing with the actions.

## Feature previews

The action cards are small native compositions, not fake screenshots. They use the real HomeHearts brand mark, restrained functional colors, familiar icons, strong hierarchy, and short descriptions. Full explanations remain on the destination screens.

## Motion and interaction

- On first render, the header, prompt, actions, and continuation surfaces enter with a short staggered opacity/translate reveal using the existing Reanimated `Reveal` pattern.
- Press feedback changes opacity only and never shifts layout.
- No automatic rotation or swipe-only content; users see all important choices at once.
- `useReducedMotion()` renders the selected state immediately and skips non-essential transitions.

## Architecture

- Add a focused `HomeStartOptions` native component in `src/components/homeLanding.tsx`.
- Keep feature metadata and route selection in the component as typed data, with a pure `getLandingFeature` helper exported for unit tests.
- Reuse `BrandMark`, `IconRow`, `Card`, `Reveal`, Ionicons, and the existing design tokens.
- Keep the phone/tablet action breakpoint pure and testable with `getLandingActionLayout` in `src/components/homeLandingModel.ts`.
- Update `app/(tabs)/index.tsx` to compose the branded chooser and remove the generic “Choose a path” duplication.
- Add unit tests for feature ordering, wraparound navigation, and the no-plan call CTA fallback.

## Confirmed behavior decisions

- The landing page always opens with “Find help now” as the primary action; it does not persist temporary landing UI state.
- “Prepare to call” routes to the existing intake flow when no saved plan exists. No new intake context or state is added.

## Acceptance criteria

- Home opens with a visible HomeHearts identity and a clear action within the first viewport at 375px width.
- All three product capabilities are visible as labeled, directly tappable choices without swiping.
- At 375pt, 393pt, and 430pt, secondary actions stack with no clipped titles or descriptions; wider tablet layouts may use two columns.
- Each state routes to an existing functional HomeHearts flow.
- No visible landing copy requires more than a quick scan.
- No content is hidden under the bottom tab bar or safe areas.
- Reduced motion, large text, and narrow widths do not break the rail.
- Existing tests, typecheck, iOS export, Android export, and Expo web export remain green.

## Rollback

The pre-redesign version is committed and pushed as `735372f` on `origin/main`. The redesign must be implemented as later commits so it can be reverted or recovered with Git without losing the current working app.
