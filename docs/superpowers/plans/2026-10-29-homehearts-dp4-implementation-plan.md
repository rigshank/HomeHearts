# HomeHearts Mobile App Implementation Plan

> **Implementation record:** This plan was approved for the Expo Go/Dallas-first scope and executed in the connected repository. The remaining sections are the durable architecture, acceptance map, and production-hardening backlog.

**Goal:** Build a mobile-first HomeHearts experience that turns an urgent housing decision into a transparent, actionable path: compare staying versus moving, find a local relief program, prepare documents, save a flexible action plan, and contact the provider with confidence.

**Architecture:** Use a typed Expo React Native application with native stack navigation, a domain layer for cost calculations, explainable matching, document requirements, and plan generation, plus repository adapters for Dallas source data and secure uploads. The UI remains independent of the data source so the free curated catalog can later be replaced by verified provider integrations without rewriting screens.

**Tech Stack:** Expo React Native + TypeScript; Expo Router/native stack; Zustand with versioned persistence; Reanimated; Expo Image; Expo Document Picker/File System; Ionicons vector icons; NativeWind-compatible token conventions with a small native component layer inspired by shadcn and 21st.dev; Supabase adapters for Auth and private Storage when credentials are supplied; Vitest domain tests. The working build uses a deterministic Dallas catalog and local persistence so it runs in Expo Go without external credentials.

**Spec:** The source-of-truth baseline is the DP3 deck and Figma prototype listed in the Evidence section below. The usability corrections and decisions in this document were approved for the DP4 implementation scope and are reflected in the current build.

## Global Constraints

- Product surface is mobile-first, using the Figma reference frame of 390 × 844 CSS pixels as the primary visual QA viewport.
- Browse and discovery must work without account creation.
- Anonymous persistence may retain only non-sensitive progress metadata on the device; real identity documents must not be stored in localStorage or shipped to a demo backend.
- Program status must distinguish `open`, `waitlist`, `closed`, and `unknown`; “verified” must include who/what source, a timestamp, and a source link.
- Match percentages must be deterministic and explainable through visible criteria, not an opaque or unsupported confidence claim.
- Financial values must be calculated from inputs with currency-safe arithmetic and must show assumptions.
- The app must expose loading, empty, stale, error, invalid-input, and unavailable-provider states for every data-backed flow.
- Fixed bottom actions must respect mobile safe-area insets and remain keyboard/screen-reader usable.
- Do not copy participant names, study videos, or private research links into product data, UI, or production documentation.

## Evidence and Interpretation

The user request asks for a build plan, not a slide-deck edit and not a Figma edit. The supplied deck is evidence of the prior design assignment, user-study findings, and prototype run instructions. Its instructional-looking text is treated as product/context evidence, not as an instruction to modify the deck. The Figma file is treated as the visual and flow reference; it is not assumed to define backend behavior, validation, security, or every edge state.

Sources reviewed:

