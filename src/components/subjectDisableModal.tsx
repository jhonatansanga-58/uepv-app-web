// components/CourseDisableModal.tsx
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "flowbite-react";
import { useState } from "react";

type Props = {
  id: number | null;
  name: string;
  active: boolean;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
};

export default function SubjectDisableModal({
  id,
  name,
  active,
  open,
  onClose,
  onUpdated,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleDisable = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/subjects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al cambiar estado del curso");
      }

      onUpdated(); // refresh list
      onClose(); // close modal
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={open} onClose={onClose}>
      <ModalHeader>
        Confirmar {active ? "deshabilitación" : "habilitación"}
      </ModalHeader>
      <ModalBody>
        <p className="text-gray-700">
          ¿Estás seguro de que deseas{" "}
          <strong>{active ? "deshabilitar" : "habilitar"}</strong> la materia{" "}
          <span className="font-semibold">{name}</span>?
        </p>
        {active && (
          <p className="text-sm text-gray-500 mt-2">
            La materia no será visible en el sistema hasta que sea habilitada nuevamente.
          </p>
        )}
        {!active && (
          <p className="text-sm text-gray-500 mt-2">
            la materia será visible en el sistema nuevamente.
          </p>
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          color="gray"
          className="cursor-pointer"
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          className={`cursor-pointer ${
            active
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
          onClick={handleDisable}
          disabled={loading}
        >
          {loading ? "Procesando..." : active ? "Deshabilitar" : "Habilitar"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}