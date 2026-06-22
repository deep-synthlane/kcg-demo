import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Download, Eye, GraduationCap, Mail, Phone, MapPin, Calendar, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { PageHeader } from "@/components/RoleShell";
import { STUDENTS_DIRECTORY } from "@/lib/mockData";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/students")({
  head: () => ({ meta: [{ title: "Students Directory · KCG" }] }),
  component: AdminStudents,
});

function AdminStudents() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [viewStudent, setViewStudent] = useState<(typeof STUDENTS_DIRECTORY)[number] | null>(null);

  const filtered = STUDENTS_DIRECTORY.filter((s) => {
    const matchesSearch = !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.dept.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === "All" || s.dept === deptFilter;
    return matchesSearch && matchesDept;
  });

  const departments = ["All", ...Array.from(new Set(STUDENTS_DIRECTORY.map((s) => s.dept)))];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Information System"
        subtitle="Search and inspect every student record across the university"
        actions={
          <Button variant="outline" onClick={() => toast.success("CSV export started — 6 records")}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        }
      />

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, enrolment ID or department…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 text-xs">
            {departments.map((d) => (
              <Button
                key={d}
                size="sm"
                variant={deptFilter === d ? "outline" : "ghost"}
                onClick={() => setDeptFilter(d)}
              >
                {d}
              </Button>
            ))}
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Enrolment ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>CGPA</TableHead>
              <TableHead>Attendance</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono text-xs">{s.id}</TableCell>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.dept}</TableCell>
                <TableCell>Sem {s.sem}</TableCell>
                <TableCell className="font-semibold">{s.cgpa}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      s.attendance >= 85
                        ? "bg-success/15 text-success border-0"
                        : s.attendance >= 75
                          ? "bg-warning/20 text-warning-foreground border-0"
                          : "bg-destructive/10 text-destructive border-0"
                    }
                  >
                    {s.attendance}%
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => setViewStudent(s)}>
                    <Eye className="h-3.5 w-3.5 mr-1.5" /> View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No students found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!viewStudent} onOpenChange={(v) => !v && setViewStudent(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {viewStudent && <StudentDetailView student={viewStudent} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const STUDENT_EXTRA: Record<string, {
  email: string;
  phone: string;
  dob: string;
  gender: string;
  guardian: string;
  address: string;
  batch: string;
  mentor: string;
  credits: number;
  totalCredits: number;
  feeStatus: "Paid" | "Partial" | "Pending";
  hostel: string;
  courses: { code: string; title: string; grade: string }[];
}> = {
  "KCGU/22/CSE/0184": {
    email: "ananya.iyer@kcgu.edu.in", phone: "+91 98765 12340", dob: "2004-05-12", gender: "Female",
    guardian: "Ramesh Iyer", address: "34, T. Nagar, Chennai, TN — 600017", batch: "2022–2026",
    mentor: "Dr. Priya Ramanathan", credits: 142, totalCredits: 180, feeStatus: "Partial", hostel: "Block A, Room 204",
    courses: [
      { code: "CSE301", title: "Data Structures", grade: "O" },
      { code: "CSE305", title: "DBMS", grade: "A+" },
      { code: "CSE402", title: "AI", grade: "A+" },
      { code: "CSE304", title: "Operating Systems", grade: "A" },
    ],
  },
  "KCGU/22/CSE/0185": {
    email: "rahul.verma@kcgu.edu.in", phone: "+91 93456 78901", dob: "2004-08-22", gender: "Male",
    guardian: "Sunil Verma", address: "12, MG Road, Bangalore, KA — 560001", batch: "2022–2026",
    mentor: "Prof. Arjun Krishnan", credits: 138, totalCredits: 180, feeStatus: "Paid", hostel: "Block B, Room 112",
    courses: [
      { code: "CSE301", title: "Data Structures", grade: "A+" },
      { code: "CSE305", title: "DBMS", grade: "A" },
      { code: "CSE402", title: "AI", grade: "B+" },
      { code: "CSE304", title: "Operating Systems", grade: "A" },
    ],
  },
  "KCGU/22/ECE/0091": {
    email: "priya.nair@kcgu.edu.in", phone: "+91 99012 34567", dob: "2004-02-14", gender: "Female",
    guardian: "Krishnan Nair", address: "7, Marine Drive, Kochi, KL — 682001", batch: "2022–2026",
    mentor: "Dr. Suresh Menon", credits: 148, totalCredits: 180, feeStatus: "Paid", hostel: "Day Scholar",
    courses: [
      { code: "ECE201", title: "VLSI Design", grade: "O" },
      { code: "ECE102", title: "Signals & Systems", grade: "O" },
      { code: "ECE301", title: "Embedded Systems", grade: "A+" },
      { code: "ECE401", title: "Communication Systems", grade: "A+" },
    ],
  },
  "KCGU/23/MECH/0040": {
    email: "imran.khan@kcgu.edu.in", phone: "+91 87654 32109", dob: "2005-11-03", gender: "Male",
    guardian: "Saleem Khan", address: "45, Civil Lines, Lucknow, UP — 226001", batch: "2023–2027",
    mentor: "Dr. Rajesh Kumar", credits: 96, totalCredits: 180, feeStatus: "Pending", hostel: "Block C, Room 307",
    courses: [
      { code: "ME201", title: "Thermodynamics", grade: "B+" },
      { code: "ME202", title: "Fluid Mechanics", grade: "A" },
      { code: "ME301", title: "Manufacturing", grade: "B+" },
      { code: "ME302", title: "Machine Design", grade: "A" },
    ],
  },
  "KCGU/24/MBA/0018": {
    email: "ritika.bose@kcgu.edu.in", phone: "+91 76543 21098", dob: "2001-06-28", gender: "Female",
    guardian: "Sourav Bose", address: "89, Park Street, Kolkata, WB — 700016", batch: "2024–2026",
    mentor: "Dr. Joseph Thomas", credits: 36, totalCredits: 72, feeStatus: "Paid", hostel: "Day Scholar",
    courses: [
      { code: "MBA101", title: "Financial Accounting", grade: "O" },
      { code: "MBA102", title: "Marketing Management", grade: "A+" },
      { code: "MBA201", title: "Business Analytics", grade: "O" },
      { code: "MBA202", title: "Organizational Behaviour", grade: "A" },
    ],
  },
  "KCGU/23/CIVIL/0022": {
    email: "suresh.babu@kcgu.edu.in", phone: "+91 65432 10987", dob: "2005-03-17", gender: "Male",
    guardian: "Venkatesh Babu", address: "23, Anna Nagar, Madurai, TN — 625020", batch: "2023–2027",
    mentor: "Dr. Anita Desai", credits: 92, totalCredits: 180, feeStatus: "Partial", hostel: "Block A, Room 415",
    courses: [
      { code: "CE201", title: "Structural Analysis", grade: "B+" },
      { code: "CE202", title: "Surveying", grade: "A" },
      { code: "CE301", title: "Concrete Design", grade: "B" },
      { code: "CE302", title: "Geotechnical Eng.", grade: "B+" },
    ],
  },
};

function DetailField({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium mt-0.5">{value ?? "—"}</dd>
    </div>
  );
}

function StudentDetailView({ student }: { student: (typeof STUDENTS_DIRECTORY)[number] }) {
  const extra = STUDENT_EXTRA[student.id];
  const creditPct = extra ? Math.round((extra.credits / extra.totalCredits) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary shrink-0">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold">{student.name}</h3>
          <p className="text-sm text-muted-foreground">{student.id}</p>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline">{student.dept}</Badge>
            <Badge variant="outline">Sem {student.sem}</Badge>
            <Badge className={
              student.attendance >= 85 ? "bg-success/15 text-success border-0" :
              student.attendance >= 75 ? "bg-warning/20 text-warning-foreground border-0" :
              "bg-destructive/10 text-destructive border-0"
            }>
              {student.attendance}% Attendance
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-display font-bold text-primary">{student.cgpa}</div>
          <div className="text-xs text-muted-foreground">CGPA</div>
        </div>
      </div>

      {/* Personal Details */}
      {extra && (
        <>
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-primary" /> Personal Information
            </h4>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <DetailField label="Email" value={extra.email} />
              <DetailField label="Phone" value={extra.phone} />
              <DetailField label="Date of Birth" value={extra.dob} />
              <DetailField label="Gender" value={extra.gender} />
              <DetailField label="Guardian Name" value={extra.guardian} />
              <DetailField label="Batch" value={extra.batch} />
              <div className="col-span-2">
                <DetailField label="Address" value={extra.address} />
              </div>
            </dl>
          </div>

          {/* Academic Details */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-primary" /> Academic Details
            </h4>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <DetailField label="Department" value={student.dept} />
              <DetailField label="Current Semester" value={`Semester ${student.sem}`} />
              <DetailField label="Faculty Mentor" value={extra.mentor} />
              <DetailField label="Hostel / Residence" value={extra.hostel} />
              <DetailField label="Fee Status" value={extra.feeStatus} />
              <DetailField label="CGPA" value={student.cgpa} />
            </dl>
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Credits Completed</span>
                <span className="font-medium">{extra.credits}/{extra.totalCredits}</span>
              </div>
              <Progress value={creditPct} className="h-2" />
            </div>
          </div>

          {/* Current Courses & Grades */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-primary" /> Current Courses & Grades
            </h4>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="p-2.5 text-left">Code</th>
                    <th className="p-2.5 text-left">Course</th>
                    <th className="p-2.5 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {extra.courses.map((c) => (
                    <tr key={c.code} className="border-t">
                      <td className="p-2.5 font-mono text-xs">{c.code}</td>
                      <td className="p-2.5 font-medium">{c.title}</td>
                      <td className="p-2.5 text-center">
                        <Badge variant="outline" className={
                          c.grade === "O" ? "border-success text-success" :
                          c.grade.startsWith("A") ? "border-primary text-primary" :
                          ""
                        }>
                          {c.grade}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!extra && (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Detailed records not available for this student in demo mode.
        </div>
      )}
    </div>
  );
}
