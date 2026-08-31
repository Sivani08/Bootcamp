import { supabase } from "@/integrations/supabase/client";

/** Configurable upload ceiling (MB). */
export const MAX_FILE_MB = Number(import.meta.env["VITE_MAX_UPLOAD_MB"] ?? 100);
export const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

export const ALLOWED_EXTENSIONS = [
  // documents
  "pdf", "doc", "docx", "txt", "rtf", "odt", "md",
  // spreadsheets
  "xls", "xlsx", "csv", "ods",
  // presentations
  "ppt", "pptx", "odp",
  // images
  "png", "jpg", "jpeg", "gif", "webp", "svg", "bmp",
  // data / code
  "json", "xml", "yaml", "yml", "sql", "py", "java", "js", "ts", "tsx", "jsx",
  "html", "css", "scss", "c", "cpp", "cs", "go", "rb", "php", "r", "ipynb",
  // archives / media
  "zip", "mp4", "mp3", "wav",
];

export const BLOCKED_EXTENSIONS = [
  "exe", "bat", "cmd", "scr", "msi", "com", "ps1", "vbs", "sh", "bash",
  "dll", "so", "dmg", "app", "apk", "jar", "bin", "pkg", "deb", "rpm", "reg", "iso",
];

export const ACCEPT_ATTR = ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(",");
export const ACCEPT_HINT =
  "Supported: documents, spreadsheets, presentations, images, code and common learning files.";

export const extensionOf = (name: string) => name.split(".").pop()?.toLowerCase() ?? "";

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function validateFile(file: File): string | null {
  const ext = extensionOf(file.name);
  if (!ext) return "File type is not supported.";
  if (BLOCKED_EXTENSIONS.includes(ext)) return `Executable files (.${ext}) are not allowed.`;
  if (!ALLOWED_EXTENSIONS.includes(ext)) return `File type .${ext} is not supported.`;
  if (file.size > MAX_FILE_BYTES) return `File size exceeds the ${MAX_FILE_MB} MB limit.`;
  if (file.size === 0) return "This file is empty.";
  return null;
}

export interface ResourceRow {
  id: string;
  file_name: string;
  file_type: string;
  mime_type: string;
  file_size: number;
  storage_path: string;
  uploaded_by: string;
  uploaded_by_role: string;
  created_at: string;
  course_id: string | null;
  task_id: string | null;
  module_id: string | null;
  trainee_id: string | null;
  batch_id: string | null;
  domain_id: string | null;
}

export interface ResourceLinks {
  course_id?: string | null;
  task_id?: string | null;
  module_id?: string | null;
  trainee_id?: string | null;
  batch_id?: string | null;
  domain_id?: string | null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const db = supabase as any;

export async function listResources(links: ResourceLinks): Promise<ResourceRow[]> {
  let q = db.from("resources").select("*").order("created_at", { ascending: false }).limit(200);
  for (const [k, v] of Object.entries(links)) if (v) q = q.eq(k, v);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as ResourceRow[];
}

export async function uploadResource(opts: {
  file: File;
  memberId: string;
  role: string;
  links: ResourceLinks;
}): Promise<ResourceRow> {
  const problem = validateFile(opts.file);
  if (problem) throw new Error(problem);

  const ext = extensionOf(opts.file.name);
  const path = `${opts.memberId}/${crypto.randomUUID()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("resources")
    .upload(path, opts.file, { cacheControl: "3600", upsert: false, contentType: opts.file.type || "application/octet-stream" });
  if (upErr) {
    console.error("[uploadResource] storage error", upErr);
    throw new Error("Unable to upload file. Please try again.");
  }

  const { data, error } = await db
    .from("resources")
    .insert({
      file_name: opts.file.name,
      file_type: ext,
      mime_type: opts.file.type || "application/octet-stream",
      file_size: opts.file.size,
      storage_path: path,
      uploaded_by: opts.memberId,
      uploaded_by_role: opts.role,
      ...opts.links,
    })
    .select("*")
    .single();

  if (error) {
    await supabase.storage.from("resources").remove([path]);
    console.error("[uploadResource] metadata error", error);
    throw new Error("Unable to save the file details. Please try again.");
  }
  return data as ResourceRow;
}

export async function resourceUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from("resources").createSignedUrl(path, 300);
  if (error || !data) throw new Error("Unable to open this file right now.");
  return data.signedUrl;
}

export async function deleteResource(row: ResourceRow) {
  const { error } = await db.from("resources").delete().eq("id", row.id);
  if (error) throw new Error("You do not have permission to delete this file.");
  await supabase.storage.from("resources").remove([row.storage_path]);
}
