# HomeHearts Interactive Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static Home hero/action stack with a minimal interactive three-feature launch rail that routes into the existing HomeHearts flows.

**Architecture:** Keep feature metadata and route fallback logic pure and independently testable in `src/components/homeLandingModel.ts`. Build a focused native `HomeFeatureRail` in `src/components/homeLanding.tsx` from existing tokenized `Button`, `Card`, `IconButton`, `HText`, `VisualMark`, `MetricTile`, and `CompactSurface` primitives, then compose it from the Home route. The rail owns only temporary selected-feature UI state; the store remains the source of saved-plan state.

**Tech Stack:** Expo SDK 58, Expo Router, React Native, TypeScript, React Native Reanimated, Ionicons, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-30-homehearts-interactive-landing-design.md`

## Global Constraints

- Always open the rail on “Find help”; do not persist the last selected feature.
- “Prepare to call” routes to the existing intake flow when no saved plan exists.
- Use only existing native Expo primitives and design tokens; do not add DOM-only 21st.dev or shadcn dependencies.
- Keep visible landing copy short and preserve the existing functional routes.
- Use vector icons, Pressable feedback, safe-area spacing, minimum 44pt controls, and reduced-motion handling.
- No auto-rotating carousel and no generated photos or downloaded screenshots.

## Review Focus

- Narrow phone width: the active preview, controls, CTA, and trust line must fit without horizontal overflow. Test in `homeLandingModel.test.ts` for state logic and verify visually at 375px.
- No saved plan: the call feature must route to `/intake`, not `/plan`. Pin this in `homeLandingModel.test.ts`.
- Wraparound controls: previous from the first feature and next from the last must stay within the three-feature set. Pin this in `homeLandingModel.test.ts`.
- Reduced motion: the component must skip the entrance transition when `useReducedMotion()` is true. Verify by code inspection and native/web export.
- Dynamic text: feature title/detail must be allowed to wrap without clipping. Verify the component has no essential `numberOfLines={1}` constraints and inspect the live screen.

### Task 1: Landing feature model

**Files:**
- Create: `src/components/homeLandingModel.ts`
- Test: `src/components/homeLandingModel.test.ts`

**Interfaces:**
- Produces `LandingFeatureId`, `LandingRoute`, `LANDING_FEATURES`, `getLandingFeature(index: number)`, and `getLandingRoute(featureId: LandingFeatureId, hasPlan: boolean)` for the UI component and Home route.

- [x] **Step 1: Write the failing model tests**

  Add tests for:

  - `LANDING_FEATURES` order is `help`, `compare`, `call`.
  - `getLandingFeature(-1)` returns `call` and `getLandingFeature(3)` returns `help`.
  - `getLandingRoute('help', false)` returns `/intake`.
  - `getLandingRoute('compare', false)` returns `/compare`.
  - `getLandingRoute('call', false)` returns `/intake` and `getLandingRoute('call', true)` returns `/plan`.

- [x] **Step 2: Run the focused tests and verify they fail**

  Run: `npx vitest run src/components/homeLandingModel.test.ts`

  Expected: FAIL because `homeLandingModel.ts` does not exist yet.

- [x] **Step 3: Implement the typed model**

  Define the three feature records with the exact short labels and route behavior from the spec. Use modulo normalization in `getLandingFeature` so previous/next controls can wrap without exposing invalid indexes.

- [x] **Step 4: Run the focused tests and verify they pass**

  Run: `npx vitest run src/components/homeLandingModel.test.ts`

  Expected: PASS with 4 behavioral tests.

### Task 2: Native feature rail

**Files:**
- Create: `src/components/homeLanding.tsx`
- Modify: `src/components/ui.tsx` only if a missing shared control accessibility prop is required

**Interfaces:**
- Consumes the model exports from Task 1.
- Produces `HomeFeatureRail({ hasPlan: boolean; onNavigate: (route: LandingRoute) => void })`.

- [x] **Step 1: Implement the rail shell and selected-feature state**

  Start `activeIndex` at `0`. Render one active feature preview inside a bordered card with a small layered background treatment. Render previous/next `IconButton`s with labels `Previous landing feature` and `Next landing feature`, and three selected-state dot/tab controls with labels containing the feature title and position.

- [x] **Step 2: Implement the three compact previews**

  Keep each preview visual-first and short:

  - Help: `VisualMark` plus three issue chips and a matched-help status row.
  - Compare: two `MetricTile`s and a restrained horizontal comparison bar.
  - Call: a checklist row, document icon, and call icon.

  Use existing `colors`, `radii`, `spacing`, `HText`, `CompactSurface`, and Ionicons. Do not use photos, gradients, emojis, or unsupported DOM components.

- [x] **Step 3: Add motion and CTA behavior**

  Use the existing reduced-motion hook and Reanimated opacity/translate entrance for the active preview. Render the dynamic CTA label and call `onNavigate(getLandingRoute(feature.id, hasPlan))`. Keep the state user-controlled; do not add an interval or auto-rotation.

- [x] **Step 4: Run typecheck**

  Run: `npm run typecheck`

  Expected: PASS with no new TypeScript errors.

### Task 3: Compose Home around the rail

**Files:**
- Modify: `app/(tabs)/index.tsx`

**Interfaces:**
- Consumes `HomeFeatureRail` from Task 2 and `savedPlanProgramId` from the existing store.

- [x] **Step 1: Replace the static hero/action duplication**

  Keep the brand/location line, short hero title, trust line, and saved-plan continuation card. Remove the static “Choose a path” heading, two-card action grid, and redundant step rail. Place `HomeFeatureRail` directly under the short hero copy so the first viewport leads with the interactive product preview.

- [x] **Step 2: Wire route navigation**

  Pass `hasPlan={Boolean(selectedProgramId)}` and navigate using `router.push`. Preserve `/intake`, `/compare`, and `/plan` as the only landing destinations.

- [x] **Step 3: Inspect layout at phone widths**

  Run the Expo web preview and inspect Home at 375px and a wider tablet-like width. Confirm no clipped feature labels, no horizontal overflow, no content behind the tab bar, and a visible first action without excessive copy.

### Task 4: Full verification and review

**Files:**
- Modify: `docs/superpowers/plans/2026-10-30-homehearts-interactive-landing-plan.md` to check completed steps
- Modify: `.superpowers/sdd/2026-10-30-homehearts-interactive-landing-plan/progress.md` if the ignored SDD ledger is used

- [x] **Step 1: Run all automated checks**

  Run: `npm run typecheck`

  Run: `npm run test:unit`

  Run: `npx expo export --platform web`

  Run: `npx expo export --platform ios && npx expo export --platform android`

  Expected: all commands exit 0; Vitest reports all test files passing; native and web bundles complete.

- [x] **Step 2: Run the live visual audit**

  Inspect Home, then activate each feature and verify its destination route. Check the initial reveal, previous/next controls, selected dot state, reduced-motion-safe static state, and saved-plan CTA fallback.

- [x] **Step 3: Ask a fresh reviewer to inspect the completed change**

  The reviewer should focus on phone composition, copy density, accessibility labels, route behavior, and whether the reference inspiration was adapted without introducing fake content.

- [x] **Step 4: Commit the redesign locally**

  ```bash
  git add app/(tabs)/index.tsx src/components/homeLanding.tsx src/components/homeLandingModel.ts src/components/homeLandingModel.test.ts docs/superpowers/specs/2026-10-30-homehearts-interactive-landing-design.md docs/superpowers/plans/2026-10-30-homehearts-interactive-landing-plan.md
  git commit -m "feat: add interactive HomeHearts landing rail"
  ```

  Keep the baseline commit `735372f` on `origin/main` as the rollback point unless the user explicitly asks to push the redesign.
