// 2D "volume mannequin" renderer for the prototype rig: every body part is a tapered capsule
// in 3D; under an orthographic camera its silhouette is exactly the hull of two circles, so
// the figure is drawn as depth-sorted filled hulls with a separating edge. Output is an SVG
// string (viewBox 0 0 100 100): it runs anywhere SVG runs (WKWebView, a build-time rasteriser
// for Live Activity stills) and needs no WebGL.
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./rig'));else root.Render2D=factory(root.Rig);})(this,function(Rig){
const f=n=>n.toFixed(2);
function hull(a,b){   // a,b: {x,y,r} screen circles -> path of their convex hull
  const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
  if(d<=Math.abs(a.r-b.r)+1e-6){const c=a.r>=b.r?a:b;return `M${f(c.x-c.r)},${f(c.y)}a${f(c.r)},${f(c.r)} 0 1,1 ${f(2*c.r)},0a${f(c.r)},${f(c.r)} 0 1,1 ${f(-2*c.r)},0Z`;}
  const th=Math.atan2(dy,dx),ph=Math.acos((a.r-b.r)/d),P=(c,ang)=>[c.x+c.r*Math.cos(ang),c.y+c.r*Math.sin(ang)];
  const p1=P(a,th+ph),p2=P(a,th-ph),p3=P(b,th-ph),p4=P(b,th+ph);
  return `M${f(p1[0])},${f(p1[1])}A${f(a.r)},${f(a.r)} 0 ${ph<Math.PI/2?1:0},1 ${f(p2[0])},${f(p2[1])}L${f(p3[0])},${f(p3[1])}A${f(b.r)},${f(b.r)} 0 ${ph>Math.PI/2?1:0},1 ${f(p4[0])},${f(p4[1])}Z`;
}
const GROUP={pelvis:'torso',waist:'torso',chest:'torso',neck:'torso',head:'head',upper:'upper',fore:'fore',hand:'fore',thigh:'thigh',shank:'shank',foot:'shank'};
// fit a whole motion (all phases, all capsules, props) into the 100x100 stage
function fitOf(m,cam,pad){
  const C=Rig.camera(cam||m.cam||{});let a=1e9,b=-1e9,c=1e9,d=-1e9;
  for(let i=0;i<32;i++){const S=Rig.poseAt(m,i/32);
    Rig.capsules(S).forEach(k=>[[k.a,k.ra],[k.b,k.rb]].forEach(([v,r])=>{const q=C.proj(v);a=Math.min(a,q.x-r);b=Math.max(b,q.x+r);c=Math.min(c,q.y-r);d=Math.max(d,q.y+r);}));}
  (m.props||[]).forEach(p=>(p.pts||[]).forEach(v=>{const q=C.proj(v);a=Math.min(a,q.x);b=Math.max(b,q.x);c=Math.min(c,q.y);d=Math.max(d,q.y);}));
  pad=pad==null?6:pad;const sc=Math.min((100-2*pad)/(b-a),(100-2*pad)/(d-c));
  return {sc,ox:50-(a+b)/2*sc,oy:50-(c+d)/2*sc};
}
// theme: {body,R,L,edge,floor}. R/L are the static identity colours of the right and left limbs.
function svg(m,ph,theme,opt){
  opt=opt||{};const cam=opt.cam||m.cam||{},C=Rig.camera(cam),fit=opt.fit||fitOf(m,cam),S=Rig.poseAt(m,ph);
  const P=v=>{const q=C.proj(v);return {x:q.x*fit.sc+fit.ox,y:q.y*fit.sc+fit.oy,d:q.d};};
  const ew=(opt.edge==null?1.1:opt.edge);
  const groups={};
  const bold=opt.bold||1;   // thumbnails: fatten the limbs so they survive at 24-44 pt
  Rig.capsules(S).forEach(k=>{const g=GROUP[k.part]+k.side,a=P(k.a),b=P(k.b),bm=k.side==='C'?1:bold;a.r=k.ra*fit.sc*bm;b.r=k.rb*fit.sc*bm;
    (groups[g]=groups[g]||{caps:[],d:0,part:GROUP[k.part],side:k.side}).caps.push({a,b});groups[g].d+=(a.d+b.d)/2;});
  const G=Object.values(groups);G.forEach(g=>{g.d/=g.caps.length; if(g.part==='head')g.d+=0.5;});
  G.sort((x,y)=>x.d-y.d);
  let out='';
  if(opt.floor!==false){   // floor disc under the figure: a real plane the feet and hands can be read against
    const c0=P([opt.floorAt?opt.floorAt[0]:0,0,opt.floorAt?opt.floorAt[1]:0]),rx=(opt.floorR||70)*fit.sc,ry=rx*Math.abs(C.dir[1]);
    out+=`<ellipse cx="${f(c0.x)}" cy="${f(c0.y)}" rx="${f(rx)}" ry="${f(Math.max(ry,0.6))}" fill="${theme.floor}"/>`;}
  (m.props||[]).forEach(p=>{if(p.line){const a=P(p.line[0]),b=P(p.line[1]);out+=`<line x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}" stroke="${theme.prop||theme.edge}" stroke-width="${f((p.w||3)*fit.sc)}" stroke-linecap="round"/>`;}});
  G.forEach(g=>{const col=g.side==='R'?theme.R:g.side==='L'?theme.L:theme.body;
    const d=g.caps.map(k=>hull(k.a,k.b)).join('');
    if(ew>0)out+=`<path d="${d}" fill="none" stroke="${theme.edge}" stroke-width="${f(ew*2)}" stroke-linejoin="round"/>`;
    out+=`<path d="${d}" fill="${col}"/>`;});
  return {svg:out,flags:S.flags,S};
}
return {svg,fitOf,hull};
});
