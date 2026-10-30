# HomeHearts Phone-First Visual Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing HomeHearts Expo app more visual, minimal, and phone-first without changing its product behavior.

**Architecture:** Add small native visual primitives and compose them into the existing Expo Router screens. Keep domain, persistence, uploads, and program data untouched; only presentation and local screen state change.

**Tech Stack:** Expo React Native, TypeScript, Expo LinearGradient, Ionicons, Reanimated, StyleSheet, existing design tokens.

**Spec:** `docs/superpowers/specs/2026-10-29-homehearts-phone-first-visual-refinement-design.md`

## Global Constraints

- Primary QA viewport is a 375–390 px phone.
- Use vector icons, not emoji or raster decoration.
- Keep interactive targets at least 44 pt.
- Preserve safe-area insets, accessibility labels, reduced motion, and current route behavior.
- Keep essential trust, privacy, status, and safety language.
- Do not change matching, costs, uploads, persistence, or provider data.

## Review Focus

- Long crisis titles wrapping in compact tiles: test all 11 intake choices at phone width.
- Decorative visuals competing with primary actions: verify the first viewport still has one dominant CTA.
- Compact cards losing accessible context: keep visible labels and meaningful roles/labels.
- Scroll content under the floating tab bar: verify bottom padding on Home, Matches, Plan, and Compare.
- Reduced-motion and narrow-width layout: verify no layout shift or clipped text when animations are disabled.

### Task 1: Native visual primitives

**Files:**
- Create: `src/components/visuals.tsx`
- Modify: `src/components/ui.tsx`
- Modify: `src/design/tokens.ts`

**Interfaces:**
- `VisualMark({ icon, tone, size, label? })` renders a gradient-backed vector visual with an accessible label when meaningful.
- `MetricTile({ icon, label, value, tone? })` renders one compact value/label pair.
- `IconRow({ icon, title, detail?, tone? })` renders a compact semantic row.
- `IssueTile({ icon, title, selected, onPress })` renders a 2-column-friendly radio tile with a 44 pt target.

- [x] Add the primitives with token-driven spacing, colors, radii, and press states.
- [x] Add reduced-motion-safe visual treatment; do not animate layout dimensions.
- [x] Run `npm run typecheck` and verify the primitives compile on web export.

### Task 2: Home and intake visual compression

**Files:**
- Modify: `app/(tabs)/index.tsx`
- Modify: `app/intake.tsx`

**Interfaces:**
- Home composes `VisualMark`, `IconRow`, and compact action cards.
- Intake uses `IssueTile` for issue selection and keeps existing `IssueType` values and store actions.

- [x] Replace the Home hero icon with a visual mark and shorten the supporting copy.
- [x] Add a visual “three steps” rail: Tell us, See options, Take a step.
- [x] Convert issue selection to a compact two-column tile grid while preserving radio semantics.
- [x] Keep ZIP validation, rent-increase input, and all 11 crisis categories intact.
- [x] Run the browser smoke flow Home → Intake → Matches at a phone viewport.

### Task 3: Matches, compare, plan, and call-script polish

**Files:**
- Modify: `app/(tabs)/matches.tsx`
- Modify: `app/compare.tsx`
- Modify: `app/(tabs)/plan.tsx`
- Modify: `app/matches/[programId]/call-script.tsx`
- Modify: `app/matches/[programId].tsx`
- Modify: `app/matches/[programId]/application.tsx`

**Interfaces:**
- Screens keep their existing route params and store selectors.
- Detail and checklist actions remain the same; only composition and copy density change.

- [x] Add category/visual marks and compress match-card copy to one visible reason.
- [x] Use metric tiles for compare totals and icon-led input rows without changing the cost engine.
- [x] Make plan tasks and document rows scanable with one-line detail and prominent state visuals.
- [x] Give the call script a visual script block and compact numbered question rows.
- [x] Compress program-detail and checklist copy while retaining source, eligibility, document, and privacy details.
- [x] Run `npm run typecheck` and `npm run test:unit`.

### Task 4: Phone QA and regression verification

**Files:**
- No new source files.

- [x] Run `npx expo export --platform web`.
- [x] Test 375 px and 390 px portrait layouts; inspect Home, Intake, Matches, Compare, Details, Application, Plan, and Script.
- [x] Verify no horizontal overflow, no content hidden behind the tab bar, and no clipped long labels.
- [x] Verify direct routes, back navigation, document actions, and plan state remain functional.
- [x] Record any remaining production caveats separately from visual polish.
