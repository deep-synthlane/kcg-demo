import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  FileText,
  Film,
  Presentation,
  Package,
  Eye,
  User,
  BookOpen,
  Calendar,
  HardDrive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/RoleShell";
import { ContentPreview } from "@/components/ContentPreview";
import { CONTENT_ITEMS } from "@/lib/mockData";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/content-review")({
  head: () => ({ meta: [{ title: "Content Review · Admin · KCG" }] }),
  component: ContentReview,
});

type ContentItem = (typeof CONTENT_ITEMS)[number];

function typeIcon(t: string) {
  if (t === "PDF") return FileText;
  if (t === "Video") return Film;
  if (t === "PPT") return Presentation;
  return Package;
}

function ContentReview() {
  const [items, setItems] = useState(CONTENT_ITEMS.map((c) => ({ ...c })));
  const [viewItem, setViewItem] = useState<ContentItem | null>(null);
  const reviewItems = items.filter((c) => c.status === "Review");

  function handleApprove(id: string) {
    setItems((prev) => prev.map((c) => (c.id === id ? { ...c, status: "Published" } : c)));
    setViewItem(null);
    toast.success("Approved — content is now published");
  }

  function handleRequestChanges(id: string) {
    setItems((prev) => prev.map((c) => (c.id === id ? { ...c, status: "Draft" } : c)));
    setViewItem(null);
    toast.success("Feedback sent to faculty — moved back to Draft");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Management"
        subtitle="View, preview, and review faculty-submitted content before publishing"
      />

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Content</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviewItems.map((c) => {
              const Icon = typeIcon(c.type);
              return (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{c.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{c.type}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{c.version}</TableCell>
                  <TableCell className="text-muted-foreground">{c.updated}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setViewItem(c)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-success border-success/40"
                        onClick={() => handleApprove(c.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-warning-foreground border-warning/40"
                        onClick={() => handleRequestChanges(c.id)}
                      >
                        Request Changes
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {reviewItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No content pending review. All items have been processed.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
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
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailRow icon={BookOpen} label="Course" value={viewItem.course} />
                  <DetailRow icon={User} label="Submitted by" value={viewItem.author} />
                  <DetailRow icon={HardDrive} label="File" value={`${viewItem.fileName} · ${viewItem.fileSize}`} />
                  <DetailRow icon={Calendar} label="Last updated" value={`${viewItem.updated} · ${viewItem.version}`} />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                    Description
                  </p>
                  <p className="text-sm text-foreground">{viewItem.description}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold">File Preview</p>
                    <Badge variant="outline">{viewItem.type}</Badge>
                  </div>
                  <ContentPreview item={viewItem} />
                </div>

                <div className="flex flex-wrap gap-2 border-t pt-4">
                  <Button
                    className="text-success bg-success/10 hover:bg-success/15 border border-success/30"
                    onClick={() => handleApprove(viewItem.id)}
                  >
                    Approve & Publish
                  </Button>
                  <Button
                    variant="outline"
                    className="text-warning-foreground border-warning/40"
                    onClick={() => handleRequestChanges(viewItem.id)}
                  >
                    Request Changes
                  </Button>
                  <Button variant="ghost" className="ml-auto" onClick={() => setViewItem(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
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
