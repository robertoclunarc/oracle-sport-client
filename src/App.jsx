import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';

// Contexts (solo el que falta)
import { BettingProvider } from './contexts/BettingContext';

// Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

// Pages
import Sports from './pages/Sports';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/admin/AdminDashboard';
import BetHistory from './pages/BetHistory';
import Profile from "./pages/Profile";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import ManageBets from "./pages/admin/ManageBets";
import ManageUsers from "./pages/admin/ManageUsers";

// Layout Wrapper para rutas que necesitan layout
const LayoutWrapper = ({ children }) => (
  <Layout>
    {children}
  </Layout>
);

// Layout especial para admin (sin sidebar de deportes ni betting panel)
const AdminLayoutWrapper = ({ children }) => (
  <Box sx={{ 
    minHeight: '100vh',
    backgroundColor: (theme) => theme.palette.background.default 
  }}>
    {children}
  </Box>
);

function App() {
  return (
    <BettingProvider>
      <Routes>
        {/* Rutas sin layout (Login/Register) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rutas con layout */}
        <Route path="/" element={
          <LayoutWrapper>
            <Sports />
          </LayoutWrapper>
        } />
        
        <Route path="/sports" element={
          <LayoutWrapper>
            <Sports />
          </LayoutWrapper>
        } />
        
        <Route path="/sports/:sportKey" element={
          <LayoutWrapper>
            <Sports />
          </LayoutWrapper>
        } />
        
        {/* Rutas protegidas con layout */}
        <Route path="/profile" element={
          <LayoutWrapper>
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          </LayoutWrapper>
        } />
        
        <Route path="/bet-history" element={
          <LayoutWrapper>            
              <BetHistory />            
          </LayoutWrapper>
        } />
        
        <Route path="/deposit" element={
          <LayoutWrapper>
            <ProtectedRoute>
              <Deposit />
            </ProtectedRoute>
          </LayoutWrapper>
        } />
        
        <Route path="/withdraw" element={
          <LayoutWrapper>
            <ProtectedRoute>
              <Withdraw />
            </ProtectedRoute>
          </LayoutWrapper>
        } />        

        <Route path="/admin" element={
          <AdminRoute>
            <LayoutWrapper>
              <AdminDashboard />
            </LayoutWrapper>
          </AdminRoute>  
        } />

        <Route path="/admin/manage-bets" element={
          <AdminRoute>
            <LayoutWrapper>
              <ManageBets />
            </LayoutWrapper>
          </AdminRoute>  
        } />

        <Route path="/admin/manage-users" element={
          <AdminRoute>
            <LayoutWrapper>
              <ManageUsers />
            </LayoutWrapper>
          </AdminRoute>  
        } />
        
        <Route path="/admin/*" element={
          <AdminRoute>
            <LayoutWrapper>
              <AdminDashboard />
            </LayoutWrapper>
          </AdminRoute>  
        } />        
        
        {/* 404 */}
        <Route path="*" element={
          <LayoutWrapper>
            <NotFound />
          </LayoutWrapper>
        } />
      </Routes>
    </BettingProvider>
  );
}

export default App;