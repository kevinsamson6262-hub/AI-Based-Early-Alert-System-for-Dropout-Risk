import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';

const AddStudentForm = () => {
  const { addStudent } = useApp();

  const [form, setForm] = useState({
    age: '',
    attendance_percentage: '',
    average_marks: '',
    absences_per_month: '',
    distance_to_school_km: '',
    family_income_level: 'Low',
    parents_education_level: 'Primary',
    health_issues: 'No',
    child_labor: 0,
    has_sibling_dropout: 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      await addStudent({
        ...form,
        age: Number(form.age),
        attendance_percentage: Number(form.attendance_percentage),
        average_marks: Number(form.average_marks),
        absences_per_month: Number(form.absences_per_month),
        distance_to_school_km: Number(form.distance_to_school_km),
        child_labor: Number(form.child_labor),
        has_sibling_dropout: Number(form.has_sibling_dropout)
      });

      toast.success('Student added successfully');
    } catch {
      toast.error('Failed to add student');
    }
  };

  return (
    <Card className="p-8 border-2 border-dashed border-primary">
      <h3 className="text-2xl font-bold mb-4">Add Student Manually</h3>

      <div className="grid grid-cols-2 gap-4">
        <input name="age" placeholder="Age" onChange={handleChange} />
        <input name="attendance_percentage" placeholder="Attendance %" onChange={handleChange} />
        <input name="average_marks" placeholder="Average Marks" onChange={handleChange} />
        <input name="absences_per_month" placeholder="Absences / Month" onChange={handleChange} />
        <input name="distance_to_school_km" placeholder="Distance (km)" onChange={handleChange} />

        <select name="family_income_level" onChange={handleChange}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>

        <select name="parents_education_level" onChange={handleChange}>
          <option>No Education</option>
          <option>Primary</option>
          <option>Secondary</option>
          <option>Higher</option>
        </select>

        <select name="health_issues" onChange={handleChange}>
          <option>No</option>
          <option>Yes</option>
        </select>

        <select name="child_labor" onChange={handleChange}>
          <option value={0}>No Child Labor</option>
          <option value={1}>Child Labor</option>
        </select>

        <select name="has_sibling_dropout" onChange={handleChange}>
          <option value={0}>No Sibling Dropout</option>
          <option value={1}>Sibling Dropped Out</option>
        </select>
      </div>

      <Button className="mt-6" onClick={handleSubmit}>
        Add Student
      </Button>
    </Card>
  );
};

export default AddStudentForm;
