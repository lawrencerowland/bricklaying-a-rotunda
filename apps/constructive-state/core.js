/* FORAY-DYNAMIC-PROJECT-STATES · deterministic finite model; toy units only. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ProjectDynamics = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const clone = x => JSON.parse(JSON.stringify(x));
  const key = x => JSON.stringify(x);
  const pop = n => { let c = 0; for (; n; n &= n - 1) c++; return c; };
  const defaults = { bricks: 4, courses: 2, cureA: 2, cureB: 3, duration: 2, capacity: 1, blockedB: false };
  function config(input = {}) {
    const c = { ...defaults, ...input };
    for (const [k, lo, hi] of [['bricks', 2, 4], ['courses', 1, 2], ['cureA', 0, 3], ['cureB', 0, 3], ['duration', 1, 2], ['capacity', 1, 2]]) {
      if (!Number.isInteger(c[k]) || c[k] < lo || c[k] > hi) throw Error('Invalid model parameter: ' + k);
    }
    if (typeof c.blockedB !== 'boolean') throw Error('Invalid blockedB');
    return c;
  }
  const blank = c => ({ masks: Array(c.courses).fill(0), cool: Array(c.courses).fill(0), job: null });
  const initial = c => ({ fronts: [blank(c), blank(c)], owners: 0 });
  const full = c => (1 << c.bricks) - 1;
  function frontOptions(f, c, site) {
    if (f.job || (site === 1 && c.blockedB)) return [null];
    const course = f.masks.findIndex(m => m !== full(c));
    if (course < 0 || (course > 0 && (f.masks[course - 1] !== full(c) || f.cool[course - 1] > 0))) return [null];
    const mask = f.masks[course], out = [null];
    for (let b = 0; b < c.bricks; b++) {
      if (mask & (1 << b)) continue;
      const adjacent = (1 << ((b + 1) % c.bricks)) | (1 << ((b + c.bricks - 1) % c.bricks));
      if (!mask || (mask & adjacent)) out.push(course + ':' + b);
    }
    return out;
  }
  function frontTick(f, command, c, site) {
    if (!frontOptions(f, c, site).includes(command)) throw Error('Illegal local placement');
    const n = clone(f);
    n.cool = n.cool.map(x => Math.max(0, x - 1));
    if (command !== null) {
      const [course, brick] = command.split(':').map(Number);
      n.job = { course, brick, remaining: c.duration };
    }
    if (n.job) {
      n.job.remaining--;
      if (n.job.remaining === 0) {
        const { course, brick } = n.job;
        n.masks[course] |= 1 << brick;
        if (n.masks[course] === full(c)) n.cool[course] = site === 0 ? c.cureA : c.cureB;
        n.job = null;
      }
    }
    return n;
  }
  function actionId(a) { return a.every(x => x === null) ? 'wait' : a.map(x => x === null ? '-' : x).join('|'); }
  function actionName(a) {
    if (typeof a === 'string') a = a === 'wait' ? [null, null] : a.split('|').map(x => x === '-' ? null : x);
    const parts = a.flatMap((x, i) => x === null ? [] : [(i ? 'B' : 'A') + ': course ' + (+x.split(':')[0] + 1) + ', brick ' + (+x.split(':')[1] + 1)]);
    return parts.length ? 'Start ' + parts.join(' + ') : 'Advance one tick';
  }
  const isGoal = (s, c) => s.owners === 0 && s.fronts.every(f => !f.job && f.masks.every(m => m === full(c)) && f.cool.every(t => t === 0));
  function actions(s, c) {
    if (isGoal(s, c)) return [];
    const free = c.capacity - pop(s.owners), result = [];
    for (const a of frontOptions(s.fronts[0], c, 0)) for (const b of frontOptions(s.fronts[1], c, 1)) {
      if (Number(a !== null) + Number(b !== null) <= free) result.push([a, b]);
    }
    return result;
  }
  /* Wire three independently updated components. Releases occur at the end of a tick;
     a releasing hoist cannot be reallocated at that tick's beginning. */
  function poolTick(owners, starts, releases, capacity) {
    if ((owners & starts) || pop(owners | starts) > capacity) throw Error('Shared hoist capacity exceeded');
    if (releases & ~(owners | starts)) throw Error('Cannot release an unreserved hoist');
    return (owners | starts) & ~releases;
  }
  function wireTick(s, a, c) {
    if (!Array.isArray(a) || a.length !== 2) throw Error('A joint action must be an array of exactly two front commands');
    if (isGoal(s, c)) throw Error('Completion is terminal');
    let starts = 0, releases = 0;
    for (let i = 0; i < 2; i++) {
      if (!frontOptions(s.fronts[i], c, i).includes(a[i])) throw Error('Illegal front request');
      if (a[i] !== null) starts |= 1 << i;
      if (s.fronts[i].job?.remaining === 1 || (a[i] !== null && c.duration === 1)) releases |= 1 << i;
    }
    const owners = poolTick(s.owners, starts, releases, c.capacity);
    const fronts = s.fronts.map((f, i) => frontTick(f, a[i], c, i));
    if (owners !== fronts.reduce((m, f, i) => m | (f.job ? 1 << i : 0), 0)) throw Error('Reservation interface mismatch');
    return { fronts, owners };
  }
  function graph(input = {}) {
    const c = config(input), states = [initial(c)], lookup = new Map([[key(states[0]), 0]]), edges = [], parents = [null];
    for (let i = 0; i < states.length; i++) {
      edges[i] = actions(states[i], c).map(a => {
        const n = wireTick(states[i], a, c), k = key(n);
        if (!lookup.has(k)) {
          if (states.length >= 80000) throw Error('Finite model exceeds the 80,000-state safety limit. Use fewer bricks/courses.');
          lookup.set(k, states.length); parents.push({ from: i, action: actionId(a) }); states.push(n);
        }
        return { action: actionId(a), to: lookup.get(k) };
      }).sort((a, b) => a.action.localeCompare(b.action));
    }
    return { c, states, edges, parents, lookup, goals: states.map(s => isGoal(s, c)) };
  }
  function observation(s, mode = 'blueprint') {
    if (mode === 'full') return key(s);
    if (mode === 'ready') return key(s.fronts.map(f => [f.masks, f.cool.map(t => t === 0), f.job]));
    return key(s.fronts.map(f => f.masks));
  }
  function partition(labels) {
    const ids = new Map(), groups = [], of = [];
    labels.forEach((label, i) => { if (!ids.has(label)) { ids.set(label, groups.length); groups.push([]); } const id = ids.get(label); groups[id].push(i); of.push(id); });
    return { groups, of };
  }
  const signature = (g, p, i) => key([g.goals[i], g.edges[i].map(e => [e.action, p.of[e.to]])]);
  function conflict(g, p) {
    for (const members of p.groups) {
      const a = members[0], sig = signature(g, p, a);
      for (const b of members.slice(1)) {
        if (signature(g, p, b) === sig) continue;
        if (g.goals[a] !== g.goals[b]) return { a, b, kind: 'goal', action: null };
        const ea = new Map(g.edges[a].map(e => [e.action, e.to])), eb = new Map(g.edges[b].map(e => [e.action, e.to]));
        for (const action of new Set([...ea.keys(), ...eb.keys()])) {
          if (!ea.has(action) || !eb.has(action)) return { a, b, kind: 'enabled', action };
          if (p.of[ea.get(action)] !== p.of[eb.get(action)]) return { a, b, kind: 'successor', action, nextA: ea.get(action), nextB: eb.get(action) };
        }
      }
    }
    return null;
  }
  function refine(g, mode = 'blueprint') {
    let p = partition(g.states.map(s => observation(s, mode)));
    const rounds = [{ count: p.groups.length, witness: conflict(g, p) }], initialPartition = p;
    for (let iteration = 0; iteration <= g.states.length; iteration++) {
      const n = partition(g.states.map((_, i) => key([p.of[i], signature(g, p, i)])));
      if (n.groups.length === p.groups.length) return { ...p, rounds, initialPartition, mode };
      p = n; rounds.push({ count: p.groups.length, witness: conflict(g, p) });
    }
    throw Error('Refinement did not converge');
  }
  function solve(g, p) {
    const qEdges = p.groups.map(m => g.edges[m[0]].map(e => ({ action: e.action, to: p.of[e.to] })));
    const goals = p.groups.map(m => g.goals[m[0]]), reverse = qEdges.map(() => []);
    qEdges.forEach((es, from) => es.forEach(e => reverse[e.to].push(from)));
    const distance = goals.map(x => x ? 0 : Infinity), queue = goals.flatMap((x, i) => x ? [i] : []);
    for (let k = 0; k < queue.length; k++) for (const from of reverse[queue[k]]) if (distance[from] === Infinity) { distance[from] = distance[queue[k]] + 1; queue.push(from); }
    const policy = qEdges.map((es, i) => distance[i] > 0 && Number.isFinite(distance[i]) ? es.find(e => distance[e.to] === distance[i] - 1)?.action : null);
    const counts = qEdges.map(() => 0n);
    goals.forEach((goal, i) => { if (goal) counts[i] = 1n; });
    const order = distance.map((d, i) => ({ d, i })).filter(x => Number.isFinite(x.d)).sort((a, b) => a.d - b.d);
    for (const { d, i } of order) if (d > 0) counts[i] = qEdges[i].reduce((total, e) => total + (distance[e.to] === d - 1 ? counts[e.to] : 0n), 0n);
    return { qEdges, goals, distance, policy, counts };
  }
  function trajectory(g, p, solution, start = 0, preference = 'A') {
    const result = [{ state: start, action: null }]; let current = start;
    if (!Number.isFinite(solution.distance[p.of[current]])) return result;
    for (let t = 0; t <= g.states.length && !g.goals[current]; t++) {
      const d = solution.distance[p.of[current]], candidates = g.edges[current].filter(e => solution.distance[p.of[e.to]] === d - 1);
      if (!candidates.length) throw Error('Policy has no concrete lift');
      candidates.sort((a, b) => {
        const priority = x => preference === 'B' ? (x.action.includes('|') && x.action.split('|')[1] !== '-' ? 0 : 1) : (x.action !== 'wait' && !x.action.startsWith('-|') ? 0 : 1);
        return priority(a) - priority(b) || a.action.localeCompare(b.action);
      });
      const e = candidates[0]; result.push({ state: e.to, action: e.action }); current = e.to;
    }
    return result;
  }
  function routeTo(g, index) {
    const out = [{ state: index, action: null }]; let i = index;
    while (g.parents[i]) { const p = g.parents[i]; out[out.length - 1].action = p.action; i = p.from; out.push({ state: i, action: null }); }
    return out.reverse();
  }
  function verifyQuotient(g, p, solution) {
    let transitions = 0, policyLifts = 0;
    for (let i = 0; i < g.states.length; i++) {
      const representative = p.groups[p.of[i]][0];
      if (signature(g, p, i) !== signature(g, p, representative)) throw Error('Quotient obligation failed');
      for (const e of g.edges[i]) { transitions++; if (!solution.qEdges[p.of[i]].some(q => q.action === e.action && q.to === p.of[e.to])) throw Error('Transition failed to commute'); }
      const action = solution.policy[p.of[i]];
      if (action !== null) { const e = g.edges[i].find(e => e.action === action); if (!e || solution.distance[p.of[e.to]] !== solution.distance[p.of[i]] - 1) throw Error('Policy failed to lift'); policyLifts++; }
    }
    return { transitions, policyLifts, unreachable: solution.distance.filter(d => !Number.isFinite(d)).length };
  }
  function analyse(input = {}, mode = 'blueprint') {
    const g = graph(input), p = refine(g, mode), solution = solve(g, p), verification = verifyQuotient(g, p, solution);
    return { g, p, solution, verification, trace: trajectory(g, p, solution) };
  }
  return { defaults, config, initial, blank, key, pop, full, frontOptions, frontTick, poolTick, actionId, actionName, actions, wireTick, isGoal, graph, observation, partition, conflict, refine, solve, trajectory, routeTo, verifyQuotient, analyse };
});
