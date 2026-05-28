import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import QuestionBank from './pages/QuestionBank';
import Competitions from './pages/Competitions';
import Assessments from './pages/Assessments';
import Analytics from './pages/Analytics';
import Operations from './pages/Operations';
import 'antd/dist/reset.css';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <AppProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/question-bank" element={<QuestionBank />} />
              <Route path="/competitions" element={<Competitions />} />
              <Route path="/assessments" element={<Assessments />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/operations" element={<Operations />} />
            </Routes>
          </Layout>
        </Router>
      </AppProvider>
    </ConfigProvider>
  );
}

export default App;