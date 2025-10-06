import React, { useState, useEffect } from "react";
import { 
  Search, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  User,
  Calendar,
  Target,
  ArrowDown,
  Plus,
  FileText
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RootCauseAnalysis = () => {
  const [rcaCases, setRcaCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCase, setSelectedCase] = useState(null);
  const [isCreateRCAModalOpen, setIsCreateRCAModalOpen] = useState(false);
  const [newRCA, setNewRCA] = useState({
    incident: '',
    severity: 'Medium',
    impact: '',
    root_causes: [''],
    five_whys: ['', '', '', '', ''],
    actions: [{ action: '', owner: '', status: 'Planned' }],
    lessons: ''
  });

  useEffect(() => {
    fetchRcaCases();
  }, []);

  useEffect(() => {
    filterCases();
  }, [rcaCases, searchQuery]);

  const fetchRcaCases = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/root-cause-analysis`);
      setRcaCases(response.data);
    } catch (error) {
      console.error('Error fetching RCA cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCases = () => {
    let filtered = rcaCases;

    if (searchQuery) {
      filtered = filtered.filter(rcaCase => 
        rcaCase.incident.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rcaCase.root_causes.some(cause => cause.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredCases(filtered);
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'var(--sony-red)';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      case 'low': return '#10B981';
      default: return 'var(--sony-gray-600)';
    }
  };

  const getActionStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'complete': return '#10B981';
      case 'in progress': return '#3B82F6';
      case 'planned': return '#F59E0B';
      default: return 'var(--sony-gray-600)';
    }
  };

  const getActionStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'complete': return <CheckCircle size={16} />;
      case 'in progress': return <Clock size={16} />;
      case 'planned': return <Target size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  const handleCreateRCA = async (e) => {
    e.preventDefault();
    try {
      const rcaData = {
        ...newRCA,
        date: new Date().toISOString().split('T')[0],
        id: `rca-${Date.now()}`,
        root_causes: newRCA.root_causes.filter(cause => cause.trim() !== ''),
        five_whys: newRCA.five_whys.filter(why => why.trim() !== ''),
        actions: newRCA.actions.filter(action => action.action.trim() !== '')
      };
      
      setRcaCases(prev => [...prev, rcaData]);
      
      // Reset form
      setNewRCA({
        incident: '',
        severity: 'Medium',
        impact: '',
        root_causes: [''],
        five_whys: ['', '', '', '', ''],
        actions: [{ action: '', owner: '', status: 'Planned' }],
        lessons: ''
      });
      
      setIsCreateRCAModalOpen(false);
      alert("RCA case created successfully!");
    } catch (error) {
      console.error('Error creating RCA:', error);
      alert("Error: Failed to create RCA. Please try again.");
    }
  };

  const addRootCause = () => {
    setNewRCA(prev => ({...prev, root_causes: [...prev.root_causes, '']}));
  };

  const updateRootCause = (index, value) => {
    setNewRCA(prev => ({
      ...prev,
      root_causes: prev.root_causes.map((cause, i) => i === index ? value : cause)
    }));
  };

  const updateFiveWhy = (index, value) => {
    setNewRCA(prev => ({
      ...prev,
      five_whys: prev.five_whys.map((why, i) => i === index ? value : why)
    }));
  };

  const addAction = () => {
    setNewRCA(prev => ({
      ...prev, 
      actions: [...prev.actions, { action: '', owner: '', status: 'Planned' }]
    }));
  };

  const updateAction = (index, field, value) => {
    setNewRCA(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) => 
        i === index ? {...action, [field]: value} : action
      )
    }));
  };

  if (loading) {
    return (
      <div data-testid="rca-loading">
        <div className="dashboard-header">
          <div className="skeleton" style={{ height: '28px', width: '300px', marginBottom: '8px' }}></div>
          <div className="skeleton" style={{ height: '16px', width: '400px' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="rca-container">
      {/* Header */}
      <div className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="dashboard-title">Root Cause Analysis</h1>
            <p className="dashboard-subtitle">
              Systematic investigation and analysis of incidents and failures
            </p>
          </div>
          <Button 
            style={{ 
              background: 'var(--sony-red)',
              color: 'white',
              border: 'none'
            }}
            onClick={() => setIsCreateRCAModalOpen(true)}
            data-testid="create-rca-btn"
          >
            <Plus size={16} style={{ marginRight: '8px' }} />
            Create RCA
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{ 
        background: 'var(--sony-white)', 
        padding: '24px 32px', 
        borderBottom: '1px solid var(--sony-gray-200)',
        marginBottom: '32px'
      }}>
        <div style={{ position: 'relative', maxWidth: '500px' }}>
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
            placeholder="Search incidents and root causes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '44px' }}
            data-testid="rca-search"
          />
        </div>
      </div>

      {/* RCA Cases */}
      <div style={{ padding: '0 32px' }}>
        {selectedCase ? (
          /* Detailed Case View */
          <div>
            <Button 
              onClick={() => setSelectedCase(null)}
              style={{ marginBottom: '24px' }}
              variant="outline"
            >
              ← Back to Cases
            </Button>
            
            <div style={{
              background: 'var(--sony-white)',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
              border: '1px solid var(--sony-gray-200)'
            }}>
              {/* Case Header */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--sony-gray-900)' }}>
                    {selectedCase.incident}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: getSeverityColor(selectedCase.severity) + '20',
                      color: getSeverityColor(selectedCase.severity)
                    }}>
                      {selectedCase.severity} Severity
                    </span>
                    <span style={{ fontSize: '14px', color: 'var(--sony-gray-600)' }}>
                      {formatDate(selectedCase.date)}
                    </span>
                  </div>
                </div>
                
                <div style={{
                  padding: '16px',
                  background: 'var(--sony-gray-50)',
                  borderRadius: '12px',
                  border: '1px solid var(--sony-gray-200)'
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--sony-gray-700)', marginBottom: '8px' }}>
                    Impact
                  </h4>
                  <p style={{ fontSize: '16px', color: 'var(--sony-gray-900)', fontWeight: '600' }}>
                    {selectedCase.impact}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                {/* Root Causes */}
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--sony-gray-900)' }}>
                    Root Causes Identified
                  </h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {selectedCase.root_causes.map((cause, index) => (
                      <div 
                        key={index}
                        style={{
                          padding: '12px',
                          background: 'var(--sony-gray-50)',
                          borderRadius: '8px',
                          border: '1px solid var(--sony-gray-200)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: 'var(--sony-red)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: '600',
                            flexShrink: 0
                          }}>
                            {index + 1}
                          </div>
                          <span style={{ fontSize: '14px', lineHeight: '1.5' }}>{cause}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Five Whys */}
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--sony-gray-900)' }}>
                    Five Whys Analysis
                  </h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {selectedCase.five_whys.map((why, index) => (
                      <div 
                        key={index}
                        style={{ position: 'relative' }}
                      >
                        <div style={{
                          padding: '12px',
                          background: 'var(--sony-gray-50)',
                          borderRadius: '8px',
                          border: '1px solid var(--sony-gray-200)'
                        }}>
                          <span style={{ fontSize: '14px', lineHeight: '1.5' }}>{why}</span>
                        </div>
                        {index < selectedCase.five_whys.length - 1 && (
                          <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            margin: '8px 0'
                          }}>
                            <ArrowDown size={16} color="var(--sony-gray-400)" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Items */}
              <div style={{ marginTop: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--sony-gray-900)' }}>
                  Corrective Actions
                </h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {selectedCase.actions.map((action, index) => (
                    <div 
                      key={index}
                      style={{
                        padding: '16px',
                        background: 'var(--sony-gray-50)',
                        borderRadius: '12px',
                        border: '1px solid var(--sony-gray-200)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                            {action.action}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <User size={14} color="var(--sony-gray-600)" />
                              <span style={{ fontSize: '12px', color: 'var(--sony-gray-600)' }}>
                                {action.owner}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          background: getActionStatusColor(action.status) + '20',
                          color: getActionStatusColor(action.status)
                        }}>
                          {getActionStatusIcon(action.status)}
                          <span style={{ fontSize: '12px', fontWeight: '600' }}>
                            {action.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lessons Learned */}
              {selectedCase.lessons && (
                <div style={{ 
                  marginTop: '32px',
                  padding: '20px',
                  background: 'linear-gradient(135deg, var(--sony-black) 0%, var(--sony-gray-900) 100%)',
                  borderRadius: '12px',
                  color: 'var(--sony-white)'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>
                    Key Lesson Learned
                  </h3>
                  <p style={{ fontSize: '16px', lineHeight: '1.6', color: 'var(--sony-gray-200)' }}>
                    {selectedCase.lessons}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Cases List View */
          <div style={{ display: 'grid', gap: '24px' }}>
            {filteredCases.map((rcaCase) => (
              <div 
                key={rcaCase.id}
                style={{
                  background: 'var(--sony-white)',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                  border: '1px solid var(--sony-gray-200)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                className="rca-case-card"
                onClick={() => setSelectedCase(rcaCase)}
                data-testid={`rca-case-${rcaCase.id}`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontSize: '18px',
                      fontWeight: '700',
                      color: 'var(--sony-gray-900)',
                      marginBottom: '8px'
                    }}>
                      {rcaCase.incident}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: 'var(--sony-gray-600)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} />
                        <span>{formatDate(rcaCase.date)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={14} />
                        <span>Impact: {rcaCase.impact}</span>
                      </div>
                    </div>
                  </div>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: getSeverityColor(rcaCase.severity) + '20',
                    color: getSeverityColor(rcaCase.severity)
                  }}>
                    {rcaCase.severity}
                  </span>
                </div>

                <div style={{ 
                  padding: '12px 0',
                  borderTop: '1px solid var(--sony-gray-200)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '14px', color: 'var(--sony-gray-600)' }}>
                    {rcaCase.root_causes.length} root causes • {rcaCase.actions.length} actions
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--sony-red)' }}>
                    <FileText size={14} />
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>View Details</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Empty State */}
      {!loading && !selectedCase && filteredCases.length === 0 && (
        <div style={{ 
          textAlign: 'center',
          padding: '64px 32px',
          color: 'var(--sony-gray-600)'
        }}>
          <Search size={48} style={{ marginBottom: '16px', color: 'var(--sony-gray-400)' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            No RCA cases found
          </h3>
          <p>Try adjusting your search criteria</p>
        </div>
      )}

      {/* Create RCA Modal */}
      {isCreateRCAModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateRCAModalOpen(false)}>
          <div className="project-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsCreateRCAModalOpen(false)} className="modal-close-btn">✕</button>
            
            <div className="modal-header">
              <h1>Create Root Cause Analysis</h1>
              <p style={{ color: 'var(--sony-gray-600)', fontSize: '16px', marginBottom: '24px' }}>
                Systematic analysis of incidents and failures
              </p>
            </div>

            <form onSubmit={handleCreateRCA} style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                <div>
                  <Label htmlFor="rca-incident">Incident Title *</Label>
                  <Input id="rca-incident" value={newRCA.incident} onChange={(e) => setNewRCA(prev => ({...prev, incident: e.target.value}))} placeholder="Brief incident description" required />
                </div>
                <div>
                  <Label htmlFor="rca-severity">Severity *</Label>
                  <select id="rca-severity" value={newRCA.severity} onChange={(e) => setNewRCA(prev => ({...prev, severity: e.target.value}))} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--sony-gray-300)', borderRadius: '6px', fontSize: '14px' }} required>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="rca-impact">Impact Description *</Label>
                <Textarea id="rca-impact" value={newRCA.impact} onChange={(e) => setNewRCA(prev => ({...prev, impact: e.target.value}))} placeholder="Describe the business impact and consequences" rows={2} required />
              </div>

              <div>
                <Label>Root Causes *</Label>
                {newRCA.root_causes.map((cause, index) => (
                  <Input key={index} value={cause} onChange={(e) => updateRootCause(index, e.target.value)} placeholder={`Root cause ${index + 1}`} style={{ marginBottom: '8px' }} />
                ))}
                <Button type="button" variant="outline" onClick={addRootCause} style={{ marginTop: '8px' }}>+ Add Root Cause</Button>
              </div>

              <div>
                <Label>Five Whys Analysis</Label>
                {newRCA.five_whys.map((why, index) => (
                  <Input key={index} value={why} onChange={(e) => updateFiveWhy(index, e.target.value)} placeholder={`Why ${index + 1}?`} style={{ marginBottom: '8px' }} />
                ))}
              </div>

              <div>
                <Label>Corrective Actions</Label>
                {newRCA.actions.map((action, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <Input value={action.action} onChange={(e) => updateAction(index, 'action', e.target.value)} placeholder="Action description" />
                    <Input value={action.owner} onChange={(e) => updateAction(index, 'owner', e.target.value)} placeholder="Owner" />
                    <select value={action.status} onChange={(e) => updateAction(index, 'status', e.target.value)} style={{ padding: '8px', border: '1px solid var(--sony-gray-300)', borderRadius: '6px' }}>
                      <option value="Planned">Planned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Complete">Complete</option>
                    </select>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addAction}>+ Add Action</Button>
              </div>

              <div>
                <Label htmlFor="rca-lessons">Key Lessons Learned</Label>
                <Textarea id="rca-lessons" value={newRCA.lessons} onChange={(e) => setNewRCA(prev => ({...prev, lessons: e.target.value}))} placeholder="Summarize key insights and preventive measures" rows={3} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '20px', borderTop: '1px solid var(--sony-gray-200)' }}>
                <Button type="button" variant="outline" onClick={() => setIsCreateRCAModalOpen(false)}>Cancel</Button>
                <Button type="submit" style={{ background: 'var(--sony-red)', color: 'white', border: 'none' }}>Create RCA</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .rca-case-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
        }
      `}</style>
    </div>
  );
};

export default RootCauseAnalysis;