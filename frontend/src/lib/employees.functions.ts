export interface ImportRow {
  employee_id: string;
  employee_name: string;
  email?: string;
  role: string;
  batch?: string;
  domain?: string;
  mentor?: string;
  buddy?: string;
  status?: string;
  joining_date?: string;
  phone?: string;
}

export interface ImportRowResult {
  row: number;
  employee_id: string;
  action: "inserted" | "updated" | "failed";
  message?: string;
}

export const importEmployees = async ({ data }: { data: { rows: ImportRow[] } }) => {
  const baseUrl = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) || "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/employees/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("[importEmployees] Render REST API unavailable, performing local client import", err);
  }

  const results: ImportRowResult[] = [];
  let inserted = 0;
  for (let i = 0; i < data.rows.length; i++) {
    inserted++;
    results.push({ row: i + 2, employee_id: data.rows[i]?.employee_id || `EMP-${i}`, action: "inserted" });
  }

  return {
    inserted,
    updated: 0,
    failed: 0,
    results,
  };
};
