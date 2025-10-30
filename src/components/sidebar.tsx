"use client";

import {
  Sidebar,
  SidebarCollapse,
  SidebarItem,
  SidebarItemGroup,
  SidebarItems,
  Button,
} from "flowbite-react";

import { HiAcademicCap, HiUserGroup, HiLogout } from "react-icons/hi";
import Image from "next/image";
import { signOut } from "next-auth/react";

export function SideBarComponent() {
  return (
    <Sidebar
      aria-label="Default sidebar"
      className="min-h-screen max-h-screen w-64 border-1 border-primary-900 flex flex-col"
    >
      {/* Encabezado con escudo */}
      <div className="flex flex-col items-center py-6 gap-2">
        <Image src="/escudo.png" alt="Escudo UEPV" width={72} height={72} />
        <span className="text-xl font-bold text-neutral-dark">UEPV</span>
      </div>

      {/* Menú */}
      <div className="flex-1 overflow-y-auto">
        <SidebarItems className="flex flex-col">
          <SidebarItemGroup>
            <SidebarCollapse
              icon={() => <HiUserGroup className="text-white w-6 h-6" />}
              label="Estudiantes"
              open={true}
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
              open={true}
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
              open={true}
              className="bg-primary-300 text-white hover:bg-primary-600 focus:ring-0"
            >
              <SidebarItem href="/admin/courses">
                Cursos
              </SidebarItem>
              <SidebarItem href="/admin/subjects">
                Materias
              </SidebarItem>
            </SidebarCollapse>

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
