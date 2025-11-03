"use client";

import { HiCheck, HiEye, HiTrash } from "react-icons/hi";
import { useSession } from "next-auth/react";

interface User {
  id: number;
  firstName: string;
  lastName: string;
}

interface Student {
  id: number;
  user?: User | null;
}

interface MeetingProps {
  id: number;
  topic: string;
  active: boolean;
  student?: Student | null;
  user?: User | null; // creator
  onViewInfo: (id: number) => void;
  onDisable: (id: number) => void;
}

export default function MeetingCard({
  id,
  topic,
  active,
  student,
  user,
  onViewInfo,
  onDisable,
}: MeetingProps) {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const currentUserId = parseInt(session?.user?.id || "0");

  const getDestinataryText = () => {
    if (student && student.user) {
      return `${student.user.firstName} ${student.user.lastName}`;
    }
    return "Estudiante no encontrado";
  };

  const secondColumnText = (userRole === "ADMIN" || userRole === "TEACHER")
    ? getDestinataryText()
    : user
      ? `${user.firstName} ${user.lastName}`
      : "Usuario no encontrado";

  return (
    <div
      className={`flex border-b border-gray-300 text-sm rounded-xl ${active ? "bg-white" : "bg-gray-100 opacity-60"
        }`}
    >
      <div className="flex items-center gap-4 w-1/2 px-6 py-2">
        <div className="text-lg font-medium text-gray-800">{topic}</div>
      </div>

      <div className="text-lg flex items-center w-1/4 px-6 py-4 text-gray-700">
        <p className="font-normal text-gray-700">
          {secondColumnText}
        </p>
      </div>

      <div className="flex items-center justify-end w-auto px-6 py-4 gap-2">
        <button
          onClick={() => onViewInfo(id)}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
          title="Ver detalles">
          <HiEye className="w-5 h-5" />
        </button>

        {(userRole === "ADMIN" || userRole === "TEACHER") &&
          user?.id === currentUserId && (
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
