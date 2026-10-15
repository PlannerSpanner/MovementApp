# Movement Reference — canonical form source

Rebuilt 2026-08-02. The original research notes behind the pose data were lost with the
sandbox that built the apps; this document reconstructs them as the **single text source of
truth** for placement, position, sequence, direction, and anatomical form for every movement
in the apps (three timers + the strength reference). When a pose or cue is edited, check it against this file first, then run
the QA gauntlet. When this file and the app data disagree, resolve the disagreement
deliberately and update both.

Format per movement: **Setup** (placement/starting position) · **Execution** (sequence) ·
**Anchors** (the numeric/anatomical targets the animation and cues must honor) ·
**Faults** (what wrong looks like) · **Figure** (what the stick figure must visibly show —
the visual-QA hook).

---

## User-specific constraints (morning apps)

These shaped movement selection and form limits; do not edit them away:

- **Right peroneal tendon** — no impact, no loaded eversion surprises. Bouncing has a
  heel-rock fallback; knee circles shrink if the ankle complains; lateral shifts use
  *active controlled* eversion deliberately.
- **Right AC joint** — elbows tucked in cobra, forearm (not straight-arm) plank, chest
  openers stay short of end range.
- **Chronic mid-back (T4–T8)** — shoulder-slap rotations, folded cat-cows, bent rotation
  sweeps, and thread the needle all target this segment on purpose.
- **Right-side lateral-line asymmetry** — lateral reaches and side work bias awareness there.

## Prenatal constraints (both prenatal apps)

- **Position rules**: no lying flat on the back (aortocaval compression), no inversions,
  no balance challenges, no breath-holding or bearing down (Valsalva). Every position is
  seated, hands-and-knees, side-lying, or standing with support.
- **Relaxin**: ligaments are softened; gravity-only stretching, never pushed end range —
  especially adductors (butterfly) and anything asymmetric across the pelvis.
- **Placenta status**: cleared of placenta previa / low-lying placenta (2026-08-02), so the
  apps carry a general listen-to-your-body banner rather than an urgent call-your-provider
  warning, and supported squat depth is limited by comfort and stability, not placenta
  position. If status ever changes, restore the aggressive banner and shallow-squat cap.

## Sides & direction protocol

The timer mirrors the figure and chimes twice at the halfway point of every `bil` movement.
Three kinds of movement use, or deliberately don't use, that mechanism:

| Type | Halfway event | Voice | Movements |
|---|---|---|---|
| Unilateral (one side at a time) | mirror + chime | "Switch sides" | Punching rotations*, Dynamic lateral reaches, Cross-body knee drives*, Lateral weight shifts, Reverse lunges, 90/90 with a fold, Thread the needle, Seated side reach, Seated figure-4, Kneeling hip flexor stretch, Standing calf stretch, Doorway chest opener, Side-lying clamshells, Kneeling lunge with support |
| Direction change (orbital) | mirror reverses the circle | "Change direction" | Hip circles, Single-leg hip circles (alternates legs every cycle, so the mirror only reverses), Knee circles, Birth ball hip circles |
| Alternating within each rep | none needed | — | Rotations with shoulder slaps, Chest opener swings, Bent rotation sweeps, Pedaling down dog, Arm sweeps, Bouncing, Hands-and-knees rocking, Supported butterfly with rock, Windshield wipers |
| Deliberately one-sided | none — do not "fix" | — | Left side-lying rest (left side only: vena cava decompression) |

\* Punching rotations and knee drives alternate within the rep as performed by a human, but
the figure animates the leading side; the halfway mirror swaps the lead. This is correct.

2024 audit result: every movement requiring a side switch has `bil:true`; the three orbital
movements needed direction-change *wording* (fixed 2026-08-02); nothing else is missing.

---

# Morning Flow — 13 movements: standing flow → ground finish (TR_ALL)

Eight standing movements, continuous and rhythmic — nothing held — then a
five-movement ground block moved in verbatim from the retired Morning Movement app
(2026-08-26). Every movement doubles as warmup plus targeted rehab.

**Transitions (TR_ALL build):** every movement is preceded by an authored GET SET UP
gap (`tdur` 10s in the standing block, 15s for the floor position changes including
the explicit **"get on the ground" gap before Cat-cows** — Will's authored block
transition, 5s until 2026-10-15 when it grew to 15s so there is time to actually get
down to the floor). The voice reads "Next: <name>. <setup script>"; the figure holds
the upcoming A keyframe statically, dimmed, with a tan countdown; a 520 Hz 3-2-1
triple tick ends the gap. Work 660s + gaps 145s = **805s (13:25)**; launcher label
13 min.

Retired from Flow (see "Retired — available for future versions"): Rotations with
shoulder slaps, Lateral weight shifts.

## 1. Bouncing in place — 50s, ~1s cycle
- **Setup:** feet hip-width, knees soft, arms hanging loose.
- **Execution:** light quick bounces driven from the ankles: the ankles extend, the feet
  leave the floor by an inch or two, and you land softly through the balls of the feet
  into a soft-knee dip; everything above stays relaxed and jiggles (updated 2026-10-12 —
  the feet DO leave the floor; it is a bounce, not a heel pulse).
- **Anchors:** low flight, soft landing, knees never lock; shoulders stay down.
- **Faults:** turning it into jumping high (impact — peroneal risk); landing flat-footed;
  gripping the jaw/shoulders. Fallback: heel-to-toe rocks, feet never leaving the floor.
- **Figure:** A airborne (toes pointing down, feet just off the floor) → M landed tall →
  B soft-knee dip → back up; small vertical oscillation, no horizontal foot travel.

## 2. Arm sweeps with knee dip — 50s, 2s cycle, symmetric
- **Setup:** feet hip-width.
- **Execution:** a LARGE pendulum (updated 2026-10-12). Top: arms overhead and back, hips
  and chest pushed forward, the whole body arcing into extension, head and arms back.
  Bottom: fold — knees dip, the head drops toward the floor, and the arms swing through
  behind the shins to deepen the hamstring stretch. Arms and knees phase-locked.
- **Anchors:** full range at both ends; the fold is a hinge with a knee dip, not a squat;
  continuous, no pause at either end.
- **Faults:** a timid half-range swing; arms and knees out of phase; squatting instead of
  folding.
- **Figure:** A = overhead/back extension arc; B = full fold, head low, hands behind the
  shins; the midpoint is a flat-back hinge with the arms horizontal; heels planted.

## 3. Punching rotations — 50s, 1.6s cycle, unilateral (switch)
- **Setup:** wide horse stance — feet well outside shoulders, toes slightly out, knees bent
  and pressing outward, pelvis neutral, constant depth.
- **Execution:** rotate from the waist and punch slowly across the body; at the end of each
  punch push the shoulder blade forward (scapular protraction — serratus).
- **Anchors:** punch at shoulder height; stance depth does not bob; protraction is the point
  of the movement, not the fist.
- **Faults:** rising out of the stance; fast ballistic punches; shoulder shrug instead of
  protraction.
- **Figure:** wide low stance held constant, seen from the FRONT (yaw −40) so both punches
  cross the screen; each punch extends fully across the body while the other fist pulls
  back to the ribs; the shoulder line swings ±50° (tw) on every punch (updated 2026-10-12).

