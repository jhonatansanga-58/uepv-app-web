"use client";

import React, { useState } from "react";
import { Button, Modal } from "flowbite-react";

type Props = {
  show: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  studentLabel: string;
};

export default function AttendanceConfirmModal({ show, onClose, onConfirm, studentLabel }: Props) {
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
        <h3 className="mb-4 text-lg font-medium">Confirmar registro</h3>
        <p className="mb-6">¿Registrar asistencia para <strong>{studentLabel}</strong>?</p>
        <div className="flex justify-center gap-3">
          <Button color="success" onClick={handleConfirm} disabled={loading}>
            {loading ? "Registrando..." : "Confirmar"}
          </Button>
          <Button color="gray" onClick={onClose} disabled={loading}>Cancelar</Button>
        </div>
      </div>
    </Modal>
  );
}


