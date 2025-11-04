"use client";

import { Modal, Button, Radio, Label } from "flowbite-react";
import { useState } from "react";

type ReportFormat = "pdf" | "excel";

interface Props {
  open: boolean;
  onClose: () => void;
  onGenerate: (format: ReportFormat) => void;
  loading?: boolean;
}

export default function ReportFormatModal({ open, onClose, onGenerate, loading }: Props) {
  const [format, setFormat] = useState<ReportFormat>("pdf");

  const handleGenerate = () => {
    onGenerate(format);
  };

  return (
    <Modal show={open} size="sm" onClose={onClose} popup>
      <div className="p-6">
        <h3 className="text-xl font-medium text-gray-900 mb-4">
          Formato del Reporte
        </h3>
        <div className="space-y-4">
          <div>
            <Label>Seleccione el formato:</Label>
            <div className="flex flex-col gap-3 mt-2">
              <div className="flex items-center gap-2">
                <Radio
                  id="pdf"
                  name="format"
                  value="pdf"
                  checked={format === "pdf"}
                  onChange={(e) => setFormat(e.target.value as ReportFormat)}
                />
                <Label htmlFor="pdf">PDF</Label>
              </div>
              <div className="flex items-center gap-2">
                <Radio
                  id="excel"
                  name="format"
                  value="excel"
                  checked={format === "excel"}
                  onChange={(e) => setFormat(e.target.value as ReportFormat)}
                />
                <Label htmlFor="excel">Excel</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button color="gray" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleGenerate} disabled={loading}>
              {loading ? "Generando..." : "Generar"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}