# Pose critique: current engine against the rubrics

2026-11-12. Scope: Morning Flow (13), Daily 13 (13), Strength (11). Rubrics:
`docs/rubrics/flow.md`, `daily.md`, `strength.md`.

**Method.** Every movement was rendered from the shipped `src/` engine and data at phases
0, 0.125 ... 0.875 with the app's own camera, plus body-frame side and front truth views
(`node proto/audit/sheets.js`, sheets in `proto/audit/out/current/`). A numeric audit
sampled each movement at 64 phases for faults the gauntlet does not test
(`node proto/audit/checks.js`, results in `proto/audit/out/checks.md`). I then judged
each sheet against its rubric checklist by eye. Units: the figure is about 80 engine
units tall, so 1 unit is about 2.2 cm.

**Classification.** D = data (keyframes or camera numbers fix it). S = system (the
engine cannot express it cleanly; the codes are defined in the next section).
Severity: 3 = a person who knows the movement would say it is wrong or cannot tell what
it is; 2 = recognisable but a rubric line fails; 1 = cosmetic.

**Revised after independent review** (`docs/review-figure-assessment.md`) and after a
control experiment (`proto/patched/engine.js`). The reviewer re-scored twelve sheets and
showed that I had over-classified faults as "system" and overstated three severities. I
checked each claim and accept them; the rows below carry the revised scores, and the
earlier score is noted where it changed.

**Result in one line.** 37 movements: 10 pass with cosmetic notes only, 19 have a
severity 2 fault, 8 have a severity 3 fault. None of these were caught by `npm run gauntlet`.

## System problems found

| Code | Problem | Evidence |
|---|---|---|
| S1 | The body root has yaw only. No pitch or roll, so nothing can lie on its side. | Side plank (both apps) and Side-lying clamshell are a prone body with level hips, viewed from an angle: `hpL` and `hpR` have the same height in every frame. |
| S2 | The spine is two rigid segments. `bend` only bows the drawn edge. | Cat-cow: the shoulders move 4 to 5 units when the back "curves", so the elbows bend in cow. Arm sweeps cannot round into a fold. Thread the needle cannot lower the chest. |
| S3 | `tw` is a rigid roll about the lower spine and there is no shoulder girdle. | Thread the needle: the threading shoulder drops 6 units while it sits 22 above the floor. Punches cannot protract. |
| S4 | Camera pitch is fixed at 13°. Anything in the floor plane flattens to about 22%. | Prone Y-T-W, 90/90, floor press upper arm, clamshell knee (foreshortened to 23%). |
| S5 | FK and IK are two representations that do not blend (`lerpT`). | Deep squats: B's hand target applies for the whole cycle, so the standing arms reach for a point 13.7 units away. Lateral reaches: the hip hand floats off the hip. |
| S6 | Each A-M and M-B segment has its own ease, so motion stops dead at every M. | Thread the needle, Reverse lunges, Y-T-W, Split squat, Knee drives pause mid-path. Hand speed in Thread jumps from 2.2 to 12 units per step. |
| S7 | Feet are a derived stub with a heuristic direction; no hands. | The foot flips direction in one step (11 to 12.6 units) in Reverse lunges, Bird dog, Side plank, Split squat. Heel-up on the ball of the foot cannot be authored. Dumbbells hang at the hip, not the thigh. Grip cannot be shown. |
| S8 | Nothing stops a joint passing through the floor. | Windmill hand 1.6 under, Thread hand 1.8, Side plank knee 2.1, lunge foot 1.4, Y-T-W head 0.7. |
| S9 | IK bend direction is a default plus hand-fitted asymmetric swivels. | Single-arm row: the bench leg is folded with the knee reversed. Cobra, Plank: elbows point the wrong way. |
| S10 | Filled props paint over the body. | RDL and Trap-bar: the plates cover the hips and knees, the joints the lift is about. |
| S11 | The engine reports nothing about its own output. | Every flag above came from the new audit, none from the gauntlet. |

## Morning Flow

