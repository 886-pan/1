import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import AuthPage from '@/pages/AuthPage';
import Landing from '@/pages/Landing';
import ViewPage from '@/pages/ViewPage';
import EditPage from '@/pages/EditPage';
import Toast from '@/components/Toast';
import VersionNotice from '@/components/VersionNotice';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, authLoading } = useStore();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-400/30 border-t-primary-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { loadAuth } = useStore();

  useEffect(() => {
    loadAuth();
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
        </div>

        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/" element={<ProtectedRoute><Landing /></ProtectedRoute>} />
          <Route path="/page/:id" element={<ProtectedRoute><ViewPage /></ProtectedRoute>} />
          <Route path="/page/:id/edit" element={<ProtectedRoute><EditPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Toast />
        <VersionNotice />
      </div>
    </BrowserRouter>
  );
}

export default App;
