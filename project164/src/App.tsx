import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import ApplicationList from "@/pages/Applications/ApplicationList";
import ApplicationDetail from "@/pages/Applications/ApplicationDetail";
import ApplicationCompare from "@/pages/Applications/ApplicationCompare";
import DocumentList from "@/pages/Documents/DocumentList";
import DocumentDetail from "@/pages/Documents/DocumentDetail";
import MaterialList from "@/pages/Materials/MaterialList";
import RecommenderList from "@/pages/Materials/RecommenderList";
import FinanceOverview from "@/pages/Finance/FinanceOverview";
import ScholarshipList from "@/pages/Finance/ScholarshipList";
import ExpenseList from "@/pages/Finance/ExpenseList";

export default function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/applications" element={<ApplicationList />} />
          <Route path="/applications/compare" element={<ApplicationCompare />} />
          <Route path="/applications/:id" element={<ApplicationDetail />} />
          <Route path="/documents" element={<DocumentList />} />
          <Route path="/documents/:id" element={<DocumentDetail />} />
          <Route path="/materials" element={<MaterialList />} />
          <Route path="/materials/recommenders" element={<RecommenderList />} />
          <Route path="/finance" element={<FinanceOverview />} />
          <Route path="/finance/scholarships" element={<ScholarshipList />} />
          <Route path="/finance/expenses" element={<ExpenseList />} />
          <Route
            path="*"
            element={
              <div className="flex flex-col items-center justify-center py-24">
                <div className="text-7xl mb-6">🎓</div>
                <h1 className="text-3xl font-serif font-bold text-slate-800 mb-2">404</h1>
                <p className="text-slate-500 mb-6">你访问的页面不存在</p>
                <a href="/" className="btn-primary">
                  返回仪表盘
                </a>
              </div>
            }
          />
        </Routes>
      </AppLayout>
    </Router>
  );
}
