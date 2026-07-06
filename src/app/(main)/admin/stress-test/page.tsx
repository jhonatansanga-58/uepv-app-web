"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button, Spinner, Card, Badge } from "flowbite-react";
import { HiLightningBolt, HiCheckCircle, HiXCircle } from "react-icons/hi";

type StudentType = {
  id: number;
  label: string;
};

type LogType = {
  id: number;
  name: string;
  duration: number | null;
  status: string | null;
  success: boolean | null;
  loading: boolean;
};

export default function StressTestPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [students, setStudents] = useState<StudentType[]>([]);
  const [numStudents, setNumStudents] = useState(20);
  const [sendNotifications, setSendNotifications] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<LogType[]>([]);

  // Redirection / Auth Check
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      window.location.href = "/unauthorized";
    }
  }, [sessionStatus]);

  // Load students
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingStudents(true);
        const res = await fetch("/api/students/allminimal");
        if (!res.ok) throw new Error("Failed to load students");
        const data = await res.json();
        // Extract raw name from label (format: Name - Course - Parallel)
        const mapped = (data || []).map((s: any) => {
          const name = s.label.split(" - ")[0];
          return { id: s.id, label: name };
        });
        setStudents(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStudents(false);
      }
    };
    load();
  }, []);

  if (sessionStatus === "loading" || loadingStudents) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spinner size="xl" color="purple" />
          <p className="mt-3 text-sm text-gray-500 font-medium">Iniciando simulador de concurrencia...</p>
        </div>
      </div>
    );
  }

  if (session?.user?.role !== "ADMIN") {
    return null; // Next.js layout will trigger redirection or render nothing
  }

  const handleStartTest = async () => {
    if (students.length === 0 || running) return;

    setRunning(true);
    
    // Select the subset of students
    const subset = students.slice(0, Math.min(numStudents, students.length));

    // Initialize logs
    const initialLogs = subset.map((s) => ({
      id: s.id,
      name: s.label,
      duration: null,
      status: null,
      success: null,
      loading: true,
    }));
    setLogs(initialLogs);

    // Launch concurrent requests
    const promises = subset.map(async (student, index) => {
      const startTime = performance.now();
      try {
        const res = await fetch("/api/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: student.id,
            skipNotification: !sendNotifications,
          }),
        });

        const duration = Math.round(performance.now() - startTime);

        if (res.status === 201) {
          setLogs((curr) =>
            curr.map((l) =>
              l.id === student.id
                ? { ...l, duration, status: "201 Created", success: true, loading: false }
                : l
            )
          );
        } else {
          const errData = await res.json().catch(() => ({}));
          setLogs((curr) =>
            curr.map((l) =>
              l.id === student.id
                ? {
                    ...l,
                    duration,
                    status: `${res.status} ${errData.error || "Error"}`,
                    success: false,
                    loading: false,
                  }
                : l
            )
          );
        }
      } catch (err) {
        const duration = Math.round(performance.now() - startTime);
        setLogs((curr) =>
          curr.map((l) =>
            l.id === student.id
              ? { ...l, duration, status: "Network Failure", success: false, loading: false }
              : l
          )
        );
      }
    });

    await Promise.all(promises);
    setRunning(false);
  };

  // Stats calculation
  const completedLogs = logs.filter((l) => !l.loading);
  const successCount = completedLogs.filter((l) => l.success).length;
  const errorCount = completedLogs.filter((l) => l.success === false).length;
  const totalCompleted = completedLogs.length;

  const validDurations = completedLogs.map((l) => l.duration).filter((d): d is number => d !== null);
  const avgLatency =
    validDurations.length > 0 ? Math.round(validDurations.reduce((a, b) => a + b, 0) / validDurations.length) : 0;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header Héroe */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-900 to-indigo-900 p-8 text-white shadow-lg">
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-primary-700/20 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <Badge color="purple" className="text-xs uppercase tracking-wider font-bold">Simulación de Concurrencia</Badge>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Prueba de Estrés Arquitectónica</h1>
            <p className="text-sm md:text-base text-primary-100 max-w-2xl">
              Simula múltiples dispositivos biométricos registrando asistencia al mismo tiempo. Pone a prueba el pool de conexiones y el procesamiento de la base de datos local bajo concurrencia extrema.
            </p>
          </div>
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-white/10 backdrop-blur-md text-yellow-300">
            <HiLightningBolt size={36} className="animate-pulse" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Configuración */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-3 mb-4">Configurar Escenario</h3>
            
            <div className="space-y-5">
              {/* Selector de alumnos */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Cantidad de Dispositivos (Alumnos):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max={Math.min(20, students.length || 20)}
                    value={numStudents}
                    onChange={(e) => setNumStudents(Number(e.target.value))}
                    disabled={running}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:shadow-md"
                  />
                  <span className="text-base font-bold text-primary-900 border px-3 py-1 rounded-md bg-gray-50 min-w-[3rem] text-center">
                    {numStudents}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Estudiantes activos listos en base de datos: <span className="font-bold">{students.length}</span>
                </p>
              </div>

              {/* Checkbox de notificaciones */}
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <input
                  id="notifications-toggle"
                  type="checkbox"
                  checked={sendNotifications}
                  onChange={(e) => setSendNotifications(e.target.checked)}
                  disabled={running}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                />
                <label htmlFor="notifications-toggle" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  Enviar Notificaciones Firebase
                  <span className="block text-xs font-normal text-gray-400">
                    Añade un delay de red externa de FCM
                  </span>
                </label>
              </div>

              {/* Botón de Ejecución */}
              <Button
                color="purple"
                className="w-full font-bold shadow-md h-12"
                onClick={handleStartTest}
                disabled={running || students.length === 0}
              >
                {running ? (
                  <div className="flex items-center gap-2 justify-center">
                    <Spinner size="sm" />
                    <span>Enviando Ráfaga...</span>
                  </div>
                ) : (
                  <span>Iniciar Prueba de Concurrencia</span>
                )}
              </Button>
            </div>
          </Card>

          {/* Tarjeta de Resumen Rápido */}
          {logs.length > 0 && (
            <Card className="rounded-2xl shadow-sm border border-gray-100 bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Telemetría de la Prueba</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-xl shadow-xs border border-gray-100">
                  <span className="text-xs text-gray-400 block">Exitosos</span>
                  <span className="text-xl font-bold text-emerald-600">{successCount}</span>
                  <span className="text-xs text-gray-400 block">/ {logs.length}</span>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-xs border border-gray-100">
                  <span className="text-xs text-gray-400 block">Errores</span>
                  <span className="text-xl font-bold text-red-500">{errorCount}</span>
                  <span className="text-xs text-gray-400 block">/ {logs.length}</span>
                </div>
                <div className="col-span-2 bg-white p-3 rounded-xl shadow-xs border border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 block">Latencia Promedio</span>
                    <span className="text-xl font-bold text-indigo-700">{avgLatency} ms</span>
                  </div>
                  <Badge color="indigo">Muy Rápido</Badge>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Columna Derecha: Logs en Tiempo Real */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                Consola del Servidor (Marcaciones Concurrentes)
              </h3>
              {logs.length > 0 && (
                <Badge color={running ? "yellow" : "success"}>
                  {running ? "Simulando carga..." : "Prueba completada"}
                </Badge>
              )}
            </div>

            {/* Consola Terminal */}
            <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-slate-300 flex-1 min-h-[350px] max-h-[480px] overflow-y-auto space-y-2 border border-slate-800 shadow-inner">
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 italic py-20">
                  Esperando inicio de prueba... Presione el botón para disparar las peticiones.
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between border-b border-slate-800/50 pb-1.5 last:border-0"
                  >
                    <div className="flex items-center gap-2 overflow-hidden truncate mr-4">
                      <span className="text-slate-500">[{idx + 1}]</span>
                      {log.loading ? (
                        <span className="h-2 w-2 rounded-full bg-yellow-400 animate-ping shrink-0" />
                      ) : log.success ? (
                        <HiCheckCircle className="text-emerald-400 w-4 h-4 shrink-0" />
                      ) : (
                        <HiXCircle className="text-red-400 w-4 h-4 shrink-0" />
                      )}
                      <span className="truncate text-slate-200">{log.name}</span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {log.duration !== null && (
                        <span className="text-slate-500 text-[10px]">{log.duration}ms</span>
                      )}
                      {log.loading ? (
                        <span className="text-yellow-400">Procesando...</span>
                      ) : log.success ? (
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">
                          OK
                        </span>
                      ) : (
                        <span className="text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded text-[10px] truncate max-w-[8rem]">
                          {log.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
