# Figure work, Phase 2

2026-11-12. Branch `figure-assessment`, nothing pushed.

Your skin is applied to both templates, with feet and hands as small 3D shapes, the two-camera Y-T-W and the 4-in, 6-out posture reset. The full audit passes with it. The skin has a measured cost at Live Activity size, listed below. Hands do not show grip direction at phone size; the implement does.

## Feet, third pass: built from 3D landmarks

You sent back the close-ups: jagged outline, a line end sticking out, a heel far too big, and an arch on both sides.

- **The foot is now 14 landmarks in its own frame**: ankle, inner and outer ankle bones, back of heel, heel pad, top of the inner arch, the outside edge, instep, big-toe and little-toe joints, three toe tips. Each is a small ball. They are projected every frame and one outline is drawn round them, so the same foot gives the side, top, front and oblique silhouettes.
- **Smooth.** The outline is the hull of the projected balls, resampled evenly and relaxed into one soft curve of 64 points, drawn as a curve, not a polygon. No turn between neighbouring points exceeds 50° in any frame. Hands are drawn through the same curve.
- **Arch on the inside only.** The inner arch landmark is raised 0.8 units off the sole; the outer edge is low and nearly flat. The sole edge lifts to the arch only when the inner side of that foot faces the camera. Medial is set by handedness (big-toe side), so it is right for both feet in every pose.
- **Heel and shin.** The heel is 2.9 units behind the ankle and 1.6 below it. The shin is narrowest at the ankle, and the ankle landmark is always a little larger than the shin's end cap, so the cap cannot escape.
- **Proportions.** Foot length 12.0 units and breadth 4.6, from Drillis and Contini's 0.152 and 0.055 of stature at this figure's 79 units. Heel 24% of foot length, ball of the foot at 73%, arch about 6% of length. Those three ratios are from memory of standard foot anthropometry; I did not open a source for them today. One deliberate departure: ankle height is 1.6, half the published 0.039 of stature, because the skeleton's ankle joint sits on the floor line and a taller foot would be drawn under the floor. That goes with the hip-joint note for the UX refresh.
- **New checks, in the gauntlet, every frame of every movement:**
  - the outline does not cross itself and has no corner over 50°;
  - the ankle and the whole end of the shin stroke, cap included, are inside the foot;
  - the heel is 18 to 30% of a foot 11 to 13 units long;
  - the raised arch is on the big-toe side and the outer edge is low, for both feet.
- **Against the previous foot:** every one of the 37 movements had a corner over 50° (the sharpest was a full fold-back), and one had an outline that crossed itself. The new foot passes all of the above.
- **Where to look:** the first cards under Close-ups are both feet from the side, the other side, the front, three-quarter, above and three-quarter from above, then the quadruped and prone poses.
- **Not done:** no fresh reviewer on this pass. The last one passed the feet you then rejected, so your eye on the phone is the test.

## Foot fixes after your phone check

You found three foot bugs that the audit and the reviewer had both passed. All three had one cause: the foot was built from "toe direction plus sole toward the floor", with the ankle on the sole line.

- **Ankle inside the foot.** The ankle joint now sits 1.4 units above the sole and 2.2 forward of the back of the heel. The foot encloses the end of the shin and is painted over it.
- **Real orientation.** The top of the foot continues the front of the shin and the sole continues the back. Standing, the sole is down. On all fours and prone, the foot is in line with the shin with its top on the floor and the sole up. On the back, toes point at the ceiling.
- **Prone and kneeling feet are authored**, not guessed: toes straight back. The old guess pointed the prone toe back along the shin toward the knee, which is the blob you saw in Cobra.
- **Three new checks, in the gauntlet:** the ankle must be inside the foot outline in every frame; the shin end must not extend past the outline; the sole direction must match the contact (sole down when the shin stands on the foot, top of foot down when the shin lies on the floor, toes tucked only for Plank hold, Reverse lunges, Split squat and Chest-supported row).
- **Would they have caught it?** Run against the previous commit's foot they raise 75 failures: 62 for the shin poking past the foot, 5 for the ankle outside it, 8 for the sole direction (Cobra and Y-T-W among them). On the new foot all three pass in all 37 movements. One limit: for the old Cat-cows foot only the shin check fired; my reconstruction of the old foot's "which way is up" was not exact enough to say the sole check would have.
- The quadruped and prone movements are the first cards under Close-ups on the review page.
- **A fresh reviewer, looking only at feet in enlarged close-ups,** confirmed all three of your bugs fixed and found three more, now fixed: the Single-arm row's kneeling foot hung through the bench (it now lies along it), and Floor press and Glute bridge had the toes in the air on planted heels (now flat, with a check for it). Left as they are, and visible if you look for them: side-plank feet point at the camera and read as a lump; the tucked Plank foot is folded more sharply than a real ankle; kneeling and prone feet show a slight double bulge at ankle and forefoot.

