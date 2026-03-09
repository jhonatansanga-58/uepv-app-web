import React, { useEffect, useState } from 'react';
import { HiAcademicCap, HiBan, HiCheck, HiPencilAlt } from 'react-icons/hi';

type Course = {
  id: number;
  name: string;
};

type Props = {
  id: number;
  name: string;
  courses: Course[];
  active?: boolean;
  startEditing?: boolean;
  onUpdate: (id: number, data: { name: string; }) => void;
  onDisable: (id: number) => void;
  onViewCourses: (id: number) => void;
};

export default function CourseCard({
  id,
  name,
  courses,
  active = true,
  startEditing = false,
  onUpdate,
  onDisable,
  onViewCourses,
}: Props) {
  const [isEditing, setIsEditing] = useState<boolean>(startEditing);
  const [editedName, setEditedName] = useState(name);

  // Keep editedName in sync when name prop changes
  useEffect(() => {
    setEditedName(name);
  }, [name]);

  // If startEditing becomes true later, open edit mode
  useEffect(() => {
    if (startEditing) setIsEditing(true);
  }, [startEditing]);

  const handleUpdate = () => {
    onUpdate(id, {
      name: editedName,
    });
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setEditedName(name);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedName(name);
    setIsEditing(false);
  };

  return (
    <div
      className={`flex border-b border-gray-300 text-sm rounded-xl ${active ? "bg-white" : "bg-gray-100 opacity-60"}`}
    >
      <div className="flex items-center gap-4 w-1/2 px-6 py-4">
        <div className="text-lg w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
          {name.charAt(0) || "C"}
        </div>
        {isEditing ? (
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="text-lg font-medium text-gray-800 border rounded px-2 py-1"
          />
        ) : (
          <div className="text-lg font-medium text-gray-800">{name}</div>
        )}
      </div>

      <div className="text-lg flex items-center w-1/4 px-6 py-4 text-gray-700">
        {isEditing ? (
          <div className="flex gap-4">

          </div>
        ) : (
          <div>{courses.length} curso{courses.length !== 1 ? "s":""}</div>
        )}
      </div>

      <div className="flex items-center justify-end w-auto px-6 py-4 gap-2">
        {isEditing ? (
          <>
            <button
              onClick={handleUpdate}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
              title="Confirmar"
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
          <button
            onClick={handleEditClick}
            className="bg-yellow-400 hover:bg-yellow-500 text-white p-2 rounded"
            title="Editar"
          >
            <HiPencilAlt className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={() => onViewCourses(id)}
          className="bg-primary-500 hover:bg-primary-600 text-white p-2 rounded"
          title="Materias"
        >
          <HiAcademicCap className="w-5 h-5" />
        </button>
        {active ? (
          <button
            onClick={() => onDisable(id)}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
            title="Deshabilitar"
          >
            <HiBan className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() => onDisable(id)}
            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded"
            title="Habilitar"
          >
            <HiCheck className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
