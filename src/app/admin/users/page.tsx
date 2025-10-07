"use client";

import { useState, useEffect, useRef } from "react";
import { TextInput } from "flowbite-react";
import { HiSearch, HiChevronDown } from "react-icons/hi";
import UserCard from "@/components/userCard";

const roleLabels: Record<User["role"], string> = {
  ADMIN: "Administrador",
  TEACHER: "Profesor",
  TUTOR: "Padre",
};

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  active: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchUsers() {
      const res = await fetch("/api/users/minimal"); // endpoint que ya tenemos
      const data = await res.json();
      setUsers(data);
      setFilteredUsers(data);
    }
    fetchUsers();
  }, []);

  // handle search + role filtering
  useEffect(() => {
    let results = users;

    if (selectedRole) {
      results = results.filter((u) => u.role === selectedRole);
    }

    if (searchTerm.trim()) {
      results = results.filter((u) =>
        `${u.firstName} ${u.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(results);
  }, [users, selectedRole, searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="w-full h-full overflow-x-auto rounded-md">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 w-full">
        {/* Role selector */}
        <div className="relative min-w-[180px]" ref={roleRef}>
          <button
            onClick={() => setIsRoleOpen((prev) => !prev)}
            className="cursor-pointer w-full px-4 py-2 text-sm text-white bg-primary-400 border border-gray-300 rounded-md flex justify-between items-center hover:bg-primary-300"
          >
            {roleLabels[selectedRole || ""] || "Seleccionar rol"}
            <HiChevronDown className="ml-2 h-4 w-4 text-white" />
          </button>
          {isRoleOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
              {Object.entries(roleLabels).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => {
                    setSelectedRole(value);
                    setIsRoleOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => {
                  setSelectedRole(null);
                  setIsRoleOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
              >
                Mostrar todos
              </button>
            </div>
          )}
        </div>

        {/* Search bar */}
        <TextInput
          icon={HiSearch}
          placeholder="Buscar por nombre"
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full sm:w-1/3 focus:ring-primary-500"
        />
      </div>

      {/* Table header */}
      <table className="w-full table-auto text-left text-sm text-gray-700">
        <thead className="bg-gray-100">
          <tr className="border-b border-gray-300">
            <th className="px-6 py-3 w-1/2 font-semibold text-gray-800">
              Nombre
            </th>
            <th className="px-6 py-3 w-1/4 font-semibold text-gray-800">Rol</th>
            <th className="px-6 py-3 w-auto font-semibold text-gray-800">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>

      {/* List of users */}
      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <UserCard
            key={user.id}
            id={user.id}
            name={`${user.firstName} ${user.lastName}`}
            role={user.role}
            active={user.active}
            onEdit={(id: number) => console.log("Edit user:", id)}
            onView={(id: number) => console.log("View user:", id)}
            onDisable={(id: number) => console.log("Toggle active:", id)}
            onAssign={(id: number) =>
              console.log("Assign action for user:", id)
            }
          />
        ))}
      </div>
    </div>
  );
}
