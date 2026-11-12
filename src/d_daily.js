// Daily 13 — postural maintenance (renamed from Daily 10, 2026-08-26). tdur = length
// of the GET SET UP gap BEFORE the movement (TR_ALL builds); setup = authored
// transition script, spoken as "Next: <name>. <setup>". Position flow: standing (1-2)
// → floor (3-9) → standing/bench (10-13); the two block changes carry 15s gaps.
// Work 555s + gaps 160s = 715s. Deep squats, Reverse lunges and Plank hold moved in
// verbatim from the retired Morning Movement app (data2.js); Wall slide retired to
// src/d_retired.js.
const MOVES=[
{n:"Deep squats",pos:'standing',cue:"Sink until your hips are just below your knees, heels down",dur:30,bil:false,cyc:2.8,pin:"LR",
 setup:"Stand tall, feet shoulder width, toes a little out.",
 // 2026-11-12 (Will): just below parallel, heels down, NOT sitting on the heels. The hips go
 // back along the body's own facing (the pelvis used to slide along the world axis, 22 deg
 // off) and the arms are FK in both keys, reaching forward as the counterweight: the old
 // bottom-only hand target made the standing arms strain toward a point 14 units away.
 // M = halfway: hips already back, thighs about 45 deg, trunk and shins both leaning 14 deg.
 A:{p:[0,55.2,0],yaw:22,tw:0,s:[3,3],hf:0,aL:[4,-10,4,-8],aR:[4,10,4,8],lL:[-3,-5,3,-4],lR:[3,5,-3,4]},
 M:{p:[-3.3,61.1,-8.2],yaw:22,tw:0,s:[14,14],hf:-4,aL:[34,-8,42,-6],aR:[34,8,42,6],
    lL:[0,0,0,0],lR:[0,0,0,0]},
 B:{p:[-4.05,78.4,-10],yaw:22,tw:0,s:[25,25],hf:-8,aL:[62,-6,74,-4],aR:[62,6,74,4],
    lL:[0,0,0,0],lR:[0,0,0,0]}},

{n:"Reverse lunges",pos:'standing',cue:"Step back, front shin stays vertical",dur:30,bil:true,cyc:3.2,pin:"R",tdur:10,
 setup:"Stay standing, feet under your hips. You'll step back one leg at a time.",
 // 2026-11-12: the hips drop along the body's own back-front axis (they slid along the
 // world axis, 24 deg off, which tipped the front shin 12 deg), so the front shin is vertical.
 // The rear foot is an IK target: beside the front foot in A, planted at full step length by
 // M (back leg long, hips half-way down), and it stays there while the hips finish the drop.
 A:{p:[0,55.2,0],yaw:24,tw:0,s:[2,2],aL:[-6,-10,-6,-8],aR:[6,10,6,8],ikFL:[-5.8,93,2.6],lR:[4,2,-4,2]},
 M:{p:[-5.7,64,-12.8],yaw:24,tw:0,s:[5,3],aL:[-2,-10,-2,-8],aR:[2,10,2,8],ikFL:[-22,89.3,-35.9],lR:[4,2,-4,2]},
 B:{p:[-7.7,72,-17.3],yaw:24,tw:0,s:[8,6],aL:[2,-10,4,-8],aR:[-2,10,-4,8],ikFL:[-22,89.3,-35.9],lR:[4,2,-4,2]}},

// Contralateral reach: right arm sweeps overhead while the left leg lengthens; the
// mirror at halfway swaps the lead pair (punching-rotations precedent). Low back
// stays glued to the floor: spine values are identical in every keyframe.
{n:"Dead bug",pos:'supine',cue:"Ribs down, low back pressed into the floor",dur:45,bil:true,cyc:3.6,cam:62,tdur:15,
 setup:"Lie on your back. Knees up over your hips, shins level, arms to the ceiling.",
 A:{p:[0,89.5,3],yaw:14,tw:0,s:[-84,-90],hf:-4,aL:[180,-6,180,-5],aR:[180,6,180,5],
    lL:[176,-7,88,-5],lR:[176,7,88,5]},
 B:{p:[0,89.5,3],yaw:14,tw:0,s:[-84,-90],hf:-4,aL:[180,-6,180,-5],aR:[268,6,268,5],
    lL:[97,-7,94,-5],lR:[176,7,88,5]}},

// Hip extension, not lumbar extension: the torso is one straight slab (s0 == s1) and
// the top position is the straight knee-hip-shoulder diagonal — no extra arch.
{n:"Glute bridge",pos:'supine',cue:"Tuck first, drive through the heels, squeeze tall",dur:45,bil:false,cyc:3.2,cam:62,tdur:10,
 setup:"Stay on your back. Feet flat on the floor, hip width, heels close to your hands.",
 A:{p:[0,89.5,3],yaw:14,tw:0,s:[-84,-90],hf:-4,ikFL:[-0.9,93,22],ikFR:[9.7,93,19.3],
    aL:[88,-8,88,-6],aR:[88,8,88,6]},
 B:{p:[0,79.6,3],yaw:14,tw:0,s:[-110,-110],hf:8,ikFL:[-0.9,93,22],ikFR:[9.7,93,19.3],
    aL:[88,-8,88,-6],aR:[88,8,88,6]}},

// Ported from the Birth Prep clamshell (proven read): bottom leg static, top foot
// pinned at the heels, and the top knee opens by swiveling about the hip→ankle axis —
// so the heels stay welded by construction. Pelvis never rolls (p/yaw identical).
{n:"Side-lying clamshell",pos:'sidelying',cue:"Heels glued together — only the top knee opens",dur:60,bil:true,cyc:2.6,cam:12,pitch:24,tdur:10,
 setup:"Roll onto your side. Knees bent, heels together, head resting on your lower arm.",
 // Rebuilt 2026-11-12 on the root roll: the body genuinely lies on its right side (roll 90:
 // hips and shoulders stacked), facing the camera. The bottom (right) leg rests on the
 // floor; the top (left) foot is IK-pinned on the bottom ankle and the top knee opens by
 // swivelling about the hip-to-ankle axis, so the heels stay welded by construction. Before
 // this it was a prone body seen from an angle, with the opening knee hidden behind the trunk.
 A:{p:[-6,87.2,0],yaw:0,roll:90,tw:0,sl:-3,s:[0,0],hf:0,aR:[176,0,150,0],ikL:{w:[15,92.5,11]},swAL:8,
    lR:[45,0,-45,0],ikFL:[-32.87,89.7,0],swL:22},
 B:{p:[-6,87.2,0],yaw:0,roll:90,tw:0,sl:-3,s:[0,0],hf:0,aR:[176,0,150,0],ikL:{w:[15,92.5,11]},swAL:8,
    lR:[45,0,-45,0],ikFL:[-32.87,89.7,0],swL:-33}},

// Contralateral reach on all fours (cat-cow's quadruped base): right arm and LEFT leg
// extend to horizontal while the planted hand and kneeling leg never move; the mirror
// at halfway swaps the pair (dead-bug precedent). Spine is one neutral slab in both
// frames — the exercise is the rib-pelvis lock against gravity, not reach height.
{n:"Bird dog",pos:'quadruped',cue:"Flat back — reach long, not high",dur:50,bil:true,cyc:4.0,cam:52,tdur:15,
 setup:"Come to hands and knees. Hands under shoulders, knees under hips, back flat.",
 // 2026-11-12: hands squared to the body, directly under the shoulders (they were 9.5 off),
 // and the trunk is one flat slab that rises a little toward the shoulders (s 74) because
 // this figure's arms are longer than its thighs: level, the elbows had to bend to 97 deg.
 // M = the low forward slide (hand low and ahead, thigh half-way back): without it the hand
 // cut the corner past the shoulder and the elbow winged out. Camera 52: at 70 (pure
 // profile) the reaching far arm passed behind the head.
 A:{p:[0,74.5,0],yaw:20,tw:0,s:[74,74],hf:10,ikL:{w:[2,93,25.9]},ikR:{w:[15.1,93,21.1]},swAR:90,
    lL:[3,-5,-90,-5],lR:[3,5,-90,5]},
 M:{p:[0,74.5,0],yaw:20,tw:0,s:[74,74],hf:10,ikL:{w:[2,93,25.9]},ikR:{w:[21.8,84,39.4]},swAR:90,
    lL:[-44,-6,-91,-5],lR:[3,5,-90,5]},
 B:{p:[0,74.5,0],yaw:20,tw:0,s:[74,74],hf:10,ikL:{w:[2,93,25.9]},ikR:{w:[24,67.8,45.4]},swAR:90,
    lL:[-91,-6,-91,-5],lR:[3,5,-90,5]}},

// A=Y, M=T, B=W: the cycle sweeps Y->T->W->T->Y. Tiny floats — the work is the
// scapular squeeze, not elevation. cam 72: the only view where the letters open.
{n:"Prone Y-T-W raise",pos:'prone',cue:"Blades down and back — small floats, thumbs up",dur:45,bil:false,cyc:4.2,cam:40,pitch:58,tdur:15,
 setup:"Down to the floor, face down. Forehead down, arms overhead in a Y, thumbs up.",
 // 2026-11-12 (Will): raised camera (pitch 58) so the Y, the T and the W open up on screen;
 // side-on at 13 deg they collapsed into one line. The body lies ACROSS the screen (yaw 50
 // at camera 40) so the letters are not skewed. Arms are FK in the horizontal plane, a
 // little above shoulder height (flex 94): Y = 35 deg off the spine, T = square, W = upper
 // arms 45 deg below the T line with the forearms 45 deg above it (elbows 90 deg). FK keeps
 // the arms dead straight through the Y-to-T sweep; hand targets cut the corner and bent them.
 A:{p:[0,90.5,4],yaw:50,tw:0,s:[91,90],hf:6,aL:[94,-35,94,-35],aR:[94,35,94,35],
    lL:[-88,-6,-88,-5],lR:[-88,6,-88,5]},
 M:{p:[0,90.5,4],yaw:50,tw:0,s:[91,90],hf:6,aL:[94,-90,94,-90],aR:[94,90,94,90],
    lL:[-88,-6,-88,-5],lR:[-88,6,-88,5]},
 B:{p:[0,90.5,4],yaw:50,tw:0,s:[91,90],hf:6,aL:[94,-135,94,-45],aR:[94,135,94,45],
    lL:[-88,-6,-88,-5],lR:[-88,6,-88,5]}},

{n:"Side plank",pos:'sidelying',cue:"One straight line — push the floor away, hips high",dur:40,bil:true,cyc:4.2,cam:18,tdur:10,pin:"LR",
 setup:"Roll onto your side. Prop up on your forearm, elbow under your shoulder, feet stacked.",
 // Rebuilt 2026-11-12 on the root roll: a straight standing body rolled 77.9 deg onto its
 // right side, so hips, shoulders and feet are genuinely stacked, the right elbow sits under
 // the shoulder with the forearm on the floor, and head to heels is one line. Will: HOLD the
 // line, no animated sag; the top leg is adducted so the feet stack; B is a breath (pelvis 0.15, top arm and head ease). It was a prone body with level hips.
 A:{p:[0,78.7,0],yaw:0,roll:77.9,tw:0,s:[0,0],hf:0,aL:[4,0,4,0],ikR:{w:[26.9,92.5,12.5]},swAR:16,
    lL:[0,13,0,13],lR:[0,0,0,0]},
 B:{p:[0,78.85,0],yaw:0,roll:77.9,tw:0,s:[0,0],hf:2,aL:[6,0,7,0],ikR:{w:[26.9,92.5,12.5]},swAR:16,
    lL:[0,13,0,13],lR:[0,0,0,0]}},

{n:"Plank hold",pos:'quadruped',pin:"LR",cue:"One straight line, push the floor away",dur:60,bil:false,cyc:4.0,tdur:15,
 setup:"Turn over into a forearm plank. Elbows under your shoulders, one straight line.",
 // 2026-11-12 (Will): a FOREARM plank. Elbows on the floor under the shoulders, forearms
 // pointing forward, shoulders-hips-ankles one line. B is a breath, not a sag.
 A:{p:[0,83.45,0],yaw:24,tw:0,s:[82.4,82.4],hf:6,ikL:{w:[9.4,92.6,38.3]},ikR:{w:[22.2,92.6,32.6]},swAL:-90,swAR:90,
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[-82.4,-3,-82.4,-3],lR:[-82.4,3,-82.4,3]},
 B:{p:[0,83.7,0],yaw:24,tw:0,s:[82.4,82.4],hf:7,ikL:{w:[9.4,92.6,38.3]},ikR:{w:[22.2,92.6,32.6]},swAL:-90,swAR:90,
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[-82.4,-3,-82.4,-3],lR:[-82.4,3,-82.4,3]}},

// Hinge held constant; elbows drive up and back toward the hips. Neutral grip:
// dumbbell handles run front-to-back. Arm world targets in both frames (blendable).
{n:"Dumbbell bent-over row",pos:'standing',cue:"Elbows to the hips — no torso heave",dur:45,bil:false,cyc:2.6,cam:48,tdur:15,
 prop:[{db:[{j:'haL',o:[0,0,-2.4]},{j:'haL',o:[0,0,2.4]},1.7]},
       {db:[{j:'haR',o:[0,0,-2.4]},{j:'haR',o:[0,0,2.4]},1.7]}],
 setup:"Stand up and grab your dumbbells. Soft knees, hinge your chest toward the floor, back flat.",
 // 2026-11-12 (Will): torso about 45 deg from the floor, flat back (it was 28 deg). Soft
 // knees, hips back over the heels; the arms hang straight below the shoulders at the
 // bottom and the hands finish beside the lower ribs with the elbows up and close.
 A:{p:[-4,57.2,-9],yaw:24,tw:0,s:[45,45],hf:-8,ikL:{w:[-2.9,64.8,10.6]},ikR:{w:[9.9,64.8,4.9]},
    swAL:-94,swAR:94,ikFL:[-5.3,93,0.3],ikFR:[3.8,93,-3.7]},
 B:{p:[-4,57.2,-9],yaw:24,tw:0,s:[45,45],hf:-8,ikL:{w:[-8.5,54.2,0.5]},ikR:{w:[6.1,54.2,-6]},
    swAL:-94,swAR:94,ikFL:[-5.3,93,0.3],ikFR:[3.8,93,-3.7]}},

// STRICT PARTIAL: shoulders never sink below the elbows (upper arm parallel is the
// hard floor of the rep). Hands are fixed world points on the bench edge.
// 2026-11-12: the body is squared to the bench (yaw 0, camera 80 keeps the same view): at
// yaw 14 the hands sat skewed under the shoulders and the right elbow flared 6 units out.
// The bottom stops 1.5 short of parallel (a safety margin on the AC-joint rule, it sat
// exactly on it) and the top is a straight arm.
{n:"Bench dips",pos:'bench',cue:"Stop at parallel — shoulders down and back",dur:40,bil:false,cyc:3.0,cam:80,tdur:15,
 prop:[{l:[[-12,74,0.5],[12,74,0.5]]},{l:[[-12,74,-6.5],[12,74,-6.5]]},
       {l:[[-12,74,0.5],[-12,74,-6.5]]},{l:[[12,74,0.5],[12,74,-6.5]]},
       {l:[[-11,74,0.5],[-11,93,0.5]]},{l:[[11,74,0.5],[11,93,0.5]]},
       {l:[[-11,74,-6.5],[-11,93,-6.5]]},{l:[[11,74,-6.5],[11,93,-6.5]]}],
 setup:"Dumbbells down, then move to the bench. Hands on the edge beside your hips, feet out in front.",
 A:{p:[0,75.05,6],yaw:0,tw:0,s:[8,4],hf:2,ikL:{w:[-7.5,74,1]},ikR:{w:[7.5,74,1]},swAL:-92,swAR:92,
    ikFL:[-5.5,93,27],ikFR:[5.5,93,27]},
 B:{p:[0,86,7],yaw:0,tw:0,s:[8,4],hf:2,ikL:{w:[-7.5,74,1]},ikR:{w:[7.5,74,1]},
    swAL:-92,swAR:92,ikFL:[-5.5,93,27],ikFR:[5.5,93,27]}},

// Static hold: the fight is grip + anti-shrug + anti-lean. Barely-visible sway.
{n:"Dumbbell farmer hold",pos:'standing',cue:"Ribs stacked over pelvis — don't let the weights win",dur:35,bil:false,cyc:4.6,cam:40,tdur:15,pin:"LR",
 prop:[{db:[{j:'haL',o:[0,0,-2.4]},{j:'haL',o:[0,0,2.4]},1.9]},
       {db:[{j:'haR',o:[0,0,-2.4]},{j:'haR',o:[0,0,2.4]},1.9]}],
 setup:"Pick up your dumbbells. Stand tall, shoulders packed down and back.",
 // 2026-11-12: arms hang dead straight (FK); the old hand targets sat too close to the
 // shoulders and bent the elbows to 155 deg. The sway is a breath.
 A:{p:[0,55.2,0],yaw:24,tw:0,s:[2,1],hf:0,aL:[0,-5,0,-4],aR:[0,5,0,4],
    lL:[-2,-6,2,-5],lR:[2,6,-2,5]},
 B:{p:[0,55.2,0],yaw:24,tw:0,s:[1,0],hf:0,aL:[0,-5,1,-4],aR:[0,5,1,4],
    lL:[-2,-6,2,-5],lR:[2,6,-2,5]}},

// The exhale reset: ribs settle down and in, pelvis neutral, breath into the low
// back. br pairs the tone with the figure's breathing sway.
{n:"Standing posture reset",pos:'standing',cue:"Exhale the ribs down — breathe into your low back",dur:30,bil:false,cyc:5.0,cam:40,tdur:15,br:true,pin:"LR",
 setup:"Set the dumbbells down. Stand tall, feet hip width, arms easy at your sides.",
 // 2026-11-12: A is a rib FLARE (low back arched: lower segment forward, upper segment back,
 // head stacked), B is the stack. It was a whole-trunk forward lean, so the exhale lifted
 // the chest: the fault the cue names.
 A:{p:[0,55.4,0],yaw:16,tw:0,s:[8,-7],hf:3,aL:[6,-8,4,-6],aR:[6,8,4,6],
    lL:[-2,-6,2,-5],lR:[2,6,-2,5]},
 B:{p:[0,55.4,0],yaw:16,tw:0,s:[1,0],hf:0,aL:[6,-8,4,-6],aR:[6,8,4,6],
    lL:[-2,-6,2,-5],lR:[2,6,-2,5]}}
];
