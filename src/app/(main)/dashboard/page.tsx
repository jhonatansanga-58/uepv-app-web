"use client";

import { useSession } from "next-auth/react";
import { HiCalendar, HiSparkles } from "react-icons/hi";

export default function DashBoardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-200"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  const userName = session?.user?.name || "Usuario";
  const userRole = session?.user?.role || "STUDENT";

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrador del Sistema";
      case "TEACHER":
        return "Docente / Personal Escolar";
      case "TUTOR":
        return "Tutor / Padre de Familia";
      case "STUDENT":
        return "Estudiante";
      default:
        return "Usuario del Sistema";
    }
  };

  const getRoleMessage = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Desde este panel administrativo tienes el control de las gestiones escolares, asignación de cursos, registro de personal, estudiantes y monitoreo general de asistencia.";
      case "TEACHER":
        return "Bienvenido a tu espacio docente. Desde aquí puedes registrar la asistencia diaria (manual o mediante huella biométrica), programar citaciones con tutores y gestionar avisos.";
      case "TUTOR":
        return "Te damos la bienvenida al portal del tutor. Desde aquí puedes dar seguimiento a la asistencia de tus estudiantes asignados, gestionar solicitudes de licencias y leer comunicados.";
      default:
        return "Bienvenido al portal escolar de la Unidad Educativa Plenitud de Vida.";
    }
  };

  // Formatear fecha actual
  const today = new Date();
  const formattedDate = today.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <div className="w-full py-6 px-4">
      {/* Banner de Bienvenida Héroe */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-900 rounded-3xl p-8 md:p-12 shadow-xl border border-primary-500/20 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        
        {/* Burbujas de Gradiente Flotantes de Decoración */}
        <div className="absolute top-[-20%] right-[-10%] w-80 h-80 bg-primary-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-[-30%] left-[10%] w-60 h-60 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-15 pointer-events-none"></div>

        {/* Sección de Mensaje */}
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30 backdrop-blur-md mb-4 uppercase tracking-wider">
            <HiSparkles className="w-3.5 h-3.5 text-yellow-300" />
            {getRoleLabel(userRole)}
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">
            ¡Hola de nuevo, <span className="text-yellow-300">{userName}</span>!
          </h1>
          <p className="text-white/80 max-w-xl text-sm md:text-base leading-relaxed">
            {getRoleMessage(userRole)}
          </p>
        </div>

        {/* Sección de Fecha / Sistema */}
        <div className="relative z-10 flex flex-col items-start md:items-end gap-2 shrink-0 border-t border-white/20 md:border-t-0 md:border-l md:border-white/20 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
          <div className="flex items-center gap-2 text-white/90">
            <HiCalendar className="w-5 h-5 text-yellow-300" />
            <span className="text-sm font-semibold">{capitalizedDate}</span>
          </div>
          <div className="text-xs text-white/60 text-left md:text-right">
            Unidad Educativa Plenitud de Vida
          </div>
        </div>
        
      </div>
    </div>
  );
}
