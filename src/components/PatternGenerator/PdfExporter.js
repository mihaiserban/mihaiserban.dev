import { jsPDF } from 'jspdf';
import { svg2pdf } from 'svg2pdf.js';

export async function exportToPdf(svgElement, filename, widthMm, heightMm) {
  if (!svgElement) {
    throw new Error('No SVG element provided');
  }

  const pdf = new jsPDF({
    unit: 'mm',
    format: [widthMm, heightMm],
    orientation: widthMm > heightMm ? 'landscape' : 'portrait',
    compress: true,
  });

  await svg2pdf(svgElement, pdf, {
    x: 0,
    y: 0,
    width: widthMm,
    height: heightMm,
  });

  pdf.save(filename);
}
