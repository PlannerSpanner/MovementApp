# Independent review of the figure-system assessment

2026-11-12. Reviewer brief: find what is wrong and argue against the recommendation.
Everything below comes from opening the sheets and strips, reading `proto/rig/*.js`, and
running the rig's own `poseAt().flags` at 64 phases (read-only). Nothing was built or edited.

**Verdict.** The audit (rubrics, sheets, checks) is the valuable output and should ship
now. The rebuild recommendation is not yet supported: the prototype repeats two of the
faults it was built to cure, its self-checks report "no flags" on them, and it has not been
tried on anything with a prop, an orbit or a movement the current engine already gets right.

## 1. The critique, checked against the sheets

Twelve sheets in `proto/audit/out/current/` judged against the rubric checklists.

| Movement | Critique | My reading |
|---|---|---|
| Thread the needle (flow 12) | 3, S2/S3/S8/S6 | Agree. Support arm kinked at ph 0, shoulder never lowers at 0.5. Missed: the torso collapses to a sliver from 0.25 to 0.75. |
| Bent rotation sweeps (flow 8) | 2 | Agree, slightly understated. At 0.375 and 0.625 the horizontal arm reads as a strut bolted to the thigh, not "a bar across the chest". |
| Arm sweeps with knee dip (flow 2) | 3, D + S2 | **Overstated.** At ph 0.5 the head is below the hips in the app view, and hips stay above knees, so checklist items 2 and 6 pass narrowly. `checks.md` has "no numeric flags" for it; the 3 is an eye judgement. The real fault is knee angle and hinge depth, which is data. Severity 2, class D. |
| Cross-body knee drives (flow 5) | 3, "arm hangs at ph 0 and 0.5" | **Half wrong.** At 0.5 the light arm does cross the torso to within a hand of the dark knee. At ph 0 the arm on the *same* side as the lifted knee swings out and the opposite arm hangs. The fault is one bad half, plainly data. Severity 2. |
| Side plank (daily 8) | 3, S1 | Agree it is not a side plank. S1 is real, but it is one missing rotation in a 158-line engine, not grounds for a rebuild. |
| Band pull-apart (strength B5) | 3, D camera | Agree. Missed: the band passes through the neck at 0.5. |
| Cat-cows (flow 9) | 2, **S2** | **Misclassified.** `bend` moves no joint by design; the shoulder drift that bends the elbows comes from the keyframes' own `p`, `s`, `hf` values (`src/d_flow.js` line 102 onward). A real cat-cow keeps shoulders and hips nearly fixed and curves the spine between them, which is what the drawn-edge model does. Hold the shoulders over the hands in the data. Also missed: in cat (ph 0) the arms are straight but slanted, so "arms vertical" fails there too. |
| Reverse lunges (daily 2) | 3, S7/S8 | Half data. Knee hover is the ankle target height. Only the ball-of-foot drawing is S7. Severity 2: it reads as a lunge. |
| Single-arm DB row (strength A3) | 2, **S9** | Agree on the reversed bench knee, but the pose already carries a fitted `swL:160`. A wrong swivel number is data. |
| Dead bug (daily 3) | 1 | Agree. Contralateral pattern is clear at 0.5. |
| Bench dips (daily 11) | 1 | Agree on the dip. Missed: the far arm is a stub beside the torso from 0.375 to 0.625. |
| Bent-over row (daily 10) | 1 | Too generous. The far arm is hidden for the whole cycle and the two dumbbells merge into a four-blob cluster. Severity 2. |

Goblet squat and Single-leg hip circles pass as stated.

**Net.** The sheets are honest and the faults mostly real, but classification leans
"system". Of the eleven movements said to need an engine change, I would move Arm sweeps
and Cat-cows to data and Reverse lunges to mostly data. The true system list is S1 (root
roll), S4 (camera pitch), S6 (stop at M) and part of S7. That is three or four patches.

## 2. The prototypes, judged against the rubrics

