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

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
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