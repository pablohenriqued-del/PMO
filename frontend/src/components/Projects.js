import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Plus,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  X
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import axios from "axios";
import { toast } from "./ui/use-toast";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [managerFilter, setManagerFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [managers, setManagers] = useState([]);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    type: 'digital',
    manager: '',
    budget_allocated: '',
    start_date: '',
    end_date: '',
    team_members: '',
    streaming_platforms: ''
  });

  useEffect(() => {
    fetchProjects();
    fetchManagers();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery, statusFilter, managerFilter]);

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

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.manager.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Manager filter
    if (managerFilter !== "all") {
      filtered = filtered.filter(project => project.manager === managerFilter);
    }

    setFilteredProjects(filtered);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={16} className="text-green-500" />;
      case 'in_progress':
        return <TrendingUp size={16} className="text-blue-500" />;
      case 'planning':
        return <Clock size={16} className="text-yellow-500" />;
      case 'on_hold':
        return <AlertTriangle size={16} className="text-orange-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getBudgetStatus = (allocated, spent) => {
    const percentage = (spent / allocated) * 100;
    if (percentage > 100) return { color: 'var(--sony-red)', status: 'Over Budget' };
    if (percentage > 85) return { color: '#F59E0B', status: 'High Usage' };
    if (percentage > 60) return { color: '#10B981', status: 'On Track' };
    return { color: '#6B7280', status: 'Low Usage' };
  };

  const openProjectModal = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div data-testid="projects-loading">
        <div className="dashboard-header">
          <div className="skeleton" style={{ height: '28px', width: '200px', marginBottom: '8px' }}></div>
          <div className="skeleton" style={{ height: '16px', width: '300px' }}></div>
        </div>
        <div className="projects-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="project-card">
              <div className="skeleton" style={{ height: '200px' }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div data-testid="projects-container">
      {/* Header */}
      <div className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="dashboard-title">Project Management</h1>
            <p className="dashboard-subtitle">
              Manage and track all digital projects and streaming initiatives
            </p>
          </div>
          <Button 
            style={{ 
              background: 'var(--sony-red)',
              color: 'white',
              border: 'none'
            }}
            data-testid="add-project-btn"
          >
            <Plus size={16} style={{ marginRight: '8px' }} />
            New Project
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
          gridTemplateColumns: '2fr 1fr 1fr', 
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
              Search Projects
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
                placeholder="Search by name, description, or manager..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '44px' }}
                data-testid="projects-search"
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
              Status
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="status-filter">
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
              Manager
            </label>
            <Select value={managerFilter} onValueChange={setManagerFilter}>
              <SelectTrigger data-testid="manager-filter">
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
        </div>

        {/* Results Summary */}
        <div style={{ 
          marginTop: '16px', 
          padding: '12px 0',
          borderTop: '1px solid var(--sony-gray-200)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '14px', color: 'var(--sony-gray-600)' }}>
            Showing {filteredProjects.length} of {projects.length} projects
          </span>
          {(searchQuery || statusFilter !== "all" || managerFilter !== "all") && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setManagerFilter("all");
              }}
              data-testid="clear-filters"
            >
              <X size={14} style={{ marginRight: '4px' }} />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="projects-grid">
        {filteredProjects.map((project) => {
          const budgetStatus = getBudgetStatus(project.budget_allocated, project.budget_spent);
          
          return (
            <div 
              key={project.id} 
              className="project-card"
              onClick={() => openProjectModal(project)}
              data-testid={`project-${project.id}`}
            >
              <div className="project-header">
                <div>
                  <h3 className="project-title">{project.name}</h3>
                  <p className="project-manager">Manager: {project.manager}</p>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginTop: '8px'
                  }}>
                    <span style={{ 
                      fontSize: '12px',
                      color: 'var(--sony-gray-600)',
                      background: 'var(--sony-gray-100)',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      {project.type.replace('_', ' ').toUpperCase()}
                    </span>
                    <span style={{ 
                      fontSize: '12px',
                      color: budgetStatus.color,
                      fontWeight: '600'
                    }}>
                      {budgetStatus.status}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getStatusIcon(project.status)}
                    <span className={`status-badge status-${project.status}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                  <span className={`priority-badge priority-${project.priority}`}>
                    {project.priority}
                  </span>
                </div>
              </div>

              {project.description && (
                <p style={{ 
                  fontSize: '14px', 
                  color: 'var(--sony-gray-600)', 
                  marginBottom: '16px',
                  lineHeight: '1.4'
                }}>
                  {project.description.substring(0, 120)}
                  {project.description.length > 120 && '...'}
                </p>
              )}

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

              <div style={{ 
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid var(--sony-gray-200)'
              }}>
                <div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    marginBottom: '4px'
                  }}>
                    <DollarSign size={14} color="var(--sony-gray-600)" />
                    <span style={{ fontSize: '12px', color: 'var(--sony-gray-600)' }}>Budget</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>
                    {formatCurrency(project.budget_spent)} / {formatCurrency(project.budget_allocated)}
                  </div>
                </div>
                <div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    marginBottom: '4px'
                  }}>
                    <Calendar size={14} color="var(--sony-gray-600)" />
                    <span style={{ fontSize: '12px', color: 'var(--sony-gray-600)' }}>Timeline</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>
                    {formatDate(project.start_date)} - {formatDate(project.end_date)}
                  </div>
                </div>
              </div>

              {project.streaming_platforms && project.streaming_platforms.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ 
                    fontSize: '12px', 
                    color: 'var(--sony-gray-600)',
                    marginBottom: '6px'
                  }}>
                    Streaming Platforms:
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {project.streaming_platforms.slice(0, 3).map(platform => (
                      <span 
                        key={platform}
                        style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          background: 'var(--sony-gray-100)',
                          color: 'var(--sony-gray-700)',
                          borderRadius: '8px'
                        }}
                      >
                        {platform}
                      </span>
                    ))}
                    {project.streaming_platforms.length > 3 && (
                      <span style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        background: 'var(--sony-red)',
                        color: 'var(--sony-white)',
                        borderRadius: '8px'
                      }}>
                        +{project.streaming_platforms.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Project Detail Modal */}
      {isModalOpen && (
        <div 
          className="modal-overlay"
          onClick={() => setIsModalOpen(false)}
          data-testid="modal-overlay"
        >
          <div 
            className="project-detail-modal"
            onClick={(e) => e.stopPropagation()}
            data-testid="project-detail-modal"
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="modal-close-btn"
              data-testid="close-modal-btn"
            >
              ✕
            </button>
          {selectedProject && (
            <>
              <div className="modal-header">
                <h1>
                  {selectedProject.name}
                </h1>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '24px'
                }}>
                  <span className={`status-badge status-${selectedProject.status}`}>
                    {selectedProject.status.replace('_', ' ')}
                  </span>
                  <span className={`priority-badge priority-${selectedProject.priority}`}>
                    {selectedProject.priority}
                  </span>
                  <span style={{ 
                    fontSize: '14px',
                    color: 'var(--sony-gray-600)',
                    background: 'var(--sony-gray-100)',
                    padding: '4px 12px',
                    borderRadius: '20px'
                  }}>
                    {selectedProject.type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div style={{ padding: '24px 0' }}>
                {/* Project Overview */}
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr',
                  gap: '24px',
                  marginBottom: '24px'
                }}>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                      Description
                    </h4>
                    <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--sony-gray-600)' }}>
                      {selectedProject.description || 'No description available'}
                    </p>
                  </div>
                  
                  <div style={{ 
                    background: 'var(--sony-gray-50)',
                    padding: '20px',
                    borderRadius: '12px'
                  }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                      Project Details
                    </h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--sony-gray-600)' }}>Manager</span>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>
                          {selectedProject.manager}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--sony-gray-600)' }}>Status</span>
                        <div>
                          <span className={`status-badge status-${selectedProject.status}`}>
                            {selectedProject.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--sony-gray-600)' }}>Priority</span>
                        <div>
                          <span className={`priority-badge priority-${selectedProject.priority}`}>
                            {selectedProject.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Milestones */}
                {selectedProject.milestones && selectedProject.milestones.length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                      Milestones
                    </h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {selectedProject.milestones.map((milestone, index) => (
                        <div 
                          key={index}
                          style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px',
                            background: milestone.completed ? 'rgba(16, 185, 129, 0.1)' : 'var(--sony-gray-50)',
                            borderRadius: '8px',
                            border: milestone.completed ? '1px solid #10B981' : '1px solid var(--sony-gray-200)'
                          }}
                        >
                          <div style={{ marginRight: '12px' }}>
                            {milestone.completed ? (
                              <CheckCircle2 size={20} style={{ color: '#10B981' }} />
                            ) : (
                              <Clock size={20} style={{ color: 'var(--sony-gray-400)' }} />
                            )}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: '600' }}>
                              {milestone.name}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--sony-gray-600)' }}>
                              Due: {formatDate(milestone.date)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Budget & Timeline */}
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '24px'
                }}>
                  <div style={{ 
                    background: 'var(--sony-gray-50)',
                    padding: '20px',
                    borderRadius: '12px'
                  }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                      Budget Overview
                    </h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--sony-gray-600)' }}>Allocated</span>
                        <div style={{ fontSize: '18px', fontWeight: '700' }}>
                          {formatCurrency(selectedProject.budget_allocated)}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--sony-gray-600)' }}>Spent</span>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--sony-red)' }}>
                          {formatCurrency(selectedProject.budget_spent)}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--sony-gray-600)' }}>Remaining</span>
                        <div style={{ 
                          fontSize: '18px', 
                          fontWeight: '700',
                          color: selectedProject.budget_spent > selectedProject.budget_allocated ? 'var(--sony-red)' : '#10B981'
                        }}>
                          {formatCurrency(selectedProject.budget_allocated - selectedProject.budget_spent)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    background: 'var(--sony-gray-50)',
                    padding: '20px',
                    borderRadius: '12px'
                  }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                      Timeline
                    </h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--sony-gray-600)' }}>Start Date</span>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>
                          {formatDate(selectedProject.start_date)}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--sony-gray-600)' }}>End Date</span>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>
                          {formatDate(selectedProject.end_date)}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--sony-gray-600)' }}>Progress</span>
                        <div style={{ marginTop: '8px' }}>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${selectedProject.progress}%` }}
                            ></div>
                          </div>
                          <div style={{ 
                            textAlign: 'center',
                            marginTop: '4px',
                            fontSize: '14px',
                            fontWeight: '600'
                          }}>
                            {selectedProject.progress}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredProjects.length === 0 && (
        <div style={{ 
          textAlign: 'center',
          padding: '64px 32px',
          color: 'var(--sony-gray-600)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            No projects found
          </h3>
          <p>Try adjusting your search criteria or filters</p>
        </div>
      )}
    </div>
  );
};

export default Projects;