import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  ChevronLeft,
  Plus,
  Trash2,
  PlayCircle,
  FileText,
  HelpCircle,
  CheckCircle2,
  Lock,
  GripVertical,
  Pencil,
  Upload,
  Eye,
  Download,
  Presentation,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCourses, type UnitStatus, type Lesson } from "@/lib/courseStore";
import { UploadMaterialDialog } from "@/components/UploadMaterialDialog";
import { StudyMaterialPreview } from "@/components/StudyMaterialPreview";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/teacher/courses/$courseId")({
  head: () => ({ meta: [{ title: "Manage Course · Faculty · KCG" }] }),
  component: TeacherCourseDetail,
});

function TeacherCourseDetail() {
  const { courseId } = useParams({ from: "/teacher/courses/$courseId" });
  const { courses, addUnit, editUnit, deleteUnit, addLesson, deleteLesson, addQuiz } = useCourses();
  const course = courses.find((c) => c.id === courseId);

  const [newUnitTitle, setNewUnitTitle] = useState("");
  const [editingUnit, setEditingUnit] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Upload dialog
  const [showUpload, setShowUpload] = useState(false);
  const [uploadUnitId, setUploadUnitId] = useState<string | undefined>();
  const [viewLesson, setViewLesson] = useState<Lesson | null>(null);

  // Lesson dialog
  const [showLesson, setShowLesson] = useState<string | null>(null);
  const [lessonType, setLessonType] = useState<"video" | "pdf">("video");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDuration, setLessonDuration] = useState("");

  // Quiz dialog
  const [showQuiz, setShowQuiz] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDuration, setQuizDuration] = useState("15 min");
  const qKeyRef = useRef(0);
  const [quizQuestions, setQuizQuestions] = useState<
    { _key: number; question: string; options: string[]; correctAnswer: number }[]
  >([{ _key: 0, question: "", options: ["", "", "", ""], correctAnswer: 0 }]);

  function openQuizForUnit(unitId: string) {
    setShowQuiz(unitId);
    setQuizTitle("");
    setQuizDuration("15 min");
    qKeyRef.current = 1;
    setQuizQuestions([{ _key: 0, question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
  }

  if (!course) {
    return (
      <div className="space-y-4">
        <Link to="/teacher/courses" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to courses
        </Link>
        <p className="text-muted-foreground">Course not found.</p>
      </div>
    );
  }

  function handleAddUnit() {
    if (!newUnitTitle.trim()) return;
    addUnit(courseId, newUnitTitle.trim());
    toast.success(`Unit "${newUnitTitle}" added`);
    setNewUnitTitle("");
  }

  function handleRenameUnit(unitId: string) {
    if (!editTitle.trim()) return;
    editUnit(courseId, unitId, { title: editTitle.trim() });
    setEditingUnit(null);
    toast.success("Unit renamed");
  }

  function handleStatusChange(unitId: string, status: UnitStatus) {
    editUnit(courseId, unitId, { status });
    toast.success(`Unit status changed to ${status}`);
  }

  function handleAddLesson() {
    if (!showLesson || !lessonTitle || !lessonDuration) {
      toast.error("All fields are required");
      return;
    }
    addLesson(courseId, showLesson, { title: lessonTitle, type: lessonType, duration: lessonDuration });
    toast.success(`Lesson "${lessonTitle}" added`);
    setShowLesson(null);
    setLessonTitle("");
    setLessonDuration("");
  }

  function handleAddQuiz() {
    if (!showQuiz || !quizTitle) {
      toast.error("Title is required");
      return;
    }
    const validQs = quizQuestions
      .filter((q) => q.question && q.options.every((o) => o))
      .map(({ _key: _, ...rest }) => rest);
    if (validQs.length === 0) {
      toast.error("Add at least one complete question");
      return;
    }
    addQuiz(courseId, showQuiz, quizTitle, quizDuration, validQs);
    toast.success(`Quiz "${quizTitle}" added`);
    setShowQuiz(null);
  }

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === "completed") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (status === "locked") return <Lock className="h-4 w-4 text-muted-foreground" />;
    return <PlayCircle className="h-4 w-4 text-primary" />;
  };

  function handleMaterialUpload(unitId: string, lesson: Omit<Lesson, "id" | "done">) {
    addLesson(courseId, unitId, lesson);
  }

  function handleDownload(lesson: Lesson) {
    if (!lesson.fileUrl) {
      toast.error("No file available for download");
      return;
    }
    const a = document.createElement("a");
    a.href = lesson.fileUrl;
    a.download = lesson.fileName ?? lesson.title;
    a.click();
    toast.success("Download started");
  }

  const LessonIcon = ({ type }: { type: string }) => {
    if (type === "video") return <PlayCircle className="h-4 w-4 text-blue-500" />;
    if (type === "pdf") return <FileText className="h-4 w-4 text-orange-500" />;
    if (type === "ppt") return <Presentation className="h-4 w-4 text-rose-500" />;
    if (type === "docx") return <FileText className="h-4 w-4 text-sky-500" />;
    if (type === "study") return <Package className="h-4 w-4 text-amber-600" />;
    return <HelpCircle className="h-4 w-4 text-violet-500" />;
  };

  return (
    <div className="space-y-6">
      <Link
        to="/teacher/courses"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4 mr-1" /> All courses
      </Link>

      {/* Course header */}
      <div className={`rounded-2xl bg-gradient-to-br ${course.color} p-6 text-white relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider opacity-80">{course.code}</div>
            <h1 className="font-display text-2xl md:text-3xl font-semibold mt-1">{course.title}</h1>
            <p className="mt-1 opacity-90 text-sm">{course.faculty} · {course.department}</p>
            <div className="flex gap-3 mt-3">
              <Badge className="bg-white/20 border-0 text-white">{course.credits} credits</Badge>
              <Badge className="bg-white/20 border-0 text-white">{course.units.length} units</Badge>
              <Badge className="bg-white/20 border-0 text-white">{course.students} students</Badge>
            </div>
          </div>
          <Button
            variant="secondary"
            className="shrink-0 bg-white/95 text-foreground hover:bg-white"
            onClick={() => {
              setUploadUnitId(course.units[0]?.id);
              setShowUpload(true);
            }}
            disabled={course.units.length === 0}
          >
            <Upload className="h-4 w-4 mr-2" /> Upload Material
          </Button>
        </div>
      </div>

      {/* Units list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Units</h2>
        </div>

        {course.units.length === 0 && (
          <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            <p className="text-sm">No units yet. Add your first unit below.</p>
          </div>
        )}

        <Accordion type="multiple" defaultValue={course.units.map((u) => u.id)} className="space-y-3">
          {course.units.map((unit) => (
            <AccordionItem key={unit.id} value={unit.id} className="rounded-xl border bg-card overflow-hidden">
              <AccordionTrigger className="px-5 py-4 hover:no-underline">
                <div className="flex items-center gap-3 flex-1 text-left">
                  <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                  <StatusIcon status={unit.status} />
                  {editingUnit === unit.id ? (
                    <form
                      className="flex items-center gap-2 flex-1"
                      onSubmit={(e) => { e.preventDefault(); handleRenameUnit(unit.id); }}
                    >
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="h-7 text-sm"
                        autoFocus
                        onBlur={() => handleRenameUnit(unit.id)}
                      />
                    </form>
                  ) : (
                    <span className="font-medium text-sm flex-1">{unit.title}</span>
                  )}
                  <Badge variant="outline" className="text-[10px] capitalize ml-auto mr-2">
                    {unit.status.replace("-", " ")}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-4">
                <div className="space-y-2">
                  {unit.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 rounded-md border px-3 py-2.5"
                    >
                      <LessonIcon type={lesson.type} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{lesson.title}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {lesson.type}
                          {lesson.fileName ? ` · ${lesson.fileName}` : ""}
                          {!lesson.fileName && ` · ${lesson.duration}`}
                        </div>
                      </div>
                      {lesson.type !== "quiz" && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs px-2"
                            onClick={() => setViewLesson(lesson)}
                          >
                            <Eye className="h-3 w-3 mr-1" /> View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs px-2"
                            onClick={() => handleDownload(lesson)}
                            disabled={!lesson.fileUrl}
                          >
                            <Download className="h-3 w-3 mr-1" /> Download
                          </Button>
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        onClick={() => {
                          deleteLesson(courseId, unit.id, lesson.id);
                          toast("Lesson deleted");
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}

                  {unit.lessons.length === 0 && (
                    <p className="text-xs text-muted-foreground italic py-2">No lessons in this unit yet.</p>
                  )}
                </div>

                {/* Unit actions */}
                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setUploadUnitId(unit.id);
                      setShowUpload(true);
                    }}
                  >
                    <Upload className="h-3.5 w-3.5 mr-1" /> Upload
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowLesson(unit.id)}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Lesson
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openQuizForUnit(unit.id)}>
                    <HelpCircle className="h-3.5 w-3.5 mr-1" /> Add Quiz
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setEditingUnit(unit.id); setEditTitle(unit.title); }}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Rename
                  </Button>
                  <Select
                    value={unit.status}
                    onValueChange={(v) => handleStatusChange(unit.id, v as UnitStatus)}
                  >
                    <SelectTrigger className="h-8 w-auto text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="locked">Locked</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive ml-auto"
                    onClick={() => {
                      deleteUnit(courseId, unit.id);
                      toast("Unit deleted");
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Unit
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Add unit inline */}
        <div className="flex gap-2">
          <Input
            placeholder="New unit title (e.g. Unit 4 · Graphs)"
            value={newUnitTitle}
            onChange={(e) => setNewUnitTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddUnit()}
          />
          <Button onClick={handleAddUnit} disabled={!newUnitTitle.trim()}>
            <Plus className="h-4 w-4 mr-1" /> Add Unit
          </Button>
        </div>
      </div>

      <UploadMaterialDialog
        open={showUpload}
        onOpenChange={setShowUpload}
        units={course.units.map((u) => ({ id: u.id, title: u.title }))}
        defaultUnitId={uploadUnitId}
        onComplete={handleMaterialUpload}
      />

      <Dialog open={!!viewLesson} onOpenChange={(v) => !v && setViewLesson(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {viewLesson && (
            <>
              <DialogHeader>
                <DialogTitle>{viewLesson.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-2 sm:grid-cols-3 text-sm">
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">{viewLesson.type}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">File</p>
                    <p className="font-medium truncate">{viewLesson.fileName ?? "—"}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Size</p>
                    <p className="font-medium">{viewLesson.fileSize ?? viewLesson.duration}</p>
                  </div>
                </div>
                <StudyMaterialPreview lesson={viewLesson} />
                <div className="flex gap-2 border-t pt-4">
                  <Button variant="outline" onClick={() => handleDownload(viewLesson)} disabled={!viewLesson.fileUrl}>
                    <Download className="h-4 w-4 mr-2" /> Download
                  </Button>
                  <Button variant="ghost" className="ml-auto" onClick={() => setViewLesson(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Lesson Dialog */}
      <Dialog open={!!showLesson} onOpenChange={(v) => !v && setShowLesson(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Lesson</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label>Lesson Type</Label>
              <div className="flex gap-2">
                <Button variant={lessonType === "video" ? "default" : "outline"} size="sm" onClick={() => setLessonType("video")}>
                  <PlayCircle className="h-3.5 w-3.5 mr-1.5" /> Video
                </Button>
                <Button variant={lessonType === "pdf" ? "default" : "outline"} size="sm" onClick={() => setLessonType("pdf")}>
                  <FileText className="h-3.5 w-3.5 mr-1.5" /> PDF / Notes
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input placeholder="e.g. BFS & DFS Walkthrough" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>{lessonType === "video" ? "Duration" : "Pages"} *</Label>
              <Input placeholder={lessonType === "video" ? "e.g. 22 min" : "e.g. 10 pages"} value={lessonDuration} onChange={(e) => setLessonDuration(e.target.value)} />
            </div>
            <Button onClick={handleAddLesson}>Add Lesson</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Quiz Dialog */}
      <Dialog open={!!showQuiz} onOpenChange={(v) => !v && setShowQuiz(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Quiz</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Quiz Title *</Label>
                <Input value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} placeholder="e.g. Quiz: Graph Traversals" />
              </div>
              <div className="space-y-1.5">
                <Label>Duration</Label>
                <Input value={quizDuration} onChange={(e) => setQuizDuration(e.target.value)} placeholder="e.g. 20 min" />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Questions</Label>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={quizQuestions.length >= 10}
                  onClick={() => {
                    const key = qKeyRef.current++;
                    setQuizQuestions((prev) => [...prev, { _key: key, question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Question
                </Button>
              </div>
              {quizQuestions.map((q, qi) => (
                <div key={q._key} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {qi + 1}
                    </span>
                    <Input
                      placeholder="Question text"
                      value={q.question}
                      onChange={(e) => {
                        const updated = [...quizQuestions];
                        updated[qi] = { ...updated[qi], question: e.target.value };
                        setQuizQuestions(updated);
                      }}
                    />
                    {quizQuestions.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-destructive"
                        onClick={() => setQuizQuestions((qs) => qs.filter((_, i) => i !== qi))}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 ml-8">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...quizQuestions];
                            updated[qi] = { ...updated[qi], correctAnswer: oi };
                            setQuizQuestions(updated);
                          }}
                          className={cn(
                            "grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-medium border transition",
                            q.correctAnswer === oi
                              ? "bg-green-500 text-white border-green-500"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {String.fromCharCode(65 + oi)}
                        </button>
                        <Input
                          placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                          value={opt}
                          onChange={(e) => {
                            const updated = [...quizQuestions];
                            const newOpts = [...updated[qi].options];
                            newOpts[oi] = e.target.value;
                            updated[qi] = { ...updated[qi], options: newOpts };
                            setQuizQuestions(updated);
                          }}
                          className="h-8 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={handleAddQuiz}>Create Quiz</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
