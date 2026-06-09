import React, { forwardRef } from 'react';

const ARROW_SIZE = 4;
const DIM_COLOR = '#666';
const DIM_STROKE = '0.35';
const DIM_FONT = 7;

const SvgPreview = forwardRef(({ width, height, shapes, marginTop, marginBottom, marginLeft, marginRight }, ref) => {
  const renderShape = (shape, index) => {
    const { type, x, y, size } = shape;
    const key = `shape-${index}`;

    switch (type) {
      case 'circle':
        return (
          <circle
            key={key}
            cx={x}
            cy={y}
            r={size / 2}
            fill="none"
            stroke="black"
            strokeWidth="0.5"
          />
        );

      case 'square':
        return (
          <rect
            key={key}
            x={x - size / 2}
            y={y - size / 2}
            width={size}
            height={size}
            fill="none"
            stroke="black"
            strokeWidth="0.5"
          />
        );

      case 'roundedRectangle':
        return (
          <rect
            key={key}
            x={x - size / 2}
            y={y - size / 2}
            width={size}
            height={size}
            rx={size * 0.2}
            ry={size * 0.2}
            fill="none"
            stroke="black"
            strokeWidth="0.5"
          />
        );

      case 'horizontalLine': {
        const lineLen = shape.lineLength || size;
        const halfLen = lineLen / 2;
        const h = size / 2;
        return (
          <rect
            key={key}
            x={x - halfLen}
            y={y - h}
            width={lineLen}
            height={size}
            rx={h}
            ry={h}
            fill="none"
            stroke="black"
            strokeWidth="0.5"
          />
        );
      }

      case 'verticalLine': {
        const lineLen = shape.lineLength || size;
        const halfLen = lineLen / 2;
        const h = size / 2;
        return (
          <rect
            key={key}
            x={x - h}
            y={y - halfLen}
            width={size}
            height={lineLen}
            rx={h}
            ry={h}
            fill="none"
            stroke="black"
            strokeWidth="0.5"
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

  const dimY = height - Math.max(mb * 0.3, 6);
  const dimX = Math.max(ml * 0.3, 6);

  return (
    <div className="svg-preview-container">
      <svg
        ref={ref}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          border: '1px solid #ccc',
          background: 'white',
        }}
      >
        {/* Margin visualization */}
        <rect x={0} y={0} width={width} height={mt} fill="rgba(255, 200, 200, 0.3)" stroke="none" />
        <rect x={0} y={height - mb} width={width} height={mb} fill="rgba(255, 200, 200, 0.3)" stroke="none" />
        <rect x={0} y={mt} width={ml} height={height - mt - mb} fill="rgba(255, 200, 200, 0.3)" stroke="none" />
        <rect x={width - mr} y={mt} width={mr} height={height - mt - mb} fill="rgba(255, 200, 200, 0.3)" stroke="none" />
        <rect x={ml} y={mt} width={width - ml - mr} height={height - mt - mb} fill="none" stroke="rgba(255, 100, 100, 0.5)" strokeWidth="0.5" strokeDasharray="5,5" />

        {/* Dimension: Width (bottom, spans full canvas) */}
        <line x1={0} y1={dimY} x2={width} y2={dimY} stroke={DIM_COLOR} strokeWidth={DIM_STROKE} />
        <polygon points={`0,${dimY} ${ARROW_SIZE},${dimY-ARROW_SIZE} ${ARROW_SIZE},${dimY+ARROW_SIZE}`} fill={DIM_COLOR} />
        <polygon points={`${width},${dimY} ${width-ARROW_SIZE},${dimY-ARROW_SIZE} ${width-ARROW_SIZE},${dimY+ARROW_SIZE}`} fill={DIM_COLOR} />
        <text x={width / 2} y={dimY - 4} textAnchor="middle" fontSize={DIM_FONT} fill={DIM_COLOR} fontFamily="sans-serif">
          {width} mm
        </text>

        {/* Dimension: Height (left, spans full canvas) */}
        <line x1={dimX} y1={0} x2={dimX} y2={height} stroke={DIM_COLOR} strokeWidth={DIM_STROKE} />
        <polygon points={`${dimX},0 ${dimX-ARROW_SIZE},${ARROW_SIZE} ${dimX+ARROW_SIZE},${ARROW_SIZE}`} fill={DIM_COLOR} />
        <polygon points={`${dimX},${height} ${dimX-ARROW_SIZE},${height-ARROW_SIZE} ${dimX+ARROW_SIZE},${height-ARROW_SIZE}`} fill={DIM_COLOR} />
        <text x={dimX + 6} y={height / 2} textAnchor="middle" fontSize={DIM_FONT} fill={DIM_COLOR} fontFamily="sans-serif" transform={`rotate(-90, ${dimX + 6}, ${height / 2})`}>
          {height} mm
        </text>

        {shapes.map((shape, index) => renderShape(shape, index))}
      </svg>
    </div>
  );
});

SvgPreview.displayName = 'SvgPreview';

export default SvgPreview;
