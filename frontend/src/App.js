import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AppProvider } from '@/context/AppContext';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import UploadPage from '@/pages/UploadPage';
import Dashboard from '@/pages/Dashboard';
import StudentList from '@/pages/StudentList';
import StudentDetail from '@/pages/StudentDetail';
import ModelInsights from '@/pages/ModelInsights';
import AlertsPage from '@/pages/AlertsPage';
import '@/App.css';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/students" element={<StudentList />} />
            <Route path="/students/:studentId" element={<StudentDetail />} />
            <Route path="/insights" element={<ModelInsights />} />
            <Route path="/alerts" element={<AlertsPage />} />
          </Routes>
        </Layout>
        <Toaster position="top-right" />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
