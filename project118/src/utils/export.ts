import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Pattern, Yarn } from '@/types';

export async function exportPatternAsPDF(
  pattern: Pattern, yarns: Yarn[]): Promise<void> {
  const canvas = document.getElementById('pattern-preview');
  if (!canvas) {
    throw new Error('Pattern preview element not found');
  }
  
  const canvasImage = await html2canvas(canvas, {
    backgroundColor: '#ffffff',
    scale: 2
  });
  
  const imgData = canvasImage.toDataURL('image/png');
  
  const pdf = new jsPDF({
    orientation: pattern.gridWidth > pattern.gridHeight ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  pdf.setFontSize(18);
  pdf.text(pattern.name, pageWidth / 2, 20, { align: 'center' });
  
  if (pattern.description) {
    pdf.setFontSize(12);
    pdf.text(pattern.description, pageWidth / 2, 30, { align: 'center' });
  }
  
  const imgWidth = pageWidth - 40;
  const imgHeight = (canvasImage.height / canvasImage.width) * imgWidth;
  const startY = pattern.description ? 40 : 35;
  
  pdf.addImage(imgData, 'PNG', 20, startY, imgWidth, Math.min(imgHeight, pageHeight - startY - 60));
  
  const yarnMap = new Map(yarns.map(y => [y.id, y]));
  const usedYarns = pattern.usedYarns
    .map(id => yarnMap.get(id))
    .filter(Boolean) as Yarn[];
  
  if (usedYarns.length > 0) {
    let listY = startY + Math.min(imgHeight, pageHeight - startY - 60) + 10;
    
    if (listY > pageHeight - 50) {
      pdf.addPage();
      listY = 30;
    }
    
    pdf.setFontSize(14);
    pdf.text('材料清单', 20, listY);
    listY += 8;
    
    pdf.setFontSize(10);
    usedYarns.forEach((yarn, index) => {
      if (listY > pageHeight - 30) {
        pdf.addPage();
        listY = 30;
      }
      pdf.setFillColor(yarn.colorHex);
      pdf.rect(20, listY - 3, 8, 8, 'F');
      pdf.text(`${index + 1}. ${yarn.brand} - ${yarn.colorName} (${yarn.colorCode})`, 32, listY + 3);
      listY += 10;
    });
  }
  
  pdf.save(`${pattern.name}.pdf`);
}

export async function exportPatternAsImage(pattern: Pattern): Promise<string> {
  const canvas = document.getElementById('pattern-preview');
  if (!canvas) {
    throw new Error('Pattern preview element not found');
  }
  
  const canvasImage = await html2canvas(canvas, {
    backgroundColor: '#ffffff',
    scale: 2
  });
  
  return canvasImage.toDataURL('image/png');
}

export function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export function downloadCSV(content: string, filename: string): void {
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function exportDataAsJSON(data: unknown, filename: string): void {
  const content = JSON.stringify(data, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
