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

interface NotificationInfoModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  userId: number | null;
  courseParallelId: number | null;
  user?: User | null;
  courseParallel?: CourseParallel | null;
  creator?: User;
  date: Date;
}

export default function NotificationInfoModal({
  open,
  onClose,
  title,
  message,
  userId,
  courseParallelId,
  user,
  courseParallel,
  creator,
  date,
}: NotificationInfoModalProps) {
  const getDestinataryText = () => {
    if (userId) {
      return user ? `${user.firstName} ${user.lastName}` : "Usuario no encontrado";
    }
    if (courseParallelId) {
      return courseParallel 
        ? `${courseParallel.course.name} ${courseParallel.parallel.name}`
        : "Curso no encontrado";
    }
    return "Para todos";
  };

  return (
    <Modal show={open} onClose={onClose}>
      <div className="p-6">
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
        <div className="space-y-6">
          <div>
            <p className="font-semibold text-gray-700 dark:text-gray-300">
              Mensaje:
            </p>
            <p className="text-gray-500 dark:text-gray-400">{message}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 dark:text-gray-300">
              Destinatario:
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              {getDestinataryText()}
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 dark:text-gray-300">
              Creado por:
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              {creator
                ? `${creator.firstName} ${creator.lastName}`
                : "Usuario no encontrado"}
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 dark:text-gray-300">
              Fecha:
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              {new Date(date).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </Modal>
  );
}