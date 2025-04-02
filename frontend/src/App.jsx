import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AppLayout from './components/common/AppLayout';
import theme from './theme';
import { runAuthTests } from './services/test_auth';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import PreparationPage from './pages/PreparationPage';
import ControlPage from './pages/ControlPage';
import PackingPage from './pages/PackingPage';
import StatisticsPage from './pages/StatisticsPage';
import UsersPage from './pages/UsersPage';

function App() {
  // Exécuter les tests d'authentification
  useEffect(() => {
    runAuthTests().then(result => {
      console.log('Auth tests completed:', result);
    });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Routes publiques */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Routes protégées avec layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                {/* Autres routes protégées seront ajoutées ici */}
                <Route path="/preparation" element={<PreparationPage />} />
                <Route path="/control" element={<ControlPage />} />
                <Route path="/packing" element={<PackingPage />} />
              </Route>
            </Route>
            
            {/* Routes protégées pour les managers uniquement */}
            <Route element={<ProtectedRoute requireManager={true} />}>
              <Route element={<AppLayout />}>
                <Route path="/statistics" element={<StatisticsPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/profile" element={<div>Page de profil (à implémenter)</div>} />
                <Route path="/settings" element={<div>Page de paramètres (à implémenter)</div>} />
              </Route>
            </Route>
            
            {/* Redirection par défaut */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
