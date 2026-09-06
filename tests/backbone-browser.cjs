const assert=require('node:assert/strict'),{chromium}=require('playwright');
const asset=process.argv[2] || 'http://127.0.0.1:8767/apps/Lens-plus-arena-backbone.html';
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:1000},acceptDownloads:true}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(asset);await page.waitForTimeout(3600);
  assert.equal(await page.evaluate(()=>window.__canvasStatus),'ready');assert.equal(await page.locator('.fallbackBox').count(),0);
  async function fill(id,value){await page.locator('#'+id).fill(String(value));}
  async function data(button){await page.locator('#'+button).click();return JSON.parse(await page.locator('#exportBox').inputValue());}
  let initial=await data('exportBrick');assert(initial.analytics.totalPlans>0);
  await page.locator('#brickLegacy1').click();let one=await data('exportBrick');assert.equal(one.model.offset,0);assert.equal(one.model.switchPenalty,0);assert.equal(one.model.includeFinalCure,false);assert.equal(one.model.policy,'any');
  await fill('brickN',2);await page.locator('#brickLegacy2').click();await page.locator('#brickPolicy').selectOption('alt');await fill('brickNumericDoping','[3,3]');await page.locator('#brickCompute').click();
  let two=await data('exportBrick');assert.equal(two.analytics.totalPlans,1);assert.deepEqual(two.bestPlan.dirs,[1,-1]);assert.equal(two.analytics.cureTotal,4);
  await page.locator('#brickDirectionRule').selectOption('doping');await page.locator('#dopingGrid select').nth(0).selectOption('1');
  let impossible=await data('exportBrick');assert.equal(impossible.analytics.totalPlans,0);assert.equal(impossible.bestPlan,null);assert(await page.locator('#brickAnimateBest').isDisabled());assert(await page.locator('#brickAnimateRandom').isDisabled());
  await fill('brickNumericDoping','[2,"bad"]');await page.locator('#brickCompute').click();assert(await page.locator('#brickValidation').isVisible());assert.equal(await page.locator('#brickNumericDoping').inputValue(),'[2,"bad"]');
  await fill('brickNumericDoping','[-1.5,3]');await page.locator('#brickDirectionRule').selectOption('free');await page.locator('#brickPolicy').selectOption('ccw');await fill('brickB',6);await page.locator('#brickCompute').click();
  const logBefore=await page.locator('#brickLog').innerText();const dlPromise=page.waitForEvent('download');await page.locator('#exportBrickLog').click();assert.equal((await dlPromise).suggestedFilename(),'brick-event-log.txt');assert.equal(await page.locator('#brickLog').innerText(),logBefore);
  await page.locator('#brickAnimateBest').click();await page.waitForTimeout(60);await page.locator('#brickPause').click();assert.equal(await page.locator('#brickPause').innerText(),'Resume');await page.locator('#brickPause').click();await page.waitForFunction(()=>document.getElementById('brickLog').textContent.includes('Done.'),{timeout:10000});
  const finished=await page.locator('#brickLog').innerText();assert(finished.includes('Built course 1 (CCW)'));assert(finished.includes('Built course 2 (CCW)'));
  await fill('brickN','1.5');await page.locator('#brickCompute').click();assert(await page.locator('#brickValidation').isVisible());
  await fill('circTheta0',90);await fill('circOmega',45);await fill('circPhi',0);await fill('circDelta',30);await fill('circT',10);await page.locator('#circCompute').click();
  let circle=await data('exportCircle');assert.deepEqual(circle.crossingsAfterZero.exits.map(t=>Number(t.toFixed(3))),[6.667,14.667,22.667,30.667,38.667]);
  await fill('circTheta0',0);await fill('circOmega',-45);await fill('circDelta',180);await page.locator('#circCompute').click();circle=await data('exportCircle');assert.deepEqual(circle.windows.map(w=>[w.tIn,w.tOut]),[[0,10]]);assert.equal(circle.crossingsAfterZero.entries.length,0);
  await fill('circOmega',0);await fill('circDelta',20);await page.locator('#circCompute').click();circle=await data('exportCircle');assert.equal(circle.windows.length,1);
  await fill('circOmega','');await page.locator('#circCompute').click();assert(await page.locator('#circleValidation').isVisible());
  await fill('circOmega',45);await page.locator('#circCompute').click();await page.locator('#circAnimate').click();await page.waitForTimeout(80);await page.locator('#circAnimate').click();await page.waitForTimeout(80);await page.locator('#circPause').click();assert.equal(await page.locator('#circPause').innerText(),'Resume');await page.locator('#circReset').click();
  const mobile=[];for(const width of [390,320]){await page.setViewportSize({width,height:844});const dimensions=await page.evaluate(()=>({viewport:innerWidth,scroll:document.documentElement.scrollWidth}));assert(dimensions.scroll<=width,JSON.stringify(dimensions));mobile.push(dimensions);}
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/private/tmp/120-backbone-mobile.png',fullPage:true});
  await page.setViewportSize({width:1280,height:1000});await page.screenshot({path:'/private/tmp/120-backbone-desktop.png',fullPage:true});
  assert.deepEqual(errors,[]);console.log(JSON.stringify({result:'PASS',bootAndWatchdog:true,legacyPresets:true,infeasiblePolicy:true,validation:true,animation:true,eventLogDownload:true,crossings:true,mobile,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
