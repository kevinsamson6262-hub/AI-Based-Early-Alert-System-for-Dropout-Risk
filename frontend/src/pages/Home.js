import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, Shield, TrendingUp, Users } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Prediction',
      description: 'Machine learning model analyzes student data to predict dropout risk before it happens'
    },
    {
      icon: Shield,
      title: 'Early Intervention',
      description: 'Identify at-risk students early and take proactive measures to support them'
    },
    {
      icon: TrendingUp,
      title: 'Data Insights',
      description: 'Comprehensive analytics and visualizations to understand risk factors'
    },
    {
      icon: Users,
      title: 'Track Progress',
      description: 'Monitor interventions and measure their effectiveness over time'
    }
  ];

  return (
    <div className="space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-12 md:p-16 border border-stone-200"
      >
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
            AI-Based Early Alert System for Dropout Risk
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 mb-8 leading-relaxed">
            Empowering educators and NGOs to identify at-risk girl students and take timely action to prevent dropouts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => navigate('/upload')}
              size="lg"
              className="rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30"
              data-testid="get-started-btn"
            >
              Get Started <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button
              onClick={() => navigate('/dashboard')}
              size="lg"
              variant="outline"
              className="rounded-full border-2 border-stone-300 hover:bg-stone-50"
              data-testid="view-dashboard-btn"
            >
              View Dashboard
            </Button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <img
            src="https://images.unsplash.com/photo-1709290749293-c6152a187b14?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjBzY2hvb2wlMjBnaXJsJTIwc3R1ZGVudCUyMHN0dWR5aW5nJTIwY2xhc3Nyb29tfGVufDB8fHx8MTc2NzYyNTI1MHww&ixlib=rb-4.1.0&q=85"
            alt="Students"
            className="w-full h-full object-cover"
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-8 border border-stone-200 shadow-sm hover:shadow-md transition-all duration-300 card-hover"
              data-testid={`feature-card-${index}`}
            >
              <div className="bg-primary/10 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Icon className="text-primary" size={28} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-accent rounded-xl p-8 border border-stone-200"
      >
        <h2 className="text-2xl font-bold mb-4 text-accent-foreground" style={{ fontFamily: 'Manrope, sans-serif' }}>
          How It Works
        </h2>
        <ol className="space-y-3 text-gray-700">
          <li className="flex gap-3">
            <span className="font-bold text-primary">1.</span>
            <span>Upload or generate student data with attendance, marks, and demographics</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-primary">2.</span>
            <span>Train the Random Forest machine learning model on the dataset</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-primary">3.</span>
            <span>Get predictions categorizing students into Low, Medium, or High dropout risk</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-primary">4.</span>
            <span>Send alerts to teachers/NGOs and track interventions for at-risk students</span>
          </li>
        </ol>
      </motion.div>
    </div>
  );
};

export default Home;