| # | Movement | Sev | Faults (phase) | Class |
|---|---|---|---|---|
| 1 | Bouncing in place | 1 | Flight is 5 units (about 11 cm), rubric says an inch or two. Arms rigid. | D |
| 2 | Arm sweeps with knee dip | 2 (was 3) | Bottom (0.375 to 0.625) is squatty: knees near 95°, torso only horizontal. The checklist items pass narrowly (head just below hips, hips above knees); the fault is knee angle and hinge depth. | D (was D, S2) |
| 3 | Punching rotations | 2 | Not a horse stance: feet ±12, one leg straight. Retracting fist floats beside the body, not at the ribs. Each upper arm is hidden behind the torso for 27% of the cycle. No protraction. | D, S3 |
| 4 | Dynamic lateral reaches | 2 | Hand "on the hip" floats clear of the body. The lean is a rigid tilt with no curve. At 0.25 and 0.75 both arms are out in a scarecrow T. | S5, S2, D |
| 5 | Cross-body knee drives | 2 (was 3) | One half is wrong: at ph 0 the same-side arm swings out and the opposite arm hangs (rubric item 3 fails); at 0.5 the opposite arm does cross toward the knee. Motion stalls at the M key. | D, S6 |
| 6 | Chest opener swings | 2 | Arms foreshorten to 26 to 29% as they cross (0.25 to 0.5); the left arm reads as a bent wing while the right is straight. "Behind the frontal plane" cannot be seen from this camera. Top arm never alternates. | D (camera), S4 |
| 7 | Single-leg hip circles | 1 | Reads well. Hands on hips draw as straight arms at the sides (no elbow out). | D |
| 8 | Bent rotation sweeps | 2 | Reads at 0 and 0.5. Hand 1.6 under the floor at 0.11 and 0.39. At 0.375 the left arm is a bar across the chest (pointing away from the lens). Feet miss their targets by 0.6 to 0.8. Stops dead at the crossover. | S8, D, S6 |
| 9 | Cat-cows | 2 | Elbows bend in cow (0.375 to 0.625): the shoulders are dragged off the hands. Arms slanted in cat. Rubric item 2 (arms vertical) fails. The control shows this is data: with `s` [62,92] / [92,62] the neck stays put and the elbows hold 177° all cycle. | D (was S2) |
| 10 | Cobra press-ups | 2 | Elbows point down and out at the bottom, not tucked back by the ribs. Right knee lifts off the floor. Hips extended 46 to 50° at the top, which is the two-segment spine pushing the arch into the hip. | S9, S2, D |
| 11 | Pedaling down dog | 2 | The V reads. Heel drop is not visible: both feet look the same, which is the whole movement. Head buried in the arms. | S7, D |
| 12 | Thread the needle | 3 | Support arm is bent in every frame, including the reach. The shoulder and head never go toward the floor. Threading hand 1.8 under the floor at 0.17. Pauses at M. | S2, S3, S8, S6 |
| 13 | 90/90 with a fold | 3 | The Z-sit does not read: the back leg looks nearly straight because its 90° bend lies in the floor plane. Hands miss their targets by 2 to 3.6. | S4, D |

## Daily 13

| # | Movement | Sev | Faults (phase) | Class |
|---|---|---|---|---|
| 1 | Deep squats | 2 | Bottom is thighs-parallel (pelvis 15 units up), cue says almost sitting on the heels. Standing arms reach for the bottom's hand target (miss 13.7 to 15). | D, S5 |
| 2 | Reverse lunges | 2 (was 3) | Reads as a lunge. At the bottom the back shin lies along the floor (kneeling, not a hover): the hover is the ankle target height, data. The ball-of-foot drawing and the toe flip at 0.42 are the engine. Foot 1.4 under the floor at 0.09. | D, S7, S8 |
| 3 | Dead bug | 1 | Passes. Extended heel hover is small. | D |
| 4 | Glute bridge | 1 | Passes. Far arm hidden 25% of the cycle. | D |
| 5 | Side-lying clamshell | 3 | Not side-lying in 3D. The opening knee is the far leg, hidden behind the torso 36% of the cycle and foreshortened to 23%: the shell opening cannot be seen. | S1, S4 |
| 6 | Bird dog | 1 | Passes at full reach. The reaching arm dips below the shoulder mid-path; toe flips at 0.05. | D, S7 |
| 7 | Prone Y-T-W raise | 3 | A line with a squiggle at the head. Y, T and W are not distinguishable. The repo already says so and blames the camera; the camera limit is the engine's. | S4 |
| 8 | Side plank | 3 | Not a side plank. Hips level, legs along the floor, torso ramped: reads as lying propped on an elbow. Knee 2.1 under the floor. | S1, S8 |
| 9 | Plank hold | 2 | Arms are neither forearm-down nor straight: bent mid-air. Rubric item 1 (elbows under shoulders, forearms on the floor) fails. | S9, D |
| 10 | Dumbbell bent-over row | 2 (was 1) | The row reads, but the far arm is hidden all cycle and the two dumbbells merge into one cluster. Knees a little deep. | D |
| 11 | Bench dips | 1 | Passes, including the parallel stop. Bench wireframe is hard to read behind the figure. | D |
| 12 | Dumbbell farmer hold | 1 | Elbows visibly bent; dumbbells at the hip. | S7, D |
| 13 | Standing posture reset | 1 | Passes as a subtle hold. | |

