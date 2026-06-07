import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Stores from "@/pages/Stores";
import { DataEntry } from "@/pages/Stores/DataEntry";
import { Analysis } from "@/pages/Stores/Analysis";
import Advertising from "@/pages/Advertising";
import { Campaigns } from "@/pages/Advertising/Campaigns";
import { Bidding } from "@/pages/Advertising/Bidding";
import { ROI } from "@/pages/Advertising/ROI";
import Products from "@/pages/Products";
import { Lifecycle } from "@/pages/Products/Lifecycle";
import { Keywords } from "@/pages/Products/Keywords";
import { Reviews } from "@/pages/Products/Reviews";
import Strategy from "@/pages/Strategy";
import { Pricing } from "@/pages/Strategy/Pricing";
import { Promotions } from "@/pages/Strategy/Promotions";
import Inventory from "@/pages/Inventory";
import Stock from "@/pages/Inventory/Stock";
import Logistics from "@/pages/Inventory/Logistics";
import Planning from "@/pages/Inventory/Planning";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/stores" element={<Stores />}>
            <Route index element={<Navigate to="data-entry" replace />} />
            <Route path="data-entry" element={<DataEntry />} />
            <Route path="analysis" element={<Analysis />} />
          </Route>
          <Route path="/products" element={<Products />}>
            <Route index element={<Navigate to="lifecycle" replace />} />
            <Route path="lifecycle" element={<Lifecycle />} />
            <Route path="keywords" element={<Keywords />} />
            <Route path="reviews" element={<Reviews />} />
          </Route>
          <Route path="/advertising" element={<Advertising />}>
            <Route index element={<Navigate to="campaigns" replace />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="bidding" element={<Bidding />} />
            <Route path="roi" element={<ROI />} />
          </Route>
          <Route path="/inventory" element={<Inventory />}>
            <Route index element={<Navigate to="stock" replace />} />
            <Route path="stock" element={<Stock />} />
            <Route path="logistics" element={<Logistics />} />
            <Route path="planning" element={<Planning />} />
          </Route>
          <Route path="/strategy" element={<Strategy />}>
            <Route index element={<Navigate to="pricing" replace />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="promotions" element={<Promotions />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}
