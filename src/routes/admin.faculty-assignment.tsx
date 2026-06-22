import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Users, Plus, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { PageHeader, StatCard } from "@/components/RoleShell";
import { FACULTY_DIRECTORY, FACULTY_ASSIGNMENTS } from "@/lib/mockData";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/faculty-assignment")({
  head: () => ({ meta: [{ title: "Faculty Assignment · KCG" }] }),
  component: FacultyAssignment,
});

const AVAILABLE_COURSES = [
  "CSE301 · Data Structures",
  "CSE305 · DBMS",
  "CSE402 · AI",
  "CSE304 · OS",
  "CSE501 · Computer Networks",
  "ECE201 · VLSI Design",
  "ECE102 · Signals",
  "MBA301 · Finance",
];

const SEMESTERS = ["1", "2", "3", "4", "5", "6", "7", "8"];
const SECTIONS = ["A", "B", "C"];

function FacultyAssignment() {
  const [assignments, setAssignments] = useState(FACULTY_ASSIGNMENTS.map((a) => ({ ...a })));
  const [assignDialog, setAssignDialog] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [hours, setHours] = useState("4");

  const totalAssigned = FACULTY_DIRECTORY.reduce((s, f) => s + f.load, 0);
  const totalCapacity = FACULTY_DIRECTORY.reduce((s, f) => s + f.maxLoad, 0);

  function handleAssign() {
    if (!selectedFaculty || !selectedCourse || !selectedSemester || !selectedSection) {
      toast.error("Please fill all fields");
      return;
    }
    const newAssignment = {
      id: `fa${Date.now()}`,
      faculty: selectedFaculty,
      course: selectedCourse,
      semester: parseInt(selectedSemester),
      section: selectedSection,
      hours: parseInt(hours),
    };
    setAssignments((prev) => [newAssignment, ...prev]);
    toast.success(`${selectedFaculty} assigned to ${selectedCourse}`);
    setAssignDialog(false);
    setSelectedFaculty("");
    setSelectedCourse("");
    setSelectedSemester("");
    setSelectedSection("");
    setHours("4");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Assignment"
        subtitle="Assign faculty to courses, subjects, and sections"
        actions={
          <Button onClick={() => setAssignDialog(true)}>
            <Plus className="h-4 w-4 mr-2" /> Assign Faculty
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Faculty" value={FACULTY_DIRECTORY.length} icon={GraduationCap} tone="primary" />
        <StatCard label="Active Assignments" value={assignments.length} icon={Users} tone="success" />
        <StatCard
          label="Load Utilization"
          value={`${Math.round((totalAssigned / totalCapacity) * 100)}%`}
          icon={Users}
          tone="gold"
          hint={`${totalAssigned}/${totalCapacity} hrs`}
        />
      </div>

      {/* Faculty directory */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="p-5 border-b">
          <h3 className="font-semibold">Faculty Directory</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Faculty</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Load</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {FACULTY_DIRECTORY.map((f) => {
              const pct = Math.round((f.load / f.maxLoad) * 100);
              return (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell>{f.dept}</TableCell>
                  <TableCell className="text-muted-foreground">{f.specialization}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct > 85 ? "bg-destructive" : "bg-primary"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{f.load}/{f.maxLoad}h</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        pct > 85
                          ? "bg-destructive/10 text-destructive border-0"
                          : pct > 60
                            ? "bg-warning/20 text-warning-foreground border-0"
                            : "bg-success/15 text-success border-0"
                      }
                    >
                      {pct > 85 ? "Near Max" : pct > 60 ? "Moderate" : "Available"}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Current assignments */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between">
          <h3 className="font-semibold">Current Assignments</h3>
          <Badge variant="secondary">{assignments.length} mappings</Badge>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Faculty</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Hours/week</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.faculty}</TableCell>
                <TableCell>{a.course}</TableCell>
                <TableCell>Sem {a.semester}</TableCell>
                <TableCell>
                  <Badge variant="outline">{a.section}</Badge>
                </TableCell>
                <TableCell>{a.hours}h</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Assign dialog */}
      <Dialog open={assignDialog} onOpenChange={setAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Faculty to Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Faculty</Label>
              <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                <SelectTrigger><SelectValue placeholder="Select faculty" /></SelectTrigger>
                <SelectContent>
                  {FACULTY_DIRECTORY.map((f) => (
                    <SelectItem key={f.id} value={f.name}>{f.name} ({f.dept})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>
                  {AVAILABLE_COURSES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Semester</Label>
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger><SelectValue placeholder="Sem" /></SelectTrigger>
                  <SelectContent>
                    {SEMESTERS.map((s) => (
                      <SelectItem key={s} value={s}>Sem {s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Section</Label>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger><SelectValue placeholder="Sec" /></SelectTrigger>
                  <SelectContent>
                    {SECTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Hours/week</Label>
                <Input type="number" value={hours} onChange={(e) => setHours(e.target.value)} min="1" max="6" />
              </div>
            </div>
            <Button className="w-full" onClick={handleAssign}>
              Assign Faculty
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
