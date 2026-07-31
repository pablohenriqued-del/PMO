import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  Shield, 
  TrendingUp,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Search
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RiskRadar = () => {
  const [risks, setRisks] = useState([]);
  const [filteredRisks, setFilteredRisks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isCreateRiskModalOpen, setIsCreateRiskModalOpen] = useState(false);
  const [isEditRiskModalOpen, setIsEditRiskModalOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [newRisk, setNewRisk] = useState({
    project: '',
    risk: '',
    probability: 'Medium',
    impact: 'Medium',
    category: 'Technical',
    mitigation: '',
    owner: ''
  });
  const [editRisk, setEditRisk] = useState({
    project: '',
    risk: '',
    probability: 'Medium',
    impact: 'Medium',
    category: 'Technical',
    mitigation: '',
    owner: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchRisks();
  }, []);

  useEffect(() => {
    filterRisks();
  }, [risks, searchQuery, severityFilter, statusFilter, categoryFilter]);

    const fetchRisks = async () => {
    try {
      setLoading(true);
      const [risksRes, projRes] = await Promise.all([
        axios.get(`${API}/risk-radar`),
        axios.get(`${API}/projects`)
      ]);
      setRisks(risksRes.data);
      setProjects(projRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRisks = () => {
    let filtered = [...risks];

    if (searchQuery) {
      filtered = filtered.filter(risk => 
        risk.risk.toLowerCase().includes(searchQuery.toLowerCase()) ||
        risk.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
        risk.mitigation.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (severityFilter !== "all") {
      filtered = filtered.filter(risk => risk.severity === severityFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(risk => risk.status === statusFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(risk => risk.category === categoryFilter);
    }

    setFilteredRisks(filtered);
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'var(--sony-red)';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      case 'low': return '#10B981';
      default: return 'var(--sony-gray-600)';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return <AlertTriangle size={16} />;
      case 'monitoring': return <Eye size={16} />;
      case 'mitigated': return <CheckCircle size={16} />;
      case 'resolved': return <Shield size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'var(--sony-red)';
      case 'monitoring': return '#F59E0B';
      case 'mitigated': return '#3B82F6';
      case 'resolved': return '#10B981';
      default: return 'var(--sony-gray-600)';
    }
  };

  const getProbabilityWeight = (probability) => {
    switch (probability.toLowerCase()) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  };

  const getImpactWeight = (impact) => {
    switch (impact.toLowerCase()) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  };

  const calculateRiskScore = (probability, impact) => {
    return getProbabilityWeight(probability) * getImpactWeight(impact);
  };

  const handleCreateRisk = async (e) => {
    e.preventDefault();
    try {
      const riskScore = calculateRiskScore(newRisk.probability, newRisk.impact);
      let severity = 'Low';
      if (riskScore >= 9) severity = 'Critical';
      else if (riskScore >= 6) severity = 'High';
      else if (riskScore >= 3) severity = 'Medium';

      const riskData = {
        ...newRisk,
        severity,
        status: 'Active'
      };
      
      const response = await axios.post(`${API}/risk-radar`, riskData);
      setRisks(prev => [...prev, response.data]);
      
      // Reset form
      setNewRisk({
        project: '',
        risk: '',
        probability: 'Medium',
        impact: 'Medium',
        category: 'Technical',
        mitigation: '',
        owner: ''
      });
      
      setIsCreateRiskModalOpen(false);
      alert("Risk reported successfully!");
    } catch (error) {
      console.error('Error creating risk:', error);
      alert("Error: Failed to report risk. Please try again.");
    }
  };

  const handleUpdateRisk = async (e) => {
    e.preventDefault();
    try {
      const riskScore = calculateRiskScore(editRisk.probability, editRisk.impact);
      let severity = 'Low';
      if (riskScore >= 9) severity = 'Critical';
      else if (riskScore >= 6) severity = 'High';
      else if (riskScore >= 3) severity = 'Medium';

      const riskData = {
        ...editRisk,
        severity
      };
      
      const response = await axios.put(`${API}/risk-radar/${selectedRisk.id}`, riskData);
      setRisks(prev => prev.map(r => r.id === selectedRisk.id ? response.data : r));
      
      setIsEditRiskModalOpen(false);
      setSelectedRisk(null);
      alert("Risk updated successfully!");
    } catch (error) {
      console.error('Error updating risk:', error);
      alert("Error: Failed to update risk. Please try again.");
    }
  };

  const openEditModal = (risk) => {
    setSelectedRisk(risk);
    setEditRisk({
      project: risk.project,
      risk: risk.risk,
      probability: risk.probability,
      impact: risk.impact,
      category: risk.category,
      mitigation: risk.mitigation,
      owner: risk.owner,
      status: risk.status
    });
    setIsEditRiskModalOpen(true);
  };

  if (loading) {
    return (
      <div data-testid="risk-radar-loading">
        <div className="dashboard-header">
          <div className="skeleton" style={{ height: '28px', width: '200px', marginBottom: '8px' }}></div>
          <div className="skeleton" style={{ height: '16px', width: '300px' }}></div>
        </div>
        <div className="kpi-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="kpi-card">
              <div className="skeleton" style={{ height: '80px' }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Calculate risk statistics
  const totalRisks = filteredRisks.length;
  const criticalRisks = filteredRisks.filter(r => r.severity === 'Critical').length;
  const activeRisks = filteredRisks.filter(r => r.status === 'Active').length;
  const mitigatedRisks = filteredRisks.filter(r => r.status === 'Mitigated').length;

  return (
    <div data-testid="risk-radar-container">
      {/* Header */}
      <div className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="dashboard-title">Risk Radar</h1>
            <p className="dashboard-subtitle">
              Real-time risk assessment and mitigation tracking across all projects
            </p>
          </div>
          <Button 
            style={{ 
              background: 'var(--sony-red)',
              color: 'white',
              border: 'none'
            }}
            onClick={() => setIsCreateRiskModalOpen(true)}
            data-testid="add-risk-btn"
          >
            <AlertTriangle size={16} style={{ marginRight: '8px' }} />
            Report Risk
          </Button>
        </div>
      </div>

      {/* Risk KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card" data-testid="kpi-total-risks">
          <div className="kpi-header">
            <span className="kpi-title">Total Risks</span>
            <div className="kpi-icon" style={{ background: 'var(--sony-gray-700)' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="kpi-value">{totalRisks}</div>
          <div className="kpi-change positive">
            <TrendingUp size={16} />
            <span>Portfolio overview</span>
          </div>
        </div>

        <div className="kpi-card" data-testid="kpi-critical-risks">
          <div className="kpi-header">
            <span className="kpi-title">Critical Risks</span>
            <div className="kpi-icon" style={{ background: 'var(--sony-red)' }}>
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: 'var(--sony-red)' }}>{criticalRisks}</div>
          <div className="kpi-change negative">
            <AlertTriangle size={16} />
            <span>Immediate attention</span>
          </div>
        </div>

        <div className="kpi-card" data-testid="kpi-active-risks">
          <div className="kpi-header">
            <span className="kpi-title">Active Risks</span>
            <div className="kpi-icon" style={{ background: '#F59E0B' }}>
              <Eye size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#F59E0B' }}>{activeRisks}</div>
          <div className="kpi-change negative">
            <AlertCircle size={16} />
            <span>Monitoring required</span>
          </div>
        </div>

        <div className="kpi-card" data-testid="kpi-mitigated-risks">
          <div className="kpi-header">
            <span className="kpi-title">Mitigated Risks</span>
            <div className="kpi-icon" style={{ background: '#10B981' }}>
              <Shield size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#10B981' }}>{mitigatedRisks}</div>
          <div className="kpi-change positive">
            <CheckCircle size={16} />
            <span>Under control</span>
          </div>
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
          gridTemplateColumns: '2fr 1fr 1fr 1fr', 
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
              Search Risks
            </label>
            <div style={{ position: 'relative' }}>
              <Search 
                size={20} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: 'var(--sony-gray-400)'
                }} 
              />
              <Input
                placeholder="Search risks, projects, or mitigations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '44px' }}
                data-testid="risks-search"
              />
            </div>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: 'var(--sony-gray-700)',
              marginBottom: '8px'
            }}>
              Severity
            </label>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger data-testid="severity-filter">
                <SelectValue placeholder="All Severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
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
              Status
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="status-filter">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Monitoring">Monitoring</SelectItem>
                <SelectItem value="Mitigated">Mitigated</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
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
              Category
            </label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger data-testid="category-filter">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Technical">Technical</SelectItem>
                <SelectItem value="Compliance">Compliance</SelectItem>
                <SelectItem value="Market">Market</SelectItem>
                <SelectItem value="Operational">Operational</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Risk Matrix */}
      <div style={{ padding: '0 32px', marginBottom: '32px' }}>
        <div style={{ 
          background: 'var(--sony-white)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
          border: '1px solid var(--sony-gray-200)',
          marginBottom: '32px'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} />
            Risk Assessment Matrix
          </h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid var(--sony-gray-200)', fontSize: '14px', fontWeight: '600' }}>Risk</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid var(--sony-gray-200)', fontSize: '14px', fontWeight: '600' }}>Project</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid var(--sony-gray-200)', fontSize: '14px', fontWeight: '600' }}>Probability</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid var(--sony-gray-200)', fontSize: '14px', fontWeight: '600' }}>Impact</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid var(--sony-gray-200)', fontSize: '14px', fontWeight: '600' }}>Risk Score</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid var(--sony-gray-200)', fontSize: '14px', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid var(--sony-gray-200)', fontSize: '14px', fontWeight: '600' }}>Mitigation</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid var(--sony-gray-200)', fontSize: '14px', fontWeight: '600' }}>Owner</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid var(--sony-gray-200)', fontSize: '14px', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRisks.map((risk, index) => {
                  const riskScore = calculateRiskScore(risk.probability, risk.impact);
                  return (
                    <tr key={risk.id} style={{ borderBottom: '1px solid var(--sony-gray-200)' }} data-testid={`risk-${risk.id}`}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ 
                            width: '8px', 
                            height: '8px', 
                            borderRadius: '50%', 
                            background: getSeverityColor(risk.severity)
                          }}></div>
                          <span style={{ fontSize: '14px', fontWeight: '600' }}>{risk.risk}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px' }}>{risk.project}</td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <span style={{ 
                          fontSize: '12px',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          background: risk.probability === 'High' ? '#FEF2F2' : risk.probability === 'Medium' ? '#FEF9C3' : '#F0F9FF',
                          color: risk.probability === 'High' ? '#DC2626' : risk.probability === 'Medium' ? '#D97706' : '#2563EB'
                        }}>
                          {risk.probability}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <span style={{ 
                          fontSize: '12px',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          background: getSeverityColor(risk.impact) + '20',
                          color: getSeverityColor(risk.impact)
                        }}>
                          {risk.impact}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ 
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: riskScore >= 9 ? 'var(--sony-red)' : riskScore >= 6 ? '#F59E0B' : riskScore >= 3 ? '#3B82F6' : '#10B981',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: '700',
                          margin: '0 auto'
                        }}>
                          {riskScore}
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          gap: '4px',
                          color: getStatusColor(risk.status)
                        }}>
                          {getStatusIcon(risk.status)}
                          <span style={{ fontSize: '12px', fontWeight: '600' }}>{risk.status}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', maxWidth: '200px' }}>
                        {risk.mitigation.length > 50 ? risk.mitigation.substring(0, 50) + '...' : risk.mitigation}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px' }}>{risk.owner}</td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(risk)}
                          data-testid={`edit-risk-${risk.id}`}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!loading && filteredRisks.length === 0 && (
        <div style={{ 
          textAlign: 'center',
          padding: '64px 32px',
          color: 'var(--sony-gray-600)'
        }}>
          <Shield size={48} style={{ marginBottom: '16px', color: 'var(--sony-gray-400)' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            No risks found
          </h3>
          <p>Try adjusting your search criteria or filters</p>
        </div>
      )}

      {/* Create Risk Modal */}
      {isCreateRiskModalOpen && (
        <div 
          className="modal-overlay"
          onClick={() => setIsCreateRiskModalOpen(false)}
        >
          <div 
            className="project-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsCreateRiskModalOpen(false)}
              className="modal-close-btn"
            >
              ✕
            </button>
            
            <div className="modal-header">
              <h1>Report New Risk</h1>
              <p style={{ color: 'var(--sony-gray-600)', fontSize: '16px', marginBottom: '24px' }}>
                Identify and assess potential risks for project tracking
              </p>
            </div>

            <form onSubmit={handleCreateRisk} style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <Label htmlFor="risk-project">Project Name *</Label>
                  <select
                    id="risk-project"
                    value={newRisk.project}
                    onChange={(e) => setNewRisk(prev => ({...prev, project: e.target.value}))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--sony-gray-300)',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    required
                  >
                    <option value="">Selecione o Projeto</option>
                    {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="risk-category">Category *</Label>
                  <select 
                    id="risk-category"
                    value={newRisk.category} 
                    onChange={(e) => setNewRisk(prev => ({...prev, category: e.target.value}))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--sony-gray-300)',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    required
                  >
                    <option value="Technical">Technical</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Market">Market</option>
                    <option value="Operational">Operational</option>
                    <option value="Financial">Financial</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="risk-description">Risk Description *</Label>
                <Input
                  id="risk-description"
                  value={newRisk.risk}
                  onChange={(e) => setNewRisk(prev => ({...prev, risk: e.target.value}))}
                  placeholder="Describe the potential risk"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div>
                  <Label htmlFor="risk-probability">Probability *</Label>
                  <select 
                    id="risk-probability"
                    value={newRisk.probability} 
                    onChange={(e) => setNewRisk(prev => ({...prev, probability: e.target.value}))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--sony-gray-300)',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    required
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="risk-impact">Impact *</Label>
                  <select 
                    id="risk-impact"
                    value={newRisk.impact} 
                    onChange={(e) => setNewRisk(prev => ({...prev, impact: e.target.value}))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--sony-gray-300)',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    required
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="risk-owner">Risk Owner *</Label>
                  <Input
                    id="risk-owner"
                    value={newRisk.owner}
                    onChange={(e) => setNewRisk(prev => ({...prev, owner: e.target.value}))}
                    placeholder="Responsible person"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="risk-mitigation">Mitigation Strategy</Label>
                <Textarea
                  id="risk-mitigation"
                  value={newRisk.mitigation}
                  onChange={(e) => setNewRisk(prev => ({...prev, mitigation: e.target.value}))}
                  placeholder="Describe mitigation actions and contingency plans"
                  rows={3}
                />
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: '12px',
                paddingTop: '20px',
                borderTop: '1px solid var(--sony-gray-200)'
              }}>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateRiskModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  style={{ 
                    background: 'var(--sony-red)',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  Report Risk
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Risk Modal */}
      {isEditRiskModalOpen && (
        <div 
          className="modal-overlay"
          onClick={() => setIsEditRiskModalOpen(false)}
        >
          <div 
            className="project-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsEditRiskModalOpen(false)}
              className="modal-close-btn"
            >
              ✕
            </button>
            
            <div className="modal-header">
              <h1>Edit Risk</h1>
              <p style={{ color: 'var(--sony-gray-600)', fontSize: '16px', marginBottom: '24px' }}>
                Update risk status and details
              </p>
            </div>

            <form onSubmit={handleUpdateRisk} style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <Label htmlFor="edit-risk-project">Project Name *</Label>
                  <select
                    id="edit-risk-project"
                    value={editRisk.project}
                    onChange={(e) => setEditRisk(prev => ({...prev, project: e.target.value}))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--sony-gray-300)',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    required
                  >
                    <option value="">Selecione o Projeto</option>
                    {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="edit-risk-category">Category *</Label>
                  <select 
                    id="edit-risk-category"
                    value={editRisk.category} 
                    onChange={(e) => setEditRisk(prev => ({...prev, category: e.target.value}))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--sony-gray-300)',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    required
                  >
                    <option value="Technical">Technical</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Market">Market</option>
                    <option value="Operational">Operational</option>
                    <option value="Financial">Financial</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-risk-description">Risk Description *</Label>
                <Input
                  id="edit-risk-description"
                  value={editRisk.risk}
                  onChange={(e) => setEditRisk(prev => ({...prev, risk: e.target.value}))}
                  placeholder="Describe the potential risk"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px' }}>
                <div>
                  <Label htmlFor="edit-risk-probability">Probability *</Label>
                  <select 
                    id="edit-risk-probability"
                    value={editRisk.probability} 
                    onChange={(e) => setEditRisk(prev => ({...prev, probability: e.target.value}))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--sony-gray-300)',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    required
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="edit-risk-impact">Impact *</Label>
                  <select 
                    id="edit-risk-impact"
                    value={editRisk.impact} 
                    onChange={(e) => setEditRisk(prev => ({...prev, impact: e.target.value}))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--sony-gray-300)',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    required
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="edit-risk-status">Status *</Label>
                  <select 
                    id="edit-risk-status"
                    value={editRisk.status} 
                    onChange={(e) => setEditRisk(prev => ({...prev, status: e.target.value}))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--sony-gray-300)',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Monitoring">Monitoring</option>
                    <option value="Mitigated">Mitigated</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="edit-risk-owner">Risk Owner *</Label>
                  <Input
                    id="edit-risk-owner"
                    value={editRisk.owner}
                    onChange={(e) => setEditRisk(prev => ({...prev, owner: e.target.value}))}
                    placeholder="Responsible person"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-risk-mitigation">Mitigation Strategy</Label>
                <Textarea
                  id="edit-risk-mitigation"
                  value={editRisk.mitigation}
                  onChange={(e) => setEditRisk(prev => ({...prev, mitigation: e.target.value}))}
                  placeholder="Describe mitigation actions and contingency plans"
                  rows={3}
                />
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: '12px',
                paddingTop: '20px',
                borderTop: '1px solid var(--sony-gray-200)'
              }}>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditRiskModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  style={{ 
                    background: 'var(--sony-red)',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  Update Risk
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskRadar;