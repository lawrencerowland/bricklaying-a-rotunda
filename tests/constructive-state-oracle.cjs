'use strict';
// Independent finite-state oracle. It uses flat brick occupancy, one active
// placement and one curing clock per installation, not the component model.
// Usage: node 120-independent-oracle.cjs /path/to/core.js
// Alternatively set CORE=/path/to/core.js. No workspace path is embedded.
const corePath = process.env.CORE || process.argv[2];
if (!corePath) throw Error('Supply core.js as the first argument or through the CORE environment variable.');
const M = require(require('node:path').resolve(corePath));
const assert = require('node:assert/strict');

// [A bits, B bits, A cure, B cure, A target, A finish-in, B target, B finish-in]
const zero = () => [0, 0, 0, 0, -1, 0, -1, 0];
const skey = s => s.join(',');
const doneBits = c => (1 << (c.bricks * c.courses)) - 1;
const aid = a => a[0] === null && a[1] === null ? 'wait' : a.map(x => x === null ? '-' : x).join('|');
const parse = id => id === 'wait' ? [null, null] : id.split('|').map(x => x === '-' ? null : x);
const goal = (s, c) => s[0] === doneBits(c) && s[1] === doneBits(c) && s[2] === 0 && s[3] === 0 && s[4] === -1 && s[6] === -1;

function requests(s, c, site) {
  const result = [null], mask = s[site];
  if (s[4 + 2 * site] !== -1 || site === 1 && c.blockedB) return result;
  let floor = 0;
  const ring = (1 << c.bricks) - 1;
  while (floor < c.courses && ((mask >> (floor * c.bricks)) & ring) === ring) floor++;
  if (floor === c.courses || floor > 0 && s[2 + site] !== 0) return result;
  const local = (mask >> (floor * c.bricks)) & ring;
  for (let b = 0; b < c.bricks; b++) {
    if (local & (1 << b)) continue;
    const left = (b + c.bricks - 1) % c.bricks, right = (b + 1) % c.bricks;
    if (local === 0 || (local & (1 << left)) || (local & (1 << right))) result.push(`${floor}:${b}`);
  }
  return result;
}

function next(s, a, c) {
  assert(Array.isArray(a) && a.length === 2, 'oracle requires two commands');
  assert(!goal(s, c), 'oracle goal is terminal');
  // Resource feasibility is decided before any end-of-tick completion.
  let occupied = Number(s[4] !== -1) + Number(s[6] !== -1);
  for (let site = 0; site < 2; site++) {
    assert(requests(s, c, site).includes(a[site]), 'oracle rejects local request');
    occupied += Number(a[site] !== null);
  }
  assert(occupied <= c.capacity, 'oracle rejects hoist over-allocation');
  const n = s.slice();
  for (let site = 0; site < 2; site++) {
    const targetSlot = 4 + 2 * site, finishSlot = targetSlot + 1;
    const elapsedCure = Math.max(0, s[2 + site] - 1);
    let target = s[targetSlot], finish = s[finishSlot];
    if (a[site] !== null) {
      const [course, brick] = a[site].split(':').map(Number);
      target = course * c.bricks + brick;
      finish = c.duration;
    }
    n[2 + site] = elapsedCure;
    if (target !== -1 && finish === 1) {
      n[site] |= 1 << target;
      const course = Math.floor(target / c.bricks);
      const courseBits = ((1 << c.bricks) - 1) << (course * c.bricks);
      if ((n[site] & courseBits) === courseBits) n[2 + site] = site === 0 ? c.cureA : c.cureB;
      n[targetSlot] = -1; n[finishSlot] = 0;
    } else {
      n[targetSlot] = target; n[finishSlot] = target === -1 ? 0 : finish - 1;
    }
  }
  return n;
}

function choices(s, c) {
  if (goal(s, c)) return [];
  const used = Number(s[4] !== -1) + Number(s[6] !== -1), result = [];
  for (const a of requests(s, c, 0)) for (const b of requests(s, c, 1)) {
    if (used + Number(a !== null) + Number(b !== null) <= c.capacity) result.push([a, b]);
  }
  return result;
}

