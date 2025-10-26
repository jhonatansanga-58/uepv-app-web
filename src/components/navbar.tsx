"use client";

import {
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from "flowbite-react";
import { usePathname } from "next/navigation";

import { HiUserCircle } from "react-icons/hi";

export function NavBarComponent() {
  const pathname = usePathname();

  // Define the navbar text based on the current route
  const getNavbarText = () => {
    switch (pathname) {
      case "/admin/students":
        return "Gestión de estudiantes";
      case "/admin/students/create":
        return "Registrar nuevo estudiante";
      case "/admin/users":
        return "Gestión de usuarios";
      case "/admin/users/create":
        return "Registrar nuevo usuario";
      case "/admin/courses":
        return "Gestión de cursos";
      case "/admin/subjects":
        return "Gestión de materias";
      default:
        return "Gestión de estudiantes"; // Default fallback
    }
  };

  return (
    <Navbar
      fluid
      className="bg-primary-900 border-b border-gray-200 shadow-sm px-6"
    >
      <NavbarBrand href="#">
        <span className="self-center whitespace-nowrap text-xl font-semibold text-gray-100">
          {getNavbarText()}
        </span>
      </NavbarBrand>

      {/* Toggle móvil (se puede eliminar si no es necesario) */}
      <NavbarToggle />

      {/* Datos del usuario */}
      <NavbarCollapse>
        <NavbarLink href="#" className="flex items-center gap-2">
          <div className="flex flex-col text-right leading-tight">
            <span className="text-lg font-medium text-gray-200">
              Jhonatan58
            </span>
            <span className="text-md text-gray-300">Administrador</span>
          </div>
          <HiUserCircle className="w-11 h-11 text-white" />
        </NavbarLink>
      </NavbarCollapse>
    </Navbar>
  );
}