## Update after your answers (same day)

- **Joint width 3.0** (was 4.4), below the narrowest swell (forearm 3.1), so every limb tapers into the shoulder and hip. Of the 12 accepted regressions, **2 went away and 10 remain**. Gone: the Arm sweeps fold thumbnail (back to 3 of 8 limbs, same as the old skin) and Plank's hidden far thigh. The 10 that remain are a far arm lying along the trunk or thigh in standing poses (5), a far limb behind a near one (3) and two thumbnails that follow from those. They come from limb thickness, not the joint caps.
- Elbow and knee width is still your 3.2, which is wider than the forearm swell (3.1). A dry run at 2.9 clears one more (the Plank thumbnail). I left it as exported.
- **Left-limb colours darkened** in all five pages to at least 3:1 against the darkest part of each page background (3.02 to 3.06:1; they were 1.8 to 2.1:1). Left against right is now 2.0 to 2.8:1, down from 3.2 to 4.4:1. The build checks both. One caveat: during GET SET UP the whole figure is dimmed to 62% on purpose, and there the left limb is about 1.9:1.
- **Far-limb factor** stays 0.8. **Hip joint** is noted in `CLAUDE.md` for the UX refresh.

## What you asked for in this round

| Item | Status |
|---|---|
| 1. Apply the skin, re-audit | Done. `src/skin.json` is your export plus the far-limb factor. 261 of 261 rubric tests pass, no numeric fault. The skin check passes with 10 accepted costs (12 before the joint width change). |
| 2. Feet with a real shape | Done. A wedge from the side, a footprint from above, both projected from one 3D foot. Heel-up pivots on the ball. |
| 3. Hands, and implement height | Done, with two findings you asked me to report: grip direction does not read from the hand at phone size, and the dumbbells still hang short of mid-thigh. No limb length changed. |
| 4. Y-T-W on both cameras | Done. Setup preview side-on, work phase from above, mat under the body. |
| 5. Posture reset breathing | Done. 10 s cycle, 4 s in and 6 s out, three breaths in the 30 s. The breath tone follows it. Session still 715 s. |
| 6. Re-worded rubric lines | [The table](rewordings.html): original line, what the test checks, reason. |

## The skin

- **Far-limb narrowing.** I read "far-limb width multiplier" as: of each left/right pair, the limb farther from the camera is drawn narrower. I set it to 0.8 and it eases in over a few units of depth so nothing pops. No keyline. Say if you meant something else or want a different factor; it is one number, `far`, in `src/skin.json`.
- **What narrowing does and does not do.** It gives depth and stops two side-by-side limbs reading as one slab. It does not help when the far limb is directly behind the near one: a narrower limb hides more completely. So I also turned five side-on lifts 14 to 18° off pure profile (RDL, Trap bar, Chest-supported row, Single-arm row, Bench dips), and Glute bridge 10°, so the far leg shows beside the near one.
- **Contrast.** Left limbs are 3.1:1 or better on all eight stages; left against right is 3.4:1 or better. The stage colours are still placeholders.
- **The web apps' own colours do not meet 3:1.** The 3:1 figure above is for the pale and dark stages of the new player. In the pages as they ship today, the left limb against the page is 1.9:1 in Morning Flow, 2.1:1 in Daily 13, 1.9:1 in Strength and 2.0 to 2.2:1 in the two prenatal apps. Darkening each left-limb colour about 35% toward the right-limb colour reaches 3.05:1 and leaves left against right at 2.2 to 3.0:1 (Flow `#6593a2`, Daily `#8f85b5`, Strength `#7f945c`). I did not change the themes: it alters each app's look and you asked about stages. One line each if you want it.
- **Measured cost at 28 pt.** Against today's skin, 12 things got worse and I accepted them with a reason each (`qa/fig/skin-waivers.json`, and at the bottom of the [sheets page](sheets.html)):
  - 8 are thumbnails where one limb fewer reads at the movement's worst phase. Six of those are a standing figure whose far arm now merges with the thicker trunk.
  - 4 are a far limb mostly hidden behind a near one for part of the cycle (Plank's far thigh, Down dog's far thigh, the far forearm in two rows).
  - The single worst thumbnail is the deep fold in Arm sweeps: 2 of 8 limbs read, against 3 today.
