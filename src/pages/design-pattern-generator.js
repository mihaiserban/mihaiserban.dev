import React, { useRef, useMemo, useCallback, useState } from "react";
import { ArrowLeft } from "react-feather";
import SEO from "../components/SEO";
import SettingsPanel from "../components/PatternGenerator/SettingsPanel";
import SvgPreview from "../components/PatternGenerator/SvgPreview";
import {
  generatePattern,
  calculateCoverage,
} from "../components/PatternGenerator/PatternEngine";
import { exportToPdf } from "../components/PatternGenerator/PdfExporter";
import { exportToDxf } from "../components/PatternGenerator/DxfExporter";
import usePersistedSettings from "../components/PatternGenerator/usePersistedSettings";
import ThemeTogglerComponent from "../components/themeToggler";
import "../styles/scss/components/pattern-generator.scss";


const DEFAULT_SETTINGS = {
  width: 1000,
  height: 2000,
  marginTop: 50,
  marginBottom: 50,
  marginLeft: 50,
  marginRight: 50,
  sheetShape: {
    topEdge: { startOffsetMm: 0, endOffsetMm: 0 },
    rightEdge: { startOffsetMm: 0, endOffsetMm: 0 },
    bottomEdge: { startOffsetMm: 0, endOffsetMm: 0 },
    leftEdge: { startOffsetMm: 0, endOffsetMm: 0 },
  },
  shapeType: "circle",
  shapeSize: 20,
  spacing: 40,
  opacity: 20,
  gradientType: "topToBottom",
  lineThickness: 30,
  lineMinLength: 100,
  lineMaxLength: 400,
  cornerRadius: 0,
  lineCornerRadius: 50,
};

const DesignPatternPage = () => {
  const [settings, setSettings, resetSettings] = usePersistedSettings(
    DEFAULT_SETTINGS,
    "settings.v2",
  );
  const svgRef = useRef(null);
  const [generation, setGeneration] = useState(0);

  const shapes = useMemo(() => generatePattern(settings), [settings, generation]);
  const coverage = useMemo(
    () => calculateCoverage(shapes, settings.width, settings.height),
    [shapes, settings.width, settings.height],
  );

  const handleExport = useCallback(async (format) => {
    if (format === "dxf") {
      try {
        const filename = `pattern-${settings.width}x${settings.height}.dxf`;
        exportToDxf(shapes, filename, settings.width, settings.height, settings.sheetShape);
      } catch (error) {
        console.error("DXF export failed:", error);
        alert("DXF export failed. Please try again.");
      }
      return;
    }

    if (!svgRef.current) return;
    try {
      const filename = `pattern-${settings.width}x${settings.height}.pdf`;
      await exportToPdf(
        svgRef.current,
        filename,
        settings.width,
        settings.height,
        settings,
      );
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("PDF export failed. Please try again.");
    }
  }, [settings, shapes]);

  const handleGenerate = useCallback(() => {
    setGeneration((n) => n + 1);
  }, []);


  return (
    <>
      <SEO
        title="Design Pattern Generator - Mihai Serban"
        description="Generate randomized cutout patterns for CNC laser cutting. Export to DXF or PDF. Customize shapes, density, gradients, and sheet dimensions."
        pathname="/design-pattern-generator"
      />
    <div className="pattern-generator-standalone">
      <div className="pattern-generator-header">
        <a href="/" className="pattern-back-button">
          <ArrowLeft size={20} />
          <span>mihaiserban.dev</span>
        </a>
        <h1 className="pattern-generator-title">Design Pattern Generator</h1>
        <div className="pattern-generator-header-actions">
          <ThemeTogglerComponent />
        </div>
      </div>
      <div className="pattern-generator-layout">
        <div className="pattern-settings">
          <SettingsPanel
            settings={settings}
            onChange={setSettings}
            onReset={resetSettings}
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
            sheetShape={settings.sheetShape}
          />
        </div>
      </div>
    </div>
    </>
  );
};

export default DesignPatternPage;
