"use client";

import {
  Sidebar,
  SidebarCollapse,
  SidebarItem,
  SidebarItemGroup,
  SidebarItems,
  Button,
} from "flowbite-react";

import { HiAcademicCap, HiUserGroup, HiLogout, HiClipboardList, HiBell, HiDocumentText } from "react-icons/hi";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";

export function SideBarComponent() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  return (
    <Sidebar
      aria-label="Default sidebar"
      className="min-h-screen max-h-screen w-64 border-1 border-primary-900 flex flex-col"
    >
      {/* Encabezado con escudo */}
      <div className="flex flex-col items-center py-6 gap-2">
        <Image src="/escudo.png" alt="Escudo UEPV" width={100} height={100} />
        <span className="text-xl font-bold text-neutral-dark">UEPV</span>
      </div>

      {/* Menú */}
      <div className="flex-1 overflow-y-auto">
        <SidebarItems className="flex flex-col">
          <SidebarItemGroup>
            {/* Admin-only sections */}
            {userRole === 'ADMIN' && (
              <>
                <SidebarCollapse
                  icon={() => <HiUserGroup className="text-white w-6 h-6" />}
                  label="Estudiantes"
                  open={false}
                  className="bg-primary-300 text-white hover:bg-primary-600 focus:ring-0"
                >
                  <SidebarItem href="/admin/students">Lista</SidebarItem>
                  <SidebarItem href="/admin/students/create">
                    Registrar nuevo
                  </SidebarItem>
                </SidebarCollapse>

                <SidebarCollapse
                  icon={() => <HiUserGroup className="text-white w-6 h-6" />}
                  label="Usuarios"
                  open={false}
                  className="bg-primary-300 text-white hover:bg-primary-600 focus:ring-0"
                >
                  <SidebarItem href="/admin/users">Lista</SidebarItem>
                  <SidebarItem href="/admin/users/create">
                    Registrar nuevo
                  </SidebarItem>
                </SidebarCollapse>

                <SidebarCollapse
                  icon={() => <HiAcademicCap className="text-white w-6 h-6" />}
                  label="Organización escolar"
                  open={false}
                  className="bg-primary-300 text-white hover:bg-primary-600 focus:ring-0"
                >
                  <SidebarItem href="/admin/academic-years">
                    Gestiones
                  </SidebarItem>
                  <SidebarItem href="/admin/courses">
                    Cursos
                  </SidebarItem>
                  <SidebarItem href="/admin/subjects">
                    Materias
                  </SidebarItem>
                </SidebarCollapse>
              </>
            )}

            {/* Leave requests section - visible to both ADMIN and TUTOR */}
            {(userRole === 'ADMIN' || userRole === 'TUTOR') && (
              <SidebarCollapse
                icon={() => <HiDocumentText className="text-white w-6 h-6" />}
                label="Licencias"
                open={false}
                className="bg-primary-300 text-white hover:bg-primary-600 focus:ring-0"
              >
                {userRole === 'TUTOR' && (
                  <>
                    <SidebarItem href="/leaves/mine">Mis licencias</SidebarItem>
                    <SidebarItem href="/leaves/new">Registrar nueva</SidebarItem>
                  </>
                )}
                {userRole === 'ADMIN' && (
                  <SidebarItem href="/leaves">Revisar</SidebarItem>
                )}
              </SidebarCollapse>
            )}
            {/* Attendances section - register attendance (visible to TEACHER and ADMIN and TUTOR) */}
            {userRole && (
              <SidebarCollapse
                icon={() => <HiClipboardList className="text-white w-6 h-6" />}
                label="Asistencias"
                open={false}
                className="bg-primary-300 text-white hover:bg-primary-600 focus:ring-0"
              >
                {(userRole === 'ADMIN' || userRole === 'TEACHER') && (
                  <>
                    <SidebarItem href="/attendances/register">Registrar manualmente</SidebarItem>
                    <SidebarItem href="/attendances/register-fingerprint">Registrar con huella</SidebarItem>
                  </>
                )}
                <SidebarItem href="/attendances/history">Historial</SidebarItem>
              </SidebarCollapse>
            )}
            {/* Notices / Avisos */}
            {userRole && (
              <SidebarCollapse
                icon={() => <HiBell className="text-white w-6 h-6" />}
                label="Avisos"
                open={false}
                className="bg-primary-300 text-white hover:bg-primary-600 focus:ring-0"
              >
                <SidebarItem href="/notices/notifications">Comunicados</SidebarItem>
                {userRole !== 'ADMIN' && (
                  <SidebarItem href="/notices/tasks">Tareas</SidebarItem>
                )}
                <SidebarItem href="/notices/meetings">Citaciones</SidebarItem>
              </SidebarCollapse>
            )}
          </SidebarItemGroup>
        </SidebarItems>
      </div>

      <div className="p-4 border-t border-primary-800 shrink-0">
        <Button
          onClick={() => signOut({ callbackUrl: '/login' })}
          color="primary"
          className="w-full bg-primary-300 text-white hover:bg-primary-600 focus:ring-0 flex items-center gap-2"
        >
          <HiLogout className="w-5 h-5" />
          Cerrar Sesión
        </Button>
      </div>

    </Sidebar>
  );
}
