"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Badge,
  Spinner,
  ListGroup,
  ListGroupItem,
} from "flowbite-react";

type Option = { id: number; label: string };

type SubjectsApiResponse = {
  all: { id: number; name: string }[];
  assigned: { id: number; name: string }[];
};

type AssignSubjectsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userId: number;        // teacher user id
  isNew?: boolean;       // if true, skip fetching assigned
  onConfirm: (subjectIds: number[]) => Promise<void> | void;
};

export default function AssignSubjectsModal({
  isOpen,
  onClose,
  userId,
  isNew = false,
  onConfirm,
}: AssignSubjectsModalProps) {
  const [loading, setLoading] = useState(false);
  const [all, setAll] = useState<Option[]>([]);
  const [assigned, setAssigned] = useState<Option[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      setLoading(true);
      try {
        const url = isNew
          ? `/api/subjects/minimal`
          : `/api/subjects/minimal?userId=${userId}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load subjects");
        const data: SubjectsApiResponse = await res.json();

        const allOpts: Option[] = data.all.map((s) => ({
          id: s.id,
          label: s.name,
        }));
        const assignedOpts: Option[] = (data.assigned ?? []).map((s) => ({
          id: s.id,
          label: s.name,
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
  const available = useMemo(() => all.filter((o) => !assignedIds.has(o.id)), [all, assignedIds]);

  const moveToAssigned = (opt: Option) => setAssigned((curr) => [...curr, opt]);
  const removeFromAssigned = (opt: Option) =>
    setAssigned((curr) => curr.filter((x) => x.id !== opt.id));

  const clearAssigned = () => setAssigned([]);

  const handleSave = async () => {
    await onConfirm(assigned.map((o) => o.id));
    onClose();
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="lg">
      <ModalHeader>Asignar materias</ModalHeader>
      <ModalBody>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner aria-label="Loading subjects" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: suggestions (no search needed for ~15 subjects) */}
            <div className="border rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Disponibles</h3>
                <Badge>{available.length}</Badge>
              </div>

              <div className="max-h-72 overflow-auto">
                <ListGroup>
                  {available.map((opt) => (
                    <ListGroupItem
                      key={opt.id}
                      onClick={() => moveToAssigned(opt)}
                      className="cursor-pointer"
                    >
                      {opt.label}
                    </ListGroupItem>
                  ))}
                  {available.length === 0 && (
                    <div className="text-sm text-gray-500 p-3">Sin registros</div>
                  )}
                </ListGroup>
              </div>
            </div>

            {/* Right: assigned */}
            <div className="border rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Asignados</h3>
                <Badge color="success">{assigned.length}</Badge>
              </div>

              <div className="max-h-72 overflow-auto">
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

              {/* <div className="mt-3">
                <Button size="sm" color="warning" onClick={clearAssigned} outline>
                  Vaciar
                </Button>
              </div> */}
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
