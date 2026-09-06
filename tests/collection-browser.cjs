'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const base=process.argv[2]||'http://127.0.0.1:8767/';
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);await page.waitForFunction(()=>document.querySelectorAll('#app-grid .card').length===7);
  const links=await page.locator('#app-grid a.link').evaluateAll(es=>es.map(e=>e.href));
  assert.equal(links.length,7);
  await page.locator('#search').fill('wiring');assert(await page.locator('#app-grid .card').count()<7);
  await page.locator('#clear-search').click();assert.equal(await page.locator('#app-grid .card').count(),7);
  for(const url of links){
   await page.setViewportSize({width:1440,height:1000});
   assert.equal((await page.goto(url)).status(),200);await page.waitForTimeout(3600);
   assert(!/sheaf|presheaf/i.test(await page.content()),'retired construction remains '+url);
   const canvases=await page.locator('canvas').count();
   if(canvases) assert(await page.locator('canvas').first().evaluate(c=>c.width>0&&c.height>0));
   await page.setViewportSize({width:390,height:844});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile overflow '+url);
   console.log('PASS route and mobile:',url);
  }
  const redirects={
   'dynamic_project_states_demo.html':'Lens-plus-arena-backbone.html',
   'feedback%20from%205%20Pro%20on%20Edison.html':'Lens-plus-arena-backbone.html',
   'overview_of_problem.html':'constructive-state/',
   'Possible-trajectories.html':'Possible-trajectories1.html',
   'why-this-matters.html':'index.html',
   'index.html':'index.html'
  };
  for(const [from,to] of Object.entries(redirects)){await page.goto(new URL('apps/'+from,base).href);await page.waitForURL(u=>u.href.endsWith(to));}
  await page.evaluate(()=>localStorage.setItem('dps-disposable-recovery-test','Private disposable note'));
  await page.goto(new URL('apps/overview_of_problem.html',base).href);
  assert(await page.locator('#recovery').isVisible());
  const downloading=page.waitForEvent('download');await page.locator('#download').click();
  const download=await downloading;assert.equal(download.suggestedFilename(),'earlier-worksheet-notes.json');
  const archive=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.equal(archive.values['dps-disposable-recovery-test'],'Private disposable note');
  await page.reload();assert(await page.locator('#recovery').isVisible());
  assert.equal(await page.evaluate(()=>localStorage.getItem('dps-disposable-recovery-test')),'Private disposable note');
  await page.getByRole('link',{name:'Continue to the maintained experiment →',exact:true}).click();
  await page.evaluate(()=>localStorage.removeItem('dps-disposable-recovery-test'));
  await page.goto(new URL('apps/toy_project_dynamics_lenses_notes.html',base).href);assert.equal(await page.locator('h1').count(),1);assert(!/sheaf|presheaf/i.test(await page.content()));
  await page.goto(new URL('apps/wiring_lens_explainer.html',base).href);await page.getByText('Advanced',{exact:true}).click();
  let tuples=0,wirings=0;
  for(const a of ['a','b'])for(const b of ['a','b'])for(const c of ['a','b']){for(const [id,v] of [['f1',a],['f2',b],['f3',c]])await page.locator('#'+id).selectOption(v);assert((await page.locator('#reindexFormula').innerText()).includes(`(x_${a}, x_${b}, x_${c})`));tuples++;}
  for(const o of ['o1','o2'])for(const a of ['I','o1','o2'])for(const b of ['I','o1','o2']){for(const [id,v] of [['wO',o],['wi1',a],['wi2',b]])await page.locator('#'+id).selectOption(v);const s=await page.locator('#lensFormula').innerText();assert(s.includes(`↦ (${o})`));assert(s.includes(`↦ (${a}, ${b})`));wirings++;}
  await page.locator('#toggleComonoid').click();assert(await page.locator('#independentInputs').isHidden());assert(await page.locator('#ordinaryLowerOutput').isHidden());
  await page.locator('#openCheat').click();assert.equal(await page.evaluate(()=>document.activeElement.id),'closeModal');
  await page.keyboard.press('Tab');assert(await page.locator('#modal').evaluate(m=>m.contains(document.activeElement)));await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.activeElement.id),'openCheat');
  assert.deepEqual(errors,[]);console.log(JSON.stringify({result:'PASS',base,essays:links.length,redirects:6,tuples,wirings,pageErrors:errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
