import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useStudentStore } from '../../store/useStudentStore';
import { useAttendanceStore } from '../../store/useAttendanceStore';
import { useGradeStore } from '../../store/useGradeStore';
import { useClassroomStore } from '../../store/useClassroomStore';
import { useCommunicationStore } from '../../store/useCommunicationStore';

const Layout: React.FC = () => {
  const initStudents = useStudentStore(state => state.initData);
  const initAttendance = useAttendanceStore(state => state.initData);
  const initGrades = useGradeStore(state => state.initData);
  const initClassroom = useClassroomStore(state => state.initData);
  const initCommunication = useCommunicationStore(state => state.initData);

  useEffect(() => {
    const initAll = async () => {
      await Promise.all([
        initStudents(),
        initAttendance(),
        initGrades(),
        initClassroom(),
        initCommunication()
      ]);
    };
    initAll();
  }, [initStudents, initAttendance, initGrades, initClassroom, initCommunication]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      <Sidebar />
      <div className="ml-64">
        <Topbar />
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="p-8 min-h-[calc(100vh-4rem)]"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
};

export default Layout;
