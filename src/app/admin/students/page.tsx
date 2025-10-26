"use client";
import { Course, Parallel, Student } from "@/app/types";
import StudentCard from "@/components/studentCard";
import StudentDisableModal from "@/components/studentDisableModal";
import StudentEditModal from "@/components/studentEditModal";
import StudentInfoModal from "@/components/studentInfoModal";
import { TextInput } from "flowbite-react";
import { useEffect, useRef, useState } from "react";
import { HiChevronDown, HiSearch } from "react-icons/hi";

export default function Home() {
  const [isParalelOpen, setIsParalelOpen] = useState(false);
  const [isCourseOpen, setIsCourseOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  const cursoRef = useRef<HTMLDivElement>(null);
  const paraleloRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [parallels, setParallels] = useState<Parallel[]>([]);
  const [selectedParallel, setSelectedParallel] = useState<Parallel | null>(
    null
  );
  const [isParallelsLoading, setIsParallelsLoading] = useState(false);

  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null
  );
  const [selectedStudentState, setSelectedStudentState] = useState<boolean>(false);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        cursoRef.current &&
        !cursoRef.current.contains(e.target as Node) &&
        paraleloRef.current &&
        !paraleloRef.current.contains(e.target as Node)
      ) {
        setIsCourseOpen(false);
        setIsParalelOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      const res = await fetch("/api/courses");
      const data = await res.json();
      const activeCourses = data.filter((course: { active: boolean; }) => course.active);
      setCourses(activeCourses);
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    setFilteredStudents(students);
    setSearchTerm("");
  }, [students]);

  useEffect(() => {
    if (!selectedCourse) return;

    const fetchParallels = async () => {
      setIsParallelsLoading(true);
      const res = await fetch(`/api/courses/${selectedCourse.id}/parallels`);
      const data = await res.json();
      setParallels(data);
      setIsParallelsLoading(false);
    };

    fetchParallels();
  }, [selectedCourse]);

  const fetchStudents = async (courseId: number, parallelId: number) => {
    try {
      const res = await fetch(
        `/api/students?courseId=${courseId}&parallelId=${parallelId}`
      );
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
      inputRef.current?.focus();
    } catch (error) {
      console.error("Error al cargar estudiantes", error);
      setStudents([]);
    }
  };

  useEffect(() => {
    if (!selectedCourse || !selectedParallel) return;

    fetchStudents(selectedCourse.id, selectedParallel.id);
  }, [selectedCourse, selectedParallel]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    const filtered = students.filter((student) =>
      `${student.user.firstName} ${student.user.lastName}`
        .toLowerCase()
        .includes(value.toLowerCase())
    );

    setFilteredStudents(filtered);
  };

  const handleStudentUpdated = () => {
    if (selectedCourse && selectedParallel) {
      fetchStudents(selectedCourse.id, selectedParallel.id);
    }
    setIsEditModalOpen(false);
  };

  return (
    <div className="w-full h-full overflow-x-auto rounded-md">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 w-full">
        <div className="flex gap-4">
          <div className="relative min-w-[140px]" ref={cursoRef}>
            <button
              onClick={() => setIsCourseOpen((prev) => !prev)}
              className="cursor-pointer w-full px-4 py-2 text-sm text-white bg-primary-400 border border-gray-300 rounded-md flex justify-between items-center hover:bg-primary-300"
            >
              {selectedCourse?.name || "Curso"}
              <HiChevronDown className="ml-2 h-4 w-4 text-white" />
            </button>
            {isCourseOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                {courses.map((curso) => (
                  <button
                    key={curso.id}
                    onClick={() => {
                      setSelectedCourse(curso);
                      console.log("Curso seleccionado:", curso);
                      setIsCourseOpen(false);
                      setIsParalelOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    {curso.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative min-w-[140px]" ref={paraleloRef}>
            <button
              onClick={() => setIsParalelOpen((prev) => !prev)}
              disabled={!selectedCourse || isParallelsLoading}
              className={`w-full px-4 py-2 text-sm border rounded-md flex justify-between items-center transition
      ${!selectedCourse || isParallelsLoading
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-primary-400 text-white hover:bg-primary-300 cursor-pointer"
                }`}
            >
              {selectedParallel?.name || "Paralelo"}
              <HiChevronDown className="ml-2 h-4 w-4 text-white" />
            </button>
            {isParalelOpen && !isParallelsLoading && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                {parallels.map((parallel) => (
                  <button
                    key={parallel.id}
                    onClick={() => {
                      setSelectedParallel(parallel);
                      console.log("Paralelo seleccionado:", parallel);
                      setIsParalelOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    {parallel.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <TextInput
          ref={inputRef}
          icon={HiSearch}
          placeholder="Buscar estudiante"
          value={searchTerm}
          onChange={handleSearchChange}
          disabled={!selectedCourse || !selectedParallel}
          className="w-full sm:w-1/3 focus:ring-primary-500"
        />
      </div>

      <table className="w-full table-auto text-left text-sm text-gray-700">
        <thead className="bg-gray-100">
          <tr className="border-b border-gray-300">
            <th className="px-6 py-3 w-1/2 font-semibold text-gray-800">
              Nombre
            </th>
            <th className="px-6 py-3 w-1/4 font-semibold text-gray-800">
              Curso
            </th>
            <th className="px-6 py-3 w-auto font-semibold text-gray-800">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
      <div className="space-y-3">
        {filteredStudents.map((student) => (
          <StudentCard
            key={student.id}
            id={student.id}
            name={`${student.user.firstName} ${student.user.lastName}`}
            course={`${selectedCourse?.name} ${selectedParallel?.name}`}
            active={student.user.active}
            onEdit={(id: number) => {
              setSelectedStudentId(id);
              setIsEditModalOpen(true);
            }}
            onView={(id: number) => {
              setSelectedStudentId(id);
              setIsViewModalOpen(true);
            }}
            onDisable={(id: number) => {
              setSelectedStudentId(id);
              setSelectedStudentState(student.user.active);
              setIsDisableModalOpen(true);
            }}
          />
        ))}
      </div>
      <StudentInfoModal
        id={selectedStudentId}
        open={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      />
      <StudentEditModal
        id={selectedStudentId}
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdated={handleStudentUpdated}
      />
      <StudentDisableModal
        id={selectedStudentId}
        name={
          students.find((s) => s.id === selectedStudentId)?.user.firstName || ""
        }
        active={selectedStudentState}
        open={isDisableModalOpen}
        onClose={() => setIsDisableModalOpen(false)}
        onUpdated={handleStudentUpdated}
      />
    </div>
  );
}
