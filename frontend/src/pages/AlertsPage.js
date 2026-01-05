import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Bell, Loader2, CheckCircle } from 'lucide-react';
import RiskBadge from '@/components/RiskBadge';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/alerts`);
      setAlerts(response.data.alerts || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

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
          Alert Management
        </h1>
        <p className="text-lg text-gray-600">Simulated SMS/WhatsApp alerts sent to teachers and NGOs</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border border-stone-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 rounded-full p-3">
              <Bell className="text-blue-600" size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">{alerts.length}</div>
              <div className="text-sm text-gray-600">Total Alerts Sent</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-stone-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">{alerts.length}</div>
              <div className="text-sm text-gray-600">Delivered</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-stone-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-red-100 rounded-full p-3">
              <Bell className="text-red-600" size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">
                {alerts.filter(a => a.risk_level === 'High').length}
              </div>
              <div className="text-sm text-gray-600">High Risk Alerts</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Recent Alerts
        </h2>
        {alerts.length > 0 ? (
          alerts.slice().reverse().map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-6 border border-stone-200 shadow-sm hover:shadow-md transition-all duration-300" data-testid={`alert-${index}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 rounded-full p-2">
                      <Bell className="text-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">Student ID: {alert.student_id}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(alert.sent_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <RiskBadge risk={alert.risk_level} size="sm" />
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      {alert.status}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-stone-200">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>To:</strong> {alert.phone_number}
                  </p>
                  <p className="text-gray-700">{alert.message}</p>
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <Card className="p-12 text-center border border-stone-200">
            <Bell className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Alerts Yet</h3>
            <p className="text-gray-600">Send alerts from individual student pages to notify teachers and NGOs</p>
          </Card>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6 border border-stone-200 shadow-sm bg-blue-50">
          <h3 className="text-lg font-semibold text-blue-900 mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Alert System - Simulated
          </h3>
          <p className="text-sm text-blue-800">
            This is a demonstration of the alert system. In production, these alerts would be sent via SMS/WhatsApp APIs like Twilio or other messaging services.
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default AlertsPage;
