"use client";

import { Modal, Button } from "flowbite-react";

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

interface TaskInfoModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  subject: Subject;
  courseParallel: CourseParallel;
  sendDate: Date;
  dueDate: Date;
}

export default function TaskInfoModal({
  open,
  onClose,
  title,
  description,
  subject,
  courseParallel,
  sendDate,
  dueDate,
}: TaskInfoModalProps) {
  return (
    <Modal show={open} onClose={onClose} size="lg">
      <div className="p-6">
        <h3 className="text-xl font-medium text-gray-900 mb-4">
          {title}
        </h3>
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-gray-700">
              Descripción:
            </p>
            <p className="text-gray-500">
              {description}
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700">
              Asignatura:
            </p>
            <p className="text-gray-500">
              {subject.name}
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700">
              Curso:
            </p>
            <p className="text-gray-500">
              {courseParallel.course.name} {courseParallel.parallel.name}
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700">
              Fecha de envío:
            </p>
            <p className="text-gray-500">
              {new Date(sendDate).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700">
              Fecha de entrega:
            </p>
            <p className="text-gray-500">
              {new Date(dueDate).toLocaleString()}
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