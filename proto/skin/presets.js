// Skin presets offered on the tuning page (1 = today's stick figure) and used for dry runs of
// qa/fig/skin.js. Widths are in stroke units (today's limb = 3.0).
const DEF={joint:2.5,mid:2.3,tip:2.0,upper:{w:3.6,at:0.40},fore:{w:3.1,at:0.30},thigh:{w:4.3,at:0.38},shin:{w:3.5,at:0.30},torso:{chest:1.10,waist:0.88,at:0.50,stroke:2.6}};
const PRESETS={
 '1 · today':{joint:3,mid:3,tip:3,upper:{w:3,at:0.5},fore:{w:3,at:0.5},thigh:{w:3,at:0.5},shin:{w:3,at:0.5},torso:{chest:1,waist:1,at:0.5,stroke:2.6}},
 '2 · suggested':DEF,
 '3 · more':{joint:2.6,mid:2.3,tip:1.9,upper:{w:4.2,at:0.40},fore:{w:3.5,at:0.28},thigh:{w:5.2,at:0.36},shin:{w:4.1,at:0.28},torso:{chest:1.16,waist:0.82,at:0.48,stroke:2.8}},
 '4 · most':{joint:2.8,mid:2.3,tip:1.8,upper:{w:4.9,at:0.40},fore:{w:3.9,at:0.27},thigh:{w:6.2,at:0.35},shin:{w:4.7,at:0.27},torso:{chest:1.22,waist:0.78,at:0.46,stroke:3.0}},
};
module.exports={DEF,PRESETS};
