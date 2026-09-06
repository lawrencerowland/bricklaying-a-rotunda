# Can a blueprint carry the dynamics?

Foray 120 · 6 September 2026 · constructive finite experiment

[Open the experiment](./) · [All twelve predecessors](../../index.html)

## The answer to the end–way question

The restricted discrete end is delivered: a project has a generated state-transition system, admissible alternative completion trajectories, a completion policy, working building views and analytics. The proposed way works **with necessary additions and one correction**. Gluing assembles compatible descriptions; it does not supply process laws or establish reachability. Those laws are supplied locally, composed, and searched. A section of the state-indexed action bundle selects a policy; iteration produces a trajectory. A trajectory is not itself such a section.

This is a constructive answer within a finite model, not validation of a smooth project manifold or proof for arbitrary projects. The separate continuous circle/slot-observation extension is not completed here. The twelve earlier essays remain byte-for-byte unchanged.

## What is supplied, and what is produced

Supplied: two separate cylindrical installations; labelled brick positions; cyclic adjacency; course support; placement and curing durations; a reusable shared hoist pool; a common tick; empty initial conditions; and an explicit completed-and-cured goal. These are primitive geometry and local process rules, not a global successor table or a planted route. Four bricks and two courses per ring are the default. Either end of a contiguous occupied run may be extended at each placement. This is more permissive than choosing one fixed clockwise/anticlockwise direction per course; four slots have 16 connected orders rather than 8 fixed-direction orders. With two or three slots, adjacency excludes no otherwise unplaced brick; four makes that geometric restriction substantive.

Produced: each component's reachable local catalog; the compatible global assignment space; the actually reachable joint graph; a behaviour-preserving refinement of a chosen summary; the quotient dynamics; shortest completion distances and exact labelled path counts; and concrete replays generated from a policy. Nothing is learned from external project data. In particular, refinement uses the supplied detailed model: it does not discover missing physics from the drawing.

## 1. Gluing is a construction, but not a history

For a finite discrete variable set V with declared finite value domains D_v, define F(U)=product of D_v for v in U. Restriction forgets variables. A matching family has a unique union assignment on its union of patches, so this assignment presheaf is a sheaf for ordinary covers. The implementation declares the domains, rejects out-of-domain values, restricts sections, checks overlaps and requires exact coverage. Values are canonical JSON encodings.

The dynamic-state cover has three patches: {front.A, reserve.A}, {front.B, reserve.B}, and {reserve.A, reserve.B}. Each front value records its labelled brick mask, course timers and active work. Local sections are selected from the front's independently reachable catalog with reservation equal to active-work status. The central patch permits only reservation pairs within pool capacity. The natural join is calculated by the actual assignment-gluing operation, not merely labelled as gluing after a capacity check.

The underlying assignment sheaf is not a claim that arbitrary physically legal assignments form a sheaf on every cover. Capacity is a relation spanning both reservations and must be represented on a patch covering both. Geometry and process constraints enter the front catalogs; no topology-to-physics theorem is claimed.

At the default: 79 A states times 81 B states gives 6,399 independent pairs. The central relation excludes 2,304 over-reserved pairs. Of the 4,095 compatible states, only 3,883 are jointly reachable. The program checks that every reachable state belongs to the compatible assignment space.

A concrete obstruction: A has just begun its first two-tick placement, while B has just completed its first course and has all three curing ticks remaining. Only A currently holds a hoist, so the tuple passes present capacity and every local rule. But in the immediately preceding tick B held the sole hoist through its end, while A would have needed that hoist at its beginning. No joint history exists. This is a temporal obstruction, not an inconsistent present assignment.

## 2. Composition supplies the dynamics

Each front has a local request menu and update map. The pool has its own update: new owners = (old owners union starts) minus releases, subject to capacity at tick start. Joint inputs are the pairs of local requests satisfying the central capacity relation. Both front updates and the pool update then run on a common tick. All feasible choices are retained; the wiring does not contain a greedy scheduler.

Tick order is precise: check support/readiness and reserve at the start; advance active or newly started placements and existing curing clocks once; release finishing jobs at the end; start a newly completed course's full curing period at that end. A released hoist cannot be reused earlier in the same tick. Advancing time through curing is not an identity operation.

In Myers's dependent deterministic convention, the interface has outputs O and input fibres I(o). The readout r:S→O exposes legal local request menus, active-job finishing information and current reservations. The backward/update part is u:S×_O I→S. Written with inputs above outputs, the system lens is (u,r): S/S → I/O. The app's wireTick is this update assembled from the component maps and the feasible-input relation. Spivak's familiar state/readout/update presentation carries the same data in the discrete setting; the dependent-input convention is useful here because feasibility changes with the output.

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

