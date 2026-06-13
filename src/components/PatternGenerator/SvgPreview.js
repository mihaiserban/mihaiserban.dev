import React, { forwardRef } from "react";
import { getSheetVertices } from "./sheetOutline";

const DIM_COLOR = "#000000";
const DIM_FONT = 28;
const DIM_PAD = 70;

const SvgPreview = forwardRef(
  (
    { width, height, shapes, marginTop, marginBottom, marginLeft, marginRight, sheetShape },
    ref,
  ) => {
    const renderShape = (shape, index) => {
      const { type, x, y, size } = shape;
      const key = `shape-${index}`;

      switch (type) {
        case "circle": {
          const half = size / 2;
          return (
            <rect
              key={key}
              x={x - half}
              y={y - half}
              width={size}
              height={size}
              rx={half}
              ry={half}
              fill="none"
              stroke="black"
              strokeWidth="1"
            />
          );
        }

        case "square": {
          const half = size / 2;
          const cr = shape.cornerRadius != null ? shape.cornerRadius : 0;
          const r = half * (cr / 50);
          return (
            <rect
              key={key}
              x={x - half}
              y={y - half}
              width={size}
              height={size}
              rx={r}
              ry={r}
              fill="none"
              stroke="black"
              strokeWidth="1"
            />
          );
        }

        case "horizontalLine": {
          const lineLen = shape.lineLength || size;
          const halfLen = lineLen / 2;
          const h = size / 2;
          const cr = shape.cornerRadius != null ? shape.cornerRadius : 50;
          const r = h * (cr / 50);
          return (
            <rect
              key={key}
              x={x - halfLen}
              y={y - h}
              width={lineLen}
              height={size}
              rx={r}
              ry={r}
              fill="none"
              stroke="black"
              strokeWidth="1"
            />
          );
        }

        case "verticalLine": {
          const lineLen = shape.lineLength || size;
          const halfLen = lineLen / 2;
          const h = size / 2;
          const cr = shape.cornerRadius != null ? shape.cornerRadius : 50;
          const r = h * (cr / 50);
          return (
            <rect
              key={key}
              x={x - h}
              y={y - halfLen}
              width={size}
              height={lineLen}
              rx={r}
              ry={r}
              fill="none"
              stroke="black"
              strokeWidth="1"
            />
          );
        }

        default:
          return null;
      }
    };

    const mt = marginTop || 0;
    const mb = marginBottom || 0;
    const ml = marginLeft || 0;
    const mr = marginRight || 0;

    const sheetVertices = getSheetVertices(width, height, sheetShape);
    const pointsAttr = sheetVertices.map((v) => `${v.x},${v.y}`).join(' ');

    const minX = Math.min(...sheetVertices.map((v) => v.x));
    const maxX = Math.max(...sheetVertices.map((v) => v.x));
    const minY = Math.min(...sheetVertices.map((v) => v.y));
    const maxY = Math.max(...sheetVertices.map((v) => v.y));

    const vbx = minX - DIM_PAD;
    const vby = minY - DIM_PAD;
    const vbw = maxX - minX + DIM_PAD * 2 + 50;
    const vbh = maxY - minY + DIM_PAD * 2 + 50;

    const edgeLabels = sheetVertices.map((v1, i) => {
      const v2 = sheetVertices[(i + 1) % sheetVertices.length];
      const dx = v2.x - v1.x;
      const dy = v2.y - v1.y;
      const length = Math.round(Math.sqrt(dx * dx + dy * dy));
      const midX = (v1.x + v2.x) / 2;
      const midY = (v1.y + v2.y) / 2;
      const normalLen = Math.sqrt(dx * dx + dy * dy);
      const normalX = normalLen > 0 ? dy / normalLen : 0;
      const normalY = normalLen > 0 ? -dx / normalLen : 0;
      const labelOffset = 50;
      const labelX = midX + normalX * labelOffset;
      const labelY = midY + normalY * labelOffset;
      let textAnchor = 'middle';
      if (Math.abs(normalX) > Math.abs(normalY)) {
        textAnchor = normalX > 0 ? 'start' : 'end';
      }
      return { labelX, labelY, textAnchor, length };
    });

    return (
      <div className="svg-preview-container">
        <svg
          ref={ref}
          width={vbw}
          height={vbh}
          viewBox={`${vbx} ${vby} ${vbw} ${vbh}`}
          xmlns="http://www.w3.org/2000/svg"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            border: "1px solid #ccc",
            background: "white",
          }}
        >
          <g className="svg-guides">
            <polygon
              points={pointsAttr}
              fill="white"
              stroke="black"
              strokeWidth="1"
            />

            <rect
              className="margin-guide"
              x={0}
              y={0}
              width={width}
              height={mt}
              fill="rgba(255, 200, 200, 0.3)"
              stroke="none"
            />
            <rect
              className="margin-guide"
              x={0}
              y={height - mb}
              width={width}
              height={mb}
              fill="rgba(255, 200, 200, 0.3)"
              stroke="none"
            />
            <rect
              className="margin-guide"
              x={0}
              y={mt}
              width={ml}
              height={height - mt - mb}
              fill="rgba(255, 200, 200, 0.3)"
              stroke="none"
            />
            <rect
              className="margin-guide"
              x={width - mr}
              y={mt}
              width={mr}
              height={height - mt - mb}
              fill="rgba(255, 200, 200, 0.3)"
              stroke="none"
            />
            <rect
              x={ml}
              y={mt}
              width={width - ml - mr}
              height={height - mt - mb}
              fill="none"
            />

            {/* Edge dimension labels */}
            {edgeLabels.map((edge, i) => (
              <text
                key={`edge-label-${i}`}
                x={edge.labelX}
                y={edge.labelY}
                textAnchor={edge.textAnchor}
                fontSize={DIM_FONT}
                fill={DIM_COLOR}
                fontFamily="sans-serif"
                dominantBaseline="central"
              >
                {edge.length} mm
              </text>
            ))}
          </g>
          {shapes.map((shape, index) => renderShape(shape, index))}
        </svg>
      </div>
    );
  },
);

SvgPreview.displayName = "SvgPreview";

export default SvgPreview;
