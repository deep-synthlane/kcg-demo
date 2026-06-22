import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Plus, Wand2, CheckCircle2, XCircle } from "lucide-react";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/RoleShell";
import { TIMETABLE } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/timetable")({
  head: () => ({ meta: [{ title: "Timetable Builder · KCG" }] }),
  component: AdminTimetable,
});

const COURSES_LIST = ["DS · A-201", "DBMS · B-104", "AI · A-105", "OS · C-301", "Lab · CSL-1", "Lab · CSL-2", "Seminar", "Mentor", "Library", "Sports", "Club", "Workshop"];
const FACULTY_LIST = ["Dr. Priya R.", "Prof. Arjun K.", "Dr. Meera S.", "Dr. Karthik V.", "Dr. Suresh M.", "Prof. Latha I."];
const ROOMS_LIST = ["A-201", "A-105", "B-104", "C-301", "CSL-1", "CSL-2"];

type ChangeRequest = {
  id: string;
  faculty: string;
  day: string;
  period: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
};

const INITIAL_REQUESTS: ChangeRequest[] = [
  { id: "cr1", faculty: "Dr. Karthik Venkatesan", day: "Thursday", period: "11:00", reason: "Conflict with lab supervision at CSL-1", status: "Pending" },
  { id: "cr2", faculty: "Dr. Meera Subramanian", day: "Wednesday", period: "02:00", reason: "Research seminar at IIT Madras", status: "Pending" },
  { id: "cr3", faculty: "Prof. Arjun Krishnan", day: "Friday", period: "10:00", reason: "Conference presentation", status: "Approved" },
];

