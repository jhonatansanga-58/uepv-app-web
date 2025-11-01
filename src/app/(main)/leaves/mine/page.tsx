"use client";

import { useEffect, useState } from "react";
import { Alert } from "flowbite-react";
import { TutorLeaveCard } from "@/components/tutorLeaveCard";
import LeaveInfoModal from "@/components/leaveInfoModal";
import LeaveDisableModal from "@/components/leaveDisableModal";
import { useSession } from "next-auth/react";

interface LeaveRequest {
  id: number;
  active: boolean;
  title: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestDate: string;
  student: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

export default function TutorLeavesPage() {
  const { data: session, status } = useSession();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaves = async () => {
    try {
      const tutorId = session?.user?.id;
      if (!tutorId) {
        setError("No se pudo obtener la información del tutor");
        return;
      }

      const response = await fetch(`/api/tutors/${tutorId}/leaverequests`);
      if (!response.ok) {
        throw new Error("Error al cargar las licencias");
      }

      const data = await response.json();
      setLeaves(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated") {
      setError("No se pudo obtener la información del tutor");
      setIsLoading(false);
      return;
    }

    fetchLeaves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session?.user?.id]);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedDisableId, setSelectedDisableId] = useState<number | null>(null);
  const [selectedDisableTitle, setSelectedDisableTitle] = useState("");
  const [selectedDisableActive, setSelectedDisableActive] = useState(false);
  const [openDisableModal, setOpenDisableModal] = useState(false);

  const handleView = (id: number) => {
    setSelectedId(id);
    setOpenModal(true);
  };

  const openDisable = (id: number, title: string, active: boolean) => {
    setSelectedDisableId(id);
    setSelectedDisableTitle(title);
    setSelectedDisableActive(active);
    setOpenDisableModal(true);
  };

  if (error) {
    return (
      <div className="p-4">
        <Alert color="failure">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-x-auto rounded-md p-4">
      <table className="w-full table-auto text-left text-sm text-gray-700">
        <thead className="bg-gray-100">
          <tr className="border-b border-gray-300">
            <th className="px-6 py-3 w-1/2 font-semibold text-gray-800">
              Licencia
            </th>
            <th className="px-6 py-3 w-1/4 font-semibold text-gray-800">
              Estado
            </th>
            <th className="px-6 py-3 w-auto font-semibold text-gray-800">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>

      {isLoading ? (
        <p>Cargando licencias...</p>
      ) : leaves.length === 0 ? (
        <p className="text-gray-600">No hay licencias registradas</p>
      ) : (
        <div className="space-y-3">
          {leaves.map((leave) => (
            <TutorLeaveCard
              key={leave.id}
              title={leave.title}
              status={leave.status}
              active={leave.active}
              student={`${leave.student.user.firstName} ${leave.student.user.lastName}`}
              onView={() => handleView(leave.id)}
              onDisable={() => openDisable(leave.id, leave.title, leave.active)}
            />
          ))}
        </div>
      )}

      <LeaveInfoModal id={selectedId} open={openModal} onClose={() => setOpenModal(false)} />
      <LeaveDisableModal
        id={selectedDisableId}
        title={selectedDisableTitle}
        active={selectedDisableActive}
        open={openDisableModal}
        onClose={() => setOpenDisableModal(false)}
        onUpdated={fetchLeaves}
      />
    </div>
  );
}