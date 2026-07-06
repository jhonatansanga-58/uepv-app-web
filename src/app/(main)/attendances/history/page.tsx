"use client";

import React, { useEffect, useState } from "react";
import { TextInput, Spinner, Button, Datepicker } from "flowbite-react";
import AttendanceDeleteConfirmModal from "@/components/attendanceDeleteConfirmModal";
import ReportFormatModal from "@/components/reports/reportFormatModal";
import { useSession } from "next-auth/react";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { initReportDoc, drawTableHeader, drawRowDivider, drawSummaryCards, drawAttendanceProgressBar, drawAttendanceChart } from "@/utils/pdfReport";

type StudentMinimal = { id: number; label: string };

const dateStringToDate = (dateString: string) => {
  if (!dateString) return undefined;
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
};

const handleDateChange = (date: Date | null, setter: (val: string) => void) => {
  if (date) {
    const adjustedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      12, 0, 0
    );
    setter(adjustedDate.toISOString().split("T")[0]);
  } else {
    setter("");
  }
};

const formatPeriodDate = (dateStr: string) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
};

export default function AttendancesHistoryPage() {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState<StudentMinimal[]>([]);
  const [filtered, setFiltered] = useState<StudentMinimal[]>([]);

  const [studentId, setStudentId] = useState<number | null>(null);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const [loadingList, setLoadingList] = useState(false);
  type AttendanceType = { id: number; date: string; user?: { id: number; firstName: string; lastName: string } | null };
  const [attendances, setAttendances] = useState<AttendanceType[]>([]);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    let mounted = true;
    // load students depending on role
    (async () => {
      try {
        const role = session?.user?.role;
        const userId = session?.user?.id;
        if (role === 'TUTOR' && userId) {
          const res = await fetch(`/api/tutors/${userId}/students`);
          if (!res.ok) throw new Error('Error loading assigned students');
          const data = await res.json();
          // map to minimal label
          type TutorStudent = { id: number; firstName: string; lastName: string; course?: string | null; parallel?: string | null };
          const mapped = (data || []).map((s: TutorStudent) => ({
            id: s.id,
            label: `${s.firstName} ${s.lastName}${s.course ? ` - ${s.course}` : ''}${s.parallel ? ` - ${s.parallel}` : ''}`,
          }));
          if (mounted) setStudents(mapped);
        } else if (role === 'STUDENT' && userId) {
          // fetch own student info
          const res = await fetch(`/api/students/${userId}`);
          if (res.ok) {
            const s = await res.json();
            const label = `${s.user.firstName} ${s.user.lastName}${s.courseParallel?.course?.name ? ` - ${s.courseParallel.course.name}` : ''}${s.courseParallel?.parallel?.name ? ` - ${s.courseParallel.parallel.name}` : ''}`;
            if (mounted) {
              setStudents([{ id: s.id, label }]);
              setQuery(label);
              setStudentId(s.id);
            }
          }
        } else {
          const res = await fetch('/api/students/allminimal');
          const data = await res.json();
          if (mounted) setStudents(data || []);
        }
      } catch (err) {
        console.error(err);
      }
    })();
    return () => { mounted = false; };
  }, [session?.user?.id, session?.user?.role]);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) { setFiltered([]); return; }
    setFiltered(students.filter(s => s.label.toLowerCase().includes(q)).slice(0, 20));
  }, [query, students]);

  const handleSelectStudent = (s: StudentMinimal) => {
    setStudentId(s.id);
    setQuery(s.label);
    setFiltered([]);
  };

  const fetchAttendances = async () => {
    if (!studentId || !fromDate || !toDate) return;
    try {
      setLoadingList(true);
      const res = await fetch(`/api/attendance?studentId=${studentId}&from=${fromDate}&to=${toDate}`);
      if (!res.ok) throw new Error('Error loading attendances');
      const data = await res.json();
      setAttendances(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingList(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/attendance/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) {
        console.error('Failed to delete');
      }
      // refresh
      await fetchAttendances();
    } catch (error) { console.error(error); }
    finally { setShowDeleteModal(false); setDeleteId(null); }
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="md:col-span-1">
          <label className="block text-sm text-gray-700 mb-1">Estudiante</label>
          {session?.user?.role === 'STUDENT' ? (
            <div className="p-2 bg-gray-50 rounded">{students[0]?.label || 'Estudiante'}</div>
          ) : (
            <>
              <TextInput placeholder="Buscar estudiante..." value={query} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)} />
              {query && filtered.length > 0 && (
                <div className="bg-white border rounded max-h-48 overflow-y-auto mt-1">
                  {filtered.map(s => (
                    <div key={s.id} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleSelectStudent(s)}>{s.label}</div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Desde</label>
          <Datepicker
            value={fromDate ? dateStringToDate(fromDate) : undefined}
            onChange={(d) => handleDateChange(d, setFromDate)}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Hasta</label>
          <Datepicker
            value={toDate ? dateStringToDate(toDate) : undefined}
            onChange={(d) => handleDateChange(d, setToDate)}
          />
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <Button onClick={fetchAttendances} disabled={!studentId || !fromDate || !toDate}>
          Buscar
        </Button>
        <Button 
          onClick={() => setShowReportModal(true)} 
          disabled={!attendances.length}
          className="bg-green-500 hover:bg-green-600"
        >
          Generar reporte
        </Button>
      </div>

      {loadingList ? (
        <div className="flex justify-center"><Spinner /></div>
      ) : (
        <div className="bg-white border rounded">
          {attendances.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No hay registros</div>
          ) : (
            <table className="w-full table-auto text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Fecha y hora</th>
                  <th className="px-4 py-2">Registrado por</th>
                  <th className="px-4 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {attendances.map(a => (
                  <tr key={a.id} className="border-t">
                    <td className="px-4 py-2">{new Date(a.date).toLocaleString()}</td>
                    <td className="px-4 py-2">{a.user ? `${a.user.firstName} ${a.user.lastName}` : 'Dispositivo'}</td>
                    <td className="px-4 py-2">
                      <Button className="bg-red-500 hover:bg-red-600" size="sm" onClick={() => handleDeleteClick(a.id)}>Eliminar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <AttendanceDeleteConfirmModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
      />

      <ReportFormatModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        onGenerate={async (format) => {
          try {
            setGeneratingReport(true);
            const studentInfo = students.find(s => s.id === studentId);
            
            if (format === 'excel') {
              // Create Excel workbook
              const wb = XLSX.utils.book_new();
              
              // Format data for Excel
              const wsData = [
                ['REPORTE DE ASISTENCIAS'],
                [],
                ['Estudiante:', studentInfo?.label || ''],
                ['Período:', `${formatPeriodDate(fromDate)} - ${formatPeriodDate(toDate)}`],
                [],
                ['Fecha y hora', 'Registrado por']
              ];

              // Add attendance records
              attendances.forEach(a => {
                wsData.push([
                  new Date(a.date).toLocaleString(),
                  a.user ? `${a.user.firstName} ${a.user.lastName}` : 'Dispositivo'
                ]);
              });

              // Create worksheet and add to workbook
              const ws = XLSX.utils.aoa_to_sheet(wsData);
              XLSX.utils.book_append_sheet(wb, ws, "Asistencias");

              // Generate Excel file
              XLSX.writeFile(wb, `asistencias_${studentInfo?.label.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.xlsx`);
            } else {
              // Fetch latest attendances and approved leaves in one request
              const statsRes = await fetch(`/api/attendance?studentId=${studentId}&from=${fromDate}&to=${toDate}&stats=true`);
              if (!statsRes.ok) throw new Error("Failed to load report data");
              const { attendances: atts, leaves } = await statsRes.json();

              // 1. Calculate Weekdays (Mon-Fri) in the range
              const countWeekdays = (startStr: string, endStr: string): number => {
                const start = new Date(startStr + "T00:00:00");
                const end = new Date(endStr + "T00:00:00");
                let count = 0;
                const cur = new Date(start);
                while (cur <= end) {
                  const day = cur.getDay();
                  if (day !== 0 && day !== 6) { // Weekday
                    count++;
                  }
                  cur.setDate(cur.getDate() + 1);
                }
                return count;
              };
              const diasHabiles = countWeekdays(fromDate, toDate);

              // 2. Count unique weekdays where there is an attendance record
              const presentDays = new Set<string>();
              atts.forEach((a: any) => {
                const d = new Date(a.date);
                const day = d.getDay();
                if (day !== 0 && day !== 6) { // Weekdays only
                  presentDays.add(d.toISOString().split('T')[0]);
                }
              });
              const presentCount = presentDays.size;

              // 3. Count unique weekdays with approved leave
              const leaveDays = new Set<string>();
              const start = new Date(fromDate + "T00:00:00");
              const end = new Date(toDate + "T00:00:00");
              const cur = new Date(start);
              while (cur <= end) {
                const day = cur.getDay();
                if (day !== 0 && day !== 6) {
                  const dateStr = cur.toISOString().split('T')[0];
                  const isLeave = leaves.some((l: any) => {
                    if (!l.startDate || !l.endDate) return false;
                    const lStart = new Date(l.startDate.split('T')[0] + "T00:00:00");
                    const lEnd = new Date(l.endDate.split('T')[0] + "T23:59:59");
                    const curDay = new Date(dateStr + "T12:00:00");
                    return curDay >= lStart && curDay <= lEnd;
                  });
                  if (isLeave) {
                    leaveDays.add(dateStr);
                  }
                }
                cur.setDate(cur.getDate() + 1);
              }
              // Subtract days where student had leave but still checked in
              const leaveCount = Array.from(leaveDays).filter(d => !presentDays.has(d)).length;

              // 4. Absences
              const absenceCount = Math.max(0, diasHabiles - presentCount - leaveCount);

              // 5. Attendance percentage
              const percentage = diasHabiles > 0 ? (presentCount / diasHabiles) * 100 : 0;

              // Create PDF with custom styling helper
              const periodLabel = `${formatPeriodDate(fromDate)} - ${formatPeriodDate(toDate)}`;
              const report = initReportDoc("Reporte de Asistencias", periodLabel);
              const doc = report.doc;

              // Add student info section
              doc.setFont("Helvetica", "bold");
              doc.setFontSize(10);
              doc.text("Estudiante:", 15, report.getStartY());
              doc.setFont("Helvetica", "normal");
              doc.text(studentInfo?.label || "", 40, report.getStartY());

              let y = report.getStartY() + 8;

              // Draw Summary metrics cards
              drawSummaryCards(doc, y, presentCount, leaveCount, absenceCount);
              y += 30;

              // Draw Attendance Progress bar
              drawAttendanceProgressBar(doc, y, percentage);
              y += 15;

              // Draw Comparative chart
              doc.setFont("Helvetica", "bold");
              doc.setFontSize(10);
              doc.setTextColor(60, 60, 60);
              doc.text("COMPARATIVA DE ESTADOS (DÍAS HÁBILES)", 15, y);
              y += 5;
              drawAttendanceChart(doc, y, presentCount, leaveCount, absenceCount);
              y += 38;

              // Description paragraph
              doc.setFont("Helvetica", "normal");
              doc.setFontSize(8.5);
              doc.setTextColor(100, 100, 100);
              const summaryText = `Durante el período del ${formatPeriodDate(fromDate)} al ${formatPeriodDate(toDate)}, se contabilizaron un total de ${diasHabiles} días hábiles de clases. El estudiante registró asistencia en ${presentCount} días, justificó su ausencia con licencia en ${leaveCount} días, y se registró un total de ${absenceCount} faltas injustificadas.`;
              const splitText = doc.splitTextToSize(summaryText, 180);
              doc.text(splitText, 15, y);
              y += splitText.length * 4.5 + 5;

              // Detailed markings table title
              doc.setFont("Helvetica", "bold");
              doc.setFontSize(10);
              doc.setTextColor(60, 60, 60);
              doc.text("DETALLE DE MARCACIONES", 15, y);
              y += 12; // Increased spacing to prevent overlap with the table header background

              // Table header
              drawTableHeader(doc, y, [
                { text: "Fecha y hora", x: 20 },
                { text: "Registrado por", x: 110 },
              ]);
              y += 7;

              // Table content
              atts.forEach((a: any) => {
                if (y > 260) {
                  report.addPage();
                  y = report.getStartY() + 10;
                  drawTableHeader(doc, y, [
                    { text: "Fecha y hora", x: 20 },
                    { text: "Registrado por", x: 110 },
                  ]);
                  y += 7;
                }
                
                doc.setFont("Helvetica", "normal");
                doc.setFontSize(9);
                doc.text(new Date(a.date).toLocaleString(), 20, y);
                doc.text(
                  a.user ? `${a.user.firstName} ${a.user.lastName}` : "Dispositivo",
                  110,
                  y
                );
                
                drawRowDivider(doc, y + 2);
                y += 8;
              });

              // Save PDF
              doc.save(
                `asistencias_${studentInfo?.label
                  .replace(/[^a-z0-9]/gi, "_")
                  .toLowerCase()}_${new Date().toISOString().split("T")[0]}.pdf`
              );
            }

            setShowReportModal(false);
          } catch (error) {
            console.error('Error generating report:', error);
          } finally {
            setGeneratingReport(false);
          }
        }}
        loading={generatingReport}
      />
    </div>
  );
}
