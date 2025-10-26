import { useState } from "react";
import { useEffect } from "react";
import { HiPencilAlt, HiBan, HiCheck } from "react-icons/hi";


type Parallel = {
  id: number;
  name: string;
  active?: boolean;
};

type Props = {
  id: number;
  name: string;
  parallels: Parallel[];
  active?: boolean;
  allParallels?: Parallel[]; // for edit mode, to show all options
  startEditing?: boolean;
  onUpdate: (id: number, data: { name: string; parallelIds: number[] }) => void;
  onDisable: (id: number) => void;
};


export default function CourseCard({
  id,
  name,
  parallels,
  active = true,
  allParallels = [
    { id: 1, name: "A" },
    { id: 2, name: "B" },
    { id: 3, name: "C" },
  ],
  startEditing = false,
  onUpdate,
  onDisable,
}: Props) {
  const [isEditing, setIsEditing] = useState<boolean>(startEditing);
  const [editedName, setEditedName] = useState(name);
  const [selectedParallelIds, setSelectedParallelIds] = useState<number[]>(
    parallels.filter((p) => p.active !== false).map((p) => p.id)
  );

  // Keep editedName in sync when name prop changes
  useEffect(() => {
    setEditedName(name);
  }, [name]);

  // If startEditing becomes true later, open edit mode
  useEffect(() => {
    if (startEditing) setIsEditing(true);
  }, [startEditing]);

  const handleParallelToggle = (parallelId: number) => {
    setSelectedParallelIds((current) =>
      current.includes(parallelId)
        ? current.filter((id) => id !== parallelId)
        : [...current, parallelId]
    );
  };

  const handleUpdate = () => {
    onUpdate(id, {
      name: editedName,
      parallelIds: selectedParallelIds,
    });
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setEditedName(name);
    setSelectedParallelIds(parallels.filter((p) => p.active !== false).map((p) => p.id));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedName(name);
    setSelectedParallelIds(parallels.filter((p) => p.active !== false).map((p) => p.id));
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
            {allParallels.map((parallel) => (
              <label key={parallel.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedParallelIds.includes(parallel.id)}
                  onChange={() => handleParallelToggle(parallel.id)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span>{parallel.name}</span>
              </label>
            ))}
          </div>
        ) : (
          <div>{parallels.filter((p) => p.active !== false).map((p) => p.name).join(", ")}</div>
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
}
