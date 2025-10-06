import React, { useState, useEffect } from "react";
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  PieChart,
  BarChart3,
  Filter,
  Download,
  Calendar
} from "lucide-react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Budget = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [managerFilter, setManagerFilter] = useState("all");
  const [managers, setManagers] = useState([]);
  const [budgetSummary, setBudgetSummary] = useState(null);

  useEffect(() => {
    fetchProjects();
    fetchManagers();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, statusFilter, managerFilter]);

  useEffect(() => {
    calculateBudgetSummary();
  }, [filteredProjects]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await axios.get(`${API}/managers`);
      setManagers(response.data);
    } catch (error) {
      console.error('Error fetching managers:', error);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    if (statusFilter !== "all") {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    if (managerFilter !== "all") {
      filtered = filtered.filter(project => project.manager === managerFilter);
    }

    setFilteredProjects(filtered);
  };

  const calculateBudgetSummary = () => {
    if (filteredProjects.length === 0) {
      setBudgetSummary(null);
      return;
    }

    const totalAllocated = filteredProjects.reduce((sum, project) => sum + project.budget_allocated, 0);
    const totalSpent = filteredProjects.reduce((sum, project) => sum + project.budget_spent, 0);
    const totalRemaining = totalAllocated - totalSpent;
    const utilizationRate = (totalSpent / totalAllocated) * 100;

    // Budget by status
    const budgetByStatus = filteredProjects.reduce((acc, project) => {
      const status = project.status;
      if (!acc[status]) {
        acc[status] = { allocated: 0, spent: 0, count: 0 };
      }
      acc[status].allocated += project.budget_allocated;
      acc[status].spent += project.budget_spent;
      acc[status].count += 1;
      return acc;
    }, {});

    // Budget by manager
    const budgetByManager = filteredProjects.reduce((acc, project) => {
      const manager = project.manager;
      if (!acc[manager]) {
        acc[manager] = { allocated: 0, spent: 0, count: 0 };
      }
      acc[manager].allocated += project.budget_allocated;
      acc[manager].spent += project.budget_spent;
      acc[manager].count += 1;
      return acc;
    }, {});

    // Projects with budget variance
    const projectsWithVariance = filteredProjects.map(project => ({
      ...project,
      variance: project.budget_spent - project.budget_allocated,
      variancePercentage: ((project.budget_spent - project.budget_allocated) / project.budget_allocated) * 100
    })).sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance));

    setBudgetSummary({
      totalAllocated,
      totalSpent,
      totalRemaining,
      utilizationRate,
      budgetByStatus,
      budgetByManager,
      projectsWithVariance: projectsWithVariance.slice(0, 10) // Top 10 by variance
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getVarianceColor = (variance) => {
    if (variance > 0) return 'var(--sony-red)';
    if (variance < 0) return '#10B981';
    return 'var(--sony-gray-600)';
  };

  const getVarianceIcon = (variance) => {
    if (variance > 0) return <TrendingUp size={16} />;
    if (variance < 0) return <TrendingDown size={16} />;
    return <DollarSign size={16} />;
  };

  if (loading) {
    return (
      <div data-testid="budget-loading">
        <div className="dashboard-header">
          <div className="skeleton" style={{ height: '28px', width: '200px', marginBottom: '8px' }}></div>
          <div className="skeleton" style={{ height: '16px', width: '300px' }}></div>
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
    <div data-testid="budget-container">
      {/* Header */}
      <div className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="dashboard-title">Budget Management</h1>
            <p className="dashboard-subtitle">
              Financial overview and budget analysis for all projects
            </p>
          </div>
          <Button 
            style={{ 
              background: 'var(--sony-red)',
              color: 'white',
              border: 'none'
            }}
            onClick={handleExportReport}
            data-testid="export-budget-btn"
          >
            <Download size={16} style={{ marginRight: '8px' }} />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ 
        background: 'var(--sony-white)', 
        padding: '24px 32px', 
        borderBottom: '1px solid var(--sony-gray-200)',
        marginBottom: '32px'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr auto', 
          gap: '16px',
          alignItems: 'end'
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: 'var(--sony-gray-700)',
              marginBottom: '8px'
            }}>
              Status Filter
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="budget-status-filter">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: 'var(--sony-gray-700)',
              marginBottom: '8px'
            }}>
              Manager Filter
            </label>
            <Select value={managerFilter} onValueChange={setManagerFilter}>
              <SelectTrigger data-testid="budget-manager-filter">
                <SelectValue placeholder="All Managers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Managers</SelectItem>
                {managers.map(manager => (
                  <SelectItem key={manager} value={manager}>{manager}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="var(--sony-gray-600)" />
            <span style={{ fontSize: '14px', color: 'var(--sony-gray-600)' }}>
              {filteredProjects.length} projects
            </span>
          </div>
        </div>
      </div>

      {budgetSummary && (
        <>
          {/* Budget Overview KPIs */}
          <div className="kpi-grid">
            <div className="kpi-card" data-testid="kpi-total-allocated">
              <div className="kpi-header">
                <span className="kpi-title">Total Allocated</span>
                <div className="kpi-icon" style={{ background: '#3B82F6' }}>
                  <DollarSign size={20} />
                </div>
              </div>
              <div className="kpi-value">{formatCurrency(budgetSummary.totalAllocated)}</div>
              <div className="kpi-change positive">
                <TrendingUp size={16} />
                <span>Portfolio budget</span>
              </div>
            </div>

            <div className="kpi-card" data-testid="kpi-total-spent">
              <div className="kpi-header">
                <span className="kpi-title">Total Spent</span>
                <div className="kpi-icon" style={{ background: 'var(--sony-red)' }}>
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="kpi-value">{formatCurrency(budgetSummary.totalSpent)}</div>
              <div className="kpi-change negative">
                <TrendingDown size={16} />
                <span>{budgetSummary.utilizationRate.toFixed(1)}% utilization</span>
              </div>
            </div>

            <div className="kpi-card" data-testid="kpi-remaining-budget">
              <div className="kpi-header">
                <span className="kpi-title">Remaining Budget</span>
                <div className="kpi-icon" style={{ background: budgetSummary.totalRemaining >= 0 ? '#10B981' : 'var(--sony-red)' }}>
                  {budgetSummary.totalRemaining >= 0 ? <TrendingUp size={20} /> : <AlertTriangle size={20} />}
                </div>
              </div>
              <div className="kpi-value" style={{ color: budgetSummary.totalRemaining >= 0 ? '#10B981' : 'var(--sony-red)' }}>
                {formatCurrency(budgetSummary.totalRemaining)}
              </div>
              <div className={`kpi-change ${budgetSummary.totalRemaining >= 0 ? 'positive' : 'negative'}`}>
                {budgetSummary.totalRemaining >= 0 ? <TrendingUp size={16} /> : <AlertTriangle size={16} />}
                <span>{budgetSummary.totalRemaining >= 0 ? 'Within budget' : 'Over budget'}</span>
              </div>
            </div>

            <div className="kpi-card" data-testid="kpi-budget-efficiency">
              <div className="kpi-header">
                <span className="kpi-title">Budget Efficiency</span>
                <div className="kpi-icon" style={{ background: '#F59E0B' }}>
                  <PieChart size={20} />
                </div>
              </div>
              <div className="kpi-value">{(100 - budgetSummary.utilizationRate).toFixed(1)}%</div>
              <div className="kpi-change positive">
                <BarChart3 size={16} />
                <span>Available capacity</span>
              </div>
            </div>
          </div>

          {/* Budget Analysis */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '32px', 
            padding: '0 32px',
            marginBottom: '32px'
          }}>
            
            {/* Budget by Status */}
            <div style={{ 
              background: 'var(--sony-white)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
              border: '1px solid var(--sony-gray-200)'
            }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '700', 
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <PieChart size={20} />
                Budget by Status
              </h3>
              
              <div style={{ display: 'grid', gap: '16px' }}>
                {Object.entries(budgetSummary.budgetByStatus).map(([status, data]) => (
                  <div 
                    key={status}
                    style={{ 
                      padding: '16px',
                      background: 'var(--sony-gray-50)',
                      borderRadius: '12px',
                      border: '1px solid var(--sony-gray-200)'
                    }}
                    data-testid={`budget-by-status-${status}`}
                  >
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <span className={`status-badge status-${status}`} style={{ fontSize: '11px' }}>
                        {status.replace('_', ' ')} ({data.count})
                      </span>
                      <span style={{ 
                        fontSize: '12px',
                        fontWeight: '600',
                        color: data.spent > data.allocated ? 'var(--sony-red)' : '#10B981'
                      }}>
                        {((data.spent / data.allocated) * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '14px',
                        marginBottom: '4px'
                      }}>
                        <span>Allocated:</span>
                        <strong>{formatCurrency(data.allocated)}</strong>
                      </div>
                      <div style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '14px'
                      }}>
                        <span>Spent:</span>
                        <strong style={{ color: 'var(--sony-red)' }}>
                          {formatCurrency(data.spent)}
                        </strong>
                      </div>
                    </div>

                    <div className="progress-bar" style={{ height: '6px' }}>
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${Math.min((data.spent / data.allocated) * 100, 100)}%`,
                          background: data.spent > data.allocated ? 'var(--sony-red)' : '#10B981'
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget by Manager */}
            <div style={{ 
              background: 'var(--sony-white)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
              border: '1px solid var(--sony-gray-200)'
            }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '700', 
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <BarChart3 size={20} />
                Budget by Manager
              </h3>
              
              <div style={{ display: 'grid', gap: '16px' }}>
                {Object.entries(budgetSummary.budgetByManager)
                  .sort(([,a], [,b]) => b.allocated - a.allocated)
                  .map(([manager, data]) => (
                  <div 
                    key={manager}
                    style={{ 
                      padding: '16px',
                      background: 'var(--sony-gray-50)',
                      borderRadius: '12px',
                      border: '1px solid var(--sony-gray-200)'
                    }}
                    data-testid={`budget-by-manager-${manager.replace(' ', '-').toLowerCase()}`}
                  >
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <span style={{ 
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'var(--sony-gray-900)'
                      }}>
                        {manager} ({data.count} projects)
                      </span>
                      <span style={{ 
                        fontSize: '12px',
                        fontWeight: '600',
                        color: data.spent > data.allocated ? 'var(--sony-red)' : '#10B981'
                      }}>
                        {((data.spent / data.allocated) * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '14px',
                        marginBottom: '4px'
                      }}>
                        <span>Allocated:</span>
                        <strong>{formatCurrency(data.allocated)}</strong>
                      </div>
                      <div style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '14px'
                      }}>
                        <span>Spent:</span>
                        <strong style={{ color: 'var(--sony-red)' }}>
                          {formatCurrency(data.spent)}
                        </strong>
                      </div>
                    </div>

                    <div className="progress-bar" style={{ height: '6px' }}>
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${Math.min((data.spent / data.allocated) * 100, 100)}%`,
                          background: data.spent > data.allocated ? 'var(--sony-red)' : '#10B981'
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Budget Variance Analysis */}
          <div style={{ padding: '0 32px' }}>
            <div style={{ 
              background: 'var(--sony-white)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
              border: '1px solid var(--sony-gray-200)'
            }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '700', 
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertTriangle size={20} />
                Budget Variance Analysis
              </h3>
              
              <div style={{ 
                background: 'var(--sony-gray-50)',
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                {/* Table Header */}
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 120px',
                  gap: '16px',
                  padding: '16px 20px',
                  background: 'var(--sony-gray-100)',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--sony-gray-700)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <div>Project</div>
                  <div style={{ textAlign: 'right' }}>Allocated</div>
                  <div style={{ textAlign: 'right' }}>Spent</div>
                  <div style={{ textAlign: 'right' }}>Variance</div>
                  <div style={{ textAlign: 'right' }}>Variance %</div>
                  <div style={{ textAlign: 'center' }}>Status</div>
                </div>

                {/* Table Rows */}
                {budgetSummary.projectsWithVariance.map((project, index) => (
                  <div 
                    key={project.id}
                    style={{ 
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 120px',
                      gap: '16px',
                      padding: '16px 20px',
                      background: index % 2 === 0 ? 'var(--sony-white)' : 'var(--sony-gray-50)',
                      borderTop: index > 0 ? '1px solid var(--sony-gray-200)' : 'none',
                      alignItems: 'center',
                      fontSize: '14px'
                    }}
                    data-testid={`variance-project-${project.id}`}
                  >
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                        {project.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--sony-gray-600)' }}>
                        {project.manager}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontWeight: '600' }}>
                      {formatCurrency(project.budget_allocated)}
                    </div>
                    <div style={{ textAlign: 'right', fontWeight: '600', color: 'var(--sony-red)' }}>
                      {formatCurrency(project.budget_spent)}
                    </div>
                    <div style={{ 
                      textAlign: 'right', 
                      fontWeight: '700',
                      color: getVarianceColor(project.variance),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '4px'
                    }}>
                      {getVarianceIcon(project.variance)}
                      {project.variance >= 0 ? '+' : ''}{formatCurrency(project.variance)}
                    </div>
                    <div style={{ 
                      textAlign: 'right', 
                      fontWeight: '700',
                      color: getVarianceColor(project.variance)
                    }}>
                      {project.variancePercentage >= 0 ? '+' : ''}{project.variancePercentage.toFixed(1)}%
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span className={`status-badge status-${project.status}`} style={{ fontSize: '10px' }}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && filteredProjects.length === 0 && (
        <div style={{ 
          textAlign: 'center',
          padding: '64px 32px',
          color: 'var(--sony-gray-600)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            No budget data available
          </h3>
          <p>Try adjusting your filters to see budget information</p>
        </div>
      )}
    </div>
  );
};

export default Budget;