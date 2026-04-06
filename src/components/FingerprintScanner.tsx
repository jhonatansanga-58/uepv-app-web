"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Script from "next/script";
import { HiOutlineFingerPrint, HiCheckCircle, HiExclamationCircle } from "react-icons/hi";

declare global {
    interface Window {
        Fingerprint: any;
    }
}

type FingerprintScannerProps = {
    onCapture: (base64TemplateString: string) => void;
};

type ScannerState = "WAITING" | "INIT" | "READY" | "CAPTURING" | "SUCCESS" | "ERROR";

export default function FingerprintScanner({ onCapture }: FingerprintScannerProps) {
    const [status, setStatus] = useState<ScannerState>("WAITING");
    const [message, setMessage] = useState<string>("Cargando componentes de SDK...");
    const [captures, setCaptures] = useState<string[]>([]); // Arreglo para almacenar las 4 muestras
    const sdkRef = useRef<any>(null);

    const checkAndComplete = useCallback((currentCaptures: string[]) => {
        if (currentCaptures.length === 4) {
            setStatus("SUCCESS");
            setMessage("Registro biométrico completado (4/4).");
            
            // Enviamos el arreglo consolidado (stringificado para Prisma @db.Text)
            onCapture(JSON.stringify(currentCaptures));

            // Detenemos adquisición
            if (sdkRef.current) {
                try {
                   sdkRef.current.stopAcquisition();
                } catch(e) {}
            }
        } else {
            setStatus("READY");
            setMessage(`Toque el sensor (${currentCaptures.length}/4)...`);
            
            // IMPORTANTE: Algunos lectores requieren reiniciar el gatillo de adquisición
            // tras un escaneo exitoso. Si es U.are.U 4500 bajo WebApi, usualmente
            // se mantiene en bucle abierto emitiendo onSamplesAcquired sin parar,
            // pero le daremos un breve retraso visual al state.
        }
    }, [onCapture]);


    const initScanner = useCallback(async () => {
        if (!window.Fingerprint) {
            setStatus("ERROR");
            setMessage("Librería de Huellas no detectada.");
            return;
        }

        try {
            setStatus("INIT");
            setMessage("Buscando lectores conectados...");
            setCaptures([]); // Resetear capturas si iniciamos de nuevo

            const sdk = new window.Fingerprint.WebApi();
            sdkRef.current = sdk;

            sdk.onDeviceConnected = () => {
                setStatus("READY");
                setMessage("Lector conectado. Ponga el dedo (0/4)...");
            };

            sdk.onDeviceDisconnected = () => {
                setStatus("ERROR");
                setMessage("El lector fue desconectado.");
            };

            sdk.onCommunicationFailed = () => {
                setStatus("ERROR");
                setMessage("Comunicación fallida con el Lector.");
            };

            sdk.onSamplesAcquired = (s: any) => {
                try {
                    const samples = JSON.parse(s.samples);
                    const nativeBase64 = window.Fingerprint.b64UrlTo64(samples[0]);
                    
                    if (nativeBase64) {
                        setStatus("CAPTURING");
                        setMessage("Procesando huella...");
                        
                        setCaptures(prev => {
                            // Evitar capturar más de 4 si el lector sigue enviando tramas locamente
                            if (prev.length >= 4) return prev;
                            
                            const newCaptures = [...prev, nativeBase64];
                            
                            // Usamos setTimeout para salir del bucle reactivo y correr comprobación
                            setTimeout(() => checkAndComplete(newCaptures), 300);
                            
                            return newCaptures;
                        });

                    } else {
                        throw new Error("Muestra en blanco");
                    }
                } catch (error) {
                    console.error("Error al procesar trama:", error);
                }
            };

            const readers = await sdk.enumerateDevices();
            if (!readers || readers.length === 0) {
                setStatus("ERROR");
                setMessage("No hay lector conectado por USB.");
                return;
            }

            const deviceId = readers[0];

            // Iniciar adquisición asíncrona permanente en formato PNG transparente
            const SampleFormat = window.Fingerprint.SampleFormat;
            await sdk.startAcquisition(SampleFormat.PngImage, deviceId);

            setStatus("READY");
            setMessage("Sensor listo. Toque el sensor por primera vez (0/4).");

        } catch (error: any) {
            console.error("SDK Error Init:", error);
            setStatus("ERROR");
            setMessage("Falla local del SDK biométrico.");
        }
    }, [checkAndComplete]);

    // Apagamos lector al desmontar el componente
    useEffect(() => {
        return () => {
            if (sdkRef.current) {
                try {
                    sdkRef.current.stopAcquisition();
                } catch(e){}
            }
        };
    }, []);

    // Comprobación de montaje limpio: Si los scripts ya se cargaron en el caché (remount), iniciamos directo
    useEffect(() => {
        if (status === "WAITING" && typeof window !== "undefined" && window.Fingerprint) {
            initScanner();
        }
    }, [status, initScanner]);

    const getFeedbackStyles = () => {
        switch (status) {
            case "WAITING":
            case "INIT": return "bg-gray-100 text-gray-500 border-gray-300 animate-pulse";
            case "READY": return "bg-blue-50 text-blue-600 border-blue-400";
            case "CAPTURING": return "bg-yellow-50 text-yellow-600 border-yellow-400";
            case "SUCCESS": return "bg-green-50 text-green-600 border-green-500";
            case "ERROR": return "bg-red-50 text-red-600 border-red-500";
            default: return "";
        }
    };

    return (
        <div className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors duration-300 w-full ${getFeedbackStyles()}`}>
            
            {status === "WAITING" && (
                <>
                    <Script src="/fingerprint/es6-shim.js" strategy="beforeInteractive" />
                    <Script src="/fingerprint/websdk.client.bundle.min.js" strategy="lazyOnload" />
                    <Script 
                        src="/fingerprint/fingerprint.sdk.min.js" 
                        strategy="lazyOnload" 
                        onLoad={initScanner} 
                    />
                </>
            )}

            {/* Ícono Principal */}
            {status === "SUCCESS" ? (
                <HiCheckCircle className="w-16 h-16 mb-2" />
            ) : status === "ERROR" ? (
                <HiExclamationCircle className="w-16 h-16 mb-2" />
            ) : (
                <HiOutlineFingerPrint className={`w-16 h-16 mb-2 ${status === "CAPTURING" ? "animate-ping text-yellow-500" : ""}`} />
            )}

            <span className="text-sm font-semibold mb-1">
                {status === "ERROR" ? "Falla Biométrica" : "Enrolamiento de Huella"}
            </span>
            <p className="text-xs text-center max-w-[250px] font-medium min-h-[20px]">
                {message}
            </p>

            {/* Fila de Progreso Visual de 4 Tomas */}
            {(status === "READY" || status === "CAPTURING" || status === "SUCCESS") && (
                <div className="flex flex-row justify-center gap-2 mt-4">
                    {[0, 1, 2, 3].map((index) => (
                        <div 
                            key={index}
                            className={`w-12 h-16 border rounded bg-white flex items-center justify-center overflow-hidden transition-all duration-300 ${
                                captures[index] ? 'border-green-400 shadow-sm' : 'border-gray-300 bg-gray-50'
                            }`}
                        >
                            {captures[index] ? (
                                <img 
                                    src={`data:image/png;base64,${captures[index]}`} 
                                    alt={`Scan ${index + 1}`}
                                    className="w-full h-full object-contain mix-blend-multiply" 
                                />
                            ) : (
                                <span className="text-gray-300 text-xs">{index + 1}</span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {status === "ERROR" && (
                <button
                    type="button"
                    onClick={() => {
                        setStatus("WAITING");
                        setMessage("Reintentando motor de huellas...");
                        setTimeout(initScanner, 1000);
                    }}
                    className="mt-4 text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 font-semibold"
                >
                    Reiniciar Lector
                </button>
            )}
        </div>
    );
}
