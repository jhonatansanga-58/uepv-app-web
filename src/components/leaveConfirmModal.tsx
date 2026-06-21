"use client";

import { Button, Modal, TextInput } from "flowbite-react";
import { useState } from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { toast } from "react-toastify";

type LeaveConfirmModalProps = {
  show: boolean;
  onClose: () => void;
  leaveId: number;
  action: "APPROVED" | "REJECTED";
  onSuccess: () => void;
};

export default function LeaveConfirmModal({
  show,
  onClose,
  leaveId,
  action,
  onSuccess,
}: LeaveConfirmModalProps) {
  const [loading, setLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setError("");

    if (action === "REJECTED") {
      const reasonTrimmed = rejectionReason.trim();
      if (!reasonTrimmed) {
        setError("El motivo del rechazo es obligatorio.");
        toast.error("Por favor, ingrese el motivo del rechazo.");
        return;
      }
      if (reasonTrimmed.length < 10) {
        setError("El motivo debe tener al menos 10 caracteres.");
        toast.error("El motivo de rechazo es demasiado corto.");
        return;
      }
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/leaverequest/${leaveId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: action,
          ...(action === "REJECTED" && { rejectionReason }),
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Error al actualizar el estado de la solicitud.");
      }

      if (action === "APPROVED") {
        toast.success("¡La solicitud de licencia ha sido aprobada con éxito!");
      } else {
        toast.success("¡La solicitud de licencia ha sido rechazada!");
      }

      setRejectionReason("");
      onSuccess();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Error al procesar la solicitud.";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRejectionReason("");
    setError("");
    onClose();
  };

  return (
    <Modal show={show} size="md" onClose={handleClose} popup dismissible>
      <div className="px-6 py-6 lg:px-8">
        <div className="text-center">
          <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400" />
          <h3 className="mb-5 text-lg font-normal text-gray-500">
            {action === "APPROVED"
              ? "¿Está seguro que desea aprobar esta solicitud?"
              : "¿Está seguro que desea rechazar esta solicitud?"}
          </h3>
          {action === "REJECTED" && (
            <div className="mb-4 text-left">
              <TextInput
                placeholder="Ingrese el motivo del rechazo"
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  if (error) setError("");
                }}
              />
              {error && <span className="text-red-500 text-sm mt-1 block">{error}</span>}
            </div>
          )}
          <div className="flex justify-center gap-4">
            <Button
              color={action === "APPROVED" ? "success" : "failure"}
              onClick={handleConfirm}
              disabled={loading}
            >
              {action === "APPROVED" ? "Aprobar" : "Rechazar"}
            </Button>
            <Button color="gray" onClick={handleClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}