"use client";

import { Modal, Button, Radio, Label, Datepicker } from "flowbite-react";
import { useState } from "react";

export type ReportFormat = "pdf" | "excel";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  loading?: boolean;
  onGenerate: (format: ReportFormat, fromDate: string, toDate: string) => void;
}

export default function ReportDateRangeModal({
  open,
  onClose,
  title,
  loading,
  onGenerate
}: Props) {
  const [format, setFormat] = useState<ReportFormat>("pdf");

  // Initialize dates with today's date
  const today = new Date();
  const adjustedTodayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    12, 0, 0
  );
  const todayStr = adjustedTodayDate.toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState<string>(todayStr);
  const [toDate, setToDate] = useState<string>(todayStr);

  const handleGenerate = () => {
    if (!fromDate || !toDate) return;
    onGenerate(format, fromDate, toDate);
  };
  const dateStringToDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
  };
  return (
    <Modal show={open} size="md" onClose={onClose}>
      <div className="p-6">
        <h3 className="text-xl font-medium text-gray-900 mb-4">
          {title}
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fromDate">Desde</Label>
              <Datepicker
                id="fromDate"
                maxDate={today}
                value={fromDate ? dateStringToDate(fromDate) : undefined}
                onChange={(date) => {
                  if (date) {
                    const d = new Date(date);
                    const adjustedDate = new Date(
                      d.getFullYear(),
                      d.getMonth(),
                      d.getDate(),
                      12, 0, 0
                    );

                    setFromDate(adjustedDate.toISOString().split("T")[0]);
                  } else {
                    setFromDate(todayStr);
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="toDate">Hasta</Label>
              <Datepicker
                id="toDate"
                minDate={today}
                value={toDate ? dateStringToDate(toDate) : undefined}
                onChange={(date) => {
                  if (date) {
                    const d = new Date(date);
                    const adjustedDate = new Date(
                      d.getFullYear(),
                      d.getMonth(),
                      d.getDate(),
                      12, 0, 0
                    );

                    setToDate(adjustedDate.toISOString().split("T")[0]);
                  } else {
                    setToDate(todayStr);
                  }
                }}
              />
            </div>
          </div>

          <div>
            <Label>Formato:</Label>
            <div className="flex gap-4 mt-2">
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
            <Button
              onClick={handleGenerate}
              disabled={loading || !fromDate || !toDate}
            >
              {loading ? "Generando..." : "Generar"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}