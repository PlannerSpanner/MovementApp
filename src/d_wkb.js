const WK_B=[
{n:"Trap-bar deadlift",sets:3,reps:"6",cyc:3.2,cam:48,pin:"LR",
 how:"Stand centered in the bar, hips back until the hamstrings load, shoulders over the handles, back flat. Push the floor away and stand tall — every rep fast and clean.",
 cues:["Flat back before you pull","Push the floor, don't yank the bar","Hips and shoulders rise together","Finish tall, glutes squeezed"],
 prop:[{l:[{j:'gpL',o:[0,0,-6]},{j:'gpL',o:[0,0,6]}]},
       {l:[{j:'gpR',o:[0,0,-6]},{j:'gpR',o:[0,0,6]}]},
       {l:[{j:'gpL',o:[0,0,6]},{j:'gpR',o:[0,0,6]}]},
       {l:[{j:'gpL',o:[0,0,-6]},{j:'gpR',o:[0,0,-6]}]},
       {l:[{j:'gpL',o:[0,4,0]},{j:'gpL',o:[-9,4,0]}]},
       {l:[{j:'gpR',o:[0,4,0]},{j:'gpR',o:[9,4,0]}]},
       {l:[{j:'gpL',o:[0,0,0]},{j:'gpL',o:[0,4,0]}]},
       {l:[{j:'gpR',o:[0,0,0]},{j:'gpR',o:[0,4,0]}]},
       {c:[{j:'gpL',o:[-9,4,0]},9.2]},
       {c:[{j:'gpR',o:[9,4,0]},9.2]}],
 // 2026-11-12: FK arms at the sides (old hand targets missed by 4 mid-rep), plates on the floor
 // at the bottom with the handles 4 above the plate centre (a trap bar's raised handles), knees
 // about 100 deg. Plates drawn as rings so the legs show through. With the handles in the
 // fist the trunk is at 54 deg (was 65) and the arms 10 deg back of plumb (was 17).
 A:{p:[0,55.2,0],yaw:20,tw:0,s:[3,3],hf:0,aL:[0,-4,0,-4],aR:[0,4,0,4],lL:[-2,-6,2,-5],lR:[2,6,-2,5]},
 B:{p:[-3.4,66,-9.3],yaw:20,tw:0,s:[54.4,54.4],hf:-12,aL:[-10,-4,-10,-4],aR:[-10,4,-10,4],lL:[0,0,0,0],
    lR:[0,0,0,0]}},

{n:"Split squat",sets:3,reps:"8",each:true,cyc:3.0,cam:62,
 how:"Long staggered stance, back heel up. Drop the hips straight down until the back knee hovers just off the floor, then press through the whole front foot to stand.",
 cues:["Front shin near vertical","Back knee hovers — never rests","A slight forward lean is fine","Back foot stays light"],
 // 2026-11-12: squared to the camera axis (yaw 0), hips travel straight down (they slid 4.7
 // back), back knee hovers under the hip. No mid key is needed any more. Foot contact is
 // authored: back foot on its ball, heel up (fp 45), front foot flat.
 A:{p:[0,60.6,-6],yaw:0,tw:0,s:[6,6],hf:0,aL:[3,-7,5,-5],aR:[3,7,5,5],ikFL:[-5,88.5,-24.9],
    ikFR:[5,93,12.8],swL:0,swR:0,fpL:45,fpR:0},
 B:{p:[0,74,-6],yaw:0,tw:0,s:[8,8],hf:-2,aL:[3,-7,5,-5],aR:[3,7,5,5],ikFL:[-5,88.5,-24.9],
    ikFR:[5,93,12.8],swL:0,swR:0,fpL:45,fpR:0}},

{n:"Chest-supported row",sets:3,reps:"10",cyc:2.5,cam:66,
 how:"Chest on an incline bench, arms hanging, palms facing each other. Row both dumbbells by driving the elbows back, squeeze between the shoulder blades, then lower slowly.",
 cues:["Chest glued to the pad","Elbows back, not straight up","One-beat pause at the top","No neck craning"],
 prop:[{l:[[0,74.5,-8],[0,58,16.9]]},
       {l:[[0,74.5,-8],[0,93,-8]]},
       {l:[[0,58,16.9],[0,93,16.9]]},
       {db:[{j:'gpL',o:[0,0,-2.4]},{j:'gpL',o:[0,0,2.4]},1.7]},
       {db:[{j:'gpR',o:[0,0,-2.4]},{j:'gpR',o:[0,0,2.4]},1.7]}],
 // 2026-11-12: body and bench squared (yaw 0, camera 82 keeps the view); both arms hang
 // straight at the bottom (the right was bent to 155) and the elbows stay close at the top.
 // Foot contact authored (2026-11-12): braced on the balls of the feet, toes tucked, heels up.
 A:{p:[0,72,-6],yaw:0,tw:0,s:[52,50],hf:-10,ikL:{w:[-8,81.5,14.2]},ikR:{w:[8,81.5,14.2]},swAL:-96,
    swAR:96,ikFL:[-5.5,89.5,-39],ikFR:[5.5,89.5,-39],fpL:33,fpR:33,fyL:0,fyR:0},
 B:{p:[0,72,-6],yaw:0,tw:0,s:[52,50],hf:-10,ikL:{w:[-8.5,71,1.1]},ikR:{w:[8.5,71,1.1]},swAL:-96,swAR:96,
    ikFL:[-5.5,89.5,-39],ikFR:[5.5,89.5,-39],fpL:33,fpR:33,fyL:0,fyR:0}},

{n:"Neutral-grip lat pulldown",sets:3,reps:"8",cyc:2.9,cam:94,
 how:"Sit tall, hands on the neutral handles overhead, lean back a touch. Drive the elbows down and back to bring the handles to your upper chest, then control the way back up.",
 cues:["Elbows down to your sides","Slight lean — no rocking","Chest up to meet the bar","Control the way up"],
 prop:[{l:[[-4.8,76.5,-1.4],[4.8,76.5,1.4]]},
       {l:[[-4,76.5,-1.2],[-4,93,-1.2]]},
       {l:[[4,76.5,1.2],[4,93,1.2]]},
       {l:[[-3,4,12],{m:['gpL','gpR']}]},
       {l:[{j:'gpL',o:[-1.2,0,0]},{j:'gpR',o:[1.2,0,0]}]}],
 // 2026-11-12: arms fully extended toward the pulley at the top (they were bent to 134-146),
 // one constant 12 deg lean (it rocked from 0 to 12), handle to the upper chest. Seen from the
 // side (camera 94) so the cable runs in front of the face instead of across it.
 A:{p:[0,72.5,0],yaw:-16,tw:0,s:[-12,-12],hf:4,ikL:{w:[-6.7,23.1,2.7]},ikR:{w:[4.6,23.1,6]},swAL:-76,
    swAR:76,lL:[86,-8,4,-6],lR:[86,8,4,6]},
 B:{p:[0,72.5,0],yaw:-16,tw:0,s:[-12,-12],hf:4,ikL:{w:[-7.3,52.2,1.8]},ikR:{w:[5.2,52.2,5.4]},swAL:-76,
    swAR:76,lL:[86,-8,4,-6],lR:[86,8,4,6]}},

{n:"Band pull-apart",sets:2,reps:"15",cyc:2.7,cam:40,pitch:22,
 how:"Arms straight out in front at shoulder height, band taut between your hands. Pull it apart until it touches your chest, arms wide, then return without letting it go slack.",
 cues:["Shoulder blades slide back first","Arms dead straight","Keep tension both directions","Ribs down"],
 prop:[{l:['gpL','gpR']}],
 // 2026-11-12: faces the lens (yaw -40) from slightly above so the pull to a T happens ACROSS
 // the screen (in near-profile it folded into the chest). FK arms stay dead straight through
 // the whole arc.
 A:{p:[0,55.4,0],yaw:-15,tw:0,s:[1,0],hf:0,aL:[90,3,90,3],aR:[90,-3,90,-3],lL:[-2,-6,2,-5],lR:[2,6,-2,5],gL:90,gR:90},
 B:{p:[0,55.4,0],yaw:-15,tw:0,s:[1,0],hf:0,aL:[90,-86,90,-86],aR:[90,86,90,86],lL:[-2,-6,2,-5],
    lR:[2,6,-2,5],gL:90,gR:90}},

{n:"Side plank",sets:2,reps:"30 sec",each:true,cyc:4.2,cam:18,pin:"LR",
 how:"On your forearm, elbow under the shoulder, feet stacked. Lift the hips until head to heels is one straight line, and hold — keep breathing.",
 cues:["One straight line, head to heels","Elbow under the shoulder","Push the floor away","Hips high — don't let them sag"],
 // 2026-11-12: the Daily 13 pose. A straight body rolled 77.9 deg onto its right side (root
 // roll), elbow under the shoulder, hips and feet stacked. Will: hold the line, no sag; B is a breath.
 A:{p:[0,78.7,0],yaw:0,roll:77.9,tw:0,s:[0,0],hf:0,aL:[4,0,4,0],ikR:{w:[26.9,92.5,12.5]},swAR:16,
    lL:[0,13,0,13],lR:[0,0,0,0]},
 B:{p:[0,78.85,0],yaw:0,roll:77.9,tw:0,s:[0,0],hf:2,aL:[6,0,7,0],ikR:{w:[26.9,92.5,12.5]},swAR:16,
    lL:[0,13,0,13],lR:[0,0,0,0]}}
];
