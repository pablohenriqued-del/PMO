import React, { useState, useEffect } from "react";
import { 
  FolderOpen, 
  TrendingUp, 
  DollarSign, 
  Users,
  CheckCircle2,
  AlertCircle,
  Activity,
  ArrowRight,
  Star
} from "lucide-react";
import axios from "axios";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [topProjects, setTopProjects] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, projectsRes, activitiesRes] = await Promise.all([
        axios.get(`${API}/dashboard/stats`),
        axios.get(`${API}/projects`),
        axios.get(`${API}/projects/recent-activities`)
      ]);

      setStats(statsRes.data);
      
      // Top 3 Strategic Projects (Sorted by Budget Allocated)
      const sorted = projectsRes.data.sort((a, b) => b.budget_allocated - a.budget_allocated);
      setTopProjects(sorted.slice(0, 3));
      
      setRecentActivities(activitiesRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div data-testid="dashboard-loading" style={{ padding: '32px' }}>
        <div className="skeleton" style={{ height: '28px', width: '300px', marginBottom: '8px' }}></div>
        <div className="skeleton" style={{ height: '400px', width: '100%', borderRadius: '16px' }}></div>
      </div>
    );
  }

  // --- MOCK DATA FOR CHARTS BASED ON STATS ---
  const atRiskProjects = Math.max(0, stats.active_projects - stats.on_track_projects - stats.delayed_projects);
  
  const healthData = [
    { name: 'On Track', value: stats.on_track_projects || 1, color: '#10B981' },
    { name: 'Delayed', value: stats.delayed_projects || 0, color: '#F59E0B' },
    { name: 'At Risk', value: atRiskProjects || 0, color: '#E50914' }
  ];

  // Simulating 6 months of financial history
  const financialData = [
    { month: 'Jan', budget: stats.total_budget * 0.2, revenue: stats.total_revenue_generated * 0.1 },
    { month: 'Feb', budget: stats.total_budget * 0.35, revenue: stats.total_revenue_generated * 0.25 },
    { month: 'Mar', budget: stats.total_budget * 0.5, revenue: stats.total_revenue_generated * 0.4 },
    { month: 'Apr', budget: stats.total_budget * 0.65, revenue: stats.total_revenue_generated * 0.6 },
    { month: 'May', budget: stats.total_budget * 0.8, revenue: stats.total_revenue_generated * 0.85 },
    { month: 'Jun', budget: stats.budget_spent, revenue: stats.total_revenue_generated }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
          <p style={{ color: 'white', fontWeight: 'bold', marginBottom: '8px' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, fontSize: '13px', margin: '4px 0' }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div data-testid="dashboard-container" style={{ paddingBottom: '40px' }}>
      {/* Premium Header */}
      <div className="dashboard-header" style={{ position: 'relative', overflow: 'hidden', padding: '40px 32px' }}>
        <div style={{ position: 'absolute', top: '-50%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(229,9,20,0.15) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0 }}></div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="dashboard-title" style={{ fontSize: '32px', marginBottom: '8px' }}>Executive Dashboard</h1>
          <p className="dashboard-subtitle" style={{ fontSize: '16px', color: '#94A3B8' }}>
            Visão estratégica global, saúde do portfólio e performance financeira
          </p>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card" style={{ background: 'linear-gradient(145deg, rgba(20,20,20,0.8) 0%, rgba(10,10,10,0.9) 100%)' }}>
          <div className="kpi-header">
            <span className="kpi-title">Projetos Ativos</span>
            <div className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6' }}>
              <FolderOpen size={20} />
            </div>
          </div>
          <div className="kpi-value">{stats.active_projects}</div>
          <div className="kpi-change positive">
            <TrendingUp size={16} /> <span>Em execução globalmente</span>
          </div>
        </div>

        <div className="kpi-card" style={{ background: 'linear-gradient(145deg, rgba(20,20,20,0.8) 0%, rgba(10,10,10,0.9) 100%)' }}>
          <div className="kpi-header">
            <span className="kpi-title">Receita Global Gerada</span>
            <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#10B981' }}>{formatCurrency(stats.total_revenue_generated)}</div>
          <div className="kpi-change positive">
            <CheckCircle2 size={16} /> <span>Meta: {formatCurrency(stats.total_revenue_expected)}</span>
          </div>
        </div>

        <div className="kpi-card" style={{ background: 'linear-gradient(145deg, rgba(20,20,20,0.8) 0%, rgba(10,10,10,0.9) 100%)' }}>
          <div className="kpi-header">
            <span className="kpi-title">Budget Consumido</span>
            <div className="kpi-icon" style={{ background: 'rgba(229, 9, 20, 0.2)', color: '#E50914' }}>
              <Activity size={20} />
            </div>
          </div>
          <div className="kpi-value">{formatCurrency(stats.budget_spent)}</div>
          <div className="kpi-change negative">
            <AlertCircle size={16} /> 
            <span>{Math.round((stats.budget_spent / (stats.total_budget || 1)) * 100)}% de {formatCurrency(stats.total_budget)}</span>
          </div>
        </div>

        <div className="kpi-card" style={{ background: 'linear-gradient(145deg, rgba(20,20,20,0.8) 0%, rgba(10,10,10,0.9) 100%)' }}>
          <div className="kpi-header">
            <span className="kpi-title">Alocação de Equipe</span>
            <div className="kpi-icon" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#8B5CF6' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="kpi-value">{stats.team_utilization.toFixed(1)}%</div>
          <div className="kpi-change positive">
            <CheckCircle2 size={16} /> <span>Capacidade saudável</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', padding: '0 32px', marginBottom: '32px' }}>
        
        {/* Financial Heatmap */}
        <div style={{ 
          background: 'rgba(20, 20, 20, 0.6)', backdropFilter: 'blur(16px)', 
          border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '24px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.2)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--pure-white)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp color="#10B981" size={20} />
            Evolução Financeira (Budget vs Receita)
          </h2>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
              <AreaChart data={financialData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E50914" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#E50914" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="revenue" name="Receita Gerada" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="budget" name="Budget Consumido" stroke="#E50914" strokeWidth={3} fillOpacity={1} fill="url(#colorBudget)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Portfolio Health Donut */}
        <div style={{ 
          background: 'rgba(20, 20, 20, 0.6)', backdropFilter: 'blur(16px)', 
          border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '24px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--pure-white)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity color="#3B82F6" size={20} />
            Saúde do Portfólio
          </h2>
          <div style={{ flex: 1, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={healthData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {healthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0 0 8px ${entry.color}66)` }} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                  itemStyle={{ color: 'white' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: '900', color: 'white' }}>{stats.active_projects}</div>
              <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>Projetos</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px' }}>
            {healthData.map(item => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#CBD5E1' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }}></div>
                {item.name}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Section: Top Strategic Projects & Activities */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', padding: '0 32px' }}>
        
        {/* Top 3 Strategic Focus Cards */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--pure-white)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star color="#F59E0B" size={20} />
            Top Projetos Estratégicos
          </h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            {topProjects.map((project, idx) => (
              <div key={project.id} style={{ 
                background: 'linear-gradient(90deg, rgba(20,20,20,0.8) 0%, rgba(30,30,30,0.4) 100%)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '16px', padding: '20px',
                display: 'flex', alignItems: 'center', gap: '24px',
                position: 'relative', overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                transition: 'transform 0.3s ease'
              }} className="strategic-card">
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: idx === 0 ? '#F59E0B' : (idx === 1 ? '#94A3B8' : '#B45309') }}></div>
                
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                  {idx === 0 ? '🥇' : (idx === 1 ? '🥈' : '🥉')}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: 'white', marginBottom: '4px' }}>{project.name}</div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', display: 'flex', gap: '12px' }}>
                    <span>Resp: {project.manager}</span>
                    <span>País: {project.country}</span>
                    <span style={{ color: '#10B981' }}>ROI Esperado: {formatCurrency(project.revenue_expected)}</span>
                  </div>
                </div>

                <div style={{ width: '150px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span style={{ color: '#94A3B8' }}>Progresso</span>
                    <span style={{ color: 'white', fontWeight: 'bold' }}>{project.progress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${project.progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--sony-red), #ff4b4b)', boxShadow: '0 0 10px var(--sony-red)' }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Activity Stream */}
        <div style={{ 
          background: 'rgba(20, 20, 20, 0.6)', backdropFilter: 'blur(16px)', 
          border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '24px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--pure-white)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity color="#8B5CF6" size={20} />
            Live Global Activity
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '350px', paddingRight: '8px' }}>
            {recentActivities.slice(0, 5).map((act, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '12px', borderLeft: `2px solid ${act.type === 'system' ? '#8B5CF6' : 'var(--sony-red)'}` }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '12px', fontWeight: 'bold', color: 'white' }}>
                  {act.type === 'system' ? '🤖' : act.user?.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '2px' }}>
                    <span style={{ color: 'white', fontWeight: 'bold' }}>{act.user}</span> em {act.project_name?.substring(0, 20)}...
                  </div>
                  <div style={{ fontSize: '13px', color: 'white', lineHeight: '1.4' }}>
                    {act.text}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748B', marginTop: '4px' }}>
                    {new Date(act.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </div>
              </div>
            ))}
            {recentActivities.length === 0 && (
              <div style={{ textAlign: 'center', color: '#94A3B8', padding: '20px', fontSize: '13px' }}>Nenhuma atividade recente.</div>
            )}
          </div>
        </div>

      </div>

      <style jsx>{`
        .strategic-card:hover {
          transform: translateX(10px) !important;
          border-color: rgba(255,255,255,0.1) !important;
          background: linear-gradient(90deg, rgba(30,30,30,0.9) 0%, rgba(40,40,40,0.5) 100%) !important;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
