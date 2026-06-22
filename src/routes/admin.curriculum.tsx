import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar as CalIcon, BookCopy, GraduationCap, Plus, Trash2 } from "lucide-react";
import { useCalendar, type CalEvent } from "@/lib/calendarStore";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { PageHeader } from "@/components/RoleShell";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/curriculum")({
  head: () => ({ meta: [{ title: "Curriculum & Calendar · KCG" }] }),
  component: Curriculum,
});


type Program = { code: string; duration: string; courses: number; electives: number; sem: number };

const INITIAL_PROGRAMS: Program[] = [
  { code: "B.Tech CSE", duration: "4 yrs", courses: 48, electives: 12, sem: 8 },
  { code: "B.Tech ECE", duration: "4 yrs", courses: 46, electives: 10, sem: 8 },
  { code: "MBA", duration: "2 yrs", courses: 24, electives: 8, sem: 4 },
  { code: "B.Sc Data Science", duration: "3 yrs", courses: 36, electives: 9, sem: 6 },
];

type Elective = { name: string; dept: string; capacity: number; enrolled: number };

const INITIAL_ELECTIVES: Elective[] = [
  { name: "Quantum Computing", dept: "CSE", capacity: 60, enrolled: 54 },
  { name: "Blockchain & Web3", dept: "CSE", capacity: 80, enrolled: 72 },
  { name: "Generative AI Studio", dept: "CSE", capacity: 90, enrolled: 88 },
  { name: "VLSI Design", dept: "ECE", capacity: 50, enrolled: 38 },
  { name: "Behavioural Finance", dept: "MBA", capacity: 40, enrolled: 36 },
];

