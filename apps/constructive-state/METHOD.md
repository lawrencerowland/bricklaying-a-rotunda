# Can a blueprint carry the dynamics?

Foray 120 · 6 September 2026 · constructive finite experiment

[Open the experiment](./) · [Essay collection](../../index.html)

## The answer to the end–way question

The restricted discrete end is delivered: a project has a generated state-transition system, admissible alternative completion trajectories, a completion policy, working building views and analytics. The proposed way works **with necessary additions and one correction**. Process laws are supplied locally, composed through explicit interfaces, and searched from the initial state. A section of the state-indexed action bundle selects a policy; iteration produces a trajectory. A trajectory is not itself such a section.

This is a constructive answer within a finite model, not validation of a smooth project manifold or proof for arbitrary projects. The separate continuous circle/slot-observation extension is not completed here. The curated companion essays explore other dynamics and observation questions separately.

## What is supplied, and what is produced

Supplied: two separate cylindrical installations; labelled brick positions; cyclic adjacency; course support; placement and curing durations; a reusable shared hoist pool; a common tick; empty initial conditions; and an explicit completed-and-cured goal. These are primitive geometry and local process rules, not a global successor table or a planted route. Four bricks and two courses per ring are the default. Either end of a contiguous occupied run may be extended at each placement. This is more permissive than choosing one fixed clockwise/anticlockwise direction per course; four slots have 16 connected orders rather than 8 fixed-direction orders. With two or three slots, adjacency excludes no otherwise unplaced brick; four makes that geometric restriction substantive.

Produced: the actually reachable joint graph; a behaviour-preserving refinement of a chosen summary; the quotient dynamics; shortest completion distances and exact labelled path counts; and concrete replays generated from a policy. Nothing is learned from external project data. In particular, refinement uses the supplied detailed model: it does not discover missing physics from the drawing.

## 1. The research contract

End: construct project states from which valid full-completion paths can be generated. Way: state local rules and open-system interfaces, compose them, derive sufficient state and a completing policy. Means: finite enumeration, refinement, exact counts, counterexamples and replay.

Assumptions are supplied and visible; results are computed. A toy result is not a validated engineering plan. A summary is rejected if it merges states with different goal status or labelled futures. A proposed completion is rejected if it violates support, capacity, curing or the complete goal. The practical unresolved issue is how the necessary state distinctions will be observed or tracked.

## 2. Composition supplies the dynamics

Each front has a local request menu and update map. The pool has its own update: new owners = (old owners union starts) minus releases, subject to capacity at tick start. Joint inputs are the pairs of local requests satisfying the central capacity relation. Both front updates and the pool update then run on a common tick. All feasible choices are retained; the wiring does not contain a greedy scheduler.

Tick order is precise: check support/readiness and reserve at the start; advance active or newly started placements and existing curing clocks once; release finishing jobs at the end; start a newly completed course's full curing period at that end. A released hoist cannot be reused earlier in the same tick. Advancing time through curing is not an identity operation.

In Myers's dependent deterministic convention, the interface has outputs O and input fibres I(o). The readout r:S→O exposes terminal completion status, legal local request menus, active-job finishing information and current reservations. Completion status is essential: the terminal goal has no inputs, whereas an unfinished but idle state still permits a wait tick. The backward/update part is u:S×_O I→S. Written with inputs above outputs, the system lens is (u,r): S/S → I/O. The app's wireTick is this update assembled from the component maps and the feasible-input relation. Spivak's familiar state/readout/update presentation carries the same data in the discrete setting; the dependent-input convention is useful here because feasibility changes with the output.

The blueprint summary q is **not** silently substituted for this full interface. It can only expose exactly the legal input menu if it preserves the relevant distinctions. A constant input alphabet with rejection could be used for a different lens, but that would not establish the stronger exact-menu claim tested here.

This implements one explicit finite wiring. It is not a universal wiring-diagram language or an independently proved implementation of all symmetric-monoidal/operadic laws. An independently written flat-state model reproduces every labelled transition in 108 selected parameter configurations without calling the component updates to generate its reference graph.

## 3. Construct enough state

Start with an observation q such as placed bricks alone. Group reachable states sharing that observation. Repeatedly split a group whenever members differ in goal status, enabled action labels, or the successor group of a labelled action. Keep the existing group identifier in the next-round signature, so the operation only splits.

Termination follows from finiteness. Stability gives a well-defined quotient update with q*(u(s,a))=u_bar(q*(s),a), identical legal labels, and preserved goal status. By induction, any stable refinement of the starting observation must separate each pair split by this algorithm: hence the result is the coarsest such refinement. This is a deterministic, action-labelled, goal-preserving result with unit transition costs—not a claim to preserve every reward, unexposed output, or arbitrary environment.

Default refinement: 729 blueprint classes → 3,377 → 3,480 → 3,508 stable classes, across 3,883 concrete reachable states. Only 375 concrete-state distinctions disappear. The answer is therefore not that an extremely compressed progress picture is sufficient. Ready/not-ready flags can also fail: identical current menus can hide different future readiness times.

