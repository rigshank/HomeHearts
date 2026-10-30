# HomeHearts Phone-First Visual Refinement

## Intent

Make HomeHearts feel like a calm mobile guide instead of a text-heavy form. The app must remain trustworthy for people in housing crisis while becoming faster to scan, more visual, and easier to navigate one-handed.

## Goals

- Make the 390 px phone layout the primary design target.
- Reduce repeated explanatory copy without hiding essential safety, status, or privacy information.
- Use consistent vector iconography, restrained flat color surfaces, compact metric cards, and visual progress cues.
- Keep every existing flow and real interaction: intake, matching, source links, document picker, preview/replace/remove, saved plan, rescheduling, call script, copy, and phone fallback.
- Preserve safe areas, minimum 44 pt touch targets, screen-reader labels, reduced motion, and color-independent status signals.

## Non-goals

- No new backend, authentication, provider API, or upload policy.
- No replacement of the curated Dallas data.
- No DOM-only shadcn or 21st.dev dependency; use their composition and visual-system principles through native Expo primitives.

## Visual direction

Use a “visual-first guide” system: one short headline, one visual anchor, one primary action, and compact supporting rows per screen. The palette stays lavender/coral/ink from the Figma reference. Graphics are flat vector icon tiles and small status marks rather than generated photos, decorative orbs, or large downloaded illustrations, so the screens remain credible, fast, and Expo Go-friendly.

## Screen decisions

- Home: flat hero mark, short hero copy, two compact action cards, a three-step visual rail, and a small trust footer.
- Intake: compact two-column issue tiles with icon + title; urgency remains a short choice list; location keeps only essential helper text.
- Matches: a compact source/status header and cards with score, category icon, one reason, and a details affordance; full explanation remains on the detail screen.
- Program detail: visual assistance metrics and disclosure-style eligibility/source sections to reduce scanning load.
- Compare: icon-led input rows, compact result metrics, and the chart as the primary visual instead of repeated prose.
- Application and Plan: compact document/task rows with strong status visuals and only one-line guidance.
- Call script: large readable script card, icon-led questions, and clear copy/call controls.

## Architecture

Add focused native primitives in `src/components/visuals.tsx` and `src/components/ui.tsx`; screens compose them rather than adding per-screen visual hacks. Keep animation limited to opacity/transform using the existing `Reveal` system and reduced-motion support.

## Acceptance

- All canonical routes render without horizontal overflow at 375–390 px.
- The issue intake fits more useful choices into the first phone viewport and still exposes all crisis categories through scroll.
- Home, Matches, Compare, Plan, and Call Script each have a clear visual anchor above the fold.
- No required trust, privacy, status, or safety copy is removed.
- Existing typecheck, unit tests, Expo web export, and manual flow smoke test remain green.
