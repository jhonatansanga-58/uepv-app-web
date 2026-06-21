"use client";

import { useState, useEffect } from "react";
import TaskCard from "@/components/notices/taskCard";
import TaskInfoModal from "@/components/notices/taskInfoModal";
import TaskCreateModal from "@/components/notices/taskCreateModal";
import TaskDisableModal from "@/components/notices/taskDisableModal";
import ReportDateRangeModal from "@/components/reports/reportDateRangeModal";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { initReportDoc, drawTableHeader, drawRowDivider } from "@/utils/pdfReport";

interface Subject {
  id: number;
  name: string;
}

interface CourseParallel {
  id: number;
  course: {
    name: string;
  };
  parallel: {
    name: string;
  };
}

interface Task {
  id: number;
  title: string;
  description: string;
  sendDate: Date;
  dueDate: Date;
  active: boolean;
  subject: Subject;
  courseParallel: CourseParallel;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openDisableModal, setOpenDisableModal] = useState(false);
  const [openReportModal, setOpenReportModal] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/notices/tasks");
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddNewTask = () => {
    setOpenCreateModal(true);
  };

  const handleViewInfo = (id: number) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      setSelectedTask(task);
      setOpenInfoModal(true);
    }
  };

  const handleDisable = async (id: number) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      setSelectedTask(task);
      setOpenDisableModal(true);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-end items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={handleAddNewTask}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md"
          >
            Nueva tarea
          </button>
          <button
            onClick={() => setOpenReportModal(true)}
            disabled={tasks.length === 0}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            Generar reporte
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            {...task}
            onViewInfo={handleViewInfo}
            onDisable={handleDisable}
          />
        ))}
      </div>

      {selectedTask && (
        <>

          <TaskInfoModal
            open={openInfoModal}
            onClose={() => setOpenInfoModal(false)}
            {...selectedTask}
          />
          <TaskDisableModal
            id={selectedTask.id}
            title={selectedTask.title}
            active={selectedTask.active}
            open={openDisableModal}
            onClose={() => setOpenDisableModal(false)}
            onUpdated={fetchTasks}
          />
        </>

      )}

      <TaskCreateModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onCreated={fetchTasks}
      />

      <ReportDateRangeModal
        open={openReportModal}
        onClose={() => setOpenReportModal(false)}
        title="Reporte de Tareas"
        loading={generatingReport}
        onGenerate={async (format, fromDate, toDate) => {
          try {
            setGeneratingReport(true);
            const f = fromDate ? new Date(fromDate + 'T00:00:00') : null;
            const t = toDate ? new Date(toDate + 'T23:59:59') : null;

            const filtered = tasks.filter(task => {
              if (!task.sendDate) return false;
              const d = new Date(task.sendDate.toString());
              if (f && d < f) return false;
              if (t && d > t) return false;
              return true;
            });

            const fileLabel = `tareas_${new Date().toISOString().split('T')[0]}`;

            if (format === 'excel') {
              const wb = XLSX.utils.book_new();
              const wsData: string[][] = [];
              wsData.push(['REPORTE DE TAREAS']);
              wsData.push([]);
              wsData.push(['Período:', `${f?.toLocaleDateString() || ''} - ${t?.toLocaleDateString() || ''}`]);
              wsData.push([]);
              wsData.push(['Título', 'Materia', 'Curso - Paralelo', 'Enviado', 'Vence', 'Activo', 'Descripción']);

              filtered.forEach(task => {
                wsData.push([
                  task.title,
                  task.subject?.name || '',
                  task.courseParallel ? `${task.courseParallel.course.name} - ${task.courseParallel.parallel.name}` : '',
                  task.sendDate ? new Date(task.sendDate.toString()).toLocaleString() : '',
                  task.dueDate ? new Date(task.dueDate.toString()).toLocaleString() : '',
                  task.active ? 'Sí' : 'No',
                  task.description || ''
                ]);
              });

              const ws = XLSX.utils.aoa_to_sheet(wsData);
              XLSX.utils.book_append_sheet(wb, ws, 'Tareas');
              XLSX.writeFile(wb, `${fileLabel}.xlsx`);
            } else {
              const periodLabel = `${f ? f.toLocaleDateString("es-ES") : ""} - ${t ? t.toLocaleDateString("es-ES") : ""}`;
              const report = initReportDoc("Reporte de Tareas", periodLabel);
              const doc = report.doc;

              let y = report.getStartY() + 5;
              
              // Draw Table Header
              drawTableHeader(doc, y, [
                { text: "Título", x: 20 },
                { text: "Enviado", x: 90 },
                { text: "Vence", x: 140 }
              ]);
              y += 7;

              filtered.forEach(task => {
                if (y > 250) { 
                  report.addPage(); 
                  y = report.getStartY() + 5;
                  drawTableHeader(doc, y, [
                    { text: "Título", x: 20 },
                    { text: "Enviado", x: 90 },
                    { text: "Vence", x: 140 }
                  ]);
                  y += 7;
                }
                
                doc.setFont("Helvetica", "bold");
                doc.setFontSize(9);
                doc.text(task.title || "", 20, y);
                doc.setFont("Helvetica", "normal");
                doc.text(task.sendDate ? new Date(task.sendDate.toString()).toLocaleDateString("es-ES") : "", 90, y);
                doc.text(task.dueDate ? new Date(task.dueDate.toString()).toLocaleDateString("es-ES") : "", 140, y);
                y += 6;
                
                // Details (Subject, CourseParallel, Active status)
                const courseInfo = task.courseParallel ? `${task.courseParallel.course.name} - ${task.courseParallel.parallel.name}` : "";
                const details = `Materia: ${task.subject?.name || ""} | Curso: ${courseInfo}`;
                
                doc.setFont("Helvetica", "bold");
                doc.text(details, 20, y);
                y += 6;

                // Description
                const desc = task.description ? `Descripción: ${task.description}` : "";
                const split = doc.splitTextToSize(desc, 170);
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
            console.error('Error generating tasks report', err);
          } finally {
            setGeneratingReport(false);
          }
        }}
      />
    </div>
  );
}