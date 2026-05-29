import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useEquipmentStore } from '@/store/equipmentStore';
import { useInspectionStore } from '@/store/inspectionStore';
import { useWorkOrderStore } from '@/store/workOrderStore';
import { useLubricationStore } from '@/store/lubricationStore';

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const initEquipment = useEquipmentStore((s) => s.initializeData);
  const initInspection = useInspectionStore((s) => s.initializeData);
  const initWorkOrder = useWorkOrderStore((s) => s.initializeData);
  const initLubrication = useLubricationStore((s) => s.initializeData);
  const generateDailyTasks = useInspectionStore((s) => s.generateDailyTasks);

  useEffect(() => {
    initEquipment();
    initInspection();
    initWorkOrder();
    initLubrication();
    generateDailyTasks();
  }, [initEquipment, initInspection, initWorkOrder, initLubrication, generateDailyTasks]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
