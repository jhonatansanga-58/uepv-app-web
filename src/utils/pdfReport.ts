import { jsPDF } from "jspdf";

export function initReportDoc(title: string, period?: string) {
  const doc = new jsPDF();
  let pageCount = 1;

  const drawHeaderFooter = (pNum: number) => {
    // Encabezado institucional decorativo
    doc.setFillColor(249, 241, 251); // Fondo morado muy claro
    doc.rect(15, 10, 180, 18, "F");

    // Texto de encabezado
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(132, 45, 156); // Color principal institucional #842d9c
    doc.text("UNIDAD EDUCATIVA \"PLENITUD DE VIDA\"", 105, 18, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Portal Académico UEPV • Control Escolar y Seguimiento", 105, 24, { align: "center" });

    // Línea morada gruesa separadora del encabezado
    doc.setDrawColor(132, 45, 156);
    doc.setLineWidth(0.5);
    doc.line(15, 28, 195, 28);

    // Línea gris clara superior del pie de página
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.3);
    doc.line(15, 275, 195, 275);

    // Texto del pie de página
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("Reporte emitido de forma digital y oficial desde el Portal UEPV", 15, 281);
    doc.text(`Impreso el: ${new Date().toLocaleDateString("es-ES")} a las ${new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`, 15, 286);
    doc.text(`Página ${pNum}`, 195, 286, { align: "right" });
  };

  // Dibujar primer encabezado y pie de página
  drawHeaderFooter(pageCount);

  // Título específico del reporte
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text(title.toUpperCase(), 15, 38);

  if (period) {
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Período de consulta: ${period}`, 15, 43);
  }

  const addPageWithHeaderFooter = () => {
    doc.addPage();
    pageCount++;
    drawHeaderFooter(pageCount);
  };

  return {
    doc,
    addPage: addPageWithHeaderFooter,
    getStartY: () => (period ? 50 : 44),
  };
}

export function drawTableHeader(doc: jsPDF, y: number, columns: { text: string; x: number }[]) {
  // Caja de fondo morada para los nombres de columnas
  doc.setFillColor(132, 45, 156); // #842d9c
  doc.rect(15, y - 5, 180, 8, "F");

  // Texto blanco
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  columns.forEach((col) => {
    doc.text(col.text, col.x, y);
  });
  doc.setTextColor(0, 0, 0); // restablecer a negro
}

export function drawRowDivider(doc: jsPDF, y: number) {
  doc.setDrawColor(235, 235, 235);
  doc.setLineWidth(0.2);
  doc.line(15, y, 195, y);
}

export function drawSummaryCards(doc: jsPDF, y: number, presentCount: number, leaveCount: number, absenceCount: number) {
  // Card 1: Asistencias
  doc.setFillColor(238, 253, 244);
  doc.setDrawColor(34, 197, 94);
  doc.roundedRect(15, y, 55, 22, 2, 2, "FD");
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(21, 128, 61);
  doc.text("ASISTENCIAS", 42.5, y + 7, { align: "center" });
  doc.setFontSize(14);
  doc.text(String(presentCount), 42.5, y + 16, { align: "center" });

  // Card 2: Licencias
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(59, 130, 246);
  doc.roundedRect(77.5, y, 55, 22, 2, 2, "FD");
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(29, 78, 216);
  doc.text("LICENCIAS", 105, y + 7, { align: "center" });
  doc.setFontSize(14);
  doc.text(String(leaveCount), 105, y + 16, { align: "center" });

  // Card 3: Faltas
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(239, 68, 68);
  doc.roundedRect(140, y, 55, 22, 2, 2, "FD");
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(185, 28, 28);
  doc.text("FALTAS", 167.5, y + 7, { align: "center" });
  doc.setFontSize(14);
  doc.text(String(absenceCount), 167.5, y + 16, { align: "center" });

  // Reset colors
  doc.setTextColor(0, 0, 0);
}

export function drawAttendanceProgressBar(doc: jsPDF, y: number, percentage: number) {
  // Label
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text(`Porcentaje de asistencia general: ${percentage.toFixed(1)}%`, 15, y);

  // Outer Bar
  doc.setFillColor(229, 231, 235);
  doc.roundedRect(15, y + 3, 180, 5, 1.5, 1.5, "F");

  // Inner Bar
  const activeWidth = Math.max(0, Math.min(180, (percentage / 100) * 180));
  if (activeWidth > 0) {
    doc.setFillColor(34, 197, 94);
    doc.roundedRect(15, y + 3, activeWidth, 5, 1.5, 1.5, "F");
  }

  // Reset colors
  doc.setTextColor(0, 0, 0);
}

export function drawAttendanceChart(doc: jsPDF, y: number, presentCount: number, leaveCount: number, absenceCount: number) {
  const maxVal = Math.max(presentCount, leaveCount, absenceCount, 1);

  // Ejes
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(45, y, 45, y + 30); // Y-axis
  doc.line(45, y + 30, 185, y + 30); // X-axis

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);

  // Categorías y Barras
  // 1. Asistencias (Verde)
  doc.text("Asistencias", 40, y + 8, { align: "right" });
  const w1 = (presentCount / maxVal) * 130;
  doc.setFillColor(34, 197, 94);
  if (w1 > 0) {
    doc.roundedRect(45, y + 4, w1, 5, 1, 1, "F");
  }
  doc.setFont("Helvetica", "normal");
  doc.text(String(presentCount), 45 + w1 + 3, y + 8);

  // 2. Licencias (Azul)
  doc.setFont("Helvetica", "bold");
  doc.text("Licencias", 40, y + 17, { align: "right" });
  const w2 = (leaveCount / maxVal) * 130;
  doc.setFillColor(59, 130, 246);
  if (w2 > 0) {
    doc.roundedRect(45, y + 13, w2, 5, 1, 1, "F");
  }
  doc.setFont("Helvetica", "normal");
  doc.text(String(leaveCount), 45 + w2 + 3, y + 17);

  // 3. Faltas (Rojo)
  doc.setFont("Helvetica", "bold");
  doc.text("Faltas", 40, y + 26, { align: "right" });
  const w3 = (absenceCount / maxVal) * 130;
  doc.setFillColor(239, 68, 68);
  if (w3 > 0) {
    doc.roundedRect(45, y + 22, w3, 5, 1, 1, "F");
  }
  doc.setFont("Helvetica", "normal");
  doc.text(String(absenceCount), 45 + w3 + 3, y + 26);

  // Reset colors
  doc.setTextColor(0, 0, 0);
}

export function drawReportSummaryBox(doc: jsPDF, y: number, items: { label: string; value: string | number }[]) {
  const boxHeight = 10 + (items.length * 6);
  // Fondo violeta claro
  doc.setFillColor(249, 241, 251);
  doc.setDrawColor(132, 45, 156);
  doc.roundedRect(15, y, 180, boxHeight, 2, 2, "FD");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(132, 45, 156);
  doc.text("RESUMEN GENERAL", 20, y + 6);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);

  items.forEach((item, index) => {
    const textY = y + 12 + (index * 5.5);
    
    doc.setFont("Helvetica", "bold");
    doc.text(`${item.label}:`, 20, textY);
    
    // Measure label width while the font is still bold
    const labelWidth = doc.getTextWidth(`${item.label}:`);
    
    doc.setFont("Helvetica", "normal");
    // Position the value after the bold label with a 2 unit spacing buffer
    doc.text(String(item.value), 20 + labelWidth + 2, textY);
  });

  // Reset colors
  doc.setTextColor(0, 0, 0);
  return boxHeight;
}
