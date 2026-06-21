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
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open || id === null) return;

    setLoading(true);
    setErrors({});
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
        toast.error("Error al cargar la información del estudiante.");
      });
  }, [id, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear errors when typing
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

      const response = await fetch(`/api/students/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Error al actualizar estudiante.");
      }

      toast.success(`¡El estudiante "${formData.firstName} ${formData.lastName}" se ha actualizado con éxito!`);
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
      <ModalHeader>Editar Estudiante</ModalHeader>
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
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <span className="text-red-500 text-sm mt-1 block">{errors.email}</span>}
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
                {errors.birthDate && <span className="text-red-500 text-sm mt-1 block">{errors.birthDate}</span>}
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
                {errors.gender && <span className="text-red-500 text-sm mt-1 block">{errors.gender}</span>}
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
