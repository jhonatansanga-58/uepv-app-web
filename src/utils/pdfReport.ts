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
