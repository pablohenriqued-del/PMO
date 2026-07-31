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
  AlertTriangle,
  Download,
  Image as ImageIcon
} from "lucide-react";
import html2canvas from "html2canvas";
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
  const [countryFilter, setCountryFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const timelineRef = React.useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [hiddenProjects, setHiddenProjects] = useState([]);
  const [managers, setManagers] = useState([]);
  const [dbLabels, setDbLabels] = useState({
    countries: ['Brazil', 'Argentina', 'Colombia', 'Chile', 'Peru', 'Mexico', 'USA', 'Canada', 'Spain', 'Portugal'],
    departments: ['A&R', 'MKT', 'Legal', 'IT', 'Finance', 'Sales', 'PX']
  });

  useEffect(() => {
    fetchProjects();
    fetchManagers();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, statusFilter, managerFilter, countryFilter, departmentFilter, typeFilter, priorityFilter]);

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
    try {
      const labelsRes = await axios.get(`${API}/projects/labels`);
      setDbLabels(labelsRes.data);
    } catch (e) {
      console.error(e);
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
    if (countryFilter !== "all") {
      filtered = filtered.filter(project => project.country === countryFilter);
    }
    if (departmentFilter !== "all") {
      filtered = filtered.filter(project => project.department === departmentFilter);
    }
    if (typeFilter !== "all") {
      filtered = filtered.filter(project => project.type === typeFilter);
    }
    if (priorityFilter !== "all") {
      filtered = filtered.filter(project => project.priority === priorityFilter);
    }

    setFilteredProjects(filtered);
  };


  const handleExportTimeline = async () => {
    if (!timelineRef.current) return;
    setIsExporting(true);
    
    // Tiny delay to ensure UI updates if needed
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const canvas = await html2canvas(timelineRef.current, {
        backgroundColor: '#121212', // Match dark theme
        scale: 2, // High resolution for presentations
        logging: false,
        useCORS: true
      });
      
      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = `PMO_Timeline_${currentYear}.png`;
      link.href = image;
      link.click();
    } catch (e) {
      console.error("Error exporting timeline:", e);
      alert("Failed to export timeline.");
    } finally {
      setIsExporting(false);
    }
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
              onClick={handleExportTimeline}
              disabled={isExporting}
              style={{ background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)', color: 'white', border: 'none', boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)' }}
            >
              {isExporting ? <Clock size={16} className="animate-spin" style={{ marginRight: '8px' }}/> : <ImageIcon size={16} style={{ marginRight: '8px' }} />}
              {isExporting ? 'Exporting...' : 'Exportar PNG (PPT)'}
            </Button>
            
            <div style={{ width: '1px', height: '24px', background: 'var(--sony-gray-700)', margin: '0 8px' }}></div>

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
          gridTemplateColumns: 'repeat(6, 1fr)', 
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
              Status
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
              Manager
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

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--sony-gray-700)', marginBottom: '8px' }}>
              Country
            </label>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger data-testid="timeline-country-filter">
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {dbLabels?.countries?.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--sony-gray-700)', marginBottom: '8px' }}>
              Area
            </label>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger data-testid="timeline-area-filter">
                <SelectValue placeholder="All Areas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                {dbLabels?.departments?.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>


          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--sony-gray-700)', marginBottom: '8px' }}>
              Type
            </label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger data-testid="timeline-type-filter">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="digital">Digital</SelectItem>
                <SelectItem value="streaming">Streaming</SelectItem>
                <SelectItem value="platform">Platform</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="release">Release</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--sony-gray-700)', marginBottom: '8px' }}>
              Priority
            </label>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger data-testid="timeline-priority-filter">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
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
            Showing {filteredProjects.length} projects
          </span>
        </div>
      </div>

      {/* Timeline View */}
      <div style={{ padding: '0 32px', marginBottom: '32px' }}>
        <div 
          ref={timelineRef}
          style={{ 
            background: 'var(--sony-white)',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            position: 'relative'
          }}
        >
          {/* Timeline Title (Only visible in export or nice header inside) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
             <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--sony-gray-900)' }}>Roadmap Anual - {currentYear}</h2>
             <div className="sony-icon" style={{ width: '40px' }}><img src="https://customer-assets-jai6qajn.emergentagent.net/job_84a5e55c-26a8-4190-b713-50bfc83fd45d/artifacts/ql8q4vna_Sony_Music_Logo.png" alt="Sony Music" /></div>
          </div>
          {/* Month Headers */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '220px 1fr',
            gap: '24px',
            marginBottom: '16px',
            paddingBottom: '16px',
            borderBottom: '2px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: '700', 
              color: 'var(--pure-white)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Calendar size={20} />
              Projects
            </div>
            <div style={{ display: 'grid', gridTemplateRows: 'auto auto', gap: '8px' }}>
              {/* Quarters */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '4px' }}>
                {['Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => (
                  <div key={q} style={{ 
                    textAlign: 'center', fontSize: '14px', fontWeight: '800', 
                    color: 'var(--pure-white)', background: 'rgba(255,255,255,0.05)',
                    padding: '4px 0', borderRadius: '4px', letterSpacing: '2px',
                    border: '1px solid rgba(255,255,255,0.02)'
                  }}>
                    {q}
                  </div>
                ))}
              </div>
              {/* Months */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '4px' }}>
                {[...Array(12)].map((_, index) => (
                  <div 
                    key={index}
                    style={{ 
                      textAlign: 'center', fontSize: '11px', fontWeight: '700',
                      color: 'var(--sony-gray-400)', padding: '4px 0',
                      textTransform: 'uppercase', letterSpacing: '1px',
                      borderLeft: index % 3 !== 0 ? '1px dashed rgba(255,255,255,0.1)' : 'none'
                    }}
                  >
                    {getMonthName(index)}
                  </div>
                ))}
              </div>
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
                    gridTemplateColumns: '220px 1fr',
                    gap: '24px',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: index < filteredProjects.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
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
                    height: '40px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '8px',
                    overflow: 'visible',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', pointerEvents: 'none' }}>
                    {[...Array(12)].map((_, i) => (
                      <div key={i} style={{ borderLeft: i > 0 ? '1px dashed rgba(255,255,255,0.03)' : 'none', height: '100%' }}></div>
                    ))}
                  </div>
                    {!isHidden && position.visible && (
                      <>
                        {/* Project Bar */}
                        <div
                          style={{
                            position: 'absolute',
                            top: '6px',
                            height: '24px',
                            background: `linear-gradient(90deg, ${getStatusColor(project.status)}, ${getStatusColor(project.status)}88)`,
                            borderRadius: '12px',
                            left: position.left,
                            width: position.width,
                            minWidth: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: '800',
                            boxShadow: `0 0 12px ${getStatusColor(project.status)}66`,
                            cursor: 'pointer',
                            border: `1px solid ${getStatusColor(project.status)}`,
                            zIndex: 2,
                            backdropFilter: 'blur(4px)'
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

                        {/* Milestones (Filtered for Key Milestones only) */}
                        {project.milestones && project.milestones.filter(m => m.is_key_milestone !== false).map((milestone, milestoneIndex) => {
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
                                  width: '2px',
                                  height: '40px',
                                  background: `linear-gradient(180deg, transparent, ${milestone.completed ? '#10B981' : '#F59E0B'}, transparent)`,
                                  zIndex: 15,
                                  cursor: 'pointer',
                                  transform: 'translateX(-50%)'
                                }}
                                title={`${milestone.name}\n${formatDate(milestone.date)}\n${milestone.completed ? '✅ Completed' : '⏳ Pending'}`}
                              >
                                <div style={{
                                  position: 'absolute',
                                  top: '12px',
                                  left: '-6px',
                                  width: '14px',
                                  height: '14px',
                                  background: milestone.completed ? '#10B981' : '#F59E0B',
                                  border: '2px solid var(--sony-white)',
                                  boxShadow: `0 0 10px ${milestone.completed ? '#10B981' : '#F59E0B'}`,
                                  transform: 'rotate(45deg)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
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