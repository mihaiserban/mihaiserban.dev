import React, { useState, useMemo } from 'react';
import { SHAPE_TYPES, GRADIENT_TYPES } from './PatternEngine';
import {
  getSheetVertices,
  getVertexAngles,
  normalizeSheetShape,
  SHEET_SHAPE_DEFAULT,
} from './sheetOutline';

const SettingsPanel = ({ settings, onChange, onReset, onExport, onGenerate, shapeCount, coverage }) => {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [sheetShapeOpen, setSheetShapeOpen] = useState(false);
  const handleChange = (key, value) => {
    const next = { ...settings, [key]: value };
    if (key === 'shapeType') {
      if (value === SHAPE_TYPES.HORIZONTAL_LINE || value === SHAPE_TYPES.VERTICAL_LINE) {
        next.spacing = next.lineThickness || 30;
      } else {
        next.spacing = next.shapeSize || 20;
      }
    }
    onChange(next);
  };

  const handleShapeSizeChange = (key, value) => {
    onChange({ ...settings, [key]: value });
  };

  const inputClass = "block w-full mt-1 px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800 dark:text-white";
  const labelClass = "block text-sm font-medium mt-4";
  const groupClass = "mb-4";

  const isLine = settings.shapeType === SHAPE_TYPES.HORIZONTAL_LINE || settings.shapeType === SHAPE_TYPES.VERTICAL_LINE;

  const sheetShape = normalizeSheetShape(settings.sheetShape, settings.width, settings.height);
  const corners = useMemo(
    () => getVertexAngles(getSheetVertices(settings.width, settings.height, sheetShape)),
    [settings.width, settings.height, settings.sheetShape],
  );

  const updateEdge = (key, field, value) => {
    if (value === '') return;
    const current = settings.sheetShape || SHEET_SHAPE_DEFAULT;
    onChange({
      ...settings,
      sheetShape: {
        ...current,
        [key]: { ...(current[key] || {}), [field]: Number(value) },
      },
    });
  };

  const handleResetAllEdges = () => {
    onChange({ ...settings, sheetShape: SHEET_SHAPE_DEFAULT });
  };

  const EDGE_META = [
    { key: 'topEdge', label: 'Top', startCorner: 'Top-left', endCorner: 'Top-right' },
    { key: 'rightEdge', label: 'Right', startCorner: 'Top-right', endCorner: 'Bottom-right' },
    { key: 'bottomEdge', label: 'Bottom', startCorner: 'Bottom-right', endCorner: 'Bottom-left' },
    { key: 'leftEdge', label: 'Left', startCorner: 'Bottom-left', endCorner: 'Top-left' },
  ];

  const maxOffset = Math.max(1, Math.min(settings.width, settings.height) / 2);

  return (
    <div className="settings-panel">
      <h2 className="text-lg font-bold mb-4">Pattern Settings</h2>

      <div className={groupClass}>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Canvas</h3>
        <label className={labelClass}>Width (mm)</label>
        <input
          type="number"
          min={10}
          max={3000}
          value={settings.width}
          onChange={(e) => handleChange('width', Number(e.target.value))}
          className={inputClass}
        />

        <label className={labelClass}>Height (mm)</label>
        <input
          type="number"
          min={10}
          max={3000}
          value={settings.height}
          onChange={(e) => handleChange('height', Number(e.target.value))}
          className={inputClass}
        />
      </div>

      <div className={groupClass}>
        <button
          type="button"
          onClick={() => setSheetShapeOpen(!sheetShapeOpen)}
          className="flex items-center justify-between w-full text-sm font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <span>Sheet Shape</span>
          <span>{sheetShapeOpen ? '▾' : '▸'}</span>
        </button>
        {sheetShapeOpen && (
          <>
            {EDGE_META.map(({ key, label, startCorner, endCorner }) => {
              const edge = sheetShape[key];
              return (
                <div key={key} className="mt-3">
                  <div className="text-sm font-medium">{label}</div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <label className="block text-xs text-gray-500">{startCorner}</label>
                      <input
                        type="number"
                        min={-maxOffset}
                        max={maxOffset}
                        step={1}
                        value={edge.startOffsetMm}
                        onChange={(e) => updateEdge(key, 'startOffsetMm', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">{endCorner}</label>
                      <input
                        type="number"
                        min={-maxOffset}
                        max={maxOffset}
                        step={1}
                        value={edge.endOffsetMm}
                        onChange={(e) => updateEdge(key, 'endOffsetMm', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={-maxOffset}
                    max={maxOffset}
                    step={1}
                    value={key === 'topEdge' || key === 'bottomEdge' ? edge.startOffsetMm : -edge.startOffsetMm}
                    onChange={(e) => {
                      const val = key === 'topEdge' || key === 'bottomEdge' ? Number(e.target.value) : -Number(e.target.value);
                      updateEdge(key, 'startOffsetMm', val);
                    }}
                    className="block w-full mt-1"
                    style={{ direction: key === 'topEdge' || key === 'bottomEdge' ? 'ltr' : 'rtl' }}
                  />
                  <input
                    type="range"
                    min={-maxOffset}
                    max={maxOffset}
                    step={1}
                    value={key === 'topEdge' || key === 'bottomEdge' ? edge.endOffsetMm : -edge.endOffsetMm}
                    onChange={(e) => {
                      const val = key === 'topEdge' || key === 'bottomEdge' ? Number(e.target.value) : -Number(e.target.value);
                      updateEdge(key, 'endOffsetMm', val);
                    }}
                    className="block w-full mt-1"
                    style={{ direction: key === 'topEdge' || key === 'bottomEdge' ? 'ltr' : 'rtl' }}
                  />
                </div>
              );
            })}

            <div className="mt-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Corners</h4>
              <ul className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                {corners.map((c, i) => (
                  <li key={`corner-${i}`}>
                    {c.role} — {c.angleDegrees}°
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={handleResetAllEdges}
              className="mt-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
            >
              Reset all edges
            </button>
          </>
        )}
      </div>

      <div className={groupClass}>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Margins (mm)</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium mt-2">Top</label>
            <input
              type="number"
              min={0}
              max={500}
              value={settings.marginTop}
              onChange={(e) => handleChange('marginTop', Number(e.target.value))}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mt-2">Bottom</label>
            <input
              type="number"
              min={0}
              max={500}
              value={settings.marginBottom}
              onChange={(e) => handleChange('marginBottom', Number(e.target.value))}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mt-2">Left</label>
            <input
              type="number"
              min={0}
              max={500}
              value={settings.marginLeft}
              onChange={(e) => handleChange('marginLeft', Number(e.target.value))}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mt-2">Right</label>
            <input
              type="number"
              min={0}
              max={500}
              value={settings.marginRight}
              onChange={(e) => handleChange('marginRight', Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className={groupClass}>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Shape</h3>
        <label className={labelClass}>Shape Type</label>
        <select
          value={settings.shapeType}
          onChange={(e) => handleChange('shapeType', e.target.value)}
          className={inputClass}
        >
          <option value={SHAPE_TYPES.CIRCLE}>Circle</option>
          <option value={SHAPE_TYPES.SQUARE}>Square</option>
          <option value={SHAPE_TYPES.HORIZONTAL_LINE}>Horizontal Line</option>
          <option value={SHAPE_TYPES.VERTICAL_LINE}>Vertical Line</option>
        </select>

        {isLine ? (
          <>
            <label className={labelClass}>Line Height (mm)</label>
            <input
              type="number"
              min={1}
              max={100}
              value={settings.lineThickness}
              onChange={(e) => handleShapeSizeChange('lineThickness', Number(e.target.value))}
              className={inputClass}
            />
            <label className={labelClass}>Min Length (mm)</label>
            <input
              type="number"
              min={1}
              max={500}
              value={settings.lineMinLength}
              onChange={(e) => handleChange('lineMinLength', Number(e.target.value))}
              className={inputClass}
            />
            <label className={labelClass}>Max Length (mm)</label>
            <input
              type="number"
              min={1}
              max={500}
              value={settings.lineMaxLength}
              onChange={(e) => handleChange('lineMaxLength', Number(e.target.value))}
              className={inputClass}
            />
            <label className={labelClass}>Corner Radius (%)</label>
            <input
              type="range"
              min={0}
              max={50}
              value={settings.lineCornerRadius != null ? settings.lineCornerRadius : 50}
              onChange={(e) => handleChange('lineCornerRadius', Number(e.target.value))}
              className="block w-full mt-1"
            />
            <div className="text-xs text-gray-500 text-right">{settings.lineCornerRadius != null ? settings.lineCornerRadius : 50}%</div>
          </>
        ) : (
          <>
            <label className={labelClass}>Shape Size (mm)</label>
            <input
              type="number"
              min={1}
              max={500}
              value={settings.shapeSize}
              onChange={(e) => handleShapeSizeChange('shapeSize', Number(e.target.value))}
              className={inputClass}
            />
            {settings.shapeType === SHAPE_TYPES.SQUARE && (
              <>
                <label className={labelClass}>Corner Radius (%)</label>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={settings.cornerRadius != null ? settings.cornerRadius : 0}
                  onChange={(e) => handleChange('cornerRadius', Number(e.target.value))}
                  className="block w-full mt-1"
                />
                <div className="text-xs text-gray-500 text-right">{settings.cornerRadius != null ? settings.cornerRadius : 0}%</div>
              </>
            )}
          </>
        )}

        <label className={labelClass}>Spacing (mm)</label>
        <input
          type="number"
          min={0}
          max={500}
          value={settings.spacing}
          onChange={(e) => handleChange('spacing', Number(e.target.value))}
          className={inputClass}
        />
        <div className="text-xs text-gray-400 leading-tight">Gap between shapes. Auto-sets to shape size when changing type or size.</div>
      </div>

      <div className={groupClass}>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Distribution</h3>
        <label className={labelClass}>Density (%)</label>
        <input
          type="range"
          min={0}
          max={100}
          value={settings.opacity}
          onChange={(e) => handleChange('opacity', Number(e.target.value))}
          className="block w-full mt-1"
        />
        <div className="text-xs text-gray-500 text-right">{settings.opacity}%</div>
        <div className="text-xs text-gray-400 mt-1 leading-tight">Maximum density at the dense end of the gradient. The sparse end stays around 10% of this. Non-linear curve with Floyd-Steinberg dithering for an even spread.</div>

        <label className={labelClass}>Gradient Direction</label>
        <select
          value={settings.gradientType}
          onChange={(e) => handleChange('gradientType', e.target.value)}
          className={inputClass}
        >
          <option value={GRADIENT_TYPES.UNIFORM}>Uniform</option>
          <option value={GRADIENT_TYPES.LEFT_TO_RIGHT}>Left to Right</option>
          <option value={GRADIENT_TYPES.RIGHT_TO_LEFT}>Right to Left</option>
          <option value={GRADIENT_TYPES.TOP_TO_BOTTOM}>Top to Bottom</option>
          <option value={GRADIENT_TYPES.BOTTOM_TO_TOP}>Bottom to Top</option>
          <option value={GRADIENT_TYPES.RADIAL}>Radial</option>
        </select>
        <div className="text-xs text-gray-400 mt-1 leading-tight">How density fades across the canvas. Uniform keeps it even everywhere.</div>
      </div>

      <div className={groupClass}>
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
          Shapes: {shapeCount}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
          Cutout: {coverage.toFixed(2)}%
        </div>
        <div className="text-xs text-gray-400 mb-2 leading-tight">Total area removed from sheet. Depends on shape size, spacing, and density.</div>
        <button
          onClick={onGenerate}
          className="w-full px-4 py-2 mb-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Generate New Pattern
        </button>
        <label className={labelClass}>Export Format</label>
        <select
          value={exportFormat}
          onChange={(e) => setExportFormat(e.target.value)}
          className={inputClass}
        >
          <option value="pdf">PDF</option>
          <option value="dxf">DXF</option>
        </select>
        <button
          onClick={() => onExport(exportFormat)}
          className="w-full px-4 py-2 mt-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Export
        </button>
        {onReset && (
          <button
            onClick={onReset}
            className="w-full px-2 py-1 mt-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
          >
            Reset to defaults
          </button>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;
