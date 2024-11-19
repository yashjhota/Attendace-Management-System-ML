import { AttendanceRecord } from '../types';

const STORAGE_KEY = 'attendance_v2';
const ATTENDANCE_THRESHOLD = 0.85; // 85% attendance requirement

export const saveAttendance = (records: AttendanceRecord[]) => {
  const existing = getAttendance();
  
  const isDuplicate = records.some(newRecord => 
    existing.some(existingRecord => 
      existingRecord.date === newRecord.date && 
      existingRecord.courseId === newRecord.courseId
    )
  );
  
  if (isDuplicate) {
    throw new Error('Attendance has already been marked for this date and course');
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, ...records]));
};

export const getAttendance = () => {
  const records = localStorage.getItem(STORAGE_KEY);
  return records ? JSON.parse(records) : [];
};

export const predictAttendance = (studentId: string, courseId: string) => {
  const records = getAttendance();
  const studentRecords = records.filter(
    (r: AttendanceRecord) => r.studentId === studentId && r.courseId === courseId
  );
  
  if (studentRecords.length < 1) return null;
  
  const presentCount = studentRecords.filter((r: AttendanceRecord) => r.status === 'present').length;
  const attendanceRate = presentCount / studentRecords.length;
  
  // Get last 5 classes for recent trend
  const recentRecords = studentRecords.slice(-5);
  const recentPresentCount = recentRecords.filter(r => r.status === 'present').length;
  const recentRate = recentPresentCount / recentRecords.length;

  // Calculate consistency score based on last 10 classes
  const last10Records = studentRecords.slice(-10);
  const consistencyScore = last10Records.length >= 2 ? 
    last10Records.slice(1).reduce((acc, curr, idx) => 
      acc + (curr.status === last10Records[idx].status ? 1 : 0), 0) / (last10Records.length - 1)
    : 1;

  // Calculate trend direction
  const trend = recentRate > attendanceRate ? 'positive' : 
               recentRate < attendanceRate ? 'negative' : 'neutral';

  // Predict future attendance probability
  const weightedScore = (attendanceRate * 0.4) + (recentRate * 0.4) + (consistencyScore * 0.2);
  const isShortage = attendanceRate < ATTENDANCE_THRESHOLD;

  return {
    likely: isShortage ? 'Attendance shortage!' : 'Good attendance',
    rate: Math.round(attendanceRate * 100),
    recentRate: Math.round(recentRate * 100),
    consistencyScore: Math.round(consistencyScore * 100),
    trend,
    prediction: weightedScore >= 0.85 ? 'High attendance likely' :
               weightedScore >= 0.70 ? 'Moderate attendance likely' :
               'Low attendance likely',
    details: {
      overall: `${Math.round(attendanceRate * 100)}% overall attendance`,
      recent: `${Math.round(recentRate * 100)}% in last 5 classes`,
      consistency: `${Math.round(consistencyScore * 100)}% attendance consistency`,
      pattern: consistencyScore >= 0.8 ? 'Very consistent attendance' :
              consistencyScore >= 0.6 ? 'Moderately consistent' :
              'Irregular attendance pattern',
      shortage: isShortage ? `Need ${Math.round((ATTENDANCE_THRESHOLD - attendanceRate) * 100)}% more to meet requirement` : null
    }
  };
};