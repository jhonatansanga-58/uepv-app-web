import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { useEffect, useState } from "react";

type Props = {
  id: number | string | null;
  open: boolean;
  onClose: () => void;
};

type UserDetail = {
  id: number | string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  role?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export default function UserInfoModal({ id, open, onClose }: Props) {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || id === null) return;

    setLoading(true);
    fetch(`/api/users/${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, [id, open]);

  return (
    <Modal show={open} onClose={onClose}>
      <ModalHeader>Información del Usuario</ModalHeader>
      <ModalBody>
        {loading ? (
          <div className="text-center">Cargando...</div>
        ) : user ? (
          <div className="space-y-4 text-sm text-gray-700">
            {/* Datos personales */}
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-2">
                Datos del usuario
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <p>
                  <strong>Nombre:</strong> {user.firstName} {user.lastName}
                </p>
                <p>
                  <strong>Correo:</strong> {user.email}
                </p>
                <p>
                  <strong>Rol:</strong> {user.role || "No especificado"}
                </p>
                <p>
                  <strong>Estado:</strong>{" "}
                  {user.isActive ? "Habilitado" : "Deshabilitado"}
                </p>
                <p>
                  <strong>Teléfono:</strong> {user.phone || "No registrado"}
                </p>
                <p>
                  <strong>Dirección:</strong> {user.address || "No registrada"}
                </p>
              </div>
            </div>

            {/* Fechas */}
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-2">
                Registro
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <p>
                  <strong>Creado:</strong>{" "}
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleString("es-BO", {
                        dateStyle: "long",
                        timeStyle: "short",
                      })
                    : "No disponible"}
                </p>
                <p>
                  <strong>Actualizado:</strong>{" "}
                  {user.updatedAt
                    ? new Date(user.updatedAt).toLocaleString("es-BO", {
                        dateStyle: "long",
                        timeStyle: "short",
                      })
                    : "No disponible"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-red-500">Error al cargar datos</div>
        )}
      </ModalBody>
    </Modal>
  );
}