function Curriculum() {
  const { events, addEvent, deleteEvent } = useCalendar();
  const [programs, setPrograms] = useState<Program[]>(INITIAL_PROGRAMS);
  const [electives, setElectives] = useState<Elective[]>(INITIAL_ELECTIVES);

  // Calendar dialogs
  const [addEventDialog, setAddEventDialog] = useState(false);
  const [editDay, setEditDay] = useState<number | null>(null);
  const [eventLabel, setEventLabel] = useState("");
  const [eventType, setEventType] = useState<CalEvent["type"]>("event");

  // Program dialog
  const [addProgramDialog, setAddProgramDialog] = useState(false);
  const [progCode, setProgCode] = useState("");
  const [progDuration, setProgDuration] = useState("4 yrs");
  const [progCourses, setProgCourses] = useState("40");
  const [progElectives, setProgElectives] = useState("10");
  const [progSem, setProgSem] = useState("8");

  // Elective dialog
  const [addElectiveDialog, setAddElectiveDialog] = useState(false);
  const [electName, setElectName] = useState("");
  const [electDept, setElectDept] = useState("");
  const [electCapacity, setElectCapacity] = useState("60");

  function handleSaveEvent() {
    if (!eventLabel.trim() || editDay === null) return;
    addEvent(editDay, { label: eventLabel, type: eventType });
    toast.success(`Event "${eventLabel}" saved on day ${editDay}`);
    setAddEventDialog(false);
    setEditDay(null);
    setEventLabel("");
  }

  function handleDeleteEvent(day: number) {
    deleteEvent(day);
    toast.success("Event deleted");
  }

  function openAddEvent(day?: number) {
    if (day && events[day]) {
      setEventLabel(events[day].label);
      setEventType(events[day].type);
    } else {
      setEventLabel("");
      setEventType("event");
    }
    setEditDay(day ?? 1);
    setAddEventDialog(true);
  }

  function handleAddProgram() {
    if (!progCode.trim()) return;
    setPrograms((prev) => [...prev, {
      code: progCode,
      duration: progDuration,
      courses: parseInt(progCourses) || 40,
      electives: parseInt(progElectives) || 10,
      sem: parseInt(progSem) || 8,
    }]);
    toast.success(`Program "${progCode}" created`);
    setAddProgramDialog(false);
    setProgCode("");
  }

  function handleAddElective() {
    if (!electName.trim() || !electDept.trim()) return;
    setElectives((prev) => [...prev, {
      name: electName,
      dept: electDept,
      capacity: parseInt(electCapacity) || 60,
      enrolled: 0,
    }]);
    toast.success(`Elective "${electName}" added`);
    setAddElectiveDialog(false);
    setElectName("");
    setElectDept("");
    setElectCapacity("60");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Curriculum & Academic Calendar"
        subtitle="Programs, electives, semesters and key academic events"
      />

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">
            <CalIcon className="h-4 w-4 mr-1.5" /> Academic Calendar
          </TabsTrigger>
          <TabsTrigger value="programs">
            <GraduationCap className="h-4 w-4 mr-1.5" /> Programs
          </TabsTrigger>
          <TabsTrigger value="electives">
            <BookCopy className="h-4 w-4 mr-1.5" /> Electives
          </TabsTrigger>
        </TabsList>

        {/* --- ACADEMIC CALENDAR --- */}
        <TabsContent value="calendar">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">June 2026</h3>
                <p className="text-xs text-muted-foreground">Semester 6 · Even Term</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-2 text-xs">
                  <Legend tone="exam" label="Exams" />
                  <Legend tone="holiday" label="Holiday" />
                  <Legend tone="event" label="Event" />
                  <Legend tone="fest" label="Fest" />
                </div>
                <Button size="sm" onClick={() => openAddEvent()}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Event
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="py-2 font-medium text-muted-foreground">
                  {d}
                </div>
              ))}
              {Array.from({ length: 30 }).map((_, i) => {
                const day = i + 1;
                const ev = events[day];
                return (
                  <div
                    key={day}
                    onClick={() => openAddEvent(day)}
                    className={cn(
                      "aspect-square rounded-md border p-1.5 flex flex-col text-left cursor-pointer hover:ring-2 hover:ring-primary/30 transition group relative",
                      ev?.type === "exam" && "bg-destructive/10 border-destructive/30",
                      ev?.type === "holiday" && "bg-warning/15 border-warning/30",
                      ev?.type === "event" && "bg-primary/10 border-primary/30",
                      ev?.type === "fest" && "bg-violet-500/10 border-violet-500/30",
                      !ev && "bg-card hover:bg-muted/40",
                    )}
                  >
                    <div className="font-medium">{day}</div>
                    {ev && (
                      <>
                        <div className="text-[10px] mt-auto leading-tight truncate">{ev.label}</div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteEvent(day); }}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition rounded-sm bg-destructive/80 text-white p-0.5"
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* --- PROGRAMS --- */}
        <TabsContent value="programs">
          <div className="flex justify-end mb-4">
            <Button size="sm" onClick={() => setAddProgramDialog(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Create Program
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {programs.map((p) => (
              <div key={p.code} className="rounded-xl border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{p.code}</h3>
                  <Badge variant="outline">{p.duration}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                  <Box label="Courses" value={p.courses} />
                  <Box label="Electives" value={p.electives} />
                  <Box label="Semesters" value={p.sem} />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* --- ELECTIVES --- */}
        <TabsContent value="electives">
          <div className="flex justify-end mb-4">
            <Button size="sm" onClick={() => setAddElectiveDialog(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Elective
            </Button>
          </div>
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="p-3 text-left">Elective</th>
                  <th className="p-3 text-left">Department</th>
                  <th className="p-3 text-left">Enrolment</th>
                  <th className="p-3 text-left">Fill</th>
                </tr>
              </thead>
              <tbody>
                {electives.map((e) => {
                  const pct = Math.round((e.enrolled / e.capacity) * 100);
                  return (
                    <tr key={e.name} className="border-t">
                      <td className="p-3 font-medium">{e.name}</td>
                      <td className="p-3">{e.dept}</td>
                      <td className="p-3 text-muted-foreground">
                        {e.enrolled} / {e.capacity}
                      </td>
                      <td className="p-3">
                        <div className="w-32 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Event Dialog */}
      <Dialog open={addEventDialog} onOpenChange={setAddEventDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{events[editDay ?? 0] ? "Edit Event" : "Add Event"} — Day {editDay}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Event Title</Label>
              <Input value={eventLabel} onChange={(e) => setEventLabel(e.target.value)} placeholder="e.g. Foundation Day" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <Select value={eventType} onValueChange={(v) => setEventType(v as CalEvent["type"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="fest">Fest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Day of Month</Label>
              <Input type="number" min={1} max={30} value={editDay ?? ""} onChange={(e) => setEditDay(parseInt(e.target.value) || 1)} />
            </div>
            <Button className="w-full" onClick={handleSaveEvent}>Save Event</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Program Dialog */}
      <Dialog open={addProgramDialog} onOpenChange={setAddProgramDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create Program</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Program Name</Label>
              <Input value={progCode} onChange={(e) => setProgCode(e.target.value)} placeholder="e.g. B.Tech AI & ML" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Duration</Label>
                <Select value={progDuration} onValueChange={setProgDuration}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2 yrs">2 yrs</SelectItem>
                    <SelectItem value="3 yrs">3 yrs</SelectItem>
                    <SelectItem value="4 yrs">4 yrs</SelectItem>
                    <SelectItem value="5 yrs">5 yrs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Semesters</Label>
                <Input type="number" value={progSem} onChange={(e) => setProgSem(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Core Courses</Label>
                <Input type="number" value={progCourses} onChange={(e) => setProgCourses(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Electives</Label>
                <Input type="number" value={progElectives} onChange={(e) => setProgElectives(e.target.value)} />
              </div>
            </div>
            <Button className="w-full" onClick={handleAddProgram}>Create Program</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Elective Dialog */}
      <Dialog open={addElectiveDialog} onOpenChange={setAddElectiveDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Elective</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Elective Name</Label>
              <Input value={electName} onChange={(e) => setElectName(e.target.value)} placeholder="e.g. IoT Systems" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Department</Label>
                <Select value={electDept} onValueChange={setElectDept}>
                  <SelectTrigger><SelectValue placeholder="Dept" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CSE">CSE</SelectItem>
                    <SelectItem value="ECE">ECE</SelectItem>
                    <SelectItem value="MECH">MECH</SelectItem>
                    <SelectItem value="MBA">MBA</SelectItem>
                    <SelectItem value="CIVIL">CIVIL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Capacity</Label>
                <Input type="number" value={electCapacity} onChange={(e) => setElectCapacity(e.target.value)} />
              </div>
            </div>
            <Button className="w-full" onClick={handleAddElective}>Add Elective</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Legend({ tone, label }: { tone: "exam" | "holiday" | "event" | "fest"; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn(
          "h-2.5 w-2.5 rounded-sm",
          tone === "exam" && "bg-destructive/60",
          tone === "holiday" && "bg-warning",
          tone === "event" && "bg-primary",
          tone === "fest" && "bg-violet-500",
        )}
      />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

function Box({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-muted/50 p-2">
      <div className="font-display text-xl font-semibold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
