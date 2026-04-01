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
  year: number;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
};

export default function AcademicYearActivateModal({
  id,
  year,
  open,
  onClose,
  onUpdated,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/academic-years/${id}/activate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al activar la gestión");
      }

      onUpdated(); // refresh list
      onClose(); // close modal
    } catch (err) {
      console.error(err);
      alert("Hubo un error al activar la gestión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={open} onClose={onClose}>
      <ModalHeader>Activar Gestión Escolar</ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <p className="text-gray-700 text-base">
            ¿Está seguro que desea activar la gestión <strong>{year}</strong>?
          </p>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Atención:</strong> La gestión actual pasará a estar inactiva y el sistema operará bajo el nuevo año escolar. Todas las matriculaciones y operativas futuras aplicarán a la gestión {year}.
            </p>
          </div>
        </div>
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
          className="cursor-pointer bg-green-500 hover:bg-green-600 focus:ring-green-300"
          onClick={handleActivate}
          disabled={loading}
        >
          {loading ? "Activando..." : "Confirmar Activación"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
