import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "@/components/Layout/Navigation";
import Home from "@/pages/Home";
import PaceCalculator from "@/pages/PaceCalculator";
import RaceStrategy from "@/pages/RaceStrategy";
import Training from "@/pages/Training";
import RaceReview from "@/pages/RaceReview";
import Prediction from "@/pages/Prediction";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <AppLayout>
            <Home />
          </AppLayout>
        } />
        <Route path="/pace-calculator" element={
          <AppLayout>
            <PaceCalculator />
          </AppLayout>
        } />
        <Route path="/race-strategy" element={
          <AppLayout>
            <RaceStrategy />
          </AppLayout>
        } />
        <Route path="/training" element={
          <AppLayout>
            <Training />
          </AppLayout>
        } />
        <Route path="/race-review" element={
          <AppLayout>
            <RaceReview />
          </AppLayout>
        } />
        <Route path="/prediction" element={
          <AppLayout>
            <Prediction />
          </AppLayout>
        } />
      </Routes>
    </Router>
  );
}
