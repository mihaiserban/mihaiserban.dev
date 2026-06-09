import React from 'react';
import { SHAPE_TYPES, GRADIENT_TYPES } from './PatternEngine';

const SettingsPanel = ({ settings, onChange, onExport, onGenerate, shapeCount }) => {
  const handleChange = (key, value) => {
    onChange({ ...settings, [key]: value });
  };

  const inputClass = "block w-full mt-1 px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800 dark:text-white";
  const labelClass = "block text-sm font-medium mt-4";
  const groupClass = "mb-4";

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

        <label className={labelClass}>Margin (mm)</label>
        <input
          type="number"
          min={0}
          max={500}
          value={settings.margin}
          onChange={(e) => handleChange('margin', Number(e.target.value))}
          className={inputClass}
        />
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
          <option value={SHAPE_TYPES.ROUNDED_RECTANGLE}>Rounded Rectangle</option>
          <option value={SHAPE_TYPES.TRIANGLE}>Triangle</option>
          <option value={SHAPE_TYPES.HEXAGON}>Hexagon</option>
          <option value={SHAPE_TYPES.HORIZONTAL_LINE}>Horizontal Line</option>
          <option value={SHAPE_TYPES.VERTICAL_LINE}>Vertical Line</option>
        </select>

        <label className={labelClass}>Shape Size (mm)</label>
        <input
          type="number"
          min={1}
          max={500}
          value={settings.shapeSize}
          onChange={(e) => handleChange('shapeSize', Number(e.target.value))}
          className={inputClass}
        />

        <label className={labelClass}>Spacing (mm)</label>
        <input
          type="number"
          min={0}
          max={500}
          value={settings.spacing}
          onChange={(e) => handleChange('spacing', Number(e.target.value))}
          className={inputClass}
        />
      </div>

      <div className={groupClass}>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Distribution</h3>
        <label className={labelClass}>Opacity / Density (%)</label>
        <input
          type="range"
          min={0}
          max={100}
          value={settings.opacity}
          onChange={(e) => handleChange('opacity', Number(e.target.value))}
          className="block w-full mt-1"
        />
        <div className="text-xs text-gray-500 text-right">{settings.opacity}%</div>

        <label className={labelClass}>Gradient Direction</label>
        <select
          value={settings.gradientType}
          onChange={(e) => handleChange('gradientType', e.target.value)}
          className={inputClass}
        >
          <option value={GRADIENT_TYPES.HORIZONTAL}>Horizontal</option>
          <option value={GRADIENT_TYPES.VERTICAL}>Vertical</option>
          <option value={GRADIENT_TYPES.RADIAL}>Radial</option>
        </select>

        <label className={labelClass}>Randomization (%)</label>
        <input
          type="range"
          min={0}
          max={100}
          value={settings.randomization}
          onChange={(e) => handleChange('randomization', Number(e.target.value))}
          className="block w-full mt-1"
        />
        <div className="text-xs text-gray-500 text-right">{settings.randomization}%</div>
      </div>

      <div className={groupClass}>
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          Shapes: {shapeCount}
        </div>
        <button
          onClick={onGenerate}
          className="w-full px-4 py-2 mb-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Generate New Pattern
        </button>
        <button
          onClick={onExport}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;
