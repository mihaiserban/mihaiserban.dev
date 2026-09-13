---
slug: building-a-design-pattern-generator-for-cnc-laser-cutting
title: Building a Pattern Generator for My Front Gate
description: "I built a browser tool to try perforated metal patterns for my front gate, with an SVG preview and PDF and DXF exports."
date: "2026-06-10T00:00+03:00"
hidden: false
tags: ["react", "gatsby", "cnc", "laser-cutting", "svg", "dxf"]
---

I wanted a metal front gate with a perforated pattern. When I called laser-cutting shops, they asked for a CAD file. I had an idea of the pattern, but no drawing to send them.

I tried drawing patterns in Figma. Changing the spacing meant selecting, moving and copying shapes again. I wanted to adjust a few numbers and see what they would look like on a two-meter panel.

I built the [Design Pattern Generator](/design-pattern-generator) to do that in the browser and export a DXF. It's a React page on this Gatsby site; generating the pattern and exporting files happen locally, without an account or an upload.

## From settings to cutouts

The generator supports circles, squares and horizontal or vertical slots. I can change the sheet dimensions, margins, spacing and cutout size, then use a density gradient to vary the pattern across the panel. Squares and slots can have rounded corners.

The engine returns shape descriptors, which the SVG preview renders. Here's a circle-pattern example with the margins supplied explicitly:

```javascript
const shapes = generatePattern({
  width: 1000,
  height: 2000,
  marginTop: 50,
  marginBottom: 50,
  marginLeft: 50,
  marginRight: 50,
  shapeType: 'circle',
  shapeSize: 20,
  spacing: 40,
  opacity: 30,
  gradientType: 'topToBottom',
});
```

The `opacity` setting controls the target placement density, despite its name. It does not make the shapes translucent or specify the percentage of metal removed.

For circles and squares, the engine builds a grid and decides which cells receive a cutout. It combines random placement with the 7/16, 3/16, 5/16 and 1/16 error-distribution weights from Floyd–Steinberg dithering. That spreads placement error across neighboring cells. The grid stays regular, but the occupied cells vary.

Slots use a separate loop. It samples lengths between the configured minimum and maximum, leaves spacing between slots and uses the local density to decide whether to skip a position. This path does not use the grid's error diffusion.

The directional density curve has an exponent of 1.8 and a floor of 10% of the density setting. That floor applies to the placement target, not a guaranteed number of cutouts. Generating the pattern again can change the result because the engine uses `Math.random()`.

## Exporting a drawing

The preview uses SVG, and the download options are PDF and DXF.

The PDF exporter uses `svg2pdf.js` and includes padding and a block of settings beside the drawing. Its page is therefore larger than the configured sheet. Print without “fit to page” scaling if you need to preserve the drawing scale.

The DXF exporter writes circles as `CIRCLE` entities and slot and polygon outlines as closed `LWPOLYLINE` entities. The coordinates follow the tool's millimeter dimensions. Check the import units and geometry with the shop before cutting; a file format alone does not guarantee that every CAD/CAM setup interprets it as intended.

## What the coverage number means

The coverage display is an estimate. The current calculation adds up circle areas and rectangular areas for squares and slots, then divides by the sheet's width times height. It does not subtract rounded corners or use the actual area of a nonrectangular sheet.

For example, rounding a 20 mm square into a circle reduces its area from 400 mm² to about 314 mm², but the square calculation still counts 400 mm². The number is useful for comparing patterns with similar geometry; it is not an exact material-removal measurement.

It also does not calculate panel strength or sound transmission. Material, thickness, remaining connections and mounting all matter to the finished panel. More cutout area means more open area, not proof that a gate is structurally suitable.

## The gate pattern

I used vertical slots 30 mm wide and 100–400 mm long, with a density gradient and gaps between them. The DXF went to the laser shop. The roughly 35% cutout figure is an estimate, subject to the calculation limits above.

Adjusting the parameters was much quicker than redrawing the pattern in Figma. I could compare several versions at the panel's dimensions before choosing a file to send.

You can [try the generator](/design-pattern-generator) with your own dimensions and export the result as PDF or DXF.