**Thread the needle** (`strip-thread-work-light.png`, `-setup-dark.png`)
- A: fails items 5 and 6 (shoulder and head never go down). Arms distinguishable in every frame.
- B: items 3, 4, 5, 6 now pass, a real gain in pose content. But the planted arm is still
  bent in the reach. Measured from the rig: support elbow 109 degrees at ph 0, and the
  support shoulder sits 28 cm below the raised one. This is the fault the critique scored
  severity 3 in row A. The rig's self-check reports **no flags**.
- B at 0.375 to 0.625 is a lump: torso, head, planted arm and knee stack in one region.
  Item 7 (arms told apart) is marginal where A passes it.
- C: worse than B. One tone, the raised arm tapers to a spike, the bottom is a dark mass.

**Bent rotation sweeps** (`strip-windmill-work-light.png`, `-work-dark.png`)
- B keeps the same fault the critique listed for A: at 0.375 and 0.625 the sweeping arm
  is a horizontal bar across the torso. A new rig did not fix a camera problem.
- At 0.25 and 0.75 (both hands down, item 7) A is clean; B is a cluster of outlined
  segments around the knees. The background-coloured outlines chop the near leg into links.
- The head in B and C is roughly half the diameter of A's and hangs like a ball under the
  chest. Head direction, which the rubrics lean on, is harder to see, not easier.

**Arm sweeps** (`strip-sweeps-work-light.png`, `-setup-light.png`)
- B's top arc (ph 0) is a genuine bow and the hinge at 0.25 is good; A's bottom is squatty.
- B at ph 0 and 0.125: the head is hidden behind the arms. "Head back" cannot be seen.
- B at 0.5: hip pitch 112 plus 66 degrees of spine flexion with near-straight knees puts
  the wrists 45 cm behind the ankles. That is a gymnast's pike, not a momentum swing with
  a knee dip. It passes the rig's range checks. On the strip it reads as a ball on legs.

**Side plank** (`strip-sideplank-work-light.png`)
- B is the clearest win: stacked hips, straight line. But checklist item 2 (forearm flat on
  the floor) is unreadable because the forearm points at the lens, so it looks like a
  straight-arm plank on a post. Item 5 (hip visibly lower at 0.5) fails: all eight frames
  look identical. The planted-elbow code allows the upper arm to stretch 1.5 cm unflagged.
- Row A is drawn floating above its own shadow in this harness, which flatters B.

**Prone Y-T-W** (`strip-ytw-work-dark.png`)
- B makes Y, T and W distinguishable, which A never does. The price is a 62-degree
  overhead camera with no floor read: a skydiver. The "raise" off the floor is not shown.
  CLAUDE.md records this exact trade as decided by Will ("the camera that shows the full Y
  loses the prone read ... don't relitigate"). The prototype relitigates it and calls it a fix.

**Thumbnails and themes** (`thumbs.png`, `themes.png`, `contrast.md`)
- At 24 pt the stick figure survives as a few strokes. B becomes a blob with outline
  crumbs; C is a silhouette. B wins only for Side plank. Y-T-W in B and C is an asterisk.
- Each thumbnail uses one favourable phase. Worst phases were not shown.
- Left-limb contrast is 3.1 to 3.2 on every light theme and 2.0 to 2.5 on the vivid ones.
  In `themes.png` (work-vivid) the far leg nearly disappears in both B and C.

**Is the mannequin clearer?** For open poses (standing, side plank), yes, a little. For
folded poses, which are most of Morning Flow's floor block, volume adds self-occlusion and
the outlines add clutter. The proportions (small head, sausage-link limbs, wide torso
blob) are less pleasant than the current figure. The gains in rows B and C come from the
pose data and camera, not from the skin.

## 3. Attacking the recommendation

**(a) Keep the engine, fix data, patch three things.** By my reclassification, around 25
of 37 movements need data or camera edits only. S1, S4 and S6 are small changes to a
158-line file. The rig is 199 lines, so "rebuild" is not the cost; re-authoring 37
movements is, along with the props, orbit modes, mirroring, two templates and the
`qa/daily.js`, `qa/flow.js`, `qa/wk.js` invariants bound to eng2 joint names. The
assessment never prices this path or prototypes it. A row "A-patched" is the missing control.

**(b) Real video.** The research's own section 7 says realism has not been shown to lose
to schematic figures, and the leading apps all film. Down Dog ran on 18 hours of footage
with two founders. Will filming 37 short loops is days, and the result is correct by
construction at every phase, which is the stated goal. Lock-screen stills are a frame
grab, so the research's "would need a separate still set anyway" is not a real cost. The
honest objections are the baked background (HEVC alpha, flagged "test on device" and never
tested), re-shooting on every change, and file size, which the research could not source.
Dismissed without a test clip.

**(c) Licensed library.** Fairly dismissed for mobility (coverage gap), but the research
says these catalogues are gym-strength heavy, which is exactly the 11 Strength cards.
No price was obtained for any of them. "Not viable" is unproven for Strength.

**(d) three.js or RealityKit, rotatable.** Row C *is* three.js, so feasibility is shown by
the assessor's own prototype. A user-rotatable camera removes the whole S4 class (Band
pull-apart, Face pull, Y-T-W, 90/90) without fitting a camera per movement. The research
has no frame-rate or battery data, so it supports neither side.

