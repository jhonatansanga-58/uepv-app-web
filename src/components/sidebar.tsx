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
import { usePathname } from "next/navigation";
import Link from "next/link";

export function SideBarComponent() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const pathname = usePathname();

  // Helper classes for active/inactive collapse headings
  const getCollapseClass = (isActive: boolean) => {
    return isActive
      ? "bg-primary-900! text-white! hover:bg-primary-800! focus:ring-0 font-bold shadow-sm rounded-lg transition-all duration-200 my-1"
      : "bg-white! text-neutral-dark! hover:bg-primary-50! hover:text-primary-900! focus:ring-0 transition-all duration-200 rounded-lg border border-gray-100 shadow-sm my-1";
  };

  // Helper function to render colored icons dynamically based on active state
  const getIcon = (isActive: boolean, IconComponent: any, extraClass: string = "") => {
    return () => (
      <IconComponent 
        className={`${isActive ? "text-white!" : "text-primary-900! group-hover:text-primary-800!"} w-6 h-6 ${extraClass} transition-colors`} 
      />
    );
  };

  // Helper classes for sub-menu items (Lista, Registrar nuevo, etc.)
  const getSubItemClass = (isActive: boolean) => {
    return isActive
      ? "bg-primary-100! text-primary-900! font-bold pl-8 rounded-md transition-all duration-200 shadow-sm my-1"
      : "text-neutral-dark hover:bg-primary-50 hover:text-primary-700! pl-8 rounded-md transition-all duration-200 my-1";
  };

  return (
    <Sidebar
      aria-label="Default sidebar"
      className="min-h-screen max-h-screen w-64 border-r border-gray-200 flex flex-col bg-white"
    >
      {/* Encabezado con escudo */}
      <Link href="/" className="flex flex-col items-center py-6 gap-2 shrink-0 border-b border-gray-100 hover:opacity-85 transition-opacity cursor-pointer">
        <Image src="/escudo.png" alt="Escudo UEPV" width={90} height={90} className="drop-shadow-md" />
        <span className="text-xl font-bold text-neutral-dark tracking-wide">UEPV</span>
      </Link>

      {/* Menú */}
      <div className="flex-1 overflow-y-auto px-2 py-4">
        <SidebarItems className="flex flex-col">
          <SidebarItemGroup className="space-y-1">
            {/* Admin-only sections */}
            {userRole === 'ADMIN' && (
              <>
                <SidebarCollapse
                  icon={getIcon(pathname.startsWith("/admin/students"), HiUserGroup)}
                  label="Estudiantes"
                  open={pathname.startsWith("/admin/students")}
                  className={getCollapseClass(pathname.startsWith("/admin/students"))}
                >
                  <SidebarItem 
                    href="/admin/students" 
                    active={pathname === "/admin/students"}
                    className={getSubItemClass(pathname === "/admin/students")}
                  >
                    Lista
                  </SidebarItem>
                  <SidebarItem 
                    href="/admin/students/create" 
                    active={pathname === "/admin/students/create"}
                    className={getSubItemClass(pathname === "/admin/students/create")}
                  >
                    Registrar nuevo
                  </SidebarItem>
                </SidebarCollapse>

                <SidebarCollapse
                  icon={getIcon(pathname.startsWith("/admin/users"), HiUserGroup)}
                  label="Usuarios"
                  open={pathname.startsWith("/admin/users")}
                  className={getCollapseClass(pathname.startsWith("/admin/users"))}
                >
                  <SidebarItem 
                    href="/admin/users" 
                    active={pathname === "/admin/users"}
                    className={getSubItemClass(pathname === "/admin/users")}
                  >
                    Lista
                  </SidebarItem>
                  <SidebarItem 
                    href="/admin/users/create" 
                    active={pathname === "/admin/users/create"}
                    className={getSubItemClass(pathname === "/admin/users/create")}
                  >
                    Registrar nuevo
                  </SidebarItem>
                </SidebarCollapse>

                <SidebarCollapse
                  icon={getIcon(
                    pathname === "/admin/academic-years" || 
                    pathname === "/admin/courses" || 
                    pathname === "/admin/subjects", 
                    HiAcademicCap,
                    "scale-125"
                  )}
                  label="Organización escolar"
                  open={pathname === "/admin/academic-years" || pathname === "/admin/courses" || pathname === "/admin/subjects"}
                  className={getCollapseClass(
                    pathname === "/admin/academic-years" || 
                    pathname === "/admin/courses" || 
                    pathname === "/admin/subjects"
                  )}
                >
                  <SidebarItem 
                    href="/admin/academic-years" 
                    active={pathname === "/admin/academic-years"}
                    className={getSubItemClass(pathname === "/admin/academic-years")}
                  >
                    Gestiones
                  </SidebarItem>
                  <SidebarItem 
                    href="/admin/courses" 
                    active={pathname === "/admin/courses"}
                    className={getSubItemClass(pathname === "/admin/courses")}
                  >
                    Cursos
                  </SidebarItem>
                  <SidebarItem 
                    href="/admin/subjects" 
                    active={pathname === "/admin/subjects"}
                    className={getSubItemClass(pathname === "/admin/subjects")}
                  >
                    Materias
                  </SidebarItem>
                </SidebarCollapse>
              </>
            )}

            {/* Leave requests section - visible to both ADMIN and TUTOR */}
            {(userRole === 'ADMIN' || userRole === 'TUTOR') && (
              <SidebarCollapse
                icon={getIcon(pathname.startsWith("/leaves"), HiDocumentText)}
                label="Licencias"
                open={pathname.startsWith("/leaves")}
                className={getCollapseClass(pathname.startsWith("/leaves"))}
              >
                {userRole === 'TUTOR' && (
                  <>
                    <SidebarItem 
                      href="/leaves/mine" 
                      active={pathname === "/leaves/mine"}
                      className={getSubItemClass(pathname === "/leaves/mine")}
                    >
                      Mis licencias
                    </SidebarItem>
                    <SidebarItem 
                      href="/leaves/new" 
                      active={pathname === "/leaves/new"}
                      className={getSubItemClass(pathname === "/leaves/new")}
                    >
                      Registrar nueva
                    </SidebarItem>
                  </>
                )}
                {userRole === 'ADMIN' && (
                  <SidebarItem 
                    href="/leaves" 
                    active={pathname === "/leaves"}
                    className={getSubItemClass(pathname === "/leaves")}
                  >
                    Revisar
                  </SidebarItem>
                )}
              </SidebarCollapse>
            )}

            {/* Attendances section */}
            {userRole && (
              <SidebarCollapse
                icon={getIcon(pathname.startsWith("/attendances"), HiClipboardList)}
                label="Asistencias"
                open={pathname.startsWith("/attendances")}
                className={getCollapseClass(pathname.startsWith("/attendances"))}
              >
                {(userRole === 'ADMIN' || userRole === 'TEACHER') && (
                  <>
                    <SidebarItem 
                      href="/attendances/register" 
                      active={pathname === "/attendances/register"}
                      className={getSubItemClass(pathname === "/attendances/register")}
                    >
                      Registrar manualmente
                    </SidebarItem>
                    <SidebarItem 
                      href="/attendances/register-fingerprint" 
                      active={pathname === "/attendances/register-fingerprint"}
                      className={getSubItemClass(pathname === "/attendances/register-fingerprint")}
                    >
                      Registrar con huella
                    </SidebarItem>
                  </>
                )}
                <SidebarItem 
                  href="/attendances/history" 
                  active={pathname === "/attendances/history"}
                  className={getSubItemClass(pathname === "/attendances/history")}
                >
                  Historial
                </SidebarItem>
              </SidebarCollapse>
            )}

            {/* Notices / Avisos */}
            {userRole && (
              <SidebarCollapse
                icon={getIcon(pathname.startsWith("/notices"), HiBell)}
                label="Avisos"
                open={pathname.startsWith("/notices")}
                className={getCollapseClass(pathname.startsWith("/notices"))}
              >
                <SidebarItem 
                  href="/notices/notifications" 
                  active={pathname === "/notices/notifications"}
                  className={getSubItemClass(pathname === "/notices/notifications")}
                >
                  Comunicados
                </SidebarItem>
                {userRole !== 'ADMIN' && (
                  <SidebarItem 
                    href="/notices/tasks" 
                    active={pathname === "/notices/tasks"}
                    className={getSubItemClass(pathname === "/notices/tasks")}
                  >
                    Tareas
                  </SidebarItem>
                )}
                <SidebarItem 
                  href="/notices/meetings" 
                  active={pathname === "/notices/meetings"}
                  className={getSubItemClass(pathname === "/notices/meetings")}
                >
                  Citaciones
                </SidebarItem>
              </SidebarCollapse>
            )}
          </SidebarItemGroup>
        </SidebarItems>
      </div>

      {/* Footer del Sidebar con botón de Cerrar Sesión */}
      <div className="p-4 border-t border-gray-200 shrink-0">
        <Button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full bg-primary-900! text-white! hover:bg-primary-800! focus:ring-0 flex items-center justify-center gap-2 rounded-lg py-1 shadow-md transition-all duration-200"
        >
          <HiLogout className="w-5 h-5 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </Sidebar>
  );
}