function AdminTimetable() {
  const [grid, setGrid] = useState(TIMETABLE.grid.map((row) => [...row]));
  const [conflictResolved, setConflictResolved] = useState(false);
  const [slotDialog, setSlotDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState(0);
  const [slotValue, setSlotValue] = useState("");
  const [requests, setRequests] = useState<ChangeRequest[]>(INITIAL_REQUESTS);

  function handleCellClick(di: number, ci: number) {
    setSelectedDay(di);
    setSelectedPeriod(ci);
    setSlotValue(grid[di][ci] === "—" ? "" : grid[di][ci]);
    setSlotDialog(true);
  }

  function handleSaveSlot() {
    if (!slotValue.trim()) return;
    setGrid((prev) => {
      const copy = prev.map((r) => [...r]);
      copy[selectedDay][selectedPeriod] = slotValue;
      return copy;
    });
    toast.success(`Slot saved: ${TIMETABLE.days[selectedDay]} ${TIMETABLE.periods[selectedPeriod]} → ${slotValue}`);
    setSlotDialog(false);
  }

  function handleAutoResolve() {
    setGrid((prev) => {
      const copy = prev.map((r) => [...r]);
      copy[3][2] = "AI Lab · CSL-2";
      return copy;
    });
    setConflictResolved(true);
    toast.success("Conflict resolved: Dr. Karthik's Thursday 11:00 reassigned to AI Lab CSL-2");
  }

  function handleRequestAction(id: string, status: "Approved" | "Rejected") {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    toast.success(`Change request ${status.toLowerCase()}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timetable Builder"
        subtitle="Assign faculty, rooms and labs; detect scheduling conflicts in real-time"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleAutoResolve} disabled={conflictResolved}>
              <Wand2 className="h-4 w-4 mr-2" /> Auto-resolve
            </Button>
            <Button onClick={() => { setSelectedDay(0); setSelectedPeriod(0); setSlotValue(""); setSlotDialog(true); }}>
              <Plus className="h-4 w-4 mr-2" /> New Slot
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="grid">
        <TabsList>
          <TabsTrigger value="grid">Timetable Grid</TabsTrigger>
          <TabsTrigger value="requests">
            Change Requests
            <Badge variant="secondary" className="ml-1.5 text-[10px]">
              {requests.filter((r) => r.status === "Pending").length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          {!conflictResolved && (
            <div className="rounded-xl border border-warning/40 bg-warning/15 p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning-foreground shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-sm">1 scheduling conflict detected</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Dr. Karthik Venkatesan is double-booked on <b>Thursday 11:00</b> for both OS and AI lab. Reassign required.
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={handleAutoResolve}>
                Resolve
              </Button>
            </div>
          )}

          <div className="grid lg:grid-cols-[1fr_280px] gap-6">
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[760px]">
                  <thead>
                    <tr className="bg-muted/50 uppercase tracking-wider text-muted-foreground">
                      <th className="p-3 text-left font-medium">Day</th>
                      {TIMETABLE.periods.map((p) => (
                        <th key={p} className="p-3 text-left font-medium">{p}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TIMETABLE.days.map((d, di) => (
                      <tr key={d} className="border-t">
                        <td className="p-3 font-semibold text-sm">{d}</td>
                        {grid[di].map((cell, ci) => {
                          const conflict = !conflictResolved && di === 3 && ci === 2;
                          return (
                            <td key={ci} className="p-2 align-top">
                              <div
                                onClick={() => handleCellClick(di, ci)}
                                className={cn(
                                  "rounded-md px-2 py-1.5 cursor-pointer hover:ring-2 hover:ring-primary/40 transition",
                                  cell === "—"
                                    ? "bg-muted/30 text-muted-foreground"
                                    : "bg-primary/5 text-primary border border-primary/10",
                                  conflict && "bg-destructive/15 text-destructive border-destructive/40",
                                )}
                              >
                                {cell}
                                {conflict && <span className="block text-[10px]">⚠ conflict</span>}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <h3 className="font-semibold mb-3">Room utilisation</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { r: "A-201", u: 82 },
                    { r: "B-104", u: 68 },
                    { r: "C-301", u: 74 },
                    { r: "CSL-1", u: 91 },
                    { r: "CSL-2", u: 56 },
                  ].map((x) => (
                    <div key={x.r}>
                      <div className="flex justify-between text-xs">
                        <span>{x.r}</span>
                        <span className="text-muted-foreground">{x.u}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${x.u}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <Badge variant="secondary" className="mt-3 text-[10px]">
                  {conflictResolved ? "No conflicts" : "Conflicts auto-detected"}
                </Badge>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="requests">
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="p-5 border-b">
              <h3 className="font-semibold">Faculty Change Requests</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Requests for timetable modifications from faculty</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Day & Period</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.faculty}</TableCell>
                    <TableCell>{r.day} · {r.period}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate">{r.reason}</TableCell>
                    <TableCell>
                      <Badge className={
                        r.status === "Approved" ? "bg-success/15 text-success border-0" :
                        r.status === "Rejected" ? "bg-destructive/10 text-destructive border-0" :
                        "bg-warning/20 text-warning-foreground border-0"
                      }>
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {r.status === "Pending" ? (
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="outline" className="text-success border-success/40" onClick={() => handleRequestAction(r.id, "Approved")}>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive border-destructive/40" onClick={() => handleRequestAction(r.id, "Rejected")}>
                            <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Done</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Slot creation/edit dialog */}
      <Dialog open={slotDialog} onOpenChange={setSlotDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {grid[selectedDay]?.[selectedPeriod] === "—" ? "Assign Slot" : "Edit Slot"} — {TIMETABLE.days[selectedDay]} {TIMETABLE.periods[selectedPeriod]}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Day</Label>
              <Select value={String(selectedDay)} onValueChange={(v) => setSelectedDay(parseInt(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIMETABLE.days.map((d, i) => (
                    <SelectItem key={d} value={String(i)}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Period</Label>
              <Select value={String(selectedPeriod)} onValueChange={(v) => setSelectedPeriod(parseInt(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIMETABLE.periods.map((p, i) => (
                    <SelectItem key={p} value={String(i)}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Course · Room</Label>
              <Select value={slotValue} onValueChange={setSlotValue}>
                <SelectTrigger><SelectValue placeholder="Select or type below" /></SelectTrigger>
                <SelectContent>
                  {COURSES_LIST.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input value={slotValue} onChange={(e) => setSlotValue(e.target.value)} placeholder="Or type custom value" className="mt-1" />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleSaveSlot}>Save Slot</Button>
              {grid[selectedDay]?.[selectedPeriod] !== "—" && (
                <Button variant="outline" onClick={() => {
                  setGrid((prev) => { const c = prev.map((r) => [...r]); c[selectedDay][selectedPeriod] = "—"; return c; });
                  setSlotDialog(false);
                  toast.success("Slot cleared");
                }}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
