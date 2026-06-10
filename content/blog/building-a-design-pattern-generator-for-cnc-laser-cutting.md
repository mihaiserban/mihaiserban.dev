---
slug: building-a-design-pattern-generator-for-cnc-laser-cutting
title: "Building a Design Pattern Generator for CNC & Laser Cutting"
description: "I built a web-based pattern generator to design perforated sheet metal patterns for my front gate. It exports SVG, PDF, and DXF — and runs entirely in the browser."
date: "2026-06-10T00:00+03:00"
hidden: false
tags: ["react", "gatsby", "cnc", "laser-cutting", "svg", "dxf"]
---

# Building a Design Pattern Generator for CNC & Laser Cutting

I needed a front gate. Not just any gate — a metal gate with a perforated pattern that lets light through while keeping privacy. The kind of thing you see on modern architectural builds, where the sheet metal is laser-cut with a gradient of holes or lines that fade from dense to sparse.

I called a few laser-cutting shops. Every single one asked the same thing: *"Can you send us the CAD file?"*

I didn't have one. I had a mental image — something that gets denser at the bottom and fades toward the top, with rounded corners on the cutouts. Drawing that manually in CAD software, iterating on spacing and density, exporting to DXF, then realizing the proportions were off... that loop sounded like hours of pain. And I wanted to *see* the pattern before committing to a full sheet of metal.

So I did what any developer with a deadline and a stubborn streak would do: I built a tool.

---

## The Problem: From Idea to Cut File

Laser and CNC machines are incredibly precise, but they are dumb. They follow paths. The creative part — deciding where those paths go — is entirely on you. Most workflows look like this:

1. Sketch an idea on paper.
2. Open Illustrator / Inkscape / AutoCAD.
3. Draw shapes manually.
4. Copy, paste, nudge, guess at spacing.
5. Export to DXF or PDF.
6. Send to the shop.
7. Realize the scale is wrong. Go back to step 3.

I wanted to collapse that loop into a single web page where I could tweak parameters and immediately see the result, measured in real millimeters, ready to export.

---

## What I Built

The [Design Pattern Generator](/design-pattern-generator) is a standalone React app embedded in my Gatsby site. It runs entirely in the browser — no backend, no uploads, no accounts. Everything is local.

### Core Features

**Live SVG preview** — Every change updates a vector preview in real time. Dimensions are exact: if you set the canvas to 1000 mm × 2000 mm, the preview and the exported file match that precisely.

**Four shape types** — Circles, squares, horizontal lines, and vertical lines. Lines are particularly useful for slatted designs where you want airflow or visibility control. Squares support rounded corners. Lines support variable length and corner radius.

**Gradient density control** — This is where the tool gets interesting. You can set a global density (0–100%), but you can also apply a directional gradient:
- Uniform
- Left-to-right, right-to-left
- Top-to-bottom, bottom-to-top
- Radial (dense in the center, fading outward)

The gradient uses a curved falloff so the fade feels natural, not mechanically linear. The sparse end of the gradient never drops to zero — it stays around 10% of the max density so the pattern doesn't completely vanish.

**Floyd-Steinberg dithering** — To avoid the "grid of dots" look, the engine uses Floyd-Steinberg error diffusion when deciding whether to place a shape at each grid cell. This gives the pattern an organic, slightly irregular feel that works much better aesthetically than a strict probabilistic grid.

**Coverage calculation** — The tool shows the exact percentage of material that will be removed. This is critical for structural decisions: if you're cutting a gate panel, you need to know how much strength you're losing. If you're designing a speaker grille, you need to know how much sound will pass through.

**Export formats** — PDF for print and sharing, DXF for direct import into CAD/CAM software. Both are vector formats, so the shop gets clean paths at any scale.

**Dark mode** — Because I built this at night, and staring at a white canvas hurts.

---

## How It Works

The engine is a pure JavaScript function that takes a settings object and returns an array of shape descriptors. Each shape has a position, size, type, and optional properties like line length or corner radius.

```javascript
// Simplified idea
const shapes = generatePattern({
  width: 1000,
  height: 2000,
  shapeType: 'circle',
  shapeSize: 20,
  spacing: 40,
  opacity: 30,
  gradientType: 'topToBottom',
});
```

The grid is computed from the canvas size, margins, shape size, and spacing. For each cell, the engine calculates a target density based on the gradient, applies the dithering algorithm, and if the cell passes, it places a shape. Lines are handled differently — they are placed in rows or columns with random lengths within a min/max range, skipping cells based on the same density logic.

The SVG preview renders these shapes directly. The PDF exporter uses `svg2pdf.js` to convert the live SVG DOM into a vector PDF with exact page dimensions. The DXF exporter writes raw DXF entities (LWPOLYLINE for lines, CIRCLE for circles) so the file opens cleanly in AutoCAD, LibreCAD, or any CAM software.

---

## Why This Matters

The real win isn't the code — it's the iteration speed. I can sit with my laptop, adjust the density, see the pattern change, and know immediately whether it will look right on a 2-meter gate. I can check the coverage percentage and make sure I'm not cutting away so much metal that the panel loses rigidity. I can export a DXF, email it to the shop, and have a quote the same day.

Before writing this tool, I tried drawing patterns in Figma. It works, but it's tedious. Every change requires manual selection, nudging, and copy-pasting. The generator removes that friction entirely. The pattern is deterministic enough to look intentional, but random enough to feel organic.

---

## The Gate

The gate I ended up with uses vertical lines, 30 mm thick, with a top-to-bottom density gradient. The lines are 100–400 mm long, placed in columns with random gaps. The top is sparse — almost open — letting light through. The bottom is dense, giving privacy and a solid visual anchor. The DXF went straight to the laser shop.

The total cutout area is about 35% of the sheet. That felt right: enough transparency to keep the space from feeling like a wall, enough material to keep it strong.

---

## Try It

You can use the generator here: [**/design-pattern-generator**](/design-pattern-generator)

It's free, runs in your browser, and exports PDF and DXF. If you build something with it — a gate, a grille, a lamp shade, a room divider — I'd love to see it.
