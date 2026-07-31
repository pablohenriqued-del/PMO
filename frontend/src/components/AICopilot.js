import React, { useState, useEffect } from "react";
import { BrainCircuit, TrendingUp, AlertOctagon, CheckCircle2, Zap, ArrowRight, Activity, Users } from "lucide-react";
import { Button } from "./ui/button";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AICopilot = () => {
  const [trends, setTrends] = useState([]);
  const [bottlenecks, setBottlenecks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAIIngelligence();
  }, []);

  const fetchAIIngelligence = async () => {
    try {
      setLoading(true);
      const [trendsRes, bottlenecksRes] = await Promise.all([
        axios.get(`${API}/ai/trends`),
        axios.get(`${API}/ai/bottlenecks`)
      ]);
      setTrends(trendsRes.data);
      setBottlenecks(bottlenecksRes.data);
    } catch (error) {
      console.error('Error fetching AI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReallocate = async (trend) => {
    try {
      await axios.post(`${API}/ai/reallocate-budget`, {
        source_id: trend.source_project_id,
        target_id: trend.related_project_id,
        amount: trend.amount
      });
      setTrends(prev => prev.map(t => t.id === trend.id ? { ...t, status: 'executed' } : t));
      alert("Automação: Budget realocado com sucesso com base na Trend!");
    } catch (e) {
      alert("Erro ao realocar budget.");
    }
  };

  const handleResolveBottleneck = async (bot) => {
    try {
      await axios.post(`${API}/ai/resolve-bottleneck`, {
        project_id: bot.project_id,
        user_id: bot.suggested_user_id,
        milestone_name: bot.milestone_name
      });
      setBottlenecks(prev => prev.map(b => b.id === bot.id ? { ...b, status: 'executed' } : b));
      alert("Automação: Recurso alocado e notificado (Teams/Email) com sucesso!");
    } catch (e) {
      alert("Erro ao alocar recurso.");
    }
  };

  if (loading) {
    return <div style={{ padding: '32px' }}><div className="skeleton" style={{ height: '400px' }}></div></div>;
  }

  return (
    <div data-testid="ai-copilot-container">
      <div className="dashboard-header" style={{ marginBottom: '32px', background: 'var(--sony-black)', borderBottom: '1px solid var(--sony-gray-200)' }}>
        <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--sony-white)' }}>
          <BrainCircuit color="var(--sony-red)" size={32} />
          PMO AI Copilot & Autonomous Agent
        </h1>
        <p className="dashboard-subtitle" style={{ color: '#E2E8F0', fontWeight: '500' }}>
          Agentic AI para análise preditiva, gestão de capacidade e realocação guiada por Data Trends
        </p>
      </div>

      <div style={{ padding: '0 32px 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '32px' }}>
        
        {/* Trend-Driven Prioritization */}
        <div style={{
          background: 'linear-gradient(145deg, #1A1A1A 0%, #0A0A0A 100%)',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid rgba(229, 9, 20, 0.2)',
          boxShadow: '0 8px 32px rgba(229, 9, 20, 0.1)'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--sony-white)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity color="var(--sony-red)" size={24} />
            Trend-Driven Prioritization (Spotify/TikTok)
          </h3>
          
          <div style={{ display: 'grid', gap: '20px' }}>
            {trends.map(trend => (
              <div key={trend.id} style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#10B981', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
                      🔥 VIRAL TREND DETECTADA
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--sony-white)' }}>{trend.artist} no {trend.platform}</div>
                  </div>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '4px 8px', borderRadius: '8px', fontWeight: 'bold' }}>
                    {trend.growth_rate}
                  </div>
                </div>
                
                <p style={{ fontSize: '13px', color: '#E2E8F0', fontWeight: '500', marginBottom: '16px' }}>
                  <strong>Trigger:</strong> {trend.trigger}
                </p>

                <div style={{ background: 'rgba(0,0,0,0.5)', padding: '16px', borderRadius: '8px', marginBottom: '16px', borderLeft: '3px solid #F59E0B' }}>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>Ação Autônoma Sugerida:</div>
                  <div style={{ fontSize: '14px', color: 'var(--sony-white)' }}>{trend.suggested_action}</div>
                </div>

                {trend.status === 'pending' ? (
                  <Button 
                    onClick={() => handleReallocate(trend)}
                    style={{ width: '100%', background: 'var(--sony-red)', color: 'white', border: 'none', display: 'flex', gap: '8px' }}
                  >
                    <Zap size={16} /> Aprovar Realocação de Budget
                  </Button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px', color: '#10B981', fontWeight: 'bold', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
                    <CheckCircle2 size={16} /> Realocação Executada
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Autonomous PMO Agent */}
        <div style={{
          background: 'linear-gradient(145deg, #1A1A1A 0%, #0A0A0A 100%)',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--sony-white)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users color="#3B82F6" size={24} />
            PMO Autônomo & Prevenção de Atrasos
          </h3>
          
          <div style={{ display: 'grid', gap: '20px' }}>
            {bottlenecks.map(bot => (
              <div key={bot.id} style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#F59E0B', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
                      ⚠️ RISCO DE ATRASO DETECTADO
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--sony-white)' }}>{bot.project_name}</div>
                  </div>
                </div>
                
                <p style={{ fontSize: '13px', color: '#E2E8F0', fontWeight: '500', marginBottom: '16px' }}>
                  <strong>Motivo:</strong> {bot.issue}<br/>
                  <strong>Marco Crítico:</strong> {bot.milestone_name}
                </p>

                <div style={{ background: 'rgba(0,0,0,0.5)', padding: '16px', borderRadius: '8px', marginBottom: '16px', borderLeft: '3px solid #3B82F6' }}>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>Capacidade Encontrada (AD/LDAP):</div>
                  <div style={{ fontSize: '14px', color: 'var(--sony-white)' }}>{bot.action}</div>
                </div>

                {bot.status === 'pending' ? (
                  <Button 
                    onClick={() => handleResolveBottleneck(bot)}
                    style={{ width: '100%', background: '#3B82F6', color: 'white', border: 'none', display: 'flex', gap: '8px' }}
                  >
                    <ArrowRight size={16} /> Alocar Recurso e Notificar Equipe
                  </Button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px', color: '#10B981', fontWeight: 'bold', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
                    <CheckCircle2 size={16} /> Recurso Alocado e E-mail Enviado
                  </div>
                )}
              </div>
            ))}
            {bottlenecks.length === 0 && (
              <div style={{ color: '#94A3B8', textAlign: 'center', padding: '32px' }}>
                Nenhum gargalo detectado no momento.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AICopilot;
