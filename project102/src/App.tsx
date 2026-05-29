import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/Layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import EquipmentList from '@/pages/Equipment/EquipmentList';
import EquipmentForm from '@/pages/Equipment/EquipmentForm';
import EquipmentDetail from '@/pages/Equipment/EquipmentDetail';
import InspectionStandards from '@/pages/Inspection/InspectionStandards';
import InspectionTasks from '@/pages/Inspection/InspectionTasks';
import InspectionRecords from '@/pages/Inspection/InspectionRecords';
import WorkOrderList from '@/pages/WorkOrder/WorkOrderList';
import WorkOrderForm from '@/pages/WorkOrder/WorkOrderForm';
import WorkOrderDetail from '@/pages/WorkOrder/WorkOrderDetail';
import LubricationPoints from '@/pages/Lubrication/LubricationPoints';
import LubricationRecords from '@/pages/Lubrication/LubricationRecords';
import FailureStatistics from '@/pages/Statistics/FailureStatistics';
import CostAnalysis from '@/pages/Statistics/CostAnalysis';
import CompletionRate from '@/pages/Statistics/CompletionRate';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/equipment" element={<EquipmentList />} />
          <Route path="/equipment/new" element={<EquipmentForm />} />
          <Route path="/equipment/:id" element={<EquipmentDetail />} />
          <Route path="/equipment/:id/edit" element={<EquipmentForm />} />
          <Route path="/inspection/standards" element={<InspectionStandards />} />
          <Route path="/inspection/tasks" element={<InspectionTasks />} />
          <Route path="/inspection/records" element={<InspectionRecords />} />
          <Route path="/workorders" element={<WorkOrderList />} />
          <Route path="/workorders/new" element={<WorkOrderForm />} />
          <Route path="/workorders/:id" element={<WorkOrderDetail />} />
          <Route path="/lubrication/points" element={<LubricationPoints />} />
          <Route path="/lubrication/records" element={<LubricationRecords />} />
          <Route path="/statistics/failure" element={<FailureStatistics />} />
          <Route path="/statistics/cost" element={<CostAnalysis />} />
          <Route path="/statistics/completion" element={<CompletionRate />} />
        </Route>
      </Routes>
    </Router>
  );
}
