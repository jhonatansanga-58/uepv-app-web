import { NextRequest, NextResponse } from "next/server";

interface AttendanceReportData {
  title: string;
  student: string;
  dateRange: string;
  attendances: Array<{
    date: string;
    registeredBy: string;
  }>;
}

interface RequestBody {
  format: "pdf" | "excel";
  data: AttendanceReportData;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { format, data } = body;

    let blob: Blob;
    let contentType: string;

    if (format === "pdf") {
      // Here you would use a PDF generation library like PDFKit or jsPDF
      // For now, just returning a text file as placeholder
      const content = `
${data.title}
Estudiante: ${data.student}
Período: ${data.dateRange}

Registros:
${data.attendances.map(a => `${a.date} - ${a.registeredBy}`).join('\n')}
      `.trim();

      blob = new Blob([content], { type: "application/pdf" });
      contentType = "application/pdf";
    } else {
      // For Excel, you would use a library like ExcelJS or XLSX
      // For now, just returning CSV as placeholder
      const rows = [
        ["Fecha y hora", "Registrado por"],
        ...data.attendances.map(a => [a.date, a.registeredBy])
      ];
      
      const csv = rows.map(row => row.join(",")).join("\n");
      blob = new Blob([csv], { type: "text/csv" });
      contentType = "text/csv";
    }

    // Convert blob to ArrayBuffer for response
    const arrayBuffer = await blob.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="report.${format === "pdf" ? "pdf" : "csv"}"`,
      },
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Error generating report" },
      { status: 500 }
    );
  }
}