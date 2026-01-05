import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import RiskBadge from '@/components/RiskBadge';
import { Search, Loader2, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const StudentList = () => {
  const { students, fetchStudents, loading } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');
  const [filteredStudents, setFilteredStudents] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRisk !== 'all') {
      filtered = filtered.filter(s => {
        const risk = s.predicted_risk || s.dropout_risk;
        return risk === filterRisk;
      });
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, filterRisk]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-foreground mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Student List
        </h1>
        <p className="text-lg text-gray-600">View and manage all students with risk predictions</p>
      </motion.div>

      <Card className="p-6 border border-stone-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search by Student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="search-input"
            />
          </div>
          <div className="flex gap-2 items-center">
            <Filter size={20} className="text-gray-600" />
            <Select value={filterRisk} onValueChange={setFilterRisk}>
              <SelectTrigger className="w-40" data-testid="filter-risk">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risks</SelectItem>
                <SelectItem value="High">High Risk</SelectItem>
                <SelectItem value="Medium">Medium Risk</SelectItem>
                <SelectItem value="Low">Low Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <div className="text-sm text-gray-600">
        Showing {filteredStudents.length} of {students.length} students
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student, index) => {
          const risk = student.predicted_risk || student.dropout_risk;
          return (
            <motion.div
              key={student.student_id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={`/students/${student.student_id}`}>
                <Card className="p-6 border border-stone-200 hover:shadow-lg transition-all duration-300 cursor-pointer card-hover" data-testid={`student-card-${student.student_id}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        {student.student_id}
                      </h3>
                      <p className="text-sm text-gray-600">Age: {student.age} years</p>
                    </div>
                    <RiskBadge risk={risk} size="sm" />
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Attendance:</span>
                      <span className="font-medium">{student.attendance_percentage?.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Marks:</span>
                      <span className="font-medium">{student.average_marks?.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Family Income:</span>
                      <span className="font-medium">{student.family_income_level}</span>
                    </div>
                  </div>
                  {student.risk_factors && student.risk_factors.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-stone-200">
                      <p className="text-xs text-gray-500 mb-2">Key Risk Factors:</p>
                      <p className="text-xs text-gray-700">{student.risk_factors.slice(0, 2).join(', ')}</p>
                    </div>
                  )}
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <Card className="p-12 text-center border border-stone-200">
          <p className="text-gray-600">No students found matching your criteria</p>
        </Card>
      )}
    </div>
  );
};

export default StudentList;
