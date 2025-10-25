import { HiEye, HiPencilAlt, HiBan, HiCheck, HiOutlineUserGroup } from "react-icons/hi";

export default function UserCard({
  id,
  name,
  role,
  active,
  onEdit,
  onView,
  onDisable,
  onAssign,
}: {
  id: number;
  name: string;
  role: string;
  active: boolean;
  onEdit: (id: number) => void;
  onView: (id: number) => void;
  onDisable: (id: number) => void;
  onAssign: (id: number) => void;
}) {
  return (
    <div
      className={`flex border-b border-gray-300 text-sm rounded-xl ${
        active ? "bg-white" : "bg-gray-100 opacity-60"
      }`}
    >
      <div className="flex items-center gap-4 w-1/2 px-6 py-2">
        <div className="text-lg w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
          {name.charAt(0)}
        </div>
        <div className="text-lg font-medium text-gray-800">{name}</div>
      </div>

      <div className="text-lg flex items-center w-1/4 px-6 py-4 text-gray-700">
        {
          (() => {
            switch (role) {
              case "ADMIN":
                return "Administrador";
              case "TEACHER":
                return "Profesor";
              case "TUTOR":
                return "Tutor";
              case "STUDENT":
                return "Estudiante";
              default:
                return role;
            }
          })()
        }
      </div>

      <div className="flex items-center justify-end w-auto px-6 py-4 gap-2">
        <button
          onClick={() => onView(id)}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
          title="Ver detalles"
        >
          <HiEye className="w-5 h-5" />
        </button>
        <button
          onClick={() => onEdit(id)}
          className="bg-yellow-400 hover:bg-yellow-500 text-white p-2 rounded"
          title="Editar"
        >
          <HiPencilAlt className="w-5 h-5" />
        </button>
        {(role === "TUTOR" || role === "TEACHER") && (
          <button
            onClick={() => onAssign(id)}
            className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded"
            title={role === "TUTOR" ? "Editar estudiantes" : "Editar materias"}
          >
            <HiOutlineUserGroup className="w-5 h-5" />
          </button>
        )}
        {active ? (
          <button
            onClick={() => onDisable(id)}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
            title="Desactivar"
          >
            <HiBan className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() => onDisable(id)}
            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded"
            title="Activar"
          >
            <HiCheck className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
