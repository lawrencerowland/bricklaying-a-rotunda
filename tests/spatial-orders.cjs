'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),http=require('node:http');

const dir=require('node:path').join(__dirname,'../apps');

const html=fs.readFileSync(dir+'/Trajectories.html','utf8');
assert(!/sheaf|manifold|global section|tangent|vector field|spiral/i.test(html),'unsupported terminology remains');
assert.equal((html.match(/<script>/g)||[]).length,1);
const code=html.slice(html.indexOf('  function generatePath('),html.indexOf('  // ---------- renderer ----------'));
const generate=new Function(code+'\nreturn generatePath;')();
const patterns=['clockwise','anticlockwise','alternating','staggered'];
let positions=0;
for(const L of [6,10,14,18])for(const N of [12,18,20,24,30]){
 const results={};
 for(const p of patterns){
  const route=results[p]=generate(p,L,N);assert.equal(route.length,L*N);
  for(let l=0;l<L;l++){
   const slice=route.slice(l*N,(l+1)*N);
   const phase=p==='staggered'&&l%2===1?.5:0;
   const labels=slice.map(point=>{
    assert.equal(point.level,l);
    const slot=point.angle*N/(2*Math.PI)-phase;
    assert(Math.abs(slot-Math.round(slot))<1e-10);
    positions++;return ((Math.round(slot)%N)+N)%N;
   });
   assert.equal(new Set(labels).size,N);
   const direction=p==='anticlockwise'||((p==='alternating'||p==='staggered')&&l%2===1)?-1:1;
   const expected=Array.from({length:N},(_,i)=>direction===1?i:p==='anticlockwise'?(N-i)%N:N-1-i);
   assert.deepEqual(labels,expected);
  }
 }
 for(let i=0;i<patterns.length;i++)for(let j=i+1;j<patterns.length;j++)assert.notDeepEqual(results[patterns[i]],results[patterns[j]]);
}
console.log(JSON.stringify({test:'independent order/layout oracle',parameterCombinations:20,patterns:4,positions,result:'PASS'}));
