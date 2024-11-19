import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Download, Save } from 'lucide-react';
import { students } from '../data/students';
import { courses } from '../data/courses';
import { saveAttendance } from '../utils/storage';
import { utils, writeFile } from 'xlsx';

const MarkAttendance = () => {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedCourse, setSelectedCourse] = useState('');
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent'>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const defaultAttendance = students.reduce((acc, student) => {
      acc[student.id] = 'absent';
      return acc;
    }, {} as Record<string, 'present' | 'absent'>);
    setAttendance(defaultAttendance);
  }, []);

  const handleAttendanceToggle = (studentId: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'absent' ? 'present' : 'absent'
    }));
  };

  const handleSave = async () => {
    if (!selectedCourse) {
      alert('Please select a course first!');
      return;
    }

    if (saving) return;

    try {
      setSaving(true);
      const records = Object.entries(attendance).map(([studentId, status]) => ({
        date,
        studentId,
        courseId: selectedCourse,
        status,
      }));
      
      saveAttendance(records);
      alert('Attendance saved successfully!');
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('An error occurred while saving attendance');
      }
    } finally {
      setSaving(false);
    }
  };

  const downloadSheet = () => {
    if (!selectedCourse) {
      alert('Please select a course first!');
      return;
    }

    const course = courses.find(c => c.id === selectedCourse);
    const data = students.map(student => ({
      'USN': student.usn,
      'Name': student.name,
      'Course': course?.name,
      'Status': attendance[student.id] || 'Absent'
    }));

    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Attendance');
    writeFile(wb, `attendance-${course?.name}-${date}.xlsx`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="grid grid-cols-2 gap-4 flex-grow mr-4">
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
            <label className="block text-sm font-medium text-gray-700">Select Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleSave}
            disabled={!selectedCourse || saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
          <button
            onClick={downloadSheet}
            disabled={!selectedCourse}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Sheet
          </button>
        </div>
      </div>

      {selectedCourse ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">USN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.usn}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleAttendanceToggle(student.id)}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        attendance[student.id] === 'present'
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {attendance[student.id] === 'present' ? 'Present' : 'Absent'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Please select a course to mark attendance
        </div>
      )}
    </div>
  );
};

export default MarkAttendance;