## 4. Dynamic lateral reaches — 50s, 4.4s cycle, alternating
- **Setup:** feet wide, both planted, one hand on the hip.
- **Execution:** reach the other arm overhead and lean to the opposite side — long line
  from hip to fingertips — then arc back through upright and over to the other side, the
  arms trading roles. Slow: one side per breath (pace halved 2026-10-15, was 2.2s).
- **Anchors:** pure frontal plane — no forward slump; both feet stay full-contact; stretch
  runs the lateral fascial line (IT band–obliques–lats).
- **Faults:** hip swaying out instead of trunk bending; trailing heel lifting; rocking
  fore-aft instead of bending sideways.
- **Figure:** seen from the FRONT (yaw −40) so the side-bend is in the screen plane (a 3/4
  view read as a fore-aft rock — fixed 2026-10-15); the trunk arcs side to side (`sl` ±20)
  and the reaching arm over-reaches past the head toward the lean, sweeping down through a
  lateral T to the hip as the other rises (FK, flex pinned at 180 so abd alone carries the
  frontal-plane arc); pelvis level, feet pinned.

## 5. Cross-body knee drives — 50s, 1.4s cycle, unilateral (switch)
- **Setup:** standing tall.
- **Execution:** drive one knee up and across as the opposite elbow comes down and across to
  meet it; arms pump; stay tall through the standing side.
- **Anchors:** knee reaches at least hip-crease height; trunk rotates to meet it without
  slumping; standing leg extends fully.
- **Faults:** rounding forward to bring elbow to knee; standing-knee collapse inward.
- **Figure:** one knee lifted high with opposite-side trunk rotation; standing foot planted
  (foot travel on the driving leg is expected and allowed in QA).

## 6. Chest opener swings — 50s, 1.8s cycle, alternating
- **Setup:** feet shoulder-width, arms at shoulder height.
- **Execution:** swing both arms wide open (horizontal abduction), then cross in front,
  alternating which arm crosses on top each rep.
- **Anchors:** arms stay near shoulder height; the open phase carries the arms BEHIND
  the frontal plane (that is where the rhomboid/lower-trap squeeze lives), the cross phase
  protracts (serratus); still short of end range for the right AC joint.
- **Faults:** ballistic fling at end range; arms drifting down to waist height; stopping
  the open swing at the shoulder line.
- **Figure:** horizontal arm swings, torso upright, feet planted; open = hands ~25° behind
  the shoulder line (abd 115, updated 2026-10-15 — the swing used to stop in the frontal
  plane), close = forearms crossed in front.

## 7. Single-leg hip circles — 60s, 5.2s cycle (one circle per leg), orbital (direction change)
Replaced the two-footed standing Hip circles on 2026-10-12 (old pose archived in
`src/d_retired.js`). This is a standing hip CAR (controlled articular rotation).
Alternating since 2026-10-15 (was one leg per half with a side switch).
- **Setup:** stand tall on both feet, hands on hips.
- **Execution:** one knee lifts and the thigh draws the biggest circle the hip allows —
  behind, out to the side, forward, then down — knee bent about 90° the whole way (the
  heel rises toward the glute as the hip extends); the foot lands next to the other, then
  the other leg lifts and circles. Back-to-front for the first half; at the halfway chime
  the direction reverses to front-to-back.
- **Anchors:** pelvis level and trunk quiet — motion isolated to the hip, not the low back;
  standing leg straight and stable; the standing ankle is on single-leg balance for the
  whole set (ankle-stability demand — foot tripod planted, hold a wall if it wobbles).
- **Faults:** trunk leaning away to fake range; hiking the pelvis; the standing knee
  collapsing inward; rushing the arc.
- **Figure:** standing leg planted and straight, the lifted knee reaching hip height on
  a full orbit from the floor and back to it, right leg then left within one cycle
  (`orb.leg` + `orb.alt`: four thigh stations down/behind/out/front on a periodic
  Catmull-Rom spline, the down station fitted so the foot lands exactly on its planted
  target); the halfway mirror reverses the circle ("Change direction.").

## 8. Bent rotation sweeps — 50s, 4s cycle, alternating (windmill)
- **Setup:** feet wide, hinge forward until the back is near parallel, spine long, arms
  hanging (updated 2026-10-12 — pace halved from 2s).
- **Execution:** both hands reach down to the floor. One hand stays planted while the
  trunk, head and free arm rotate up until the arms stack into one vertical line; as the
  trunk rotates, the leg on the OPPOSITE side straightens and the near knee softens (the
  hips shift over the bent knee). Rotate back down until both hands are on the floor,
  then rotate up to the other side — so the planted hand alternates every half cycle
  (sequence per Will, 2026-10-15; before that the arms stayed opposite each other).
- **Anchors:** hips keep facing forward — the rotation is thoracic; hinge depth roughly
  constant; both hands genuinely meet the floor between rotations; one full sweep per
  breath.
- **Faults:** standing up mid-set; lumbar rotation/hip swivel; stacking the arms without
  the bottom hand reaching the floor; skipping the both-hands-down crossover.
- **Figure:** A/M/B keyframes (path A→M→B→M→A): A = hinged torso ROLLED about its own
  axis (tw +60), left hand on the floor, right arm vertical, right leg straight; M = the
  crossover — unrolled, knees softer, spine ROUNDED (`bend` 45), both hands on the floor
  a little ahead of the feet (hands under the shoulders hide behind the shins on screen);
  B mirrors A. All arms FK so the sweeps blend; feet planted.

