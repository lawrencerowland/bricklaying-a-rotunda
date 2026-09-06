'use strict';
const C = window.ProjectDynamics, $ = id => document.getElementById(id), fmt = n => Number.isFinite(n) ? n.toLocaleString('en-GB') : 'No route';
let model, trace = [], at = 0, timer = null, selectedMode = 'blueprint', revision = 0;
const form = $('settings');
function stop() { if (timer) clearInterval(timer); timer = null; $('play').textContent = 'Play path'; }
function readSettings() { const result = {}; for (const [k, v] of new FormData(form)) result[k] = k === 'blockedB' ? v === 'true' : Number(v); return C.config(result); }
function fillSettings(c) { for (const [k, v] of Object.entries(c)) if (form.elements.namedItem(k)) form.elements.namedItem(k).value = String(v); }
function writeURL(c) { const url = new URL(location.href); for (const [k, v] of Object.entries(c)) url.searchParams.set(k, String(v)); history.replaceState(null, '', url); }
function showPanel(name) { for (const el of document.querySelectorAll('.panel')) el.hidden = el.id !== 'panel-' + name; for (const b of document.querySelectorAll('[data-panel]')) { if (b.dataset.panel === name) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); } }
document.querySelectorAll('[data-panel]').forEach(b => b.addEventListener('click', () => showPanel(b.dataset.panel)));
function ringHTML(s) {
  const c = model.g.c;
  return s.fronts.map((f, i) => '<article class="ring"><h3>Ring ' + (i ? 'B' : 'A') + '</h3>' + f.masks.map((mask, course) => ({ mask, course })).reverse().map(({ mask, course }) => '<div class="course"><div class="meta"><span>Course ' + (course + 1) + '</span><span>' + (f.cool[course] > 0 ? 'Curing: ' + f.cool[course] + ' ticks' : mask === C.full(c) ? 'Ready' : 'Incomplete') + '</span></div><div class="bricks" style="grid-template-columns:repeat(' + c.bricks + ',1fr)">' + Array.from({ length: c.bricks }, (_, b) => {
    const busy = f.job?.course === course && f.job?.brick === b, placed = Boolean(mask & (1 << b)), cls = busy ? 'busy' : placed ? f.cool[course] ? 'cool' : 'done' : '';
    return '<div class="brick ' + cls + '" title="Brick ' + (b + 1) + ': ' + (busy ? 'in placement' : placed ? 'placed' : 'not placed') + '">' + (b + 1) + (busy ? ' ◷' : '') + '</div>';
  }).join('') + '</div></div>').join('') + '<p class="reservation">' + (f.job ? 'Hoist reserved · ' + f.job.remaining + ' placement tick remaining' : 'No hoist reserved') + '</p></article>').join('');
}
function drawPath(keepPlaying = false) {
  if (!keepPlaying) stop(); $('position').max = Math.max(0, trace.length - 1); $('position').value = at;
  const index = trace[at].state, { g, p, solution } = model, s = g.states[index], d = solution.distance[p.of[index]];
  $('rings').innerHTML = ringHTML(s);
  $('state-caption').textContent = 'State ' + index + ' · sufficient class ' + p.of[index] + ' · ' + C.pop(s.owners) + '/' + g.c.capacity + ' hoists reserved. Courses are unwrapped; positions wrap around each ring.';
  $('action-caption').textContent = g.goals[index] ? 'End delivered in this model: both rings complete, all courses cured, all hoists released.' : Number.isFinite(d) ? (at < trace.length - 1 ? 'Next: ' + C.actionName(trace[at + 1].action) + '. ' : '') + fmt(d) + ' ticks remain on a fastest continuation.' : 'No completion path under these assumptions. Ring B cannot be built while access is closed.';
  $('path-summary').innerHTML = '<p><strong>' + (Number.isFinite(solution.distance[p.of[trace[0].state]]) ? (trace.length - 1) + ' ticks in this replay' : 'No completion path') + '</strong><br>Position ' + at + ' of ' + (trace.length - 1) + '. Every command advances one shared tick.</p>';
  $('path-table').innerHTML = trace.map((step, i) => '<tr class="' + (i === at ? 'current' : '') + '"><td><button type="button" class="secondary" data-position="' + i + '">' + i + '</button></td><td>' + (i ? C.actionName(step.action) : 'Initial state') + '</td></tr>').join('');
  $('path-table').querySelectorAll('[data-position]').forEach(b => b.addEventListener('click', () => { at = Number(b.dataset.position); drawPath(); }));
  $('back').disabled = at === 0; $('next').disabled = at === trace.length - 1; $('play').disabled = trace.length < 2;
  $('manual').innerHTML = g.edges[index].map((e, i) => '<option value="' + i + '">' + C.actionName(e.action) + '</option>').join('');
  $('take').disabled = g.edges[index].length === 0;
}
function witnessCard(i, title, action) {
  const { g, p, solution } = model, s = g.states[i], enabled = g.edges[i].some(e => e.action === action);
  return '<article class="witness-card"><h3>' + title + ' · state ' + i + '</h3><div class="rings">' + ringHTML(s) + '</div><p>' + (action ? C.actionName(action) + ': <strong class="' + (enabled ? 'good' : 'bad') + '">' + (enabled ? 'admissible' : 'not admissible') + '</strong>.<br>' : '') + 'Completion: ' + (g.goals[i] ? 'already achieved' : fmt(solution.distance[p.of[i]]) + ' ticks away') + '</p><button class="secondary" data-witness="' + i + '">Replay how this state is reached</button></article>';
}
function drawRefinement() {
  const { g, p } = model, w = p.rounds[0].witness;
  $('refinement').innerHTML = '<div class="steps">' + p.rounds.map((r, i) => '<div class="step"><strong>' + fmt(r.count) + '</strong><span>' + (i ? 'after refinement ' + i : 'starting classes') + '</span></div>').join('') + '</div><p class="note">' + (w ? 'Starting summary fails. ' : 'Starting summary already preserves the tested behaviour. ') + 'The stable result has ' + fmt(p.groups.length) + ' classes for ' + fmt(g.states.length) + ' reachable states. All ' + fmt(model.verification.transitions) + ' transitions commute with the quotient; ' + fmt(model.verification.policyLifts) + ' concrete completion-policy moves checked.</p>';
  $('witness').innerHTML = w ? '<h3>One computed failure of the starting summary</h3><p>' + (w.kind === 'enabled' ? 'Same selected summary; a command is admissible in only one state.' : w.kind === 'goal' ? 'Same selected summary; only one has delivered the full end.' : 'Same selected summary; the same command leads to different successor summaries.') + '</p><div class="witness-grid">' + witnessCard(w.a, 'Situation 1', w.action) + witnessCard(w.b, 'Situation 2', w.action) + '</div>' : '<p class="good">No counterexample among the enumerated reachable states for this summary and these rules.</p>';
  $('witness').querySelectorAll('[data-witness]').forEach(b => b.addEventListener('click', () => { trace = C.routeTo(g, Number(b.dataset.witness)); at = trace.length - 1; drawPath(); showPanel('build'); }));
  $('context-result').textContent = '';
}
function drawGlue() {
  const j = model.join;
  $('join-results').innerHTML = '<div class="table-scroll"><table><thead><tr><th>Constructed set</th><th>Size</th><th>Meaning</th></tr></thead><tbody><tr><td>Independent component pairs</td><td>' + fmt(j.rawPairs) + '</td><td>' + j.localA + ' A states × ' + j.localB + ' B states</td></tr><tr><td>Compatible with capacity</td><td>' + fmt(j.compatible) + '</td><td>' + fmt(j.missingInterface) + ' over-reserved pairs excluded</td></tr><tr><td>Reachable from the start</td><td>' + fmt(j.reachable) + '</td><td>' + fmt(j.compatible - j.reachable) + ' compatible tuples have no joint history</td></tr></tbody></table></div>';
  $('orphan').innerHTML = j.orphan ? '<div class="rings">' + ringHTML(j.orphan) + '</div><p class="bad">No path reaches this exact combination of brickwork, timers and reservations.</p>' : '<p class="good">Every compatible tuple is reachable for these parameters. This gap is not forced in every model.</p>';
  checkGlue();
}
function checkGlue() {
  const a = Number($('local-claim').value), h = Number($('pool-claim').value), r = C.glue([{ 'A.reserved': a, 'A.workfront': 'A' }, { 'A.reserved': h, 'pool.capacity': model?.g.c.capacity ?? 1 }]);
  $('glue-result').className = r.compatible ? 'good' : 'bad';
  $('glue-result').textContent = r.compatible ? 'Unique glued assignment. Agreement on these fields only—not legality or reachability.' : 'No glued assignment: A.reserved has contradictory overlap values.';
}
function drawAll() {
  const { g, p, solution, verification } = model;
  $('stat-reachable').textContent = fmt(g.states.length); $('stat-classes').textContent = fmt(p.groups.length); $('stat-time').textContent = fmt(solution.distance[p.of[0]]); $('stat-paths').textContent = solution.counts[p.of[0]].toLocaleString('en-GB');
  $('certificate').innerHTML = '<h3>Certificate for these settings</h3><p class="note">' + fmt(g.states.length) + ' reachable states · ' + fmt(verification.transitions) + ' transitions · ' + fmt(p.groups.length) + ' stable classes · ' + fmt(verification.policyLifts) + ' concrete policy lifts checked. ' + fmt(verification.unreachable) + ' classes cannot reach the goal. Exhaustive finite-model checks, not real-world physics evidence.</p>';
  trace = C.trajectory(g, p, solution, 0, $('preference').value); at = 0; drawPath(); drawRefinement(); drawGlue();
}
function construct(c, urlWarning = false) {
  stop(); const run = ++revision; for (const el of form.elements) el.disabled = true; $('status').textContent = 'Constructing, wiring, refining and solving…'; form.setAttribute('aria-busy', 'true');
  setTimeout(() => {
    if (run !== revision) return;
    try { const candidate = C.analyse(c, selectedMode); model = candidate; if (!urlWarning) writeURL(c); drawAll(); $('status').textContent = (urlWarning ? 'Invalid URL assumptions: defaults used. ' : 'Model constructed. ') + (candidate.solution.distance[candidate.p.of[0]] === Infinity ? 'No completion route under these rules.' : 'Completion policy verified against every reachable state.'); $('receipt').textContent = urlWarning ? 'Defaults are active, but the URL was not overwritten. Construct or Reset to replace invalid URL assumptions.' : 'Applied assumptions are in this URL: reopen it to reconstruct this model. Replay and summary choices reset. No project record or file is created.'; }
    catch (e) { $('status').textContent = 'Model not changed: ' + e.message + (model ? ' Previous result retained.' : ' Reset to retry.'); }
    finally { for (const el of form.elements) el.disabled = false; form.removeAttribute('aria-busy'); }
  }, 20);
}
form.addEventListener('submit', e => { e.preventDefault(); try { construct(readSettings()); } catch (e) { $('status').textContent = 'Not applied: ' + e.message; } });
form.addEventListener('change', () => { $('status').textContent = 'Assumptions edited but not applied. Construct model to replace the current result; the current URL still identifies the applied model.'; });
$('reset').addEventListener('click', () => { selectedMode = 'blueprint'; $('summary').value = 'blueprint'; fillSettings(C.defaults); construct(C.defaults); });
$('refine').addEventListener('click', () => { if (!model) return; stop(); selectedMode = $('summary').value; model.p = C.refine(model.g, selectedMode); model.solution = C.solve(model.g, model.p); model.verification = C.verifyQuotient(model.g, model.p, model.solution); drawAll(); $('status').textContent = 'Summary tested and refined; physical assumptions unchanged.'; });
$('generate').addEventListener('click', () => { if (!model) return; trace = C.trajectory(model.g, model.p, model.solution, 0, $('preference').value); at = 0; drawPath(); });
$('next').addEventListener('click', () => { if (at < trace.length - 1) at++; drawPath(); }); $('back').addEventListener('click', () => { if (at > 0) at--; drawPath(); }); $('start').addEventListener('click', () => { at = 0; drawPath(); }); $('position').addEventListener('input', () => { at = Number($('position').value); drawPath(); });
$('play').addEventListener('click', () => { if (timer) return stop(); if (at === trace.length - 1) at = 0; drawPath(); timer = setInterval(() => { if (at < trace.length - 1) at++; drawPath(true); if (at === trace.length - 1) stop(); }, 700); $('play').textContent = 'Pause'; });
$('take').addEventListener('click', () => { const index = trace[at].state, edge = model.g.edges[index][Number($('manual').value)]; if (!edge) return; const head = trace.slice(0, at + 1); const tail = C.trajectory(model.g, model.p, model.solution, edge.to, $('preference').value); tail[0].action = edge.action; trace = head.concat(tail); at = head.length; drawPath(); });
$('local-claim').addEventListener('change', checkGlue); $('pool-claim').addEventListener('change', checkGlue);
$('context-test').addEventListener('click', () => {
  const base = C.graph({ ...model.g.c, capacity: 1 }), p = C.refine(base), alt = C.graph({ ...model.g.c, capacity: 2 });
  let found = null;
  outer: for (const group of p.groups) for (let i = 0; i < group.length; i++) for (let j = i + 1; j < group.length; j++) {
    const a = alt.lookup.get(C.key(base.states[group[i]])), b = alt.lookup.get(C.key(base.states[group[j]]));
    if (a === undefined || b === undefined) continue;
    const aa = alt.edges[a].map(e => e.action), bb = alt.edges[b].map(e => e.action);
    if (C.key(aa) !== C.key(bb)) { found = { a: base.states[group[i]], b: base.states[group[j]], aa, bb, group: p.of[group[i]] }; break outer; }
  }
  $('context-result').innerHTML = found ? '<p class="note bad">The old class ' + found.group + ' fails under the new wiring. Both detailed states are reachable with two hoists, but their admissible commands differ.</p><div class="witness-grid"><article class="witness-card"><h3>Situation 1</h3><div class="rings">' + ringHTML(found.a) + '</div><p>' + found.aa.map(C.actionName).join('; ') + '</p></article><article class="witness-card"><h3>Situation 2</h3><div class="rings">' + ringHTML(found.b) + '</div><p>' + found.bb.map(C.actionName).join('; ') + '</p></article></div><p>Same one-hoist equivalence class, different two-hoist inputs. Recompute the abstraction after changing the wiring, or prove a stronger interface-preserving replacement. Main model settings have not changed.</p>' : '<p>No enabled-action counterexample found for these parameters. This limited check does not prove arbitrary-context equivalence. Main model unchanged.</p>';
});
let cfg = { ...C.defaults }, invalid = false;
const params = new URL(location.href).searchParams;
for (const name of Object.keys(cfg)) if (params.has(name)) { const value = params.get(name); if (name === 'blockedB') { if (!['true','false'].includes(value)) invalid = true; cfg[name] = value === 'true'; } else cfg[name] = Number(value); }
try { if (invalid) throw Error('Invalid URL flag'); C.config(cfg); } catch (_) { cfg = { ...C.defaults }; invalid = true; }
fillSettings(cfg); construct(cfg, invalid);
