// Figure colours by rule, for pale and dark stages (Will, 2026-11-12: the stage behind the
// figure stays pale or dark; saturated phase colour goes on the surrounding screen only).
// One rule: pick the figure polarity with the higher contrast against the stage, then mix
// the LEFT-limb tone toward the stage so left and right stay tellable apart.
// The stage colours below are PLACEHOLDERS until the native player defines its own; the
// checks in skin.js run against whatever is listed here.
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const toHex=c=>'#'+c.map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('');
const mix=(a,b,t)=>toHex(hex(a).map((v,i)=>v+(hex(b)[i]-v)*t));
const lum=h=>{const [r,g,b]=hex(h).map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});return 0.2126*r+0.7152*g+0.0722*b;};
const contrast=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);};
function theme(bg){
  const light=contrast(bg,'#1f1e1b')>=contrast(bg,'#ffffff');
  return light?{bg,light,body:'#3a3833',R:'#1f1e1b',L:mix('#3a3833',bg,0.42),floor:mix(bg,'#000000',0.09),prop:mix(bg,'#000000',0.3),ink:'#1f1e1b'}
              :{bg,light,body:'#ece9e2',R:'#ffffff',L:mix('#ece9e2',bg,0.5),floor:mix(bg,'#ffffff',0.1),prop:mix(bg,'#ffffff',0.35),ink:'#ffffff'};
}
const STAGES=[['neutral pale','#eef3ee'],['neutral dark','#121a15'],['work pale','#e2f0e5'],['work dark','#11301f'],
              ['setup pale','#f7e8c9'],['setup dark','#3a2a0d'],['rest pale','#dde8f6'],['rest dark','#0f2238']];
module.exports={theme,contrast,mix,STAGES};
