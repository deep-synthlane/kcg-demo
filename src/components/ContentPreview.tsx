import { FileText, Film, Presentation, Package, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CONTENT_PREVIEW_DEFAULTS } from "@/lib/mockData";

export type ContentPreviewItem = {
  title: string;
  type: string;
  fileName: string;
  fileSize: string;
  previewUrl?: string;
};

export function ContentPreview({ item }: { item: ContentPreviewItem }) {
  if (item.type === "Video") {
    const src = item.previewUrl ?? CONTENT_PREVIEW_DEFAULTS.Video;
    return (
      <div className="space-y-2">
        <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b bg-muted/40 px-3 py-2">
            <Film className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-medium truncate">{item.fileName}</span>
            <Badge variant="secondary" className="ml-auto text-[10px]">
              Video Preview
            </Badge>
          </div>
          <video controls playsInline preload="metadata" className="aspect-video w-full bg-black" src={src}>
            Your browser does not support embedded video preview.
          </video>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{item.fileSize} · Use controls to play and scrub</span>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-foreground transition"
          >
            Open video <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    );
  }

  if (item.type === "PPT") {
    return (
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="bg-primary px-4 py-2 text-primary-foreground text-sm font-medium">
          Slide 1 of 24 · {item.title}
        </div>
        <div className="aspect-video bg-muted/40 p-6 flex flex-col justify-center gap-3">
          <div className="h-3 w-2/3 rounded bg-primary/20" />
          <div className="h-2 w-full rounded bg-muted-foreground/15" />
          <div className="h-2 w-5/6 rounded bg-muted-foreground/15" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="h-16 rounded-md bg-primary/10" />
            <div className="h-16 rounded-md bg-primary/10" />
          </div>
        </div>
      </div>
    );
  }

  if (item.type === "SCORM") {
    return (
      <div className="flex aspect-video flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/30 p-8 text-center">
        <Package className="h-12 w-12 text-primary mb-3" />
        <p className="font-medium">{item.fileName}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Interactive SCORM module · Launch preview in packaged player
        </p>
        <Button variant="outline" size="sm" className="mt-4">
          Launch SCORM Preview
        </Button>
      </div>
    );
  }

  const src = item.previewUrl ?? CONTENT_PREVIEW_DEFAULTS.PDF;

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b bg-muted/40 px-3 py-2">
          <FileText className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-medium truncate">{item.fileName}</span>
          <Badge variant="secondary" className="ml-auto text-[10px]">
            PDF Preview
          </Badge>
        </div>
        <object
          data={`${src}#toolbar=1&navpanes=0`}
          type="application/pdf"
          className="h-[min(520px,65vh)] w-full bg-white"
        >
          <iframe title={`PDF preview · ${item.fileName}`} src={src} className="h-[min(520px,65vh)] w-full bg-white" />
        </object>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{item.fileSize} · Scroll inside the viewer to read all pages</span>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-foreground transition"
        >
          Open PDF <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
