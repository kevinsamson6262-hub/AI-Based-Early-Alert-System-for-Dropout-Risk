import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RiskBadge from '@/components/RiskBadge';
import { ArrowLeft, Bell, Plus, Loader2, User, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/context/AppContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const StudentDetail = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { sendAlert, createIntervention } = useApp();
  const [student, setStudent] = useState(null);
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [showInterventionForm, setShowInterventionForm] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('+91 9876543210');
  const [interventionType, setInterventionType] = useState('Counselling');
  const [interventionNotes, setInterventionNotes] = useState('');

  useEffect(() => {
    fetchStudentDetails();
  }, [studentId]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/students/${studentId}`);
      setStudent(response.data.student);
      setInterventions(response.data.interventions || []);
    } catch (error) {
      toast.error('Failed to fetch student details');
    } finally {
      setLoading(false);
    }
  };

  const handleSendAlert = async () => {
    try {
      const risk = student.predicted_risk || student.dropout_risk;
      const factors = student.risk_factors?.join(', ') || 'various risk factors';
      const message = `⚠️ Student ID ${studentId} is at ${risk} risk of dropout due to ${factors}.`;

      await sendAlert({
        student_id: studentId,
        risk_level: risk,
        phone_number: phoneNumber,
        message: message
      });

      toast.success('Alert sent successfully');
      setShowAlertForm(false);
    } catch (error) {
      toast.error('Failed to send alert');
    }
  };

  const handleAddIntervention = async () => {
    try {
      await createIntervention({
        student_id: studentId,
        intervention_type: interventionType,
        notes: interventionNotes
      });

      toast.success('Intervention recorded');
      setShowInterventionForm(false);
      setInterventionNotes('');
      fetchStudentDetails();
    } catch (error) {
      toast.error('Failed to record intervention');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!student) {
    return <div className="text-center py-20">Student not found</div>;
  }

  const risk = student.predicted_risk || student.dropout_risk;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Button
        onClick={() => navigate('/students')}
        variant="ghost"
        className="mb-4"
        data-testid="back-button"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Students
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-8 border border-stone-200 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 rounded-full p-4">
                <User className="text-primary" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {studentId}
                </h1>
                <p className="text-gray-600">Student Profile</p>
              </div>
            </div>
            <RiskBadge risk={risk} size="lg" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground mb-3">Personal Information</h3>
              <div className="space-y-2">
                <InfoRow label="Age" value={`${student.age} years`} />
                <InfoRow label="Family Income" value={student.family_income_level} />
                <InfoRow label="Parents Education" value={student.parents_education_level} />
                <InfoRow label="Distance to School" value={`${student.distance_to_school_km?.toFixed(1)} km`} />
                <InfoRow label="Health Issues" value={student.health_issues} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground mb-3">Academic Performance</h3>
              <div className="space-y-2">
                <InfoRow label="Attendance" value={`${student.attendance_percentage?.toFixed(1)}%`} />
                <InfoRow label="Average Marks" value={`${student.average_marks?.toFixed(1)}%`} />
                <InfoRow label="Absences/Month" value={student.absences_per_month} />
                {student.confidence && (
                  <InfoRow label="Prediction Confidence" value={`${(student.confidence * 100).toFixed(1)}%`} />
                )}
              </div>
            </div>
          </div>

          {student.risk_factors && student.risk_factors.length > 0 && (
            <div className="mt-6 pt-6 border-t border-stone-200">
              <h3 className="text-lg font-semibold text-foreground mb-3">Identified Risk Factors</h3>
              <div className="flex flex-wrap gap-2">
                {student.risk_factors.map((factor, index) => (
                  <span
                    key={index}
                    className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm"
                    data-testid={`risk-factor-${index}`}
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 border border-stone-200 shadow-sm" data-testid="alert-section">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-foreground" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Send Alert
              </h3>
              <Bell className="text-primary" size={24} />
            </div>
            {!showAlertForm ? (
              <Button
                onClick={() => setShowAlertForm(true)}
                className="w-full rounded-full bg-primary hover:bg-primary/90 text-white"
                data-testid="send-alert-btn"
              >
                Send Alert to Teacher/NGO
              </Button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg"
                      data-testid="phone-input"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSendAlert} className="flex-1 rounded-full bg-primary hover:bg-primary/90" data-testid="confirm-alert-btn">
                    Confirm Send
                  </Button>
                  <Button onClick={() => setShowAlertForm(false)} variant="outline" className="flex-1 rounded-full" data-testid="cancel-alert-btn">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 border border-stone-200 shadow-sm" data-testid="intervention-section">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-foreground" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Record Intervention
              </h3>
              <Plus className="text-primary" size={24} />
            </div>
            {!showInterventionForm ? (
              <Button
                onClick={() => setShowInterventionForm(true)}
                className="w-full rounded-full bg-secondary hover:bg-secondary/90 text-white"
                data-testid="add-intervention-btn"
              >
                Add Intervention
              </Button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Intervention Type</label>
                  <Select value={interventionType} onValueChange={setInterventionType}>
                    <SelectTrigger data-testid="intervention-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Counselling">Counselling</SelectItem>
                      <SelectItem value="Financial Aid">Financial Aid</SelectItem>
                      <SelectItem value="Health Support">Health Support</SelectItem>
                      <SelectItem value="Academic Tutoring">Academic Tutoring</SelectItem>
                      <SelectItem value="Parent Meeting">Parent Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Notes</label>
                  <Textarea
                    value={interventionNotes}
                    onChange={(e) => setInterventionNotes(e.target.value)}
                    placeholder="Add notes about the intervention..."
                    rows={3}
                    data-testid="intervention-notes"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddIntervention} className="flex-1 rounded-full bg-secondary hover:bg-secondary/90" data-testid="save-intervention-btn">
                    Save
                  </Button>
                  <Button onClick={() => setShowInterventionForm(false)} variant="outline" className="flex-1 rounded-full">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6 border border-stone-200 shadow-sm">
          <h3 className="text-xl font-semibold text-foreground mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Intervention History
          </h3>
          {interventions.length > 0 ? (
            <div className="space-y-3">
              {interventions.map((intervention, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg border border-stone-200"
                  data-testid={`intervention-${index}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{intervention.intervention_type}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(intervention.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {intervention.notes && <p className="text-sm text-gray-600">{intervention.notes}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No interventions recorded yet</p>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-stone-100">
    <span className="text-gray-600">{label}:</span>
    <span className="font-medium text-foreground">{value}</span>
  </div>
);

export default StudentDetail;
