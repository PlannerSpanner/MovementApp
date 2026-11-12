const WK_A=[
{n:"Goblet squat",sets:3,reps:"8",cyc:3.0,pin:"LR",
 how:"Hold one dumbbell vertically against your chest, elbows tucked under it. Sit down and back until your elbows brush the insides of your knees, then drive back up through the whole foot.",
 cues:["Chest tall — the bell pulls you forward, fight it","Knees track over the toes","Elbows inside the knees at the bottom"],
 prop:[{db:[{m:['gpL','gpR'],o:[0,-4,0]},{m:['gpL','gpR'],o:[0,3.2,0]},2.6]}],
 // 2026-11-12: hips to knee height (they stopped 2 above), toes and knees turned out so the
 // elbows sit inside the knees, and the hands hold the bell on the sternum in both keys.
 A:{p:[0,55.3,0],yaw:22,tw:0,s:[4,4],hf:0,ikL:{w:[1.1,32.3,8]},ikR:{w:[4.8,32.3,6.5]},swAL:-54,swAR:54,
    lL:[-3,-9,3,-8],lR:[3,9,-3,8],swL:-26,swR:24},
 B:{p:[-3.2,77.6,-8],yaw:22,tw:0,s:[24,20],hf:-8,ikL:{w:[0.2,56.1,5.7]},ikR:{w:[3.9,56.1,4.2]},swAL:-54,
    swAR:54,lL:[0,0,0,0],lR:[0,0,0,0],swL:-26,swR:24}},

{n:"Neutral-grip DB floor press",sets:3,reps:"8–10",cyc:2.7,cam:60,
 how:"Lie on the floor, knees bent, a dumbbell in each hand over the chest, palms facing each other. Lower until the upper arms rest on the floor, pause a beat, press back up.",
 cues:["Elbows about 45° from your sides","Touch down soft — no bounce","Wrists stacked over the elbows","Ribs down, no big arch"],
 prop:[{db:[{j:'gpL',o:[0,0,-2.4]},{j:'gpL',o:[0,0,2.4]},1.7]},
       {db:[{j:'gpR',o:[0,0,-2.4]},{j:'gpR',o:[0,0,2.4]},1.7]}],
 // 2026-11-12: FK arms. The forearm is straight up in both keys, so the wrist stays over the
 // elbow by construction; the upper arm sweeps from the floor, 45 deg out from the trunk (it
 // was a T at 86 deg with the elbows hovering 6 up), to vertical.
 // Foot contact authored (2026-11-12): both feet flat on the floor, toes pointing away from the head.
 A:{p:[0,89.5,3],yaw:14,tw:0,s:[-84,-90],hf:-4,aL:[63.8,-41.9,180,0],aR:[63.8,41.9,180,0],
    ikFL:[0.5,93,27.6],ikFR:[11.1,93,25],fpL:0,fpR:0},
 B:{p:[0,89.5,3],yaw:14,tw:0,s:[-84,-90],hf:-4,aL:[180,0,180,0],aR:[180,0,180,0],ikFL:[0.5,93,27.6],
    ikFR:[11.1,93,25],fpL:0,fpR:0}},

{n:"Single-arm DB row",sets:3,reps:"10",each:true,cyc:2.5,cam:296,pitch:20,
 how:"Left hand and knee on the bench, back flat and level. Let the dumbbell hang, then drive the elbow up and back toward your hip. Lower with control.",
 cues:["Pull the elbow, not the hand","Hips square — no torso twist","Shoulder blade to the back pocket"],
 prop:[{l:[[-5,75.5,-30],[-5,75.5,24]]},
       {l:[[-5,75.5,-26],[-5,93,-26]]},
       {l:[[-5,75.5,20],[-5,93,20]]},
       {db:[{j:'gpR',o:[0,0,-2.4]},{j:'gpR',o:[0,0,2.4]},1.7]}],
 // 2026-11-12: squared to the bench (yaw 0, camera 80 keeps the view). The bench leg KNEELS:
 // thigh straight down, shin back along the bench (the old fitted swivel folded the knee the
 // wrong way, shin toward the head). The rowing arm is FK with the forearm hanging vertical in
 // both keys: straight down at the bottom, elbow up and back past the ribs at the top.
 // Seen from the rowing side (camera 296) so the support arm never covers the working arm;
 // pL 75.5 = the bench top the support hand lies flat on.
 // Foot contact authored (2026-11-12): the kneeling foot lies along the bench in line with the shin; the standing foot is flat.
 A:{p:[0,55,-8],yaw:0,tw:0,s:[77,77],hf:4,aL:[0,-2,0,-2],aR:[6,9,0,9],lL:[0,0,-90,0],ikFR:[6.5,93,-9.5],pL:75.5,fpL:4,fyL:180,fpR:0},
 B:{p:[0,55,-8],yaw:0,tw:0,s:[77,77],hf:4,aL:[0,-2,0,-2],aR:[-118,4,0,4],lL:[0,0,-90,0],
    ikFR:[6.5,93,-9.5],pL:75.5,fpL:4,fyL:180,fpR:0}},

{n:"Romanian deadlift",sets:2,reps:"8",cyc:3.2,cam:46,pin:"LR",
 how:"Soft knees, bar at the thighs. Push your hips straight back and slide the bar down your legs to just below the knee, back flat, then stand tall by squeezing the glutes.",
 cues:["Hips back, not chest down","Bar shaved against the legs","Shins stay vertical","Stop before the low back rounds"],
 prop:[{l:[{j:'gpL',o:[-6.5,0,0]},{j:'gpR',o:[6.5,0,0]}]},
       {c:[{j:'gpL',o:[-2.8,0,0]},6.5]},
       {c:[{j:'gpR',o:[2.8,0,0]},6.5]}],
 // 2026-11-12: FK arms that hang from the shoulders (the old hand targets were missed by 4.3
 // mid-rep), bar just below the knees at the bottom with the hips 14 behind the heels, shins
 // vertical. Plates drawn as rings: filled, they covered the hips and knees the lift is about.
 // With the bar in the FIST (3.4 beyond the wrist) the bar reaches below the knee from a
 // shallower hinge (53 deg, was 64) and the arms hang 5 deg back of plumb (was 11).
 // Overhand grip: gL/gR 90 (pronated).
 A:{p:[0,55.2,0],yaw:24,tw:0,s:[3,3],hf:0,aL:[7,-3,7,-3],aR:[7,3,7,3],lL:[-2,-6,2,-5],lR:[2,6,-2,5],gL:90,gR:90},
 B:{p:[-5.7,61.3,-12.9],yaw:24,tw:0,s:[53.5,53.5],hf:-14,aL:[-5,-3,-5,-3],aR:[-5,3,-5,3],lL:[0,0,0,0],
    lR:[0,0,0,0],gL:90,gR:90}},

{n:"Face pull",sets:2,reps:"15",cyc:2.7,cam:60,pitch:22,
 how:"Cable at face height, one hand on each end of the rope. Pull toward your eyes, letting the elbows travel high and wide, and finish with knuckles pointing at the ceiling.",
 cues:["Elbows lead, hands follow","Elbows at shoulder height","Pull the ends apart as they reach your face","No lean-back momentum"],
 prop:[{l:[[0,10,48],[0,93,48]]},
       {c:[[0,21,47.4],1.5]},
       {l:[[0,21,46.8],'gpL']},
       {l:[[0,21,46.8],'gpR']}],
 // 2026-11-12: seen from behind and to one side (camera 140) so the elbows flaring high and
 // wide and the hands finishing beside the head read; from the old 3/4 front a forearm
 // foreshortened to 4% and the finish looked like a salute. Arms reach full extension at the
 // start, the trunk does not lean back, elbows stay at shoulder height.
 A:{p:[0,55.4,0],yaw:0,tw:0,s:[1,0],hf:0,aL:[100,3,100,3],aR:[100,-3,100,-3],lL:[-2,-6,2,-5],
    lR:[2,6,-2,5]},
 B:{p:[0,55.4,0],yaw:0,tw:0,s:[1,0],hf:0,aL:[90,-84,178,-6],aR:[90,84,178,6],lL:[-2,-6,2,-5],
    lR:[2,6,-2,5]}}
];
