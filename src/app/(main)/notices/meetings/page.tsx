"use client";

import { useState, useEffect } from "react";
import MeetingCard from "@/components/notices/meetingCard";
import MeetingInfoModal from "@/components/notices/meetingInfoModal";
import MeetingCreateModal from "@/components/notices/meetingCreateModal";
import MeetingDisableModal from "@/components/notices/meetingDisableModal";
import { useSession } from "next-auth/react";
import ReportDateRangeModal from "@/components/reports/reportDateRangeModal";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

interface User {
  id: number;
  firstName: string;
  lastName: string;
}

interface Student {
  id: number;
  user?: User | null;
}

interface Meeting {
  id: number;
  topic: string;
  message: string;
  date?: string | Date;
  active: boolean;
  student?: Student | null;
  user?: User | null;
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openDisableModal, setOpenDisableModal] = useState(false);
  const [openReportModal, setOpenReportModal] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  const { data: session } = useSession();

  const fetchMeetings = async () => {
    try {
      const res = await fetch("/api/notices/meetings");
      const data = await res.json();
      setMeetings(data);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleAddNewMeeting = () => {
    setOpenCreateModal(true);
  };

  const handleViewInfo = (id: number) => {
    const meeting = meetings.find((t) => t.id === id);
    if (meeting) {
      setSelectedMeeting(meeting);
      setOpenInfoModal(true);
    }
  };

  const handleDisable = async (id: number) => {
    const meeting = meetings.find((t) => t.id === id);
    if (meeting) {
      setSelectedMeeting(meeting);
      setOpenDisableModal(true);
    }
  };

  return (
    <div className="w-full h-full overflow-x-auto rounded-md">
      {(session?.user?.role === "ADMIN" || session?.user?.role === "TEACHER") && (

        <div className="flex justify-end items-center mb-4">
          <div className="flex gap-2">
            <button
              onClick={handleAddNewMeeting}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md"
            >
              Nueva reunión
            </button>
            <button
              onClick={() => setOpenReportModal(true)}
              disabled={meetings.length === 0}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              Generar reporte
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {meetings.map((meeting) => (
          <MeetingCard
            key={meeting.id}
            {...meeting}
            onViewInfo={handleViewInfo}
            onDisable={handleDisable}
          />
        ))}
      </div>

      {selectedMeeting && (
        <>
          <MeetingInfoModal
            open={openInfoModal}
            onClose={() => setOpenInfoModal(false)}
            topic={selectedMeeting.topic}
            message={selectedMeeting.message}
            student={selectedMeeting.student}
            user={selectedMeeting.user}
            createdAt={selectedMeeting.date}
          />

          <MeetingDisableModal
            id={selectedMeeting.id}
            title={selectedMeeting.topic}
            active={selectedMeeting.active}
            open={openDisableModal}
            onClose={() => setOpenDisableModal(false)}
            onUpdated={fetchMeetings}
          />
        </>
      )}

      <MeetingCreateModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onCreated={fetchMeetings}
      />

      <ReportDateRangeModal
        open={openReportModal}
        onClose={() => setOpenReportModal(false)}
        title="Reporte de Citaciones"
        loading={generatingReport}
        onGenerate={async (format, fromDate, toDate) => {
          try {
            setGeneratingReport(true);
            const f = fromDate ? new Date(fromDate + 'T00:00:00') : null;
            const t = toDate ? new Date(toDate + 'T23:59:59') : null;

            const filtered = meetings.filter(m => {
              if (!m.date) return false;
              const d = new Date(m.date);
              if (f && d < f) return false;
              if (t && d > t) return false;
              return true;
            });

            const fileLabel = `citaciones_${new Date().toISOString().split('T')[0]}`;

            if (format === 'excel') {
              const wb = XLSX.utils.book_new();
              const wsData: string[][] = [];
              wsData.push(['REPORTE DE CITACIONES']);
              wsData.push([]);
              wsData.push(['Período:', `${f?.toLocaleDateString() || ''} - ${t?.toLocaleDateString() || ''}`]);
              wsData.push([]);
              wsData.push(['Tema', 'Mensaje', 'Fecha y hora', 'Estudiante', 'Registrado por']);

              filtered.forEach(m => {
                wsData.push([
                  m.topic,
                  m.message,
                  m.date ? new Date(m.date).toLocaleString() : '',
                  m.student && m.student.user ? `${m.student.user.firstName} ${m.student.user.lastName}` : '',
                  m.user ? `${m.user.firstName} ${m.user.lastName}` : '',
                ]);
              });

              const ws = XLSX.utils.aoa_to_sheet(wsData);
              XLSX.utils.book_append_sheet(wb, ws, 'Reuniones');
              XLSX.writeFile(wb, `${fileLabel}.xlsx`);
            } else {
              const doc = new jsPDF();
              doc.setFontSize(16);
              doc.text('REPORTE DE CITACIONES', 105, 20, { align: 'center' });
              doc.setFontSize(12);
              doc.text(`Período: ${f?.toLocaleDateString() || ''} - ${t?.toLocaleDateString() || ''}`, 20, 36);

              let y = 50;
              doc.setFontSize(11);
              doc.text('Tema', 20, y);
              doc.text('Fecha y hora', 90, y);
              doc.text('Estudiante', 130, y);
              y += 8;

              filtered.forEach(m => {
                if (y > 270) { doc.addPage(); y = 20; }
                doc.text(m.topic || '', 20, y);
                doc.text(m.date ? new Date(m.date).toLocaleString() : '', 90, y);
                doc.text(m.student && m.student.user ? `${m.student.user.firstName} ${m.student.user.lastName}` : '', 130, y);
                y += 8;
                // message as a small paragraph
                const msg = m.message || '';
                const split = doc.splitTextToSize(msg, 170);
                split.forEach((line: string) => {
                  if (y > 270) { doc.addPage(); y = 20; }
                  doc.text(line, 20, y);
                  y += 6;
                });
                y += 4;
              });

              doc.save(`${fileLabel}.pdf`);
            }

            setOpenReportModal(false);
          } catch (err) {
            console.error('Error generating meetings report', err);
          } finally {
            setGeneratingReport(false);
          }
        }}
      />
    </div>
  );
}
