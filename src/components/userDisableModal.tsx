// components/UserDisableModal.tsx
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

export default function UserDisableModal({
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
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al cambiar estado del usuario");
      }

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
        {active && (
          <p className="text-sm text-gray-500 mt-2">
            El usuario no podrá acceder al sistema hasta que sea habilitado nuevamente.
          </p>
        )}
        {!active && (
          <p className="text-sm text-gray-500 mt-2">
            El usuario podrá acceder al sistema nuevamente.
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
