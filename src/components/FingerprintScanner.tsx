"use client";

import { useEffect } from "react";

type FingerprintScannerProps = {
    onCapture: (base64TemplateString: string) => void;
    mode?: "enroll" | "verify";
    resetSequence?: number;
};

export default function FingerprintScanner({ onCapture, mode = "enroll", resetSequence = 0 }: FingerprintScannerProps) {
    
    useEffect(() => {
        const handleIframeMessage = (event: MessageEvent) => {
            // Seguridad básica
            if (event.data && event.data.type === "FINGERPRINT_CAPTURED") {
                onCapture(event.data.payload);
            }
        };

        window.addEventListener("message", handleIframeMessage);
        return () => window.removeEventListener("message", handleIframeMessage);
    }, [onCapture]);

    return (
        <div className="w-full flex justify-center overflow-hidden bg-slate-50">
            {/* 
               Aislar la capa del API DigitalPersona WebSdk en un iframe crudo salva el Websocket 
               de los destructivos re-montajes y memory-leaks del Hot Reloading / Strict Mode de React 18.
               El 'key' obliga a React a aniquilar el Sandbox del Iframe cuando queremos limpiar las capturas. 
            */}
            <iframe 
                key={resetSequence}
                src={`/fingerprint-iframe.html?mode=${mode}`} 
                className="w-full h-[220px] border-none"
                title="Digital Persona Sandbox"
            />
        </div>
    );
}
