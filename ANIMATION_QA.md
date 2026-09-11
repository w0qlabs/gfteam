# Jiu-Jitsu motion refinement — 2026-09-11

## Inventory before editing

The website has one shared SVG rig and three existing finish variations. Each
uses the original standing base, grips, weight transfer and side landing, then
branches into its own finish. No other character sequences were found in the
HTML, entry module or animation modules. The belt is a separate interaction.

| Existing variation | Problem frames | Refinement |
| --- | --- | --- |
| Chave de braço | Side landing to sitting rotation; white legs and wrist grip hidden behind the blue body | Isolate the arm, collect the leg, rotate the hip, pass the leg, settle; 10 poses including entry, 9.73s |
| Triângulo | Abrupt change from side landing to guard; knees, feet and head fused | Sit into guard, recover guard, raise hips, cross legs, settle; 10 poses including entry, 10.43s |
| Mata-leão | Side landing to seated back control; torso rises without preparation, hooks hidden | Follow the turn, establish seated back control, arrange grips, settle; 9 poses including entry, 9.93s |

The original four stage controls, desktop/tablet scroll progression, mobile
playback, shuffled finish bag, no consecutive repeat, captions and reduced-motion
access to every finish remain. Pause now continues the same sequence. New
variations reset with a short fade instead of morphing between unrelated poses.

## Shared rig and presentation

- Pose coordinates remain independent per finish. A fifth shared entry pose
  explains the descent before the existing side landing.
- Torso/head orientation interpolates around connected joints. A two-bone
  solver keeps hands and feet on authored paths with continuous bend poles.
- Footsteps clear the mat; planted feet and ground hooks retain their targets.
- Far and near limbs use separate SVG layers across both characters. Thin
  outlines, local gi shades and visible hands distinguish overlapping contacts.
- Belt tails follow the torso; the front head stays readable within the triangle.
- Fixed closer framing, without camera animation, improves small-screen scale.
  Controls wrap and the explanatory note stays at least 11px.

## Verification

Playwright used Chrome with desktop, tablet and mobile viewports. Baseline
screenshots sampled all three original sequences before editing. Final captures
cover every key pose and transition midpoint at 1440px, and the initial pose,
every transition midpoint and each final pose at 768, 390 and 320px.

- `motion-review.cjs`: all three variations captured; no browser errors.
- `motion-behavior.cjs`: 48 passing checks covering real-time playback of all
  three finishes, pause/resume, keyboard stages, selection across resize,
  intentional versus incidental scroll, reverse scroll, every reduced-motion
  finish, live preference changes and touch controls.
- `rig-continuity.mjs`: 1,000 samples per transition and practitioner, exact
  endpoints, finite geometry, maximum adjacent joint displacement below 1 SVG
  unit per 0.1% transition increment. Thirty picks verify the complete shuffled
  bags and no consecutive repeat. This exposed and resolved a knee jump in
  armbar hip rotation by adding its own leg-collection pose.
- `motion-production.cjs`: production playback passes; animation section and
  buttons fit at 1440/768/390/320px. Axe WCAG A/AA checks report zero violations
  in `#filosofia` at all four widths.
- `npm.cmd run build` and `git diff --check`: pass.

Impeccable review retained the existing palette, illustrated style, section
layout and controls. Manual frame inspection checked silhouettes, head placement,
grips and transitions separately for all three variations. The detector raised
existing page-wide typography/palette advisories; the animation section's
rendered accessibility was checked with Axe and its controls were exercised.

Screenshots and generated JSON reports are local, git-ignored artifacts in
`output/playwright/`. `sheet-final-{armbar,triangle,rear-choke}.png` contains the
desktop review sheets; `sheet-final-{390,768}-*.png` contains responsive frames.
`responsive-*-320.png` shows the final small-screen controls and captions.

Limits: viewport/touch emulation, not physical devices or a Safari/Firefox
audit. The illustrations remain conceptual rather than technical instruction.
The whole page has an existing 7px overflow at 320px from a standalone period
outside this animation section; the animation canvas and controls fit correctly.
No deployment was performed.
