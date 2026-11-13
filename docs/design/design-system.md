# Movement design system

2026-11-13. Direction A, letterpress, as built in the web app on branch `design-refresh`. This is the reference for the native iOS build. Everything here is in the shipped pages (`src/app_head.html`, `src/home.html`, `src/wk_head.html`, `src/app_tpl.js`) and is checked by `node qa/design.js`.

Decisions behind it (Will, 2026-11-13): direction A complete; week circles are solid; the movement name is reversed out of a solid bar; left limbs are always the hatched ones; the hairline where a right limb crosses the trunk stays; the figure has no name yet.

## 1. Principles

1. **One person, 6am.** Calm first. Nothing on the work screen asks to be read.
2. **Four inks.** Paper, ink, vermilion, ochre. Nothing else, ever.
3. **The phase colours the frame, never the stage.** The paper behind the figure is always paper.
4. **Poster density only on the transition and the finish.** Home is quiet. Work is nearly empty.
5. **The figure is the character.** It speaks through motion only. No face.
6. **No guilt.** A missed day is an empty circle. No streak count.

## 2. Colour

| Token | Light | Dark | Use |
|---|---|---|---|
| `paper` | `#f3ead6` | `#151310` | Every surface, the stage |
| `ink` | `#1b1814` | `#efe5cf` | Type, rules, the figure |
| `vermilion` | `#d2432a` | `#e2573c` | Work frame, posters, seals, the one primary button |
| `ochre` | `#d99a2b` | `#e0a53a` | Setup frame, "Get set" block, implements |
| `mute` | `#7d7361` | `#9a917f` | Labels, empty circles |
| `deep` | `#1b1814` | `#000000` | Finish frame |
| left tone | ink 52% into paper | ink 46% into paper | The figure's left side when too small to hatch |

Dark mode swaps paper and ink and lifts the two colours slightly. It follows the system setting.

Text set on vermilion or ochre uses fixed values, not tokens: cream `#f3ead6` on vermilion, black `#1b1814` on ochre, in both modes.

Contrast, checked by `qa/fig/skin.js`: the left tone holds at least 3:1 against the paper and 2:1 against the ink, light and dark.

### Frame by phase

| Phase | Frame | Paper shows |
|---|---|---|
| Ready, home, seal sheet, strength | paper | Title, intro, Start |
| Transition poster (1.8 s) | vermilion | A flat vermilion sheet: count, name bar, "Begin" or "Next" |
| Setup | ochre | Name bar, still figure, countdown, "Get set" block |
| Work | vermilion | Figure, time, Next |
| Finish | deep | Vermilion poster: celebration, "Done", line, week row |

Frame width 12 pt plus the safe-area insets. Paper corner radius 4 pt.

## 3. Type

| Role | Face | Size | Notes |
|---|---|---|---|
| Caps (titles, labels, buttons, numerals) | DIN Condensed, then Avenir Next Condensed | see below | Bold, upper case |
| Reading text (intro, form text, ending line, daily line) | Baskerville, then Hoefler Text | 0.92 to 1.1 rem | Italic for the daily line and the ending line |

Both ship with iOS. Nothing is downloaded.

| Element | Size | Tracking |
|---|---|---|
| Timer numerals, work | clamp(5.5 rem, 34 vw, 10 rem), line height 0.82 | −0.01 em, tabular |
| Timer numerals, setup | clamp(3.4 rem, 19 vw, 5.6 rem) | same |
| Page title | clamp(2.2 rem, 13 vw, 4 rem) | 0.02 em |
| Name bar | clamp(1.4 rem, 7.6 vw, 2.3 rem), reversed out of ink | 0.1 em |
| Buttons | 0.95 to 1.35 rem | 0.12 to 0.16 em |
| Small labels | 0.78 rem | 0.16 em |