function reference(c) {
  const states = [zero()], lookup = new Map([[skey(states[0]), 0]]);
  const edges = [], depth = [0], ways = [1n], incoming = [[]];
  for (let head = 0; head < states.length; head++) {
    edges[head] = [];
    for (const a of choices(states[head], c)) {
      const s = next(states[head], a, c), k = skey(s);
      let to = lookup.get(k);
      if (to === undefined) {
        to = states.length; lookup.set(k, to); states.push(s);
        depth.push(depth[head] + 1); ways.push(0n); incoming.push([]);
      }
      if (depth[to] === depth[head] + 1) ways[to] += ways[head];
      edges[head].push([aid(a), to]); incoming[to].push(head);
    }
  }
  const finals = states.flatMap((s, i) => goal(s, c) ? [i] : []);
  const distance = states.map(() => Infinity), work = finals.slice();
  for (const i of finals) distance[i] = 0;
  for (let head = 0; head < work.length; head++) {
    const to = work[head];
    for (const from of incoming[to]) {
      if (distance[from] > distance[to] + 1) {
        distance[from] = distance[to] + 1; work.push(from);
      }
    }
  }
  const shortest = finals.length ? Math.min(...finals.map(i => depth[i])) : Infinity;
  const shortestWays = finals.filter(i => depth[i] === shortest).reduce((n, i) => n + ways[i], 0n);
  return { states, edges, lookup, distance, shortest, shortestWays, finals };
}

function flatten(s, c) {
  const flat = zero();
  let expectedOwners = 0;
  for (let site = 0; site < 2; site++) {
    const f = s.fronts[site];
    assert.equal(f.masks.length, c.courses);
    assert.equal(f.cool.length, c.courses);
    const activeClocks = f.cool.filter(x => x > 0);
    assert(activeClocks.length <= 1, 'multiple curing courses at one installation');
    for (let course = 0; course < c.courses; course++) {
      flat[site] |= f.masks[course] << (course * c.bricks);
      flat[2 + site] += f.cool[course];
      if (f.cool[course] > 0) assert.equal(f.masks[course], (1 << c.bricks) - 1);
    }
    if (f.job) {
      flat[4 + 2 * site] = f.job.course * c.bricks + f.job.brick;
      flat[5 + 2 * site] = f.job.remaining;
      expectedOwners += 1 << site;
    }
  }
  assert.equal(s.owners, expectedOwners, 'owner bits differ from unfinished placements');
  return flat;
}

const signature = es => es.map(([a, to]) => [a, to]).sort((a, b) => a[0].localeCompare(b[0]));
const totals = { configurations: 0, fourBrickConfigurations: 0, blockedConfigurations: 0, states: 0, transitions: 0, quotientModes: 0, quotientPolicyLifts: 0, quotientStateChecks: 0, routeChecks: 0, completedRoutes: 0, impossibleRouteChecks: 0, invalidActionChecks: 0, malformedActionChecks: 0, ringAdjacencyChecks: 0, initialBlueprintConflicts: 0, successorRefinementCases: 0, maxStates: 0, maxEdges: 0, elapsedMs: 0 };
const samples = [];

