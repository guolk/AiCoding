import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import RelicList from "@/pages/RelicList";
import RelicForm from "@/pages/RelicForm";
import ResearchNoteList from "@/pages/ResearchNoteList";
import ResearchNoteForm from "@/pages/ResearchNoteForm";
import TypeAnalysisList from "@/pages/TypeAnalysisList";
import TypeAnalysisForm from "@/pages/TypeAnalysisForm";
import MaterialList from "@/pages/MaterialList";
import MaterialForm from "@/pages/MaterialForm";
import OutputList from "@/pages/OutputList";
import OutputForm from "@/pages/OutputForm";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/relics" element={<RelicList />} />
          <Route path="/relics/new" element={<RelicForm />} />
          <Route path="/relics/:id" element={<RelicForm />} />
          <Route path="/relics/:id/edit" element={<RelicForm />} />
          <Route path="/notes" element={<ResearchNoteList />} />
          <Route path="/notes/new" element={<ResearchNoteForm />} />
          <Route path="/notes/:id" element={<ResearchNoteForm />} />
          <Route path="/notes/:id/edit" element={<ResearchNoteForm />} />
          <Route path="/analysis" element={<TypeAnalysisList />} />
          <Route path="/analysis/new" element={<TypeAnalysisForm />} />
          <Route path="/analysis/:id/edit" element={<TypeAnalysisForm />} />
          <Route path="/materials" element={<MaterialList />} />
          <Route path="/materials/new" element={<MaterialForm />} />
          <Route path="/materials/:id/edit" element={<MaterialForm />} />
          <Route path="/outputs" element={<OutputList />} />
          <Route path="/outputs/new" element={<OutputForm />} />
          <Route path="/outputs/:id/edit" element={<OutputForm />} />
          <Route path="*" element={<div className="text-center py-20 text-ink-light"><h1 className="text-2xl font-bold text-ink mb-2">404</h1><p>页面未找到</p></div>} />
        </Routes>
      </Layout>
    </Router>
  );
}
