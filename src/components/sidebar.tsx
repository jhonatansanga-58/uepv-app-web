"use client";

import {
  Sidebar,
  SidebarCollapse,
  SidebarItem,
  SidebarItemGroup,
  SidebarItems,
} from "flowbite-react";

import { HiUserGroup } from "react-icons/hi";
import Image from "next/image";

export function SideBarComponent() {
  return (
    <Sidebar
      aria-label="Default sidebar"
      className="min-h-screen max-h-screen w-64 border-1 border-primary-900 overflow-hidden"
    >
      {/* Encabezado con escudo */}
      <div className="flex flex-col items-center py-6 gap-2">
        <Image src="/escudo.png" alt="Escudo UEPV" width={72} height={72} />
        <span className="text-xl font-bold text-neutral-dark">UEPV</span>
      </div>

      {/* Menú */}
      <SidebarItems className="max-h-screen">
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
        </SidebarItemGroup>
      </SidebarItems>
    </Sidebar>
  );
}
