"use client";

import {
  Sidebar,
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
      className="min-h-screen w-64 border-1 border-primary-900"
    >
      {/* Encabezado con escudo */}
      <div className="flex flex-col items-center py-6 gap-2">
        <Image src="/escudo.png" alt="Escudo UEPV" width={72} height={72} />
        <span className="text-xl font-bold text-neutral-dark">UEPV</span>
      </div>

      {/* Menú */}
      <SidebarItems>
        <SidebarItemGroup>
          <SidebarItem
            href="/admin/students"
            icon={() => <HiUserGroup className="text-white w-6 h-6" />}
            className="bg-primary-300 text-white hover:bg-primary-600 focus:ring-0"
          >
            Estudiantes
          </SidebarItem>
        </SidebarItemGroup>
      </SidebarItems>
    </Sidebar>
  );
}