function check(c) {
  const r = reference(c), g = M.graph(c), base = g.states.map(s => flatten(s, c));
  assert.equal(g.states.length, r.states.length, 'reachable state cardinality differs');
  const index = base.map(s => r.lookup.get(skey(s)));
  assert(index.every(i => i !== undefined), 'core generated unreachable state');
  assert.equal(new Set(index).size, r.states.length, 'core state encoding is not one-to-one');
  const coreForOracle = new Map(index.map((referenceIndex, coreIndex) => [referenceIndex, coreIndex]));
  let edgeCount = 0;
  for (let i = 0; i < g.states.length; i++) {
    assert.equal(g.goals[i], goal(base[i], c), 'goal differs');
    assert.deepEqual(signature(g.edges[i].map(e => [e.action, index[e.to]])), signature(r.edges[index[i]]), 'labelled successors differ');
    assert.deepEqual(M.actions(g.states[i], c).map(aid).sort(), choices(base[i], c).map(aid).sort(), 'enabled commands differ');
    edgeCount += g.edges[i].length;
    // Check exported component composition against the independent update as well.
    for (const e of r.edges[index[i]]) {
      const wired = M.wireTick(g.states[i], parse(e[0]), c);
      assert.equal(skey(flatten(wired, c)), skey(r.states[e[1]]), 'wireTick differs from monolithic oracle');
    }
  }
  for (const mode of ['blueprint', 'ready', 'full']) {
    const p = M.refine(g, mode), sol = M.solve(g, p);
    assert.equal(sol.distance[p.of[0]], r.shortest, 'shortest completion differs');
    assert.equal(sol.counts[p.of[0]], r.shortestWays, 'number of shortest labelled trajectories differs');
    if (mode === 'blueprint' && p.rounds[0].witness) totals.initialBlueprintConflicts++;
    if (mode === 'blueprint' && p.rounds.some(x => x.witness?.kind === 'successor')) totals.successorRefinementCases++;
    for (let i = 0; i < g.states.length; i++) {
      totals.quotientStateChecks++;
      const block = p.of[i], rep = p.groups[block][0];
      assert.equal(goal(base[i], c), goal(base[rep], c), 'quotient merges goal/non-goal');
      const projected = r.edges[index[i]].map(([a, to]) => {
        const coreTarget = coreForOracle.get(to);
        assert.notEqual(coreTarget, undefined);
        return [a, p.of[coreTarget]];
      });
      assert.deepEqual(signature(projected), signature(sol.qEdges[block].map(e => [e.action, e.to])), 'quotient projected transitions differ');
      assert.equal(sol.distance[block], r.distance[index[i]], 'quotient per-state distance differs');
      const command = sol.policy[block];
      if (Number.isFinite(r.distance[index[i]]) && r.distance[index[i]] > 0) {
        assert.notEqual(command, null, 'missing policy where a completion path exists');
        const edge = r.edges[index[i]].find(([a]) => a === command);
        assert(edge, 'policy action not executable in concrete oracle state');
        assert.equal(r.distance[edge[1]], r.distance[index[i]] - 1, 'concrete policy does not decrease goal distance');
        totals.quotientPolicyLifts++;
      } else assert.equal(command, null, 'policy provided at goal or impossible state');
    }
    for (const preference of ['A', 'B']) {
      const route = M.trajectory(g, p, sol, 0, preference);
      assert.equal(route.length - 1, Number.isFinite(r.shortest) ? r.shortest : 0);
      let s = zero();
      for (let j = 1; j < route.length; j++) {
        s = next(s, parse(route[j].action), c);
        assert.equal(skey(s), skey(base[route[j].state]), 'renderable route diverges from oracle');
      }
      assert.equal(goal(s, c), Number.isFinite(r.shortest));
      totals.routeChecks++;
      if (Number.isFinite(r.shortest)) totals.completedRoutes++;
      else totals.impossibleRouteChecks++;
    }
    totals.quotientModes++;
    if (mode === 'blueprint' && c.bricks === M.defaults.bricks && c.courses === M.defaults.courses && c.cureA === M.defaults.cureA && c.cureB === M.defaults.cureB) samples.push({ c, isCurrentDefault: Object.keys(c).every(k => c[k] === M.defaults[k]), states: r.states.length, edges: edgeCount, coarse: p.initialPartition.groups.length, refined: p.groups.length, rounds: p.rounds.map(x => x.count), shortest: Number.isFinite(r.shortest) ? r.shortest : 'unreachable', shortestPaths: r.shortestWays.toString() });
  }
  assert.throws(() => M.wireTick(g.states[0], ['9:0', null], c)); totals.invalidActionChecks++;
  assert.throws(() => M.wireTick(g.states[0], ['1:0', null], c)); totals.invalidActionChecks++;
  assert.throws(() => M.wireTick(g.states[0], ['0:9', null], c)); totals.invalidActionChecks++;
  if (c.capacity === 1) { assert.throws(() => M.wireTick(g.states[0], ['0:0', '0:0'], c)); totals.invalidActionChecks++; }
  if (c.blockedB) { assert.equal(r.finals.length, 0); assert.throws(() => M.wireTick(g.states[0], [null, '0:0'], c)); totals.invalidActionChecks++; }
  const releasing = g.states.findIndex(s => s.fronts[0].job?.remaining === 1 && !s.fronts[1].job && requests(flatten(s, c), c, 1).length > 1);
  if (c.capacity === 1 && releasing >= 0) {
    const request = requests(base[releasing], c, 1)[1];
    assert.throws(() => M.wireTick(g.states[releasing], [null, request], c), 'end-of-tick hoist reused too early'); totals.invalidActionChecks++;
  }
  const busy = g.states.findIndex(s => s.fronts[0].job !== null);
  if (busy >= 0) {
    assert.throws(() => M.wireTick(g.states[busy], ['0:0', null], c), 'second placement begun at busy installation'); totals.invalidActionChecks++;
  }
  const placed = g.states.findIndex((s, i) => (s.fronts[0].masks[0] & 1) !== 0 && !g.goals[i]);
  if (placed >= 0) {
    assert.throws(() => M.wireTick(g.states[placed], ['0:0', null], c), 'duplicate placement accepted'); totals.invalidActionChecks++;
  }
  const curing = g.states.findIndex(s => c.courses > 1 && s.fronts[0].cool[0] > 0);
  if (curing >= 0) {
    assert.throws(() => M.wireTick(g.states[curing], ['1:0', null], c), 'next course started before full curing'); totals.invalidActionChecks++;
  }
  if (c.bricks === 4) {
    // On a four-brick ring, the opposite brick is genuinely non-adjacent.
    // Ensure the witness is idle and resource-free, so only geometry can block it.
    const lone = g.states.findIndex(s => s.owners === 0 && s.fronts[0].masks[0] === 1 && s.fronts[1].masks.every(m => m === 0));
    assert(lone >= 0, 'missing lone-brick adjacency witness');
    assert.throws(() => M.wireTick(g.states[lone], ['0:2', null], c), 'opposite brick accepted without an adjacent placed brick');
    totals.ringAdjacencyChecks++; totals.invalidActionChecks++;
    for (const neighbour of ['0:1', '0:3']) {
      const actual = flatten(M.wireTick(g.states[lone], [neighbour, null], c), c);
      assert.equal(skey(actual), skey(next(base[lone], [neighbour, null], c)), 'clockwise/anticlockwise neighbour should be legal');
      totals.ringAdjacencyChecks++;
    }
  }
  for (const i of g.goals.flatMap((x, i) => x ? [i] : [])) { assert.throws(() => M.wireTick(g.states[i], [null, null], c)); totals.invalidActionChecks++; }
  totals.configurations++; totals.blockedConfigurations += Number(c.blockedB);
  totals.fourBrickConfigurations += Number(c.bricks === 4);
  totals.states += r.states.length; totals.transitions += edgeCount;
  totals.maxStates = Math.max(totals.maxStates, r.states.length); totals.maxEdges = Math.max(totals.maxEdges, edgeCount);
}

