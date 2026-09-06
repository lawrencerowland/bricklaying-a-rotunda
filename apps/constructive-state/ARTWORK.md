# Picture the site — artwork and animation

6 September 2026 · Foray 120 · R-011

`hilltop.png` is a 1536 × 1024 PNG generated with the built-in image-generation tool, using one call and no subsequent image edits. It is an imagined Scottish Borders setting, not a photograph or a reconstruction of a real Manorwater defensive site.

The image provides the landscape, track, material stacks and flush ground-pad outlines. `scene.js` adds a functional projection of the existing model: placed sectors, curing, in-progress lifts and one or two hoists. The overlay shares the same state, generated route and replay position as “Build & paths”. No transition laws are changed. Brick texture, scenic proportions and hoist travel are illustrative: they add no work, travel time, structural claim or resource demand. Each model sector depicts a chunk of brickwork; the ground pads are outside the modelled construction.

The loop opens partway through the route so the cylindrical form is immediately visible. Pause, scrub, restart and “Inspect current tick” expose the same generated path. During a lift, the handoff returns to the current tick boundary, not a fractional animation state. A reduced-motion preference prevents automatic playback.

## Exact image-generation prompt

```text
Use case: stylized-concept
Asset type: landscape 3:2 background illustration for an animated explanatory website; one edge-to-edge scene, not a user-interface screenshot.
Scene/backdrop: an imagined Manorwater / Scottish Borders upland valley. A small gently elevated grassy prominence in the foreground, with low treeless rolling hills, purple heather, a soft cool sky and distant blue hills.
Subject and composition: a broad almost-level open oval work platform on the foreground knoll, centered and occupying the lower half. Exactly two empty circular brick foundation pads, quiet flush ground outlines only, not built walls. Their centres are approximately 30% and 70% of image width, both at approximately 70% image height; each is about 18% of image width, appearing elliptical in the landscape perspective. Keep the two tower positions, space directly above them, and central work area unobstructed for state-dependent construction geometry and hoist diagrams that will be drawn later. The two circles should immediately read as one coherent two-tower hilltop worksite.
Details: a modest curving dirt access track rises from the lower-left edge to the platform. Very small stacks of red bricks and timber only at the far sides, away from both pads and the central gap.
Style/medium: charming miniature architectural diorama / editorial model illustration. Crisp and simple enough to support animated explanatory overlays; gently tactile grass and ground textures; not photorealistic, not surreal.
Lighting/mood: warm late-afternoon light with soft shadows, calm and approachable.
Color palette: cool blue distant hills and sky, clear mossy grass, purple heather, subtle warm earth and red brick.
Constraints: no buildings, no towers, no built-up foundation walls, no hoists, no cranes, no people, no trees, no text, no labels, no logos, no watermark. No literal historical reconstruction, weaponry, fantasy castles or dramatic cliffs. Preserve generous clear space across the platform and over both pads.
```

The actual generated pads were measured for overlay alignment, rather than assuming the requested positions were followed exactly.