## Strength

| # | Movement | Sev | Faults (phase) | Class |
|---|---|---|---|---|
| A1 | Goblet squat | 1 | Passes. Elbows-inside-knees cannot be judged. | |
| A2 | Neutral-grip floor press | 2 | The upper arm on the floor foreshortens to 14%, so the rep reads as a diagonal arc over the face, not a vertical press. Wrist-over-elbow cannot be checked. | S4, D |
| A3 | Single-arm DB row | 2 | Bench-side leg has a reversed knee: the shin runs forward along the bench toward the head. It is a wrong fitted swivel (`swL:160`), so data, though hand-fitted swivels are why it happened. The row itself reads. | D (S9) |
| A4 | Romanian deadlift | 2 | Plates cover hips and thighs for the whole rep. Hands miss targets by 4.3 mid-rep. | S10, D |
| A5 | Face pull | 3 | Finish reads as a salute: the far arm is hidden, a forearm foreshortens to 4%, elbows-high-and-wide is in depth. External rotation cannot be shown. | D (camera), S7 |
| B1 | Trap-bar deadlift | 2 | Plates cover the entire lower body at the bottom. | S10 |
| B2 | Split squat | 2 | Back shin lies flat, heel-up not shown, toe flips at 0.44. Right arm hidden all cycle. | S7, D |
| B3 | Chest-supported row | 1 | Passes. | |
| B4 | Neutral-grip lat pulldown | 2 | Start: elbows bent out in a diamond, not arms extended overhead. Cable crosses the face. Upper arm foreshortens to 8%. | D |
| B5 | Band pull-apart | 3 | Net view is near profile (yaw 35 + cam 40), so the pull to a T happens in depth: the arms appear to fold into the chest. | D (camera) |
| B6 | Side plank | 3 | Same as Daily 8. | S1, S8 |

## What this says

- **Most faults are data.** About 28 of 37 movements need keyframe or camera edits only.
- **Six movements need an engine change, and the changes are small.** Side plank twice and
  Clamshell need root roll (S1). Y-T-W, 90/90 and Floor press need camera pitch (S4). The
  control (`proto/patched/engine.js`) adds both, plus removing the stop at M (S6), as
  three text patches to the shipped engine; nine of 13 Flow and eleven of 13 Daily
  movements stay byte-identical, and the six that differ are exactly those with an M key.
- **Feet (S7) are the one system fault the control does not address.** Heel-up on the
  ball of the foot and the toe flip affect Reverse lunges, Split squat, Down dog, Bird dog.
- **The errors were findable.** Every numeric flag above came from about 80 lines of
  checks. Will finds faults by marking up screenshots because of S11: nothing in the
  pipeline looks.

## Needs Will (not guessed)

1. Deep squats: is the target truly "almost sitting on the heels" (cue text) or the
   parallel squat now drawn? Fixing the pose to the cue changes how deep the figure goes.
2. Cat-cows: the rubric reads Will's "elbows locking the movement out" as "arms straight
   and vertical, shoulders free". Confirm.
3. Plank hold: the spec says forearm plank, the spoken setup says "Elbows or hands under
   your shoulders". The figure should show one. Forearm assumed.
4. Side plank sag: the loop animates the fault. A reviewer may read the sag as the
   exercise. Keep, or hold the line with a small breath?
5. Bent-over row: "hinge ~45 to 60°" does not say from vertical or horizontal.
