import React, { forwardRef } from 'react';

const SvgPreview = forwardRef(({ width, height, shapes }, ref) => {
  const renderShape = (shape, index) => {
    const { type, x, y, size } = shape;
    const half = size / 2;
    const key = `shape-${index}`;

    switch (type) {
      case 'circle':
        return (
          <circle
            key={key}
            cx={x}
            cy={y}
            r={half}
            fill="none"
            stroke="black"
            strokeWidth="0.5"
          />
        );

      case 'square':
        return (
          <rect
            key={key}
            x={x - half}
            y={y - half}
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
            x={x - half}
            y={y - half}
            width={size}
            height={size}
            rx={size * 0.2}
            ry={size * 0.2}
            fill="none"
            stroke="black"
            strokeWidth="0.5"
          />
        );

      case 'triangle': {
        const h = (size * Math.sqrt(3)) / 2;
        const points = [
          `${x},${y - h / 2}`,
          `${x - half},${y + h / 2}`,
          `${x + half},${y + h / 2}`,
        ].join(' ');
        return (
          <polygon
            key={key}
            points={points}
            fill="none"
            stroke="black"
            strokeWidth="0.5"
          />
        );
      }

      case 'hexagon': {
        const hexPoints = [];
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          hexPoints.push(`${x + half * Math.cos(angle)},${y + half * Math.sin(angle)}`);
        }
        return (
          <polygon
            key={key}
            points={hexPoints.join(' ')}
            fill="none"
            stroke="black"
            strokeWidth="0.5"
          />
        );
      }

      case 'horizontalLine':
        return (
          <line
            key={key}
            x1={x - half}
            y1={y}
            x2={x + half}
            y2={y}
            stroke="black"
            strokeWidth="0.5"
          />
        );

      case 'verticalLine':
        return (
          <line
            key={key}
            x1={x}
            y1={y - half}
            x2={x}
            y2={y + half}
            stroke="black"
            strokeWidth="0.5"
          />
        );

      default:
        return null;
    }
  };

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
        {shapes.map((shape, index) => renderShape(shape, index))}
      </svg>
    </div>
  );
});

SvgPreview.displayName = 'SvgPreview';

export default SvgPreview;
