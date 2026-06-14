import { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/Layout';
import { Loading } from '@/components/UI';

const Dashboard = lazy(() => import('@/pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const ProjectList = lazy(() => import('@/pages/Project').then((m) => ({ default: m.ProjectList })));
const ProjectForm = lazy(() => import('@/pages/Project').then((m) => ({ default: m.ProjectForm })));
const ProjectDetail = lazy(() => import('@/pages/Project').then((m) => ({ default: m.ProjectDetail })));
const ProgressOverview = lazy(() => import('@/pages/Progress').then((m) => ({ default: m.ProgressOverview })));
const MilestoneList = lazy(() => import('@/pages/Progress').then((m) => ({ default: m.MilestoneList })));
const VisitList = lazy(() => import('@/pages/Progress').then((m) => ({ default: m.VisitList })));
const PhotoTimeline = lazy(() => import('@/pages/Progress').then((m) => ({ default: m.PhotoTimeline })));
const EffectOverview = lazy(() => import('@/pages/Effect').then((m) => ({ default: m.EffectOverview })));
const EffectInput = lazy(() => import('@/pages/Effect').then((m) => ({ default: m.EffectInput })));
const EffectAnalysis = lazy(() => import('@/pages/Effect').then((m) => ({ default: m.EffectAnalysis })));
const BenefitCases = lazy(() => import('@/pages/Effect').then((m) => ({ default: m.BenefitCases })));
const RiskOverview = lazy(() => import('@/pages/Risk').then((m) => ({ default: m.RiskOverview })));
const IssueList = lazy(() => import('@/pages/Risk').then((m) => ({ default: m.IssueList })));
const RiskList = lazy(() => import('@/pages/Risk').then((m) => ({ default: m.RiskList })));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loading size="lg" text="加载中..." />
  </div>
);

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px]">
    <h1 className="text-6xl font-bold text-gray-200">404</h1>
    <p className="mt-4 text-lg text-gray-600">页面不存在或已被移除</p>
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'projects',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <ProjectList />
              </Suspense>
            ),
          },
          {
            path: 'new',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <ProjectForm />
              </Suspense>
            ),
          },
          {
            path: ':id',
            children: [
              {
                index: true,
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <ProjectDetail />
                  </Suspense>
                ),
              },
              {
                path: 'edit',
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <ProjectForm />
                  </Suspense>
                ),
              },
              {
                path: 'targets',
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <ProjectDetail />
                  </Suspense>
                ),
              },
              {
                path: 'budget',
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <ProjectDetail />
                  </Suspense>
                ),
              },
              {
                path: 'progress',
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <ProgressOverview />
                  </Suspense>
                ),
              },
              {
                path: 'milestones',
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <MilestoneList />
                  </Suspense>
                ),
              },
              {
                path: 'visits',
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <VisitList />
                  </Suspense>
                ),
              },
              {
                path: 'photos',
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <PhotoTimeline />
                  </Suspense>
                ),
              },
              {
                path: 'effects',
                children: [
                  {
                    index: true,
                    element: (
                      <Suspense fallback={<LoadingFallback />}>
                        <EffectOverview />
                      </Suspense>
                    ),
                  },
                  {
                    path: 'input',
                    element: (
                      <Suspense fallback={<LoadingFallback />}>
                        <EffectInput />
                      </Suspense>
                    ),
                  },
                  {
                    path: 'analysis',
                    element: (
                      <Suspense fallback={<LoadingFallback />}>
                        <EffectAnalysis />
                      </Suspense>
                    ),
                  },
                  {
                    path: 'cases',
                    element: (
                      <Suspense fallback={<LoadingFallback />}>
                        <BenefitCases />
                      </Suspense>
                    ),
                  },
                ],
              },
              {
                path: 'risks',
                children: [
                  {
                    index: true,
                    element: (
                      <Suspense fallback={<LoadingFallback />}>
                        <RiskOverview />
                      </Suspense>
                    ),
                  },
                  {
                    path: 'issues',
                    element: (
                      <Suspense fallback={<LoadingFallback />}>
                        <IssueList />
                      </Suspense>
                    ),
                  },
                  {
                    path: 'warnings',
                    element: (
                      <Suspense fallback={<LoadingFallback />}>
                        <RiskList />
                      </Suspense>
                    ),
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: '404',
        element: <NotFound />,
      },
      {
        path: '*',
        element: <Navigate to="/404" replace />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
