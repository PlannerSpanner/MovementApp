// Camera fitting for the prototype rig: score every candidate camera (yaw x pitch) for how
// well ONE fixed view reads a movement, instead of guessing and marking up screenshots.
//   node proto/rig/camfit.js <motion> [--top=6]
// Score per camera, averaged over 16 phases (all terms 0..1, higher is better):
//   open    silhouette openness: area of the union of all body parts / sum of their areas
//           (low when limbs stack on top of each other or on the torso)
//   motion  how much of the moving joints' 3D travel survives projection (a sweep toward the
//           lens scores 0, a sweep across the screen scores 1), weighted by how far each travels
//   sides   left and right wrists / ankles / knees apart on screen (not drawn over each other)
//   vis     the joints that travel (wrists, elbows, knees, ankles, head) are in view, not behind the body
//   ground  floor read: sin(pitch) capped, a slightly raised camera separates feet from hands
// score = open * motion^1.5 * (0.6+0.4*sides) * (0.85+0.15*ground) * vis^2
// It is an aid, not a judge: it ranks candidates, the eye picks among the top few.
const Rig=require('./rig'),R2=require('./render2d');
const {sub,len}=Rig.vec;
function score(m,cam){
  const C=Rig.camera(cam),fit=R2.fitOf(m,cam),N=16,G=56;let open=0,sides=0;const tracks={},frames=[];
  for(let i=0;i<N;i++){const S=Rig.poseAt(m,i/N),caps=Rig.capsules(S);
    const grid=new Uint8Array(G*G),zb=new Float32Array(G*G).fill(-1e9);let sum=0;
    caps.forEach(k=>{const a=C.proj(k.a),b=C.proj(k.b);const A={x:(a.x*fit.sc+fit.ox)*G/100,y:(a.y*fit.sc+fit.oy)*G/100,r:k.ra*fit.sc*G/100},B={x:(b.x*fit.sc+fit.ox)*G/100,y:(b.y*fit.sc+fit.oy)*G/100,r:k.rb*fit.sc*G/100};
      const x0=Math.max(0,Math.floor(Math.min(A.x-A.r,B.x-B.r))),x1=Math.min(G-1,Math.ceil(Math.max(A.x+A.r,B.x+B.r))),y0=Math.max(0,Math.floor(Math.min(A.y-A.r,B.y-B.r))),y1=Math.min(G-1,Math.ceil(Math.max(A.y+A.r,B.y+B.r)));
      const dx=B.x-A.x,dy=B.y-A.y,L2=dx*dx+dy*dy||1e-9;
      for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){let t=((x-A.x)*dx+(y-A.y)*dy)/L2;t=Math.max(0,Math.min(1,t));
        const r=A.r+(B.r-A.r)*t;if(Math.hypot(x-A.x-dx*t,y-A.y-dy*t)<=r){sum++;grid[y*G+x]=1;const z=a.d+(b.d-a.d)*t+r*100/(fit.sc*G);if(z>zb[y*G+x])zb[y*G+x]=z;}}});
    frames.push({S,zb});
    let uni=0;for(let q=0;q<G*G;q++)uni+=grid[q];open+=sum?uni/sum:0;
    let sp=0;[['wrL','wrR'],['anL','anR'],['knL','knR'],['elL','elR']].forEach(([l,r])=>{const a=C.proj(S.J[l]),b=C.proj(S.J[r]);
      sp+=Math.min(1,Math.hypot(a.x-b.x,a.y-b.y)*fit.sc/9);});sides+=sp/4;
    ['wrL','wrR','elL','elR','anL','anR','knL','knR','head','c7','root'].forEach(k=>{(tracks[k]=tracks[k]||[]).push(S.J[k]);});}
  let w3=0,w2=0;for(const k in tracks){const T=tracks[k];for(let i=0;i<T.length;i++){const a=T[i],b=T[(i+1)%T.length],d3=len(sub(b,a));if(d3<0.2)continue;
    const pa=C.proj(a),pb=C.proj(b);w3+=d3;w2+=Math.hypot(pa.x-pb.x,pa.y-pb.y);}}
  // vis: are the joints that carry the movement actually in view (not behind the body)?
  let vn=0,vv=0;const moving=Object.keys(tracks).filter(k=>{const T=tracks[k];let d=0;for(let i=0;i<T.length;i++)d+=len(sub(T[(i+1)%T.length],T[i]));return d>25;});
  frames.forEach(fr=>moving.forEach(k=>{const q=C.proj(fr.S.J[k]),x=Math.round((q.x*fit.sc+fit.ox)*G/100),y=Math.round((q.y*fit.sc+fit.oy)*G/100);if(x<0||y<0||x>=G||y>=G)return;vn++;if(fr.zb[y*G+x]<=q.d+9)vv++;}));
  const vis=vn?vv/vn:1;
  const motion=w3?w2/w3:1,ground=Math.min(1,Math.sin((cam.pitch||0)*Math.PI/180)/0.34);
  open/=N;sides/=N;
  return {cam,open,motion,sides,ground,vis,score:open*Math.pow(motion,1.5)*(0.6+0.4*sides)*(0.85+0.15*ground)*Math.pow(vis,2)};
}
function best(m,opt){opt=opt||{};const out=[];
  for(let yaw=-180;yaw<180;yaw+=15)for(const pitch of (opt.pitches||[4,12,20,30,45,60,75]))out.push(score(m,{yaw,pitch}));
  return out.sort((a,b)=>b.score-a.score);}
module.exports={score,best};
if(require.main===module){const M=require('./motions');const args=process.argv.slice(2),top=+((args.find(a=>a.startsWith('--top='))||'--top=6').slice(6));
  args.filter(a=>!a.startsWith('--')).forEach(n=>{const m=M[n];console.log(m.name,'(authored cam',JSON.stringify(m.cam),'score',score(m,m.cam).score.toFixed(3)+')');
    best(m).slice(0,top).forEach(r=>console.log(`  yaw ${String(r.cam.yaw).padStart(4)} pitch ${String(r.cam.pitch).padStart(2)}  score ${r.score.toFixed(3)}  open ${r.open.toFixed(2)} motion ${r.motion.toFixed(2)} sides ${r.sides.toFixed(2)} vis ${r.vis.toFixed(2)}`));});}
