# Issue 20: preserve progress during provider switching

Implements [issue 20](https://github.com/rigshank/HomeHearts/issues/20) on `k-changes-11-27`.

## Requirement and feedback

- `Design Project/DP6/DP6-Final Demo.pdf`, PDF p.1, **UI Revise and Quality Improvement**, bullets 1–3; p.4, **UI Revise** and **Quality** grading criteria.
- `Design Project/DP6/Team_17 Heuristic Evaluation Feedback.pdf`: Musa Mudesir Problem 7 p.91 (H9, major), specifically Welfare → Harmony → Plan my next step; related multi-program context from Haris Ahmed Problem 2 p.14. Page numbers are 1-based PDF pages in the supplied course-folder files.

## Reproduction and change

Before implementation, followed Welfare details → Prepare documents → back to resources → Harmony → Plan my next step → View plan. Harmony has no required documents and produced its two next steps. The reported blank screen did **not** reproduce in this web session, and no console error occurred in that initial sequence. The confirmed defect was silent replacement of the existing Welfare checklist.

The preparation effect previously changed the saved provider and tasks in separate writes whenever its route provider differed. Multiple retained preparation screens could compete to change that shared value; this is a code-level risk, not a reproduced native crash. That effect and its separate provider setter are removed.

The chosen issue-approved scope is **one saved plan with explicit replacement confirmation**, rather than multiple saved plans:

- Opening a different provider's preparation shows the existing/new provider and explains that replacement resets completion/skips, dates and calendar export history. Documents are retained; previously imported calendar events remain managed in the user's calendar.
- **Keep current plan**, Back or **Return to matches** leaves existing data intact. The first provider also requires an explicit Start plan action.
- Only the explicit Start/Replace action initializes a plan. It builds and validates tasks before one atomic provider/checklist update. A failed build does not mutate state; a stale replacement decision is rejected.
- Starting the already active provider is idempotent, preserving completion, dates and export history. Provider-scoped task writes ignore delayed updates from an old preparation screen.
- Calendar form state resets when the plan's provider changes.
- The script's Plan my next step action routes through this same preparation/confirmation flow instead of opening an unrelated saved checklist.
- Missing detail/preparation/script providers share Retry, Return to matches and View saved plan recovery. Missing saved providers show recovery in My plan while retaining their stored tasks/documents, rather than showing the new-plan empty state. Retry refreshes the catalog and reports failure or continued unavailability without clearing progress.

Storage schema/key and existing document-retention behavior are unchanged; no plan migration is needed. Confirmed replacement intentionally discards the previous checklist. It does not archive multiple plans or submit an application.

## Verification — November 27, 2026

- TypeScript passed; **15 test files / 106 unit tests passed**.
- Store tests cover atomic provider/task notifications, zero-document Harmony initialization, 20 repeated same-provider starts with zero store notifications, retained completion/dates/export history, invalid-provider and thrown-build failure, stale replacement decisions, ignored delayed old-provider task writes, repeated switching, unchanged document references, and rehydration.
- Browser: created Welfare plan, marked Photo ID done and scheduled Call the provider for December 10, 2026. Opened Harmony preparation, chose Keep current plan, and verified Welfare's 1/5 completion and scheduled date. Reload retained both.
- Browser: deliberately confirmed Harmony replacement; preparation remained usable with no document rows, and My plan displayed two steps. Reload retained Harmony. The tested post-switch page had no error logs.
- Browser: opened an unknown provider preparation URL. Retry refreshed the catalog and left a usable recovery screen; View saved plan returned to Harmony. Return to matches reached /matches. A rendering warning from an empty feedback string found during testing was fixed; a fresh recovery tab then reported no console errors.
- Inspected confirmation and recovery at 375×812 and desktop width. Captures: [replacement confirmation](issue-20/confirmation-375.jpg), [unavailable-provider recovery](issue-20/recovery-375.jpg).
- Final `npx --no-install expo export --platform all --output-dir .expo/issue20-final-export` passed for web, Android and iOS.
- Whitespace checks passed. Expo lint was attempted; ESLint is not configured and automatic setup was declined.

No physical Android/iOS device or Safari instance was available. Their reported blank-screen behavior is not claimed as reproduced or device-verified; final target-platform checks remain in #7/#31. The web behavior, state-preservation regression cases and native compilation above are the available evidence.

No PR, merge or deployment was created. Existing app.json/package.json/package-lock.json edits are excluded.