const started = Date.now(), cases = [];
for (const cureA of [0, 1, 2, 3]) for (const cureB of [0, 1, 2, 3]) for (const duration of [1, 2]) for (const capacity of [1, 2]) cases.push({ bricks: 3, courses: 2, cureA, cureB, duration, capacity, blockedB: false });
for (const cureA of [0, 3]) for (const cureB of [0, 3]) for (const duration of [1, 2]) for (const capacity of [1, 2]) cases.push({ bricks: 3, courses: 2, cureA, cureB, duration, capacity, blockedB: true });
for (const courses of [1, 2]) for (const duration of [1, 2]) for (const capacity of [1, 2]) for (const [cureA, cureB] of [[0, 0], [2, 3]]) cases.push({ bricks: 2, courses, cureA, cureB, duration, capacity, blockedB: false });
// Twelve nontrivial-ring configurations: both capacities, both placement
// durations, zero/asymmetric curing, and an impossible blocked installation.
for (const [cureA, cureB] of [[0, 0], [2, 3], [3, 2]]) for (const capacity of [1, 2]) cases.push({ bricks: 4, courses: 2, cureA, cureB, duration: 2, capacity, blockedB: false });
for (const [cureA, cureB] of [[0, 0], [2, 3]]) for (const capacity of [1, 2]) cases.push({ bricks: 4, courses: 2, cureA, cureB, duration: 1, capacity, blockedB: false });
for (const capacity of [1, 2]) cases.push({ bricks: 4, courses: 2, cureA: 2, cureB: 3, duration: 2, capacity, blockedB: true });
for (const c of cases) {
  try { check(c); }
  catch (error) { console.error(JSON.stringify({ failure: true, config: c, message: error.message, stack: error.stack })); process.exitCode = 1; break; }
  if (totals.configurations % 16 === 0) console.log(JSON.stringify({ progress: totals.configurations, states: totals.states, transitions: totals.transitions }));
}

// These must fail, not merely be reported as robustness observations.
try {
  for (const malformed of [[], [null], [null, null, 'extra'], { 0: null, 1: null }, null, undefined, 'wait']) {
    assert.throws(() => M.wireTick(M.initial(M.defaults), malformed, M.defaults), 'malformed joint-action shape accepted');
    totals.malformedActionChecks++;
  }
} catch (error) {
  console.error(JSON.stringify({ failure: true, phase: 'malformed action guard', message: error.message })); process.exitCode = 1;
}
totals.elapsedMs = Date.now() - started;
console.log(JSON.stringify({ result: process.exitCode ? 'FAIL' : 'PASS', currentDefaults: M.defaults, totals, samples }, null, 2));
