# Issue 13: multiple housing concerns and precise urgency

Implements [issue 13](https://github.com/rigshank/HomeHearts/issues/13) on `k-changes-11-27`.

## Source requirements

- `Design Project/DP6/DP6-Final Demo.pdf`, PDF p.1, **UI Revise and Quality Improvement**, bullets 1–3; p.4, **UI Revise** and **Quality** grading criteria.
- `Design Project/DP6/Team_17 Heuristic Evaluation Feedback.pdf`: Omar Abubeker Problem 5 p.7 (H7), Garrett Hockersmith overall recommendation p.72, Aalvee Ahtav urgency finding p.26 (H2), Isaac Powell Problem 2 p.114 (H7). These are 1-based PDF pages in the supplied course-folder documents.

## Behavior

Previously the intake stored one concern, with Today / This week / This month / Planning categories. Selecting another concern replaced the first, and matching and call scripts used only that concern.

Concern tiles are now checkboxes: select all that apply, then use a separate radio group to choose which concern to prioritize. The first selected concern is initially primary; removing the primary chooses the first remaining selection. Removing all concerns disables Continue. The existing singular `issue` field represents the primary; `issues` holds the complete selection.

The five urgency options use explicit ranges: Today (day 0), Within 3 days (1–3), Within 7 days (4–7), Within 30 days (8–30), Planning ahead (more than 30 days or no fixed date). Today/3 days boost immediate resources; Today/3/7 days place long-term programs in Options for later. Selecting Safe place tonight keeps immediate shelter handling regardless of the timeframe. Closed/waitlisted provider rules remain applicable.

Matching unions services across all concerns and includes each provider ID once, retaining a separate explanation for each matched concern. Within the existing actionable/later groups, primary-concern matches sort before secondary-only matches. Location-boundary questions consider secondary concerns too. Results summarize all concerns, primary choice and timeframe. Call scripts include that context and any applicable rent increase.

The optional rent-increase field appears whenever rent increase is selected, even as a secondary concern. Deselecting it clears the amount, and scripts ignore stale amounts when it is absent. Calculator entry points add/promote their concern while keeping existing concerns, timeframe and location.

## Persistence and compatibility

The existing storage key is retained; Zustand persistence version advances from 0 to 1. Legacy single concerns become one-item selections, with the original concern primary. Legacy `this_week` maps to `within_7_days`; `this_month` maps to `within_30_days`. Today/Planning, ZIP, county/city answers, applicable rent amount, comparison, saved provider, documents and plan tasks are preserved. The migration does not infer a more specific subrange from an old broad category.

Normalization deduplicates/filters concerns, repairs a primary outside the selected concerns, and handles empty/invalid intake safely. Hydration also normalizes current-version profiles. Existing single-concern domain callers remain supported.

## Validation — November 27, 2026

- TypeScript passed. Unit suite: **15 files / 101 tests passed**.
- New tests cover legacy migration, actual store hydration/persistence, preservation of unrelated progress, adding/removing concerns, primary reassignment, stale amount clearing, calculator entry, resource union/deduplication/reasons, secondary location questions, all five urgency tiers and multi-concern scripts.
- Browser: selected eviction + utility bills, made eviction primary, selected Within 3 days and submitted ZIP 75201. Results contained tenant clinics and energy assistance; Welfare had explanations for both concerns.
- Edit answers and reload retained both checked concerns, eviction primary and Within 3 days. Previous question navigation preserved those answers.
- Location step omitted rent increase for the eviction/utility selection. Adding rent increase as secondary made its amount field available. Entered 150 and deselected it; amount clearing is additionally verified by pure-domain and persisted-store tests.
- Keyboard Enter operated concern checkboxes, primary/urgency radios and navigation. Inspected phone layouts at 375×812 and desktop layout at 1280px; checked states were exposed in the browser accessibility tree.
- All-platform Expo export passed: `npx --no-install expo export --platform all --output-dir .expo/issue13-final-export`.
- Whitespace check passed. Expo lint was attempted; ESLint is not configured in this repository, and automatic setup was declined.

## Captures and limits

Actual browser phone-viewport captures: [primary choice](issue-13/primary-375.jpg), [urgency ranges](issue-13/urgency-375.jpg), [combined results](issue-13/results-375.jpg). These contain synthetic demo answers, not real personal information.

No physical mobile device or screen reader was available; native device checks remain in #31. This change does not claim confirmed eligibility or guaranteed provider response times. No new PR, merge or deployment was created. Existing local app/package configuration edits are excluded.