The independent oracle exhaustively checks the reachable model **within each of 108 selected configurations**, not every possible combination of controls: 91,777 states, 240,663 labelled transitions, 275,331 quotient-state checks, 273,147 policy lifts, 540 completed routes and 108 impossible-route cases. It also checks illegal and malformed actions and non-adjacent placement. Separate tests check the assignment laws on a complete three-Boolean-variable fixture (2,175 assertions including error guards), default natural-join counts, the changed-wiring witness and the independent combinatorial count.

The browser test uses only the ordinary controls and displayed results: enter via the index; generate/replay/replan; compare summaries; test changed wiring and inconsistent overlaps; close access; reopen URL settings; correct/reset and reload; recover from invalid URL assumptions; check mobile width, keyboard action and return to all 13 essays. Run with Playwright and installed Chrome against a served repository root:

```sh
node tests/constructive-state-browser.cjs http://localhost:8767/
```

The app is deliberately ephemeral: it creates no authoritative project record or file. Applied physical assumptions are recorded in its URL; reopening recomputes them. Replay positions, manual detours and summary choices reset, as the interface states. There is no login, backend, purchase, booking, external submission or implied engineering approval.

## Source use and bibliography

The fixed nine-document set was consulted with focused reading of the longer works. The lens slides, open-systems abstract, 2025 process-theory paper, resource-theory article and secondary context note were read in full as text; the longer book, thesis, physicist survey and research playbook were read selectively. Source concepts informed the construction; the finite model and numerical claims were tested separately.

Spivak/Myers supply the interface and open-system discipline; Coecke and collaborators distinguish composition syntax, semantics, resources and equivalence; Lynch informs relational matching. The playbook steered the experiment toward the potentially missing construction that would decide whether the end is attainable. The model, refinement proof and computed witnesses here are additional work, not attributed as ready-made planning algorithms from those sources.

Public-only entries below contain no private record links or local paths. They name the actual sources used and preserve edition differences.

1. David I. Spivak (2019). *Lenses: applications and generalizations*. UC Riverside talk slides. [Author-hosted slides](https://dspivak.net/talks/pdfs/20190000-riverside2019.pdf). The public PDF includes animation overlays; page count differs from the fixed handout.

2. David Jaz Myers (2023). *Categorical Systems Theory*. Draft, last updated 3 September 2023. [Author's book PDF](https://www.davidjaz.com/Papers/DynamicalBook.pdf). Selected sections consulted, not the entire book.

3. David Jaz Myers (2021). *Double Categories of Open Dynamical Systems (Extended Abstract)*. *Electronic Proceedings in Theoretical Computer Science* 333, 154–167. [Published article DOI](https://doi.org/10.4204/EPTCS.333.11); [author-deposited preprint, v2](https://arxiv.org/abs/2005.05956v2).

4. John H. Selby, Maria E. Stasinou, Matt Wilson and Bob Coecke (2025). *Generalised Process Theories*. arXiv:2502.10368v1, 14 February 2025. [Version consulted](https://arxiv.org/abs/2502.10368v1).

5. Bob Coecke and Éric Oliver Paquette (2009). *Categories for the practising physicist*. arXiv:0905.3010, fixed reading copy v2. [Author-deposited preprint](https://arxiv.org/abs/0905.3010). Selected sections consulted.

6. Ben Reinhardt and Eileen Nakahata (2025). *A Playbook for Research Leaders*. Speculative Technologies, Spring 2025 edition. [Publisher's current online edition](https://spec.tech/library/research-leaders-playbook). The linked web edition is dated 13 February 2026; it is not represented as a page-identical copy of the Spring 2025 PDF. Selected sections consulted.

7. Bob Coecke, Tobias Fritz and Robert W. Spekkens (2016). *A mathematical theory of resources*. *Information and Computation* 250, 59–86. [Published article DOI](https://doi.org/10.1016/j.ic.2016.02.008); [2014 preprint](https://arxiv.org/abs/1409.5531). The fixed reading copy was the final journal article.

8. Owen Lynch (2022). *Relational Composition of Physical Systems: A Categorical Approach*. MSc thesis, Universiteit Utrecht, July 2022. [Later corrected public version](https://arxiv.org/abs/2310.06088). The later-version distinction is confirmed on [the supervisor's thesis listing](https://math.ucr.edu/home/baez/theses.html); the old author-hosted 2022 PDF URL currently returns 404. Selected sections of the fixed 2022 copy were consulted.

The ninth fixed document was an AI-generated secondary context note. It is deliberately not presented as an authoritative publication or attributed to the authors of the primary papers; no verified public edition is available.
