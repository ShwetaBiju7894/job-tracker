import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import AppLayout    from './components/layout/AppLayout';
import Login        from './pages/Auth/Login';
import Register     from './pages/Auth/Register';
import Dashboard    from './pages/Dashboard';
import Applications from './pages/Applications';
import Analytics    from './pages/Analytics';
import AIAssistant  from './pages/AIAssistant';
import Settings     from './pages/Settings';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login"    element={<PublicRoute><Login    /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
    <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
      <Route index              element={<Dashboard    />} />
      <Route path="applications" element={<Applications />} />
      <Route path="analytics"    element={<Analytics    />} />
      <Route path="ai"           element={<AIAssistant  />} />
      <Route path="settings"     element={<Settings     />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', borderRadius: '10px' } }} />
      </BrowserRouter>
    </AuthProvider>
  );
}