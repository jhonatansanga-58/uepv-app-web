"use client";

import { useState, useEffect } from "react";
import TaskCard from "@/components/notices/taskCard";
import TaskInfoModal from "@/components/notices/taskInfoModal";
import TaskCreateModal from "@/components/notices/taskCreateModal";
import TaskDisableModal from "@/components/notices/taskDisableModal";

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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Tareas</h2>
        <button
          onClick={handleAddNewTask}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md"
        >
          Nueva tarea
        </button>
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
    </div>
  );
}