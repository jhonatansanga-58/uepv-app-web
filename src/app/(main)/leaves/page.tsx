"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Spinner } from "flowbite-react";
import AdminLeaveCard from "@/components/adminLeaveCard";
import LeaveConfirmModal from "@/components/leaveConfirmModal";
import LeaveInfoModal from "@/components/leaveInfoModal";
import { HiChevronDown } from "react-icons/hi";

const statusLabels: Record<string, string> = {
  "": "Seleccione un estado",
  PENDING: "Pendiente",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
};

type LeaveRequest = {
  id: number;
  student: string;
  tutor: string;
};

export default function LeavesPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<"APPROVED" | "REJECTED" | null>(null);

  const fetchLeaveRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/leaverequest?status=${selectedStatus}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener las solicitudes");
      }

      const data = await response.json();
      setLeaves(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    if (selectedStatus) {
      fetchLeaveRequests();
    }
  }, [selectedStatus, fetchLeaveRequests]);


  const handleView = (leaveId: number) => {
    setSelectedLeave(leaveId);
    setShowInfoModal(true);
  };

  const handleConfirmAction = (action: "APPROVED" | "REJECTED") => {
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  const handleCloseModals = () => {
    setShowInfoModal(false);
    setShowConfirmModal(false);
    setSelectedLeave(null);
    setConfirmAction(null);
    if (selectedStatus) {
      fetchLeaveRequests();
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="w-full h-full overflow-x-auto rounded-md">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 w-full">
        <div className="relative min-w-[180px]" ref={statusRef}>
          <button
            onClick={() => setIsStatusOpen((prev) => !prev)}
            className="cursor-pointer w-full px-4 py-2 text-sm text-white bg-primary-400 border border-gray-300 rounded-md flex justify-between items-center hover:bg-primary-300"
          >
            {statusLabels[selectedStatus || ""] || "Seleccionar rol"}
            <HiChevronDown className="ml-2 h-4 w-4 text-white" />
          </button>
          {isStatusOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
              {Object.entries(statusLabels).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => {
                    setSelectedStatus(value);
                    setIsStatusOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <table className="w-full table-auto text-left text-sm text-gray-700">
        <thead className="bg-gray-100">
          <tr className="border-b border-gray-300">
            <th className="px-6 py-3 w-1/2 font-semibold text-gray-800">
              Estudiante
            </th>
            <th className="px-6 py-3 w-1/4 font-semibold text-gray-800">
              Tutor
            </th>
            <th className="px-6 py-3 w-auto font-semibold text-gray-800">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>

      {!selectedStatus ? (
        <div className="text-center text-gray-500 mt-8">
          Por favor seleccione un estado para ver las solicitudes
        </div>
      ) : loading ? (
        <div className="text-center mt-8">
          <Spinner size="xl" />
        </div>
      ) : leaves.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          No hay solicitudes con el estado seleccionado
        </div>
      ) : (
        <div className="space-y-3">
          {leaves.map((leave) => (
            <AdminLeaveCard
              key={leave.id}
              student={leave.student}
              tutor={leave.tutor}
              onView={() => handleView(leave.id)}
            />
          ))}
        </div>
      )}

      {showInfoModal && selectedLeave && (
        <LeaveInfoModal
          id={selectedLeave}
          open={showInfoModal}
          onClose={() => setShowInfoModal(false)}
          isAdmin={true}
          onConfirmAction={handleConfirmAction}
        />
      )}

      {showConfirmModal && selectedLeave && confirmAction && (
        <LeaveConfirmModal
          show={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          leaveId={selectedLeave}
          action={confirmAction}
          onSuccess={handleCloseModals}
        />
      )}
    </div>
  );
}
