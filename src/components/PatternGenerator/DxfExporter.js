const BULGE_90 = Math.tan(Math.PI / 8);

function polygonToDxf(x1, y1, x2, y2, r) {
  if (r <= 0) {
    return [
      ['10', x1], ['20', y1],
      ['10', x2], ['20', y1],
      ['10', x2], ['20', y2],
      ['10', x1], ['20', y2],
    ];
  }

  const segs = [];
  const push = (g, v) => segs.push([g, v]);

  push('10', x1 + r); push('20', y1);
  push('10', x2 - r); push('20', y1);
  push('42', BULGE_90);
  push('10', x2); push('20', y1 + r);
  push('10', x2); push('20', y2 - r);
  push('42', BULGE_90);
  push('10', x2 - r); push('20', y2);
  push('10', x1 + r); push('20', y2);
  push('42', BULGE_90);
  push('10', x1); push('20', y2 - r);
  push('10', x1); push('20', y1 + r);
  push('42', BULGE_90);

  return segs;
}

function circleToDxf(x, y, radius) {
  return [
    ['10', x], ['20', y], ['40', radius],
  ];
}

function buildDxf(entities) {
  const lines = [
    '0', 'SECTION',
    '2', 'ENTITIES',
  ];

  for (const ent of entities) {
    if (ent.type === 'CIRCLE') {
      lines.push('0', 'CIRCLE', '8', '0');
      for (const [g, v] of ent.data) {
        lines.push(g, String(v));
      }
    } else if (ent.type === 'LWPOLYLINE') {
      lines.push('0', 'LWPOLYLINE', '8', '0');
      lines.push('90', String(ent.vertexCount));
      lines.push('70', '1');
      for (const [g, v] of ent.data) {
        lines.push(g, String(v));
      }
    }
  }

  lines.push('0', 'ENDSEC', '0', 'EOF');
  return lines.join('\n');
}

function round4(n) {
  return Math.round(n * 10000) / 10000;
}

export function exportToDxf(shapes, filename, width, height) {
  const entities = [];

  const outlineData = polygonToDxf(0, height, width, 0, 0);
  entities.push({
    type: 'LWPOLYLINE',
    vertexCount: 4,
    data: outlineData,
  });

  const flipY = (svgy) => round4(height - svgy);

  for (const shape of shapes) {
    const { type, x, size } = shape;
    const svgy = round4(shape.y);
    const dxfY = flipY(shape.y);

    switch (type) {
      case 'circle': {
        const radius = round4(size / 2);
        entities.push({
          type: 'CIRCLE',
          data: circleToDxf(round4(x), dxfY, radius),
        });
        break;
      }

      case 'square': {
        const half = size / 2;
        const cr = shape.cornerRadius != null ? shape.cornerRadius : 0;
        const r = round4(half * (cr / 50));
        const x1 = round4(x - half);
        const x2 = round4(x + half);
        const y1 = round4(svgy - half);
        const y2 = round4(svgy + half);
        const data = polygonToDxf(x1, flipY(y2), x2, flipY(y1), r);
        entities.push({
          type: 'LWPOLYLINE',
          vertexCount: cr > 0 ? 8 : 4,
          data,
        });
        break;
      }

      case 'horizontalLine': {
        const lineLen = shape.lineLength || size;
        const halfLen = lineLen / 2;
        const halfH = size / 2;
        const cr = shape.cornerRadius != null ? shape.cornerRadius : 50;
        const r = round4(halfH * (cr / 50));
        const x1 = round4(x - halfLen);
        const x2 = round4(x + halfLen);
        const y1 = round4(svgy - halfH);
        const y2 = round4(svgy + halfH);
        const data = polygonToDxf(x1, flipY(y2), x2, flipY(y1), r);
        entities.push({
          type: 'LWPOLYLINE',
          vertexCount: cr > 0 ? 8 : 4,
          data,
        });
        break;
      }

      case 'verticalLine': {
        const lineLen = shape.lineLength || size;
        const halfLen = lineLen / 2;
        const halfH = size / 2;
        const cr = shape.cornerRadius != null ? shape.cornerRadius : 50;
        const r = round4(halfH * (cr / 50));
        const x1 = round4(x - halfH);
        const x2 = round4(x + halfH);
        const y1 = round4(svgy - halfLen);
        const y2 = round4(svgy + halfLen);
        const data = polygonToDxf(x1, flipY(y2), x2, flipY(y1), r);
        entities.push({
          type: 'LWPOLYLINE',
          vertexCount: cr > 0 ? 8 : 4,
          data,
        });
        break;
      }

      default:
        break;
    }
  }

  const dxf = buildDxf(entities);
  const blob = new Blob([dxf], { type: 'application/dxf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
