import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  PackageOpen,
  BarChart4,
  LineChart,
  BrainCircuit,
  Layers,
  Scale,
  Zap,
  TrendingUp,
  Tags,
  ThumbsUp,
  Menu,
  X,
  ShoppingCart,
} from 'lucide-react';
import { AppProvider } from './store/AppContext';
import ProductList from './components/ProductResearch/ProductList';
import ProductComparison from './components/ProductResearch/ProductComparison';
import RequirementForm from './components/RequirementAnalysis/RequirementForm';
import WeightSettings from './components/RequirementAnalysis/WeightSettings';
import SceneEvaluation from './components/RequirementAnalysis/SceneEvaluation';
import PriceHistory from './components/MarketIntelligence/PriceHistory';
import PromotionPrediction from './components/MarketIntelligence/PromotionPrediction';
import UsedPriceReference from './components/MarketIntelligence/UsedPriceReference';
import DecisionProsCons from './components/DecisionHelper/DecisionProsCons';
import SatisfactionReview from './components/DecisionHelper/SatisfactionReview';

const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuGroups = [
    {
      title: '产品研究',
      icon: PackageOpen,
      items: [
        { path: '/products', label: '产品收藏', icon: Layers },
        { path: '/comparison', label: '横向对比', icon: Scale },
      ],
    },
    {
      title: '需求分析',
      icon: BrainCircuit,
      items: [
        { path: '/requirements', label: '需求梳理', icon: BarChart4 },
        { path: '/weights', label: '权重设置', icon: LineChart },
        { path: '/scenes', label: '场景评估', icon: Zap },
      ],
    },
    {
      title: '市场情报',
      icon: TrendingUp,
      items: [
        { path: '/price-history', label: '价格历史', icon: LineChart },
        { path: '/promotions', label: '促销预测', icon: Tags },
        { path: '/used-prices', label: '二手估值', icon: TrendingUp },
      ],
    },
    {
      title: '决策辅助',
      icon: ThumbsUp,
      items: [
        { path: '/decision', label: 'Pros & Cons', icon: ThumbsUp },
        { path: '/reviews', label: '满意度回访', icon: ShoppingCart },
      ],
    },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-800 text-white z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <ShoppingCart size={22} />
            </div>
            <div>
              <h1 className="font-bold text-lg">选购助手</h1>
              <p className="text-xs text-slate-400">Digital Decision</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-6">
          {menuGroups.map((group) => (
            <div key={group.title}>
              <div className="flex items-center gap-2 px-2 py-2 text-slate-400 text-sm font-medium">
                <group.icon size={16} />
                {group.title}
              </div>
              <ul className="space-y-1 mt-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={onClose}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        <item.icon size={18} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

const AppContent: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64">
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu size={24} />
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </span>
            </div>
          </div>
        </header>

        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/comparison" element={<ProductComparison />} />
            <Route path="/requirements" element={<RequirementForm />} />
            <Route path="/weights" element={<WeightSettings />} />
            <Route path="/scenes" element={<SceneEvaluation />} />
            <Route path="/price-history" element={<PriceHistory />} />
            <Route path="/promotions" element={<PromotionPrediction />} />
            <Route path="/used-prices" element={<UsedPriceReference />} />
            <Route path="/decision" element={<DecisionProsCons />} />
            <Route path="/reviews" element={<SatisfactionReview />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
