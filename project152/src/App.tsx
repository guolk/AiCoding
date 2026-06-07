import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout";
import { DashboardPage } from "@/pages/Dashboard";
import { PatentList, PatentDetail, PatentForm, AnnuityManagement } from "@/pages/Patents";
import { TrademarkList, TrademarkForm } from "@/pages/Trademarks";
import { CopyrightList, CopyrightForm } from "@/pages/Copyrights";
import { GeoAnalysisPage } from "@/pages/GeoAnalysis";
import { CompetitorPatents, PatentMap, InfringementAssessment } from "@/pages/Competitors";
import { LicenseList, LicenseForm } from "@/pages/Licenses";
import { TransferList, TransferForm } from "@/pages/Transfers";
import { PledgeList, PledgeForm } from "@/pages/Pledge";
import { ValuationPage } from "@/pages/Valuation";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          
          <Route path="patents">
            <Route index element={<PatentList />} />
            <Route path="new" element={<PatentForm />} />
            <Route path=":id" element={<PatentDetail />} />
            <Route path=":id/edit" element={<PatentForm />} />
            <Route path="annuity" element={<AnnuityManagement />} />
          </Route>
          
          <Route path="trademarks">
            <Route index element={<TrademarkList />} />
            <Route path="new" element={<TrademarkForm />} />
            <Route path=":id/edit" element={<TrademarkForm />} />
          </Route>
          
          <Route path="copyrights">
            <Route index element={<CopyrightList />} />
            <Route path="new" element={<CopyrightForm />} />
            <Route path=":id/edit" element={<CopyrightForm />} />
          </Route>
          
          <Route path="geo-analysis" element={<GeoAnalysisPage />} />
          
          <Route path="competitors">
            <Route path="patents" element={<CompetitorPatents />} />
            <Route path="map" element={<PatentMap />} />
            <Route path="infringement" element={<InfringementAssessment />} />
          </Route>
          
          <Route path="licenses">
            <Route index element={<LicenseList />} />
            <Route path="new" element={<LicenseForm />} />
            <Route path=":id/edit" element={<LicenseForm />} />
          </Route>
          
          <Route path="transfers">
            <Route index element={<TransferList />} />
            <Route path="new" element={<TransferForm />} />
            <Route path=":id/edit" element={<TransferForm />} />
          </Route>
          
          <Route path="pledge">
            <Route index element={<PledgeList />} />
            <Route path="new" element={<PledgeForm />} />
            <Route path=":id/edit" element={<PledgeForm />} />
          </Route>
          
          <Route path="valuation" element={<ValuationPage />} />
          
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
              <h1 className="text-6xl font-bold text-slate-300">404</h1>
              <p className="text-slate-500">页面不存在</p>
            </div>
          } />
        </Route>
      </Routes>
    </Router>
  );
}
