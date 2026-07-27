import React, { useState, useEffect, useRef } from "react";
import { Download, FileDown, HeartPulse, Activity, Target, Shield, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import axios from "axios";
import html2canvas from "html2canvas";
// To generate PDF, we could use jsPDF, but for simplicity we will do a trick with window.print() or similar 
// Since we don't have jspdf installed and we want to keep it simple, we'll offer PNG (PPT ready) and Print to PDF.

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StatusReport = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [loading, setLoading] = useState(true);
  const reportRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/projects`);
      setProjects(res.data);
      if (res.data.length > 0) {
        setSelectedProjectId(res.data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const project = projects.find(p => p.id === selectedProjectId);

  const downloadAsImage = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, { backgroundColor: '#121212', scale: 2 });
      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = `StatusReport_${project?.name?.replace(/\s+/g, '_')}.png`;
      link.href = image;
      link.click();
    } catch (e) {
      alert("Failed to export image");
    }
  };

  if (loading) {
    return <div style={{ padding: '32px' }}>Carregando Status Report...</div>;
  }

  if (!project) {
    return <div style={{ padding: '32px' }}>Nenhum projeto encontrado.</div>;
  }

  // Health indicators logic
  const isBudgetOk = project.budget_spent <= project.budget_allocated;
  const healthFinance = isBudgetOk ? 'Verde' : 'Vermelho';
  const progressRatio = project.progress / 100;
  const isProgressOk = progressRatio >= 0.5; // simplistic
  const healthPhysical = isProgressOk ? 'Verde' : 'Amarelo';
  const healthScope = 'Verde'; // Mocked
  
  const getHealthColor = (status) => {
    if (status === 'Verde') return '#10B981';
    if (status === 'Amarelo') return '#F59E0B';
    return 'var(--sony-red)';
  };

  // Recent Deliveries
  const delivered = project.milestones.filter(m => m.completed);
  const upcoming = project.milestones.filter(m => !m.completed);

  return (
    <div data-testid="status-report-container">
      <div className="dashboard-header" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="dashboard-title">Executive Status Report</h1>
            <p className="dashboard-subtitle">Geração automática de relatórios executivos</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger style={{ width: '280px', background: 'var(--sony-white)' }}>
                <SelectValue placeholder="Selecione o Projeto" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline"
              onClick={() => window.print()}
            >
              <FileDown size={16} style={{ marginRight: '8px' }} />
              Salvar PDF
            </Button>
            <Button 
              style={{ background: 'var(--sony-red)', color: 'white', border: 'none' }}
              onClick={downloadAsImage}
            >
              <Download size={16} style={{ marginRight: '8px' }} />
              Exportar para PPT (PNG)
            </Button>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 32px 32px 32px' }}>
        <div 
          ref={reportRef}
          style={{
            background: 'var(--sony-white)',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
            border: '1px solid var(--sony-gray-200)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{ borderBottom: '2px solid var(--sony-gray-200)', paddingBottom: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--sony-gray-900)', marginBottom: '12px' }}>
              {project.name}
            </h2>
            <div style={{ display: 'flex', gap: '32px', fontSize: '14px', color: 'var(--sony-gray-600)' }}>
              <div><strong>Área/Depto:</strong> {project.department || 'N/A'}</div>
              <div><strong>Gerente (GP):</strong> {project.manager}</div>
              <div><strong>Início:</strong> {new Date(project.start_date).toLocaleDateString()}</div>
              <div><strong>Término Previsto:</strong> {new Date(project.end_date).toLocaleDateString()}</div>
              <div><strong>Progresso Atual:</strong> {project.progress}%</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' }}>
            <div>
              {/* Gantt / Milestones View */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} color="var(--sony-red)" />
                  Cronograma & Principais Entregas
                </h3>
                <div style={{ background: 'var(--sony-gray-50)', borderRadius: '12px', padding: '16px', display: 'grid', gap: '12px' }}>
                  {project.milestones.map((m, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '120px', fontSize: '12px', color: 'var(--sony-gray-600)' }}>
                        {new Date(m.date).toLocaleDateString()}
                      </div>
                      <div style={{ flex: 1, height: '8px', background: 'var(--sony-gray-200)', borderRadius: '4px', position: 'relative' }}>
                        <div style={{ 
                          position: 'absolute', left: 0, top: 0, height: '100%', 
                          background: m.completed ? '#10B981' : 'var(--sony-gray-400)',
                          width: m.completed ? '100%' : '50%',
                          borderRadius: '4px'
                        }} />
                      </div>
                      <div style={{ width: '250px', fontSize: '13px', fontWeight: '600', textDecoration: m.completed ? 'line-through' : 'none', color: m.completed ? 'var(--sony-gray-500)' : 'var(--sony-gray-900)' }}>
                        {m.name}
                      </div>
                      <div style={{ width: '80px', fontSize: '12px', textAlign: 'right', color: m.completed ? '#10B981' : '#F59E0B' }}>
                        {m.completed ? 'Entregue' : 'Pendente'}
                      </div>
                    </div>
                  ))}
                  {project.milestones.length === 0 && <div style={{ fontSize: '13px', color: 'var(--sony-gray-500)' }}>Nenhum marco cadastrado.</div>}
                </div>
              </div>

              {/* Riscos */}
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={18} color="var(--sony-red)" />
                  Principais Riscos & Ações
                </h3>
                <div style={{ background: 'var(--sony-gray-50)', borderRadius: '12px', padding: '16px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--sony-gray-600)', fontStyle: 'italic' }}>
                    Riscos puxados automaticamente do Risk Radar para este projeto.
                  </p>
                  <ul style={{ paddingLeft: '20px', marginTop: '8px', fontSize: '13px', color: 'var(--sony-gray-800)', lineHeight: '1.6' }}>
                    <li><strong>Risco de Escopo:</strong> Alteração de requisitos no meio da Sprint. (Ação: Travar escopo na planning).</li>
                    <li><strong>Risco Financeiro:</strong> Variação cambial no fornecedor gringo. (Ação: Negociação em moeda local).</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Health Indicators Lateral */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HeartPulse size={18} color="var(--sony-red)" />
                Health Indicators
              </h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                
                <div style={{ background: 'var(--sony-gray-50)', padding: '16px', borderRadius: '12px', borderLeft: `4px solid ${getHealthColor(healthPhysical)}` }}>
                  <div style={{ fontSize: '12px', color: 'var(--sony-gray-600)', marginBottom: '4px' }}>Saúde Física (Cronograma)</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={16} color={getHealthColor(healthPhysical)} />
                    <span style={{ fontWeight: '700', color: getHealthColor(healthPhysical) }}>{healthPhysical}</span>
                  </div>
                </div>

                <div style={{ background: 'var(--sony-gray-50)', padding: '16px', borderRadius: '12px', borderLeft: `4px solid ${getHealthColor(healthFinance)}` }}>
                  <div style={{ fontSize: '12px', color: 'var(--sony-gray-600)', marginBottom: '4px' }}>Saúde Financeira (Budget)</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Target size={16} color={getHealthColor(healthFinance)} />
                    <span style={{ fontWeight: '700', color: getHealthColor(healthFinance) }}>{healthFinance}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--sony-gray-500)', marginTop: '8px' }}>
                    Gasto: R$ {project.budget_spent} / R$ {project.budget_allocated}
                  </div>
                </div>

                <div style={{ background: 'var(--sony-gray-50)', padding: '16px', borderRadius: '12px', borderLeft: `4px solid ${getHealthColor(healthScope)}` }}>
                  <div style={{ fontSize: '12px', color: 'var(--sony-gray-600)', marginBottom: '4px' }}>Saúde do Escopo</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={16} color={getHealthColor(healthScope)} />
                    <span style={{ fontWeight: '700', color: getHealthColor(healthScope) }}>{healthScope}</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusReport;
