const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(process.argv[2] || require('node:path').join(__dirname,'../apps/Lens-plus-arena-backbone.html'),'utf8');
const source=html.slice(html.indexOf('  const ModelMath ='),html.indexOf('  function readNumber'));
const box={mod:(a,n)=>((a%n)+n)%n};vm.createContext(box);vm.runInContext(source+';this.api=ModelMath;',box);
const M=box.api,plain=x=>JSON.parse(JSON.stringify(x));let configurations=0;
function oracle(c){
 const plans=[];
 for(let bits=0;bits<2**c.N;bits++){
  const ds=Array.from({length:c.N},(_,k)=>(bits>>k)&1 ? 1:-1);
  if(ds.some((d,k)=>c.policy==='cw'?d!==1:c.policy==='ccw'?d!==-1:c.policy==='alt'?d!==(k%2 ? -1:1):false))continue;
  if(c.directionRule==='doping'&&ds.some((d,k)=>k>0&&(c.doping[k-1]===1?d!==ds[k-1]:c.doping[k-1]===2?d===ds[k-1]:false)))continue;
  plans.push(ds);
 }
 const hist=Array(c.N).fill(0);plans.forEach(ds=>hist[ds.slice(1).reduce((n,d,k)=>n+(d!==ds[k]),0)]++);
 const cures=c.doping.map((d,k)=>c.cureLaw==='numeric'?Math.max(0,Math.round(c.baseCure+c.beta*c.numericDoping[k])):d===1?0:d===2?c.baseCure+c.slowExtra:c.baseCure);
 return {plans,hist,cures,totalCure:cures.reduce((n,d,k)=>n+(!c.includeFinalCure&&k===c.N-1?0:d),0)};
}
for(let N=1;N<=5;N++)for(let d=0;d<3**N;d++)for(const directionRule of ['doping','free'])for(const policy of ['any','cw','ccw','alt'])for(const cureLaw of ['categorical','numeric']){
 const c={N,B:6,offset:0,doping:Array.from({length:N},(_,k)=>Math.floor(d/3**k)%3),baseCure:1,slowExtra:2,switchPenalty:3,includeFinalCure:d%2===0,directionRule,policy,cureLaw,beta:1.5,numericDoping:Array.from({length:N},(_,k)=>k-1.5)};
 const a=plain(M.analytics(c)),o=oracle(c);assert.equal(a.totalPlans,o.plans.length);assert.deepEqual(a.histSwitches,o.hist);assert.deepEqual(a.cureSteps,o.cures);assert.equal(a.cureTotal,o.totalCure);assert.equal(a.courseEventBaseSteps,N+o.totalCure);
 if(o.plans.length){assert(o.plans.some(p=>String(p)===String(a.bestPlan.dirs)));assert.equal(a.bestPlan.minSwitches,o.hist.findIndex(Boolean));for(const r of [0,.42,.999999])assert(o.plans.some(p=>String(p)===String(M.randomPlan(c,()=>r))));}else{assert.equal(a.bestPlan,null);assert.equal(M.randomPlan(c),null);}
 configurations++;
}
const max={N:40,B:240,offset:0,doping:Array(40).fill(0),baseCure:0,slowExtra:0,switchPenalty:0,includeFinalCure:false,directionRule:'doping',policy:'any',cureLaw:'categorical',beta:1,numericDoping:[]};
assert.equal(M.analytics(max).totalPlans,2**40);
assert.deepEqual(plain(M.numericDoping('[-2,0.5,3]',3)),[-2,.5,3]);
for(const raw of ['[]','[1,"2",3]','[1,null,3]','[1,2,]','[1e309,2,3]'])assert.throws(()=>M.numericDoping(raw,3));
assert.throws(()=>M.analytics({...max,cureLaw:'numeric',numericDoping:Array(40).fill(1e30)}));
const old=process.argv[3] ? fs.readFileSync(process.argv[3],'utf8') : require('node:child_process').execFileSync('git',['show','2d31bd3bb8827a0167517089afbd3448b803fab9:apps/dynamic_project_states_demo.html'],{cwd:require('node:path').join(__dirname,'..'),encoding:'utf8'});
const legacy={};vm.createContext(legacy);vm.runInContext(old.slice(old.indexOf('function enumerateTrajectories'),old.indexOf('// Animation / build')),legacy);
let legacyChecks=0;
for(let N=1;N<=5;N++)for(let d=0;d<3**N;d++){
 const c={...max,N,B:48,baseCure:1,slowExtra:2,doping:Array.from({length:N},(_,k)=>Math.floor(d/3**k)%3)};
 const stories=legacy.enumerateTrajectories(N,1,2,c.doping,10000),o=oracle(c),a=M.analytics(c);
 assert.equal(stories.length,a.totalPlans);
 assert.deepEqual(plain(stories.map(s=>s.filter(e=>e.type==='build').map(e=>e.dir).join(',')).sort()),o.plans.map(p=>p.join(',')).sort());
 for(const story of stories){assert.equal(story.reduce((n,e)=>n+(e.type==='build'?1:e.steps),0),a.courseEventBaseSteps);}
 legacyChecks++;
}
const cfg={theta0:90,omega:45,phi:0,delta:30};
assert.deepEqual(plain(M.crossings(cfg).exits.map(t=>Number(t.toFixed(3)))),[6.667,14.667,22.667,30.667,38.667]);
for(const omega of [-720,-45,45,720]){
 const c={...cfg,omega},x=M.crossings(c),period=360/Math.abs(omega);
 for(const values of [x.entries,x.exits])values.forEach((t,i)=>{assert(t>0);if(i)assert(Math.abs(t-values[i-1]-period)<1e-9);});
 for(const t of x.entries){const theta=c.theta0+omega*t;const rel=((theta-(c.phi+(omega>0?-c.delta:c.delta)))%360+360)%360;assert(rel<1e-8||360-rel<1e-8);}
}
assert.equal(M.crossings({...cfg,delta:180}).entries.length,0);assert.equal(M.crossings({...cfg,omega:0}).entries.length,0);
assert(!/sheaf/i.test(html));
console.log(JSON.stringify({result:'PASS',independentModelConfigurations:configurations,legacy1ProjectionConfigurations:legacyChecks,largeCount:2**40,validation:true,signedCrossings:true}));
