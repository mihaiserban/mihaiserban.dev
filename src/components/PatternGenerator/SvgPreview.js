import React, { forwardRef } from 'react';

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
        <rect
          x={0}
          y={0}
          width={width}
          height={mt}
          fill="rgba(255, 200, 200, 0.3)"
          stroke="none"
        />
        <rect
          x={0}
          y={height - mb}
          width={width}
          height={mb}
          fill="rgba(255, 200, 200, 0.3)"
          stroke="none"
        />
        <rect
          x={0}
          y={mt}
          width={ml}
          height={height - mt - mb}
          fill="rgba(255, 200, 200, 0.3)"
          stroke="none"
        />
        <rect
          x={width - mr}
          y={mt}
          width={mr}
          height={height - mt - mb}
          fill="rgba(255, 200, 200, 0.3)"
          stroke="none"
        />
        {/* Margin border lines */}
        <rect
          x={ml}
          y={mt}
          width={width - ml - mr}
          height={height - mt - mb}
          fill="none"
          stroke="rgba(255, 100, 100, 0.5)"
          strokeWidth="0.5"
          strokeDasharray="5,5"
        />
        {shapes.map((shape, index) => renderShape(shape, index))}
      </svg>
    </div>
  );
});

SvgPreview.displayName = 'SvgPreview';

export default SvgPreview;
