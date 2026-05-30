import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/pages/Dashboard";
import { Papers } from "@/pages/Papers";
import { Citations } from "@/pages/Citations";
import { Impact } from "@/pages/Impact";
import { Outreach } from "@/pages/Outreach";
import { Applications } from "@/pages/Applications";
import { Settings } from "@/pages/Settings";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/papers" element={<Papers />} />
          <Route path="/citations" element={<Citations />} />
          <Route path="/impact" element={<Impact />} />
          <Route path="/outreach" element={<Outreach />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}
