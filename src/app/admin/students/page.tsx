import StudentCard from "@/components/studentCard";

export default function Home() {
  return (
    <div className="w-full overflow-x-auto rounded-md">
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
        <tbody>{/* Aquí irán las filas de datos después */}</tbody>
      </table>
      <div className="space-y-3">
        <StudentCard name="Ana López" course="1ro B" />
        <StudentCard name="Carlos Pérez" course="2do A" />
        <StudentCard name="Lucía Fernández" course="3ro C" />
      </div>
    </div>
  );
}
