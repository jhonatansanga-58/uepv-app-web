"use client";

import { Modal, Button } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

interface TaskDisableModalProps {
  id: number | null;
  title: string;
  active: boolean;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export default function TaskDisableModal({
  id,
  title,
  active,
  open,
  onClose,
  onUpdated,
}: TaskDisableModalProps) {
  const handleConfirm = async () => {
    if (!id) return;

    const res = await fetch(`/api/notices/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });

    if (res.ok) {
      onUpdated();
      onClose();
    }
  };

  return (
    <Modal show={open} size="md" onClose={onClose} popup>
      <div className="p-6 text-center">
        <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400" />
        <h3 className="mb-5 text-lg font-normal text-gray-500">
          {active
            ? `¿Estás seguro de que deseas deshabilitar la tarea "${title}"?`
            : `¿Estás seguro de que deseas habilitar la tarea "${title}"?`}
        </h3>
        <div className="flex justify-center gap-4">
          <Button color="failure" onClick={handleConfirm}>
            {active ? "Si, deshabilitar" : "Si, habilitar"}
          </Button>
          <Button color="gray" onClick={onClose}>
            No, cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
}