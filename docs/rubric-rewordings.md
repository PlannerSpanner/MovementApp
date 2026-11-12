# Rubric lines I re-worded as tests

2026-11-12. The rubrics in `docs/rubrics/` are unchanged. These are the checklist lines whose executable form in `qa/fig/rubric.js` is not a literal reading of the rubric. Lines that changed only because of your decisions (squat depth, side plank hold, forearm plank, row angle, cat-cow arms, breathing) are listed last. Units: 1 unit is about 2.2 cm.

| Line | Original rubric line | What the test checks | Reason |
|---|---|---|---|
| Flow 2.3 | Are the knees most bent in the same frame the trunk is most folded? | The two fall within 5 of the 64 sampled frames (8% of the cycle). | The hips travel from in front of the ankles to behind them, so the knees are deepest a moment before the fold is. |
| Flow 3.3 | In that frame is the other fist at the ribs? | The fist is within 10.5 units of the middle of the lower ribs. | That reference point is inside the trunk. A fist held beside the ribs sits 6 to 10 units from it. |
| Flow 4.4 | Is the non-reaching hand on the hip in those frames? | The hand is within 6.5 units of the hip joint and above it. | A hand on the hip rests on the crest, about 5 units above the hip joint. |
| Flow 7.8 | Are the hands on the hips in every frame? | Same as Flow 4.4. | Same. |
| Flow 10.4 | Is there a frame with the chest lifted and the back visibly arched? | The shoulders rise at least 15 units and the spine arch is at least 30°. | I first required 20 units. The reviewer pointed out the rubric's own text caps the trunk at 30 to 45° (a press short of end range), which is 15 to 18 units on this figure. |
| Daily 2.7 | Is the rear foot on its ball, heel up, whenever it is behind? | Heel at least 2.5 units up over a planted ball of the foot, once the foot is 25 or more units behind the front foot. | Mid-step the foot is travelling and the heel is still rising. The line is about where it lands. |
| Daily 3.1 | At phase 0, are both thighs vertical, both shins horizontal and both arms vertical? | Thighs within 10° of vertical (I first wrote 8°). | With the knees hip-width apart the thighs measure 8.06°. |
| Daily 11.5 | At phase 0.5, is the upper arm about horizontal (not well short of it either)? | Upper arm within 18° of horizontal. | The bottom now stops 1.5 units short of parallel, as a margin on your AC-joint rule. That is 7° short of horizontal. |
| Daily 12.2 | Is there a dumbbell in each hand, beside the thigh, in all eight frames? | The handle sits in the fist at least 2.5 units below the hip joint, outside the leg. | Mid-thigh is 9.5 units below the hip. On this figure the fist hangs 3.3 below it (see the proportions note in the report). |
| Daily 13.1 | Is the figure standing with feet planted and arms at the sides? | Wrists within 3 units of hip height and within 7 of the hip joint. | Same proportion: the wrist hangs at hip-joint height. |
| Strength A1.6 | Do the knees point the same way as the toes, never inward? | Tested only while the knees are bent past 160°. | Standing with the toes turned out, a straight leg's knee is inside its foot by geometry; that is not a collapse. |
| Strength A2.x1 (mine, from the critique) | The press reads as vertical on screen. | Hand travel is at least 1.3 times taller than wide (I first wrote 2 times). | With the elbows 45° out, the hand must move 13 units inward while it rises 13. Twice as tall as wide is impossible for a correct press. |
| Strength A4.7 | Do the shins stay near vertical throughout? | Within 12° (I first wrote 10°). | They reach 10.3° for an instant mid-descent as the hips travel back. |
| Strength B1.2 | Are the hands beside the legs (not in front of the shins) in every frame? | Handles outside the hips and no more than 7 units ahead of the ankles. | With the load on the floor and this figure's long trunk, the shoulders sit ahead of the feet; the arms are now 10° back of plumb to keep the handles by the legs. |
| Strength B2.4 | Is the front shin near vertical in every frame, with the front heel down? | Heel down in every frame; shin within 9° of vertical whenever the front knee is bent past 125°. | At the top of a long stance the front leg is nearly straight and must slant back to the hip. "Hips straight down" (B2.6) and "shin vertical in every frame" cannot both hold; the reviewer agreed the rubric line is the wrong expectation there. |

## Changed by your decisions, not by me

| Line | Was | Now |
|---|---|---|
| Daily 1.4 | Hip crease clearly below the top of the knee (rubric text also said nearly sitting on the heels). | Hip 0.8 to 6 units below the knee and at least 12 above the floor: just below parallel, not on the heels. |
| Daily 8.5, 8.6 and Strength B6.4, B6.5 | The hip visibly sags at 0.5 and never rises above the line. | Replaced by one line: the pelvis travels no more than 1.2 units (a breath). |
| Daily 9.1 | Elbows under shoulders. | Also: forearms on the floor (forearm plank). |
| Daily 10.1 | Trunk at the same forward angle in all frames. | Also: 40 to 50° from the floor. |
| Flow 9.2 | Arms and thighs vertical in every frame. | Also: elbows at least 170° (softly locked). |
| Daily 13.3, 13.4, 13.7 | Ribs forward at phase 0, stacked at 0.5; exhale longer than inhale (not testable). | Flare at the top of the inhale (40% through the cycle), stack at the end of the exhale; 13.7 is now a test: 10 s cycle, 4 s in, 6 s out, three breaths in 30 s. |
| Daily 7 (new line) | (none) | Two cameras: the setup preview is side-on and there is a mat on the floor. |
