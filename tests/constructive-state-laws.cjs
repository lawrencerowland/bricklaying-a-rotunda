'use strict';
const assert = require('node:assert/strict');
const C = require('../apps/constructive-state/core.js');
let checks = 3;
assert.equal(C.poolTick(1,0,1,1),0);
assert.throws(()=>C.poolTick(1,2,1,1));
assert.throws(()=>C.poolTick(0,0,1,1));

const m=C.analyse();
assert.deepEqual(m.p.rounds.map(x=>x.count),[729,3377,3480,3508]);
assert.equal(m.solution.distance[m.p.of[0]],34);
// Independent combinatorial count: 16 allowed connected cyclic orders per
// course, four courses, 592 admissible no-idle A/B task interleavings ending A.
let interleavings=0;
for(let bits=0;bits<(1<<16);bits++) if(C.pop(bits)===8 && (bits&(1<<15))) {
  const a=[], b=[]; for(let i=0;i<16;i++) ((bits&(1<<i))?a:b).push(i);
  if(a[4]-a[3]>=2 && b[4]-b[3]>=3) interleavings++;
}
assert.equal(interleavings,592);
assert.equal(m.solution.counts[m.p.of[0]],BigInt(interleavings)*16n**4n);
const alt=C.graph({...C.defaults,capacity:2});
let witness=null;
outer:for(const group of m.p.groups)for(let i=0;i<group.length;i++)for(let j=i+1;j<group.length;j++){
  const a=alt.lookup.get(C.key(m.g.states[group[i]])),b=alt.lookup.get(C.key(m.g.states[group[j]]));
  if(a===undefined||b===undefined)continue;
  if(C.key(alt.edges[a].map(e=>e.action))!==C.key(alt.edges[b].map(e=>e.action))){witness={a,b,oldA:group[i],oldB:group[j]};break outer;}
}
assert(witness,'no change-of-wiring counterexample found');
const p2=C.refine(alt);assert.notEqual(p2.of[witness.a],p2.of[witness.b]);
console.log(JSON.stringify({result:'PASS',resourceLawChecks:checks,contextWitness:witness,interleavings,shortestPaths:m.solution.counts[m.p.of[0]].toString()},null,2));
