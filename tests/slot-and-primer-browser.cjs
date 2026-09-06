'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=require('node:path').join(__dirname,'../apps');
const base=process.argv[2]||'http://127.0.0.1:8767/';
const files=['toy_project_dynamics_lenses_demo.html','Possible-trajectories1.html'];
const parse={};
for(const file of files){
 try{for(const m of fs.readFileSync(root+'/'+file,'utf8').matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);parse[file]='PASS';}
 catch(e){parse[file]=e.message;}
}
console.log(JSON.stringify({syntax:parse}));
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(new URL('apps/Possible-trajectories1.html',base).href);
  await page.waitForFunction(()=>window.__canvasStatus==='ready');
  const layout=()=>page.evaluate(()=>({viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,overflows:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>({tag:e.tagName,id:e.id,class:e.className,right:e.getBoundingClientRect().right})).slice(0,10)}));
  console.log(JSON.stringify({essay:12,case:'default390px',...await layout()}));
  await page.getByLabel('Courses',{exact:true}).fill('3');await page.getByLabel('Courses',{exact:true}).press('Tab');
  await page.getByLabel('Bricks/course',{exact:true}).fill('6');await page.getByLabel('Bricks/course',{exact:true}).press('Tab');
  await page.getByRole('button',{name:'Lay next course ↻ cw',exact:true}).click();
  await page.getByRole('button',{name:'Step course',exact:true}).click();
  await page.getByLabel('Policy',{exact:true}).selectOption('random');
  await page.getByLabel('P(cw)',{exact:true}).fill('0');
  await page.getByRole('button',{name:'Step course',exact:true}).click();
  await page.getByRole('button',{name:'Step course',exact:true}).click();
  const model=await page.evaluate(()=>({path:document.querySelector('#trajString').textContent,analytics:document.querySelector('#analyticsKv').textContent,progress:document.querySelector('#progressText').textContent,body:document.body.innerText}));
  assert.equal(model.path,'↻↺↺');assert(model.analytics.includes('All unrestricted direction histories8'));assert(!model.analytics.includes('vector field'));
  assert(model.body.includes('Random mode is a stochastic rule'));
  console.log(JSON.stringify({essay:12,case:'count and policy semantics',result:'PASS',path:model.path,analytics:model.analytics}));
  await page.getByLabel('Courses',{exact:true}).fill('40');await page.getByLabel('Courses',{exact:true}).press('Tab');
  await page.getByLabel('Bricks/course',{exact:true}).fill('72');await page.getByLabel('Bricks/course',{exact:true}).press('Tab');
  assert((await layout()).documentWidth<=390);console.log(JSON.stringify({essay:12,case:'maximum40courses390px',...await layout()}));
  await page.screenshot({path:'/private/tmp/120-12-max-mobile-check.png',fullPage:true});
  if(parse[files[0]]!=='PASS'){console.log(JSON.stringify({essay:6,result:'BLOCKED BY SYNTAX',reason:parse[files[0]]}));return;}
  await page.setViewportSize({width:1440,height:1000});
  await page.addInitScript(()=>{
   const original=CanvasRenderingContext2D.prototype.arc;
   window.__readArcs=[];
   CanvasRenderingContext2D.prototype.arc=function(...args){
    if(this.canvas.id==='slotCanvas')window.__readArcs.push({args,lineWidth:this.lineWidth,strokeStyle:this.strokeStyle,fillStyle:this.fillStyle});
    return original.apply(this,args);
   };
  });
  await page.goto(new URL('apps/toy_project_dynamics_lenses_demo.html',base).href);
  await page.getByRole('button',{name:'Slot observation (continuous)',exact:true}).click();
  const tau=2*Math.PI,mod=x=>((x%tau)+tau)%tau;
  let simulations=0,points=0;
  const configs=[];
  for(const [center,width] of [[90,30],[0,45],[350,45],[180,90],[-90,45],[90,360]])for(const omega of [-1.3,0,1.3])for(const offset of [0,180])configs.push({center,width,omega,theta:center+offset});
  for(const c of configs){
   for(const [id,value] of Object.entries({sSlotC:c.center,sSlotW:c.width,sW:c.omega,sTheta0:c.theta,sT:6,sDt:.1}))await page.locator('#'+id).fill(String(value));
   await page.locator('#sRun').click();
   const data=await page.evaluate(()=>({sim:slotModel.sim,intervals:slotModel.intervals,arcs:window.__readArcs.slice(-3)}));
   const arc=data.arcs.find(a=>a.lineWidth===8);assert(arc,'missing green slot arc');
   const [cx,cy,r,a,b,ccw]=arc.args;
   assert.equal(ccw,true);
   for(const p of data.sim){
    const delta=Math.abs(Math.atan2(Math.sin(p.theta-c.center*Math.PI/180),Math.cos(p.theta-c.center*Math.PI/180)));
    const expected=c.width===360||delta<=c.width*Math.PI/360+1e-10;
    assert.equal(Boolean(p.vis),expected,JSON.stringify({c,p,delta}));
    const canvasAngle=-p.theta;
    const drawn=Math.abs(a-b)>=tau-1e-10||mod(a-canvasAngle)<=mod(a-b)+1e-10;
    assert.equal(drawn,expected,JSON.stringify({c,p,arc,drawn,expected}));
    points++;
   }
   const point=data.arcs.find(a=>a.args[2]===8);assert(point);
   assert(Math.abs(point.args[0]-(cx+r*Math.cos(c.theta*Math.PI/180)))<1e-8);
   assert(Math.abs(point.args[1]-(cy-r*Math.sin(c.theta*Math.PI/180)))<1e-8);
   if(c.width===360){assert(data.sim.every(p=>p.vis===1));assert.equal(data.intervals.length,1);assert.equal(data.intervals[0].t0,0);assert.equal(data.intervals[0].t1,6);}
   simulations++;
  }
  await page.locator('#sSlotC').fill('90');await page.locator('#sSlotW').fill('30');await page.locator('#sTheta0').fill('90');await page.locator('#sRun').click();
  await page.screenshot({path:'/private/tmp/120-06-slot-alignment-check.png',fullPage:true});
  console.log(JSON.stringify({essay:6,result:'PASS',simulations,points,fullCircle:true,drawnArcAgreement:true,pointPosition:true,pageErrors:errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
