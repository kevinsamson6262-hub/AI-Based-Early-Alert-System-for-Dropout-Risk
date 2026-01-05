import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Brain, Loader2, TrendingUp } from 'lucide-react';

const ModelInsights = () => {
  const { modelMetrics, fetchModelMetrics, loading } = useApp();
  const [featureData, setFeatureData] = useState([]);

  useEffect(() => {
    fetchModelMetrics();
  }, []);

  useEffect(() => {
    if (modelMetrics?.feature_importance) {
      setFeatureData(modelMetrics.feature_importance.slice(0, 8));
    }
  }, [modelMetrics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!modelMetrics) {
    return (
      <div className="text-center py-20">
        <Brain className="mx-auto text-gray-400 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Model Not Trained</h2>
        <p className="text-gray-600">Please train the model first</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-foreground mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Model Insights
        </h1>
        <p className="text-lg text-gray-600">Performance metrics and feature analysis</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8 border border-stone-200 shadow-sm" data-testid="accuracy-card">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-green-100 rounded-full p-3">
                <TrendingUp className="text-green-600" size={28} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700">Model Accuracy</h3>
              </div>
            </div>
            <div className="text-5xl font-bold text-green-600" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {(modelMetrics.accuracy * 100).toFixed(2)}%
            </div>
            <p className="text-sm text-gray-600 mt-2">Random Forest Classifier</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8 border border-stone-200 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 rounded-full p-3">
                <Brain className="text-blue-600" size={28} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700">Model Type</h3>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Algorithm:</span>
                <span className="font-medium">Random Forest</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estimators:</span>
                <span className="font-medium">100 Trees</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Depth:</span>
                <span className="font-medium">10 Levels</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-8 border border-stone-200 shadow-sm">
          <h3 className="text-2xl font-semibold mb-6 text-foreground" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Feature Importance
          </h3>
          <p className="text-gray-600 mb-6">Factors that most influence dropout risk prediction</p>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={featureData} layout="vertical" margin={{ left: 150 }}>
              <XAxis type="number" stroke="#6B7280" />
              <YAxis type="category" dataKey="feature" stroke="#6B7280" />
              <Tooltip />
              <Legend />
              <Bar dataKey="importance" name="Importance Score" fill="#C05621" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {modelMetrics.confusion_matrix && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-8 border border-stone-200 shadow-sm" data-testid="confusion-matrix-card">
            <h3 className="text-2xl font-semibold mb-6 text-foreground" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Confusion Matrix
            </h3>
            <p className="text-gray-600 mb-6">Model prediction accuracy across risk categories</p>
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr>
                    <th className="p-4 bg-gray-100 border border-stone-200">Actual \ Predicted</th>
                    <th className="p-4 bg-gray-100 border border-stone-200">High</th>
                    <th className="p-4 bg-gray-100 border border-stone-200">Low</th>
                    <th className="p-4 bg-gray-100 border border-stone-200">Medium</th>
                  </tr>
                </thead>
                <tbody>
                  {modelMetrics.confusion_matrix.map((row, i) => (
                    <tr key={i}>
                      <td className="p-4 bg-gray-50 border border-stone-200 font-medium">
                        {['High', 'Low', 'Medium'][i]}
                      </td>
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          className={`p-4 border border-stone-200 font-semibold ${
                            i === j ? 'bg-green-100 text-green-700' : 'bg-white'
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-8 border border-stone-200 shadow-sm bg-accent">
          <h3 className="text-xl font-semibold mb-4 text-accent-foreground" style={{ fontFamily: 'Manrope, sans-serif' }}>
            ML Approach Explained
          </h3>
          <div className="space-y-3 text-gray-700">
            <p>
              <strong>Random Forest Classifier:</strong> An ensemble learning method that constructs multiple decision trees and outputs the class with the most votes.
            </p>
            <p>
              <strong>Features Used:</strong> Age, attendance percentage, average marks, absences per month, family income level, parents' education, distance to school, and health issues.
            </p>
            <p>
              <strong>Training Process:</strong> Data is preprocessed, categorical variables are encoded, and the model learns patterns from 80% of the data, validated on the remaining 20%.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ModelInsights;