## 9. Cat-cows — 30s, 3.4s cycle, symmetric, quadruped — 15s "get on the ground" gap before
Replaced the standing Folded cat-cows on 2026-10-12 (old pose archived in
`src/d_retired.js`).
- **Setup:** hands and knees — hands under the shoulders, knees under the hips, feet
  trailing. Entered via the explicit authored gap ("Time to get on the ground. Hands
  and knees, wrists under your shoulders.") — the doorway into the ground block; 15s
  since 2026-10-15 (the 5s gap left no time to actually get down).
- **Execution:** exhale — round the whole spine toward the ceiling, chin tucked; inhale —
  let the belly drop, arch and open the chest, eyes forward.
- **Anchors:** emphasis on **T4–T8 extension** on the arch; move segmentally, slow; weight
  even through hands and knees.
- **Faults:** hinging only at the low back; elbows locking the movement out; sitting back
  toward the heels.
- **Figure:** quadruped base fixed (hands planted, shins trailing); the torso genuinely
  CURVES (`bend` +60 cat / −50 cow, engine spine curvature added 2026-10-15): cat rounds
  the back toward the ceiling with the head tucked, cow sags it toward the floor with the
  head up.

## 10. Cobra press-ups — 40s, 3.2s cycle, symmetric (McKenzie extension)
Work interval 40s since 2026-10-15 (was 60s).
- **Setup:** face down, hands under the shoulders, legs relaxed.
- **Execution:** press the chest up and forward, hips staying on the floor; lower with
  control.
- **Anchors:** **elbows tucked close to the ribs** (flaring loads the right AC joint);
  pelvis never leaves the floor; range grows over the set, never forced.
- **Faults:** hips lifting (turning it into up-dog); shoulders shrugging to the ears.
- **Figure:** chest arcing up while pelvis and legs stay grounded; the press carries a
  real arch (`bend` −45, from −8 flat).

## 11. Pedaling down dog — 60s, 2.2s cycle, alternating
- **Setup:** inverted V — hands and feet down, hips high.
- **Execution:** alternately press one heel toward the floor while the other knee bends;
  slow and rhythmic.
- **Anchors:** feet track straight ahead — **no outward roll** (peroneal); arms push the
  floor away; gentle calf/Achilles load only.
- **Faults:** bouncing the heel; rolling the pedaling foot outward; sagging shoulders.
- **Figure:** high-hip V with alternating heel drop (small foot travel expected in QA).

## 12. Thread the needle — 60s, 3.6s cycle, unilateral (switch)
- **Setup:** quadruped — wrists under shoulders, knees under hips.
- **Execution:** reach one arm to the ceiling opening the chest, then slide it palm-up under
  the opposite armpit until the shoulder and ear rest toward the floor; re-thread; switch at
  the chime.
- **Anchors:** hips stay stacked over the knees (no sitting back); rotation is thoracic plus
  scapular; targets the right-shoulder IR limitation gently.
- **Faults:** hips swinging sideways; collapsing onto the head instead of the shoulder.
- **Figure:** quadruped base fixed (standard frame: hands under shoulders, shins trailing
  behind the knees) while the trunk ROLLS about its own axis (tw ±~60): reach = the top
  shoulder up and the arm straight at the ceiling; thread = that shoulder dropped toward
  the floor, the arm under the chest past the planted hand. The elbow folds on the way
  under (a straight arm hanging from a quadruped shoulder would pass through the floor).
  Rebuilt 2026-10-12.

## 13. 90/90 with a fold — 60s, 3.4s cycle, unilateral (switch)
- **Setup (research-anchored — this is a Z-sit):** front leg at 90° with its **outer** thigh
  and shin flat on the floor; back leg at 90° with its **inner** thigh down and the shin
  pointing straight behind; sit tall on both sit bones as much as the hips allow.
- **Execution:** hinge the chest forward over the front shin, spine long; return.
- **Anchors:** the fold comes from the hips, not spinal rounding; back-leg shin stays at
  90° behind, not tucked; front hip in external rotation, back hip internal.
- **Faults:** collapsing onto one hip and rounding to fake depth; the back leg drifting
  into a side-sit.
- **Figure:** unmistakable Z-sit geometry (not a cross-legged sit), then a flat-back hinge
  over the front shin.

---

# Prenatal Stretch — 10 movements, gentle stretch & release

All prenatal constraints above apply. Everything seated, hands-and-knees, or supported
standing. Breathe continuously.

## 1. Seated breathing — 60s, 4s cycle, symmetric
- **Setup:** tall sit on a chair or birth ball, feet flat, hands on thighs.
- **Execution:** inhale through the nose, feeling the ribs widen **sideways**; long slow
  exhale.
- **Anchors:** lateral rib expansion, not chest lifting — the growing uterus crowds the
  diaphragm and sideways expansion keeps breathing efficient; spine tall not rigid.
- **Faults:** shoulder-and-collarbone breathing; slumping.
- **Figure:** upright seated posture with subtle trunk rhythm; chair prop visible.

## 2. Seated cat-cow — 45s, 3.6s cycle, symmetric
- **Setup:** seated, hands on knees.
- **Execution:** exhale — round the spine and tuck the pelvis; inhale — gentle arch and
  chest open. Small and slow.
- **Anchors:** both directions matter: the belly pulls the pelvis anterior and compresses
  the low back, so the posterior tilt is the relief half; range modest.
- **Faults:** big end-range arching; neck whipping.
- **Figure:** seated spinal round/arch cycle on the chair.

## 3. Seated side reach — 60s, 3.4s cycle, unilateral (switch)
- **Setup:** tall sit, feet flat.
- **Execution:** one arm overhead, lean to the opposite side, breathing into the stretched
  side; switch at the chime.
- **Anchors:** **both sit bones stay down** — the stretch is rib-to-hip space, one of the
  most compressed regions later in pregnancy; no forward collapse.
- **Faults:** lifting a hip to fake range; elbow bending to fake reach.
- **Figure:** seated side-bend with overhead arm, pelvis square on the chair.

## 4. Seated figure-4 — 60s, 3.4s cycle, unilateral (switch)
- **Setup:** seated, one ankle across the opposite knee, crossed foot gently dorsiflexed.
- **Execution:** sit tall, then hinge forward **from the hips** until the outer hip opens;
  switch at the chime.
- **Anchors:** mild intensity only — relaxin has loosened the pelvic ligaments and the
  piriformis often tightens to compensate (sciatic irritation); spine stays long.
- **Faults:** rounding down toward the shin; pressing the crossed knee down.
- **Figure:** the ankle-over-knee triangle clearly visible, then a small hip hinge.

## 5. Supported butterfly — 60s, 4.2s cycle, symmetric
- **Setup:** seated **elevated on a cushion so the hips sit above the knees**; soles
  together, knees open.
- **Execution:** let gravity settle the knees — nothing active.
- **Anchors:** **never push the knees down**; adductor length affects how wide the pelvic
  outlet can open, and gentle beats aggressive on softened ligaments.
- **Faults:** hands or elbows pressing the thighs; slumped low back.
- **Figure:** diamond leg shape, tall spine, knees hanging without motion force.

## 6. Wide-knee child's pose — 60s, 4.4s cycle, symmetric
- **Setup:** knees wide, big toes together, chest/forearms supported (cushion allowed).
- **Execution:** sit back toward the heels, belly resting in the space between the knees;
  slow breathing.
- **Anchors:** passive **pelvic floor lengthening** — this is a release position, not a
  stretch to push; genuine rest for the low back.
- **Faults:** knees too narrow (compressing the belly); breath holding.
- **Figure:** near-profile camera: hips resting back over the folded shins (the high
  point), torso sloping down over the thighs, head low, arms reaching forward along
  the floor past the head. Knees flare wider than the ankles.

## 7. Hands-and-knees rocking — 60s, 2.8s cycle, alternating (fore–aft)
- **Setup:** quadruped, wrists under shoulders, knees under hips.
- **Execution:** rock the hips slowly back toward the heels and forward again; gentle
  circles are allowed.
- **Anchors:** spine near neutral — **no deep arching**; takes the baby's weight off the
  spine and encourages optimal anterior fetal position.
- **Faults:** sagging into extension at the front of the rock.
- **Figure:** quadruped base with smooth fore–aft pelvis travel.

## 8. Kneeling hip flexor stretch — 60s, 3.6s cycle, unilateral (switch)
- **Setup:** half-kneeling, cushion under the down knee, hand on a chair for balance.
- **Execution:** **tuck the pelvis first**, then shift gently forward until the front of the
  down-side hip lengthens; switch at the chime.
- **Anchors:** the posterior tilt IS the stretch — the forward shift is small; tight hip
  flexors drag the pelvis anterior and worsen back pain.
- **Faults:** lumbar arching forward instead of hip extension; lunging deep.
- **Figure:** half-kneel with support prop; small forward translation, upright torso.

## 9. Standing calf stretch — 60s, 3.6s cycle, unilateral (switch)
- **Setup:** hands on the wall, one foot stepped back, back leg straight, back foot pointing
  straight ahead.
- **Execution:** press the back heel down and lean gently in; switch at the chime.
- **Anchors:** heel stays down; straight-ahead foot alignment; addresses the calf cramps
  and swelling common in the 2nd–3rd trimester.
- **Faults:** back foot turned out; bouncing.
- **Figure:** staggered stance against the wall prop, back leg visibly straight.

## 10. Doorway chest opener — 45s, 3.8s cycle, unilateral (switch)
- **Setup:** one forearm vertical on the doorframe, elbow at shoulder height.
- **Execution:** step gently through until the chest opens — **a mild stretch is plenty**;
  switch arms at the chime.
- **Anchors:** counteracts the shoulder rounding from breast growth and the forward weight
  shift; opens rib space for the lungs; elbow stays at shoulder height.
- **Faults:** elbow above shoulder height (impingement position); leaning body weight in.
- **Figure:** doorframe prop, forearm vertical, small forward step-through.

---

# Birth Prep — 12 movements: pelvic mobility and floor release

The organizing idea: for perineal protection, the ability to **relax and lengthen** the
pelvic floor matters more than strength. Release and coordination first, plus the hip and
adductor mobility that lets the pelvic outlet open. All prenatal constraints apply; never
bear down.

Movements 1 and 10 carry **breath-tempo audio** (`br` flag): a soft rising tone marks the
inhale (first half of the cycle), a falling tone marks the exhale (second half), locked to
the same phase that animates the figure. Tones play only while the timer runs.

This app also carries the **session-length toggle** (13 min / 26 min): doubles every
movement's duration before starting; locked mid-session, unlocked by Reset.

## 1. Breath and pelvic floor release — 90s, 5s cycle, symmetric
- **Setup:** tall sit on a chair; one hand on the belly, one on the chest.
- **Execution:** inhale into the belly hand and feel the pelvic floor **soften and widen
  downward**; exhale and simply let it be — no lift, no effort.
- **Anchors:** the inhale is the working half (diaphragm descends → pelvic floor lengthens);
  the chest hand stays quieter than the belly hand.
- **Faults:** reversing it (gripping on the inhale); turning the exhale into a kegel.
- **Figure:** still, tall seated posture with slow breathing rhythm; chair visible.

## 2. Hands-and-knees pelvic rocking — 60s, 2.8s cycle, alternating (fore–aft)
- Same base and anchors as Prenatal Stretch #7. Additionally: this is one of the most-used
  **labour positions** — the pattern is worth knowing in the body; mobilizes the
  sacroiliac joints.
- **Figure:** quadruped fore–aft rock, neutral spine.

## 3. Birth ball hip circles — 60s, 3.2s cycle, orbital (direction change)
- **Setup:** sit tall on the ball, feet flat and **wide so feet and ball form a tripod**,
  hips level with or above the knees.
- **Execution:** circle from the pelvis like a slow hula hoop; shoulders stay quiet;
  reverse direction at the halfway chime.
- **Anchors:** movement isolated to the pelvis on the ball; feet never lift; smooth even
  orbit.
- **Faults:** whole-torso stirring; feet narrow (unstable tripod); bouncing.
- **Figure:** seated-on-ball pose with pelvis orbiting, ball prop visible, reversed after
  halfway.

## 4. Supported deep squat — 60s, 3.4s cycle, symmetric
- **Setup:** holding a counter or chair back.
- **Execution:** lower only as far as comfortable, heels down if possible, knees tracking
  out; **rise slowly on the exhale**.
- **Anchors:** squatting can widen the pelvic outlet substantially; depth is limited by
  comfort and stability — build it gradually rather than chasing range; no breath holding
  at any depth.
- **Faults:** bouncing at the bottom; heels lifting; forcing depth on an unstable day.
- **Figure:** supported squat with prop, modest depth, heels down.

## 5. Side-lying clamshells — 60s, 2.6s cycle, unilateral (switch)
- **Setup:** side-lying, hips stacked vertically, knees bent, **heels glued together**.
- **Execution:** only the top knee opens; small lift, slow lower; switch sides at the chime.
- **Anchors (research-anchored):** heels welded throughout; **the pelvis must not roll
  backward** — the lift is small and the control is the exercise (glute medius).
- **Faults:** big showy range with pelvic roll; heels separating; hip flexing to cheat.
- **Figure:** stacked side-lying position, top knee hinging open like a shell, heels
  touching at all times.

## 6. Windshield wipers — 60s, 4s cycle, alternating (side-to-side)
- **Setup:** seated on the floor leaning back onto the hands or a low cushion/bolster,
  feet flat and wider than hip-width, knees bent.
- **Execution:** both knees sweep slowly side to side together, lifting up through the
  midline and lowering toward the floor on each side; exhale as they fall.
- **Anchors:** feet stay planted (they roll on their edges, they don't step); no forcing
  at the bottom of the drop — relaxin range rules apply; the torso stays quiet on its
  supports, spine long.
- **Faults:** pulling the knees down at end range; feet skidding; slumping through the
  low back.
- **Why:** paired internal/external hip rotation mobilises the pelvis through the ranges
  labour positions use and eases low-back/SI tension.
- **Figure:** seated recline on a bolster prop, both knees sweeping the same direction,
  one dipping inward-low while the other opens outward; feet fixed wide.

## 7. Supported butterfly with rock — 60s, 3s cycle, alternating (side-to-side)
- **Setup:** elevated on a cushion, soles together, knees open (as Prenatal Stretch #5).
- **Execution:** rock gently side to side.
- **Anchors:** never push the knees down; the rock stays small — forcing range can
  destabilize an already-softened pelvis.
- **Faults:** turning the rock into a stretch contest; hands loading the thighs.
- **Figure:** butterfly diamond with a small lateral sway.

## 8. Kneeling lunge with support — 60s, 3.6s cycle, unilateral (switch)
- **Setup:** half-kneeling, cushion under the back knee, hand on a chair.
- **Execution:** shift weight gently forward; back; repeat; switch at the halfway chime.
- **Anchors:** **asymmetric hip positions help the baby navigate the pelvis** and are
  commonly used to resolve a stalled labour — this is rehearsal, not stretching; keep the
  shift comfortable.
- **Faults:** deep aggressive lunge; losing the support hand.
- **Figure:** half-kneel with chair prop and small forward-back translation.

## 9. Standing wall pelvic tilts — 60s, 3.4s cycle, symmetric
- **Setup:** back against a wall, feet a step forward.
- **Execution:** exhale — flatten the low back into the wall; inhale — release. Small and
  controlled.
- **Anchors:** conscious pelvic control reduces back pain now and is an active tool for
  **back labour** later; only the pelvis moves.
- **Faults:** knee-bend doing the flattening; shoulders peeling off the wall.
- **Figure:** upright stance at the wall with subtle pelvic tilt cycle.

## 10. Pelvic floor coordination — 90s, 5.4s cycle, symmetric
- **Setup:** tall sit, both hands resting low on the belly.
- **Execution:** exhale — a **gentle** pelvic floor lift; inhale — a complete, deliberate
  release.
- **Anchors:** **the release is the important half for birth** — the lift exists only to
  make the release trainable; never bear down; effort stays around 30%, not maximal.
- **Faults:** max-effort kegels; holding the lift; breath reversal.
- **Figure:** still tall sit with slow breath rhythm (visually similar to #1 — correct).

## 11. Wide-knee child's pose — 60s, 4.4s cycle, symmetric
- Identical anchors to Prenatal Stretch #6: passive pelvic floor lengthening, knees wide,
  belly between, genuine rest.
- **Figure:** wide-knee fold, chest low.

## 12. Left side-lying rest — 60s, 5s cycle, deliberately left side only — never add a switch
- **Setup:** lying on the **left** side, pillow between the knees, one under the belly.
- **Execution:** nothing — return to the soft downward-widening breath from movement 1.
- **Anchors:** left side-lying keeps pressure off the **vena cava** and maximizes placental
  blood flow; links the release breath to the position used in labour and sleep.
- **Faults:** "balancing" it with a right side (defeats the purpose); pillowless knees
  letting the pelvis twist.
- **Figure:** left-side-lying with visible knee pillow prop, fully settled.

---

# Strength — two-workout gym reference (strength.html), no timer, looping demos

Sourced 2026-08-10 from coaching references (StrengthLog, BarBend, Breaking Muscle,
E3 Rehab, NASM, PureGym et al.). Session-wide constraints baked into the on-page rules
card: every set stops 3–4 reps short of failure (a slowing rep means the set ended one
rep ago); submaximal weight moved with intent, never a grind; 90 s–2 min rests; add load
only when a session is genuinely easy (~every 2–3 weeks); **all pressing neutral-grip and
floor-limited** (AC joint separation); **all pulling neutral or pronated** — a supinated
grip loads the distal bicep tendon at the radial tuberosity (in rehab).

## Workout A

### A1. Goblet squat — 3×8, feet pinned
- **Setup:** one dumbbell held vertically against the chest, both palms under the top
  head, elbows tucked beneath it. Feet just outside shoulder width.
- **Execution:** sit down and back; at the bottom the elbows brush the insides of the
  knees; drive up through the whole foot.
- **Anchors:** torso stays tall (the anterior load is the counterbalance — pitch ≤ ~25°);
  depth to thighs at/below parallel (knee angle ~65–70°); knees track over the toes.
- **Faults:** knees caving in; heels lifting; bell drifting away from the chest.
- **Figure:** bell (db prop, midpoint of both hands) glued to the chest through the whole
  rep; knees flare via fitted swivels (swL −45 / swR 10 — NOT sign-mirrored); elbows
  inside knees at the bottom.

### A2. Neutral-grip DB floor press — 3×8–10, supine
- **Setup:** lying on the floor, knees bent, feet flat; a dumbbell in each hand over the
  chest, palms facing each other (handles along the body axis).
- **Execution:** lower until the upper arms rest on the floor, pause a beat, press up.
- **Anchors:** upper arms ~45° from the sides; wrists over elbows; the floor ends the
  range (that is the point — AC-safe); ribs down.
- **Faults:** bouncing the triceps; elbows flared to 90°; arching into a bridge.
- **Figure:** whole torso on the floor (pelvis y≥87 QA), elbows landing on the floor at
  the bottom, both dumbbells riding the hands (per-hand db props).

### A3. Single-arm DB row — 3×10 each side, bench prop
- **Setup:** left hand and left knee on the bench, right foot on the floor, back flat
  and level (torso pitch ~85°).
- **Execution:** dumbbell hangs, then the elbow drives up and back toward the hip.
- **Anchors:** elbow finishes above the back line (swAR 80); no torso rotation; the
  hand ends at the lower ribs/hip, not the armpit.
- **Faults:** twisting open; curling the weight; shrugging.
- **Figure:** kneeling support leg on the bench (swL 160 folds the knee down), dumbbell
  in the working hand throughout, elbow visibly rising past the back at the top.

### A4. Romanian deadlift — 2×8, feet pinned, barbell
- **Setup:** standing, barbell at the thighs, arms hanging, soft knees.
- **Execution:** hips push straight back, bar slides down the legs to just below the
  knee, then stand tall by squeezing the glutes.
- **Anchors:** a hinge, NOT a squat — knee angle stays ≥ ~130° while torso pitch reaches
  ~64°; hips travel back ~9 units; bar close enough to shave the legs; back flat.
- **Faults:** bending the knees to get depth (squatting); bar drifting forward; lumbar
  rounding at the bottom.
- **Figure:** bar (line + filled plate circles, joint-attached) tracking the hands, hip
  z-travel visible, shins staying near vertical. QA enforces knees ≥125°, pitch ≥45°,
  hip travel ≥6.

### A5. Face pull — 2×15, cable prop
- **Setup:** cable column at face height, one hand on each end of the rope, arms
  extended toward the anchor.
- **Execution:** pull toward the eyes; elbows travel high and wide; hands finish beside
  the face, knuckles up (external rotation).
- **Anchors:** elbows at/above shoulder height at the finish; rope ends pulled apart as
  they approach the face; no lean-back.
- **Faults:** elbows dropping (turns it into a row); pulling to the chin with momentum.
- **Figure:** vertical cable column + pulley; two rope lines anchored at the pulley and
  joint-attached to the hands (taut both ends, every frame); elbows above shoulders at
  the finish.

## Workout B

### B1. Trap-bar deadlift — 3×6, feet pinned
- **Setup:** standing centered "inside the bar": neutral-grip handles at the sides
  (which is why the figure holds plates at its sides, not a bar out front).
- **Execution:** hips back until the hamstrings load, shoulders over the handles, flat
  back — push the floor away and stand tall.
- **Anchors:** at the bottom: torso pitch ~64°, knee angle ~100–105° (squattier than an
  RDL — correct for a trap bar), plates touch the floor (plate r 9.2 ≈ a standard
  plate at this scale, bottom rim at y≈93), arms dead straight (177°) both frames.
- **Faults:** yanking with the back; hips shooting up first; grinding reps (the
  programming is 6 fast clean pulls).
- **Figure:** filled plate circles + handle line joint-attached to the hands; plates
  visibly grounded at the bottom, lifted at lockout.

### B2. Split squat — 3×8 each side, both feet pinned
- **Setup:** long staggered stance (right foot forward), back heel up (back ankle
  authored at y 89.5 — ball-of-foot read), arms hanging.
- **Execution:** hips drop straight down (M keyframe carries the path) until the back
  knee hovers just off the floor; press through the front foot.
- **Anchors:** front shin near vertical on screen at the bottom; back knee directly
  under the hip, hover ~3 units (~7 cm) — QA enforces 88 < knee-y ≤ 91.6 (never
  planted); slight forward lean (~15°) is correct.
- **Faults:** knee slamming the floor; front knee shooting past the toes; pushing off
  the back foot (it stays light).
- **Figure:** back-knee hover gap visible at the bottom; back foot stays put (pinned;
  drift allowance 2.2 for the heel-pivot); front shin vertical. Back-knee swivel −30.

### B3. Chest-supported row — 3×10, incline bench prop
- **Setup:** chest down on a ~38° incline pad (prop line + legs), arms hanging with
  dumbbells, palms facing each other, legs braced back with knees just off the floor.
- **Execution:** both elbows drive back (not straight up), shoulder blades squeeze,
  one-beat pause, slow lower.
- **Anchors:** torso stays glued to the pad (no heave — the pose torso never moves);
  elbows finish above the torso plane (swAL −100 / swAR 80); dumbbells start just off
  the floor at full hang.
- **Faults:** ripping the torso off the pad; shrugging; craning the neck.
- **Figure:** incline pad under the torso, both dumbbells riding the hands, elbows
  breaking the torso line at the top.

### B4. Neutral-grip lat pulldown — 3×8, seated, cable prop
- **Setup:** seated on the bench (prop), neutral handles overhead (short bar between
  the hands + cable line to the overhead anchor), slight lean back.
- **Execution:** elbows drive down and back; the handles come to the upper chest;
  control the way up.
- **Anchors:** lean-back ~12–15° and fixed (no rocking); elbows tuck to the sides at
  the bottom (swAL −50 / swAR 80); chest up to meet the bar.
- **Faults:** 45° lean-back rowing; pulling behind the neck; half-range reps.
- **Figure:** cable stays anchored overhead and attached to the handle midpoint every
  frame; handles finish at the upper chest, elbows down.

### B5. Band pull-apart — 2×15, band prop
- **Setup:** arms straight ahead at shoulder height, band taut between the hands.
- **Execution:** shoulder blades slide back first, then the arms open to a T until the
  band touches the chest; return without letting it go slack.
- **Anchors:** elbows stay straight (~177° at the T — targets sit at 25.7/26 reach);
  hands stay at shoulder height the whole way; the band is a single line joint-attached
  to both hands, so tension reads at both ends by construction (QA: ends within 0.5 of
  each hand at every phase).
- **Faults:** bending the elbows; dropping the hands; shrugging.
- **Figure:** the band line visibly stretching ~14 → ~58 units across the pull.

### B6. Side plank — 2×30 sec each side
- **Setup:** on the right forearm, elbow under the shoulder, feet stacked, top arm
  resting along the body.
- **Execution:** a hold; the loop animates the honest failure mode — hips sagging
  toward the floor and lifting back to the line.
- **Anchors:** the lift frame is one straight line head-to-heels; the sag frame drops
  ONLY the pelvis (spine s flattens 86/88 → 80/81 so the supported shoulder stays
  fixed — the body pivots at the planted forearm, which is how a real sag works);
  elbow planted at the same floor spot in both frames (swAR 150).
- **Faults:** elbow drifting ahead of the shoulder; hips piking up instead of lifting
  to neutral; holding the breath.
- **Figure:** forearm flat on the floor under the shoulder, feet stacked, visible
  hip sag ↔ straight line cycle.

---

# Daily 13 — 13 movements, ~12 min (11:55) including authored setup gaps

Renamed from Daily 10 on 2026-08-26 (daily-10.html lives on as a redirect stub for
old bookmarks). Daily postural maintenance alongside the Wed/Sat strength block: zero
meaningful recovery cost, nothing near failure. Primary goal is anterior pelvic tilt
correction (lower crossed syndrome): SHORT/overactive iliopsoas, rectus femoris, TFL
+ lumbar erectors vs LONG/inhibited glute max/med + deep abdominals (TVA, obliques).
Every "ribs down / tuck / flat back" cue is counter-programming of that pattern.
Deep squats, Reverse lunges and Plank hold moved in verbatim from the retired
Morning Movement app.

**Hard constraints (do not edit away):**
- Right AC joint separation: no pressing below parallel, no wide-grip pressing,
  nothing behind the neck. Pulling volume exceeds pushing.
- Distal bicep tendon rehab: ALL pulling neutral or pronated grip — never supinated.
- Right peroneal tendon: no jumping, no lateral bounding.

**Transitions (TR_ALL build):** every movement is preceded by an authored GET SET UP
gap. Position flow is standing (1-2) → floor (3-9) → standing/bench (10-13); the two
block changes (into Dead bug, into the Row) and the bigger reconfigurations carry
`tdur` 15s, small floor rolls and same-position changes 10s. The voice reads
"Next: <name>. <setup script>" naming equipment and starting position; the figure
holds the upcoming A keyframe statically, dimmed, with a tan countdown; a 520 Hz
3-2-1 triple tick ends the gap (work segments keep the single 380 Hz tick).
Work 555s + gaps 160s = **715s (11:55)**; launcher label 12 min.

Retired: Wall slide (see "Retired — available for future versions").

## 1. Deep squats — 30s, 2.8s cycle, symmetric, feet pinned
- **Setup:** feet shoulder-width, toes slightly out, heels down. Session starts here,
  standing — no gap before the first movement.
- **Execution:** hips go **back first**, then straight down until nearly sitting on the
  heels; drive up through the whole foot.
- **Anchors (research-anchored, do not drift):** torso and shins stay **parallel to each
  other** throughout; ankle folds from ~90° to ~**65°** at the bottom; heels never lift;
  knees track over the second toe.
- **Faults:** heels rising; chest dropping faster than the shins incline; bottoming out into
  a rounded back.
- **Figure:** tibia–torso parallelism visible at every depth; feet planted (pin LR); deep
  bottom position near the heels.

## 2. Reverse lunges — 30s, 3.2s cycle, unilateral (switch), front foot pinned
- **Setup:** standing tall.
- **Execution:** step back about two feet, landing on the ball of the back foot; lower;
  drive back up through the front heel to standing.
- **Anchors (research-anchored):** **front shin stays vertical** — knee stacked over ankle;
  both knees near 90° at the bottom; **back knee hovers 1–2 inches** off the floor, never
  touches; torso upright.
- **Faults:** front knee traveling over the toes; back knee slamming down; short choppy step.
- **Figure:** rear foot stepping back and returning (travel expected in QA); front shin
  vertical at depth; back-knee hover visible.

## 3. Dead bug — 45s, 3.6s cycle, bilateral (mirror swaps the lead pair)
- **Setup:** supine, hips and knees 90/90 (tabletop), arms to the ceiling. Exhale,
  ribs down, low back pressed flat. Entered via the 15s standing→floor block gap.
- **Execution:** one arm lowers overhead while the OPPOSITE leg reaches long and
  hovers; return; the halfway mirror swaps the pair (alternating in reality —
  punching-rotations precedent).
- **Anchors:** spine values identical in every keyframe (the flat back IS the
  exercise); reach and heel hover, never rest; qa/daily.js asserts spine+pelvis
  constant.
- **Faults:** low back arching as the leg extends; rib flare; same-side limbs.
- **Figure:** supine, contralateral arm sweep + leg reach, torso line never moves.

## 4. Glute bridge — 45s, 3.2s cycle
- **Setup:** supine, knees bent, feet flat hip-width (z 22), arms at sides on floor.
- **Execution:** posterior tilt first, drive through heels, hips to a straight
  knee–hip–shoulder line; lower with control.
- **Anchors:** top line >165° per side (knee-hip-SAME-side-shoulder); torso one slab
  at top (s0==s1) and curvature never exceeds the lying baseline; shoulders stay
  down (neck y constant). qa/daily.js asserts all three.
- **Faults:** lumbar hyperextension for extra height; driving through toes.
- **Figure:** hips rise to a visible straight diagonal; shoulders never leave floor.

## 5. Side-lying clamshell — 60s, 2.6s cycle, bilateral
- **Setup:** side-lying, hips stacked, knees bent, heels glued together, head on the
  lower arm. Pose ported from the Birth Prep clamshell (proven read).
- **Execution:** only the top knee opens — swR 6→48, a swivel about the hip→ankle
  axis, so the top ankle never leaves the heel spot; small lift, slow lower; switch
  at the chime.
- **Anchors:** heels welded (both ankles static — qa/daily.js drift <0.3); pelvis
  never rolls back or lifts (p/yaw identical in both frames); top knee travels >4 so
  the shell visibly opens.
- **Faults:** pelvis rolling back to fake range; heels separating; hip flexing to
  cheat the lift.
- **Figure:** stacked side-lying, top knee hinging open like a shell, heels touching
  at all times.

## 6. Bird dog — 50s, 4.0s cycle, bilateral (mirror swaps the pair), cam 70
- **Setup:** quadruped on cat-cow's proven base — hands ik-pinned at [±7,93,25],
  knees under hips — but the spine is one NEUTRAL slab (s 88/88, both frames).
- **Execution:** right arm reaches forward to shoulder height while the LEFT leg
  extends back to hip height (contralateral); return; the halfway mirror swaps the
  pair (dead-bug precedent). Reach target [24,73.5,46] sits at 25.5 of 26 arm
  length — a nearly straight arm.
- **Anchors:** spine constant at every phase (the rib-pelvis lock IS the exercise);
  at full reach the hand is within 3 of shoulder height and the foot within 3 of
  hip height — long, not high; the planted hand and kneeling foot never move.
  qa/daily.js asserts all three.
- **Faults:** lifting the leg past hip height by arching the low back; hips tipping
  toward the reaching side; craning the neck up.
- **Figure:** table position with one arm and the opposite leg extending into a
  long horizontal line.

## 7. Prone Y-T-W raise — 45s, 4.2s cycle, cam 72
- **Setup:** prone (Y-raise base), forehead down, arms overhead in a Y, thumbs up.
- **Execution:** A=Y → M=T → B=W, so the cycle sweeps Y→T→W→T→Y. Hands hover at
  y 89.5 (blades-down floats). T swivels swAL 100/swAR −100, W swAL 60/swAR −120
  keep the elbows in the floor plane (default IK bend dove below the floor).
- **Anchors:** the Y must read (arms straddle the head — the cam 72 lesson); the T
  physically cannot read at any side camera (floor-plane geometry flattens to ~22%);
  the SWEEP between long-Y and compact-W carries the movement, cue text carries the
  letter meanings. Do not relitigate the camera.
- **Faults:** shrugging; arching the low back to fake height; big lifts.
- **Figure:** prone, arms sweeping between long overhead Y and bent-elbow W.

## 8. Side plank — 40s, 4.2s cycle, bilateral
- **Setup:** on the right forearm, elbow under the shoulder, feet stacked, top arm
  along the body — strength Workout B's fitted pose reused verbatim, with A/B
  swapped so the GET SET UP preview holds the straight line, not the sag.
- **Execution:** A = one straight head-to-heels line; B drops ONLY the pelvis (spine
  s flattens 86/88 → 80/81 so the supported shoulder stays fixed — the body pivots
  at the planted forearm). Daily dose is deliberately submaximal next to strength
  B's 2×30s.
- **Anchors:** top-frame neck–pelvis–feet line >168°; the sag drops the pelvis >1.2
  while the planted hand target never moves (identical in both frames). qa/daily.js
  asserts all three.
- **Faults:** elbow drifting ahead of the shoulder; hips piking up instead of
  lifting to neutral; breath holding.
- **Figure:** forearm flat under the shoulder, feet stacked, visible line ↔ sag.

## 9. Plank hold — 60s, 4s cycle (micro-adjust breathing rhythm), symmetric
- **Setup:** forearm plank — elbows under shoulders (kinder to the right AC joint than
  straight-arm).
- **Execution:** hold one straight line, breathing steadily.
- **Anchors:** ear–shoulder–hip–ankle in line; glutes squeezed, ribs down, and **push the
  floor away** to fire serratus (same cue as the landmine press).
- **Faults:** hips sagging or piking; head dropping; breath holding.
- **Figure:** rigid straight line from head to heels; no visible drift.

## 10. Dumbbell bent-over row — 45s, 2.6s cycle
- **Setup:** hinge ~45–60° (RDL-pattern base), soft knees, feet planted via explicit
  ikF (NOT pin — pinning from an already-hinged A frame drove the feet through the
  floor); neutral-grip dumbbells (db props joint-attached at both hands, handles
  front-back). Entered via the 15s floor→standing + dumbbells block gap.
- **Execution:** elbows drive up and back toward the hips, hands to the lower ribs;
  full hang at bottom. Arm world targets in BOTH frames (a joint-key or single-sided
  target can't blend); swAL −100 / swAR 80 at the top (asymmetric — never mirrored).
- **Anchors:** chest height constant through the pull (qa/daily.js: sway <1.5);
  elbows above hands at the top; grip never supinated (cue text).
- **Faults:** torso heave; pulling with hands; flared elbows.
- **Figure:** held hinge, dumbbells rising to the ribs, elbows leading up-back.

## 11. Bench dips (STRICT PARTIAL) — 40s, 3.0s cycle
- **Setup:** hands fixed on the bench edge beside the hips ([±7.5,74,1], constant in
  both frames), feet out front on the floor, torso upright. Bench drawn as a real
  box (two edges + four legs) — a single edge line collapses side-on.
- **Execution:** elbows bend straight back (swAL −150 / swAR 150) lowering the hips;
  HARD STOP with upper arms parallel to the floor; press back up.
- **Anchors:** at EVERY phase shoulder y ≤ elbow y (never below parallel — the AC
  rule; qa/daily.js sweeps 25 phases, margin ~2); elbows point back (el z < sh z).
- **Faults:** sinking below parallel; flaring elbows; shoulders rolling forward.
- **Figure:** seated dip beside a recognizable bench, shallow controlled range.

## 12. Dumbbell farmer hold — 35s, 4.6s cycle
- **Setup:** standing tall, a dumbbell in each hand at the sides (db props, r 1.9),
  hands [±8.5,54.5] — arm length exactly reaches thigh height, no lower. Renamed
  from "Farmer hold" 2026-08-26.
- **Execution:** static hold; barely-visible sway/breath (A≈B) — the fight is grip,
  anti-shrug, anti-lean.
- **Anchors:** ribs stacked over pelvis; shoulders packed; motionless read.
- **Faults:** shrugging; leaning back (rib flare); side lean.
- **Figure:** tall stand, dumbbells hanging at the sides.

## 13. Standing posture reset — 30s, 5.0s cycle, br (breath tones)
- **Setup:** standing tall, feet hip-width, arms easy at the sides (dumbbells set
  down in the gap). Renamed from "Posture reset" 2026-08-26.
- **Execution:** exhale — ribs settle down and in (s 7/3 → 1/0, hf 4→0), pelvis
  neutral; quiet 360° breaths into the lower ribs and low back, exhale longer.
  Breath-tempo tones pair with the sway (br flag).
- **Anchors:** the read is subtle un-flaring, not a bow; tallness constant.
- **Faults:** "standing straight" via rib flare + lumbar arch; rigid over-tucking.
- **Figure:** tall profile, gentle breathing sway, slight rib-stack settle.

---

# Retired — available for future versions

Retired 2026-08-26 with the Flow-13 / Daily-13 restructure, plus the two Morning Flow
poses replaced on 2026-10-12 (Hip circles → Single-leg hip circles; Folded cat-cows →
Cat-cows). Nothing was deleted:
pose data, props and cue text live verbatim in `src/d_retired.js` (excluded from
the build), and the retired Morning Movement app is additionally archived wholesale
as `src/data2.js` + `src/mm_extra.js`. To revive a movement, follow the recipe at
the top of `src/d_retired.js`.

## Hip circles (was Morning Flow 7 until 2026-10-12) — 60s, 2.6s cycle, orbital (direction change)
- **Setup:** hands on hips, feet planted hip-to-shoulder width, knees soft.
- **Execution:** push the hips forward → side → back → around in the biggest smooth circle
  available; half the time each direction, reversing at the halfway chime.
- **Anchors:** feet never move; head stays roughly centered; even circle — no flat spots.
- **Figure:** pelvis translating around a circle while feet stay pinned (`orb.hips`).

## Folded cat-cows (was Morning Flow 9 until 2026-10-12) — 30s, 3.4s cycle, symmetric, feet pinned
- **Setup:** standing, knees bent, hands resting on the knees, weight through the arms.
- **Execution:** exhale — round the whole spine; inhale — arch and open the chest.
- **Figure:** alternating spinal round/arch while hands stay on knees, feet planted.

## Rotations with shoulder slaps (was Morning Flow 2) — 50s, 1.8s cycle, alternating
- **Setup:** feet shoulder-width, knees soft.
- **Execution:** rotate the trunk side to side from the waist; arms completely limp so they
  wrap and slap the shoulders/back at each end.
- **Anchors:** rotation biased to the thoracic spine (T4–T8); pelvis rotates a fraction of
  the shoulders; heels stay down.
- **Faults:** swinging the arms actively; whole-body spin with no spinal rotation.
- **Figure:** visible trunk twist with loose trailing arms; feet planted.

## Lateral weight shifts (was Morning Flow 10) — 50s, 2.2s cycle, unilateral (switch)
- **Setup:** wide stance, toes forward.
- **Execution:** shift fully into one hip and sink; press deliberately through the **outside
  edge** of the loaded foot (active eversion — dynamic peroneal training, zero impact);
  arms sweep across in the direction of travel.
- **Anchors:** loaded knee tracks over the foot; pelvis stays fairly level; the outside-edge
  press is the entire point — cue it every rep.
- **Faults:** knee collapsing inward; torso pitching forward; passive foot.
- **Figure:** clear weight shift toward one leg with the body sinking over it (foot travel
  allowed in QA).

## Parallel squats (was Morning Movement 2) — 30s, 2.4s cycle, symmetric, feet pinned
- Same pattern as deep squats, but **stop at thighs parallel**; chest carries prouder
  (more vertical) than the deep squat; same knee tracking and planted heels.
- **Figure:** obviously shallower bottom than deep squats, prouder chest angle.

## Knee circles (was Morning Movement 3) — 30s, 3.2s cycle, orbital (direction change), feet pinned
- **Setup:** feet together-ish and planted, knees bent, hands resting on the knees.
- **Execution:** circle the knees one direction; reverse at the halfway chime.
- **Anchors:** weight even across both feet the whole orbit; circle size tuned for
  **projected on-screen knee motion** (the swivel cones are asymmetric left/right — never
  mirror a swivel by sign-flip; re-fit numerically); shrink the circle if the right ankle
  complains.
- **Faults:** heels peeling; hips doing the circle instead of knees.
- **Figure:** knees orbiting about the hip→ankle axis, feet and pelvis quiet.

## Hip hinges (was Morning Movement 5) — 30s, 2.8s cycle, symmetric, feet pinned
- **Setup:** feet hip-width, soft knees.
- **Execution:** push the hips straight **back** (not down); chest travels forward; return
  by driving the hips through.
- **Anchors:** spine long neutral; shins near vertical throughout; hands trace the thigh
  (bar path); this grooves the narrow-sumo deadlift pattern.
- **Faults:** squatting (knees forward, hips dropping); rounding; hyperextending at the top.
- **Figure:** hips translating backward with a flat inclined torso, shins vertical.

## Prone Y raises (was Morning Movement 8) — 30s, 3.0s cycle, symmetric
- Superseded in Daily 13 by Prone Y-T-W raise, which shares the same base and camera.
- **Setup:** face down, arms overhead at ~30–45° out from the midline, thumbs up.
- **Execution:** draw the shoulder blades down and back and float the arms an inch or
  two off the floor; lower with control. Chest may barely graze up; neck neutral,
  gaze down.
- **Anchors (research-anchored):** lift comes from the **lower traps**, not low-back
  extension; **no shrugging** — shoulders stay away from the ears; thumbs-up
  rotation throughout. Friendly to the right AC joint — trains the lower-trap side
  of that balance.
- **Faults:** shrugging into the ears; cranking the neck up; ballistic swinging;
  arching the low back to fake height.
- **Figure:** prone with Y-angled arms visibly floating and lowering; pelvis and legs
  quiet throughout.

## Tuck + untuck (was Morning Movement 10) — 60s, 3.6s cycle, symmetric, feet pinned
- **Setup:** supine, knees bent, feet flat, arms relaxed.
- **Execution:** flatten the low back into the floor (posterior tilt), then let it arch
  gently away (anterior tilt). Only the pelvis moves.
- **Anchors:** ribs and everything above them stay quiet on the floor; small, controlled,
  breath-paced.
- **Faults:** glute squeeze doing the work; lifting the hips; moving the ribcage.
- **Figure:** subtle pelvic roll with the back on the floor, feet planted.

## Wall slide (was Daily 10 9) — 30s, 3.4s cycle, cam 74
- **Setup:** facing the wall (vertical prop line at z 13), standing close (pelvis
  z 1 — any farther and the elbows can't reach the wall: shoulder-to-wall gap must
  stay under upper-arm length), forearms on the wall, elbows ~shoulder height.
- **Execution:** forearms slide up the wall (hands y 16.5→6.5) and back down;
  swAL −85 / swAR 100 constant in both frames hold the bend plane on the wall.
- **Anchors:** elbows within ~3 of the wall plane at both ends; ribs stay down
  (spine constant); only as high as the ribs allow.
- **Faults:** rib flare/lumbar arch for extra height; forearms peeling off.
- **Figure:** profile at the wall line, forearms tracking up-down the wall.
