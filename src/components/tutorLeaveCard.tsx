"use client";

import { useState } from "react";
import { HiCheck, HiEye, HiX } from "react-icons/hi";

interface TutorLeaveCardProps {
  title: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  active?: boolean;
  student: string;
  onView: () => void;
  onDisable?: () => void;
}

const statusConfig = {
  PENDING: {
    text: "Pendiente",
    color: "text-yellow-500",
  },
  APPROVED: {
    text: "Aprobado",
    color: "text-green-500",
  },
  REJECTED: {
    text: "Rechazado",
    color: "text-red-500",
  },
};

export function TutorLeaveCard({
  title,
  status,
  active,
  student,
  onView,
  onDisable,
}: TutorLeaveCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDisable = async () => {
    if (!onDisable) return;
    setIsLoading(true);
    try {
      await onDisable();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex border-b border-gray-300 text-sm rounded-xl ${active ? "bg-white" : "bg-gray-100 opacity-60"
      }`}>
      <div className="flex items-center gap-4 w-1/2 px-6 py-2">
        <div className="text-lg w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
          {title.charAt(0)}
        </div>
        <div>
          <div className="text-lg font-medium text-gray-800">{title.length > 20 ? `${title.slice(0, 20)}...` : title}</div>
          <div className="text-xs text-gray-500"> {student}</div>
        </div>
      </div>

      <div className="text-lg flex items-center w-1/4 px-6 py-4 text-gray-700">
        <span className={`${statusConfig[status].color} font-semibold`}>{statusConfig[status].text}</span>
      </div>

      <div className="flex items-center justify-end w-auto px-6 py-4 gap-2">
        <button
          onClick={onView}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
          title="Ver detalles"
        >
          <HiEye className="w-5 h-5" />
        </button>
        {status === "PENDING" && (
          active ? (
            <button
              onClick={handleDisable}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
              title="Deshabilitar"
              disabled={isLoading}
            >
              <HiX className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleDisable}
              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded"
              title="Habilitar"
              disabled={isLoading}
            >
              <HiCheck className="w-5 h-5" />
            </button>
          )
        )}

      </div>
    </div>
  );
}