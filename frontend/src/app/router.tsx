// src/app/router.tsx
import { lazy, Suspense, type ReactNode } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Spinner } from "../shared/components/Spinner";
import { Navigate, Route, Routes } from "react-router-dom";

const DashboardPage = lazy(() =>
  import("../pages/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  })),
);
const WorkspacePage = lazy(() =>
  import("../pages/WorkspacePage").then((module) => ({
    default: module.WorkspacePage,
  })),
);
const ProjectPage = lazy(() =>
  import("../pages/ProjectPage").then((module) => ({
    default: module.ProjectPage,
  })),
);
const LoginPage = lazy(() =>
  import("../features/auth/components/LoginPage").then((module) => ({
    default: module.LoginPage,
  })),
);
const SignupPage = lazy(() =>
  import("../features/auth/components/SignupPage").then((module) => ({
    default: module.SignupPage,
  })),
);

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner />
    </div>
  );
}

function renderLazyPage(node: ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{node}</Suspense>;
}

// Wraps any route that requires auth
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <RouteFallback />;
  if (!isSignedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={renderLazyPage(<LoginPage />)} />
      <Route path="/signup" element={renderLazyPage(<SignupPage />)} />
      <Route
        path="/"
        element={
          <ProtectedRoute>{renderLazyPage(<DashboardPage />)}</ProtectedRoute>
        }
      />
      <Route
        path="/workspace/:workspaceId"
        element={
          <ProtectedRoute>{renderLazyPage(<WorkspacePage />)}</ProtectedRoute>
        }
      />
      <Route
        path="/workspace/:workspaceId/project/:projectId"
        element={
          <ProtectedRoute>{renderLazyPage(<ProjectPage />)}</ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
