import jsPDF from "jspdf";

type TranscriptProfile = {
  name: string;
  enrollment: string;
  department: string;
  semester: string;
  batch: string;
  cgpa: number;
  attendance: number;
  credits: number;
  totalCredits: number;
  mentor: string;
};

type SemesterRow = {
  sem: string;
  gpa: number;
  credits: number;
  status: string;
};

type CourseRow = {
  sem: string;
  code: string;
  title: string;
  credits: number;
  grade: string;
};

export function downloadTranscript(
  profile: TranscriptProfile,
  semesters: SemesterRow[],
  courses: CourseRow[],
): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 18;
  const CW = W - M * 2;

  doc.setFillColor(26, 86, 219);
  doc.rect(0, 0, W, 42, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("Knowledge Consortium of Gujarat University", M, 16);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text("Office of the Controller of Examinations · Official Academic Transcript", M, 24);
  doc.text("registrar@kcg.edu.in  ·  www.kcg.edu.in", M, 30);

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(W - M - 32, 10, 32, 12, 2, 2, "F");
  doc.setTextColor(26, 86, 219);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("TRANSCRIPT", W - M - 16, 17.5, { align: "center" });

  let y = 52;
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(profile.name, M, y);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`${profile.enrollment}  ·  ${profile.department}`, M, y + 7);
  doc.text(`${profile.batch}  ·  ${profile.semester}`, M, y + 13);

  doc.setFillColor(245, 247, 250);
  doc.roundedRect(M, y + 20, CW, 14, 2, 2, "F");
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(`CGPA: ${profile.cgpa}`, M + 4, y + 28);
  doc.text(`Credits: ${profile.credits}/${profile.totalCredits}`, M + 45, y + 28);
  doc.text(`Attendance: ${profile.attendance}%`, M + 95, y + 28);
  doc.text(`Mentor: ${profile.mentor}`, M + 130, y + 28);

  y += 42;

  doc.setTextColor(26, 86, 219);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("SEMESTER SUMMARY", M, y);
  y += 6;

  doc.setFillColor(26, 86, 219);
  doc.rect(M, y, CW, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.text("Semester", M + 2, y + 5);
  doc.text("GPA", M + 40, y + 5);
  doc.text("Credits", M + 60, y + 5);
  doc.text("Status", M + 85, y + 5);
  y += 7;

  semesters.forEach((row, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(248, 249, 252);
      doc.rect(M, y, CW, 7, "F");
    }
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(row.sem, M + 2, y + 5);
    doc.text(String(row.gpa), M + 40, y + 5);
    doc.text(String(row.credits), M + 60, y + 5);
    doc.text(row.status, M + 85, y + 5);
    y += 7;
  });

  y += 6;
  doc.setTextColor(26, 86, 219);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("COURSE-WISE GRADES", M, y);
  y += 6;

  const drawCourseHeader = () => {
    doc.setFillColor(26, 86, 219);
    doc.rect(M, y, CW, 7, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("Sem", M + 2, y + 5);
    doc.text("Code", M + 18, y + 5);
    doc.text("Course Title", M + 38, y + 5);
    doc.text("Cr", M + 130, y + 5);
    doc.text("Grade", M + 145, y + 5);
    y += 7;
  };

  drawCourseHeader();

  let currentSem = "";
  courses.forEach((course, i) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
      drawCourseHeader();
    }

    if (course.sem !== currentSem) {
      currentSem = course.sem;
      doc.setTextColor(26, 86, 219);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.text(currentSem, M + 2, y + 4);
      y += 5;
    }

    if (i % 2 === 0) {
      doc.setFillColor(248, 249, 252);
      doc.rect(M, y, CW, 6, "F");
    }
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(course.sem, M + 2, y + 4.5);
    doc.text(course.code, M + 18, y + 4.5);
    const title = course.title.length > 42 ? `${course.title.slice(0, 40)}…` : course.title;
    doc.text(title, M + 38, y + 4.5);
    doc.text(String(course.credits), M + 132, y + 4.5);
    doc.text(course.grade, M + 147, y + 4.5);
    y += 6;
  });

  y += 8;
  if (y > 260) {
    doc.addPage();
    y = 20;
  }
  doc.setDrawColor(200, 200, 200);
  doc.line(M, y, W - M, y);
  y += 5;
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "This is a computer-generated transcript issued by KCG University. Verify at registrar.kcg.edu.in",
    W / 2,
    y,
    { align: "center" },
  );
  doc.text(
    `Generated on ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`,
    W / 2,
    y + 5,
    { align: "center" },
  );

  const safeEnrollment = profile.enrollment.replace(/\//g, "-");
  doc.save(`KCG-Transcript-${safeEnrollment}.pdf`);
}
