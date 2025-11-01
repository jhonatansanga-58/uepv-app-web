import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "flowbite-react";
import { useState } from "react";

type Props = {
  id: number | null;
  title: string;
  active: boolean;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
};

export default function LeaveDisableModal({ id, title, active, open, onClose, onUpdated }: Props) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/leaverequest/${id}/toggle`, {
        method: 'PATCH',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Error al cambiar estado de la licencia');
      }

      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={open} onClose={onClose}>
      <ModalHeader>Confirmar {active ? 'deshabilitación' : 'habilitación'}</ModalHeader>
      <ModalBody>
        <p className="text-gray-700">
          ¿Estás seguro de que deseas <strong>{active ? 'deshabilitar' : 'habilitar'}</strong> la licencia <span className="font-semibold">{title}</span>?
        </p>
        {active ? (
          <p className="text-sm text-gray-500 mt-2">La licencia dejará de estar activa y no será considerada en listados hasta que se vuelva a habilitar.</p>
        ) : (
          <p className="text-sm text-gray-500 mt-2">La licencia volverá a estar activa y aparecerá en los listados.</p>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="gray" onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button className={`cursor-pointer ${active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`} onClick={handleToggle} disabled={loading}>
          {loading ? 'Procesando...' : active ? 'Deshabilitar' : 'Habilitar'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
