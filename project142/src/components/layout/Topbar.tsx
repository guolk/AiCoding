import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, Settings, Download, Upload } from 'lucide-react';
import { formatDateCN } from '../../utils/helpers';
import { exportToJson } from '../../utils/helpers';
import { useStudentStore } from '../../store/useStudentStore';

const Topbar: React.FC = () => {
  const { students } = useStudentStore();

  const handleExport = () => {
    const data = {
      students,
      exportedAt: new Date().toISOString()
    };
    exportToJson(data, 'class_data');
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40"
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索学生姓名、学号..."
            className="pl-10 pr-4 py-2 bg-slate-100/50 rounded-lg text-sm w-80 focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="mr-4 text-right">
          <p className="text-sm font-medium text-slate-700">{formatDateCN(new Date())}</p>
          <p className="text-xs text-slate-500">
            {new Date().toLocaleDateString('zh-CN', { weekday: 'long' })}
          </p>
        </div>

        <button 
          onClick={handleExport}
          className="p-2.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all"
          title="导出数据"
        >
          <Download size={19} />
        </button>

        <button 
          className="p-2.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all"
          title="导入数据"
        >
          <Upload size={19} />
        </button>

        <button 
          className="p-2.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all relative"
          title="通知"
        >
          <Bell size={19} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <button 
          className="p-2.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all"
          title="设置"
        >
          <Settings size={19} />
        </button>
      </div>
    </motion.header>
  );
};

export default Topbar;
