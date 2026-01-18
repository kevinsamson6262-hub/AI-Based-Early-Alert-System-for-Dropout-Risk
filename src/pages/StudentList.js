import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import RiskBadge from '@/components/RiskBadge';
import { Search, Loader2, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const StudentList = () => {
  const { students, fetchStudents, loading } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');

  // Fetch students once
  useEffect(() => {
    fetchStudents();
  }, []);

  // Helper: normalize risk
  const getRisk = (student) => {
    if (typeof student.predicted_risk === 'string') return student.predicted_risk;
    if (typeof student.dropout_risk === 'string') return student.dropout_risk;
    return 'Unknown';
  };

  // Filtered students
  const filteredStudents = useMemo(() => {
    let result = Array.isArray(students) ? [...students] : [];

    // Search filter
    if (searchTerm.trim()) {
      result = result.filter(s =>
        s.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Risk filter
    if (filterRisk !== 'all') {
      result = result.filter(
        s => getRisk(s).toLowerCase() === filterRisk
      );
    }

    return result;
  }, [students, searchTerm, filterRisk]);

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold mb-2">Student List</h1>
        <p className="text-lg text-gray-600">
          View and manage all students with risk predictions
        </p>
      </motion.div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search by Student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-600" />
            <Select value={filterRisk} onValueChange={setFilterRisk}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Risks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risks</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Count */}
      <p className="text-sm text-gray-600">
        Showing {filteredStudents.length} of {students.length} students
      </p>

      {/* Student Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student, index) => {
          const risk = getRisk(student);

          return (
            <motion.div
              key={student.student_id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
            >
              <Link to={`/students/${student.student_id}`}>
                <Card className="p-6 hover:shadow-lg transition cursor-pointer">
                  <div className="flex justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {student.student_id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Age: {student.age}
                      </p>
                    </div>
                    <RiskBadge risk={risk} size="sm" />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Attendance</span>
                      <span>{Number(student.attendance_percentage || 0).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Marks</span>
                      <span>{Number(student.average_marks || 0).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Family Income</span>
                      <span>{student.family_income_level}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-gray-600">
            No students found matching your criteria
          </p>
        </Card>
      )}
    </div>
  );
};

export default StudentList;
