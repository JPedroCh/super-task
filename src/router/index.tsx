import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import AppLayout from "../components/layout/AppLayout";

// Job Board is the landing route for this app — loaded eagerly. Everything
// else is code-split: on a mobile connection, the page that has to work in
// the first 11 seconds shouldn't wait behind bundle code no one has
// navigated to yet.
import JobBoardPage from "../pages/JobBoardPage";
const JobDetailsPage = lazy(() => import("../pages/JobDetailsPage"));
const MockSignUpPage = lazy(() => import("../pages/MockSignUpPage"));
const MockApplyPage = lazy(() => import("../pages/MockApplyPage"));
const MockAnalyticsPage = lazy(() => import("../pages/MockAnalyticsPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

function RouteFallback() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }} aria-live="polite" aria-busy="true">
      <CircularProgress aria-label="Loading page" />
    </Box>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/jobs" replace />} />
          <Route path="jobs" element={<JobBoardPage />} />
          <Route path="jobs/:jobId" element={<JobDetailsPage />} />
          <Route path="signup" element={<MockSignUpPage />} />
          <Route path="apply/:jobId" element={<MockApplyPage />} />
          <Route path="mock-analytics" element={<MockAnalyticsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
