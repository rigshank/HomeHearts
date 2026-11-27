# Issue 25: optional calendar export

Implements [issue 25](https://github.com/rigshank/HomeHearts/issues/25) on `k-changes-11-27`.

## Requirement and scope

- `Design Project/DP6/DP6-Final Demo.pdf`, p.1, UI Revise and Quality Improvement; p.4, UI Revise/Quality rubrics.
- `Design Project/DP6/Team_17 Heuristic Evaluation Feedback.pdf`, Haris Ahmed Problem 7, p.19, and recommendations p.20 (H7): optional reminders/calendar tracking for incomplete tasks.
- Delivers the calendar-file option rather than in-app notifications. No calendar/account permission or new dependency is needed. A file export is not a confirmed import or scheduled alert.
- Includes the minimum prerequisite of actual saved task dates and explicit date selection. The old Move cycle is replaced by Date & calendar. Issue 21 remains open for its other work, including due-date sorting/grouping and Undo.

## Behavior

Each incomplete task offers Date & calendar. Users choose a real local date and can save it without exporting. Suggested initial dates are explained in README; old relative labels receive dates once, and saved dates remain anchored after reload. After-call follow-ups remain undated until chosen.

Export generates one RFC 5545 `.ics` event for the selected task, provider and next step, at 9 a.m. local calendar time for 15 minutes. This is personal planning time, not a provider appointment/deadline. An optional alert is off by default, and past alert times are rejected. The file omits documents, filenames, intake answers and invitees. It uses escaped/folded UTF-8 text, CRLF lines and a stable task/provider UID; repeated imports may still create duplicates depending on the calendar.

Web requests a local download. Native attempts a system handoff using existing FileSystem APIs, with an explicit browser/manual fallback when no compatible handler exists. Users must import and confirm alerts themselves. The calendar app/OS controls alerts; HomeHearts neither sends notifications nor confirms imports. The UI and README explain update/removal and no automatic sync. The plan retains the last calendar-file date and warns after rescheduling, completion or skipping.

## Validation, November 27, 2026

- `npm run typecheck`: passed.
- `npm run test:unit`: 10 test files, 69 tests passed.
- Calendar/planning suite under `TZ=Pacific/Kiritimati`: 2 files, 12 tests passed. Covers persisted/migrated dates, month/year/DST boundaries, leap/invalid dates, changed export dates, explicit alerts, past alerts, completed/skipped rejection, escaping and UTF-8 line folding.
- Native handoff tests cover success without a scheduling claim, missing-handler fallback and failure cleanup. No physical Android/iOS import test is claimed.
- `npx --no-install expo export --platform web`: passed.
- `git diff --check`: passed.
- `npx --no-install expo lint`: repository has no ESLint configuration; declined automatic setup to keep unrelated dependency/config changes out of scope.

## Actual browser/download checks

1. Opened Welfare document preparation and View plan. Confirmed explicit suggested dates and Date & calendar controls.
2. Chose December 8, 2026 for Photo ID, opted into an alert and downloaded an actual `.ics` file. Read back the file: one event, `DTSTART:20261208T090000`, `VALARM` present, CRLF content and physical lines no longer than 75 bytes.
3. Reloaded the page: date and last-export guidance persisted; alerts were off when the options were reopened.
4. Saved December 10: the plan warned that the previous file used December 8 and instructed editing/deleting that calendar copy.
5. Tried February 30: inline validation blocked saving and kept the saved December 10 date.
6. Exported December 10 with no alert. The second downloaded file contained `DTSTART:20261210T090000`, no `VALARM`, and the same event UID. Both files contained only the chosen task/provider context.
7. Skipped and completed the exported task: verified instructions to delete its calendar event/alert and no export action for inactive tasks; restored the test task afterward.
8. Inspected the plan and expanded calendar options at desktop and 375px phone widths; dates, controls and guidance wrapped without clipping.

No external personal calendar was modified. Import acceptance, alarm delivery and device-specific native viewers are explicitly left to the calendar app and user, as described in the supported export flow. No PR, merge or deployment was created. Existing local edits to app/package configuration are excluded from this issue's commit.
