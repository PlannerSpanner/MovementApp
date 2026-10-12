// RETIRED MOVEMENTS ARCHIVE — NOT included in any build. Retired 2026-08-26 with the
// Flow-13 / Daily-13 restructure; kept intact because any of these may come back.
// Pose objects and cue entries are verbatim copies of the last shipped versions, in
// each app's MOVES / EXTRA schema (see CLAUDE.md). To revive one: paste its object
// into the target d_*.js, its cue entry into the matching x_*.js, add a `setup:`
// line (+ `tdur` if the app is TR_ALL), and re-run the gauntlet.
// The retired Morning Movement app is archived wholesale as src/data2.js +
// src/mm_extra.js; the five of its movements that were not redistributed are also
// mirrored here so this file is the one-stop retired list.
// Documented in docs/movement-reference.md under "Retired — available for future versions".

const RETIRED=[
// ---- from Morning Flow (d_flow.js) ----
{n:"Rotations with shoulder slaps",pos:'standing',cue:"Twist from the waist — slap the shoulder, tap the low back",dur:50,bil:false,cyc:1.8,
 A:{p:[0,58,0],yaw:-6,tw:-44,s:[4,4],hf:-12,ikR:{w:[-7.7,32,-1.3]},ikL:{w:[6,65,-7]},ikFL:[-6,93,1],ikFR:[6,93,1]},
 M:{p:[0,58,0],yaw:-6,tw:0,s:[4,4],hf:0,ikL:{w:[-29,29,8]},ikR:{w:[29,29,8]},ikFL:[-6,93,1],ikFR:[6,93,1]},
 B:{p:[0,58,0],yaw:-6,tw:44,s:[4,4],hf:12,ikL:{w:[7.8,32,0.3]},ikR:{w:[-6,65,-7]},ikFL:[-6,93,1],ikFR:[6,93,1]}},

{n:"Lateral weight shifts",pos:'standing',cue:"Sink into one hip, press the outside edge of that foot",dur:50,bil:false,cyc:2.2,
 A:{p:[-7,66,0],yaw:-18,tw:0,s:[4,-10],hf:-12,aL:[74,-52,80,-64],aR:[64,30,70,20],
    ikFL:[-14,93,1],ikFR:[14,93,1]},
 B:{p:[7,66,0],yaw:-18,tw:0,s:[4,10],hf:12,aL:[64,-30,70,-20],aR:[74,52,80,64],
    ikFL:[-14,93,1],ikFR:[14,93,1]}},

// ---- from Morning Flow, replaced 2026-10-12 (Will's pose corrections): Hip circles
// ---- became the single-leg hip CAR, Folded cat-cows became the quadruped Cat-cows ----
{n:"Hip circles",pos:'standing',cue:"Hands on hips, big slow circles",dur:60,bil:true,cyc:2.6,
 setup:"Hands on your hips, feet planted.",
 orb:{hips:true,rx:9,rz:8,ry:2},
 A:{p:[0,60,0],yaw:20,tw:0,s:[4,4],hf:0,ikL:{k:"hpL"},ikR:{k:"hpR"},
    aL:[0,0,0,0],aR:[0,0,0,0],ikFL:[-8,93,1],ikFR:[8,93,1]},
 B:{p:[0,60,0],yaw:20,tw:0,s:[4,4],hf:0,ikL:{k:"hpL"},ikR:{k:"hpR"},
    aL:[0,0,0,0],aR:[0,0,0,0],ikFL:[-8,93,1],ikFR:[8,93,1]}},

{n:"Folded cat-cows",pos:'standing',cue:"Hands on bent knees, round then arch the spine",dur:30,bil:false,cyc:3.4,pin:"LR",tdur:5,
 setup:"Time to get on the ground. Fold down, hands on your bent knees.",
 A:{p:[0,64,0],yaw:22,tw:0,s:[74,86],hf:28,ikL:{k:"knL"},ikR:{k:"knR"},
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[40,-6,-40,-5],lR:[40,6,-40,5]},
 B:{p:[0,64,0],yaw:22,tw:0,s:[72,70],hf:-26,ikL:{k:"knL"},ikR:{k:"knR"},
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[40,-6,-40,-5],lR:[40,6,-40,5]}},

// ---- from Morning Movement (data2.js) — the app itself is retired; these five were
// ---- not redistributed to Flow or Daily 13 ----
{n:"Parallel squats",pos:'standing',cue:"Stop at thighs parallel, chest up",dur:30,bil:false,cyc:2.4,pin:"LR",
 A:{p:[0,55.2,0],yaw:22,tw:0,s:[3,3],aL:[4,-10,4,-8],aR:[-2,10,-2,8],lL:[-3,-5,3,-4],lR:[3,5,-3,4]},
 B:{p:[0,71,-11],yaw:22,tw:0,s:[20,16],hf:-4,ikL:{w:[-9,62,12]},ikR:{w:[9,62,12]},
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[0,0,0,0],lR:[0,0,0,0]}},

{n:"Knee circles",pos:'standing',cue:"Hands on bent knees, feet planted, circle the knees",dur:30,bil:true,cyc:3.2,
 pin:"LR",orb:{swivel:true,amp:26},
 A:{p:[0,62.2,0],yaw:-22,tw:0,s:[74,80],hf:22,ikL:{k:"knL"},ikR:{k:"knR"},
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[48,-13,-18,13],lR:[48,13,-18,-13]},
 B:{p:[0,62.2,0],yaw:-22,tw:0,s:[74,80],hf:22,ikL:{k:"knL"},ikR:{k:"knR"},
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[48,-13,-18,13],lR:[48,13,-18,-13]}},

{n:"Hip hinges",pos:'standing',cue:"Deadlift pattern — push the hips straight back",dur:30,bil:false,cyc:2.8,pin:"LR",
 A:{p:[0,55.2,0],yaw:24,tw:0,s:[2,2],aL:[0,-9,0,-7],aR:[0,9,0,7],lL:[-4,-6,4,-5],lR:[4,6,-4,5]},
 B:{p:[0,57.5,-9],yaw:24,tw:0,s:[52,56],hf:-14,aL:[0,-8,0,-6],aR:[0,8,0,6],
    lL:[0,0,0,0],lR:[0,0,0,0]}},

// side-on camera (cam 72): the only yaw where BOTH hands project past the head and the
// arms straddle it — the Y opens across the screen instead of collapsing along the body.
// (Superseded in Daily 13 by Prone Y-T-W raise, which shares this base.)
{n:"Prone Y raises",pos:'prone',cue:"Thumbs up, float the arms — shoulder blades down and back",dur:30,bil:false,cyc:3.0,cam:72,
 A:{p:[0,90.5,4],yaw:18,tw:0,s:[91,90],hf:19,ikL:{w:[-9.7,92.2,53.7]},ikR:{w:[37.1,92.2,38.5]},
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[-90,-6,-90,-5],lR:[-92,6,-88,5]},
 B:{p:[0,90.5,4],yaw:18,tw:0,s:[86,81],hf:28,ikL:{w:[-9.8,86.8,53.5]},ikR:{w:[37.1,86.8,38.3]},
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[-90,-6,-90,-5],lR:[-92,6,-88,5]}},

{n:"Tuck + untuck",pos:'supine',cue:"Back stays on the floor — only the pelvis rolls",dur:60,bil:false,cyc:3.6,pin:"LR",
 A:{p:[0,89.5,3],yaw:14,tw:0,s:[-84,-90],hf:-4,ikL:{w:[-12,91.5,-4]},ikR:{w:[12,91.5,-4]},
    aL:[0,0,0,0],aR:[0,0,0,0],ikFL:[-5,93,12],ikFR:[5,93,12]},
 B:{p:[0,89.5,3],yaw:14,tw:0,s:[-92,-86],hf:2,ikL:{w:[-12,91.5,-4]},ikR:{w:[12,91.5,-4]},
    aL:[0,0,0,0],aR:[0,0,0,0],ikFL:[-5,93,12],ikFR:[5,93,12]}},

// ---- from Daily 10 (d_daily.js, TR_ALL schema: tdur + setup) ----
// Facing the wall, forearms glued to it: slide up only as far as ribs stay down.
{n:"Wall slide",pos:'wall',cue:"Forearms glued to the wall, ribs stay down",dur:30,bil:false,cyc:3.4,cam:74,tdur:15,pin:"LR",
 prop:[{l:[[0,14,13],[0,93,13]]}],
 setup:"Stand facing the wall. Forearms on the wall at shoulder height, thumbs toward you.",
 A:{p:[0,55.4,1],yaw:6,tw:0,s:[3,1],hf:0,ikL:{w:[-7,16.5,12]},ikR:{w:[7,16.5,12]},
    swAL:-85,swAR:100,lL:[-2,-6,2,-5],lR:[2,6,-2,5]},
 B:{p:[0,55.4,1],yaw:6,tw:0,s:[3,1],hf:0,ikL:{w:[-6.5,6.5,12]},ikR:{w:[6.5,6.5,12]},
    swAL:-85,swAR:100,lL:[-2,-6,2,-5],lR:[2,6,-2,5]}}
];

