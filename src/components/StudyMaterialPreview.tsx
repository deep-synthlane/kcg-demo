import { FileText, Film, Presentation, Package, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CONTENT_PREVIEW_DEFAULTS } from "@/lib/mockData";
import type { Lesson } from "@/lib/courseStore";

export function StudyMaterialPreview({ lesson }: { lesson: Lesson }) {
  const src = lesson.fileUrl ?? (lesson.type === "pdf" ? CONTENT_PREVIEW_DEFAULTS.PDF : lesson.type === "video" ? CONTENT_PREVIEW_DEFAULTS.Video : undefined);

  if (lesson.type === "video" && src) {
    return (
      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b bg-muted/40 px-3 py-2">
          <Film className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium truncate">{lesson.fileName ?? lesson.title}</span>
          <Badge variant="secondary" className="ml-auto text-[10px]">MP4 Preview</Badge>
        </div>
        <video controls playsInline preload="metadata" className="aspect-video w-full bg-black" src={src} />
      </div>
    );
  }

  if (lesson.type === "pdf" && src) {
    return (
      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b bg-muted/40 px-3 py-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium truncate">{lesson.fileName ?? lesson.title}</span>
          <Badge variant="secondary" className="ml-auto text-[10px]">PDF Preview</Badge>
        </div>
        <object data={`${src}#toolbar=1`} type="application/pdf" className="h-[min(480px,60vh)] w-full bg-white">
          <iframe title="PDF preview" src={src} className="h-[min(480px,60vh)] w-full bg-white" />
        </object>
      </div>
    );
  }

  if (lesson.type === "ppt") {
    return (
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="bg-primary px-4 py-2 text-primary-foreground text-sm font-medium flex items-center gap-2">
          <Presentation className="h-4 w-4" />
          Slide preview · {lesson.fileName ?? lesson.title}
        </div>
        <div className="aspect-video bg-muted/40 p-6 flex flex-col justify-center gap-3">
          <div className="h-3 w-2/3 rounded bg-primary/20" />
          <div className="h-2 w-full rounded bg-muted-foreground/15" />
          <div className="h-2 w-5/6 rounded bg-muted-foreground/15" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/30 p-10 text-center">
      {lesson.type === "docx" ? (
        <FileText className="h-12 w-12 text-primary mb-3" />
      ) : (
        <Package className="h-12 w-12 text-primary mb-3" />
      )}
      <p className="font-medium">{lesson.fileName ?? lesson.title}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {lesson.fileSize ?? lesson.duration} · Preview not available in browser
      </p>
      {lesson.fileUrl && (
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <a href={lesson.fileUrl} download={lesson.fileName ?? lesson.title}>
            <Download className="h-3.5 w-3.5 mr-1.5" /> Download to view
          </a>
        </Button>
      )}
    </div>
  );
}
