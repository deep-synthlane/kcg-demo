import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, type DragEvent } from "react";
import {
  Upload,
  FileText,
  Film,
  Package,
  Presentation,
  History,
  Eye,
  BookOpen,
  User,
  Calendar,
  HardDrive,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/RoleShell";
import { ContentPreview } from "@/components/ContentPreview";
import { CONTENT_ITEMS } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/teacher/content")({
  head: () => ({ meta: [{ title: "Content Management · KCG" }] }),
  component: ContentMgmt,
});

const COLUMNS = ["Draft", "Review", "Published"] as const;
type ContentType = "PDF" | "PPT" | "Video" | "SCORM";
type ContentItem = (typeof CONTENT_ITEMS)[number] & { localPreviewUrl?: string };

const VERSION_HISTORY = [
  { version: "v1.0", date: "10 Jun", author: "Dr. Priya", note: "Initial upload" },
  { version: "v2.0", date: "15 Jun", author: "Dr. Priya", note: "Updated diagrams" },
  { version: "v2.1", date: "18 Jun", author: "Dr. Priya", note: "Fixed typo in slide 12" },
];

const STATUS_META: Record<string, { label: string; hint: string; className: string }> = {
  Draft: {
    label: "Draft",
    hint: "Not yet submitted for review",
    className: "bg-muted text-muted-foreground border-0",
  },
  Review: {
    label: "Under Review",
    hint: "Awaiting administrator approval",
    className: "bg-warning/20 text-warning-foreground border-0",
  },
  Published: {
    label: "Published",
    hint: "Live and visible to students",
    className: "bg-success/15 text-success border-0",
  },
};

const TYPE_ACCEPT: Record<ContentType, { accept: string; extensions: string[] }> = {
  PDF: { accept: ".pdf,application/pdf", extensions: [".pdf"] },
  PPT: { accept: ".ppt,.pptx", extensions: [".ppt", ".pptx"] },
  Video: { accept: ".mp4,.webm,.mov,video/*", extensions: [".mp4", ".webm", ".mov"] },
  SCORM: { accept: ".zip,application/zip", extensions: [".zip"] },
};

