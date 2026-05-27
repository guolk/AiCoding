import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import DesignTokens from './pages/design-system/DesignTokens'
import NamingConvention from './pages/design-system/NamingConvention'
import VersionHistory from './pages/design-system/VersionHistory'
import ComponentList from './pages/components/ComponentList'
import ComponentDetail from './pages/components/ComponentDetail'
import DesignDecisions from './pages/decisions/DesignDecisions'
import ReviewRecords from './pages/decisions/ReviewRecords'
import DesignPrinciples from './pages/decisions/DesignPrinciples'
import IconLibrary from './pages/assets/IconLibrary'
import IllustrationAssets from './pages/assets/IllustrationAssets'
import FontManagement from './pages/assets/FontManagement'
import DeliveryChecklist from './pages/workflow/DeliveryChecklist'
import DesignReview from './pages/workflow/DesignReview'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/design-system/tokens" element={<DesignTokens />} />
        <Route path="/design-system/naming" element={<NamingConvention />} />
        <Route path="/design-system/versions" element={<VersionHistory />} />
        <Route path="/components" element={<ComponentList />} />
        <Route path="/components/:id" element={<ComponentDetail />} />
        <Route path="/decisions/records" element={<DesignDecisions />} />
        <Route path="/decisions/reviews" element={<ReviewRecords />} />
        <Route path="/decisions/principles" element={<DesignPrinciples />} />
        <Route path="/assets/icons" element={<IconLibrary />} />
        <Route path="/assets/illustrations" element={<IllustrationAssets />} />
        <Route path="/assets/fonts" element={<FontManagement />} />
        <Route path="/workflow/checklist" element={<DeliveryChecklist />} />
        <Route path="/workflow/review" element={<DesignReview />} />
      </Routes>
    </Layout>
  )
}

export default App