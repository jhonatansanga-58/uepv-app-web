"use client";

import { useState, useEffect } from "react";
import TaskCard from "@/components/notices/taskCard";
import TaskInfoModal from "@/components/notices/taskInfoModal";
import TaskCreateModal from "@/components/notices/taskCreateModal";
import TaskDisableModal from "@/components/notices/taskDisableModal";
import ReportDateRangeModal from "@/components/reports/reportDateRangeModal";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

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
              const doc = new jsPDF();
              doc.setFontSize(16);
              doc.text('REPORTE DE TAREAS', 105, 20, { align: 'center' });
              doc.setFontSize(12);
              doc.text(`Período: ${f?.toLocaleDateString() || ''} - ${t?.toLocaleDateString() || ''}`, 20, 36);

              let y = 50;
              doc.setFontSize(11);
              doc.text('Título', 20, y);
              doc.text('Enviado', 90, y);
              doc.text('Vence', 140, y);
              y += 8;

              filtered.forEach(task => {
                if (y > 270) { doc.addPage(); y = 20; }
                doc.text(task.title || '', 20, y);
                doc.text(task.sendDate ? new Date(task.sendDate.toString()).toLocaleString() : '', 90, y);
                doc.text(task.dueDate ? new Date(task.dueDate.toString()).toLocaleString() : '', 140, y);
                y += 8;

                const details = `Materia: ${task.subject?.name || ''} | Curso: ${task.courseParallel ? `${task.courseParallel.course.name} - ${task.courseParallel.parallel.name}` : ''} | Activo: ${task.active ? 'Sí' : 'No'}`;
                const split = doc.splitTextToSize(details + '\n' + (task.description || ''), 170);
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
            console.error('Error generating tasks report', err);
          } finally {
            setGeneratingReport(false);
          }
        }}
      />
    </div>
  );
}