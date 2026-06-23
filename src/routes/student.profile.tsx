import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Mail,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Award,
  User,
  CheckCircle2,
  Clock,
  Eye,
  Download,
  FileText,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PageHeader, StatCard } from "@/components/RoleShell";
import {
  STUDENT_PROFILE,
  TRANSCRIPT,
  TRANSCRIPT_COURSES,
  GRADE_DISTRIBUTION,
  ENROLLMENT_HISTORY,
} from "@/lib/mockData";
import { downloadTranscript } from "@/lib/pdfTranscript";
import { toast } from "sonner";

export const Route = createFileRoute("/student/profile")({
  head: () => ({ meta: [{ title: "Profile · KCG" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const p = STUDENT_PROFILE;
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  function openTranscript(semester: string | null = null) {
    setSelectedSemester(semester);
    setTranscriptOpen(true);
  }

  function handleDownloadTranscript(semester?: string) {
    setDownloading(true);
    try {
      downloadTranscript(p, TRANSCRIPT, TRANSCRIPT_COURSES);
      toast.success(
        semester ? `Transcript downloaded (${semester})` : "Transcript downloaded",
      );
    } catch {
      toast.error("Could not generate transcript PDF");
    } finally {
      setDownloading(false);
    }
  }

  const filteredCourses = selectedSemester
    ? TRANSCRIPT_COURSES.filter((c) => c.sem === selectedSemester)
    : TRANSCRIPT_COURSES;

  const filteredSemesters = selectedSemester
    ? TRANSCRIPT.filter((t) => t.sem === selectedSemester)
    : TRANSCRIPT;

  return (
    <div className="space-y-6">
      <PageHeader title="Student Profile" subtitle="Personal details, academic history & transcript" />

      {/* Identity card */}
      <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start">
        <Avatar className="h-24 w-24">
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-display">
            AI
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-2xl font-semibold">{p.name}</h2>
            <Badge className="bg-gold/30 text-foreground border-0">Honours Stream</Badge>
          </div>
          <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <Mail className="h-3.5 w-3.5" /> {p.email}
          </div>
          <dl className="mt-5 grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <Info label="Enrolment Number" value={p.enrollment} />
            <Info label="Department" value={p.department} />
            <Info label="Semester" value={p.semester} />
            <Info label="Batch" value={p.batch} />
            <Info label="Mentor" value={p.mentor} />
            <Info label="Status" value="Active · Good Standing" />
          </dl>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="CGPA" value={p.cgpa} icon={Award} tone="gold" hint="Top 15% of batch" />
        <StatCard label="Attendance" value={`${p.attendance}%`} icon={TrendingUp} tone="success" />
        <StatCard label="Credits" value={`${p.credits}/${p.totalCredits}`} icon={BookOpen} />
        <StatCard label="Current Sem" value="6" icon={GraduationCap} hint="of 8" />
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="p-5 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-primary" /> Academic Transcript
          </h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>CGPA</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-medium">Official Academic Transcript</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.batch} · {p.department}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">PDF · Online</Badge>
              </TableCell>
              <TableCell>{p.credits}/{p.totalCredits}</TableCell>
              <TableCell className="font-semibold">{p.cgpa}</TableCell>
              <TableCell>
                <Badge className="bg-success/15 text-success border-0">Available</Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => openTranscript()}>
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadTranscript()}
                    disabled={downloading}
                  >
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    {downloading ? "Generating…" : "Download"}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="p-5 border-b">
            <h3 className="font-semibold text-sm">Semester-wise Performance</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Semester</TableHead>
                <TableHead>GPA</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TRANSCRIPT.map((t) => (
                <TableRow key={t.sem}>
                  <TableCell className="font-medium">{t.sem}</TableCell>
                  <TableCell className="font-semibold">{t.gpa}</TableCell>
                  <TableCell>{t.credits}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        t.status === "Completed"
                          ? "bg-success/15 text-success border-0"
                          : "bg-primary/10 text-primary border-0"
                      }
                    >
                      {t.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => openTranscript(t.sem)}>
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadTranscript(t.sem)}
                        disabled={downloading}
                      >
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        Download
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="font-semibold mb-4">Grade Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={GRADE_DISTRIBUTION}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="grade" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="var(--color-gold)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Enrollment History */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-primary" /> Enrollment History
        </h3>
        <div className="relative ml-4">
          <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-border" />
          <div className="space-y-4">
            {ENROLLMENT_HISTORY.map((e) => (
              <div key={e.semester} className="relative flex items-start gap-4 pl-8">
                <div className="absolute left-0 top-1">
                  {e.status === "Completed" ? (
                    <div className="grid h-6 w-6 place-items-center rounded-full bg-success text-white">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                  ) : (
                    <div className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
                      <BookOpen className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{e.semester}</span>
                    <Badge
                      className={
                        e.status === "Completed"
                          ? "bg-success/15 text-success border-0 text-[10px]"
                          : "bg-primary/10 text-primary border-0 text-[10px]"
                      }
                    >
                      {e.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {e.year} · {e.courses} courses · {e.credits} credits
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog
        open={transcriptOpen}
        onOpenChange={(open) => {
          setTranscriptOpen(open);
          if (!open) setSelectedSemester(null);
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedSemester ? `Academic Transcript · ${selectedSemester}` : "Academic Transcript"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="rounded-lg border bg-muted/30 p-4 grid gap-2 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Student</p>
                <p className="font-semibold">{p.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Enrolment No.</p>
                <p className="font-semibold font-mono">{p.enrollment}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Programme</p>
                <p className="font-medium">{p.department}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">CGPA</p>
                <p className="font-semibold text-primary">{p.cgpa}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3">Semester Summary</h4>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Semester</TableHead>
                      <TableHead>GPA</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSemesters.map((t) => (
                      <TableRow key={t.sem}>
                        <TableCell className="font-medium">{t.sem}</TableCell>
                        <TableCell>{t.gpa}</TableCell>
                        <TableCell>{t.credits}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              t.status === "Completed"
                                ? "bg-success/15 text-success border-0"
                                : "bg-primary/10 text-primary border-0"
                            }
                          >
                            {t.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3">Course-wise Grades</h4>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Semester</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCourses.map((c) => (
                      <TableRow key={`${c.sem}-${c.code}`}>
                        <TableCell className="text-muted-foreground">{c.sem}</TableCell>
                        <TableCell className="font-mono text-xs">{c.code}</TableCell>
                        <TableCell className="font-medium">{c.title}</TableCell>
                        <TableCell>{c.credits}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              c.grade === "—"
                                ? "bg-muted text-muted-foreground border-0"
                                : c.grade === "O" || c.grade.startsWith("A")
                                  ? "bg-success/15 text-success border-0"
                                  : "bg-primary/10 text-primary border-0"
                            }
                          >
                            {c.grade}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t pt-4">
              <Button onClick={() => handleDownloadTranscript(selectedSemester ?? undefined)} disabled={downloading}>
                <Download className="h-4 w-4 mr-2" />
                {downloading ? "Generating PDF…" : "Download Transcript (PDF)"}
              </Button>
              <Button variant="outline" className="ml-auto" onClick={() => setTranscriptOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground mt-0.5">{value}</dd>
    </div>
  );
}
