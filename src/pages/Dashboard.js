import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';
import RiskBadge from '@/components/RiskBadge';

const Dashboard = () => {
  const { stats, fetchStats, loading } = useApp();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (stats?.risk_distribution) {
      const data = Object.entries(stats.risk_distribution).map(([key, value]) => ({
        name: key,
        value: value,
        fill: key === 'High' ? '#DC2626' : key === 'Medium' ? '#D97706' : '#059669'
      }));
      setChartData(data);
    }
  }, [stats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

    if (!stats || stats.total_students === 0) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="mx-auto text-gray-400 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">No Data Available</h2>
        <p className="text-gray-600">Please upload or generate a dataset first</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Students',
      value: stats.total_students,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'High Risk',
      value: stats.risk_distribution?.High || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Avg Attendance',
      value: `${stats.average_attendance?.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Avg Marks',
      value: `${stats.average_marks?.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-foreground mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Risk Dashboard
        </h1>
        <p className="text-lg text-gray-600">Overview of student dropout risk analysis</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 border border-stone-200 shadow-sm hover:shadow-md transition-all duration-300" data-testid={`stat-card-${index}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.bgColor} rounded-full p-3`}>
                    <Icon className={stat.color} size={24} strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-8 border border-stone-200 shadow-sm" data-testid="pie-chart-card">
            <h3 className="text-2xl font-semibold mb-6 text-foreground" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Risk Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-8 border border-stone-200 shadow-sm" data-testid="bar-chart-card">
            <h3 className="text-2xl font-semibold mb-6 text-foreground" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Student Count by Risk Level
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Students" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-8 border border-stone-200 shadow-sm">
          <h3 className="text-2xl font-semibold mb-4 text-foreground" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Risk Categories Explained
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="flex flex-col gap-3">
              <RiskBadge risk="High" size="lg" />
              <p className="text-sm text-gray-600">
                Students with multiple risk factors including low attendance (&lt;60%), declining marks, and other indicators
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <RiskBadge risk="Medium" size="lg" />
              <p className="text-sm text-gray-600">
                Students showing some concerning patterns that require monitoring and support
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <RiskBadge risk="Low" size="lg" />
              <p className="text-sm text-gray-600">
                Students with good attendance, performance, and minimal risk factors
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
