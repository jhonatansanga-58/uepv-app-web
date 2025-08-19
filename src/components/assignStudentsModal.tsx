"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  TextInput,
  Badge,
  Spinner,
  ListGroup,
  ListGroupItem,
} from "flowbite-react";

type Option = { id: number; label: string };

type StudentsApiResponse = {
  all: { id: number; fullName: string }[];
  assigned: { id: number; fullName: string }[];
};

type AssignStudentsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userId: number;        // tutor user id
  isNew?: boolean;       // if true, skip fetching assigned
  onConfirm: (studentIds: number[]) => Promise<void> | void;
};

export default function AssignStudentsModal({
  isOpen,
  onClose,
  userId,
  isNew = false,
  onConfirm,
}: AssignStudentsModalProps) {
  const [loading, setLoading] = useState(false);
  const [all, setAll] = useState<Option[]>([]);
  const [assigned, setAssigned] = useState<Option[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      setLoading(true);
      setSearch("");
      try {
        const url = isNew
          ? `/api/students/minimal`
          : `/api/students/minimal?userId=${userId}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load students");
        const data: StudentsApiResponse = await res.json();

        const allOpts: Option[] = data.all.map((s) => ({
          id: s.id,
          label: s.fullName,
        }));

        const assignedOpts: Option[] = (data.assigned ?? []).map((s) => ({
          id: s.id,
          label: s.fullName,
        }));

        setAll(allOpts);
        setAssigned(isNew ? [] : assignedOpts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, isNew, userId]);

  const assignedIds = useMemo(() => new Set(assigned.map((o) => o.id)), [assigned]);

  const filteredAvailable = useMemo(() => {
    const term = search.trim().toLowerCase();
    return all
      .filter((o) => !assignedIds.has(o.id))
      .filter((o) => (term ? o.label.toLowerCase().includes(term) : true));
  }, [all, assignedIds, search]);

  const moveToAssigned = (opt: Option) => setAssigned((curr) => [...curr, opt]);
  const removeFromAssigned = (opt: Option) =>
    setAssigned((curr) => curr.filter((x) => x.id !== opt.id));

  const selectAllVisible = () => {
    const toAdd = filteredAvailable.filter((o) => !assignedIds.has(o.id));
    if (toAdd.length === 0) return;
    setAssigned((curr) => [...curr, ...toAdd]);
  };

  const clearAssigned = () => setAssigned([]);

  const handleSave = async () => {
    await onConfirm(assigned.map((o) => o.id));
    onClose();
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="xl">
      <ModalHeader>Asignar estudiantes</ModalHeader>
      <ModalBody>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner aria-label="Loading students" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: suggestions with search */}
            <div className="border rounded-2xl p-3">
              <div className="mb-3">
                <TextInput
                  placeholder="Buscar por nombre..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Sugerencias</h3>
                <Badge>{filteredAvailable.length}</Badge>
              </div>

              <div className="max-h-80 overflow-auto">
                <ListGroup>
                  {filteredAvailable.map((opt) => (
                    <ListGroupItem
                      key={opt.id}
                      onClick={() => moveToAssigned(opt)}
                      className="cursor-pointer"
                    >
                      {opt.label}
                    </ListGroupItem>
                  ))}
                  {filteredAvailable.length === 0 && (
                    <div className="text-sm text-gray-500 p-3">Sin coincidencias</div>
                  )}
                </ListGroup>
              </div>

              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={selectAllVisible} outline>
                  Seleccionar todos (visible)
                </Button>
              </div>
            </div>

            {/* Right: assigned */}
            <div className="border rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Asignados</h3>
                <Badge color="success">{assigned.length}</Badge>
              </div>

              <div className="max-h-80 overflow-auto">
                <ListGroup>
                  {assigned.map((opt) => (
                    <ListGroupItem
                      key={opt.id}
                      onClick={() => removeFromAssigned(opt)}
                      className="cursor-pointer"
                    >
                      {opt.label}
                    </ListGroupItem>
                  ))}
                  {assigned.length === 0 && (
                    <div className="text-sm text-gray-500 p-3">Vacío</div>
                  )}
                </ListGroup>
              </div>

              <div className="mt-3">
                <Button size="sm" color="warning" onClick={clearAssigned} outline>
                  Vaciar
                </Button>
              </div>
            </div>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button onClick={handleSave}>Guardar</Button>
        <Button color="gray" onClick={onClose} outline>
          Cancelar
        </Button>
      </ModalFooter>
    </Modal>
  );
}
