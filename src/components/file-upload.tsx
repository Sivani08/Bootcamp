import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Download, File as FileIcon, Loader2, Trash2, Upload, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  ACCEPT_ATTR,
  ACCEPT_HINT,
  MAX_FILE_MB,
  deleteResource,
  formatBytes,
  listResources,
  resourceUrl,
  uploadResource,
  validateFile,
  type ResourceLinks,
  type ResourceRow,
} from "@/lib/files";

interface Queued {
  id: string;
  file: File;
  progress: number;
  state: "pending" | "uploading" | "done" | "error";
  message?: string;
}

/**
 * Reusable resource uploader + file list. Uses the private `resources` bucket and
 * the `resources` metadata table, so every read/write stays under RLS.
 */
export function FileUpload({
  links,
  title = "Files",
  description,
  canUpload = true,
}: {
  links: ResourceLinks;
  title?: string;
  description?: string;
  canUpload?: boolean;
}) {
  const { member, role } = useAuth();
  const [rows, setRows] = useState<ResourceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<Queued[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const linkKey = JSON.stringify(links);

  const refresh = useCallback(async () => {
    try {
      setRows(await listResources(JSON.parse(linkKey) as ResourceLinks));
    } catch (e) {
      console.error("[FileUpload] list failed", e);
    } finally {
      setLoading(false);
    }
  }, [linkKey]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || !member) return;
    for (const file of Array.from(files)) {
      const problem = validateFile(file);
      const id = crypto.randomUUID();
      if (problem) {
        setQueue((q) => [...q, { id, file, progress: 0, state: "error", message: problem }]);
        toast.error(problem);
        continue;
      }
      setQueue((q) => [...q, { id, file, progress: 15, state: "uploading" }]);
      const tick = setInterval(
        () => setQueue((q) => q.map((i) => (i.id === id && i.progress < 85 ? { ...i, progress: i.progress + 10 } : i))),
        220,
      );
      try {
        await uploadResource({ file, memberId: member.id, role: role ?? "trainee", links });
        clearInterval(tick);
        setQueue((q) => q.map((i) => (i.id === id ? { ...i, progress: 100, state: "done" } : i)));
        toast.success(`${file.name} uploaded`);
        await refresh();
        setTimeout(() => setQueue((q) => q.filter((i) => i.id !== id)), 2500);
      } catch (e) {
        clearInterval(tick);
        const msg = e instanceof Error ? e.message : "Unable to upload file. Please try again.";
        setQueue((q) => q.map((i) => (i.id === id ? { ...i, state: "error", message: msg } : i)));
        toast.error(msg);
      }
    }
  };

  const open = async (row: ResourceRow) => {
    try {
      window.open(await resourceUrl(row.storage_path), "_blank", "noopener");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to open this file right now.");
    }
  };

  const remove = async (row: ResourceRow) => {
    try {
      await deleteResource(row);
      toast.success("File removed");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to remove this file.");
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>

      {canUpload && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void handleFiles(e.dataTransfer.files);
          }}
          className={`rounded-xl border border-dashed p-5 text-center transition-colors ${dragging ? "border-primary bg-accent" : "border-border"}`}
        >
          <Upload className="mx-auto size-5 text-muted-foreground" aria-hidden />
          <p className="mt-2 text-sm font-medium">Drag and drop files here</p>
          <p className="mt-1 text-xs text-muted-foreground">{ACCEPT_HINT}</p>
          <p className="text-xs text-muted-foreground">Maximum {MAX_FILE_MB} MB per file. Executable files are blocked.</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-3 inline-flex h-9 items-center justify-center rounded-lg border border-input px-3 text-sm font-medium hover:bg-muted"
          >
            Browse files
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPT_ATTR}
            className="sr-only"
            onChange={(e) => {
              void handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {queue.length > 0 && (
        <ul className="space-y-2">
          {queue.map((q) => (
            <li key={q.id} className="rounded-lg border border-border p-2.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate">{q.file.name}</span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  {formatBytes(q.file.size)}
                  {q.state === "uploading" && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
                  <button type="button" onClick={() => setQueue((s) => s.filter((i) => i.id !== q.id))} aria-label="Dismiss">
                    <X className="size-3.5" />
                  </button>
                </span>
              </div>
              {q.state === "error" ? (
                <p className="mt-1 text-xs text-destructive">{q.message}</p>
              ) : (
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-[width] ${q.state === "done" ? "bg-success" : "bg-primary"}`}
                    style={{ width: `${q.progress}%` }}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading files…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No files yet.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
              <span className="flex min-w-0 items-center gap-3">
                <FileIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{r.file_name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {r.file_type.toUpperCase()} · {formatBytes(r.file_size)} ·{" "}
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </span>
              </span>
              <span className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void open(r)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-input px-2.5 text-xs font-medium hover:bg-muted"
                >
                  <Download className="size-3.5" /> Open
                </button>
                {(role === "admin" || r.uploaded_by === member?.id) && (
                  <button
                    type="button"
                    onClick={() => void remove(r)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-input px-2.5 text-xs font-medium text-destructive hover:bg-muted"
                  >
                    <Trash2 className="size-3.5" /> Delete
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
