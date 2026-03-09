"use client";

import React, { useState } from "react";
import { Button, Modal } from "flowbite-react";

type Props = {
  show: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  message?: string;
};

export default function AttendanceDeleteConfirmModal({ show, onClose, onConfirm, message }: Props) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose} size="md">
      <div className="p-6 text-center">
        <h3 className="mb-4 text-lg font-medium">Confirmar eliminación</h3>
        <p className="mb-6">{message ?? "¿Está seguro que desea eliminar este registro de asistencia?"}</p>
        <div className="flex justify-center gap-3">
          <Button color="failure" onClick={handleConfirm} disabled={loading}>
            {loading ? "Eliminando..." : "Eliminar"}
          </Button>
          <Button color="gray" onClick={onClose} disabled={loading}>Cancelar</Button>
        </div>
      </div>
    </Modal>
  );
}
