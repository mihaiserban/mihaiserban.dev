import { jsPDF } from 'jspdf';

export async function exportToPdf(svgElement, filename, widthMm, heightMm) {
  if (!svgElement) {
    throw new Error('No SVG element provided');
  }

  const clone = svgElement.cloneNode(true);

  clone.querySelectorAll('.svg-guides').forEach((el) => el.remove());

  clone.setAttribute('viewBox', `0 0 ${widthMm} ${heightMm}`);
  clone.setAttribute('width', widthMm);
  clone.setAttribute('height', heightMm);
  clone.style.maxWidth = null;
  clone.style.maxHeight = null;
  clone.style.border = null;
  clone.style.background = null;

  const pdf = new jsPDF({
    unit: 'mm',
    format: [widthMm, heightMm],
    orientation: widthMm > heightMm ? 'landscape' : 'portrait',
    compress: true,
  });

  const { svg2pdf } = await import('svg2pdf.js');
  await svg2pdf(clone, pdf, {
    x: 0,
    y: 0,
    width: widthMm,
    height: heightMm,
  });

  pdf.save(filename);
}