**(e) Rive.** The research reports IK constraints, a text format, a CLI with headless
screenshots and MIT runtimes. The only sound reason to reject it is that it is 2D with no
camera; the assessment should say that and not bundle it with video.

**The prototype evidence is weak.**
- Five movements, chosen as the current engine's worst, authored by the rig's builder.
  That shows the rig can beat A where A is weakest, and nothing about the 11 that pass.
- No props, no orbit, no bilateral switch. Strength is 11 of 37 and all props.
- Authoring is not data. Side plank is a numeric search loop in code; Thread uses
  hand-tuned world targets. That is the same fit-and-look labour, in a new dialect.
- The self-checks miss rubric faults (bent support arm, extreme fold) and the
  backward-knee check switches off when pitch exceeds 60 or roll exceeds 45, which covers
  every quadruped, prone and side-lying movement.
- Row A was re-coloured, re-framed and in one case detached from its shadow.
- Prenatal Stretch and Birth Prep (21 movements, belly morph) are out of scope, so the
  plan means two engines indefinitely.

**Over-engineered?** Scapulae, a four-segment spine and human-range limits serve perhaps
six movements. For a personal app, the cheaper lever is the audit.

## 4. What must be shown, and my recommendation

Before accepting the rebuild:
1. An A-patched control: current engine with root roll, camera pitch and one spline
   through M, plus data fixes for the same five movements.
2. Rig versions of one prop movement (RDL or Single-arm row), one orbit (Hip circles) and
   two movements that pass today (Dead bug, Bench dips), to prove no regression.
3. Thread's support arm straight in the reach, and self-checks that fail when it is not.
   Rubric items must become executable checks, or "built-in self-checks" is a slogan.
4. Rubric scoring by someone other than the author, and Will judging animated loops on a
   phone, not strips.
5. Thumbnails at each movement's worst phase; a left-limb palette above 3:1 on every background.
6. One filmed test clip with alpha on a device, so video is rejected on evidence.
7. A stated plan for the prenatal apps.

**My recommendation.** Do it in this order. First, put the sheets, `checks.js` and the
rubric checklists into the gauntlet; that alone answers "errors found before Will sees
them" and is independent of medium. Second, fix the data faults and add the three engine
patches on the current engine. Third, re-run the audit. Only if movements still fail for
system reasons after that, run a fair bake-off (items 1 to 4) and let the rig win on
evidence. Keep the stick figure as the skin for now: it is the more legible of the three
at 24 pt and in folded poses. Treat the mannequin as an unproven option.
