import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/useAuthStore'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ContentCalendar from './pages/ContentCalendar'
import TopicIdeas from './pages/TopicIdeas'
import Competitors from './pages/Competitors'
import DataAggregation from './pages/DataAggregation'
import ScriptTemplates from './pages/ScriptTemplates'
import KeywordResearch from './pages/KeywordResearch'
import CoverDesign from './pages/CoverDesign'
import Revenue from './pages/Revenue'
import Cooperations from './pages/Cooperations'
import ContentAttribution from './pages/ContentAttribution'
import FollowerInsights from './pages/FollowerInsights'

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" />
}

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  return !isAuthenticated ? children : <Navigate to="/dashboard" />
}

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Navigate to="/dashboard" />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/content-calendar"
        element={
          <PrivateRoute>
            <Layout>
              <ContentCalendar />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/topic-ideas"
        element={
          <PrivateRoute>
            <Layout>
              <TopicIdeas />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/competitors"
        element={
          <PrivateRoute>
            <Layout>
              <Competitors />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/data-aggregation"
        element={
          <PrivateRoute>
            <Layout>
              <DataAggregation />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/script-templates"
        element={
          <PrivateRoute>
            <Layout>
              <ScriptTemplates />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/keyword-research"
        element={
          <PrivateRoute>
            <Layout>
              <KeywordResearch />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/cover-design"
        element={
          <PrivateRoute>
            <Layout>
              <CoverDesign />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/revenue"
        element={
          <PrivateRoute>
            <Layout>
              <Revenue />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/cooperations"
        element={
          <PrivateRoute>
            <Layout>
              <Cooperations />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/content-attribution"
        element={
          <PrivateRoute>
            <Layout>
              <ContentAttribution />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/follower-insights"
        element={
          <PrivateRoute>
            <Layout>
              <FollowerInsights />
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  )
}

export default App