// cue text + demo search terms, same [long, q] schema as the x_*.js EXTRA maps
const RETIRED_EXTRA={
"Hip circles":["<strong>Form:</strong> Hands on hips, feet planted. Push the hips forward, to the side, back and around. Half the time each direction. Make the circles big. <strong>Targets:</strong> hip capsule in every plane, IT band fascial connections, hip flexors.","standing+hip+circles+mobility+exercise"],
"Folded cat-cows":["<strong>Form:</strong> Knees bent, hands resting on them. Round the spine on the exhale, arch and open the chest on the inhale. <strong>Training link:</strong> targets T4–T8 extension — where your chronic mid-back pain lives.","standing+folded+cat+cow+spinal+mobility"],
"Rotations with shoulder slaps":["<strong>Form:</strong> Rotate the upper body side to side, arms completely loose. At each end of the twist the front hand folds up and slaps the opposite shoulder while the back hand wraps behind and taps the opposite low back. Drive from the waist, not the arms. <strong>Targets:</strong> T4–T8 rotation, where your chronic mid-back pain lives.","qi+gong+twisting+body+slapping+shoulders"],
"Lateral weight shifts":["<strong>Form:</strong> Wide stance, shift fully into one hip and sink. Press through the <em>outside</em> edge of the planted foot. Arms sweep across in the direction of travel. <strong>Targets:</strong> pressing the outside edge is active eversion — dynamic peroneal work, plus glute medius loading. Zero impact.","standing+lateral+weight+shift+exercise+hip"],
"Parallel squats":["<strong>Form:</strong> Same pattern, but stop when the thighs reach parallel. Chest stays prouder than the deep squat; knees track over the second toe and the heels never lift","parallel+squat+form+bodyweight"],
"Knee circles":["<strong>Form:</strong> Knees bent, hands resting on them, feet planted. Circle the knees one direction, reverse at the halfway chime. <strong>Ankle note:</strong> weight even on both feet — shrink the circle if the right ankle complains.","standing+knee+circles+joint+mobility"],
"Hip hinges":["<strong>Form:</strong> Soft knees, push the hips straight BACK — not down. Chest travels forward, spine stays long, arms hang on the bar path. <strong>Training link:</strong> this is your narrow sumo deadlift pattern, grooved daily without load.","hip+hinge+drill+deadlift+pattern"],
"Prone Y raises":["<strong>Form:</strong> Face down, arms overhead at about 30–45° out from the midline — the Y — thumbs up. Draw the shoulder blades down and back and float the arms an inch or two; neck neutral, gaze down. Lower with control. <strong>Shoulder note:</strong> pure lower-trap work — the balancing side of the right AC joint, with zero load on it.","prone+y+raise+lower+trap+exercise"],
"Tuck + untuck":["<strong>Form:</strong> Lie flat, knees bent, feet flat. Only the pelvis moves: flatten the low back into the floor, then let it arch gently away. Everything above the ribs stays quiet on the ground","pelvic+tilt+tuck+untuck+core+control"],
"Wall slide":["<strong>Form:</strong> Ribs down, forearms glued to the wall, press lightly IN as you slide up — that press fires the serratus. Go only as high as the ribs stay down; an arched back is borrowed range, not shoulder motion.","wall+slide+serratus+scapular+upward+rotation"]};
