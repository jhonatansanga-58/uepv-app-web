"use client";

import {
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from "flowbite-react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { HiUserCircle, HiMenu } from "react-icons/hi";

interface NavBarProps {
  onToggleSidebar?: () => void;
}

export function NavBarComponent({ onToggleSidebar }: NavBarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

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
      case "/leaves":
        return "Licencias";
      case "/leaves/new":
        return "Registrar nueva licencia";
      case "/leaves/mine":
        return "Mis licencias";
      case "/attendances/register":
        return "Asistencias";
      case "/attendances/history":
        return "Historial de asistencias";
      case "/notices/notifications":
        return "Comunicados";
      case "/notices/meetings":
        return "Citaciones";
      case "/notices/tasks":
        return "Tareas";
      default:
        return ""; // Default fallback
    }
  };

  return (
    <Navbar
      fluid
      className="bg-primary-900 border-b border-gray-200 shadow-sm px-6"
    >
      <div className="flex items-center gap-2">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-gray-100 hover:bg-primary-800 md:hidden focus:outline-none focus:ring-2 focus:ring-primary-300 transition-colors"
            aria-label="Toggle sidebar"
          >
            <HiMenu className="w-6 h-6" />
          </button>
        )}
        <NavbarBrand href="#">
          <span className="self-center whitespace-nowrap text-lg sm:text-xl font-semibold text-gray-100">
            {getNavbarText()}
          </span>
        </NavbarBrand>
      </div>

      {/* Datos del usuario - Alineados a la derecha */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex flex-col text-right leading-tight">
          <span className="text-sm font-medium text-gray-200">
            {session?.user?.name ?? 'Cargando...'}
          </span>
          <span className="text-xs text-gray-300">
            {session?.user?.role === 'ADMIN' ? 'Administrador' :
              session?.user?.role === 'TEACHER' ? 'Profesor' :
                session?.user?.role === 'TUTOR' ? 'Tutor' :
                  session?.user?.role === 'STUDENT' ? 'Estudiante' :
                    'Cargando...'}
          </span>
        </div>
        <HiUserCircle className="w-9 h-9 sm:w-10 sm:h-10 text-white" />
      </div>
    </Navbar>
  );
}
