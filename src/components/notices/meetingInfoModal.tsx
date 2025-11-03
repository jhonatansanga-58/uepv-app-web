"use client";

import { Modal, Button } from "flowbite-react";

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

interface Student {
  id: number;
  user?: User | null;
  courseParallel?: CourseParallel | null;
}

interface MeetingInfoModalProps {
  open: boolean;
  onClose: () => void;
  topic: string;
  message: string;
  student?: Student | null;
  user?: User | null; // creator
  createdAt?: string | Date;
}

export default function MeetingInfoModal({
  open,
  onClose,
  topic,
  message,
  student,
  user,
  createdAt,
}: MeetingInfoModalProps) {
  const getDestinataryText = () => {
    if (student && student.user) {
      return `${student.user.firstName} ${student.user.lastName}`;
    }
    if (student && student.courseParallel) {
      return `${student.courseParallel.course.name} ${student.courseParallel.parallel.name}`;
    }
    return "Estudiante no encontrado";
  };

  return (
    <Modal show={open} onClose={onClose}>
      <div className="p-6">
        <h3 className="text-xl font-medium text-gray-900">
          {topic}
        </h3>
        <div className="space-y-6">
          <div>
            <p className="font-semibold text-gray-700">Mensaje:</p>
            <p className="text-gray-500 ">{message}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700">Destinatario:</p>
            <p className="text-gray-500">{getDestinataryText()}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700">Creado por:</p>
            <p className="text-gray-500">
              {user ? `${user.firstName} ${user.lastName}` : "Usuario no encontrado"}
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700">Fecha:</p>
            <p className="text-gray-500">{createdAt ? new Date(createdAt).toLocaleString() : "-"}</p>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </Modal>
  );
}
