# HomeHearts Native App Override

This page override is the native/mobile source of truth for the Dallas housing-crisis workflow. The generic generated MASTER remains a search artifact; this override takes precedence for the Expo app.

## Product feeling

Calm, practical, and trustworthy. Use the Figma DP3 lavender/coral palette with generous white cards, strong readable ink, short supportive copy, and clear status metadata. The app should feel like a capable navigator during a stressful decision, not a marketing page. Lead each phone screen with one visual anchor, one short headline, and one obvious next action.

## Tokens

- Canvas: `#F8F7FB`
- Surface: `#FFFFFF`
- Ink: `#211F2B`
- Muted: `#746F80`
- Primary: `#6C4EE3`; primary soft: `#EEE9FF`
- Coral: `#FF7766`; coral soft: `#FFF0ED`
- Success: `#2B8C6B`; success soft: `#EAF7F1`
- Border: `#E4DFEC`
- Spacing: 4/8/12/16/20/24/32/40
- Touch targets: minimum 44pt; primary buttons 54pt
- Radius: 10/16/20/28; pill 999

## Component rules

- Use vector Ionicons consistently; no emoji for structure.
- Prefer flat vector icon tiles, compact metric tiles, icon-led rows, and short step rails over paragraphs of explanation.
- Use two-column issue tiles at standard phone widths; collapse to one column below 360px.
- Keep card copy to one visible reason or status line; move complete explanations to the detail route.
- Every icon-only control has an accessibility label.
- Every program card shows status, status source, checked date, coverage, and a reason for the match.
- Every document row exposes accepted formats, add, preview, replace, and remove states.
- Use `Pressable` feedback without layout shift and Reanimated only for opacity/transform.
- Bottom tabs are limited to Home, Matches, and My plan; focused flows use stack navigation.
- Safe-area padding and scroll bottom insets must keep content above the floating tab bar.

## Motion

Use short staggered entrance fades (280–350ms) for cards and gentle spring press feedback. Honor reduced-motion settings in future native accessibility work; motion must never encode a status that is not also written as text.

## Trust and accessibility

Do not use color alone for status. Do not call a match an approval. Use “last checked,” “call to verify,” “waitlist,” or “unknown” when current status is not guaranteed. Keep forms labeled, errors next to the field, and long copy scannable at larger text sizes.

