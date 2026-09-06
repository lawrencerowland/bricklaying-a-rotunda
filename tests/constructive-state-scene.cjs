'use strict';
const assert=require('node:assert/strict'),C=require('../apps/constructive-state/core.js'),V=require('../apps/constructive-state/scene.js');
let frames=0;
for(const duration of [1,2])for(const capacity of [1,2]){
 const c=C.config({bricks:4,courses:2,duration,capacity}),g=C.graph(c);
 for(let i=0;i<g.states.length;i++){
  const s=g.states[i],expected=s.fronts.reduce((n,f)=>n+f.masks.reduce((sum,m)=>sum+C.pop(m),0),0);
  const edges=g.edges[i].length?g.edges[i]:[{action:null}];
  for(const edge of edges)for(const phase of [0,.5,.99]){
   const f=V.frame(s,c,{nextAction:edge.action,phase});
   assert.equal(f.placed,expected);assert(f.lifting<=capacity);
   assert.equal((f.markup.match(/class="site-hoist"/g)||[]).length,capacity);
   assert.equal((f.markup.match(/class="site-sector placed"/g)||[]).length,expected);
   assert(!f.markup.includes('NaN'));assert(!f.markup.includes('undefined'));frames++;
  }
 }
}
console.log(JSON.stringify({result:'PASS',frames,checks:'projected masonry equals masks; active lifts respect capacity; visible hoist count; valid coordinates; duration-one and duration-two transitions'}));
