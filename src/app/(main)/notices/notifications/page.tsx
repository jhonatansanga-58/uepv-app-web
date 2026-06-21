"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import NotificationCard from "@/components/notices/notificationCard";
import NotificationDisableModal from "@/components/notices/notificationDisableModal";
import NotificationInfoModal from "@/components/notices/notificationInfoModal";
import NotificationCreateModal from "@/components/notices/notificationCreateModal";
import ReportDateRangeModal from "@/components/reports/reportDateRangeModal";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { initReportDoc, drawTableHeader, drawRowDivider } from "@/utils/pdfReport";

interface User {
  id: number;
  firstName: string;
  lastName: string;
}

interface CourseParallel {
  course: {
    name: string;
  };
  parallel: {
    name: string;
  };
}

interface Notification {
  id: number;
  title: string;
  message: string;
  active: boolean;
  date: Date;
  user: User | null;
  courseParallel: CourseParallel | null;
  creator: User;
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [openDisableModal, setOpenDisableModal] = useState(false);
  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openReportModal, setOpenReportModal] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const fetchNotifications = async () => {
    const res = await fetch("/api/notices/notifications");
    const data = await res.json();
    setNotifications(data);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleAddNewNotification = () => {
    setOpenCreateModal(true);
  };

  const handleViewInfo = (id: number) => {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      setSelectedNotification(notification);
      setOpenInfoModal(true);
    }
  };

  const handleDisable = (id: number) => {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      setSelectedNotification(notification);
      setOpenDisableModal(true);
    }
  };

  return (
    <div className="w-full h-full overflow-x-auto rounded-md">
      {/* Only show add button for admin and teacher */}
      {(session?.user?.role === "ADMIN" || session?.user?.role === "TEACHER") && (
        <div className="flex justify-end items-center mb-4">
          <div className="flex gap-2">
            <button
              onClick={handleAddNewNotification}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md"
            >
              Nuevo comunicado
            </button>
            <button
              onClick={() => setOpenReportModal(true)}
              disabled={notifications.length === 0}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              Generar reporte
            </button>
          </div>
        </div>
      )}

      <table className="w-full table-auto text-left text-sm text-gray-700">
        <thead className="bg-gray-100">
          <tr className="border-b border-gray-300">
            <th className="px-6 py-3 w-1/2 font-semibold text-gray-800">
              Título
            </th>
            <th className="px-6 py-3 w-1/4 font-semibold text-gray-800">
              {session?.user?.role === "ADMIN" || session?.user?.role === "TEACHER"
                ? "Destinatario"
                : "Remitente"}
            </th>
            <th className="px-6 py-3 w-auto font-semibold text-gray-800">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
      <br />

      <div className="space-y-3">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            id={notification.id}
            title={notification.title}
            active={notification.active}
            user={notification.user}
            courseParallel={notification.courseParallel}
            creator={notification.creator}
            onViewInfo={handleViewInfo}
            onDisable={handleDisable}
          />
        ))}
      </div>

      {selectedNotification && (
        <>
          <NotificationDisableModal
            id={selectedNotification.id}
            title={selectedNotification.title}
            active={selectedNotification.active}
            open={openDisableModal}
            onClose={() => setOpenDisableModal(false)}
            onUpdated={fetchNotifications}
          />
          <NotificationInfoModal
            open={openInfoModal}
            onClose={() => setOpenInfoModal(false)}
            title={selectedNotification.title}
            message={selectedNotification.message}
            user={selectedNotification.user}
            courseParallel={selectedNotification.courseParallel}
            creator={selectedNotification.creator}
            date={selectedNotification.date}
          />
        </>
      )}

      <NotificationCreateModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onCreated={fetchNotifications}
      />

      <ReportDateRangeModal
        open={openReportModal}
        onClose={() => setOpenReportModal(false)}
        title="Reporte de Comunicados"
        loading={generatingReport}
        onGenerate={async (format, fromDate, toDate) => {
          try {
            setGeneratingReport(true);
            const f = fromDate ? new Date(fromDate + 'T00:00:00') : null;
            const t = toDate ? new Date(toDate + 'T23:59:59') : null;

            const filtered = notifications.filter(n => {
              if (!n.date) return false;
              const d = new Date(n.date.toString());
              if (f && d < f) return false;
              if (t && d > t) return false;
              return true;
            });

            const fileLabel = `comunicados_${new Date().toISOString().split('T')[0]}`;

            if (format === 'excel') {
              const wb = XLSX.utils.book_new();
              const wsData: string[][] = [];
              wsData.push(['REPORTE DE COMUNICADOS']);
              wsData.push([]);
              wsData.push(['Período:', `${f?.toLocaleDateString() || ''} - ${t?.toLocaleDateString() || ''}`]);
              wsData.push([]);
              wsData.push(['Título', 'Enviado por', 'Destinatario', 'Fecha y hora', 'Activo', 'Mensaje']);

              filtered.forEach(n => {
                wsData.push([
                  n.title,
                  `${n.creator.firstName} ${n.creator.lastName}`,
                  n.user ? `${n.user.firstName} ${n.user.lastName}` : 
                  n.courseParallel ? `${n.courseParallel.course.name} - ${n.courseParallel.parallel.name}` : '',
                  new Date(n.date.toString()).toLocaleString(),
                  n.active ? 'Sí' : 'No',
                  n.message
                ]);
              });

              const ws = XLSX.utils.aoa_to_sheet(wsData);
              XLSX.utils.book_append_sheet(wb, ws, 'Comunicados');
              XLSX.writeFile(wb, `${fileLabel}.xlsx`);
            } else {
              const periodLabel = `${f ? f.toLocaleDateString("es-ES") : ""} - ${t ? t.toLocaleDateString("es-ES") : ""}`;
              const report = initReportDoc("Reporte de Comunicados", periodLabel);
              const doc = report.doc;

              let y = report.getStartY() + 5;
              
              // Draw Table Header
              drawTableHeader(doc, y, [
                { text: "Título", x: 20 },
                { text: "Enviado por", x: 90 },
                { text: "Fecha", x: 140 }
              ]);
              y += 7;

              filtered.forEach(n => {
                if (y > 250) { 
                  report.addPage(); 
                  y = report.getStartY() + 5;
                  drawTableHeader(doc, y, [
                    { text: "Título", x: 20 },
                    { text: "Enviado por", x: 90 },
                    { text: "Fecha", x: 140 }
                  ]);
                  y += 7;
                }
                
                doc.setFont("Helvetica", "bold");
                doc.setFontSize(9);
                doc.text(n.title || "", 20, y);
                doc.setFont("Helvetica", "normal");
                doc.text(`${n.creator.firstName} ${n.creator.lastName}`, 90, y);
                doc.text(new Date(n.date.toString()).toLocaleDateString("es-ES"), 140, y);
                y += 6;
                
                // Recipient info
                const recipient = n.user ? `${n.user.firstName} ${n.user.lastName}` :
                  n.courseParallel ? `${n.courseParallel.course.name} - ${n.courseParallel.parallel.name}` : "Todos";
                
                doc.setFont("Helvetica", "bold");
                doc.text(`Destinatario: `, 20, y);
                doc.setFont("Helvetica", "normal");
                doc.text(recipient, 42, y);
                y += 6;

                // Message content
                const split = doc.splitTextToSize(n.message || "", 170);
                doc.setFont("Helvetica", "italic");
                doc.setTextColor(100, 100, 100);
                split.forEach((line: string) => {
                  if (y > 260) {
                    report.addPage();
                    y = report.getStartY() + 5;
                  }
                  doc.text(line, 20, y);
                  y += 5;
                });
                doc.setTextColor(0, 0, 0); // reset color
                
                drawRowDivider(doc, y + 1);
                y += 6;
              });

              doc.save(`${fileLabel}.pdf`);
            }

            setOpenReportModal(false);
          } catch (err) {
            console.error('Error generating notifications report', err);
          } finally {
            setGeneratingReport(false);
          }
        }}
      />
    </div>
  );
}