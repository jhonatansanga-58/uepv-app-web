import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { useEffect, useState } from "react";

type Props = {
  id: number | null;
  open: boolean;
  onClose: () => void;
};

type StudentDetail = {
  id: number;
  birthDate?: string | Date | null;
  gender?: string | null;
  cardCode: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    address?: string | null;
  };
  courseParallel: {
    course: { name: string };
    parallel: { name: string };
  };
  tutorships: Array<{
    id: number;
    tutor: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string | null;
      address?: string | null;
    };
  }> | null;
};

export default function StudentInfoModal({ id, open, onClose }: Props) {
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || id === null) return;

    setLoading(true);
    fetch(`/api/students/${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setStudent(data);
        setLoading(false);
      })
      .catch(() => {
        setStudent(null);
        setLoading(false);
      });
  }, [id, open]);

  return (
    <Modal show={open} onClose={onClose}>
      <ModalHeader>Información del Estudiante</ModalHeader>
      <ModalBody>
        {loading ? (
          <div className="text-center">Cargando...</div>
        ) : student ? (
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-2">
                Datos del estudiante
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <p>
                  <strong>Nombre:</strong> {student.user.firstName}{" "}
                  {student.user.lastName}
                </p>
                <p>
                  <strong>Código de Tarjeta:</strong> {student.cardCode}
                </p>
                <p>
                  <strong>Fecha de Nacimiento:</strong>{" "}
                  {student.birthDate
                    ? new Date(student.birthDate).toLocaleString("es-BO", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                    : "No especificada"}
                </p>
                <p>
                  <strong>Género:</strong>{" "}
                  {student.gender === "MALE"
                    ? "Masculino"
                    : student.gender === "FEMALE"
                      ? "Femenino"
                      : student.gender === "OTHER"
                        ? "Otro"
                        : "No especificado"}
                </p>
                <p>
                  <strong>Teléfono:</strong>{" "}
                  {student.user.phone || "No registrado"}
                </p>
                <p>
                  <strong>Dirección:</strong>{" "}
                  {student.user.address || "No registrada"}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-2">
                Curso y Paralelo
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <p>
                  <strong>Curso:</strong> {student.courseParallel.course.name}
                </p>
                <p>
                  <strong>Paralelo:</strong>{" "}
                  {student.courseParallel.parallel.name}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-2">
                Tutores
              </h3>
              {student.tutorships && student.tutorships.length > 0 ? (
                student.tutorships.map((tutorship) => (
                  <div
                    key={tutorship.id}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <p>
                      <strong>Nombre:</strong> {tutorship.tutor.firstName}{" "}
                      {tutorship.tutor.lastName}
                    </p>
                    <p>
                      <strong>Correo:</strong> {tutorship.tutor.email}
                    </p>
                    <p>
                      <strong>Teléfono:</strong>{" "}
                      {tutorship.tutor.phone || "No registrado"}
                    </p>
                    <p>
                      <strong>Dirección:</strong>{" "}
                      {tutorship.tutor.address || "No registrada"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="italic text-gray-500">No hay tutores asignados</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-red-500">Error al cargar datos</div>
        )}
      </ModalBody>
    </Modal>
  );
}