The full-state model supplies the class calculation. A real implementation would still need to observe or track its necessary distinctions; a coarse drawing alone cannot reveal which refined class is current.

### The new composition-sensitive finding

With one hoist, two states can be equivalent even though A has either one curing tick or zero ticks left: B holds the sole hoist for the coming tick, forcing both states to wait. The wait removes the timer difference. With two hoists, A can start its next course immediately only in the zero-timer state. Both states are reachable in the new system. The old quotient is no longer valid.

The interface-sensitive lesson is to refine after wiring or establish a stronger component replacement relation that preserves the interface in every intended context. This is not a counterexample to Myers's preservation theorems: the old closed-composite equivalence was never shown to meet their interface-preserving hypotheses. The app recomputes the abstraction whenever model settings change, and its separate context test exhibits the failed old class without changing the active model.

## 4. From an action bundle to completion paths

Let E={(s,a) | a is admissible at s}. The projection p(s,a)=s is a state-indexed action bundle of sets; its target map is t(s,a)=u(s,a). A policy section σ selects one outgoing action at every nonterminal state in its domain. Iteration s_(n+1)=t(σ(s_n)) generates a trajectory. These fibres have no asserted vector-space structure.

Reverse breadth-first search gives the minimum distance d from each quotient state to the goal. At every finite positive d, choose an edge to d−1. The lifted action is valid in every concrete representative and decreases that integer rank, so it reaches completion in finitely many steps. This establishes a completing policy on the goal-reaching region, not completion under every legal choice: endlessly choosing wait can avoid the goal. When access to B is closed, no state in the initial reachable graph can complete the whole project; the app reports no route rather than inventing a plan.

The default optimum is 34 ticks. Sixteen two-tick placements occupy 32 ticks, and the final course must cure for at least two more. A generated schedule achieves this lower bound. A separate combinatorial check counts 592 admissible no-idle A/B interleavings ending in A, multiplied by 16 choices for each of four cyclic course orders: 592 × 16^4 = 38,797,312 shortest labelled paths. Rotations and brick labels distinguish paths. This is neither the number of all policies nor the number of all trajectories; arbitrary waits allow infinitely many longer trajectories.

With two hoists the default completion time becomes 22 ticks. Changing curing, capacity or access regenerates the model; no displayed route or headline result is hardcoded.

## Verification and reuse

Run with Node:

```sh
node tests/constructive-state-oracle.cjs apps/constructive-state/core.js
node tests/constructive-state-laws.cjs
```

The independent oracle exhaustively checks the reachable model **within each of 108 selected configurations**, not every possible combination of controls: 91,777 states, 240,663 labelled transitions, 275,331 quotient-state checks, 273,147 policy lifts, 540 completed routes and 108 impossible-route cases. It also checks illegal and malformed actions and non-adjacent placement. Separate tests check pool capacity and release guards, default refinement, the changed-wiring witness and an independent combinatorial path count.

The browser test uses only the ordinary controls and displayed results: enter via the index; generate/replay/replan; compare summaries; test changed wiring; close access; reopen URL settings; correct/reset and reload; recover from invalid URL assumptions; check mobile width, keyboard action and return to the seven-essay collection. Run with Playwright and installed Chrome against a served repository root:

```sh
node tests/constructive-state-browser.cjs http://localhost:8767/
```

The app is deliberately ephemeral: it creates no authoritative project record or file. Applied physical assumptions are recorded in its URL; reopening recomputes them. Replay positions, manual detours and summary choices reset, as the interface states. There is no login, backend, purchase, booking, external submission or implied engineering approval.

## Source use and bibliography

The maintained construction uses Myers's state/readout/update and dependent-interface discipline, with Spivak's open-system presentation and resource-aware composition as supporting context. The finite model, refinement proof and computed witnesses are additional work, not ready-made planning algorithms attributed to these sources.

- David Jaz Myers (2023), *Categorical Systems Theory*, draft updated 3 September 2023, especially §§1.2–1.3, 3.5.3 and 4.2. [Author's book](https://www.davidjaz.com/Papers/DynamicalBook.pdf).
- David Jaz Myers (2021), *Double Categories of Open Dynamical Systems*, §§1–3, 5–6. [Published article](https://doi.org/10.4204/EPTCS.333.11).
- David I. Spivak (2019), *Lenses: applications and generalizations*. [Author-hosted slides](https://dspivak.net/talks/pdfs/20190000-riverside2019.pdf).
- Bob Coecke, Tobias Fritz and Robert W. Spekkens (2016), *A mathematical theory of resources*. Parallel composition does not duplicate a physical hoist. [Published article](https://doi.org/10.1016/j.ic.2016.02.008).

Historical source-reading records remain in the private research archive. The current public essay makes only the scoped dynamics claims above.
