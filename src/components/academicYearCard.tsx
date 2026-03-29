import { useState, useEffect } from "react";
import { HiCheck, HiOutlineCheckCircle } from "react-icons/hi";

type Props = {
  id: number;
  year: number;
  active?: boolean;
  startEditing?: boolean;
  onUpdate: (id: number, data: { year: number }) => void;
  onActivate: (id: number) => void;
};

export default function AcademicYearCard({
  id,
  year,
  active = false,
  startEditing = false,
  onUpdate,
  onActivate,
}: Props) {
  const [isEditing, setIsEditing] = useState<boolean>(startEditing);
  const [editedYear, setEditedYear] = useState<number>(year || new Date().getFullYear());

  useEffect(() => {
    setEditedYear(year);
  }, [year]);

  useEffect(() => {
    if (startEditing) setIsEditing(true);
  }, [startEditing]);

  const handleUpdate = () => {
    onUpdate(id, {
      year: editedYear,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedYear(year);
    setIsEditing(false);
  };

  return (
    <div
      className={`flex border-b border-gray-300 text-sm rounded-xl ${
        active ? "bg-white" : "bg-gray-100 opacity-80"
      }`}
    >
      <div className="flex items-center gap-4 w-1/2 px-6 py-4">
        <div className="text-lg w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
          Y
        </div>
        {isEditing ? (
          <input
            type="number"
            value={editedYear}
            onChange={(e) => setEditedYear(parseInt(e.target.value))}
            className="text-lg font-medium text-gray-800 border rounded px-2 py-1"
            min={2000}
            max={2100}
          />
        ) : (
          <div className="text-lg font-medium text-gray-800">{year}</div>
        )}
      </div>

      <div className="text-lg flex items-center w-1/4 px-6 py-4">
        {!isEditing && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              active
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {active ? "Activa" : "Inactiva"}
          </span>
        )}
      </div>

      <div className="flex items-center justify-end w-auto px-6 py-4 gap-2 flex-1">
        {isEditing ? (
          <>
            <button
              onClick={handleUpdate}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
              title="Añadir"
            >
              <HiCheck className="w-5 h-5" />
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-400 hover:bg-gray-500 text-white p-2 rounded"
              title="Cancelar"
            >
              Cancelar
            </button>
          </>
        ) : (
          !active && (
            <button
              onClick={() => onActivate(id)}
              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded"
              title="Activar esta gestión"
            >
              <HiOutlineCheckCircle className="w-5 h-5" />
            </button>
          )
        )}
      </div>
    </div>
  );
}
