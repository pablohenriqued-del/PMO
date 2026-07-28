import React, { useState, useEffect } from "react";
import { LayoutGrid, Plus, DollarSign, Globe, Music, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CRMDashboard = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    country: 'Global',
    estimated_revenue: '',
    estimated_cost: ''
  });

  const columns = [
    { id: 'lead', title: '💡 Lead / Ideia', color: '#3B82F6' },
    { id: 'negotiation', title: '📊 Em Negociação', color: '#F59E0B' },
    { id: 'closed_won', title: '✅ Closed Won (Aprovado)', color: '#10B981' },
    { id: 'closed_lost', title: '❌ Closed Lost', color: 'var(--sony-red)' }
  ];

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/crm/opportunities`);
      setOpportunities(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData("opp_id", id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
    e.currentTarget.style.border = '2px dashed rgba(229, 9, 20, 0.5)';
  };

  const handleDragLeave = (e) => {
    e.currentTarget.style.background = 'transparent';
    e.currentTarget.style.border = '1px solid var(--sony-gray-200)';
  };

  const handleDrop = async (e, stage) => {
    e.preventDefault();
    e.currentTarget.style.background = 'transparent';
    e.currentTarget.style.border = '1px solid var(--sony-gray-200)';
    
    const opp_id = e.dataTransfer.getData("opp_id");
    if (!opp_id) return;

    const opp = opportunities.find(o => o.id === opp_id);
    if (opp && opp.stage !== stage) {
      // Optimistic UI update
      setOpportunities(prev => prev.map(o => o.id === opp_id ? { ...o, stage } : o));
      
      try {
        const res = await axios.put(`${API}/crm/opportunities/${opp_id}/stage?stage=${stage}`);
        if (stage === 'closed_won') {
          alert("🎉 Oportunidade Convertida! Um novo Projeto foi gerado automaticamente e o Budget transferido.");
        }
      } catch (err) {
        console.error("Error updating stage", err);
        fetchOpportunities(); // revert on error
      }
    }
  };

  const handleSaveOpp = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/crm/opportunities`, {
        ...formData,
        estimated_revenue: parseFloat(formData.estimated_revenue) || 0,
        estimated_cost: parseFloat(formData.estimated_cost) || 0,
        stage: 'lead'
      });
      await fetchOpportunities();
      setIsModalOpen(false);
      setFormData({ title: '', artist: '', country: 'Global', estimated_revenue: '', estimated_cost: '' });
    } catch (err) {
      alert("Erro ao criar oportunidade.");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  };

  if (loading && opportunities.length === 0) {
    return <div style={{ padding: '32px' }}><div className="skeleton" style={{ height: '400px' }}></div></div>;
  }

  return (
    <div data-testid="crm-dashboard-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="dashboard-header" style={{ marginBottom: '24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <LayoutGrid color="var(--sony-red)" size={32} />
              Demand Management (CRM)
            </h1>
            <p className="dashboard-subtitle">
              Gestão de Oportunidades. Arraste para "Closed Won" para criar o projeto automaticamente.
            </p>
          </div>
          <Button 
            style={{ background: 'var(--sony-red)', color: 'white', border: 'none' }}
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} style={{ marginRight: '8px' }} />
            New Opportunity
          </Button>
        </div>
      </div>

      <div style={{ 
        flex: 1, 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, minmax(280px, 1fr))', 
        gap: '24px', 
        padding: '0 32px 32px',
        overflowX: 'auto',
        alignItems: 'start'
      }}>
        {columns.map(col => {
          const colOpps = opportunities.filter(o => o.stage === col.id);
          const totalRev = colOpps.reduce((sum, o) => sum + o.estimated_revenue, 0);
          
          return (
            <div 
              key={col.id}
              style={{
                background: 'rgba(20, 20, 20, 0.4)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--sony-gray-200)',
                borderRadius: '16px',
                minHeight: '600px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease'
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div style={{ 
                padding: '20px', 
                borderBottom: `3px solid ${col.color}`,
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '16px 16px 0 0'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--sony-white)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {col.title}
                  <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>
                    {colOpps.length}
                  </span>
                </h3>
                <div style={{ fontSize: '13px', color: col.color, fontWeight: 'bold', marginTop: '8px' }}>
                  {formatCurrency(totalRev)}
                </div>
              </div>

              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
                {colOpps.map(opp => (
                  <div 
                    key={opp.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, opp.id)}
                    style={{
                      background: 'rgba(30, 30, 30, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'grab',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      position: 'relative'
                    }}
                    onDragEnd={(e) => e.currentTarget.style.opacity = '1'}
                    onDrag={(e) => e.currentTarget.style.opacity = '0.5'}
                  >
                    <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--sony-white)', marginBottom: '8px', lineHeight: '1.3' }}>
                      {opp.title}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--sony-gray-400)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Music size={12} color="var(--sony-gray-500)" /> {opp.artist}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Globe size={12} color="var(--sony-gray-500)" /> {opp.country}
                      </div>
                    </div>
                    
                    <div style={{ 
                      marginTop: '12px', 
                      paddingTop: '12px', 
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--sony-gray-600)' }}>Receita Estimada</div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#10B981' }}>{formatCurrency(opp.estimated_revenue)}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--sony-gray-600)' }}>Custo (Budget)</div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--sony-red)' }}>{formatCurrency(opp.estimated_cost)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="project-detail-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">✕</button>
            <div className="modal-header">
              <h1>Nova Oportunidade (Lead)</h1>
              <p style={{ color: 'var(--sony-gray-600)', fontSize: '14px', marginBottom: '24px' }}>
                Cadastre uma nova demanda/projeto no funil.
              </p>
            </div>
            <form onSubmit={handleSaveOpp} style={{ display: 'grid', gap: '20px' }}>
              <div>
                <Label>Título da Oportunidade *</Label>
                <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="Ex: Turnê Shakira Brasil" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <Label>Artista / Cliente *</Label>
                  <Input value={formData.artist} onChange={e => setFormData({...formData, artist: e.target.value})} required />
                </div>
                <div>
                  <Label>País *</Label>
                  <Input value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <Label>Receita Estimada (USD) *</Label>
                  <Input type="number" min="0" value={formData.estimated_revenue} onChange={e => setFormData({...formData, estimated_revenue: e.target.value})} required />
                </div>
                <div>
                  <Label>Custo Estimado (USD) *</Label>
                  <Input type="number" min="0" value={formData.estimated_cost} onChange={e => setFormData({...formData, estimated_cost: e.target.value})} required />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit" style={{ background: 'var(--sony-red)', color: 'white', border: 'none' }}>Salvar Lead</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMDashboard;