**Dynamic Type.** The root font is `-apple-system-body`, so every rem follows the system text size. In SwiftUI use `.dynamicTypeSize` with relative fonts, and cap the numerals at their clamp maximum.

## 4. Layout and controls

- **Left-aligned.** One hairline rule (1 pt, ink) under a title. No boxes round content except buttons.
- **Thumb row.** Every control used during a session is in one row at the bottom: Pause, Next, Skip. Height 58 pt or more.
- **Tap targets.** 44 pt minimum anywhere; 56 pt minimum in the thumb row (checked).
- **Buttons.** 1.5 pt ink outline, 4 pt radius, transparent. One primary per screen is filled vermilion. A selected toggle is filled ink.
- **Progress.** A row of ticks, one per movement: done is ink, current is vermilion, to come is mute at 35%.

### Word budget

| Screen | Words allowed besides numerals |
|---|---|
| Work | "Next" plus the next movement's name, and the two controls "Pause" and "Skip". Nothing else. |
| Setup | The name bar, "Get set", the setup cue, "Pause", "Skip" |
| Poster | "n of N", the name, one word |
| Finish | "Movement complete", "Done", the ending line, "Home" |

A next-name longer than nine characters wraps to two lines at a smaller size. The current movement's name is not shown during work: it was on the poster and the setup screen and was spoken.

### Behind a tap

Tapping the figure drops a sheet from the top (so it never covers the time): position in the session, name, cue, side note, the long form text, then Prev, Restart, Voice, Close, the background-music setting and the video link.

## 5. The figure

- **Ink rendering.** Trunk, head and right limbs are solid ink. A 0.42-unit hairline of paper runs round each right limb so it separates from the trunk.
- **Left limbs are hatched, always.** Left and right never swap with depth. Each of the four left limb segments has its own hatch: period 1.5 units, line 0.62, set 22° off square to the bone, anchored to the limb so it rides with it, inside a 0.5-unit ink outline.
- **Left hands and feet** are the solid left tone with a 0.4-unit ink outline. They are too small to hold a hatch.
- **Small sizes.** Below 2.3 screen points per figure unit, or when the figure's own scale is under 0.8, the whole left side is the solid tone. This is what the strength cards and the launcher use.
- **Implements** are ochre. A mat is ochre at 30%.
- **Ground** is one ink hairline at 55%.
- **Stage fit.** The figure is fitted to the real shape of its stage with margins taken from what is drawn, capped at 2.1 times. Standing movements grow to fill a tall stage. Wide, low movements reach both side margins (plank, bird dog); on a portrait phone the width is their limit, so paper remains above and below them. Only a landscape stage would fill that.
- **Setup preview** is the start position, held still, at full ink. It is never dimmed.

### States

| State | Motion |
|---|---|
| Idle (home) | Standing breath loop |
| Setup | Start position, still |
| Work | The movement |
| Finish | A light bounce with both arms up, 0.9 s cycle, facing the viewer, drawn in paper colour on vermilion |

Proposed for the native build, not built: a settle on pause, a head turn toward the next position in the last three seconds, a nod as the seal lands.

### Proportions

Against Drillis and Contini (1966) at the figure's height of 80.8 units, sole to crown. Sources and their limits are in `research.md` section 5.

| Measure | Figure | Fraction of height | Published |
|---|---|---|---|
| Hip joint above the sole | 42.1 | 0.521 | 0.530 |
| Thigh, shank | 19.75 each | 0.244 | 0.245, 0.246 |
| Ankle joint above the sole | 3.1 | 0.038 | 0.039 |
| Shoulder above the sole | 65.6 | 0.812 | 0.818 |
| Shoulder to wrist | 26.0 | 0.322 | 0.332 |
| Foot length | 12.3 | 0.152 | 0.152 (widely quoted; not confirmed in a source I could open) |
| Ball of the big toe from the heel | 0.74 of the foot | | 0.735 to 0.743 (Xu et al. 2018) |
| Ball of the little toe from the heel | 0.64 of the foot | | 0.633 to 0.644 (Xu et al. 2018) |
| Forefoot breadth | 0.37 of the foot | | 0.37 (Hajaghazadeh et al. 2018) |
| Heel breadth | 0.26 of the foot | | 0.26 (same) |
| Inner arch height | 0.15 of the foot | | 0.142 to 0.164 (Williams and McClay 2000) |

