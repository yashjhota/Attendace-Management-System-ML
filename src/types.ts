export interface Student {
  id: string;
  name: string;
  usn: string;
}

export interface Course {
  id: string;
  name: string;
}

export interface AttendanceRecord {
  date: string;
  studentId: string;
  courseId: string;
  status: 'present' | 'absent';
}

export interface StudentAttendance {
  student: Student;
  attendance: AttendanceRecord[];
}