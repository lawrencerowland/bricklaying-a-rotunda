'use strict';
const assert=require('node:assert/strict'),D=require('../apps/constructive-state/continuous-core.js');
const close=(a,b,eps=1e-7)=>assert.ok(Math.abs(a-b)<eps,`${a} != ${b}`);
let checks=0;
for(const policy of ['steady','taper','hold'])for(const speed of [-2,-.8,0,.8,2])for(const feed of [.05,.1,.25])for(const angle of [0,30,359,360]){
 const c=D.config({policy,speed,feed,angle});
 for(let j=0;j<=20;j++){
  const t=j*D.horizon(c)/20,x=D.solution(t,c),v=D.section(x,c),i=D.input(x,c);
  assert.deepEqual(D.project(v),x);assert.deepEqual(v,D.update(x,i));
  const a=D.tangent(x,v),e=D.embed(x);close(a[0]*e[0]+a[1]*e[1],0);close(Math.hypot(e[0],e[1]),1);
  const dt=1e-5,next=D.solution(t+dt,c);close((next.theta-x.theta)/dt,speed,1e-7);close((next.w-x.w)/dt,v.q,1e-6);
  assert.ok(v.q>=0);close(D.wrap(x.theta),D.wrap(x.theta+8*Math.PI));
  checks++;
 }
 const last=D.solution(D.horizon(c),c);
 if(policy==='steady'){close(last.w,1);close(D.firstHit(c),1/feed);assert.ok(D.solution(.999/feed,c).w<1);}
 else{assert.equal(D.firstHit(c),Infinity);close(last.w,policy==='taper'?.8:0);}
}
for(const raw of [{feed:0},{feed:Infinity},{speed:NaN},{angle:-1},{policy:'invented'}])assert.throws(()=>D.config(raw));
console.log(JSON.stringify({continuousCases:checks,checks:'exact solutions, derivatives, tangency, section law, closure, first-hit, seam, validation'}));