- Your joint width (4.4) is wider than every limb's swell except the thigh's. That is most of why arms merge with the trunk at 28 pt. A narrower shoulder and hip would recover several of the 12.

- **Review.** A fresh reviewer looked at all 37 sheets with the skin: "ship after fixes" on the first pass (planted hands went through the floor, Dead bug's toes pointed down, gripping hands were open), "ship" after those were fixed. Two things it called faint and I left: the daylight under the rear knee in the lunge and split squat is about 3 units and will be hard to see on a phone, and in broad front views the figure reads nearer 3 to 4 than 2 because of the wide shoulder and hip caps.

## Hands, grip and implement height

- **The hand** is one flat mitten continuing the forearm, with the thumb as a bulge on one edge. Its thumb side follows a grip number per pose: 0 neutral, 90 pronated. The audit fails the build if any pose turns a hand toward supination.
- **Grip direction at phone size: it does not read from the hand.** On a phone the thumb bulge is 2 to 4 pixels and is usually under the implement. What reads is the implement: dumbbell handles running front to back (neutral) on rows, presses, the farmer hold and the pulldown handles; a bar across the body (pronated) on the RDL and the band. Nothing in the three apps shows an underhand grip. I did not add detail to force it.
- **Implement height.** Implements now sit in the fist, 3.4 units beyond the wrist joint. Effect:

| | Before the hand | With the hand | Real proportions (Drillis and Contini) |
|---|---|---|---|
| Dumbbell handle below the hip joint, standing | 0 (at the hip) | 3.3 units, 7 cm | 6.9 units, 15 cm |
| Distance still to go to mid-thigh | 9.5 units | 6.2 units | 2.8 units |
| RDL: arms back of plumb at the bottom | 11° | 5° | |
| RDL: trunk hinge at the bottom | 64° | 53° | |
| Trap bar: arms back of plumb at the bottom | 17° | 10° | |
| Trap bar: trunk at the bottom | 65° | 54° | |

- **Why the dumbbells are still high: it is not the arms.** Scaled to this figure's height (79 units), Drillis and Contini give shoulder-to-wrist 26.2 units; the figure has 26. The arms are right. The hip joint is low: 37.8 units above the floor against 41.9, because the trunk is 3.2 long (26 against 22.8) and the legs are about 4 short (the figure has no ankle height). Raising the hip joint 3 to 4 units would put the handle where it is on a person. That moves every pose in all five apps, so I have not done it. Your call.

## Y-T-W and posture reset

- **Y-T-W.** During GET SET UP the figure is side-on and holds the Y on the floor, so face-down reads. When the work starts the camera is above and the letters read. The mat is four floor lines under the body. It needed one small template feature: a movement can name a second camera for its setup preview.
- **Posture reset.** The loop starts stacked, opens to the rib flare over a 4 s inhale and settles over a 6 s exhale. The movement is still about 4 cm of chest travel, so the tone carries most of it.

## The numbers

- 261 of 261 executable rubric lines pass; 26 more are judged on the sheets.
- No joint under the floor, no missed target, no jump between frames, no supinated grip, in any of the 37 movements.
- 11 pose flags and 12 skin costs are accepted with written reasons.
- Morning Flow 805 s, Daily 13 715 s. `npm run gauntlet` passes.
- Every movement in all five apps now renders differently from main, because the skin applies everywhere, including Prenatal Stretch and Birth Prep. Their poses are untouched.

## Still needs you

1. **Skin cost.** Look at the Live Activity sizes with your export. If the arm-into-trunk merge bothers you, the lever is joint width.
2. **Far-limb factor.** 0.8 is my choice, not yours.
3. **Hip height.** Raise the hip joint to real proportions, or leave the dumbbells at upper thigh.
4. **Web theme colours.** Darken the left-limb colour in the current pages to reach 3:1, or leave them until the native player.
5. **Chest opener swings** still cannot alternate the top arm between cycles.
6. **Listen** to the re-recorded Plank hold line and to the 4 and 6 breath tone.

## What is not proven

- No phone test. Pages were checked in phone-sized Chromium and WebKit on this computer.
- The reviewers are other instances of me looking at eight stills per movement.
- The breath tone timing is tested for scheduling, not by ear.