function typeIcon(t: string) {
  if (t === "PDF") return FileText;
  if (t === "Video") return Film;
  if (t === "PPT") return Presentation;
  return Package;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatToday() {
  return new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function fileMatchesType(file: File, type: ContentType) {
  const ext = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
  if (TYPE_ACCEPT[type].extensions.includes(ext)) return true;
  if (type === "Video" && file.type.startsWith("video/")) return true;
  if (type === "PDF" && file.type === "application/pdf") return true;
  if (type === "SCORM" && file.type.includes("zip")) return true;
  return false;
}

function ContentMgmt() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [viewItem, setViewItem] = useState<ContentItem | null>(null);
  const [items, setItems] = useState<ContentItem[]>(CONTENT_ITEMS.map((c) => ({ ...c })));

  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadType, setUploadType] = useState<ContentType>("PDF");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  function resetUploadForm() {
    setUploadTitle("");
    setUploadType("PDF");
    setSelectedFile(null);
    setUploadProgress(0);
    setUploading(false);
    setDragOver(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFileSelect(file: File | null) {
    if (!file) return;
    if (!fileMatchesType(file, uploadType)) {
      toast.error(`Please select a valid ${uploadType} file`);
      return;
    }
    setSelectedFile(file);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }

  async function handleUpload(saveAsDraft = true) {
    if (!uploadTitle.trim()) {
      toast.error("Please enter a content title");
      return;
    }
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let p = 0; p <= 100; p += 10) {
        await new Promise((r) => setTimeout(r, 100));
        setUploadProgress(p);
      }

      const previewUrl =
        uploadType === "PDF" || uploadType === "Video"
          ? URL.createObjectURL(selectedFile)
          : undefined;

      const newItem: ContentItem = {
        id: `c${Date.now()}`,
        title: uploadTitle.trim(),
        type: uploadType,
        status: saveAsDraft ? "Draft" : "Review",
        updated: formatToday(),
        version: "v1.0",
        course: "CSE301 · Data Structures",
        author: "Dr. Priya Ramanathan",
        fileName: selectedFile.name,
        fileSize: formatFileSize(selectedFile.size),
        description: `Uploaded ${uploadType} content — ${selectedFile.name}`,
        previewUrl,
        localPreviewUrl: previewUrl,
      };

      setItems((prev) => [newItem, ...prev]);
      toast.success(
        saveAsDraft
          ? "Content uploaded and saved as draft"
          : "Content uploaded and sent for review",
      );
      setOpen(false);
      resetUploadForm();
    } catch {
      toast.error("Upload failed. Please try again.");
      setUploading(false);
      setUploadProgress(0);
    }
  }

  function moveItem(id: string, toStatus: string) {
    setItems((prev) => prev.map((c) => (c.id === id ? { ...c, status: toStatus } : c)));
    toast.success(toStatus === "Review" ? "Sent for admin review" : "Content published");
  }

  function getPreviewItem(item: ContentItem) {
    return {
      ...item,
      previewUrl: item.localPreviewUrl ?? item.previewUrl,
    };
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Management"
        subtitle="Upload, preview, and track publishing status for course materials"
        actions={
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (!v) resetUploadForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" /> Upload content
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Upload course content</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="content-title">Title</Label>
                  <Input
                    id="content-title"
                    placeholder="e.g. DS · Unit 4 Lecture Slides"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    disabled={uploading}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["PDF", "PPT", "Video", "SCORM"] as ContentType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        disabled={uploading}
                        onClick={() => {
                          setUploadType(t);
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className={cn(
                          "rounded-md border px-2 py-3 text-xs font-medium transition",
                          uploadType === t
                            ? "border-primary bg-primary/10 text-primary"
                            : "bg-background hover:border-primary/50",
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div
                  role="button"
                  tabIndex={0}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                  className={cn(
                    "rounded-lg border-2 border-dashed p-8 text-center text-sm transition cursor-pointer",
                    dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/30",
                    uploading && "pointer-events-none opacity-60",
                  )}
                >
                  <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  {selectedFile ? (
                    <>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatFileSize(selectedFile.size)} · Click to replace
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">Drag & drop or click to upload</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Accepts {TYPE_ACCEPT[uploadType].extensions.join(", ")} files
                      </p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept={TYPE_ACCEPT[uploadType].accept}
                    disabled={uploading}
                    onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                  />
                </div>
                {uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Uploading…</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Button className="w-full" disabled={uploading} onClick={() => handleUpload(true)}>
                    {uploading ? "Uploading…" : "Upload & Save as Draft"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={uploading}
                    onClick={() => handleUpload(false)}
                  >
                    Upload & Send for Review
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {COLUMNS.map((col) => {
          const colItems = items.filter((c) => c.status === col);
          return (
            <div key={col} className="rounded-xl border bg-muted/30 p-3">
              <div className="flex items-center justify-between px-2 pb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      col === "Draft" && "bg-muted-foreground",
                      col === "Review" && "bg-warning",
                      col === "Published" && "bg-success",
                    )}
                  />
                  <h3 className="font-semibold text-sm">{col}</h3>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {colItems.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {colItems.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6 px-2">
                    No content in this stage
                  </p>
                )}
                {colItems.map((c) => {
                  const Icon = typeIcon(c.type);
                  const status = STATUS_META[c.status] ?? STATUS_META.Draft;
                  return (
                    <div key={c.id} className="rounded-lg bg-card border p-3 shadow-sm">
                      <div className="flex items-start gap-2">
                        <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary shrink-0">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium leading-tight">{c.title}</span>
                            <Badge variant="outline" className="text-[9px] font-mono shrink-0">
                              {c.version}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {c.type} · Updated {c.updated}
                          </div>
                          <Badge className={cn("mt-2 text-[10px]", status.className)}>
                            {status.label}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7"
                          onClick={() => setViewItem(c)}
                        >
                          <Eye className="h-3 w-3 mr-1" /> View
                        </Button>
                        {col === "Draft" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7"
                            onClick={() => moveItem(c.id, "Review")}
                          >
                            Send for Review
                          </Button>
                        )}
                        {col === "Review" && (
                          <Badge variant="outline" className="text-[10px] h-7 px-2">
                            <Clock className="h-3 w-3 mr-1" /> Pending admin
                          </Badge>
                        )}
                        {col === "Published" && (
                          <Badge className="bg-success/15 text-success border-0 text-[10px] h-7">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Live
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-7 ml-auto"
                          onClick={() => setHistoryOpen(true)}
                        >
                          <History className="h-3 w-3 mr-1" /> History
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!viewItem} onOpenChange={(v) => !v && setViewItem(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {viewItem && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 pr-6">
                  {(() => {
                    const Icon = typeIcon(viewItem.type);
                    return <Icon className="h-5 w-5 text-primary shrink-0" />;
                  })()}
                  {viewItem.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
                  <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">Publishing Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={STATUS_META[viewItem.status]?.className}>
                        {STATUS_META[viewItem.status]?.label ?? viewItem.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {STATUS_META[viewItem.status]?.hint}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailRow icon={BookOpen} label="Course" value={viewItem.course} />
                  <DetailRow icon={User} label="Author" value={viewItem.author} />
                  <DetailRow icon={HardDrive} label="File" value={`${viewItem.fileName} · ${viewItem.fileSize}`} />
                  <DetailRow icon={Calendar} label="Last updated" value={`${viewItem.updated} · ${viewItem.version}`} />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                    Description
                  </p>
                  <p className="text-sm">{viewItem.description}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold">File Preview</p>
                    <Badge variant="outline">{viewItem.type}</Badge>
                  </div>
                  <ContentPreview item={getPreviewItem(viewItem)} />
                </div>

                <div className="flex flex-wrap gap-2 border-t pt-4">
                  {viewItem.status === "Draft" && (
                    <Button onClick={() => { moveItem(viewItem.id, "Review"); setViewItem(null); }}>
                      Send for Review
                    </Button>
                  )}
                  <Button variant="ghost" className="ml-auto" onClick={() => setViewItem(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Change Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {VERSION_HISTORY.map((v) => (
                <TableRow key={v.version}>
                  <TableCell className="font-mono text-xs">{v.version}</TableCell>
                  <TableCell className="text-muted-foreground">{v.date}</TableCell>
                  <TableCell>{v.author}</TableCell>
                  <TableCell>{v.note}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
