'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),os=require('node:os');
(async()=>{
 const base=process.argv[2]||'http://127.0.0.1:8767/',browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1440,height:1150}}),errors=[];
 page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));
 const ready=()=>page.waitForFunction(()=>document.getElementById('status')?.textContent.includes('Model constructed.'));
 const equalState=async()=>{assert.equal(await page.locator('#site-position').inputValue(),await page.locator('#position').inputValue());assert.equal(await page.locator('.site-sector.placed').count(),await page.locator('#rings .brick.done, #rings .brick.cool').count());};
 try{
  await page.goto(new URL('apps/constructive-state/#site',base).href);await ready();
  await page.getByRole('button',{name:'Pause scene',exact:true}).click();await equalState();
  assert.equal(await page.locator('.site-hoist').count(),1);assert(await page.locator('#panel-site').isVisible());assert(await page.locator('#settings').isHidden());
  const img=await page.request.get(new URL('apps/constructive-state/hilltop.png',base).href);assert.equal(img.status(),200);
  const frozen=await page.locator('#site-art').innerHTML();await page.waitForTimeout(250);assert.equal(await page.locator('#site-art').innerHTML(),frozen);
  await page.screenshot({path:path.join(os.tmpdir(),'120-scene-desktop.png'),fullPage:true});
  await page.getByRole('button',{name:'Play scene',exact:true}).click();const before=await page.locator('#site-position').inputValue();await page.waitForFunction(v=>document.getElementById('site-position').value!==v,before);await page.getByRole('button',{name:'Pause scene',exact:true}).click();await equalState();
  await page.getByRole('button',{name:'Inspect this moment →',exact:true}).click();assert(await page.locator('#panel-build').isVisible());assert(await page.locator('#settings').isVisible());
  await page.getByLabel('Hoists available').selectOption('2');await page.getByRole('button',{name:'Construct model',exact:true}).click();await ready();await page.getByRole('button',{name:'Picture the site',exact:true}).click();
  assert.equal(await page.locator('.site-hoist').count(),2);assert.match(await page.locator('#site-title').innerText(),/Two available hoists/);await equalState();
  await page.getByRole('button',{name:'Replay from start',exact:true}).click();await page.getByRole('button',{name:'Pause scene',exact:true}).click();
  assert.equal(await page.locator('#site-position').inputValue(),'0');assert.equal(await page.locator('.site-sector.placed').count(),0);
  await page.getByLabel('Scene position').focus();await page.keyboard.press('End');assert.equal(await page.locator('#site-position').inputValue(),'22');assert.equal(await page.locator('.site-sector.placed').count(),16);assert.match(await page.locator('#site-caption').innerText(),/complete and cured/);
  await page.getByRole('button',{name:'Play scene',exact:true}).click();await page.waitForFunction(()=>document.getElementById('site-position').value==='0');await page.getByRole('button',{name:'Pause scene',exact:true}).click();
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(os.tmpdir(),'120-scene-mobile.png'),fullPage:true});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await ready();assert.equal(await page.locator('#site-play').innerText(),'Play scene');const still=await page.locator('#site-art').innerHTML();await page.waitForTimeout(250);assert.equal(await page.locator('#site-art').innerHTML(),still);
  await page.getByRole('button',{name:'Inspect this moment →',exact:true}).click();await page.getByLabel('Access to ring B').selectOption('true');await page.getByRole('button',{name:'Construct model',exact:true}).click();await ready();await page.getByRole('button',{name:'Picture the site',exact:true}).click();assert(await page.locator('#site-play').isDisabled());assert.match(await page.locator('#site-b').innerText(),/Access closed/);assert.match(await page.locator('#site-caption').innerText(),/no completion route/);
  assert.deepEqual(errors,[]);console.log(JSON.stringify({result:'PASS',base,checks:'deep link; same model/replay; auto-loop; pause/resume; restart; scrub; exact moment handoff; one/two hoists; settings/reload; reduced motion; blocked access; mobile width',pageErrors:errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
