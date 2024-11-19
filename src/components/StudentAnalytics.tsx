import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { UserSearch, AlertTriangle, Calendar, BarChart, TrendingUp, Activity } from 'lucide-react';
import { students } from '../data/students';
import { courses } from '../data/courses';
import { getAttendance, predictAttendance } from '../utils/storage';
import type { AttendanceRecord } from '../types';

const StudentAnalytics = () => {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [dateRange, setDateRange] = useState({
    start: format(new Date().setDate(1), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });

  const getStudentAttendance = () => {
    if (!selectedStudent || !selectedCourse) return null;

    const allRecords = getAttendance();
    const studentRecords = allRecords.filter(
      (record: AttendanceRecord) =>
        record.studentId === selectedStudent &&
        record.courseId === selectedCourse &&
        record.date >= dateRange.start &&
        record.date <= dateRange.end
    );

    const totalClasses = studentRecords.length;
    const presentClasses = studentRecords.filter((r: AttendanceRecord) => r.status === 'present').length;
    const attendancePercentage = totalClasses ? (presentClasses / totalClasses) * 100 : 0;

    const prediction = predictAttendance(selectedStudent, selectedCourse);

    return {
      totalClasses,
      presentClasses,
      absentClasses: totalClasses - presentClasses,
      attendancePercentage,
      prediction,
      records: studentRecords,
    };
  };

  const studentData = getStudentAttendance();
  const student = students.find(s => s.id === selectedStudent);
  const course = courses.find(c => c.id === selectedCourse);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Choose a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.usn})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Choose a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {selectedStudent && selectedCourse && studentData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-4 mb-6">
              <UserSearch className="h-8 w-8 text-indigo-600" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">{student?.name}</h3>
                <p className="text-sm text-gray-500">{student?.usn}</p>
                <p className="text-sm font-medium text-indigo-600 mt-1">{course?.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Total Classes</p>
                <p className="text-2xl font-semibold text-gray-900">{studentData.totalClasses}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600">Present</p>
                <p className="text-2xl font-semibold text-green-900">{studentData.presentClasses}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-red-600">Absent</p>
                <p className="text-2xl font-semibold text-red-900">{studentData.absentClasses}</p>
              </div>
              <div className={`${
                studentData.attendancePercentage >= 85 ? 'bg-green-50' : 'bg-red-50'
              } rounded-lg p-4`}>
                <p className={`text-sm ${
                  studentData.attendancePercentage >= 85 ? 'text-green-600' : 'text-red-600'
                }`}>Attendance Rate</p>
                <p className={`text-2xl font-semibold ${
                  studentData.attendancePercentage >= 85 ? 'text-green-900' : 'text-red-900'
                }`}>
                  {studentData.attendancePercentage.toFixed(1)}%
                </p>
              </div>
            </div>

            {studentData.prediction?.details.shortage && (
              <div className="mt-4 bg-red-50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <p className="text-sm font-medium text-red-800">
                    {studentData.prediction.details.shortage}
                  </p>
                </div>
              </div>
            )}
          </div>

          {studentData.prediction && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-4 mb-6">
                <Activity className="h-8 w-8 text-indigo-600" />
                <h3 className="text-lg font-medium text-gray-900">Attendance Analysis</h3>
              </div>

              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  studentData.prediction.trend === 'positive' ? 'bg-green-50' :
                  studentData.prediction.trend === 'neutral' ? 'bg-yellow-50' : 'bg-red-50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-lg font-medium text-gray-900">{studentData.prediction.prediction}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      studentData.prediction.trend === 'positive' ? 'bg-green-200 text-green-800' :
                      studentData.prediction.trend === 'neutral' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-red-200 text-red-800'
                    }`}>
                      {studentData.prediction.trend.toUpperCase()} TREND
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <p className="text-sm text-gray-600">{studentData.prediction.details.overall}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-gray-500" />
                      <p className="text-sm text-gray-600">{studentData.prediction.details.recent}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BarChart className="h-4 w-4 text-gray-500" />
                      <p className="text-sm text-gray-600">{studentData.prediction.details.pattern}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance History</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {studentData.records.map((record: AttendanceRecord) => (
                    <tr key={record.date}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(parseISO(record.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.status === 'present'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAnalytics;