import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ClipboardList, UserSearch, BarChart3 } from 'lucide-react';
import MarkAttendance from './components/MarkAttendance';
import StudentAnalytics from './components/StudentAnalytics';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-indigo-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <h1 className="text-xl font-bold">Attendance System</h1>
                <div className="flex space-x-4">
                  <Link to="/" className="flex items-center space-x-2 hover:text-indigo-200">
                    <ClipboardList size={20} />
                    <span>Mark Attendance</span>
                  </Link>
                  <Link to="/analytics" className="flex items-center space-x-2 hover:text-indigo-200">
                    <BarChart3 size={20} />
                    <span>Analytics</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<MarkAttendance />} />
            <Route path="/analytics" element={<StudentAnalytics />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;