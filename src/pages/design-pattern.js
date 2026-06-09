import React, { useState, useRef, useMemo, useCallback } from 'react';
import { ArrowLeft } from 'react-feather';
import SettingsPanel from '../components/PatternGenerator/SettingsPanel';
import SvgPreview from '../components/PatternGenerator/SvgPreview';
import { generatePattern, calculateCoverage } from '../components/PatternGenerator/PatternEngine';
import { exportToPdf } from '../components/PatternGenerator/PdfExporter';
import '../styles/scss/components/pattern-generator.scss';

const DEFAULT_SETTINGS = {
  width: 1000,
  height: 2000,
  marginTop: 50,
  marginBottom: 50,
  marginLeft: 50,
  marginRight: 50,
  shapeType: 'circle',
  shapeSize: 20,
  spacing: 40,
  opacity: 50,
  gradientType: 'uniform',
  randomization: 30,
  seed: 12345,
};

const DesignPatternPage = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const svgRef = useRef(null);

  const shapes = useMemo(() => generatePattern(settings), [settings]);
  const coverage = useMemo(() => calculateCoverage(shapes, settings.width, settings.height), [shapes, settings.width, settings.height]);

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

  const handleGenerate = useCallback(() => {
    setSettings((prev) => ({ ...prev, seed: Math.floor(Math.random() * 2147483647) }));
  }, []);

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
            onGenerate={handleGenerate}
            shapeCount={shapes.length}
            coverage={coverage}
          />
        </div>
        <div className="pattern-preview">
          <SvgPreview
            ref={svgRef}
            width={settings.width}
            height={settings.height}
            shapes={shapes}
            marginTop={settings.marginTop}
            marginBottom={settings.marginBottom}
            marginLeft={settings.marginLeft}
            marginRight={settings.marginRight}
          />
        </div>
      </div>
    </div>
  );
};

export default DesignPatternPage;
