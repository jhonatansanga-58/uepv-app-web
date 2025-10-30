import { Modal, ModalBody, ModalHeader, Button } from "flowbite-react";
import { useEffect, useState } from "react";

type Props = {
  id: number | null;
  open: boolean;
  onClose: () => void;
};

type LeaveDetail = {
  id: number;
  title: string;
  message: string;
  reason: string;
  startDate?: string | null;
  endDate?: string | null;
  requestDate: string;
  status: string;
  active: boolean;
  rejectionReason?: string | null;
  student: {
    id: number;
    user: { firstName: string; lastName: string; email?: string };
    courseParallel?: { course?: { name: string }; parallel?: { name: string } } | null;
  };
  tutor: { id: number; firstName: string; lastName: string } | null;
  counts?: { approvedCount: number; pendingCount: number; rejectedCount: number };
};

export default function LeaveInfoModal({ id, open, onClose }: Props) {
  const [leave, setLeave] = useState<LeaveDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || id === null) return;
    setLoading(true);
    fetch(`/api/leaverequest/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setLeave(data);
        setLoading(false);
      })
      .catch(() => {
        setLeave(null);
        setLoading(false);
      });
  }, [id, open]);

  const formatDate = (d?: string | null) =>
    d ? new Date(d).toLocaleString("es-BO", { year: "numeric", month: "long", day: "numeric" }) : "No especificada";

  const statusLabel = (s: string) => {
    if (s === "PENDING") return <span className="text-yellow-500 font-semibold">Pendiente</span>;
    if (s === "APPROVED") return <span className="text-green-500 font-semibold">Aprobado</span>;
    if (s === "REJECTED") return <span className="text-red-500 font-semibold">Rechazado</span>;
    return s;
  };

  return (
    <Modal show={open} onClose={onClose}>
      <ModalHeader>Información de la Licencia</ModalHeader>
      <ModalBody>
        {loading ? (
          <div className="text-center">Cargando...</div>
        ) : leave ? (
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-2">Resumen</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <p><strong>Título:</strong> {leave.title}</p>
                <p><strong>Estado:</strong> {statusLabel(leave.status)}</p>
                <p><strong>Activo:</strong> {leave.active ? 'Sí' : 'No'}</p>
                <p><strong>Solicitado:</strong> {formatDate(leave.requestDate)}</p>
                <p><strong>Inicio:</strong> {formatDate(leave.startDate)}</p>
                <p><strong>Fin:</strong> {formatDate(leave.endDate)}</p>
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-2">Estudiante</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <p><strong>Nombre:</strong> {leave.student.user.firstName} {leave.student.user.lastName}</p>
                <p><strong>Curso:</strong> {leave.student.courseParallel?.course?.name || 'No asignado'}</p>
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-2">Detalles</h3>
              <div className="bg-gray-50 p-3 rounded">
                <p><strong>Mensaje:</strong></p>
                <p className="mt-1 text-gray-800">{leave.message}</p>
                <p className="mt-3"><strong>Motivo:</strong></p>
                <p className="mt-1 text-gray-800">{leave.reason}</p>
                {leave.status === 'REJECTED' && (
                  <div className="mt-3">
                    <p><strong>Razón de rechazo:</strong></p>
                    <p className="mt-1 text-red-600">{leave.rejectionReason || 'No especificada'}</p>
                  </div>
                )}
              </div>
            </div>

            {leave.counts && (
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">Historial de licencias</h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-yellow-50 rounded">
                    <div className="text-sm text-yellow-600 font-semibold">Pendientes</div>
                    <div className="text-lg font-bold">{leave.counts.pendingCount}</div>
                  </div>
                  <div className="p-2 bg-green-50 rounded">
                    <div className="text-sm text-green-600 font-semibold">Aprobadas</div>
                    <div className="text-lg font-bold">{leave.counts.approvedCount}</div>
                  </div>
                  <div className="p-2 bg-red-50 rounded">
                    <div className="text-sm text-red-600 font-semibold">Rechazadas</div>
                    <div className="text-lg font-bold">{leave.counts.rejectedCount}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="text-right">
              <Button className="w-full" onClick={onClose}>Cerrar</Button>
            </div>
          </div>
        ) : (
          <div className="text-center text-red-500">Error al cargar los datos</div>
        )}
      </ModalBody>
    </Modal>
  );
}
