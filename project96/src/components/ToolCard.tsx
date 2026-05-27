

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  color: string;
}

const ToolCard: React.FC<ToolCardProps> = ({ title, description, icon: Icon, path, color }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(path)}
      className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-gray-100"
    >
      <div className={`w-14 h-14 rounded-lg flex items-center justify-center mb-4`} style={{ backgroundColor: color }}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
};

export default ToolCard;

