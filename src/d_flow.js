// Morning Flow — 13 movements: eight standing (continuous and rhythmic), then a
// five-movement ground finish moved in from the retired Morning Movement app
// (2026-08-26; poses verbatim). TR_ALL build: tdur = length of the GET SET UP gap
// BEFORE the movement (default 10, 15 for position changes, 5 for the explicit
// get-on-the-ground gap before Cat-cows); setup = authored transition script,
// spoken as "Next: <name>. <setup>". Work 680s + gaps 135s = 815s.
// Retired from Flow (see src/d_retired.js): Rotations with shoulder slaps,
// Lateral weight shifts.
const MOVES=[
// A = airborne (feet off the floor, toes pointing down), M = landed with the legs long,
// B = the dip. Path A-M-B-M-A, so each bounce leaves the floor (Will, 2026-10-12).
{n:"Bouncing in place",pos:'standing',cue:"Light bounces, everything loose",dur:50,bil:false,cyc:1.0,
 setup:"Stand easy, feet under your hips, arms loose.",
 A:{p:[0,52,0],yaw:22,tw:0,s:[3,3],hf:0,aL:[10,-11,16,-9],aR:[10,11,16,9],ikFL:[-5,88,-1.5],ikFR:[5,88,-1.5]},
 M:{p:[0,55.5,0],yaw:22,tw:0,s:[4,4],hf:0,aL:[8,-11,14,-9],aR:[8,11,14,9],ikFL:[-5,93,1],ikFR:[5,93,1]},
 B:{p:[0,61,0],yaw:22,tw:0,s:[5,5],hf:0,aL:[16,-12,26,-10],aR:[16,12,26,10],ikFL:[-5,93,1],ikFR:[5,93,1]}},

// Large pendulum (Will, 2026-10-12): A = top, arms overhead and back with the whole body
// arcing into extension; B = bottom, folded with the head toward the floor and the arms
// swinging through behind the shins.
{n:"Arm sweeps with knee dip",pos:'standing',cue:"Arms sweep overhead, then fold and swing through",dur:50,bil:false,cyc:2.0,
 setup:"Stay standing, feet under your hips, arms hanging.",
 A:{p:[0,55.3,2.5],yaw:24,tw:0,s:[-12,-18],hf:-22,aL:[196,-9,204,-7],aR:[196,9,204,7],ikFL:[-5,93,1],ikFR:[5,93,1]},
 B:{p:[0,68,-6],yaw:24,tw:0,s:[100,112],hf:30,aL:[-62,-9,-70,-7],aR:[-62,9,-70,7],ikFL:[-5,93,1],ikFR:[5,93,1]}},

// A = right punch: the trunk twists left (tw<0 brings the right shoulder forward), the
// right arm extends fully across the body, the left fist retracts to the ribs; B mirrors.
// Faces the camera (yaw -40) so BOTH punches cross the screen and the trunk rotation
// shows as the shoulder line swinging; a 3/4 view foreshortened one punch into the lens.
{n:"Punching rotations",pos:'standing',cue:"Stand tall, knees soft — punch out, push the shoulder blade forward",dur:50,bil:false,cyc:1.6,
 setup:"Feet wider than your shoulders, knees soft, fists at your ribs.",
 A:{p:[0,61,0],yaw:-40,tw:-50,s:[4,4],hf:0,aL:[-48,-16,62,-22],aR:[92,0,92,0],ikFL:[-12,93,1],ikFR:[12,93,1],swL:-10,swR:28},
 B:{p:[0,61,0],yaw:-40,tw:50,s:[4,4],hf:0,aL:[92,0,92,0],aR:[-48,16,62,22],ikFL:[-12,93,1],ikFR:[12,93,1],swL:-10,swR:28}},

{n:"Dynamic lateral reaches",pos:'standing',cue:"Reach long overhead, lean to the far side",dur:50,bil:false,cyc:2.2,pin:'LR',
 setup:"Feet wide, one hand on your hip, the other arm ready to reach.",
 A:{p:[0,60,0],yaw:-18,tw:0,sl:-16,s:[4,6],hf:-4,ikR:{w:[-8,12,2]},ikL:{w:[-11,64,3]},ikFL:[-12,93,1],ikFR:[12,93,1]},
 B:{p:[0,60,0],yaw:-18,tw:0,sl:16,s:[4,6],hf:-4,ikL:{w:[8,12,2]},ikR:{w:[11,64,3]},ikFL:[-12,93,1],ikFR:[12,93,1]}},

{n:"Cross-body knee drives",pos:'standing',cue:"Knee up, opposite elbow to meet it",dur:50,bil:false,cyc:1.4,
 setup:"Feet under your hips, stand tall, elbows up.",
 A:{p:[0,58,0],yaw:0,tw:14,s:[6,8],hf:12,aL:[-26,-12,-42,-8],aR:[26,-22,58,-30],
    lL:[100,20,-38,6],swL:25,ikFR:[6,93,1]},
 M:{p:[0,55.8,0],yaw:0,tw:0,s:[4,5],hf:0,aL:[8,-9,10,-7],aR:[8,9,10,7],
    ikFL:[-6,93,1],ikFR:[6,93,1]},
 B:{p:[0,58,0],yaw:0,tw:-14,s:[6,8],hf:-12,aL:[26,22,58,30],aR:[-26,12,-42,8],
    ikFL:[-6,93,1],lR:[100,-20,-38,-6],swR:-25}},

{n:"Chest opener swings",pos:'standing',cue:"Swing wide open, then cross in front",dur:50,bil:false,cyc:1.8,
 setup:"Stand tall, arms out at shoulder height.",
 A:{p:[0,58,0],yaw:-14,tw:0,s:[3,3],hf:-6,aL:[80,-78,84,-84],aR:[80,78,84,84],ikFL:[-7,93,1],ikFR:[7,93,1]},
 B:{p:[0,58,0],yaw:-14,tw:0,s:[6,6],hf:6,aL:[86,26,88,44],aR:[86,-26,88,-44],ikFL:[-7,93,1],ikFR:[7,93,1]}},

// Single-leg hip CAR (replaced the two-footed standing hip circles, Will 2026-10-12):
// stand on the left leg, the right knee lifts to hip height and the thigh draws the
// biggest circle the hip allows -- forward, out, behind, down. orb.leg drives the
// lifted leg from the phase (see orbitPose); the halfway mirror swaps legs AND reverses
// the direction. The standing ankle works the whole time (ankle note in x_flow.js).
{n:"Single-leg hip circles",pos:'standing',cue:"Stand on one leg, circle the lifted knee",dur:60,bil:true,cyc:2.6,
 setup:"Hands on your hips. Stand on your left leg, right knee ready to lift.",
 orb:{leg:'R',fB:30,fA:55,aB:28,aA:28},
 A:{p:[-4,55.5,0],yaw:20,tw:0,s:[2,2],hf:0,ikL:{k:"hpL"},ikR:{k:"hpR"},
    aL:[0,0,0,0],aR:[0,0,0,0],ikFL:[-6,93,1],lR:[85,6,-5,2]},
 B:{p:[-4,55.5,0],yaw:20,tw:0,s:[2,2],hf:0,ikL:{k:"hpL"},ikR:{k:"hpR"},
    aL:[0,0,0,0],aR:[0,0,0,0],ikFL:[-6,93,1],lR:[85,6,-5,2]}},

// Windmill (Will, 2026-10-12): hinged near parallel, the trunk ROLLS (tw about the spine
// axis) until the bottom hand touches the floor; the hips shift over the bent knee so the
// leg opposite the grounded hand straightens; the top arm points at the sky. A = left
// hand down / right leg straight, B mirrors. Both arms FK (abd in the body frame, the
// roll brings them vertical) so the midpoint is a flat-back T. Pace halved: cyc 4.
{n:"Bent rotation sweeps",pos:'standing',cue:"Hinged forward, sweep floor to sky",dur:50,bil:false,cyc:4.0,
 setup:"Feet wide, hinge forward, arms hanging loose.",
 A:{p:[-8,58,-6],yaw:6,tw:60,s:[96,100],hf:-16,aL:[0,-60,0,-60],aR:[0,120,0,120],ikFL:[-12,93,1],ikFR:[12,93,1]},
 B:{p:[8,58,-6],yaw:6,tw:-60,s:[96,100],hf:-16,aL:[0,-120,0,-120],aR:[0,60,0,60],ikFL:[-12,93,1],ikFR:[12,93,1]}},

// ---- ground block (poses moved verbatim from data2.js, 2026-08-26) ----
// Explicit 5s "get on the ground" gap opens the block (Will's authored transition).
// Quadruped cat-cow (was the standing "Folded cat-cows" until 2026-10-12): hands under
// the shoulders, knees under the hips, feet trailing. A = cat (round, head down),
// B = cow (dip, chest open, head up).
{n:"Cat-cows",pos:'quadruped',cue:"Round the spine, then arch and open the chest",dur:30,bil:false,cyc:3.4,tdur:5,
 setup:"Time to get on the ground. Hands and knees, wrists under your shoulders.",
 A:{p:[0,74,0],yaw:22,tw:0,s:[62,92],hf:44,ikL:{w:[-7,93,25]},ikR:{w:[7,93,25]},
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[7,-6,-90,-5],lR:[7,6,-90,5]},
 B:{p:[0,74,0],yaw:22,tw:0,s:[104,62],hf:-34,ikL:{w:[-7,93,25]},ikR:{w:[7,93,25]},
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[7,-6,-90,-5],lR:[7,6,-90,5]}},

{n:"Cobra press-ups",pos:'prone',cue:"Press the chest up, hips stay down",dur:60,bil:false,cyc:3.2,tdur:15,
 setup:"Lie face down, hands under your shoulders, elbows in.",
 A:{p:[0,90.5,4],yaw:18,tw:0,s:[74,66],hf:10,ikL:{w:[-9,93,20]},ikR:{w:[9,93,20]},
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[-92,-6,-88,-5],lR:[-96,6,-92,5]},
 B:{p:[0,90.5,4],yaw:18,tw:0,s:[46,24],hf:-22,ikL:{w:[-9,93,20]},ikR:{w:[9,93,20]},
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[-92,-6,-88,-5],lR:[-96,6,-92,5]}},

{n:"Pedaling down dog",pos:'downdog',cue:"Alternate pressing each heel down",dur:60,bil:false,cyc:2.2,tdur:15,
 setup:"Tuck your toes and press up and back into down dog, hips high.",
 A:{p:[0,56,-2],yaw:20,tw:0,s:[136,136],hf:20,ikL:{w:[-9,93,34]},ikR:{w:[9,93,34]},
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[-24,-6,-24,-5],lR:[-20,6,-40,5]},
 B:{p:[0,56,-2],yaw:20,tw:0,s:[136,136],hf:20,ikL:{w:[-9,93,34]},ikR:{w:[9,93,34]},
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[-20,-6,-40,-5],lR:[-24,6,-24,5]}},

// Rebuilt 2026-10-12 in the standard quadruped frame (torso along +z, shins trailing
// -z like Bird dog / Cat-cows). The trunk ROLLS about the spine (tw): A = right shoulder
// up, right arm straight at the ceiling, chest open toward it; B = right shoulder
// dropped toward the floor, the arm threaded under the left armpit. The right arm is FK
// in both keyframes (abd in the body frame, the roll carries it from the ceiling, down
// the right side, under the chest) so the sweep blends; the left hand stays planted.
// M folds the elbow on the way under: a straight arm hanging from a quadruped shoulder
// (22 above the floor) would pass through the floor mid-sweep.
{n:"Thread the needle",pos:'quadruped',cue:"Reach up, then slide the arm under",dur:60,bil:true,cyc:3.6,tdur:15,
 setup:"Drop your knees and come to hands and knees, wrists under shoulders.",
 A:{p:[0,74,0],yaw:16,tw:55,s:[84,80],hf:-24,ikL:{w:[-7,93,25]},
    aR:[0,125,0,125],lL:[7,-6,-90,-5],lR:[7,6,-90,5]},
 M:{p:[0,74,0],yaw:16,tw:-20,s:[84,96],hf:10,ikL:{w:[-7,93,25]},
    aR:[0,30,0,-60],lL:[7,-6,-90,-5],lR:[7,6,-90,5]},
 B:{p:[0,74,0],yaw:16,tw:-62,s:[84,104],hf:30,ikL:{w:[-7,93,25]},
    aR:[0,-10,0,-10],lL:[7,-6,-90,-5],lR:[7,6,-90,5]}},

{n:"90/90 with a fold",pos:'seated',cue:"Z-sit: front shin across, back shin behind — fold forward",dur:60,bil:true,cyc:3.4,cam:58,tdur:15,
 setup:"Sit into a Z. Front shin across in front, back shin behind you.",
 A:{p:[0,90,0],yaw:-8,tw:0,s:[6,4],hf:0,ikL:{w:[-14,92,-6]},ikR:{w:[10,92,6]},
    aL:[0,0,0,0],aR:[0,0,0,0],lR:[88,12,6,-86],lL:[57,-76,-90,-6]},
 B:{p:[0,90,0],yaw:-8,tw:0,s:[42,48],hf:-8,ikL:{w:[-4,92,16]},ikR:{w:[12,92,18]},
    aL:[0,0,0,0],aR:[0,0,0,0],lR:[88,12,6,-86],lL:[57,-76,-90,-6]}}
];
