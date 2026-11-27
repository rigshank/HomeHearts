# Issue 8: preserve intake navigation and edit answers

Implements [issue 8](https://github.com/rigshank/HomeHearts/issues/8) on `k-changes-11-27`.

## Requirement and feedback

- `Design Project/DP6/DP6-Final Demo.pdf`, p.1, UI Revise and Quality Improvement; p.4, UI Revise/Quality grading criteria.
- `Design Project/DP6/Team_17 Heuristic Evaluation Feedback.pdf`: Garrett Hockersmith pp.67,70; Musa Mudesir p.88; Mourede Otchere pp.105–106; Hoa Doan p.57; Aalvee Ahtav p.23 (primarily H3).

## Before and after

Previously, the visible intake Back button called the router's page-level Back even on questions 2/3, leaving intake instead of returning to the previous question. The active question was local component state, and results only exposed Edit location. Shared Back buttons had no fallback when a screen was opened directly.

The question is now an Expo Router search parameter. Previous question changes that parameter within the existing intake entry, leaving saved answers intact and resetting the question's scroll position. Question changes do not create new history entries. Android hardware Back uses the same behavior while intake is focused; its listener is removed on blur/unmount. Browser Back/Forward and iOS page gestures retain normal page-history behavior rather than pretending each question is a separate page.

Results offer a prominent Edit answers action starting at question 1 with stored values; Edit location starts at question 3. Back at the first edit question and successful submission dismiss to existing Matches when available, avoiding repeated results entries. Results use the current saved answers. Search data remains in the local store, not in URL query parameters.

Direct intake links cannot skip missing concern/urgency prerequisites. Legacy `location=1` links remain supported. Shared Back uses existing app history where present; without it, compare goes Home, program details go Matches, and preparation/call-script pages go to the associated provider (or Matches for unavailable programs).

## Verification, November 27, 2026

- TypeScript check passed.
- Full unit suite: 12 files, 74 tests passed. New cases cover valid/legacy/invalid/repeated step links, missing prerequisites and safe direct-entry fallback behavior.
- Browser: selected rent increase + This week, entered ZIP 75201 and increase 150, then used 3 → 2 → 1 and continued again. Fields remained populated and Continue remained enabled for the saved selections.
- Keyboard: activated Continue and Previous question using Enter; questionnaire steps updated correctly.
- Edit answers: changed concern to utility bills, urgency to Today and ZIP to 79901. Results changed to utility context and the outside-local-area 211 fallback. Edit location then changed ZIP back to 75201 and showed local utility programs.
- Browser Back returned from editing to Matches with current answers; Forward restored question 3. Reload retained question 3 and ZIP 79901.
- Repeated edit/submit/back-to-matches flows did not retain extra question screens or duplicate results entries in the tested uninterrupted flow. Browser Back after an edit/submit cycle returned to the prior browser entry rather than another copy of results.
- Opened compare, Welfare details and Welfare preparation in fresh tabs with no app history. Their visible Back controls reached Home, Matches and Welfare details respectively.
- Opened a question-3 link on a fresh browser origin with no saved intake. It normalized to question 1; selecting the concern stayed on question 1 until Continue. Back at that first question reached Home.
- Inspected desktop and 375px results layouts: Edit answers and Edit location remained visible and usable.
- Web export and whitespace checks passed.
- Final `npx --no-install expo export --platform all --output-dir .expo/issue8-final-export` passed for web, Android and iOS. This verifies native compilation, not physical hardware/gesture behavior.
- Lint remains unavailable because the repository has no ESLint configuration/dependencies; declined automatic setup to avoid unrelated changes.

No physical Android/iOS device or emulator was available. Android handling is implemented with the documented focus-scoped BackHandler API and typechecked; physical hardware/gesture behavior is not claimed as tested. The live browser, keyboard and direct-link paths were exercised. No PR, merge or deployment was created. Existing app/package configuration edits are excluded from this commit.
