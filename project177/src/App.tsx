import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useEventStore } from "@/store";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import EventInfo from "@/pages/EventInfo";
import EventRoute from "@/pages/EventRoute";
import EventVolunteers from "@/pages/EventVolunteers";
import RegistrationList from "@/pages/RegistrationList";
import RegistrationBibs from "@/pages/RegistrationBibs";
import RegistrationPickup from "@/pages/RegistrationPickup";
import TimingRecord from "@/pages/TimingRecord";
import TimingResults from "@/pages/TimingResults";
import AwardsSettings from "@/pages/AwardsSettings";
import AwardsWinners from "@/pages/AwardsWinners";
import AwardsPrizes from "@/pages/AwardsPrizes";
import AnalysisFinish from "@/pages/AnalysisFinish";
import AnalysisTiming from "@/pages/AnalysisTiming";
import AnalysisSurvey from "@/pages/AnalysisSurvey";

export default function App() {
  const initMockData = useEventStore((s) => s.initMockData);

  useEffect(() => {
    initMockData();
  }, [initMockData]);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/event/info" element={<EventInfo />} />
          <Route path="/event/route" element={<EventRoute />} />
          <Route path="/event/volunteers" element={<EventVolunteers />} />

          <Route path="/registration/list" element={<RegistrationList />} />
          <Route path="/registration/bibs" element={<RegistrationBibs />} />
          <Route path="/registration/pickup" element={<RegistrationPickup />} />

          <Route path="/timing/record" element={<TimingRecord />} />
          <Route path="/timing/results" element={<TimingResults />} />

          <Route path="/awards/settings" element={<AwardsSettings />} />
          <Route path="/awards/winners" element={<AwardsWinners />} />
          <Route path="/awards/prizes" element={<AwardsPrizes />} />

          <Route path="/analysis/finish" element={<AnalysisFinish />} />
          <Route path="/analysis/timing" element={<AnalysisTiming />} />
          <Route path="/analysis/survey" element={<AnalysisSurvey />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
