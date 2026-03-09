// components/StudentDisableModal.tsx
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

export default function StudentDisableModal({
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
      const res = await fetch(`/api/students/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });

      if (!res.ok) throw new Error("Error al deshabilitar");

      onUpdated(); // refrescar lista
      onClose(); // cerrar modal
    } catch (err) {
      console.error(err);
      // opcional: mostrar mensaje de error
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
          <strong>{active ? "deshabilitar" : "habilitar"}</strong> a{" "}
          <span className="font-semibold">{name}</span>?
        </p>
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
          {active ? "Deshabilitar" : "Habilitar"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
