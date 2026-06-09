import { jsPDF } from 'jspdf';

export async function exportToPdf(svgElement, filename, widthMm, heightMm) {
  if (!svgElement) {
    throw new Error('No SVG element provided');
  }

  const clone = svgElement.cloneNode(true);

  clone.querySelectorAll('.margin-guide').forEach((el) => el.remove());

  const vbParts = (svgElement.getAttribute('viewBox') || '').split(/[\s,]+/);
  const vbX = parseFloat(vbParts[0]) || 0;
  const vbY = parseFloat(vbParts[1]) || 0;
  const vbW = parseFloat(vbParts[2]) || widthMm;
  const vbH = parseFloat(vbParts[3]) || heightMm;

  const PAD = 50;
  const newVbX = vbX - PAD;
  const newVbY = vbY - PAD;
  const newVbW = vbW + PAD * 2;
  const newVbH = vbH + PAD * 2;

  clone.setAttribute('viewBox', `${newVbX} ${newVbY} ${newVbW} ${newVbH}`);
  clone.setAttribute('width', newVbW);
  clone.setAttribute('height', newVbH);

  clone.style.maxWidth = null;
  clone.style.maxHeight = null;
  clone.style.border = null;
  clone.style.background = null;

  const pdf = new jsPDF({
    unit: 'mm',
    format: [newVbW, newVbH],
    orientation: newVbW > newVbH ? 'landscape' : 'portrait',
    compress: true,
  });

  const { svg2pdf } = await import('svg2pdf.js');
  await svg2pdf(clone, pdf, {
    x: 0,
    y: 0,
    width: newVbW,
    height: newVbH,
  });

  pdf.save(filename);
}
