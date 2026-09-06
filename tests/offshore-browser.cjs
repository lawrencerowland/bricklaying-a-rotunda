const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});const context=await browser.newContext({viewport:{width:1440,height:1050},permissions:['clipboard-read','clipboard-write']});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(process.argv[2]||'http://127.0.0.1:8767/apps/offshore_wind_maintenance_lens_copy.html');
 const A=async(condition,message)=>assert.ok(await condition,message);
 async function exportResult(){const wait=page.waitForEvent('download');await page.locator('#exportBtn').click();const d=await wait;return JSON.parse(fs.readFileSync(await d.path(),'utf8'));}
 async function importHs(hs){await page.locator('#tabData').click();await page.locator('#importBox').fill(JSON.stringify({startISO:'2025-06-08T00:00:00Z',stepHours:1,hs}));await page.locator('#importBtn').click();await page.locator('#tabDash').click();}
 await page.locator('#runBtn').click();await A(page.locator('#kpiFeasible').innerText().then(x=>x==='3 / 3'),'Preset schedules three visits');
 await importHs(Array(1080).fill(.25));const first=await exportResult();assert.equal(first.meta.scenario,'imported');
 await page.locator('#policy').selectOption('opportunistic');await page.locator('#windowHrs').fill('4');await page.locator('#windowHrs').blur();const changed=await exportResult();assert.equal(changed.meta.scenario,'imported');assert.deepEqual(changed.inputs.wave,first.inputs.wave);assert.equal(changed.meta.windowHours,4);
 await A(page.locator('[data-window-label]').evaluateAll(nodes=>nodes.every(n=>n.textContent==='4-hour')),'Window labels reflect input');
 const occupancy=await page.locator('#kpiWeatherUtil').innerText();await page.locator('#vizDoping').selectOption('2');assert.equal(await page.locator('#kpiWeatherUtil').innerText(),occupancy,'View threshold cannot change occupancy');
 await importHs([null,...Array(11).fill(.25)]);await A(page.locator('#importFeedback').innerText().then(x=>x.includes('rejected')),'Null import rejected');assert.deepEqual((await exportResult()).inputs.wave,first.inputs.wave);
 await page.locator('#taskTable button[data-action="remove"]').last().click();await page.locator('#taskTable button[data-action="remove"]').last().click();
 await page.locator('#windowHrs').fill('3');await page.locator('#windowHrs').blur();
 const start=page.locator('#taskTable [data-field="earliestStartISO"]'),end=page.locator('#taskTable [data-field="latestEndISO"]');
 await start.fill('2025-06-08T00:30');await start.blur();await end.fill('2025-06-08T03:30');await end.blur();await page.locator('#taskTable [data-field="doping"]').selectOption('0');
 assert.equal((await exportResult()).output.plan[0].status,'unscheduled','Off-grid finish outside deadline rejected');
 await start.fill('2025-06-08T00:00');await start.blur();await end.fill('2025-06-08T03:00');await end.blur();await page.locator('#policy').selectOption('fifo');assert.equal((await exportResult()).output.plan[0].chosenStartISO,'2025-06-08T00:00:00Z','Exact fit works in FIFO');
 await start.fill('');await start.blur();await A(page.locator('#validationMessage').isVisible(),'Blank task date explained');await A(page.locator('#exportBtn').isDisabled(),'Stale export unavailable');await start.fill('2025-06-08T00:00');await start.blur();await A(page.locator('#validationMessage').isHidden(),'Correction recomputes');
 await page.locator('#tabData').click();await page.locator('#copyTemplateBtn').click();const template=await page.evaluate(()=>navigator.clipboard.readText());assert.ok(JSON.parse(template).hs.length>=10);await page.locator('#importBox').fill(template);await page.locator('#importBtn').click();await A(page.locator('#importFeedback').innerText().then(x=>x.startsWith('Imported ')),'Copied template is accepted');
 await page.locator('#copyPythonBtn').click();const helper=await page.evaluate(()=>navigator.clipboard.readText());assert.ok(helper.includes('pt = ds[var]') && helper.includes('json.dumps') && helper.includes('np.allclose'));fs.writeFileSync('/private/tmp/120-offshore-helper-from-ui.py',helper);
 await page.locator('#tabLens').click();await page.locator('#lvl2').click();await A(page.locator('#panelLens').innerText().then(x=>x.includes('batch')&&x.includes('r : S → O')),'Formal scope explicit');
 await page.locator('#tabDash').click();await page.locator('#startDate').fill('');await page.locator('#startDate').blur();await A(page.locator('#validationMessage').isVisible(),'Blank forecast date explained');await page.locator('#resetBtn').click();await page.locator('#runBtn').click();assert.equal(await page.locator('#days').inputValue(),'45');assert.equal(await page.locator('#kpiFeasible').innerText(),'3 / 3','Reset recovers the full preset');
 await page.screenshot({path:'/private/tmp/120-offshore-repaired-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});for(const tab of ['#tabDash','#tabLens','#tabData','#tabAbout']){await page.locator(tab).click();const size=await page.evaluate(()=>({w:innerWidth,scroll:document.documentElement.scrollWidth}));assert.ok(size.scroll<=size.w+1,tab+' fits mobile: '+JSON.stringify(size));}
 await page.locator('#tabDash').click();await page.screenshot({path:'/private/tmp/120-offshore-repaired-mobile.png',fullPage:true});
 await page.reload();await A(page.locator('#sourceReceipt').innerText().then(x=>x.startsWith('Synthetic')),'Reload deliberately restores preset');assert.deepEqual(errors,[]);
 await browser.close();console.log(JSON.stringify({status:'PASS',pageErrors:errors,checks:'preset, import preservation, policy/window change, dynamic labels, invariant occupancy, rejected missing values, deadline boundaries, blank-date recovery, export download, copied template import, formal tab, mobile four tabs, refresh boundary'}));
})().catch(e=>{console.error(e);process.exit(1)});