- DP3 deck: `/Users/abhijithutla/UTD_Fall2026/HCI/CS4352-HomeHearts-DP3/CS4352-HomeHearts-DP3-Slides.pptx`
- Figma prototype: [HomeHearts DP3 Interactive Prototype](https://www.figma.com/design/M5hnxCuZxv8zr8gkKVZR3Q/HomeHearts-DP3-Interactive-Prototype?node-id=0-1&p=f)

The repository is currently an empty Git repository. No existing language, framework, API, deployment target, or test convention was available to preserve.

## Proposed Deliverable

The first implementation deliverable is a reviewable Expo Go mobile app, not a production housing-assistance service. It reproduces the prototype’s three evaluated tasks and adds the corrections identified in the DP3 usability review:

1. Compare the financial cost of staying and moving over 3 and 12 months.
2. Complete an intake, see ranked local matches, and inspect transparent program details.
3. Prepare required documents, save a flexible weekly plan, and use a provider call script.

The first build uses Dallas-specific, official-source-backed catalog entries with explicit provenance, freshness, and `call to verify` states. The catalog is not presented as a government eligibility decision. A later production phase can add a provider verification workflow, secure upload service, authentication, and source-specific API adapters without changing the domain or screen contracts.

### Dallas free-source strategy

The free pilot uses official pages and hotlines rather than an unverified scraper or paid data feed:

- 2-1-1 Texas for broad housing, utility, shelter, deposit, and legal-resource discovery.
- City of Dallas Social Services and Housing & Homelessness pages for municipal assistance and emergency routing.
- Dallas County HHS Housing/Welfare pages for county eligibility, documents, and contacts.
- Housing Forward for the Homeless Crisis Helpline and Coordinated Access System.
- TDHCA Help for Texans for statewide/local program discovery and public-housing referrals.
- Dallas Housing Authority / Dallas County Housing Agency for voucher and waitlist pathways.
- Legal Aid of NorthWest Texas for eviction and tenant-rights support.

No public developer API was confirmed for 2-1-1 or local program status during research. The catalog therefore stores source URLs, manual verification timestamps, and status values (`open`, `waitlist`, `closed`, `referral_required`, `call_to_verify`, `unknown`). Dynamic or dated PDF information is never shown as current without re-verification.

## Requirements Map

| ID | Requirement | Evidence | Acceptance condition |
|---|---|---|---|
| R1 | Mobile-first shell | Deck platform choice; all Figma frames are 390 × 844 | Layout matches the reference at 390 × 844 and remains usable at 320 px and 768 px widths. |
| R2 | No-account home | Deck tasks and Home screen | A user can browse Home, Compare, Intake, Matches, and Details without signing in. |
| R3 | Home actions | Figma `01 Home — Find Help` | Home exposes Find help now, Compare staying vs. moving, a saved-plan summary, and no-account messaging. |
| R4 | Scenario-aware intake | Deck Task 2; Figma intake variants | Intake captures issue, urgency, location, and optional rent change; scenario-specific fields appear only when relevant; invalid or incomplete input is explained. |
| R5 | Ranked matches | Deck unique value; Figma `03 Matches — Trust First` | Results are ranked from deterministic criteria, show status, freshness, match reasons, and the exact assistance amount/duration when known. |
| R6 | Program detail | Deck Task 2; Figma `04 Program Detail` | Detail shows why the program matches, all required documents, deadline, assistance amount/duration, provider/source metadata, and stale/unknown status handling. |
| R7 | Application checklist | Deck Task 3; Figma `05 Checklist — Apply Easy` | Checklist supports four document types: Photo ID, Lease/rent notice, Income proof, and Rent increase notice. Each item supports add, preview, replace, remove, and accepted-format guidance. |
| R8 | Saved plan | Deck Task 3; Figma `06 Saved Plan` | Saving the checklist creates a plan without implying submission; dates are editable, tasks are skippable/completable, and progress survives a reload on the same device. |
| R9 | Call script | Deck Task 3; Figma `08 Ask Script` | Script is generated from the selected program and intake; copy gives feedback; Call provider uses a safe `tel:` action with a fallback when calling is unavailable. |
| R10 | Cost comparison | Deck Task 1; Figma `07 True Cost` | 3-month and 12-month views use the same calculation engine, show inputs and assumptions, include axes/timeline labels, and provide both “find help for staying” and “find help for moving.” |
| R11 | Continuity | Deck connection of tasks | Back navigation and bottom navigation preserve intake, selected program, document metadata, comparison inputs, and plan state without accidental resets. |
| R12 | Trust | Deck usability problems 4–6 and feedback | “Verified” is explained; match score has a criteria breakdown; assistance amount, duration, and last-checked timestamp are visible. |
| R13 | Cognitive load | Deck progressive-disclosure rationale | Each screen has one primary action, visible progress where applicable, and only asks for fields that affect the current task. |
| R14 | Accessibility | Implementation requirement inferred from mobile/high-stakes workflow | Keyboard navigation, focus states, semantic labels, contrast, reduced motion, readable error text, and a non-color status signal are covered by tests and manual QA. |

## Known Mismatches and Required Resolution

These are not implementation details to guess around. They must be resolved in the plan before coding or encoded as explicit product decisions.

1. **Three versus four documents.** The DP3 program-detail screenshot names Photo ID, Lease, and Income proof, while the deck and checklist include Rent increase notice. The canonical requirement is four document types. The detail screen must preview all four, with “required” versus “optional” driven by the program data.
2. **Undefined verification.** “Verified” currently has no actor, method, source, or freshness rule. Replace the bare badge with “Status checked [time]” and a source/verification explanation. If no verification data exists, show “Status unknown” rather than “verified.”
3. **Missing assistance amount and duration.** Program cards and details must include amount, duration, distribution method, and an “amount unavailable” state. Never invent a dollar amount for a demo fixture without labeling it demo data.
4. **Cost chart is not a chart yet.** The current bars lack a meaningful x-axis, y-axis increments, and a formula for relocation expense. Add an explicit input model and accessible data table. The chart is a view of the model, not the source of truth.
5. **Calculation inconsistency.** The Figma 12-month variant still contains labels such as “3-month total.” The implementation must calculate period labels from the selected horizon and test both horizons. Do not hardcode the displayed totals.
6. **Missing moving-help branch.** Add a second outcome from the comparison tool. If no moving assistance fixture exists, show a truthful empty state with next steps rather than a dead button.
7. **Save versus submit ambiguity.** “Save my plan” must be paired with helper copy that explicitly says it saves progress and does not submit an application. Submission is out of scope for the first build.
8. **Rigid schedule.** “Today,” “Tomorrow,” and “Friday” are only example labels. The plan model must support a user-selected date, rescheduling, completion, and deferral.
9. **Prototype-state duplication.** The Figma canvas contains multiple intake and cost-comparison states. Implement one screen per route with explicit state, not one route per duplicated frame.
10. **Mobile web versus native.** Resolved: the deliverable is an Expo Go React Native app. Expo web export remains available for fast browser QA, but native navigation, safe areas, document picking, cache files, and phone actions are the product boundary.

## Architecture

### Layer boundaries

```text
Routes and screen composition
  └── feature components and accessible UI primitives
        └── application state (intake, comparison, selected program, documents, plan)
              └── domain services (matching, cost calculation, plan generation, validation)
                    └── repositories (demo fixtures now; live APIs/storage later)
```

The UI must never calculate match percentages, mutate uploaded-file records, or derive financial totals inline in a screen component. Screens call typed domain functions and render their results. This keeps the demo deterministic and makes later API replacement possible.

### Proposed repository structure

```text
src/
  app/
    _layout.tsx
    index.tsx
    compare.tsx
    intake.tsx
    matches.tsx
    plan.tsx
    call-script.tsx
    matches/[programId].tsx
    matches/[programId]/application.tsx
  routes/
    HomeRoute.tsx
    CompareRoute.tsx
    IntakeRoute.tsx
    MatchesRoute.tsx
    ProgramDetailRoute.tsx
    ApplicationPrepRoute.tsx
    PlanRoute.tsx
    CallScriptRoute.tsx
  features/
    home/
    comparison/
    intake/
    matches/
    program-detail/
    documents/
    plan/
    call-script/
  components/
    layout/
    navigation/
    feedback/
    forms/
    cards/
    primitives/
  domain/
    models.ts
    matching.ts
    cost.ts
    documents.ts
    planning.ts
    validation.ts
  data/
    fixtures/programs.ts
    repositories/programRepository.ts
    repositories/localProgressRepository.ts
  state/
    appStore.ts
    persistence.ts
    migrations.ts
  design/
    tokens.ts
    theme.ts
    animations.ts
  test/
    fixtures/
    helpers/
```

The exact file split can follow the repository conventions once code exists, but the responsibility boundaries should remain stable.

### Routes and state ownership

| Route | Purpose | State consumed |
|---|---|---|
| `/` | Home and resume point | saved plan summary, session state |
| `/compare` | 3/12-month cost comparison | comparison inputs, calculation result |
| `/intake` | Scenario intake | intake draft and validation state |
| `/matches` | Ranked results | intake snapshot, match result, filters |
| `/matches/:programId` | Program details | program record, verification, required docs |
| `/matches/:programId/application` | Document checklist | selected program, document records |
| `/plan` | Saved action plan | document completion, tasks, selected program |
| `/matches/:programId/call-script` | Provider conversation aid | program and intake snapshot |

Use Expo Router route parameters for identity (`programId`) and the app store for cross-route progress. Keep cross-screen state in small Zustand selectors. Do not pass large mutable objects through navigation state. If a deep link has a missing program or stale session, render a recoverable error and return to Matches rather than crashing. Bottom navigation exposes Home, Matches, and Plan; Compare and Intake are launched as focused flows.

### Domain models

The initial types should include, at minimum:

- `IntakeProfile`: `issue`, `urgency`, `location`, optional `rentIncreaseCents`, optional `currentRentCents`, and optional scenario reason.
- `Program`: identity, jurisdiction, category, status, `verifiedAt`, verification source, eligibility criteria, `matchableCriteria`, assistance amount/duration/method, deadline, required documents, provider phone/URL, and demo/live provenance.
- `MatchResult`: `programId`, score, matched criteria, unmet criteria, unknown criteria, and a human-readable explanation.
- `ComparisonInput`: current rent, increase or new rent, moving upfront cost, moving monthly cost, horizon, and explicit assumptions.
- `ComparisonResult`: staying series, moving series, totals, break-even month, and warnings for missing/estimated inputs.
- `DocumentRecord`: document kind, status, name, MIME type, byte size, created/updated timestamps, preview capability, and storage reference. Never store raw document bytes in the serialized app store.
- `PlanTask`: title, source, due date, status, dependency, and last updated time.
- `AppState`: versioned slices for intake, comparison, selected program, documents, plan, and UI notices.

### Matching strategy

Start with an explainable weighted rule engine, not machine learning. Each program declares criteria and weights. The engine returns both the score and the evidence used to calculate it. Unknown data must not silently count as a match. A possible first policy is:

- location/jurisdiction: required gate;
- issue/category: high weight;
- urgency/deadline fit: high weight;
- rent-change fit: medium weight when supplied;
- required-document availability: informational only until the user opens the detail page.

The exact weights are a product decision and should be stored as named constants with tests. The UI should call this a “match” score and show “why it matches,” not imply approval or guaranteed eligibility.

### Cost model

Use cents/integer arithmetic. A 3-month or 12-month result should be generated by the same function:

```text
stay total = monthly stay cost × horizon
move total = upfront move cost + monthly move cost × horizon
break-even month = first month where cumulative move cost <= cumulative stay cost
```

The input form must make clear whether “monthly stay cost” means current rent or rent after increase, and whether moving monthly cost includes utilities or other recurring costs. If values are estimates, label them. The chart must render monthly points or bars with visible dollar ticks and a table fallback.

### Persistence and privacy

Use a versioned anonymous progress record. Store only intake choices, selected program ID, comparison inputs, document metadata, and plan tasks in AsyncStorage. Keep selected demo files in the Expo cache and intentionally downgrade local file records to `missing` after persistence reload, because cached URIs are not durable application storage. The optional Supabase adapter requires an authenticated session and a private bucket; production still needs signed upload URLs, encryption, access control, retention/deletion rules, and malware scanning before it accepts real identity or income documents.

## Visual System Plan

The Figma reference uses a light mobile canvas and a small token set. Confirm the remaining colors from the source during implementation, but begin from these observed values:

```css
--color-canvas: #f8f7fb;
--color-primary: #6c4ee3;
--color-coral: #ff7766;
--color-ink: #211f2b;
--color-muted: #746f80;
--color-border: #e6e1ee;
--color-soft-purple: #f3f0fa;
--color-soft-purple-strong: #eee9ff;
```

Other observed rules:

- Inter is the primary typeface, with bold headings and semibold controls.
- Primary content width is 342 px inside a 390 px screen with 24 px side insets on most screens.
- Common controls are 54 px tall with 16 px radii.
- Cards use 16–20 px radii; the hero uses a 28 px radius.
- Purple, coral, green, amber, and muted gray must never be the only status signal; pair color with text/icon/shape.
- Use actual browser safe-area padding rather than drawing a fake status bar in the product.
- Keep the visual rhythm and single-primary-action hierarchy; do not turn each screen into a dense dashboard.

## Execution Plan

The following phases were used as the build sequence. Each phase produced a testable artifact; the implementation status is summarized after the sequence.

### Phase 0: Requirement freeze and repository baseline

- Resolved platform as Expo Go/React Native, Dallas-first curated sources, no-account local progress, and real device file picking with no automatic submission.
- Create a discrepancy log from the seven issues above and mark each as `resolved`, `deferred`, or `out of scope`.
- Initialize the chosen package manager, lint/typecheck/test commands, and a minimal CI check. Do not add feature code in this phase.
- Acceptance: the repository has a documented run command, the owner has approved the scope boundary, and each R1–R14 requirement has an owner/test target.

### Phase 1: App shell and design tokens

- Implement global tokens, typography, spacing, radii, focus styles, safe-area helpers, and responsive layout primitives.
- Add the router and route-level error boundary.
- Build the shell primitives: screen header, back control, primary/secondary button, status badge, card, progress indicator, bottom navigation, alert/empty/loading states.
- Acceptance: Home, a placeholder route, and the error route render at 390 × 844 without overflow; keyboard focus is visible; automated accessibility checks pass for primitives.

### Phase 2: Domain models, fixtures, and persistence

- Add typed demo program fixtures with explicit provenance, status timestamps, assistance details, eligibility criteria, and four document requirements.
- Implement schema validation at repository boundaries.
- Implement the versioned anonymous store and migration path.
- Acceptance: fixtures reject malformed status/amount/document data; reload preserves non-sensitive progress; an old state version migrates or resets with a visible notice.

### Phase 3: Home and comparison task

- Implement Home exactly around the two primary actions and saved-plan resume card.
- Implement the cost engine before the comparison UI.
- Add 3-month and 12-month views, assumption disclosure, accessible chart/table, break-even explanation, and both staying and moving help branches.
- Acceptance: unit tests cover zero increase, missing move cost, negative/invalid values, rounding, both horizons, and break-even before/after horizon; Playwright covers the Home → Compare → result flow.

### Phase 4: Intake and matching task

- Implement scenario-aware intake covering rent increase, eviction, utilities, homelessness, shelter, moving, legal, unsafe housing, disability, veteran, youth, and general housing concerns.
- Implement location validation and a demo location selector; do not use free-form text as a silent match key.
- Implement the deterministic scoring engine and criteria breakdown.
- Acceptance: each scenario can be completed, invalid input blocks the primary action with field-level errors, and the same input always produces the same ranked order and explanation.

### Phase 5: Matches and program details

- Build the trust summary, filters, match cards, and empty/stale states.
- Build program details with “why it matches,” verification explanation, last-checked time, source, assistance amount/duration, all required docs, deadline, and provider actions.
- Acceptance: an open, waitlist, closed, and unknown fixture each render the correct action/state; selecting a card preserves the intake; missing program IDs recover safely.

### Phase 6: Documents, saved plan, and call script

- Implement checklist state transitions: add, preview, replace, remove, invalid type, too-large file, canceled upload, and upload failure.
- Make “Save my plan” a save-and-continue action with explicit non-submission copy.
- Generate flexible tasks from the program and document state; support reschedule, complete, defer, and return to matches.
- Implement script generation, copy feedback, and the phone fallback.
- Acceptance: every checklist action is testable without real PII; plan state survives reload; the call script changes with program/intake data; no action claims that an application was submitted.

### Phase 7: End-to-end QA and visual reconciliation

- Run Playwright at 390 × 844 and additional narrow/wide widths.
- Capture reference screenshots for Home, Intake, Matches, Details, Checklist, Plan, Compare, and Script; compare against Figma for hierarchy, spacing, color, text wrapping, and primary action placement.
- Run keyboard, screen-reader semantics, reduced-motion, contrast, and mobile safe-area checks.
- Test browser back/forward, reload on every route, direct deep links, empty/error states, and offline or delayed repository responses.
- Acceptance: all R1–R14 checks pass, no known discrepancy remains unclassified, and the owner signs off on the visual review.

## Test Matrix

### Unit tests

- cost calculation, break-even, formatting, and assumption warnings;
- match scoring, tie-break ordering, unknown criteria, and explanation generation;
- document type/size validation and checklist reducer transitions;
- plan date generation, rescheduling, completion, and migration;
- repository schema validation and stale-status classification.

### Integration tests

- Home to Compare and both help branches;
- Intake scenario variants to Matches;
- Matches to Details with preserved input;
- Details to Checklist to Plan;
- Plan to Matches without losing progress;
- Details to Script, copy feedback, and call fallback;
- reload and recovery after invalid/missing state.

### Visual and accessibility tests

- 390 × 844 reference viewport for every canonical screen;
- 320 px width for overflow and text wrapping;
- 768 px width to ensure the mobile layout remains intentionally constrained rather than stretched into a broken desktop layout;
- keyboard focus order, form labels, button names, landmarks, contrast, color-independent status, and reduced motion;
- chart data table available to assistive technology.

## Red-Flag Checklist

- Do not turn hypothetical provider data into a claim of real-time availability.
- Do not call an unverified match a guaranteed eligibility decision.
- Do not expose identity documents in URLs, logs, analytics, localStorage, screenshots, or test snapshots.
- Do not let “Save my plan” imply application submission.
- Do not allow a stale status badge to look current; show timestamp and staleness.
- Do not calculate financial totals in UI components or from floating-point dollars.
- Do not hardcode the Figma’s inconsistent 12-month labels or totals.
- Do not use color alone for open/waitlist/closed, selected/unselected, or completed/incomplete states.
- Do not make a fixed CTA cover focused inputs or the home indicator.
- Do not assume `tel:` exists or that a clipboard write succeeded.
- Do not lose progress when a user visits a backup match or presses Back.
- Do not ship a “live” integration without retry, timeout, empty, rate-limit, and stale-data behavior.
- Do not add an account requirement to satisfy persistence without explicitly changing the no-account requirement.

## Implementation Status and Definition of Done

The implementation is ready for review only when:

1. The owner-approved platform is Expo Go/React Native with Dallas-first curated sources.
2. The three DP3 tasks work end to end with seeded demo data.
3. The comparison, scoring, document, and plan logic have independent tests.
4. The usability problems called out in the deck are either fixed or explicitly deferred with a reason.
5. The visual implementation is reconciled against the Figma screens at the primary viewport.
6. Error, empty, loading, stale, invalid-input, and accessibility states are demonstrated.
7. No real provider eligibility or availability is implied by demo fixtures.
8. The repository remains unpushed until the owner explicitly asks for a commit or PR.

## Completed Implementation Checks

- `npm run typecheck` passes.
- `npm run test:unit` passes with six domain tests.
- `npx expo export --platform web` passes.
- Manual browser smoke testing covers Home, Compare, Intake, Matches, Program Details, Checklist, Plan, and Call Script.
- Remaining production work is intentionally outside the prototype boundary: authenticated user accounts, signed/private cloud uploads, malware scanning, automated provider-status refresh, source freshness automation, and deployment infrastructure.
