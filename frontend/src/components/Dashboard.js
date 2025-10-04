import React, { useState, useEffect } from "react";
import { 
  FolderOpen, 
  TrendingUp, 
  DollarSign, 
  Users,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Activity
} from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [streamingData, setStreamingData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, projectsRes, streamingRes] = await Promise.all([
        axios.get(`${API}/dashboard/stats`),
        axios.get(`${API}/projects`),
        axios.get(`${API}/streaming-platforms`)
      ]);

      setStats(statsRes.data);
      setProjects(projectsRes.data.slice(0, 6)); // Show only first 6 projects
      setStreamingData(streamingRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimation: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div data-testid="dashboard-loading">
        <div className="dashboard-header">
          <div className="skeleton" style={{ height: '28px', width: '300px', marginBottom: '8px' }}></div>
          <div className="skeleton" style={{ height: '16px', width: '200px' }}></div>
        </div>
        <div className="kpi-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="kpi-card">
              <div className="skeleton" style={{ height: '60px' }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div data-testid="dashboard-container">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">PMO Dashboard Overview</h1>
        <p className="dashboard-subtitle">
          Real-time insights into digital projects and streaming performance
        </p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card" data-testid="kpi-total-projects">
          <div className="kpi-header">
            <span className="kpi-title">Total Projects</span>
            <div className="kpi-icon" style={{ background: 'var(--sony-red)' }}>
              <FolderOpen size={20} />
            </div>
          </div>
          <div className="kpi-value">{stats?.total_projects || 0}</div>
          <div className="kpi-change positive">
            <TrendingUp size={16} />
            <span>+12% from last month</span>
          </div>
        </div>

        <div className="kpi-card" data-testid="kpi-active-projects">
          <div className="kpi-header">
            <span className="kpi-title">Active Projects</span>
            <div className="kpi-icon" style={{ background: '#10B981' }}>
              <Activity size={20} />
            </div>
          </div>
          <div className="kpi-value">{stats?.active_projects || 0}</div>
          <div className="kpi-change positive">
            <TrendingUp size={16} />
            <span>+8% from last month</span>
          </div>
        </div>

        <div className="kpi-card" data-testid="kpi-budget-utilization">
          <div className="kpi-header">
            <span className="kpi-title">Budget Utilization</span>
            <div className="kpi-icon" style={{ background: '#F59E0B' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="kpi-value">
            {stats ? Math.round((stats.budget_spent / stats.total_budget) * 100) : 0}%
          </div>
          <div className="kpi-change negative">
            <AlertCircle size={16} />
            <span>Above target by 5%</span>
          </div>
        </div>

        <div className="kpi-card" data-testid="kpi-team-utilization">
          <div className="kpi-header">
            <span className="kpi-title">Team Utilization</span>
            <div className="kpi-icon" style={{ background: '#6366F1' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="kpi-value">{stats?.team_utilization?.toFixed(1) || 0}%</div>
          <div className="kpi-change positive">
            <CheckCircle2 size={16} />
            <span>Optimal level</span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', padding: '0 32px', marginBottom: '32px' }}>
        
        {/* Active Projects */}
        <div style={{ background: 'var(--sony-white)', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--sony-gray-900)' }}>
              Active Projects
            </h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ 
                padding: '4px 12px', 
                background: 'rgba(16, 185, 129, 0.1)', 
                color: '#10B981',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {stats?.on_track_projects || 0} On Track
              </span>
              <span style={{ 
                padding: '4px 12px', 
                background: 'rgba(229, 9, 20, 0.1)', 
                color: 'var(--sony-red)',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {stats?.delayed_projects || 0} Delayed
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            {projects.map((project) => (
              <div 
                key={project.id} 
                className="project-card"
                style={{ 
                  padding: '16px',
                  background: 'var(--sony-gray-50)',
                  border: '1px solid var(--sony-gray-200)',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
                data-testid={`project-card-${project.id}`}
              >
                <div className="project-header">
                  <div>
                    <h3 className="project-title" style={{ fontSize: '16px' }}>{project.name}</h3>
                    <p className="project-manager">Manager: {project.manager}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`status-badge status-${project.status}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                    <span className={`priority-badge priority-${project.priority}`}>
                      {project.priority}
                    </span>
                  </div>
                </div>

                <div className="progress-container">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className="progress-label">Progress</span>
                    <span className="progress-value">{project.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="budget-display">
                  <div className="budget-item">
                    <div className="budget-label">Allocated</div>
                    <div className="budget-amount">{formatCurrency(project.budget_allocated)}</div>
                  </div>
                  <div className="budget-item">
                    <div className="budget-label">Spent</div>
                    <div className="budget-amount">{formatCurrency(project.budget_spent)}</div>
                  </div>
                  <div className="budget-item">
                    <div className="budget-label">Remaining</div>
                    <div className="budget-amount" style={{ 
                      color: project.budget_spent > project.budget_allocated ? 'var(--sony-red)' : '#10B981' 
                    }}>
                      {formatCurrency(project.budget_allocated - project.budget_spent)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Streaming Performance */}
        <div style={{ background: 'var(--sony-white)', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--sony-gray-900)', marginBottom: '24px' }}>
            Streaming Performance
          </h2>

          <div style={{ display: 'grid', gap: '16px' }}>
            {streamingData.map((platform, index) => (
              <div 
                key={platform.name}
                style={{ 
                  padding: '16px',
                  background: 'var(--sony-gray-50)',
                  borderRadius: '12px',
                  border: '1px solid var(--sony-gray-200)'
                }}
                data-testid={`streaming-platform-${platform.name.toLowerCase().replace(' ', '-')}`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--sony-gray-900)' }}>
                    {platform.name}
                  </h4>
                  <span style={{ 
                    fontSize: '12px', 
                    fontWeight: '600',
                    color: platform.growth > 10 ? '#10B981' : '#F59E0B'
                  }}>
                    +{platform.growth}%
                  </span>
                </div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--sony-gray-900)', marginBottom: '8px' }}>
                  {formatNumber(platform.streams)} streams
                </div>
                <div className="progress-bar" style={{ height: '6px' }}>
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${Math.min((platform.streams / 2500000000) * 100, 100)}%`,
                      background: platform.growth > 10 ? '#10B981' : '#F59E0B'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div style={{ 
            marginTop: '24px', 
            padding: '16px',
            background: 'linear-gradient(135deg, var(--sony-black) 0%, var(--sony-gray-900) 100%)',
            borderRadius: '12px',
            color: 'var(--sony-white)'
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
              Recent Activities
            </h4>
            <div style={{ fontSize: '12px', lineHeight: '1.5', color: 'var(--sony-gray-300)' }}>
              <div style={{ marginBottom: '8px' }}>• Bad Bunny campaign completed with 150M+ streams</div>
              <div style={{ marginBottom: '8px' }}>• Airplane platform milestone achieved</div>
              <div style={{ marginBottom: '8px' }}>• SMERA legal review in progress</div>
              <div>• Q3 budget review scheduled for next week</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;