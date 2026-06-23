"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "flowbite-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FingerprintScanner from "@/components/FingerprintScanner";

type MatchResult = {
  firstName: string;
  lastName: string;
  courseName: string;
  parallelName: string;
} | null;

export default function RegisterFingerprintAttendance() {
  const [scannerResetKey, setScannerResetKey] = useState(0);
  const [matchResult, setMatchResult] = useState<MatchResult>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLocal, setIsLocal] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const local = hostname === "localhost" || hostname === "127.0.0.1" || hostname.includes("192.168.");
      setIsLocal(local);
    }
  }, []);

  const handleCapture = async (probeBase64: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ probeBase64 }),
      });

      const data = await res.json();

      if (res.ok) {
        // Attendance successfully recorded
        setMatchResult({
          firstName: data.firstName,
          lastName: data.lastName,
          courseName: data.courseName,
          parallelName: data.parallelName,
        });

        // Clear the success screen after 2.5 seconds and re-enable scanner
        setTimeout(() => {
          setMatchResult(null);
          setScannerResetKey(prev => prev + 1);
          setIsProcessing(false);
        }, 2500);

      } else {
        toast.error(data.error || "Huella no reconocida o error del servidor.");

        // Error on match, reset quickly to try again
        setTimeout(() => {
          setScannerResetKey(prev => prev + 1);
          setIsProcessing(false);
        }, 1500);
      }
    } catch (error) {
      toast.error("Falla de conexión con el servidor.");
      setTimeout(() => {
        setScannerResetKey(prev => prev + 1);
        setIsProcessing(false);
      }, 1500);
    }
  };

  if (!isLocal) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[70vh] p-4">
        <Card className="w-full max-w-lg shadow-xl border-yellow-400 bg-yellow-50/50 p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-3xl font-bold mb-2">
              ⚠
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Modo de Nube (Vercel)</h2>
            <p className="text-gray-600 leading-relaxed">
              El registro biométrico de asistencia requiere interactuar directamente con los puertos USB y el hardware local de esta PC.
            </p>
            <div className="bg-white border rounded-lg p-4 text-left text-sm text-gray-500 w-full mt-4 space-y-2">
              <p className="font-semibold text-gray-700">Para probar esta funcionalidad en la defensa:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Ejecute el sistema de forma local: <code className="bg-gray-100 px-1 py-0.5 rounded text-red-600 font-mono">npm run dev</code>.</li>
                <li>Conecte el lector de huellas USB.</li>
                <li>Asegúrese de tener encendido el servicio biométrico local (Python AFIS).</li>
              </ol>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="bottom-center" autoClose={3000} hideProgressBar />

      <div className="flex flex-col items-center justify-center w-full min-h-[70vh]">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Toma de Asistencia Biométrica</h1>

        {matchResult ? (
          <Card className="w-full max-w-lg shadow-xl border-green-400 bg-green-50 text-center py-10 transition-all duration-300 transform scale-105">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-20 h-20 bg-green-400 text-white rounded-full flex items-center justify-center text-4xl mb-4 shadow-lg">
                ✓
              </div>
              <h2 className="text-4xl font-extrabold text-green-700">
                {matchResult.firstName} {matchResult.lastName}
              </h2>
              <p className="text-xl font-medium text-green-600">
                {matchResult.courseName} "{matchResult.parallelName}"
              </p>
              <p className="text-md text-gray-500 mt-6">Asistencia registrada exitosamente</p>
            </div>
          </Card>
        ) : (
          <Card className="w-full max-w-md shadow-lg opacity-100 transition-opacity duration-300">
            <div className={isProcessing ? "opacity-50 pointer-events-none" : "opacity-100"}>
              <FingerprintScanner
                resetSequence={scannerResetKey}
                mode="verify"
                onCapture={handleCapture}
              />
            </div>
            {isProcessing && (
              <p className="text-center text-blue-600 mt-4 animate-pulse font-semibold">Analizando huella en la BD...</p>
            )}
          </Card>
        )}
      </div>
    </>
  );
}
