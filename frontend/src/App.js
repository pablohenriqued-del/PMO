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
        <Layout>
          <Routes>
            <Route path="/shared/:token" element={<SharedProject />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/regional" element={<RegionalDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/status-report" element={<StatusReport />} />
            <Route path="/ai-copilot" element={<AICopilot />} />
            <Route path="/capacity-planning" element={<CapacityPlanning />} />
            <Route path="/features-guide" element={<FeaturesGuide />} />
            <Route path="/crm" element={<CRMDashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/lessons-learned" element={<LessonsLearned />} />
            <Route path="/risk-radar" element={<RiskRadar />} />
            <Route path="/pmo-playbook" element={<PMOPlaybook />} />
            <Route path="/root-cause-analysis" element={<RootCauseAnalysis />} />
            <Route path="/innovation-radar" element={<InnovationRadar />} />
          </Routes>
        </Layout>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;