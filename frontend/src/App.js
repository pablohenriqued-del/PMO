import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import "@/App.css";

// Components
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Projects from "./components/Projects";
import Timeline from "./components/Timeline";
import Budget from "./components/Budget";
import LessonsLearned from "./components/LessonsLearned";
import RiskRadar from "./components/RiskRadar";
import PMOPlaybook from "./components/PMOPlaybook";
import RootCauseAnalysis from "./components/RootCauseAnalysis";
import InnovationRadar from "./components/InnovationRadar";
import RegionalDashboard from "./components/RegionalDashboard";
import AdminUsers from "./components/AdminUsers";
import StatusReport from "./components/StatusReport";
import AICopilot from "./components/AICopilot";
import CapacityPlanning from "./components/CapacityPlanning";
import FeaturesGuide from "./components/FeaturesGuide";
import SharedProject from "./components/SharedProject";
import CRMDashboard from "./components/CRMDashboard";


import { AuthProvider, useAuth } from './components/AuthContext';
import Login from './components/Login';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--sony-black)', color: 'white'}}>Carregando...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  return (
    <div className="App">

      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id="black-to-white">
          <feColorMatrix type="matrix" values="
            0 0 0 0 1
           -1 0 0 0 1
           -1 0 0 0 1
            0 0 0 1 0" 
          />
        </filter>
      </svg>

      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/shared/:token" element={<SharedProject />} />
            <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/regional" element={<ProtectedRoute><Layout><RegionalDashboard /></Layout></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><Layout><AdminUsers /></Layout></ProtectedRoute>} />
            <Route path="/status-report" element={<ProtectedRoute><Layout><StatusReport /></Layout></ProtectedRoute>} />
            <Route path="/ai-copilot" element={<ProtectedRoute><Layout><AICopilot /></Layout></ProtectedRoute>} />
            <Route path="/capacity-planning" element={<ProtectedRoute><Layout><CapacityPlanning /></Layout></ProtectedRoute>} />
            <Route path="/features-guide" element={<ProtectedRoute><Layout><FeaturesGuide /></Layout></ProtectedRoute>} />
            <Route path="/crm" element={<ProtectedRoute><Layout><CRMDashboard /></Layout></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><Layout><Projects /></Layout></ProtectedRoute>} />
            <Route path="/timeline" element={<ProtectedRoute><Layout><Timeline /></Layout></ProtectedRoute>} />
            <Route path="/budget" element={<ProtectedRoute><Layout><Budget /></Layout></ProtectedRoute>} />
            <Route path="/lessons-learned" element={<ProtectedRoute><Layout><LessonsLearned /></Layout></ProtectedRoute>} />
            <Route path="/risk-radar" element={<ProtectedRoute><Layout><RiskRadar /></Layout></ProtectedRoute>} />
            <Route path="/pmo-playbook" element={<ProtectedRoute><Layout><PMOPlaybook /></Layout></ProtectedRoute>} />
            <Route path="/root-cause-analysis" element={<ProtectedRoute><Layout><RootCauseAnalysis /></Layout></ProtectedRoute>} />
            <Route path="/innovation-radar" element={<ProtectedRoute><Layout><InnovationRadar /></Layout></ProtectedRoute>} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;