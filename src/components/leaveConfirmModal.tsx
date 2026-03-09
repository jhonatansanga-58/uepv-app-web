"use client";

import { Button, Modal, TextInput } from "flowbite-react";
import { useState } from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

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

  const handleConfirm = async () => {
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

      if (!response.ok) {
        throw new Error("Error al actualizar el estado");
      }

      onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} size="md" onClose={onClose} popup dismissible>
      <div className="px-6 py-6 lg:px-8">
        <div className="text-center">
          <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400" />
          <h3 className="mb-5 text-lg font-normal text-gray-500">
            {action === "APPROVED"
              ? "¿Está seguro que desea aprobar esta solicitud?"
              : "¿Está seguro que desea rechazar esta solicitud?"}
          </h3>
          {action === "REJECTED" && (
            <div className="mb-4">
              <TextInput
                placeholder="Ingrese el motivo del rechazo"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
            </div>
          )}
          <div className="flex justify-center gap-4">
            <Button
              color={action === "APPROVED" ? "success" : "failure"}
              onClick={handleConfirm}
              disabled={loading || (action === "REJECTED" && !rejectionReason)}
            >
              {action === "APPROVED" ? "Aprobar" : "Rechazar"}
            </Button>
            <Button color="gray" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}