import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

const RiskBadge = ({ risk, size = 'md', showIcon = true }) => {
  const colors = {
    High: 'bg-risk-high text-white',
    Medium: 'bg-risk-medium text-white',
    Low: 'bg-risk-low text-white'
  };

  const icons = {
    High: AlertTriangle,
    Medium: AlertCircle,
    Low: CheckCircle
  };

  const sizes = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const Icon = icons[risk];

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${colors[risk]} ${sizes[size]}`}
      data-testid={`risk-badge-${risk.toLowerCase()}`}
    >
      {showIcon && Icon && <Icon size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />}
      {risk} Risk
    </motion.span>
  );
};

export default RiskBadge;
