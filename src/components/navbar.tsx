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
    if (pathname === "/admin/students") {
      return "Gestión de estudiantes";
    } else if (pathname === "/admin/students/create") {
      return "Registrar nuevo estudiante";
    } else if (pathname === "/admin/users") {
      return "Gestión de usuarios";
    } else if (pathname === "/admin/users/create") {
      return "Registrar nuevo usuario";
    } else {
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
