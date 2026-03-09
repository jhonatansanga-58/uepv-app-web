"use client";

import { HiCheck, HiEye, HiTrash } from "react-icons/hi";
import { useSession } from "next-auth/react";

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

interface TaskCardProps {
  id: number;
  title: string;
  description: string;
  subject: Subject;
  courseParallel: CourseParallel;
  sendDate: Date;
  dueDate: Date;
  active: boolean;
  onViewInfo: (id: number) => void;
  onDisable: (id: number) => void;
}

export default function TaskCard({
  id,
  title,
  subject,
  courseParallel,
  dueDate,
  active,
  onViewInfo,
  onDisable,
}: TaskCardProps) {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  return (
    <div
      className={`flex justify-between items-center border-b border-gray-300 text-sm rounded-xl shadow-md ${active ? "bg-white" : "bg-gray-100 opacity-60"
        }`}
    >
      <div className="flex-grow flex items-center gap-4 px-6 py-4">
        <div className="flex flex-col">
          <h5 className="text-lg font-semibold text-gray-900">
            {title}
          </h5>
          <p className="text-sm text-gray-600">
            {subject.name} - {courseParallel.course.name} {courseParallel.parallel.name}
          </p>
        </div>

        <p className="text-sm text-gray-500 ml-auto">
          Fecha de entrega: {new Date(dueDate).toLocaleDateString()}
        </p>

      </div>

      <div className="flex items-center justify-end px-6 py-4 gap-2">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
          onClick={() => onViewInfo(id)}
          title="Ver detalles"
        >
          <HiEye className="w-5 h-5" />
        </button>

        {(userRole === "TEACHER") && (
          <button
            onClick={() => onDisable(id)}
            className={`${active
              ? "bg-red-500 hover:bg-red-600 text-white p-2 rounded"
              : "bg-green-500 hover:bg-green-600 text-white p-2 rounded"
              }`}
            title={active ? "Desactivar" : "Activar"}
          >
            {active ? (
              <HiTrash className="w-5 h-5" />
            ) : (
              <HiCheck className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}