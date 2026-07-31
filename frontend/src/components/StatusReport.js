import React, { useState, useEffect, useRef } from "react";
import { Download, FileDown, HeartPulse, Activity, Target, Shield, Clock, Calendar, DollarSign, CheckCircle2, AlertTriangle, ArrowRight, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import axios from "axios";
import html2canvas from "html2canvas";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CircularProgress = ({ progress, size = 100, strokeWidth = 8, color = "var(--sony-red)" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} fill="none" />
        <circle cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-in-out', filter: `drop-shadow(0 0 6px ${color}88)` }} />
      </svg>
      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: '22px', fontWeight: '900', color: 'var(--pure-white)', lineHeight: '1' }}>{progress}%</span>
      </div>
    </div>
  );
};

const StatusReport = () => {
  const [projects, setProjects] = useState([]);
  const [risks, setRisks] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [loading, setLoading] = useState(true);
  const reportRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projRes, risksRes] = await Promise.all([
        axios.get(`${API}/projects`),
        axios.get(`${API}/risk-radar`)
      ]);
      setProjects(projRes.data);
      setRisks(risksRes.data);
      if (projRes.data.length > 0) {
        setSelectedProjectId(projRes.data[0].id);
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
      const canvas = await html2canvas(reportRef.current, { backgroundColor: '#0A0A0A', scale: 2, useCORS: true });
      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = `C-Level_Status_${project?.name?.replace(/\s+/g, '_')}.png`;
      link.href = image;
      link.click();
    } catch (e) {
      alert("Failed to export image");
    }
  };

  if (loading) {
    return <div style={{ padding: '32px' }}><div className="skeleton" style={{ height: '600px', borderRadius: '16px' }}></div></div>;
  }

  if (!project) {
    return <div style={{ padding: '32px', color: 'white' }}>Nenhum projeto encontrado.</div>;
  }

  // Health indicators logic
  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  
  const isBudgetOk = project.budget_spent <= project.budget_allocated;
  const isBudgetWarning = project.budget_spent > 0 && (project.budget_spent / project.budget_allocated) > 0.9;
  
  const healthFinance = !isBudgetOk ? 'CRITICAL' : (isBudgetWarning ? 'WARNING' : 'ON TRACK');
  
  const progressExpected = 50; // Mock expected progress logic
  const healthPhysical = project.progress >= progressExpected ? 'ON TRACK' : 'WARNING';
  
  const projectRisks = risks.filter(r => r.project === project.name && r.status !== 'Resolved' && r.status !== 'Mitigated');
  const healthScope = projectRisks.some(r => r.severity === 'Critical') ? 'AT RISK' : 'ON TRACK';
  
  const getHealthColor = (status) => {
    if (status === 'ON TRACK') return '#10B981';
    if (status === 'WARNING' || status === 'AT RISK') return '#F59E0B';
    return 'var(--sony-red)';
  };

  const getHealthIcon = (status) => {
    if (status === 'ON TRACK') return <CheckCircle2 size={24} color="#10B981" />;
    if (status === 'WARNING' || status === 'AT RISK') return <AlertTriangle size={24} color="#F59E0B" />;
    return <Zap size={24} color="var(--sony-red)" />;
  };

  // Milestones
  const keyMilestones = project.milestones.filter(m => m.is_key_milestone !== false).slice(0, 5); // top 5

  return (
    <div data-testid="status-report-container">
      <div className="dashboard-header" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="dashboard-title">Executive Status Report</h1>
            <p className="dashboard-subtitle">C-Level view: Saúde do projeto, finanças e riscos</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger style={{ width: '280px', background: 'rgba(20,20,20,0.8)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
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
              style={{ color: 'var(--pure-white)', borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}
            >
              <FileDown size={16} style={{ marginRight: '8px' }} />
              PDF
            </Button>
            <Button 
              style={{ background: 'linear-gradient(90deg, #E50914, #B20710)', color: 'white', border: 'none', boxShadow: '0 0 20px rgba(229,9,20,0.4)' }}
              onClick={downloadAsImage}
            >
              <Download size={16} style={{ marginRight: '8px' }} />
              Exportar PNG (Apresentação)
            </Button>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 32px 32px 32px', display: 'flex', justifyContent: 'center' }}>
        <div 
          ref={reportRef}
          style={{
            width: '100%',
            maxWidth: '1200px',
            background: 'linear-gradient(145deg, #111111 0%, #050505 100%)',
            borderRadius: '24px',
            padding: '48px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Background Glows */}
          <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(229,9,20,0.1) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }}></div>
          <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }}></div>

          {/* Report Header */}
          <div style={{ position: 'relative', zIndex: 1, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '32px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, paddingRight: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: '700', color: 'var(--pure-white)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {project.department || 'N/A'}
                </span>
                <span className={`status-badge status-${project.status}`}>{project.status.replace('_', ' ')}</span>
              </div>
              <h2 style={{ fontSize: '36px', fontWeight: '900', color: 'var(--pure-white)', marginBottom: '16px', lineHeight: '1.2', letterSpacing: '-0.5px' }}>
                {project.name}
              </h2>
              <p style={{ fontSize: '15px', color: '#94A3B8', lineHeight: '1.6', maxWidth: '800px' }}>
                {project.description || 'Nenhum resumo executivo disponível para este projeto.'}
              </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '250px', background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--sony-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                  {project.manager.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>Project Manager</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--pure-white)' }}>{project.manager}</div>
                </div>
              </div>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
              <div>
                <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Timeline</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--pure-white)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={14} color="var(--sony-red)" />
                  {new Date(project.start_date).toLocaleDateString([], { month: 'short', year: 'numeric'})} - {new Date(project.end_date).toLocaleDateString([], { month: 'short', year: 'numeric'})}
                </div>
              </div>
            </div>
          </div>

          {/* Health Indicators (Row 1) */}
          <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
            {[
              { title: 'SCHEDULE HEALTH', status: healthPhysical, desc: 'Prazos e Entregas', icon: <Clock size={20} /> },
              { title: 'FINANCIAL HEALTH', status: healthFinance, desc: 'Budget Control', icon: <DollarSign size={20} /> },
              { title: 'SCOPE & RISKS', status: healthScope, desc: 'Riscos Ativos', icon: <Shield size={20} /> }
            ].map((health, idx) => (
              <div key={idx} style={{ 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px'
              }}>
                <div style={{ 
                  width: '56px', height: '56px', borderRadius: '50%', 
                  background: `${getHealthColor(health.status)}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 20px ${getHealthColor(health.status)}33`
                }}>
                  {getHealthIcon(health.status)}
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '700', letterSpacing: '1px', marginBottom: '4px' }}>{health.title}</div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: getHealthColor(health.status) }}>{health.status}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Middle Section: Progress & Financials vs Milestones */}
          <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
            
            {/* Left Column: Progress & Finance */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '32px' }}>
                <CircularProgress progress={project.progress} size={120} />
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--pure-white)', marginBottom: '8px' }}>Progresso Geral</h3>
                  <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: '1.5' }}>
                    O projeto está atualmente com <strong>{project.progress}%</strong> de conclusão contra um esperado de <strong>{progressExpected}%</strong> para a data de hoje.
                  </p>
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--pure-white)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Target size={18} color="var(--sony-red)" /> Desempenho Financeiro
                </h3>
                
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                    <span style={{ color: '#94A3B8', fontWeight: '600' }}>Budget Gasto</span>
                    <span style={{ color: 'var(--pure-white)', fontWeight: '800' }}>{formatCurrency(project.budget_spent)} <span style={{ color: '#94A3B8', fontWeight: '500', fontSize: '12px' }}>/ {formatCurrency(project.budget_allocated)}</span></span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${Math.min((project.budget_spent / (project.budget_allocated || 1)) * 100, 100)}%`, 
                      height: '100%', 
                      background: isBudgetOk ? '#10B981' : 'var(--sony-red)',
                      boxShadow: `0 0 10px ${isBudgetOk ? '#10B981' : 'var(--sony-red)'}`
                    }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                    <span style={{ color: '#94A3B8', fontWeight: '600' }}>Receita Gerada</span>
                    <span style={{ color: '#10B981', fontWeight: '800' }}>{formatCurrency(project.revenue_generated)} <span style={{ color: '#94A3B8', fontWeight: '500', fontSize: '12px' }}>/ {formatCurrency(project.revenue_expected)}</span></span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${Math.min((project.revenue_generated / (project.revenue_expected || 1)) * 100, 100)}%`, 
                      height: '100%', 
                      background: '#3B82F6',
                      boxShadow: '0 0 10px #3B82F6'
                    }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Key Milestones Timeline */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--pure-white)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="var(--sony-red)" /> Roadmap & Key Milestones
              </h3>
              
              <div style={{ position: 'relative', paddingLeft: '24px' }}>
                {/* Vertical Line */}
                <div style={{ position: 'absolute', top: '8px', bottom: '8px', left: '7px', width: '2px', background: 'rgba(255,255,255,0.1)' }}></div>
                
                {keyMilestones.map((m, i) => (
                  <div key={i} style={{ position: 'relative', marginBottom: i === keyMilestones.length - 1 ? 0 : '28px' }}>
                    {/* Diamond Node */}
                    <div style={{ 
                      position: 'absolute', left: '-22px', top: '4px', 
                      width: '12px', height: '12px', 
                      background: m.completed ? '#10B981' : '#F59E0B',
                      transform: 'rotate(45deg)',
                      boxShadow: `0 0 10px ${m.completed ? '#10B981' : '#F59E0B'}`,
                      border: '2px solid #111'
                    }}></div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: m.completed ? '#E2E8F0' : 'var(--pure-white)', textDecoration: m.completed ? 'line-through' : 'none', marginBottom: '4px' }}>
                          {m.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                          Responsável: {m.assigned_to ? <span style={{ color: '#E2E8F0', fontWeight: '600' }}>{m.assigned_to}</span> : 'Não atribuído'}
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: m.completed ? '#10B981' : '#F59E0B', background: m.completed ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', padding: '4px 10px', borderRadius: '12px' }}>
                        {new Date(m.date).toLocaleDateString([], { month: 'short', day: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                {keyMilestones.length === 0 && <div style={{ color: '#94A3B8', fontSize: '13px' }}>Nenhum marco chave cadastrado.</div>}
              </div>
              
              {project.milestones.length > 5 && (
                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#94A3B8', fontWeight: '600' }}>
                  + {project.milestones.length - 5} outras tarefas ocultas.
                </div>
              )}
            </div>
          </div>

          {/* Risks Section */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--pure-white)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="var(--sony-red)" /> Active Risks & Mitigation Plans
            </h3>
            
            {projectRisks.length === 0 ? (
              <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', padding: '16px', borderRadius: '12px', color: '#10B981', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} /> Nenhum risco ativo crítico mapeado no momento.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {projectRisks.map(r => (
                  <div key={r.id} style={{ background: 'rgba(20,20,20,0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px', borderLeft: `4px solid ${r.severity === 'Critical' ? 'var(--sony-red)' : '#F59E0B'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--pure-white)' }}>{r.risk}</span>
                      <span style={{ fontSize: '10px', background: r.severity === 'Critical' ? 'rgba(229,9,20,0.2)' : 'rgba(245,158,11,0.2)', color: r.severity === 'Critical' ? 'var(--sony-red)' : '#F59E0B', padding: '2px 8px', borderRadius: '12px', fontWeight: '700', textTransform: 'uppercase' }}>{r.severity}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '16px', lineHeight: '1.5' }}>
                      <strong>Plano de Ação:</strong> {r.mitigation}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--pure-white)' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--sony-gray-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '10px' }}>
                        {r.owner.substring(0,2).toUpperCase()}
                      </div>
                      Owner: {r.owner}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div style={{ position: 'absolute', bottom: '24px', right: '32px', opacity: 0.5 }}>
            <div className="sony-icon" style={{ width: '60px' }}>
              <img src="https://customer-assets-jai6qajn.emergentagent.net/job_84a5e55c-26a8-4190-b713-50bfc83fd45d/artifacts/ql8q4vna_Sony_Music_Logo.png" alt="Sony Music" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusReport;
