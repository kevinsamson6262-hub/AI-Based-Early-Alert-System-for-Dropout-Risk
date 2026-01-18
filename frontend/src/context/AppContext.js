import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const AppContext = createContext();

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AppProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // ------------------------------------
  // FETCH STUDENTS
  // ------------------------------------
  const fetchStudents = async () => {
  try {
    setLoading(true);
    console.log("Fetching students from:", `${API}/students`);

    const res = await axios.get(`${API}/students`);

    console.log("API RESPONSE:", res.data);

    setStudents(res.data.students || []);
  } catch (error) {
    console.error('Failed to fetch students', error);
    setStudents([]);
  } finally {
    setLoading(false);
  }
};

  // ------------------------------------
  // FETCH STATS
  // ------------------------------------
  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/stats`);
      setStats(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }, []);

  // ------------------------------------
  // FETCH MODEL METRICS
  // ------------------------------------
  const fetchModelMetrics = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/model/metrics`);
      setModelMetrics(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching metrics:', error);
      throw error;
    }
  }, []);

  // ------------------------------------
  // GENERATE DATASET
  // ------------------------------------
  const generateDataset = async (nSamples = 150) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API}/dataset/generate?n_samples=${nSamples}`
      );
      await fetchStudents();
      await fetchStats();
      return response.data;
    } catch (error) {
      console.error('Error generating dataset:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------
  // TRAIN MODEL
  // ------------------------------------
  const trainModel = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API}/model/train`);
      await fetchModelMetrics();
      return response.data;
    } catch (error) {
      console.error('Error training model:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------
  // BATCH PREDICTION
  // ------------------------------------
  const predictBatch = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API}/predict/batch`);
      await fetchStudents();
      await fetchStats();
      return response.data;
    } catch (error) {
      console.error('Error predicting batch:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------
  // ADD STUDENT
  // ------------------------------------
  const addStudent = async (studentData) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API}/students`, studentData);
      await fetchStudents();
      return response.data;
    } catch (error) {
      console.error('Error adding student:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------
  // SEND ALERT
  // ------------------------------------
  const sendAlert = async (alertData) => {
    try {
      const response = await axios.post(`${API}/alerts/send`, alertData);
      return response.data;
    } catch (error) {
      console.error('Error sending alert:', error);
      throw error;
    }
  };

  // ------------------------------------
  // CREATE INTERVENTION
  // ------------------------------------
  const createIntervention = async (interventionData) => {
    try {
      const response = await axios.post(`${API}/interventions`, interventionData);
      return response.data;
    } catch (error) {
      console.error('Error creating intervention:', error);
      throw error;
    }
  };

  // ------------------------------------
  // CONTEXT VALUE
  // ------------------------------------
  const value = {
    students,
    modelMetrics,
    stats,
    loading,
    fetchStudents,
    fetchStats,
    fetchModelMetrics,
    generateDataset,
    trainModel,
    predictBatch,
    addStudent,
    sendAlert,
    createIntervention
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
