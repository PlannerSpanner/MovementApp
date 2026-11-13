const MOVES=[
{n:"Seated breathing",pos:'chair',cue:"Sit tall, breathe wide into the ribs",dur:60,bil:false,cyc:4.0,belly:1,pin:"LR", prop:[{l:[[-8,76,-4],[8,76,-4]]},{l:[[-7,76,-4],[-7,93,-4]]},{l:[[7,76,-4],[7,93,-4]]}],
 A:{p:[0,74,0],yaw:-18,tw:0,s:[6,2],hf:0,ikL:{w:[-8,72.5,10]},ikR:{w:[8,72.5,10]},
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[88,-8,2,-6],lR:[88,8,2,6]},
 B:{p:[0,73.4,0],yaw:-18,tw:0,s:[0,-6],hf:-5,ikL:{w:[-8,72.5,10]},ikR:{w:[8,72.5,10]},
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[88,-8,2,-6],lR:[88,8,2,6]}},

{n:"Seated cat-cow",pos:'chair',cue:"Round on the exhale, arch on the inhale",dur:45,bil:false,cyc:3.6,belly:1,pin:"LR", prop:[{l:[[-8,76,-4],[8,76,-4]]},{l:[[-7,76,-4],[-7,93,-4]]},{l:[[7,76,-4],[7,93,-4]]}],
 A:{p:[0,74,0],yaw:20,tw:0,s:[40,48],hf:26,ikL:{k:"knL"},ikR:{k:"knR"},
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[88,-8,2,-6],lR:[88,8,2,6]},
 B:{p:[0,74,0],yaw:20,tw:0,s:[32,20],hf:-20,ikL:{k:"knL"},ikR:{k:"knR"},
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[88,-8,2,-6],lR:[88,8,2,6]}},

{n:"Seated side reach",pos:'chair',cue:"Reach overhead, both sit bones stay down",dur:60,bil:true,cyc:3.4,belly:1,pin:"LR", prop:[{l:[[-8,76,-4],[8,76,-4]]},{l:[[-7,76,-4],[-7,93,-4]]},{l:[[7,76,-4],[7,93,-4]]}],
 A:{p:[0,74,0],yaw:-18,tw:0,s:[4,2],sl:-16,hf:0,ikL:{w:[-8,72.5,10]},ikR:{w:[4,16,2]},
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[88,-8,2,-6],lR:[88,8,2,6]},
 B:{p:[0,74,0],yaw:-18,tw:0,s:[4,2],sl:16,hf:0,ikL:{w:[-4,16,2]},ikR:{w:[8,72.5,10]},
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[88,-8,2,-6],lR:[88,8,2,6]}},

{n:"Seated figure-4",pos:'chair',cue:"Ankle across the knee, hinge forward",dur:60,bil:true,cyc:3.4,belly:1,pin:"L", prop:[{l:[[-8,76,-4],[8,76,-4]]},{l:[[-7,76,-4],[-7,93,-4]]},{l:[[7,76,-4],[7,93,-4]]}],
 A:{p:[0,74,0],yaw:-18,tw:0,s:[6,4],hf:0,ikL:{k:"knL"},ikR:{k:"ftR"},
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[88,-8,2,-6],lR:[93,20,120,-88]},
 B:{p:[0,74,0],yaw:-18,tw:0,s:[34,40],hf:-8,ikL:{k:"knL"},ikR:{k:"ftR"},
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[88,-8,2,-6],lR:[93,20,120,-88]}},

{n:"Supported butterfly",pos:'seated',cue:"Soles together in front, knees open to the sides",dur:60,bil:false,cyc:4.2,belly:1,
 A:{p:[0,86,0],yaw:-20,tw:0,s:[14,18],hf:-4,ikL:{k:"knL"},ikR:{k:"knR"},
    aL:[0,0,0,0],aR:[0,0,0,0],ikFL:[-1.5,90,13],ikFR:[1.5,90,13],swL:16,swR:64},
 B:{p:[0,86,0],yaw:-20,tw:0,s:[18,24],hf:-4,ikL:{k:"knL"},ikR:{k:"knR"},
    aL:[0,0,0,0],aR:[0,0,0,0],ikFL:[-1.5,90,13],ikFR:[1.5,90,13],swL:0,swR:82}},

{n:"Wide-knee child's pose",pos:'kneeling',cue:"Knees wide, belly rests between them",dur:60,bil:false,cyc:4.4,belly:1,cam:58,
 A:{p:[0,83.5,-9],yaw:22,tw:0,s:[112,90],hf:4,ikL:{w:[-8,92.5,33]},ikR:{w:[10,92.5,33]},
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[67,-22,-89,15],lR:[67,22,-89,-15],fpL:4,fyL:180,fpR:4,fyR:180},
 B:{p:[0,84.5,-10.5],yaw:22,tw:0,s:[116,92],hf:2,ikL:{w:[-8,92.5,33]},ikR:{w:[10,92.5,33]},
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[67,-22,-89,15],lR:[67,22,-89,-15],fpL:4,fyL:180,fpR:4,fyR:180}},

{n:"Hands-and-knees rocking",pos:'quadruped',cue:"Rock the hips gently, spine stays neutral",dur:60,bil:false,cyc:2.8,belly:1,
 A:{p:[-0.9,74,-2.22],yaw:22,tw:0,s:[78,78],hf:14,ikL:{w:[-7,93,25]},ikR:{w:[7,93,25]},
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[7.2,-6,-90,-5],lR:[7.2,6,-90,5]},
 B:{p:[0.9,74,2.22],yaw:22,tw:0,s:[85,85],hf:8,ikL:{w:[-7,93,25]},ikR:{w:[7,93,25]},
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[-7.2,-6,-90,-5],lR:[-7.2,6,-90,5]}},

{n:"Kneeling hip flexor stretch",pos:'kneeling',cue:"Tuck the pelvis, shift gently forward",dur:60,bil:true,cyc:3.6,belly:1,pin:"LR", prop:[{l:[[16,64,10],[16,93,10]]},{l:[[11,64,10],[21,64,10]]}],
 A:{p:[0,75,-2],yaw:24,tw:0,s:[4,4],hf:0,ikL:{w:[-8,72,2]},ikR:{w:[14,66,10]},
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[-18,-8,-89,-6],ikFR:[6,93,17],fpL:4,fyL:180},
 B:{p:[0,75.5,1],yaw:24,tw:0,s:[-6,-6],hf:-8,ikL:{w:[-8,72,4]},ikR:{w:[14,66,10]},
    aL:[0,0,0,0],aR:[0,0,0,0],lL:[-18,-8,-89,-6],ikFR:[6,93,17],fpL:4,fyL:180}},

{n:"Standing calf stretch",pos:'wall',cue:"Back heel presses down, back leg straight",dur:60,bil:true,cyc:3.6,belly:1,pin:"LR", prop:[{l:[[0,33,33],[0,93,33]]}],
 A:{p:[0,58,4],yaw:24,tw:0,s:[14,10],hf:-4,ikL:{w:[-9,60,31]},ikR:{w:[9,60,31]},
    aL:[0,0,0,0],aR:[0,0,0,0],ikFL:[-6,93,-16],ikFR:[6,93,14]},
 B:{p:[0,58,5.5],yaw:24,tw:0,s:[16,12],hf:-4,ikL:{w:[-9,60,31]},ikR:{w:[9,60,31]},
    aL:[0,0,0,0],aR:[0,0,0,0],ikFL:[-6,93,-16],ikFR:[6,93,14]}},

{n:"Doorway chest opener",pos:'doorway',cue:"Forearm up on the frame, step gently through",dur:45,bil:true,cyc:3.8,belly:1,pin:"LR", prop:[{l:[[-19,25,2],[-19,93,2]]},{l:[[19,25,2],[19,93,2]]}],
 A:{p:[0,58,0],yaw:-16,tw:0,s:[3,3],hf:0,aL:[6,-10,8,-8],aR:[0,88,178,2],
    ikFL:[-7,93,-2],ikFR:[7,93,6]},
 B:{p:[0,58,1.5],yaw:-16,tw:0,s:[3,3],hf:0,aL:[0,-88,178,-2],aR:[6,10,8,8],
    ikFL:[-7,93,-2],ikFR:[7,93,6]}}
];
