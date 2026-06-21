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
import { toast } from "react-toastify";

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
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open || id === null) return;

    setLoading(true);
    setErrors({});
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
        toast.error("Error al cargar la información del usuario.");
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
    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = async () => {
    setErrors({});

    // Client-side validations
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) {
      newErrors.firstName = "El nombre es obligatorio.";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.firstName)) {
      newErrors.firstName = "Solo se permiten letras.";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "El apellido es obligatorio.";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.lastName)) {
      newErrors.lastName = "Solo se permiten letras.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      newErrors.email = "Correo electrónico inválido.";
    }

    if (!formData.role) {
      newErrors.role = "El rol es obligatorio.";
    }

    if (formData.phone && !/^\d{7,10}$/.test(formData.phone)) {
      newErrors.phone = "El teléfono debe contener entre 7 y 10 dígitos.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Por favor, corrige los errores en el formulario.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Error al actualizar usuario");
      }

      toast.success(`¡El usuario "${formData.firstName} ${formData.lastName}" se ha actualizado con éxito!`);
      setLoading(false);
      onUpdated();
      onClose();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Error desconocido al guardar los cambios.";
      toast.error(errMsg);
      setLoading(false);
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
                <Label htmlFor="firstName">Nombre *</Label>
                <TextInput
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                {errors.firstName && <span className="text-red-500 text-sm mt-1 block">{errors.firstName}</span>}
              </div>
              <div>
                <Label htmlFor="lastName">Apellido *</Label>
                <TextInput
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
                {errors.lastName && <span className="text-red-500 text-sm mt-1 block">{errors.lastName}</span>}
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <TextInput
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <span className="text-red-500 text-sm mt-1 block">{errors.email}</span>}
              </div>
              <div>
                <Label htmlFor="role">Rol *</Label>
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
                {errors.role && <span className="text-red-500 text-sm mt-1 block">{errors.role}</span>}
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <TextInput
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
                {errors.phone && <span className="text-red-500 text-sm mt-1 block">{errors.phone}</span>}
              </div>
              <div>
                <Label htmlFor="address">Dirección</Label>
                <TextInput
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
                {errors.address && <span className="text-red-500 text-sm mt-1 block">{errors.address}</span>}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button color="gray" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} className="bg-primary-900 hover:bg-primary-800!">Guardar</Button>
            </div>
          </form>
        )}
      </ModalBody>
    </Modal>
  );
}
