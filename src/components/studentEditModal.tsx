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

export default function StudentEditModal({
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
    birthDate: "",
    gender: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || id === null) return;

    setLoading(true);
    fetch(`/api/students/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setFormData({
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
          address: data.user.address || "",
          phone: data.user.phone || "",
          birthDate: data.birthDate ? data.birthDate.substring(0, 10) : "",
          gender: data.gender || "",
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await fetch(`/api/students/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setLoading(false);
      onUpdated();
      onClose(); // Puedes agregar notificación si quieres
    } catch (err) {
      console.error("Error al actualizar", err);
    }
  };

  return (
    <Modal show={open} onClose={onClose} size="lg">
      <ModalHeader>Editar Estudiante</ModalHeader>
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
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="birthDate">Fecha de nacimiento</Label>
                <TextInput
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="gender">Género</Label>
                <Select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar</option>
                  <option value="MALE">Masculino</option>
                  <option value="FEMALE">Femenino</option>
                  <option value="OTHER">Otro</option>
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
