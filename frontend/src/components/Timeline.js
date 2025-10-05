import React, { useState, useEffect } from "react";
import { 
  Calendar,
  Filter,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Clock,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Timeline = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [managerFilter, setManagerFilter] = useState("all");
  const [currentYear, setCurrentYear] = useState(2024);
  const [hiddenProjects, setHiddenProjects] = useState([]);
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    fetchProjects();
    fetchManagers();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, statusFilter, managerFilter]);

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
    let filtered = projects.filter(project => !hiddenProjects.includes(project.id));

    if (statusFilter !== "all") {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    if (managerFilter !== "all") {
      filtered = filtered.filter(project => project.manager === managerFilter);
    }

    setFilteredProjects(filtered);
  };

  const toggleProjectVisibility = (projectId) => {
    setHiddenProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const getMonthName = (monthIndex) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[monthIndex];
  };

  const getProjectPosition = (project) => {
    const startDate = new Date(project.start_date);
    const endDate = new Date(project.end_date);
    
    // Calculate position and width as percentage of year
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);
    const yearDuration = yearEnd - yearStart;
    
    let startPos = Math.max(0, ((startDate - yearStart) / yearDuration) * 100);
    let endPos = Math.min(100, ((endDate - yearStart) / yearDuration) * 100);
    
    // Ensure project is visible if it spans the year
    if (startDate.getFullYear() < currentYear && endDate.getFullYear() >= currentYear) {
      startPos = 0;
    }
    if (startDate.getFullYear() <= currentYear && endDate.getFullYear() > currentYear) {
      endPos = 100;
    }
    
    const width = Math.max(endPos - startPos, 1); // Minimum 1% width
    
    return { 
      left: `${startPos}%`, 
      width: `${width}%`,
      visible: startDate.getFullYear() <= currentYear && endDate.getFullYear() >= currentYear
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'in_progress': return '#3B82F6';
      case 'planning': return '#F59E0B';
      case 'on_hold': return '#EF4444';
      case 'cancelled': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></div>;
      case 'in_progress':
        return <TrendingUp size={12} color="#3B82F6" />;
      case 'planning':
        return <Clock size={12} color="#F59E0B" />;
      case 'on_hold':
        return <AlertTriangle size={12} color="#EF4444" />;
      default:
        return <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6B7280' }}></div>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div data-testid="timeline-loading">
        <div className="dashboard-header">
          <div className="skeleton" style={{ height: '28px', width: '200px', marginBottom: '8px' }}></div>
          <div className="skeleton" style={{ height: '16px', width: '300px' }}></div>
        </div>
        <div style={{ padding: '32px' }}>
          <div className="skeleton" style={{ height: '400px' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="timeline-container">
      {/* Header */}
      <div className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="dashboard-title">Project Timeline</h1>
            <p className="dashboard-subtitle">
              Visual chronogram of all projects and milestones
            </p>
          </div>
          
          {/* Year Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentYear(prev => prev - 1)}
              data-testid="prev-year"
            >
              <ChevronLeft size={16} />
            </Button>
            <span style={{ 
              fontSize: '18px', 
              fontWeight: '700',
              minWidth: '60px',
              textAlign: 'center'
            }}>
              {currentYear}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentYear(prev => prev + 1)}
              data-testid="next-year"
            >
              <ChevronRight size={16} />
            </Button>
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
              <SelectTrigger data-testid="timeline-status-filter">
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
              <SelectTrigger data-testid="timeline-manager-filter">
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

      {/* Timeline View */}
      <div style={{ padding: '0 32px', marginBottom: '32px' }}>
        <div style={{ 
          background: 'var(--sony-white)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
          border: '1px solid var(--sony-gray-200)'
        }}>
          {/* Month Headers */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            gap: '24px',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '2px solid var(--sony-gray-200)'
          }}>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: '700', 
              color: 'var(--sony-gray-900)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Calendar size={20} />
              Projects
            </div>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gap: '4px'
            }}>
              {[...Array(12)].map((_, index) => (
                <div 
                  key={index}
                  style={{ 
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'var(--sony-gray-600)',
                    padding: '8px 4px'
                  }}
                >
                  {getMonthName(index)}
                </div>
              ))}
            </div>
          </div>

          {/* Project Rows */}
          <div style={{ display: 'grid', gap: '12px' }}>
            {filteredProjects.map((project, index) => {
              const position = getProjectPosition(project);
              const isHidden = hiddenProjects.includes(project.id);
              
              return (
                <div 
                  key={project.id}
                  style={{ 
                    display: 'grid',
                    gridTemplateColumns: '200px 1fr',
                    gap: '24px',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: index < filteredProjects.length - 1 ? '1px solid var(--sony-gray-100)' : 'none',
                    opacity: isHidden ? 0.4 : 1,
                    transition: 'opacity 0.2s ease'
                  }}
                  data-testid={`timeline-project-${project.id}`}
                >
                  {/* Project Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => toggleProjectVisibility(project.id)}
                      style={{ 
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px'
                      }}
                      data-testid={`toggle-project-${project.id}`}
                    >
                      {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'var(--sony-gray-900)',
                        marginBottom: '2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {project.name}
                      </div>
                      <div style={{ 
                        fontSize: '12px',
                        color: 'var(--sony-gray-600)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {getStatusIcon(project.status)}
                        {project.manager}
                      </div>
                    </div>
                  </div>

                  {/* Timeline Bar */}
                  <div style={{ 
                    position: 'relative',
                    height: '36px',
                    background: 'var(--sony-gray-100)',
                    borderRadius: '18px',
                    overflow: 'visible',
                    border: '1px solid var(--sony-gray-200)'
                  }}>
                    {!isHidden && position.visible && (
                      <>
                        {/* Project Bar */}
                        <div
                          style={{
                            position: 'absolute',
                            top: '4px',
                            height: '26px',
                            background: `linear-gradient(90deg, ${getStatusColor(project.status)}, ${getStatusColor(project.status)}DD)`,
                            borderRadius: '13px',
                            left: position.left,
                            width: position.width,
                            minWidth: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: '700',
                            boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
                            cursor: 'pointer',
                            border: '2px solid white',
                            zIndex: 2
                          }}
                          title={`${project.name}\n${formatDate(project.start_date)} - ${formatDate(project.end_date)}\nProgress: ${project.progress}%`}
                        >
                          <span style={{ 
                            opacity: parseFloat(position.width) > 12 ? 1 : 0,
                            transition: 'opacity 0.2s ease',
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                          }}>
                            {project.progress}%
                          </span>
                        </div>

                        {/* Milestones */}
                        {project.milestones && project.milestones.map((milestone, milestoneIndex) => {
                          const milestoneDate = new Date(milestone.date);
                          const yearStart = new Date(currentYear, 0, 1);
                          const yearEnd = new Date(currentYear, 11, 31);
                          const yearDuration = yearEnd - yearStart;
                          const milestonePos = ((milestoneDate - yearStart) / yearDuration) * 100;
                          
                          if (milestonePos >= -2 && milestonePos <= 102) {
                            return (
                              <div
                                key={milestoneIndex}
                                style={{
                                  position: 'absolute',
                                  left: `${Math.max(0, Math.min(100, milestonePos))}%`,
                                  top: '-2px',
                                  width: '3px',
                                  height: '40px',
                                  background: milestone.completed ? '#10B981' : '#F59E0B',
                                  zIndex: 15,
                                  cursor: 'pointer',
                                  borderRadius: '2px',
                                  transform: 'translateX(-50%)'
                                }}
                                title={`${milestone.name}\n${formatDate(milestone.date)}\n${milestone.completed ? '✅ Completed' : '⏳ Pending'}`}
                              >
                                <div style={{
                                  position: 'absolute',
                                  top: '-6px',
                                  left: '-6px',
                                  width: '15px',
                                  height: '15px',
                                  borderRadius: '50%',
                                  background: milestone.completed ? '#10B981' : '#F59E0B',
                                  border: '3px solid white',
                                  boxShadow: '0 3px 6px rgba(0, 0, 0, 0.2)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '8px',
                                  color: 'white',
                                  fontWeight: '700'
                                }}>
                                  {milestone.completed ? '✓' : '•'}
                                </div>
                                <div style={{
                                  position: 'absolute',
                                  bottom: '-6px',
                                  left: '-6px',
                                  width: '15px',
                                  height: '15px',
                                  borderRadius: '50%',
                                  background: milestone.completed ? '#10B981' : '#F59E0B',
                                  border: '3px solid white',
                                  boxShadow: '0 3px 6px rgba(0, 0, 0, 0.2)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '8px',
                                  color: 'white',
                                  fontWeight: '700'
                                }}>
                                  {milestone.completed ? '✓' : '•'}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ 
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid var(--sony-gray-200)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            justifyContent: 'center'
          }}>
            {[
              { status: 'planning', label: 'Planning', color: '#F59E0B' },
              { status: 'in_progress', label: 'In Progress', color: '#3B82F6' },
              { status: 'completed', label: 'Completed', color: '#10B981' },
              { status: 'on_hold', label: 'On Hold', color: '#EF4444' },
              { status: 'cancelled', label: 'Cancelled', color: '#6B7280' }
            ].map(item => (
              <div key={item.status} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '6px',
                  background: item.color
                }}></div>
                <span style={{ fontSize: '12px', color: 'var(--sony-gray-600)' }}>
                  {item.label}
                </span>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '2px',
                height: '12px',
                background: '#F59E0B'
              }}></div>
              <span style={{ fontSize: '12px', color: 'var(--sony-gray-600)' }}>
                Milestone
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ padding: '0 32px' }}>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {[
            { 
              label: 'Active This Year', 
              value: filteredProjects.filter(p => 
                new Date(p.start_date).getFullYear() <= currentYear && 
                new Date(p.end_date).getFullYear() >= currentYear
              ).length,
              color: '#3B82F6'
            },
            { 
              label: 'Completing This Year', 
              value: filteredProjects.filter(p => 
                new Date(p.end_date).getFullYear() === currentYear
              ).length,
              color: '#10B981'
            },
            { 
              label: 'Starting This Year', 
              value: filteredProjects.filter(p => 
                new Date(p.start_date).getFullYear() === currentYear
              ).length,
              color: '#F59E0B'
            },
            { 
              label: 'Overdue Projects', 
              value: filteredProjects.filter(p => 
                new Date(p.end_date) < new Date() && p.status !== 'completed'
              ).length,
              color: '#EF4444'
            }
          ].map((stat, index) => (
            <div 
              key={index}
              style={{ 
                background: 'var(--sony-white)',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px solid var(--sony-gray-200)',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div style={{ 
                fontSize: '24px',
                fontWeight: '700',
                color: stat.color,
                marginBottom: '4px'
              }}>
                {stat.value}
              </div>
              <div style={{ 
                fontSize: '14px',
                color: 'var(--sony-gray-600)',
                fontWeight: '500'
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {!loading && filteredProjects.length === 0 && (
        <div style={{ 
          textAlign: 'center',
          padding: '64px 32px',
          color: 'var(--sony-gray-600)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            No projects in timeline
          </h3>
          <p>Try adjusting your filters or adding projects for this year</p>
        </div>
      )}
    </div>
  );
};

export default Timeline;