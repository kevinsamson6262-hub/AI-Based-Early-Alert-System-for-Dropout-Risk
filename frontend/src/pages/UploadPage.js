import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import { Upload, Database, Brain, Loader2 } from 'lucide-react';

const UploadPage = () => {
  const { generateDataset, trainModel, predictBatch, loading } = useApp();
  const [step, setStep] = useState(1);

  const handleGenerateData = async () => {
    try {
      const result = await generateDataset(150);
      toast.success(`Generated ${result.total_records} student records`);
      setStep(2);
    } catch (error) {
      toast.error('Failed to generate dataset');
    }
  };

  const handleTrainModel = async () => {
    try {
      const result = await trainModel();
      toast.success(`Model trained with ${(result.metrics.accuracy * 100).toFixed(2)}% accuracy`);
      setStep(3);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to train model');
    }
  };

  const handlePredict = async () => {
    try {
      const result = await predictBatch();
      toast.success(`Predictions completed for ${result.total_predictions} students`);
      setStep(4);
    } catch (error) {
      toast.error('Failed to generate predictions');
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
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-foreground mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Setup & Training
        </h1>
        <p className="text-lg text-gray-600">
          Follow these steps to generate data, train the model, and get predictions
        </p>
      </motion.div>

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
              <Card
                className={`p-8 border-2 transition-all duration-300 ${
                  isActive
                    ? 'border-primary shadow-lg'
                    : isCompleted
                    ? 'border-green-500 bg-green-50'
                    : 'border-stone-200'
                }`}
                data-testid={`step-${item.number}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isActive
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isCompleted ? (
                        <span className="text-2xl">✓</span>
                      ) : (
                        <Icon size={28} strokeWidth={1.5} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-foreground mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        {item.title}
                      </h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <div>
                    {!isCompleted && isActive && (
                      <Button
                        onClick={item.action}
                        disabled={loading}
                        size="lg"
                        className="rounded-full bg-primary hover:bg-primary/90 text-white"
                        data-testid={`btn-${item.number}`}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 animate-spin" size={20} />
                            Processing...
                          </>
                        ) : (
                          item.buttonText
                        )}
                      </Button>
                    )}
                    {isCompleted && (
                      <span className="text-green-600 font-medium">Completed ✓</span>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {step > 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 border-2 border-green-200"
        >
          <h3 className="text-2xl font-bold text-green-700 mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>
            All Set! 🎉
          </h3>
          <p className="text-gray-700 mb-4">
            Your model is trained and predictions are ready. View the dashboard to see risk analysis.
          </p>
          <Button
            onClick={() => window.location.href = '/dashboard'}
            size="lg"
            className="rounded-full bg-primary hover:bg-primary/90 text-white"
            data-testid="go-to-dashboard-btn"
          >
            Go to Dashboard
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default UploadPage;
