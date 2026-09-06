const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(process.argv[2]||require('node:path').join(__dirname,'../apps/offshore_wind_maintenance_lens_copy.html'),'utf8');
const js=source.match(/<script>([\s\S]*?)<\/script>/)[1].replace("window.addEventListener('DOMContentLoaded', init);",'globalThis.review={computeSafeStarts,findFirstSafeWithin,simulateFIFO,simulateOpportunistic,normalizeTasks,precomputeSafeByDoping,buildStepSeries,parseWavePayload,validateWave};');
const sandbox={window:{addEventListener(){}},console};vm.createContext(sandbox);vm.runInContext(js,sandbox);const R=sandbox.review;
const H=3600000,T=Date.parse('2025-06-08T00:00:00Z');let checks=0;
function ok(x,message){assert.ok(x,message);checks++;}
function eq(a,b,message){assert.equal(JSON.stringify(a),JSON.stringify(b),message);checks++;}
function task(id,start,end,doping=0){return R.normalizeTasks([{id,name:id,doping,earliestStartISO:new Date(T+start*H).toISOString(),latestEndISO:new Date(T+end*H).toISOString()}])[0];}
function cfg(duration=3,step=1){return {windowHours:duration,stepHours:step,dopingRules:{0:{hsMax:1,cooldownHours:0},1:{hsMax:.7,cooldownHours:2}}};}
function wave(values,step=1){return values.map((hs,i)=>({t:T+i*step*H,hs}));}
const calm=wave(Array(24).fill(.5));
eq(R.simulateOpportunistic([task('impossible',.5,3.5),task('available',1,4)],calm,cfg(),R.precomputeSafeByDoping(calm,cfg())).find(p=>p.id==='available').chosenStartMs,T+H,'Round to the grid before checking newly released tasks');
for(const policy of ['simulateFIFO','simulateOpportunistic']){
 eq(R[policy]([task('exact',0,3)],calm,cfg(),R.precomputeSafeByDoping(calm,cfg()))[0].chosenStartMs,T,'Exact inclusive completion deadline');
 eq(R[policy]([task('offgrid',.5,3.5)],calm,cfg(),R.precomputeSafeByDoping(calm,cfg()))[0].status,'unscheduled','Rounded-up start would miss deadline');
 eq(R[policy]([],calm,cfg(),R.precomputeSafeByDoping(calm,cfg())),[],'Empty task set');
}
eq(R.computeSafeStarts(wave([.5,2,.5,.5],3),4,3,1)[0],false,'Known unsafe sample within non-divisible window');
eq(R.computeSafeStarts(wave([.5,.5],3),6,3,1),[true,false],'Whole forecast interval coverage and inclusive end');
for(const hs of [[null,...Array(11).fill(.5)],['.5',...Array(11).fill(.5)],[NaN,...Array(11).fill(.5)],[-1,...Array(11).fill(.5)]]){
 assert.throws(()=>R.parseWavePayload({startISO:new Date(T).toISOString(),stepHours:1,hs}));checks++;
}
assert.throws(()=>R.parseWavePayload({startISO:new Date(T).toISOString(),stepHours:1,hs:Array(12).fill(.5),timestamps:[]}));checks++;
assert.throws(()=>R.validateWave([{t:T,hs:.5},{t:T+2*H,hs:.5}],1));checks++;
eq(R.parseWavePayload({startISO:new Date(T).toISOString(),stepHours:.5,hs:Array(12).fill(.5)}).wave.length,12,'Fractional regular sample grid');
const series=R.buildStepSeries([{...task('p',0,3),chosenStartMs:T,status:'scheduled'}],calm,cfg());
eq(series.slice(0,3),[{t:T,y:0},{t:T+3*H,y:0},{t:T+3*H,y:1}],'Completed tasks change only at finish');
// Independent half-open-bin oracle, deliberately expressed as interval intersections.
function safeAt(samples,start,end,limit,step){
 const horizon=samples.at(-1).t+step*H;if(end>horizon)return false;
 return samples.every(p=>!(p.t<end && p.t+step*H>start) || p.hs<=limit);
}
function referenceOpportunistic(tasks,W,C){
 const pending=new Map(tasks.map(t=>[t.id,t])),out=new Map(tasks.map(t=>[t.id,null]));let ready=-Infinity;
 for(const sample of W){
  if(sample.t<ready)continue;
  const candidates=[...pending.values()].filter(t=>sample.t>=t.earliestStartMs && sample.t+C.windowHours*H<=t.latestEndMs && safeAt(W,sample.t,sample.t+C.windowHours*H,C.dopingRules[t.doping].hsMax,C.stepHours)).sort((a,b)=>a.latestEndMs-b.latestEndMs||a.earliestStartMs-b.earliestStartMs);
  if(!candidates.length)continue;const chosen=candidates[0];out.set(chosen.id,sample.t);pending.delete(chosen.id);ready=sample.t+(C.windowHours+C.dopingRules[chosen.doping].cooldownHours)*H;
 }
 return [...out].sort((a,b)=>a[0].localeCompare(b[0]));
}
let states=0;
for(const step of [.5,1,2,3,6])for(const duration of [1,3,4,7,12])for(let seed=0;seed<12;seed++){
 const C=cfg(duration,step),W=wave(Array.from({length:36},(_,i)=>((i*13+seed*7)%17)/10),step);
 const actual=R.computeSafeStarts(W,duration,step,1);
 eq(actual,W.map(p=>safeAt(W,p.t,p.t+duration*H,1,step)),'Independent safe-window oracle');states+=W.length;
 const tasks=[task('a',.5,18,0),task('b',2.25,35,1),task('c',12,60,0)];
 const safe=R.precomputeSafeByDoping(W,C);
 eq(R.simulateOpportunistic(tasks,W,C,safe).map(p=>[p.id,p.chosenStartMs]).sort((a,b)=>a[0].localeCompare(b[0])),referenceOpportunistic(tasks,W,C),'Independent grid-scanning opportunistic policy');
 for(const policy of ['simulateFIFO','simulateOpportunistic']){
  const plan=R[policy](tasks,W,C,safe),scheduled=plan.filter(p=>p.status==='scheduled').sort((a,b)=>a.chosenStartMs-b.chosenStartMs);
  let crewReady=-Infinity;
  for(const p of scheduled){
   ok(p.chosenStartMs>=p.earliestStartMs && p.chosenStartMs+duration*H<=p.latestEndMs,'Every scheduled task meets its full interval');
   ok(p.chosenStartMs>=crewReady,'Crew visit/cooldown do not overlap');
   ok(safeAt(W,p.chosenStartMs,p.chosenStartMs+duration*H,C.dopingRules[p.doping].hsMax,step),'Every scheduled visit passes independent weather check');
   crewReady=p.chosenStartMs+(duration+C.dopingRules[p.doping].cooldownHours)*H;
  }
 }
}
ok(!/sheaf|gluing/i.test(source),'Removed all sheaf/gluing language');
console.log(JSON.stringify({status:'PASS',checks,sampledStartsCompared:states,scope:'300 parameter configurations; both heuristics checked for schedule validity, not optimality'}));
