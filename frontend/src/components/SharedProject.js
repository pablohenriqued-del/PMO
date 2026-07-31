import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Shield, Clock, CheckCircle2, DollarSign, Calendar } from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SharedProject = () => {
  const { token } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`${API}/magic-link/${token}`);
        setProject(res.data);
      } catch (e) {
        setError("Projeto não encontrado ou link expirado.");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [token]);

  if (loading) return <div style={{ padding: '40px', color: 'white' }}>Carregando projeto...</div>;
  if (error) return <div style={{ padding: '40px', color: 'var(--sony-red)' }}>{error}</div>;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'radial-gradient(circle at 50% 0%, #1a0505 0%, var(--sony-black) 60%, var(--sony-black) 100%)',
      padding: '40px 20px',
      color: 'white',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="sony-icon" style={{ width: '48px' }}><img src="https://customer-assets.emergentagent.com/b97cd454-e0ea-43f1-a1b4-b498f8280f27" alt="Sony Music" /></div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '18px' }}>Sony Music</div>
              <div style={{ color: 'var(--sony-gray-400)', fontSize: '12px' }}>Portal do Artista / Stakeholder</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontSize: '12px', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '16px' }}>
            <Shield size={14} /> Link Seguro
          </div>
        </div>

        <div style={{
          background: 'rgba(20, 20, 20, 0.6)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.3)'
        }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '16px', background: 'linear-gradient(90deg, #FFF, #AAA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {project.name}
          </h1>
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
            <span className={`status-badge status-${project.status}`}>{project.status.replace('_', ' ')}</span>
            <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '16px' }}>{project.country}</span>
            <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '16px' }}>{project.department}</span>
          </div>

          <p style={{ color: 'var(--sony-gray-400)', lineHeight: '1.6', marginBottom: '32px', fontSize: '15px' }}>
            {project.description || "Nenhuma descrição detalhada disponível."}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--sony-gray-500)', marginBottom: '8px', fontSize: '13px' }}>
                <Calendar size={16} /> Prazo Estimado
              </div>
              <div style={{ fontSize: '16px', fontWeight: '600' }}>
                {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
              </div>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--sony-gray-500)', marginBottom: '8px', fontSize: '13px' }}>
                <Clock size={16} /> Progresso Total
              </div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#10B981' }}>
                {project.progress}%
              </div>
              <div className="progress-bar" style={{ marginTop: '8px', height: '6px' }}>
                <div className="progress-fill" style={{ width: `${project.progress}%`, background: '#10B981' }}></div>
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
            Marcos Principais (Milestones)
          </h3>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            {project.milestones.map((ms, i) => (
              <div key={i} style={{ 
                display: 'flex', alignItems: 'center', gap: '16px', 
                background: ms.completed ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.02)',
                padding: '16px', borderRadius: '12px',
                border: ms.completed ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid transparent'
              }}>
                <div>
                  {ms.completed ? <CheckCircle2 color="#10B981" /> : <Clock color="var(--sony-gray-600)" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: ms.completed ? 'white' : 'var(--sony-gray-300)', textDecoration: ms.completed ? 'line-through' : 'none' }}>
                    {ms.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--sony-gray-500)', marginTop: '4px' }}>
                    Previsto para: {ms.date}
                  </div>
                </div>
              </div>
            ))}
            {project.milestones.length === 0 && <div style={{ color: 'var(--sony-gray-500)' }}>Nenhum marco cadastrado.</div>}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--sony-gray-600)', fontSize: '12px' }}>
          Powered by Sony Music PMO Platform
        </div>
      </div>
    </div>
  );
};

export default SharedProject;
