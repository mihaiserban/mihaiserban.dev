import React, { forwardRef } from "react";

const ARROW_SIZE = 10;
const DIM_COLOR = "#000000";
const DIM_STROKE = "1";
const DIM_FONT = 40;
const DIM_PAD = 28;

const SvgPreview = forwardRef(
  (
    { width, height, shapes, marginTop, marginBottom, marginLeft, marginRight },
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

    const vbx = -DIM_PAD;
    const vby = -DIM_PAD;
    const vbw = width + DIM_PAD * 2 + 50;
    const vbh = height + DIM_PAD * 2 + 50;

    const dimBotY = height + DIM_PAD * 0.65;
    const dimLeftX = -DIM_PAD * 0.65;

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
            <rect
              x={0}
              y={0}
              width={width}
              height={height}
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

            {/* Dimension: Width */}
            <line
              x1={0}
              y1={dimBotY}
              x2={width}
              y2={dimBotY}
              stroke={DIM_COLOR}
              strokeWidth={DIM_STROKE}
            />
            <polygon
              points={`0,${dimBotY} ${ARROW_SIZE},${dimBotY - ARROW_SIZE} ${ARROW_SIZE},${dimBotY + ARROW_SIZE}`}
              fill={DIM_COLOR}
            />
            <polygon
              points={`${width},${dimBotY} ${width - ARROW_SIZE},${dimBotY - ARROW_SIZE} ${width - ARROW_SIZE},${dimBotY + ARROW_SIZE}`}
              fill={DIM_COLOR}
            />
            <line x1={0} y1={dimBotY - 8} x2={0} y2={0} />
            <line x1={width} y1={dimBotY - 8} x2={width} y2={0} />
            <text
              x={width / 2}
              y={dimBotY + DIM_FONT}
              textAnchor="middle"
              fontSize={DIM_FONT}
              fill={DIM_COLOR}
              fontFamily="sans-serif"
            >
              {width} mm
            </text>

            {/* Dimension: Height */}
            <line
              x1={dimLeftX}
              y1={0}
              x2={dimLeftX}
              y2={height}
              stroke={DIM_COLOR}
              strokeWidth={DIM_STROKE}
            />
            <polygon
              points={`${dimLeftX},0 ${dimLeftX - ARROW_SIZE},${ARROW_SIZE} ${dimLeftX + ARROW_SIZE},${ARROW_SIZE}`}
              fill={DIM_COLOR}
            />
            <polygon
              points={`${dimLeftX},${height} ${dimLeftX - ARROW_SIZE},${height - ARROW_SIZE} ${dimLeftX + ARROW_SIZE},${height - ARROW_SIZE}`}
              fill={DIM_COLOR}
            />
            <line x1={dimLeftX - 8} y1={0} x2={0} y2={0} />
            <line x1={dimLeftX - 8} y1={height} x2={0} y2={height} />
            <text
              x={dimLeftX - 7}
              y={height / 2}
              textAnchor="middle"
              fontSize={DIM_FONT}
              fill={DIM_COLOR}
              fontFamily="sans-serif"
              transform={`rotate(-90, ${dimLeftX - 7}, ${height / 2})`}
            >
              {height} mm
            </text>
          </g>
          {shapes.map((shape, index) => renderShape(shape, index))}
        </svg>
      </div>
    );
  },
);

SvgPreview.displayName = "SvgPreview";

export default SvgPreview;
