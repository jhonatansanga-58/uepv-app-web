"use client";

import { HiEye } from "react-icons/hi";

type AdminLeaveCardProps = {
  student: string;
  tutor: string;
  onView: () => void;
};

export default function AdminLeaveCard({ student: student, tutor: tutor, onView }: AdminLeaveCardProps) {
  return (
    <div className="flex border-b border-gray-300 text-sm rounded-xl bg-white shadow-md">
      <div className="flex items-center gap-4 w-1/2 px-6 py-2">
        <div className="text-lg w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
          {student.charAt(0)}
        </div>
        <div className="text-lg font-medium text-gray-800">{student}</div>
      </div>
      <div className="text-lg flex items-center w-1/4 px-6 py-4 text-gray-700">
        <div className="text-lg font-medium text-gray-800">{tutor}</div>      </div>
      <div className="flex items-center justify-end w-auto px-6 py-4 gap-2">
        <button
          onClick={onView}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
          title="Ver detalles"
        >
          <HiEye className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}