// Morning Flow — 13 movements: eight standing (continuous and rhythmic), then a
// five-movement ground finish moved in from the retired Morning Movement app
// (2026-08-26; poses verbatim). TR_ALL build: tdur = length of the GET SET UP gap
// BEFORE the movement (default 10, 15 for position changes, 5 for the explicit
// get-on-the-ground gap before Folded cat-cows); setup = authored transition script,
// spoken as "Next: <name>. <setup>". Work 680s + gaps 135s = 815s.
// Retired from Flow (see src/d_retired.js): Rotations with shoulder slaps,
// Lateral weight shifts.
const MOVES=[
{n:"Bouncing in place",pos:'standing',cue:"Light bounces, everything loose",dur:50,bil:false,cyc:1.0,
 setup:"Stand easy, feet under your hips, arms loose.",
 A:{p:[0,57,0],yaw:22,tw:0,s:[4,4],hf:0,aL:[8,-11,14,-9],aR:[8,11,14,9],ikFL:[-5,93,1],ikFR:[5,93,1]},
 B:{p:[0,61,0],yaw:22,tw:0,s:[5,5],hf:0,aL:[16,-12,26,-10],aR:[16,12,26,10],ikFL:[-5,93,1],ikFR:[5,93,1]}},

{n:"Arm sweeps with knee dip",pos:'standing',cue:"Arms sweep, knees dip in rhythm",dur:50,bil:false,cyc:2.0,
 setup:"Stay standing, feet under your hips, arms hanging.",
 A:{p:[0,58,0],yaw:24,tw:0,s:[4,4],hf:-6,aL:[62,-10,72,-8],aR:[58,10,68,8],ikFL:[-5,93,1],ikFR:[5,93,1]},
 B:{p:[0,70,-3],yaw:24,tw:0,s:[16,12],hf:8,aL:[-46,-10,-54,-8],aR:[-50,10,-58,8],ikFL:[-5,93,1],ikFR:[5,93,1]}},

{n:"Punching rotations",pos:'standing',cue:"Stand tall, knees soft — punch out, push the shoulder blade forward",dur:50,bil:false,cyc:1.6,
 setup:"Feet wider than your shoulders, knees soft, fists at your ribs.",
 A:{p:[0,61,0],yaw:-16,tw:26,s:[4,4],hf:22,aL:[80,-64,86,-70],aR:[86,20,90,6],ikFL:[-12,93,1],ikFR:[12,93,1],swL:-10,swR:28},
 B:{p:[0,61,0],yaw:-16,tw:-26,s:[4,4],hf:-22,aL:[86,-20,90,-6],aR:[80,64,86,70],ikFL:[-12,93,1],ikFR:[12,93,1],swL:-10,swR:28}},

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

{n:"Hip circles",pos:'standing',cue:"Hands on hips, big slow circles",dur:60,bil:true,cyc:2.6,
 setup:"Hands on your hips, feet planted.",
 orb:{hips:true,rx:9,rz:8,ry:2},
 A:{p:[0,60,0],yaw:20,tw:0,s:[4,4],hf:0,ikL:{k:"hpL"},ikR:{k:"hpR"},
    aL:[0,0,0,0],aR:[0,0,0,0],ikFL:[-8,93,1],ikFR:[8,93,1]},
 B:{p:[0,60,0],yaw:20,tw:0,s:[4,4],hf:0,ikL:{k:"hpL"},ikR:{k:"hpR"},
    aL:[0,0,0,0],aR:[0,0,0,0],ikFL:[-8,93,1],ikFR:[8,93,1]}},

{n:"Bent rotation sweeps",pos:'standing',cue:"Hinged forward, sweep the arms floor to sky",dur:50,bil:false,cyc:2.0,
 setup:"Hinge forward halfway, arms hanging loose.",
 A:{p:[0,62,-4],yaw:6,tw:40,s:[54,58],hf:26,aL:[2,-4,2,-3],aR:[176,8,174,6],ikFL:[-7,93,1],ikFR:[7,93,1]},
 B:{p:[0,62,-4],yaw:6,tw:-40,s:[54,58],hf:-26,aL:[176,16,174,14],aR:[2,-17,2,-15],ikFL:[-7,93,1],ikFR:[7,93,1]}},

// ---- ground block (poses moved verbatim from data2.js, 2026-08-26) ----
// Explicit 5s "get on the ground" gap opens the block (Will's authored transition).
{n:"Folded cat-cows",pos:'standing',cue:"Hands on bent knees, round then arch the spine",dur:30,bil:false,cyc:3.4,pin:"LR",tdur:5,
 setup:"Time to get on the ground. Fold down, hands on your bent knees.",
 A:{p:[0,64,0],yaw:22,tw:0,s:[74,86],hf:28,ikL:{k:"knL"},ikR:{k:"knR"},
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[40,-6,-40,-5],lR:[40,6,-40,5]},
 B:{p:[0,64,0],yaw:22,tw:0,s:[72,70],hf:-26,ikL:{k:"knL"},ikR:{k:"knR"},
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[40,-6,-40,-5],lR:[40,6,-40,5]}},

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

{n:"Thread the needle",pos:'quadruped',cue:"Reach up, then slide the arm under",dur:60,bil:true,cyc:3.6,pin:"LR",tdur:15,
 setup:"Drop your knees and come to hands and knees, wrists under shoulders.",
 A:{p:[0,74,-2],yaw:16,tw:52,s:[-74,-74],hf:-18,ikL:{w:[-9,93,-14]},
    aL:[0,0,0,0],aR:[-58,58,-68,54],lL:[0,-6,90,-5],lR:[4,6,94,5]},
 B:{p:[0,76,-2],yaw:16,tw:-58,s:[-78,-86],hf:26,ikL:{w:[-9,93,-14]},
    aL:[0,0,0,0],aR:[72,-74,62,-70],lL:[0,-6,90,-5],lR:[4,6,94,5]}},

{n:"90/90 with a fold",pos:'seated',cue:"Z-sit: front shin across, back shin behind — fold forward",dur:60,bil:true,cyc:3.4,cam:58,tdur:15,
 setup:"Sit into a Z. Front shin across in front, back shin behind you.",
 A:{p:[0,90,0],yaw:-8,tw:0,s:[6,4],hf:0,ikL:{w:[-14,92,-6]},ikR:{w:[10,92,6]},
    aL:[0,0,0,0],aR:[0,0,0,0],lR:[88,12,6,-86],lL:[57,-76,-90,-6]},
 B:{p:[0,90,0],yaw:-8,tw:0,s:[42,48],hf:-8,ikL:{w:[-4,92,16]},ikR:{w:[12,92,18]},
    aL:[0,0,0,0],aR:[0,0,0,0],lR:[88,12,6,-86],lL:[57,-76,-90,-6]}}
];
