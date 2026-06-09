import React, { useState, useRef, useMemo, useCallback } from 'react';
import { ArrowLeft } from 'react-feather';
import SettingsPanel from '../components/PatternGenerator/SettingsPanel';
import SvgPreview from '../components/PatternGenerator/SvgPreview';
import { generatePattern } from '../components/PatternGenerator/PatternEngine';
import { exportToPdf } from '../components/PatternGenerator/PdfExporter';
import '../styles/scss/components/pattern-generator.scss';

const DEFAULT_SETTINGS = {
  width: 1000,
  height: 2000,
  margin: 50,
  shapeType: 'circle',
  shapeSize: 20,
  spacing: 40,
  opacity: 50,
  gradientType: 'vertical',
  randomization: 30,
};

const DesignPatternPage = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const svgRef = useRef(null);

  const shapes = useMemo(() => generatePattern(settings), [settings]);

  const handleExport = useCallback(async () => {
    if (!svgRef.current) return;
    try {
      const filename = `pattern-${settings.width}x${settings.height}.pdf`;
      await exportToPdf(svgRef.current, filename, settings.width, settings.height);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDF export failed. Please try again.');
    }
  }, [settings]);

  return (
    <div className="pattern-generator-standalone">
      <div className="pattern-generator-header">
        <a href="/" className="pattern-back-button">
          <ArrowLeft size={20} />
          <span>Back to site</span>
        </a>
        <h1 className="pattern-generator-title">Design Pattern Generator</h1>
        <div className="pattern-generator-spacer" />
      </div>
      <div className="pattern-generator-layout">
        <div className="pattern-settings">
          <SettingsPanel
            settings={settings}
            onChange={setSettings}
            onExport={handleExport}
            shapeCount={shapes.length}
          />
        </div>
        <div className="pattern-preview">
          <SvgPreview
            ref={svgRef}
            width={settings.width}
            height={settings.height}
            shapes={shapes}
          />
        </div>
      </div>
    </div>
  );
};

export default DesignPatternPage;
