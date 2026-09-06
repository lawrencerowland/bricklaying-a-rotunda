'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),os=require('node:os');
(async()=>{
 const base=process.argv[2]||'http://127.0.0.1:8767/',browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1100},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE ERROR',e.message);});
 const text=id=>page.locator('#'+id).innerText(),ready=()=>page.waitForFunction(()=>document.querySelector('#status')?.textContent.includes('Model constructed.'));
 const end=async()=>{await page.locator('#continuous-position').focus();await page.keyboard.press('End');};
 try{
  await page.goto(base);await page.getByRole('link',{name:'Open the constructive state experiment',exact:true}).click();await ready();
  await page.getByRole('button',{name:'Continuous dynamics',exact:true}).click();assert(await page.locator('#panel-continuous').isVisible());assert.equal(await text('stat-time'),'34');
  for(let i=0;i<5;i++){await page.locator('[data-continuous-layer="'+i+'"]').click();assert.equal(await page.locator('[data-continuous-layer="'+i+'"]').getAttribute('aria-pressed'),'true');}
  await end();assert.equal(await text('continuous-progress'),'100.00%');assert.match(await text('continuous-result'),/t = 10.00/);
  await page.getByLabel('Input policy κ').selectOption('taper');assert.match(await text('continuous-receipt'),/not applied/);assert.equal(await text('continuous-progress'),'100.00%');
  await page.getByRole('button',{name:'Apply way',exact:true}).click();assert.equal(await text('continuous-progress'),'0.00%');assert(page.url().includes('cpolicy=taper'));await end();assert.equal(await text('continuous-progress'),'80.00%');assert.match(await text('continuous-result'),/Never reaches/);
  await page.locator('#panel-continuous').screenshot({path:path.join(os.tmpdir(),'120-continuous-desktop.png')});
  const url=page.url();await page.reload();await ready();assert.equal(page.url(),url);assert.equal(await page.getByLabel('Input policy κ').inputValue(),'taper');assert.equal(await text('continuous-progress'),'0.00%');
  await page.getByLabel('Angular rate ω (rad / time)').fill('-0.8');await page.getByLabel('Initial angle θ₀ (degrees)').fill('360');await page.getByRole('button',{name:'Apply way',exact:true}).click();await end();assert.match(await text('continuous-readout'),/-0.80/);
  await page.getByLabel('Input policy κ').selectOption('hold');await page.getByLabel('Angular rate ω (rad / time)').fill('0');await page.getByRole('button',{name:'Apply way',exact:true}).click();await end();assert.equal(await text('continuous-progress'),'0.00%');assert.match(await text('continuous-readout'),/0.00 rad/);
  await page.getByLabel('Base work rate q₀ (work / time)').fill('0');await page.getByRole('button',{name:'Apply way',exact:true}).click();assert.equal(await page.getByLabel('Base work rate q₀ (work / time)').evaluate(e=>e.validity.valid),false);assert(!page.url().includes('cfeed=0&'));
  await page.getByRole('button',{name:'Reset continuous',exact:true}).click();assert.equal(await page.getByLabel('Base work rate q₀ (work / time)').inputValue(),'0.1');
  await page.getByRole('button',{name:'Play trajectory',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#continuous-progress').textContent!=='0.00%');await page.getByRole('button',{name:'Pause trajectory',exact:true}).click();
  await page.getByRole('button',{name:'Build & paths',exact:true}).click();assert.equal(await text('stat-time'),'34');await page.getByRole('button',{name:'Next tick →',exact:true}).click();assert.match(await text('state-caption'),/1\/1 hoists/);
  await page.getByRole('button',{name:'Continuous dynamics',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Play trajectory',exact:true}).count(),1);
  await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile document overflow');await page.locator('#panel-continuous').screenshot({path:path.join(os.tmpdir(),'120-continuous-mobile.png')});
  await page.goto(new URL('apps/constructive-state/?cpolicy=taper&cfeed=NaN#continuous',base).href);await ready();assert.match(await text('continuous-receipt'),/Invalid continuous settings/);assert(page.url().includes('cfeed=NaN'));
  await page.getByRole('button',{name:'Reset continuous',exact:true}).click();assert(!page.url().includes('NaN'));await page.reload();await ready();assert.equal(await page.getByLabel('Input policy κ').inputValue(),'steady');
  assert.deepEqual(errors,[]);console.log(JSON.stringify({result:'PASS',base,checks:'front door; all layers; steady/taper/hold; unapplied changes; apply receipt; find/reload/correct; reverse/zero; validation; pause; finite handoff; mobile; invalid URL recovery',errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
