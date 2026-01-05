import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AppContext = createContext();

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AppProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/students`);
      setStudents(response.data.students || []);
      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/stats`);
      setStats(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  };

  const fetchModelMetrics = async () => {
    try {
      const response = await axios.get(`${API}/model/metrics`);
      setModelMetrics(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching metrics:', error);
      throw error;
    }
  };

  const generateDataset = async (nSamples = 150) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API}/dataset/generate?n_samples=${nSamples}`);
      await fetchStudents();
      return response.data;
    } catch (error) {
      console.error('Error generating dataset:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

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

  const sendAlert = async (alertData) => {
    try {
      const response = await axios.post(`${API}/alerts/send`, alertData);
      return response.data;
    } catch (error) {
      console.error('Error sending alert:', error);
      throw error;
    }
  };

  const createIntervention = async (interventionData) => {
    try {
      const response = await axios.post(`${API}/interventions`, interventionData);
      return response.data;
    } catch (error) {
      console.error('Error creating intervention:', error);
      throw error;
    }
  };

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
    sendAlert,
    createIntervention
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