Three things are not from data, by decision or to limit risk:

- **The heel is flush with the back of the shin** (Will, 2026-11-12). The ankle is therefore 0.12 of the foot from the heel, where the cited ankle-bone position is 0.26 to 0.31. All the added foot length is in front of the ankle.
- **The arms are unchanged** at 13 + 13. Total length is 3% short of the published figure, and the published upper arm is longer than the forearm (15.0 and 11.8 at this height). Changing the split moves every elbow.
- **The drawn trunk still ends where it did.** The hip joints moved 3.0 up inside the trunk shape; the shape below them stands for the pelvis.

## 6. Seals and history

- **A seal** is a solid vermilion disc carrying the date in cream, turned 7° anticlockwise. An empty day is a dashed circle carrying the weekday letter.
- **Rule.** One seal per calendar day on which any session was finished. A timer session counts when its finish fires. Strength counts when a workout is fully checked. No partial credit, and unchecking never removes a seal.
- **Week row.** Monday to Sunday, on the launcher and the finish screen.
- **Seal sheet.** The current month as a Monday-first grid, with earlier months that have seals. No streak number anywhere.
- **Storage.** `mvLog` = `{"YYYY-MM-DD": ["morning-flow", …]}`, local calendar days, pruned to 400 days. The native build should migrate it.

## 7. The finish

1. Frame goes deep; the paper becomes a vermilion poster.
2. The figure celebrates.
3. The four rising notes play (440, 554, 659, 880 Hz).
4. At 1.0 s today's seal stamps onto the week row (scale 2.4 to 1 with overshoot, 0.5 s) as a 110 Hz thud and a 1318 Hz ring land.
5. The voice says "Movement complete." and nothing else.
6. The ending line is short, positive, and puns on the session's own movements. No safety text.

## 8. Sound

Unchanged family: sine notes on the shared audio context, and the Kokoro voice clips.

| Moment | Sound |
|---|---|
| Movement starts | 440, 554, 659 Hz rising |
| Setup starts, switch sides | 659 Hz twice |
| Setup last three seconds | 520 Hz tick each second |
| Work last three seconds | one 380 Hz tick |
| Finish | the four notes, then 110 Hz and 1318 Hz with the seal |

## 9. Haptics (native)

| Moment | Haptic |
|---|---|
| Any button | `UIImpactFeedbackGenerator(.light)` on touch down |
| Setup 3, 2, 1 | `.rigid` at intensity 0.5, one per second |
| Work starts | `.medium` |
| Switch sides | two `.light`, 280 ms apart |
| Work last three seconds | `.soft` at intensity 0.4, one per second |
| Movement ends | `UINotificationFeedbackGenerator(.success)` |
| Seal lands | Core Haptics: one transient at intensity 1.0, sharpness 0.3, then a 120 ms continuous decay from 0.5, timed to the 110 Hz note |
| Pause | `.soft` |

Rules: nothing during work except its last three seconds; respect the system setting; no haptic without its sound or a visible change.

## 10. Motion

- Frame colour: 0.45 s ease.
- Sheet: 0.28 s slide.
- Poster: appears at once, clears after 1.8 s or on a tap. It never delays the timer.
- With Reduce Motion on: no slides, no stamp animation; the seal simply appears.

## 11. What the native build must add

- Lock-screen Live Activity: time left, next movement, the phase colour as the tint.
- The haptics above (the web build has none).
- The three figure moments listed under States.
- Short forms for long movement names, so "Next" never wraps.
