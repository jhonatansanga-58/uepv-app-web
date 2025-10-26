import {
  Modal,
  ModalBody,
  ModalHeader,
  Button,
  Label,
  TextInput,
  Select,
} from "flowbite-react";
import { useEffect, useState } from "react";

type Props = {
  id: number | null;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
};

export default function UserEditModal({
  id,
  open,
  onClose,
  onUpdated,
}: Props) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    phone: "",
    role: "",
    active: true,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || id === null) return;

    setLoading(true);
    fetch(`/api/users/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setFormData({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          address: data.address || "",
          phone: data.phone || "",
          role: data.role || "",
          active: data.active,
        });
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar usuario");
      }

      setLoading(false);
      onUpdated();
      onClose();
    } catch (err) {
      console.log("Error al actualizar", err);
      setLoading(false);
      // You could add a toast notification here to show the error to the user
    }
  };

  return (
    <Modal show={open} onClose={onClose} size="lg">
      <ModalHeader>Editar Usuario</ModalHeader>
      <ModalBody>
        {loading ? (
          <div className="text-center">Cargando...</div>
        ) : (
          <form className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Nombre</Label>
                <TextInput
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Apellido</Label>
                <TextInput
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <TextInput
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Rol</Label>
                <Select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar</option>
                  <option value="ADMIN">Administrador</option>
                  <option value="TEACHER">Profesor</option>
                  <option value="TUTOR">Tutor</option>
                  <option value="STUDENT">Estudiante</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <TextInput
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="address">Dirección</Label>
                <TextInput
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button color="gray" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>Guardar</Button>
            </div>
          </form>
        )}
      </ModalBody>
    </Modal>
  );
}
