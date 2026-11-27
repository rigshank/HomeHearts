# Issue 17: readable details and mobile accessibility

Implements [issue 17](https://github.com/rigshank/HomeHearts/issues/17) on `k-changes-11-27`.

## Requirement and feedback

- `Design Project/DP6/DP6-Final Demo.pdf`, PDF p.1, **UI Revise and Quality Improvement**, bullets 1–3; p.4, **UI Revise** and **Quality** grading criteria.
- `Design Project/DP6/Team_17 Heuristic Evaluation Feedback.pdf`, 1-based PDF pages: Ahad Cheema Problem 6 p.48 (H8); Isaac Powell Problem 3 p.115 (H8); Nathan Nguyen Problem 5 p.99 (H1); Anjali Ayyappan Problems 1 and 5 pp.33,37 (H7/H4).
- These are the supplied course-folder documents, not repository-hosted PDFs. This change addresses the feedback's readability, action discoverability and control styling concerns; final physical demo validation remains tracked in #31.

## Changes and rationale

Before this change, three assistance tiles competed for a single row; shared metric and icon rows limited text lines. The plan exposed Call script as a small heading action, script questions had numbered circles resembling controls, and document actions competed with filename text.

- Stack provider assistance amount, timing and method at full width. Permit complete provider names, descriptions and metric values to wrap.
- Stack cost totals and support actions on narrow screens or when native font scale exceeds 1.2. Label chart table amounts individually as Stay/Move and allow large totals to wrap.
- Put a full-width, labeled phone-icon **Open call script** action below the saved provider. Let plan actions and document actions wrap, with 44px minimum interactive dimensions.
- Style script questions as plain paragraphs with a subtle left border.
- Preserve font scaling, use content-driven button heights and flexible text widths, and retain the existing `useReducedMotion` animation bypass.
- Add visible focus outlines to shared buttons and options, document-specific accessible action names, field error hints/live announcements, and native plus explicit web ARIA checked/selected/disabled states. Explicit ARIA state props are needed by this installed web renderer.
- Render only the active footer action, rather than leaving an invisible duplicate focus target; keep the inline action mounted while it has focus.
- Darken muted/status text colors and add a separate coral text color. Decorative coral remains in chart bars/icons. Ten palette-pair regression cases enforce at least 4.5:1 contrast for the tested normal-text combinations.

## Verification — November 27, 2026

- `npm run typecheck`: passed.
- `npm run test:unit`: 13 files / 84 tests passed, including 10 contrast checks.
- `npx --no-install expo export --platform all --output-dir .expo/issue17-final-export`: web, Android and iOS compilation passed.
- `git diff --check`: passed.
- `npx --no-install expo lint`: attempted; unavailable because this repository has no ESLint configuration/dependencies. Declined automatic setup.
- Browser widths: provider/script/document screens at 320×812; plan at 375×812; comparison at 320×812 and 1280×900. The long Dallas County Welfare Assistance name and assistance amount/timing/method remained fully readable.
- Enter activated the labeled plan call-script button and navigated to the correct provider's script. Script questions were reading text in the accessibility tree, without fake interactive circles.
- A local sample image with a long filename wrapped fully. Preview/Replace/Remove were independently labeled and placed on their own wrapping row. Measured Add file approximately 82×48px and Remove 47×47px.
- Large-value stress case: rent after increase 123456789 and cost after move 98765432 produced complete totals $1,481,481,468 and $1,185,188,384. At 320px the document width was 320px and no leaf currency text overflowed horizontally. Restored demo amounts afterward.
- Final browser accessibility tree exposed 12 months and 1 bed as checked and the alternatives unchecked. Enter selected 3 months, updated costs and exposed its checked state; a visible focus outline measured approximately 2.67 CSS px after browser rendering. Restored 12 months afterward.

## Screenshots

These are actual browser captures at phone viewport sizes, not physical-device captures. The sample filename contains no personal document data.

| Capture | Evidence |
| --- | --- |
| [Provider details, 320px](issue-17/provider-320.jpg) | Full assistance amount, timing and method |
| [Saved plan, 375px](issue-17/plan-375.jpg) | Long provider name and prominent call-script action |
| [Script, 320px](issue-17/script-320.jpg) | Wrapped static questions |
| [Documents, 320px](issue-17/documents-320.jpg) | Separate labeled action row |
| [Long filename and focus, 320px](issue-17/long-filename-320.jpg) | Full sample filename, action spacing and focus ring |
| [Large costs, 320px](issue-17/large-cost-320.jpg) | Complete billion-dollar total and labeled table values |

## Verification limits

No physical Android/iOS device, OS large-text setting or VoiceOver/TalkBack session was available. Native font scaling and reduced-motion behavior were reviewed in source and compiled, but enlarged native text, OS reduced motion and screen-reader announcements are not claimed as device-tested. Repeat provider, plan, document and comparison flows with increased system text size and the chosen screen reader on the actual demo device under #31. Browser keyboard/accessibility-tree checks are evidence for the web paths only.

No PR, merge or deployment was created. Existing app.json/package.json/package-lock.json edits are excluded.
