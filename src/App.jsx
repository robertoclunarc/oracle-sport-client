import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Box, useMediaQuery } from '@mui/material';
import { getThemeByMode } from './theme';

// Contextos
import { AuthContext } from './contexts/AuthContext';
import { BettingProvider } from './contexts/BettingContext';

// Componentes comunes
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Sidebar from './components/common/Sidebar';
import Loading from './components/common/Loading';

// Páginas
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Sports from './pages/Sports';
import EventDetails from './pages/EventDetails';
import Profile from './pages/Profile';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import BetHistory from './pages/BetHistory';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageBets from './pages/admin/ManageBets';

// Rutas protegidas
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = React.useContext(AuthContext);
  
  if (loading) {
    return <Loading />;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Rutas para administradores
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = React.useContext(AuthContext);
  
  if (loading) {
    return <Loading />;
  }
  
  return isAuthenticated && user?.role === 'admin' ? children : <Navigate to="/" />;
};

function App() {
  const [themeMode, setThemeMode] = useState('light');
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = getThemeByMode(themeMode);
  
  // Detectar preferencia de tema del sistema
  useEffect(() => {
    setThemeMode(prefersDarkMode ? 'dark' : 'light');
  }, [prefersDarkMode]);

  const toggleTheme = () => {
    setThemeMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <AuthContext.Provider value={{ isAuthenticated: false, user: null, loading: false, login: () => {}, logout: () => {} }}>
        <BettingProvider>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header 
              onDrawerToggle={handleDrawerToggle} 
              onThemeToggle={toggleTheme} 
              themeMode={themeMode} 
            />
            <Box sx={{ display: 'flex', flex: 1 }}>
              <Sidebar 
                mobileOpen={mobileOpen} 
                onDrawerToggle={handleDrawerToggle} 
              />
              <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, width: '100%' }}>
                <Routes>
                  {/* Rutas públicas */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/sports" element={<Sports />} />
                  <Route path="/sports/:sportKey" element={<Sports />} />
                  <Route path="/event/:eventId" element={<EventDetails />} />
                  
                  {/* Rutas protegidas */}
                  <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                  <Route path="/deposit" element={<PrivateRoute><Deposit /></PrivateRoute>} />
                  <Route path="/withdraw" element={<PrivateRoute><Withdraw /></PrivateRoute>} />
                  <Route path="/bet-history" element={<PrivateRoute><BetHistory /></PrivateRoute>} />
                  
                  {/* Rutas de administrador */}
                  <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                  <Route path="/admin/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
                  <Route path="/admin/bets" element={<AdminRoute><ManageBets /></AdminRoute>} />
                  
                  {/* Ruta 404 */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Box>
            </Box>
            <Footer />
          </Box>
        </BettingProvider>
      </AuthContext.Provider>
    </ThemeProvider>
  );
}

export default App;