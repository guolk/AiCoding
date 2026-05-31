import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import Dashboard from "@/pages/Dashboard/Dashboard";
import Collections from "@/pages/Collections/Collections";
import MediaDetail from "@/pages/Collections/MediaDetail";
import MediaForm from "@/pages/Collections/MediaForm";
import Storage from "@/pages/Storage/Storage";
import ValueTracking from "@/pages/ValueTracking/ValueTracking";
import Wishlist from "@/pages/Wishlist/Wishlist";
import Reviews from "@/pages/Reviews/Reviews";
import Settings from "@/pages/Settings/Settings";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="collections" element={<Collections />} />
          <Route path="collections/add" element={<MediaForm />} />
          <Route path="collections/:id" element={<MediaDetail />} />
          <Route path="collections/:id/edit" element={<MediaForm />} />
          <Route path="storage" element={<Storage />} />
          <Route path="value" element={<ValueTracking />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}
