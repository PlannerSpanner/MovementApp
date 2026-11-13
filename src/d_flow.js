// Morning Flow — 13 movements: eight standing (continuous and rhythmic), then a
// five-movement ground finish moved in from the retired Morning Movement app
// (2026-08-26; poses verbatim). TR_ALL build: tdur = length of the GET SET UP gap
// BEFORE the movement (default 10, 15 for position changes including the explicit
// get-on-the-ground gap before Cat-cows -- 5s until 2026-10-15); setup = authored
// transition script, spoken as "Next: <name>. <setup>". Work 660s + gaps 145s = 805s.
// Retired from Flow (see src/d_retired.js): Rotations with shoulder slaps,
// Lateral weight shifts.
const MOVES=[
// A = airborne (feet off the floor, toes pointing down), M = landed with the legs long,
// B = the dip. Path A-M-B-M-A, so each bounce leaves the floor (Will, 2026-10-12).
{n:"Bouncing in place",pos:'standing',cue:"Light bounces, everything loose",dur:50,bil:false,cyc:1.0,
 setup:"Stand easy, feet under your hips, arms loose.",
 // 2026-11-12: a BOUNCE, not a squat-jump. Airborne legs are long (knees about 172 deg, they
 // were tucked to 144), the feet clear the floor by an inch (ankles 2.5 up, toes hanging),
 // and the dip is a soft 30 deg of knee bend (was 65) with the pelvis travelling 3.3, not 9.
 A:{p:[0,52.65,0],yaw:22,tw:0,s:[3,3],hf:0,aL:[10,-11,16,-9],aR:[10,11,16,9],ikFL:[-5,90.5,-0.5],ikFR:[5,90.5,-0.5],fpL:38,fpR:38},
 M:{p:[0,55.5,0],yaw:22,tw:0,s:[4,4],hf:0,aL:[8,-11,14,-9],aR:[8,11,14,9],ikFL:[-5,93,1],ikFR:[5,93,1],fpL:0,fpR:0},
 B:{p:[0,56.4,0],yaw:22,tw:0,s:[5,5],hf:0,aL:[14,-12,22,-10],aR:[14,12,22,10],ikFL:[-5,93,1],ikFR:[5,93,1],fpL:0,fpR:0}},

// Large pendulum (Will, 2026-10-12): A = top, arms overhead and back with the whole body
// arcing into extension; B = bottom, folded with the head toward the floor and the arms
// swinging through behind the shins. The fold is a HINGE with a knee dip (2026-11-12): the
// hips stay high and go back, knees about 130 deg, trunk hanging well past horizontal. It was
// a squat (knees 84 deg, trunk only level). At the top the hips push 6 forward of the
// ankles so the body bows instead of leaning back; feet and hip travel are squared to the
// body's facing.
{n:"Arm sweeps with knee dip",pos:'standing',cue:"Arms sweep overhead, then fold and swing through",dur:50,bil:false,cyc:2.0,
 setup:"Stay standing, feet under your hips, arms hanging.",
 A:{p:[2.4,55.7,5.5],yaw:24,tw:0,s:[-12,-18],hf:-22,aL:[196,-9,204,-7],aR:[196,9,204,7],ikFL:[-4.2,93,2.9],ikFR:[5,93,-1.1]},
 B:{p:[-3.7,56.5,-8.2],yaw:24,tw:0,s:[122,146],hf:14,aL:[-74,-9,-80,-7],aR:[-74,9,-80,7],ikFL:[-4.2,93,2.9],ikFR:[5,93,-1.1]}},

// A = right punch: the trunk twists left (tw<0 brings the right shoulder forward), the
// right arm extends fully across the body, the left fist retracts to the ribs; B mirrors.
// Faces the camera (yaw -40) so BOTH punches cross the screen and the trunk rotation
// shows as the shoulder line swinging; a 3/4 view foreshortened one punch into the lens.
// 2026-11-12: a true horse stance -- the feet are squared to the BODY (targets rotated by the
// yaw; they were squared to the world, which skewed the legs and straightened one), knees
// over the toes (sw -22/+22), and the retracting fist comes to the ribs with the elbow
// tucked behind (it floated 15 units outside the body). M = the crossover with both fists
// at rib height, forearms level: without it the fists dropped to the waist mid-punch and
// the punch rose like an uppercut.
{n:"Punching rotations",pos:'standing',cue:"Stand tall, knees soft — punch out, push the shoulder blade forward",dur:50,bil:false,cyc:1.6,
 setup:"Feet wider than your shoulders, knees soft, fists at your ribs.",
 A:{p:[0,61,0],yaw:-40,tw:-50,s:[4,4],hf:0,aL:[-50,-10,56,-7],aR:[92,0,92,0],ikFL:[-9.8,93,-6.9],ikFR:[8.5,93,8.5],swL:-22,swR:22},
 M:{p:[0,61,0],yaw:-40,tw:0,s:[4,4],hf:0,aL:[-20,-14,112,-24],aR:[-20,14,112,24],ikFL:[-9.8,93,-6.9],ikFR:[8.5,93,8.5],swL:-22,swR:22},
 B:{p:[0,61,0],yaw:-40,tw:50,s:[4,4],hf:0,aL:[92,0,92,0],aR:[-50,10,56,7],ikFL:[-9.8,93,-6.9],ikFR:[8.5,93,8.5],swL:-22,swR:22}},

// Standing crescent (reworked 2026-10-15): faces the camera (yaw -40) so the side-bend
// is in the screen plane -- at a 3/4 view the lean read as a fore-aft rock. Both arms
// FK with the flex pinned at 180 so abd alone sweeps the arm through the FRONTAL plane:
// the reaching arm goes overhead past the head toward the lean (abd -36), down through
// a lateral T, to the hip (abd 150 / forearm 210 = elbow bent, hand on the hip). sl is
// the trunk's lateral bend (shoulders stay level, the arm over-reach carries the arc).
// Pace halved: cyc 4.4. 2026-11-12: the shoulder line tilts with the bend (st), dropping the
// near shoulder -- sl alone slid the rib cage sideways under level shoulders -- and the
// resting hand sits on the hip crest with the elbow out (it floated 11 units off the body).
{n:"Dynamic lateral reaches",pos:'standing',cue:"Reach long overhead, lean to the far side",dur:50,bil:false,cyc:4.4,pin:'LR',
 setup:"Feet wide, one hand on your hip, the other arm ready to reach.",
 A:{p:[0,60,0],yaw:-40,tw:0,sl:-20,st:-16,s:[4,6],hf:-4,aR:[180,-36,180,-42],aL:[180,-168,180,-244],ikFL:[-9.8,93,-6.9],ikFR:[8.5,93,8.5]},
 B:{p:[0,60,0],yaw:-40,tw:0,sl:20,st:16,s:[4,6],hf:-4,aL:[180,36,180,42],aR:[180,168,180,244],ikFL:[-9.8,93,-6.9],ikFR:[8.5,93,8.5]}},

// Rebuilt 2026-11-12. A = left knee driven up and across with the RIGHT elbow coming down to
// meet it (the trunk turns toward the lifted knee: tw < 0 brings the right shoulder forward;
// it was turning away), the same-side arm swinging back; M = tall, both feet down, elbows
// bent; B mirrors. The standing leg is straight (pelvis at standing height; it sat 3 low,
// which bent the standing knee to 134 deg). All legs FK in all three keys so the thigh
// sweeps down smoothly: the old FK/IK mix made the knee jump near M. yaw 20 (60 deg off
// the lens): at the old yaw 0 the right thigh pointed into the camera (32% of its length);
// here both thighs and both meeting elbows read, at the cost of some of the cross.
{n:"Cross-body knee drives",pos:'standing',cue:"Knee up, opposite elbow to meet it",dur:50,bil:false,cyc:1.4,
 setup:"Feet under your hips, stand tall, elbows up.",
 A:{p:[0,55.2,0],yaw:20,tw:-22,s:[3,4],hf:4,aL:[-28,-10,-6,-8],aR:[40,-28,135,-20],
    lL:[120,22,5,6],lR:[0,1.5,0,1.5]},
 M:{p:[0,55.4,0],yaw:20,tw:0,s:[3,4],hf:0,aL:[-4,-8,66,-6],aR:[-4,8,66,6],
    lL:[0,-1.5,0,-1.5],lR:[0,1.5,0,1.5]},
 B:{p:[0,55.2,0],yaw:20,tw:22,s:[3,4],hf:4,aL:[40,28,135,20],aR:[-28,10,-6,8],
    lL:[0,-1.5,0,-1.5],lR:[120,-22,5,-6]}},

// Open position past the frontal plane (2026-10-15): abd beyond 90 puts the arm BEHIND
// the shoulder line (abd 115 = 25 deg behind), so the swing shows the full range; the
// cross stays in front (abd 26/44).
// Camera 2026-11-12: the swing lies in a horizontal plane at shoulder height, which the old
// 13-degree camera saw edge-on (arms foreshortened to 26% as they crossed). Now it is a 3/4
// front view from slightly above (yaw -18 at camera 40, pitch 24): the open position reads
// as hands behind the shoulders, the cross as forearms overlapping in front, left arm on
// top. (Dead-front at pitch 34 was tried: fore-aft turned into up-down and the swing read
// as a flap.) Feet squared to the body.
{n:"Chest opener swings",pos:'standing',cue:"Swing wide open, then cross in front",dur:50,bil:false,cyc:1.8,pitch:24,
 setup:"Stand tall, arms out at shoulder height.",
 A:{p:[0,56.5,0],yaw:-18,tw:0,s:[3,3],hf:-6,aL:[86,-115,88,-122],aR:[86,115,88,122],ikFL:[-7,93,-1.2],ikFR:[6.4,93,3.1]},
 B:{p:[0,56.5,0],yaw:-18,tw:0,s:[6,6],hf:6,aL:[92,26,95,44],aR:[84,-26,82,-44],ikFL:[-7,93,-1.2],ikFR:[6.4,93,3.1]}},

// Single-leg hip CAR (replaced the two-footed standing hip circles, Will 2026-10-12;
// alternating since 2026-10-15): stand on both feet, hands on hips. The right knee lifts
// and the thigh draws the biggest circle the hip allows -- behind, out, forward -- and
// the foot lands next to the other; then the left leg does the same (orb.alt: one cycle
// = right orbit + left orbit, each from the floor and back to it). The halfway mirror
// reverses the direction, back-to-front becomes front-to-back ("Change direction.").
// 2026-11-12: hands rest ON the hips -- on the crest, 5 above the hip joint, elbows out and
// a little back (fitted arm swivels) -- they were straight arms hanging at the sides. Pelvis
// at 55.2 so the standing leg is straight (was 162 deg). 3/4 FRONT view (yaw -10): at yaw 20
// the left leg's side station pointed away from the lens and read as a second "behind".
// Stations pulled inside real hip range: behind = 18 deg of extension with the knee at 82
// deg (it was a back-kick with the foot above the knee), side = 42 deg.
{n:"Single-leg hip circles",pos:'standing',cue:"One leg at a time, circle the lifted knee",dur:60,bil:true,cyc:5.2,
 setup:"Hands on your hips. One leg at a time, the knee draws a circle.",
 orb:{leg:'R',alt:true,bk:[-18,14,-100,6],out:[25,42,-65,15]},
 A:{p:[0,55.2,0],yaw:-10,tw:0,s:[2,2],hf:0,ikL:{w:[-6.4,50.2,-1.1]},ikR:{w:[6.4,50.2,1.1]},swAL:-20,swAR:20,
    aL:[0,0,0,0],aR:[0,0,0,0],ikFL:[-6.1,93,-0.1],ikFR:[5.7,93,2]},
 B:{p:[0,55.2,0],yaw:-10,tw:0,s:[2,2],hf:0,ikL:{w:[-6.4,50.2,-1.1]},ikR:{w:[6.4,50.2,1.1]},swAL:-20,swAR:20,
    aL:[0,0,0,0],aR:[0,0,0,0],ikFL:[-6.1,93,-0.1],ikFR:[5.7,93,2]}},

// Windmill (Will, 2026-10-12; M keyframe 2026-10-15): hinged near parallel, the trunk
// ROLLS (tw about the spine axis) until the bottom hand touches the floor; the hips shift
// over the bent knee so the leg opposite the grounded hand straightens; the top arm
// points at the sky. A = left hand down / right leg straight, B mirrors. M = the
// crossover: unrolled, knees softer, ROUNDED (bend) with BOTH hands on the floor a
// little ahead of the feet (hands under the shoulders hide behind the shins on screen), so
// the path A-M-B-M-A is: left planted + rotate up, back down to both hands, right
// planted + rotate up, back down. Both arms FK in every frame (abd in the body frame,
// the roll brings them vertical) so the sweeps blend. Pace halved: cyc 4.
{n:"Bent rotation sweeps",pos:'standing',cue:"Hinged forward, sweep floor to sky",dur:50,bil:false,cyc:4.0,
 setup:"Feet wide, hinge forward, arms hanging loose.",
 A:{p:[-8,59,-6],yaw:6,tw:60,s:[96,100],hf:-16,aL:[16,-60,16,-60],aR:[0,120,0,120],ikFL:[-12,93,1],ikFR:[12,93,1]},
 M:{p:[0,61.5,-7],yaw:6,tw:0,bend:45,s:[102,116],hf:30,aL:[10,-3,10,-3],aR:[10,3,10,3],ikFL:[-12,93,1],ikFR:[12,93,1]},
 B:{p:[8,59,-6],yaw:6,tw:-60,s:[96,100],hf:-16,aL:[0,-120,0,-120],aR:[16,60,16,60],ikFL:[-12,93,1],ikFR:[12,93,1]}},

// ---- ground block (poses moved verbatim from data2.js, 2026-08-26) ----
// Explicit 15s "get on the ground" gap opens the block (Will's authored transition;
// was 5s until 2026-10-15 -- not enough time to actually get down to the floor).
// Quadruped cat-cow (was the standing "Folded cat-cows" until 2026-10-12): hands under
// the shoulders, knees under the hips, feet trailing. A = cat (round, head down),
// B = cow (dip, chest open, head up). The spine `bend` (2026-10-15) genuinely curves
// the torso: +60 rounds the back toward the ceiling, -60 sags it toward the floor.
// 2026-11-12 (Will: arms straight and vertical, elbows softly locked, shoulder blades free):
// the two spine pairs mirror each other ([62,92] / [92,62]) so the shoulders stay exactly
// over the hands through the whole cycle -- cow used [104,62], which dragged the shoulders
// 4 to 5 units back and bent the elbows. Hands are squared to the body under the shoulders;
// thighs vertical.
{n:"Cat-cows",pos:'quadruped',cue:"Round the spine, then arch and open the chest",dur:30,bil:false,cyc:3.4,tdur:15,
 setup:"Time to get on the ground. Hands and knees, wrists under your shoulders.",
 // Foot contact authored (2026-11-12): toes point straight back, top of the foot on the floor.
 A:{p:[0,72.5,0],yaw:22,tw:0,bend:60,s:[62,92],hf:44,ikL:{w:[2.7,93,25.3]},ikR:{w:[15.7,93,20.1]},
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[3,-5,-90,-5],lR:[3,5,-90,5],fpL:4,fpR:4,fyL:180,fyR:180},
 B:{p:[0,72.5,0],yaw:22,tw:0,bend:-60,s:[92,62],hf:-34,ikL:{w:[2.7,93,25.3]},ikR:{w:[15.7,93,20.1]},
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[3,-5,-90,-5],lR:[3,5,-90,5],fpL:4,fpR:4,fyL:180,fyR:180}},

// 40s since 2026-10-15 (was 60); the press carries a real arch (bend -45).
// Rebuilt 2026-11-12: A lies FLAT (chest near the floor; it started half-raised), both legs
// rest on the floor (the right knee floated 4.5 up), the hands are squared to the body
// beside the chest, and the elbows fold back along the ribs (fitted arm swivels; they
// pointed down and out). At the top the lift is carried mostly by the upper segment
// ([66,34]) and stops short of end range: the trunk line reaches about 40 deg, elbows
// still bent, hips not hyper-extended (they were 46 to 50 deg behind the trunk line).
{n:"Cobra press-ups",pos:'prone',cue:"Press the chest up, hips stay down",dur:40,bil:false,cyc:3.2,tdur:15,
 setup:"Lie face down, hands under your shoulders, elbows in.",
 // Foot contact authored (2026-11-12): toes point straight back, top of the foot on the floor.
 A:{p:[0,90.5,4],yaw:30,tw:0,bend:0,s:[84,80],hf:8,ikL:{w:[6.1,93,30.5]},ikR:{w:[19.9,93,22.5]},swAL:-92,swAR:92,
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[-85.5,-6,-88,-5],lR:[-85.5,6,-88,5],fpL:4,fpR:4,fyL:180,fyR:180},
 B:{p:[0,90.5,4],yaw:30,tw:0,bend:-40,s:[66,34],hf:-8,ikL:{w:[6.1,93,30.5]},ikR:{w:[19.9,93,22.5]},swAL:-92,swAR:92,
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[-85.5,-6,-88,-5],lR:[-85.5,6,-88,5],fpL:4,fpR:4,fyL:180,fyR:180}},

// Rebuilt 2026-11-12 as a true inverted V: hands, shoulders and hips on one straight line
// (39 deg to the floor), legs about 60 deg, hips the highest point. The hands reach their
// floor targets (they missed by 2.4) and both feet are IK-planted, squared to the body.
// The pedal: A = left knee bent with that heel lifted, right leg straight with its heel
// down; B = the reverse. Foot contact is authored (fp): the lifted heel pitches 25 deg onto
// the ball of the foot, the other foot is flat.
{n:"Pedaling down dog",pos:'downdog',cue:"Alternate pressing each heel down",dur:60,bil:false,cyc:2.2,tdur:15,
 setup:"Tuck your toes and press up and back into down dog, hips high.",
 A:{p:[0.77,57.85,2.06],yaw:20,tw:0,s:[129,129],hf:8,ikL:{w:[7.2,93,40.3]},ikR:{w:[20.4,93,35.5]},
    aL:[0,0,0,0],aR:[0,0,0,0],ikFL:[-10.9,90.3,-15.4],ikFR:[-1.85,93,-19.7],fpL:25,fpR:0},
 B:{p:[0.77,57.85,2.06],yaw:20,tw:0,s:[129,129],hf:8,ikL:{w:[7.2,93,40.3]},ikR:{w:[20.4,93,35.5]},
    aL:[0,0,0,0],aR:[0,0,0,0],ikFL:[-11.25,93,-16.3],ikFR:[-1.5,90.3,-18.8],fpL:0,fpR:25}},

// Rebuilt 2026-10-12 in the standard quadruped frame (torso along +z, shins trailing
// -z like Bird dog / Cat-cows). The trunk ROLLS about the spine (tw): A = right shoulder
// up, right arm straight at the ceiling, chest open toward it; B = right shoulder
// dropped toward the floor, the arm threaded under the left armpit. The right arm is FK
// in both keyframes (abd in the body frame, the roll carries it from the ceiling, down
// the right side, under the chest) so the sweep blends; the left hand stays planted.
// M folds the elbow on the way under: a straight arm hanging from a quadruped shoulder
// (22 above the floor) would pass through the floor mid-sweep.
// 2026-11-12: the trunk now pitches as well as rolls. In the reach the chest lifts
// (s [64,62]) so the support arm is STRAIGHT (it was bent to 98 deg in every frame); in the
// thread the chest drops (s [104,118]) so the threading shoulder and the head go down
// toward the floor. The threading arm passes BEHIND the planted hand (toward the knees,
// arm flex -26), not through it, and the body is turned to yaw 0 so the thread runs across
// the screen instead of into the lens.
{n:"Thread the needle",pos:'quadruped',cue:"Reach up, then slide the arm under",dur:60,bil:true,cyc:3.6,tdur:15,
 setup:"Drop your knees and come to hands and knees, wrists under shoulders.",
 // 2026-11-13 (Will): the planted hand moved from [-7,93,23.5] to [-10,93,24]. In the thread the
 // head came down on top of it and a sliver of hand showed under the head; now it is planted
 // clear of the head, beside it.
 // Foot contact authored (2026-11-12): toes point straight back, top of the foot on the floor.
 A:{p:[0,74,0],yaw:0,tw:55,s:[64,62],hf:-24,ikL:{w:[-10,93,24]},
    aR:[0,125,0,125],lL:[7,-6,-90,-5],lR:[7,6,-90,5],fpL:4,fpR:4,fyL:180,fyR:180},
 M:{p:[0,74,0],yaw:0,tw:-20,s:[80,84],hf:10,ikL:{w:[-10,93,24]},
    aR:[-14,30,-20,-60],lL:[7,-6,-90,-5],lR:[7,6,-90,5],fpL:4,fpR:4,fyL:180,fyR:180},
 B:{p:[0,74,0],yaw:0,tw:-66,s:[104,118],hf:40,ikL:{w:[-10,93,24]},
    aR:[-26,-10,-26,-10],lL:[7,-6,-90,-5],lR:[7,6,-90,5],fpL:4,fpR:4,fyL:180,fyR:180}},

// 2026-11-12: camera raised to pitch 30 so the Z of the legs, which lies in the floor
// plane, opens up on screen (from 13 deg the back leg read as nearly straight). Upright,
// the hands rest on the thighs: the floor beside the hips is out of reach for straight
// arms, and the old floor targets were missed by 2 to 3.6.
{n:"90/90 with a fold",pos:'seated',cue:"Z-sit: front shin across, back shin behind — fold forward",dur:60,bil:true,cyc:3.4,cam:58,pitch:30,tdur:15,
 setup:"Sit into a Z. Front shin across in front, back shin behind you.",
 A:{p:[0,92,0],yaw:-8,tw:0,s:[6,4],hf:0,ikL:{w:[-11,88.8,0.5]},ikR:{w:[5.6,88.5,9.5]},
    aL:[0,0,0,0],aR:[0,0,0,0],lR:[80,12,6,-86],lL:[57,-76,-90,-6]},
 B:{p:[0,92,0],yaw:-8,tw:0,s:[42,48],hf:-8,ikL:{w:[-4,92,16]},ikR:{w:[12,92,18]},
    aL:[0,0,0,0],aR:[0,0,0,0],lR:[80,12,6,-86],lL:[57,-76,-90,-6]}}
];
