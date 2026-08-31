import { useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Download, Loader2, Upload } from "lucide-react";
import { Panel } from "@/components/ui-bits";
import { workspaceQueryKey } from "@/lib/data";
import { importEmployees, type ImportRow, type ImportRowResult } from "@/lib/employees.functions";

const TEMPLATE_HEADERS = [
  "employee_id",
  "employee_name",
  "email",
  "role",
  "batch",
  "domain",
  "mentor",
  "buddy",
  "status",
  "joining_date",
  "phone",
];

const SAMPLE = [
  {
    employee_id: "EMP1001",
    employee_name: "Asha Ramesh",
    email: "asha.ramesh@company.com",
    role: "mentor",
    batch: "",
    domain: "",
    mentor: "",
    buddy: "",
    status: "active",
    joining_date: "2026-01-12",
    phone: "",
  },
  {
    employee_id: "EMP2001",
    employee_name: "Vikram Nair",
    email: "",
    role: "trainee",
    batch: "Batch A",
    domain: "Data Engineering",
    mentor: "EMP1001",
    buddy: "",
    status: "active",
    joining_date: "2026-02-03",
    phone: "",
  },
];

const norm = (v: unknown) => String(v ?? "").trim();

export function DataImport() {
  const run = importEmployees;
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<ImportRowResult[] | null>(null);
  const [summary, setSummary] = useState<{ inserted: number; updated: number; failed: number } | null>(null);

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(SAMPLE, { header: TEMPLATE_HEADERS });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
    XLSX.writeFile(wb, "bootmind-employee-import-template.xlsx");
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setResults(null);
    setSummary(null);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheetName = wb.SheetNames[0];
      if (!sheetName) throw new Error("This file has no sheets.");
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[sheetName]!, { defval: "" });
      if (raw.length === 0) throw new Error("No rows found in this file.");

      const rows: ImportRow[] = raw.map((r) => {
        const lower: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(r)) lower[k.trim().toLowerCase().replace(/\s+/g, "_")] = v;
        return {
          employee_id: norm(lower["employee_id"] ?? lower["employeeid"] ?? lower["id"]),
          employee_name: norm(lower["employee_name"] ?? lower["name"] ?? lower["full_name"]),
          email: norm(lower["email"]),
          role: norm(lower["role"]),
          batch: norm(lower["batch"]),
          domain: norm(lower["domain"]),
          mentor: norm(lower["mentor"]),
          buddy: norm(lower["buddy"]),
          status: norm(lower["status"]),
          joining_date: norm(lower["joining_date"] ?? lower["joining"]),
          phone: norm(lower["phone"]),
        };
      });

      const res = await run({ data: { rows } });
      setResults(res.results.filter((r) => r.action === "failed"));
      setSummary({ inserted: res.inserted, updated: res.updated, failed: res.failed });
      await qc.invalidateQueries({ queryKey: workspaceQueryKey });
      if (res.failed === 0) toast.success(`Imported ${res.inserted} new and updated ${res.updated} records`);
      else toast.warning(`${res.failed} row(s) could not be imported`);
    } catch (e) {
      console.error("[DataImport] failed", e);
      toast.error(e instanceof Error ? e.message : "Could not read this file.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel
      title="Import real bootcamp data"
      description="Upload a CSV or Excel file of employees. Trainees are linked to their batch, domain, mentor and buddy automatically."
    >
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={downloadTemplate}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-input px-3 text-sm font-medium hover:bg-muted"
        >
          <Download className="size-4" /> Download template
        </button>
        <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {busy ? "Importing…" : "Upload CSV / Excel"}
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              void onFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Columns: {TEMPLATE_HEADERS.join(", ")}. Mentor and buddy can be given as an employee ID, email or full name.
        Existing employee IDs are updated rather than duplicated.
      </p>

      {summary && (
        <div className="mt-4 rounded-lg border border-border p-3 text-sm">
          <p>
            <strong>{summary.inserted}</strong> added · <strong>{summary.updated}</strong> updated ·{" "}
            <strong className={summary.failed ? "text-destructive" : ""}>{summary.failed}</strong> failed
          </p>
          {results && results.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-destructive">
              {results.slice(0, 25).map((r) => (
                <li key={`${r.row}-${r.employee_id}`}>
                  Row {r.row} ({r.employee_id || "no ID"}): {r.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Panel>
  );
}
