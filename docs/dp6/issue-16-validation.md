# Issue 16: provider deadlines and intake status

Implements [GitHub issue 16](https://github.com/rigshank/HomeHearts/issues/16).

## Requirement and feedback

- `Design Project/DP6/DP6-Final Demo.pdf`, p.1, UI Revise and Quality Improvement, and p.4, UI Revise/Quality rubrics.
- `Design Project/DP6/Team_17 Heuristic Evaluation Feedback.pdf`, p.27: Aalvee Ahtav, H1, application deadlines are unclear on City of Dallas details.
- Related feedback on p.19 (Haris Ahmed, reminders) and p.79 (Zion Laguna, referrals) is handled only as deadline context here. Reminder and referral feature work remains in issues 25 and 24.

## Before and after

Previously, details displayed timing only when a deadline or reopening existed. An absent deadline had no explicit status. Call scripts did not ask for unknown cutoff dates, and an expired deadline could leave a stale `call_to_verify` or waitlist record actionable.

Details now group Intake status, Application deadline, any reopening notice, and the provider source/check date in a single card above Next step. Results reuse the same timing guidance. Missing deadlines say **Deadline not published — ask provider.** A known deadline is labeled **Published deadline**, and an expired deadline is labeled **Published deadline passed** with the original date/time wording.

Expired application windows are closed in matching until a newer announced reopening has arrived; a reopening requires provider confirmation rather than an assumed open status. Call scripts ask about missing cutoff dates, confirm published dates even for stale/waitlisted intake, and ask about a new window when the published deadline has passed.

The catalog's existing provider facts and checked dates are unchanged. No deadline was invented or re-verified. Synthetic dates are used only in automated tests, not shipped as provider facts. Catalog validation requires optional deadline/reopening timestamps to include an explicit timezone; displayed labels remain in the provider's wording rather than shifting to the device timezone.

## Verification on November 27, 2026

- `npm run typecheck`: passed.
- `npm run test:unit`: 8 test files, 59 tests passed.
- Relevant matching, call-script, and catalog tests with `TZ=Pacific/Kiritimati`: 3 test files, 39 tests passed. Includes a CT late-evening cutoff that occurs on the following UTC calendar day and the exact expiry instant.
- `npx --no-install expo export --platform web`: passed. The first sandboxed export was blocked creating a dynamic-route directory; rerunning with filesystem access succeeded.
- `git diff --check`: passed.
- Browser preview: inspected Dallas County Welfare Assistance, City of Dallas Rental Assistance, Under 1 Roof and the Welfare call script. Confirmed explicit unknown deadlines, adjacent source dates/intake status, the existing December 1 reopening label, and the new cutoff question. Desktop screenshot and a 375px viewport check were used; no physical-device test is claimed.
- `npx --no-install expo lint`: unavailable because the repository has no ESLint configuration/dependencies. Declined the automatic installation/configuration prompt to avoid unrelated package/config changes.

## Reproduce

1. Start the app with `npm run web` and open `/matches/city-dallas-social-services` or `/matches/dallas-county-welfare`.
2. Verify the Application deadline message and source check date in the same card as Intake status; an unknown deadline must not imply no cutoff.
3. Open `/matches/under-one-roof-rent` to see reopening guidance alongside the explicit deadline status.
4. Open `/matches/dallas-county-welfare/call-script` and verify the cutoff/intake-window question.
5. Run the unit suite for known/upcoming/expired deadlines, waitlist and stale statuses, newer reopening windows, exact cutoff instants, and malformed/timezone-ambiguous catalog dates. These fixtures do not represent newly verified real provider deadlines.

## Scope

Only issue 16 is implemented. No PR or deployment is created. Existing local edits to `app.json`, `package.json` and `package-lock.json` are not part of this issue's commit.
