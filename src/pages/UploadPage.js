import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import { Upload, Database, Brain, Loader2, UserPlus } from 'lucide-react';
const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const UploadPage = () => {
  const {
    generateDataset,
    trainModel,
    predictBatch,
    addStudent,      // ✅ NEW
    loading
  } = useApp();

  const [step, setStep] = useState(1);
  const [hasTrainingData, setHasTrainingData] = useState(false);
  const [hasStudents, setHasStudents] = useState(false);
  const [modelTrained, setModelTrained] = useState(false);
  
  const checkSystemState = async () => {
  try {
    // 🔹 training data
    const trainingRes = await fetch(`${API}/training/count`);
    const trainingData = await trainingRes.json();
    setHasTrainingData(trainingData.count > 0);

    // 🔹 students
    const studentsRes = await fetch(`${API}/students`);
    const studentsData = await studentsRes.json();
    setHasStudents(studentsData.total_students > 0);

    // 🔹 model
    try {
      await fetch(`${API}/model/metrics`);
      setModelTrained(true);
    } catch {
      setModelTrained(false);
    }
  } catch (err) {
    console.error('Failed to check system state', err);
  }
};

  useEffect(() => {
  checkSystemState();
}, []);

  // -------------------------
  // MANUAL STUDENT FORM STATE
  // -------------------------
  const [student, setStudent] = useState({
    phone_number: '', 
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

  const handleGenerateData = async () => {
    try {
      const result = await generateDataset(150);
      toast.success(`Generated ${result.total_records} student records`);
      await checkSystemState();
    } catch {
      toast.error('Failed to generate dataset');
    }
  };

  const handleTrainModel = async () => {
    try {
      const result = await trainModel();
      toast.success(
        `Model trained with ${(result.metrics.accuracy * 100).toFixed(2)}% accuracy`
      );
      await checkSystemState(); 
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to train model');
    }
  };

  const handlePredict = async () => {
    try {
      const result = await predictBatch();
      toast.success(`Predictions completed for ${result.total_predictions} students`);
      await checkSystemState();
    } catch {
      toast.error('Failed to generate predictions');
    }
  };

  // -------------------------
  // ADD STUDENT HANDLER
  // -------------------------
  const handleAddStudent = async () => {
    try {

      if (!student.phone_number) {
      toast.error('Phone number is required');
      return;
    }

      await addStudent({
        ...student,
        age: Number(student.age),
        attendance_percentage: Number(student.attendance_percentage),
        average_marks: Number(student.average_marks),
        absences_per_month: Number(student.absences_per_month),
        distance_to_school_km: Number(student.distance_to_school_km)
      });

      toast.success('Student added successfully');

      // Reset form
      setStudent({
        phone_number: '',
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
      await checkSystemState(); 
    } catch {
      toast.error('Failed to add student');
    }
  };

  const steps = [
    {
      number: 1,
      title: 'Generate Dataset',
      description: 'Create synthetic student data with 150 records',
      icon: Database,
      action: handleGenerateData,
      buttonText: 'Generate Data',
      completed: step > 1
    },
    {
      number: 2,
      title: 'Train ML Model',
      description: 'Train Random Forest model on the dataset',
      icon: Brain,
      action: handleTrainModel,
      buttonText: 'Train Model',
      completed: step > 2
    },
    {
      number: 3,
      title: 'Run Predictions',
      description: 'Generate risk predictions for all students',
      icon: Upload,
      action: handlePredict,
      buttonText: 'Run Predictions',
      completed: step > 3
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10">

      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold mb-4">Setup & Training</h1>
        <p className="text-lg text-gray-600">
          Generate data, train the model, or add students manually
        </p>
      </motion.div>

      {/* STEPS */}
      <div className="space-y-6">
        {steps.map((item, index) => {
          const Icon = item.icon;
          const isActive = step === item.number;
          const isCompleted = item.completed;

          return (
            <motion.div
              key={item.number}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-8 border-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center">
                      <Icon size={26} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>

                  <Button
                      onClick={item.action}
                      disabled={
                        loading ||
                        (item.number === 1 && hasTrainingData) ||                // Generate
                        (item.number === 2 && !hasTrainingData) ||               // Train
                        (item.number === 3 && (!hasStudents || !modelTrained))   // Predict
                      }
                    >
                      {loading ? <Loader2 className="animate-spin" /> : item.buttonText}
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* MANUAL ADD STUDENT */}
      <Card className="p-8 border-2 border-dashed">
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <UserPlus /> Add Student Manually
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {[
            ['phone_number', 'Phone Number'],
            ['age', 'Age'],
            ['attendance_percentage', 'Attendance %'],
            ['average_marks', 'Average Marks'],
            ['absences_per_month', 'Absences / Month'],
            ['distance_to_school_km', 'Distance (km)']
          ].map(([key, label]) => (
            <input
              key={key}
              placeholder={label}
              value={student[key]}
              onChange={(e) =>
                setStudent({ ...student, [key]: e.target.value })
              }
              className="border p-2 rounded"
              type={key === 'phone_number' ? 'tel' : 'text'}
            />
          ))}
        </div>
        {/* EXTRA REAL DATA INPUTS */}
        <div className="grid grid-cols-2 gap-4 mt-4">

          {/* Family Income */}
          <select
            value={student.family_income_level}
            onChange={(e) =>
              setStudent({ ...student, family_income_level: e.target.value })
            }
            className="border p-2 rounded"
          >
            <option value="Low">Family Income: Low</option>
            <option value="Medium">Family Income: Medium</option>
            <option value="High">Family Income: High</option>
          </select>

          {/* Parents Education */}
          <select
            value={student.parents_education_level}
            onChange={(e) =>
              setStudent({ ...student, parents_education_level: e.target.value })
            }
            className="border p-2 rounded"
          >
            <option value="No Education">Parents: No Education</option>
            <option value="Primary">Parents: Primary</option>
            <option value="Secondary">Parents: Secondary</option>
            <option value="Higher">Parents: Higher</option>
          </select>

          {/* Health Issues */}
          <select
            value={student.health_issues}
            onChange={(e) =>
              setStudent({ ...student, health_issues: e.target.value })
            }
            className="border p-2 rounded"
          >
            <option value="No">Health Issues: No</option>
            <option value="Yes">Health Issues: Yes</option>
          </select>

          {/* Child Labor */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={student.child_labor === 1}
              onChange={(e) =>
                setStudent({ ...student, child_labor: e.target.checked ? 1 : 0 })
              }
            />
            Child Labor
          </label>

          {/* Sibling Dropout */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={student.has_sibling_dropout === 1}
              onChange={(e) =>
                setStudent({ ...student, has_sibling_dropout: e.target.checked ? 1 : 0 })
              }
            />
            Sibling Dropped Out
          </label>

        </div>

        <Button className="mt-6" onClick={handleAddStudent} disabled={loading}>
          {loading ? <Loader2 className="animate-spin mr-2" /> : 'Add Student'}
        </Button>
      </Card>

      {/* FINISH */}
      {step > 3 && (
        <Card className="p-8 bg-green-50 border-green-200">
          <h3 className="text-2xl font-bold text-green-700">All Set 🎉</h3>
          <Button
            className="mt-4"
            onClick={() => (window.location.href = '/dashboard')}
          >
            Go to Dashboard
          </Button>
        </Card>
      )}
    </div>
  );
};

export default UploadPage;
