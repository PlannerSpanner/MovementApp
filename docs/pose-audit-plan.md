# Pose audit and figure-system assessment: plan

Written 2026-11-12, before starting. Branch `figure-assessment`. Nothing here touches the
shipped apps: only `docs/` and `proto/` are added. No push.

Scope: Morning Flow (13), Daily 13 (13), Strength (11). Prenatal apps and hip-activation
are out.

## Phase 1: assess, then stop

1. **Rubrics** (`docs/rubrics/{flow,daily,strength}.md`). One research subagent per app,
   in parallel. Per movement: positions that must be visible, the path between them,
   joint angles that matter, faults, sources. Where Will's own spec
   (docs/movement-reference.md) differs from the textbook movement, Will's spec wins and
   the difference is noted. Will's AC joint, distal bicep and peroneal constraints are
   rubric lines, not footnotes.
2. **Media landscape** (`docs/research/figure-media-landscape.md`). One research subagent:
   how Down Dog, pliability, Fitbod, Muscle and Motion and FitCraft produce their
   figures; Live Activity rendering limits; SceneKit/RealityKit status; Rive; pose
   estimation accuracy on floor poses; licensed and self-recorded video costs.
3. **Audit harness** (`proto/audit/`). Loads the real engine and pose data in Node,
   renders every movement at phases 0, 0.125 ... 0.875, and runs numeric checks no
   current QA tool has: joint-limit violations (knee and elbow hyperextension, hip and
   shoulder range), floor penetration of any joint, limbs leaving the stage, screen-space
   left/right ambiguity, foreshortening of the limb that carries the movement.
4. **Critique** (`docs/pose-critique.md`). Every movement at eight phases against its
   rubric, by eye on the rendered sheets plus the harness numbers. Each fault classified
   as data (keyframes fix it) or system (the engine cannot express it cleanly).
5. **Prototypes** (`proto/`). The strongest two or three candidates rendering Bent
   rotation sweeps, Thread the needle and Arm sweeps with knee dip, side by side with the
   current engine at the same phases, on work and setup phase colors, light and dark,
   plus a Live Activity sized thumbnail row. Candidates are picked after steps 1 to 4;
   media that cannot be prototyped here (real video) are assessed on researched facts and
   that limit is stated.
6. **Independent review.** A fresh subagent sees only the rubrics, the critique and the
   prototype sheets, and is asked to argue against the recommendation. Its objections and
   my answers go in the report verbatim. I revise before reporting.
7. **Report** (`docs/figure-system-assessment.md`): comparison, strips, objections,
   recommendation (keep and fix, improve, or rebuild in a named medium), effort for each.
   Commit docs and prototypes on the branch. STOP.

## Phase 2: after Will decides

Keep or improve: fix every fault per app, fresh-reviewer loop until clean, byte-identical
frame diff for untouched movements, one commit per app. Rebuild: write the build plan
first, with the rubrics as the acceptance test.

## Questions that go to Will instead of being guessed

Anything that changes what an exercise is, or needs cue text or timing changes. Collected
in the report under "Needs Will".
