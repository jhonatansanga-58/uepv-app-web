"use client";
import StudentCard from "@/components/studentCard";
import { TextInput } from "flowbite-react";
import { useEffect, useRef, useState } from "react";
import { HiChevronDown, HiSearch } from "react-icons/hi";

export default function Home() {
  const [isParalelOpen, setIsParalelOpen] = useState(false);
  const [isCourseOpen, setIsCourseOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedParalel, setSelectedParalel] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const cursoRef = useRef<HTMLDivElement>(null);
  const paraleloRef = useRef<HTMLDivElement>(null);

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

  const handleSearch = (value: string) => {
    console.log("Buscando:", value);
  };

  return (
    <div className="w-full overflow-x-auto rounded-md">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 w-full">
        <div className="flex gap-4">
          <div className="relative min-w-[140px]" ref={cursoRef}>
            <button
              onClick={() => setIsCourseOpen((prev) => !prev)}
              className="w-full px-4 py-2 text-sm text-white bg-primary-400 border border-gray-300 rounded-md flex justify-between items-center hover:bg-primary-300"
            >
              {selectedCourse || "Curso"}
              <HiChevronDown className="ml-2 h-4 w-4 text-white" />
            </button>
            {isCourseOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                {["1ro", "2do", "3ro"].map((curso) => (
                  <button
                    key={curso}
                    onClick={() => {
                      setSelectedCourse(curso);
                      setIsCourseOpen(false);
                      setIsParalelOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    {curso}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative min-w-[140px]" ref={paraleloRef}>
            <button
              onClick={() => setIsParalelOpen((prev) => !prev)}
              className="w-full px-4 py-2 text-sm text-white bg-primary-400 border border-gray-300 rounded-md flex justify-between items-center hover:bg-primary-300"
            >
              {selectedParalel || "Paralelo"}
              <HiChevronDown className="ml-2 h-4 w-4 text-white" />
            </button>
            {isParalelOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                {["A", "B", "C"].map((paralelo) => (
                  <button
                    key={paralelo}
                    onClick={() => {
                      setSelectedParalel(paralelo);
                      setIsParalelOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    {paralelo}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <TextInput
          icon={HiSearch}
          placeholder="Buscar estudiante"
          value={searchTerm}
          onChange={(e) => {
            const value = e.target.value;
            setSearchTerm(value);
            handleSearch(value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(searchTerm);
            }
          }}
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
        <StudentCard name="Ana López" course="1ro B" />
        <StudentCard name="Carlos Pérez" course="2do A" />
        <StudentCard name="Lucía Fernández" course="3ro C" />
      </div>
    </div>
  );
}
