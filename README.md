# Dynamics and lenses · Foray 120

[Open the essay collection](https://lawrencerowland.github.io/bricklaying-a-rotunda/)

**End:** represent project states in enough detail to generate valid paths to full completion.
**Way:** specify state, readout and update in the spirit of Myers; connect local systems through explicit interfaces; test the resulting dynamics.
**Means:** small interactive models, finite enumeration, analytic intervals, counterexamples and replay.

## Seven distinct essays

Original numbers remain stable.

- **5 · Bricklaying Trajectories:** spatial routes, direction and staggered courses in radial comparisons.
- **6 · Toy Project Dynamics:** direction/start choices and a continuous partial-observation example; [companion notes](apps/toy_project_dynamics_lenses_notes.html).
- **8 · Revised Interactive Model:** course rules, curing, setup costs, feasible policy selection and timing analytics.
- **9 · Wiring Diagrams ↔ Lenses:** the formal interface/reindexing mechanism.
- **11 · Offshore Wind Maintenance:** weather-window and deadline-constrained scheduling.
- **12 · Brick Cylinder:** the simple choice/policy/trajectory primer.
- **13 · Can a blueprint carry the dynamics?:** component updates, shared resources, reachable states, sufficient summaries and generated full-completion paths.

[Preservation and consolidation map](CURATION.md). Earlier versions remain in Git history; retired routes lead to their maintained replacements.

## Constructive experiment

[Open #13](https://lawrencerowland.github.io/bricklaying-a-rotunda/apps/constructive-state/) · [Method and limits](apps/constructive-state/METHOD.md)

The default finite toy produces 3,883 reachable states, 3,508 sufficient classes, a 34-tick optimum and 38,797,312 shortest labelled paths. Two hoists reduce the optimum to 22 ticks. These results depend on explicit placement, support, curing, clock, resource and goal assumptions; they are not engineering validation.

The second tab, [Picture the site](https://lawrencerowland.github.io/bricklaying-a-rotunda/apps/constructive-state/#site), preserves the animated imagined Manorwater hilltop, two cylindrical brick towers and model-linked hoists. [Artwork provenance](apps/constructive-state/ARTWORK.md).

## Verification

No build or external runtime dependency is required by the apps. Model checks use Node; browser checks need Playwright, installed Chrome and a served repository root.

```sh
node tests/constructive-state-oracle.cjs apps/constructive-state/core.js
node tests/constructive-state-laws.cjs
node tests/constructive-state-scene.cjs
node tests/backbone-model.cjs
node tests/offshore-model.cjs
node tests/spatial-orders.cjs
node tests/constructive-state-browser.cjs http://127.0.0.1:8767/
node tests/constructive-state-scene-browser.cjs http://127.0.0.1:8767/
node tests/collection-browser.cjs http://127.0.0.1:8767/
node tests/slot-and-primer-browser.cjs http://127.0.0.1:8767/
node tests/backbone-browser.cjs http://127.0.0.1:8767/apps/Lens-plus-arena-backbone.html
node tests/offshore-browser.cjs http://127.0.0.1:8767/apps/offshore_wind_maintenance_lens_copy.html
```

## Plan-layer handshake

`FORAY-DYNAMIC-PROJECT-STATES · R-012 · 6 September 2026`

The collection is curated around dynamics and Myers-style lenses. The principal construction retains resource composition, refinement and completing policies. A policy selects an action; iteration generates a trajectory. An abstraction established after composition may fail when resource wiring changes. The finite toy advances the stated end under supplied assumptions; it does not close the whole foray.

Canonical research receipts and historical source-reading records remain in the private working home. No private source copies or record identifiers are published.
