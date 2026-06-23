export type MaterialKind = "PDF" | "PPT" | "DOCX" | "MP4" | "Study Materials";

export const MATERIAL_CONFIG: Record<
  MaterialKind,
  { accept: string; extensions: string[]; lessonType: "pdf" | "ppt" | "docx" | "video" | "study" }
> = {
  PDF: { accept: ".pdf,application/pdf", extensions: [".pdf"], lessonType: "pdf" },
  PPT: { accept: ".ppt,.pptx", extensions: [".ppt", ".pptx"], lessonType: "ppt" },
  DOCX: { accept: ".doc,.docx", extensions: [".doc", ".docx"], lessonType: "docx" },
  MP4: { accept: ".mp4,video/mp4", extensions: [".mp4"], lessonType: "video" },
  "Study Materials": {
    accept: ".pdf,.doc,.docx,.ppt,.pptx,.zip,.mp4,.txt",
    extensions: [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".zip", ".mp4", ".txt"],
    lessonType: "study",
  },
};

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function fileMatchesMaterial(file: File, kind: MaterialKind) {
  const ext = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
  const cfg = MATERIAL_CONFIG[kind];
  if (cfg.extensions.includes(ext)) return true;
  if (kind === "MP4" && file.type.startsWith("video/")) return true;
  if (kind === "PDF" && file.type === "application/pdf") return true;
  return false;
}

export async function simulateUpload(onProgress: (value: number) => void) {
  for (let p = 0; p <= 100; p += 10) {
    await new Promise((r) => setTimeout(r, 90));
    onProgress(p);
  }
}

export function inferDuration(kind: MaterialKind, file: File) {
  if (kind === "MP4") return "Video file";
  if (kind === "PDF") return `${Math.max(1, Math.round(file.size / 50000))} pages`;
  return formatFileSize(file.size);
}
