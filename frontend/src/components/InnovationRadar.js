import React, { useState, useEffect } from "react";
import { 
  Zap, 
  Search, 
  Filter,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  Target,
  Eye,
  X
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const InnovationRadar = () => {
  const [radarData, setRadarData] = useState(null);
  const [filteredTechnologies, setFilteredTechnologies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [quadrantFilter, setQuadrantFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isCreateTechModalOpen, setIsCreateTechModalOpen] = useState(false);
  const [newTechnology, setNewTechnology] = useState({
    name: '',
    category: 'AI/ML',
    quadrant: 'Assess',
    description: '',
    impact: 'Medium',
    timeline: '6-12 months',
    risk: 'Medium'
  });

  useEffect(() => {
    fetchRadarData();
  }, []);

  useEffect(() => {
    filterTechnologies();
  }, [radarData, searchQuery, quadrantFilter, categoryFilter]);

  const fetchRadarData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/innovation-radar`);
      setRadarData(response.data);
    } catch (error) {
      console.error('Error fetching innovation radar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTechnology = async (e) => {
    e.preventDefault();
    try {
      const techData = {
        ...newTechnology,
        id: `tech-${Date.now()}`
      };
      
      // Add to local radar data
      setRadarData(prev => ({
        ...prev,
        technologies: [...prev.technologies, techData]
      }));
      
      // Reset form
      setNewTechnology({
        name: '',
        category: 'AI/ML',
        quadrant: 'Assess',
        description: '',
        impact: 'Medium',
        timeline: '6-12 months',
        risk: 'Medium'
      });
      
      setIsCreateTechModalOpen(false);
      alert("Technology added successfully!");
    } catch (error) {
      console.error('Error creating technology:', error);
      alert("Error: Failed to add technology. Please try again.");
    }
  };

  const filterTechnologies = () => {
    if (!radarData) return;
    
    let filtered = radarData.technologies;

    if (searchQuery) {
      filtered = filtered.filter(tech => 
        tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (quadrantFilter !== "all") {
      filtered = filtered.filter(tech => tech.quadrant === quadrantFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(tech => tech.category === categoryFilter);
    }

    setFilteredTechnologies(filtered);
  };

  const getQuadrantColor = (quadrant) => {
    switch (quadrant.toLowerCase()) {
      case 'adopt': return '#10B981';
      case 'trial': return '#3B82F6';
      case 'assess': return '#F59E0B';
      case 'hold': return '#EF4444';
      default: return 'var(--sony-gray-600)';
    }
  };

  const getQuadrantIcon = (quadrant) => {
    switch (quadrant.toLowerCase()) {
      case 'adopt': return <CheckCircle size={16} />;
      case 'trial': return <Target size={16} />;
      case 'assess': return <Eye size={16} />;
      case 'hold': return <X size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getImpactColor = (impact) => {
    switch (impact.toLowerCase()) {
      case 'high': return 'var(--sony-red)';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return 'var(--sony-gray-600)';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk.toLowerCase()) {
      case 'high': return 'var(--sony-red)';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return 'var(--sony-gray-600)';
    }
  };

  if (loading) {
    return (
      <div data-testid="innovation-radar-loading">
        <div className="dashboard-header">
          <div className="skeleton" style={{ height: '28px', width: '250px', marginBottom: '8px' }}></div>
          <div className="skeleton" style={{ height: '16px', width: '400px' }}></div>
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

  if (!radarData) return null;

  // Calculate statistics
  const totalTechnologies = filteredTechnologies.length;
  const adoptTechnologies = filteredTechnologies.filter(t => t.quadrant === 'Adopt').length;
  const trialTechnologies = filteredTechnologies.filter(t => t.quadrant === 'Trial').length;
  const highImpactTechnologies = filteredTechnologies.filter(t => t.impact === 'High').length;

  return (
    <div data-testid="innovation-radar-container">
      {/* Header */}
      <div className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="dashboard-title">Innovation Radar</h1>
            <p className="dashboard-subtitle">
              Emerging technologies and innovation opportunities for Sony Music
            </p>
          </div>
          <Button 
            style={{ 
              background: 'var(--sony-red)',
              color: 'white',
              border: 'none'
            }}
            onClick={() => setIsCreateTechModalOpen(true)}
            data-testid="add-technology-btn"
          >
            <Zap size={16} style={{ marginRight: '8px' }} />
            Add Technology
          </Button>
        </div>
      </div>

      {/* Innovation KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card" data-testid="kpi-total-technologies">
          <div className="kpi-header">
            <span className="kpi-title">Technologies Tracked</span>
            <div className="kpi-icon" style={{ background: '#6366F1' }}>
              <Zap size={20} />
            </div>
          </div>
          <div className="kpi-value">{totalTechnologies}</div>
          <div className="kpi-change positive">
            <TrendingUp size={16} />
            <span>Innovation portfolio</span>
          </div>
        </div>

        <div className="kpi-card" data-testid="kpi-adopt-ready">
          <div className="kpi-header">
            <span className="kpi-title">Ready to Adopt</span>
            <div className="kpi-icon" style={{ background: '#10B981' }}>
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#10B981' }}>{adoptTechnologies}</div>
          <div className="kpi-change positive">
            <CheckCircle size={16} />
            <span>Implementation ready</span>
          </div>
        </div>

        <div className="kpi-card" data-testid="kpi-trial-phase">
          <div className="kpi-header">
            <span className="kpi-title">In Trial Phase</span>
            <div className="kpi-icon" style={{ background: '#3B82F6' }}>
              <Target size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#3B82F6' }}>{trialTechnologies}</div>
          <div className="kpi-change positive">
            <Target size={16} />
            <span>Testing in progress</span>
          </div>
        </div>

        <div className="kpi-card" data-testid="kpi-high-impact">
          <div className="kpi-header">
            <span className="kpi-title">High Impact Potential</span>
            <div className="kpi-icon" style={{ background: 'var(--sony-red)' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: 'var(--sony-red)' }}>{highImpactTechnologies}</div>
          <div className="kpi-change positive">
            <TrendingUp size={16} />
            <span>Strategic opportunities</span>
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
              Search Technologies
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
                placeholder="Search technologies, categories, or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '44px' }}
                data-testid="technologies-search"
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
              Quadrant
            </label>
            <Select value={quadrantFilter} onValueChange={setQuadrantFilter}>
              <SelectTrigger data-testid="quadrant-filter">
                <SelectValue placeholder="All Quadrants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quadrants</SelectItem>
                <SelectItem value="Adopt">Adopt</SelectItem>
                <SelectItem value="Trial">Trial</SelectItem>
                <SelectItem value="Assess">Assess</SelectItem>
                <SelectItem value="Hold">Hold</SelectItem>
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
                {radarData.categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Radar Visualization */}
      <div style={{ padding: '0 32px', marginBottom: '32px' }}>
        <div style={{
          background: 'var(--sony-white)',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
          border: '1px solid var(--sony-gray-200)',
          marginBottom: '32px'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={20} />
            Technology Radar Quadrants
          </h3>

          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {radarData.quadrants.map((quadrant, index) => {
              const quadrantTechnologies = filteredTechnologies.filter(t => t.quadrant === quadrant);
              return (
                <div 
                  key={quadrant}
                  style={{
                    padding: '24px',
                    background: getQuadrantColor(quadrant) + '08',
                    border: `2px solid ${getQuadrantColor(quadrant)}20`,
                    borderRadius: '16px'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ 
                      padding: '8px',
                      background: getQuadrantColor(quadrant),
                      borderRadius: '8px',
                      color: 'white'
                    }}>
                      {getQuadrantIcon(quadrant)}
                    </div>
                    <h4 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--sony-gray-900)' }}>
                      {quadrant}
                    </h4>
                    <span style={{ 
                      fontSize: '12px', 
                      padding: '4px 8px',
                      background: getQuadrantColor(quadrant),
                      color: 'white',
                      borderRadius: '12px'
                    }}>
                      {quadrantTechnologies.length}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gap: '8px' }}>
                    {quadrantTechnologies.map((tech, techIndex) => (
                      <div 
                        key={techIndex}
                        style={{
                          padding: '12px',
                          background: 'var(--sony-white)',
                          borderRadius: '8px',
                          border: '1px solid var(--sony-gray-200)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        className="tech-card"
                        data-testid={`tech-${tech.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <h5 style={{ 
                              fontSize: '14px', 
                              fontWeight: '600',
                              color: 'var(--sony-gray-900)',
                              marginBottom: '4px'
                            }}>
                              {tech.name}
                            </h5>
                            <p style={{ 
                              fontSize: '12px', 
                              color: 'var(--sony-gray-600)',
                              marginBottom: '8px'
                            }}>
                              {tech.description.substring(0, 80)}...
                            </p>
                            <div style={{ display: 'flex', gap: '8px', fontSize: '10px' }}>
                              <span style={{
                                padding: '2px 6px',
                                background: 'var(--sony-gray-100)',
                                borderRadius: '8px'
                              }}>
                                {tech.category}
                              </span>
                              <span style={{
                                padding: '2px 6px',
                                background: getImpactColor(tech.impact) + '20',
                                color: getImpactColor(tech.impact),
                                borderRadius: '8px'
                              }}>
                                {tech.impact} Impact
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quadrant Descriptions */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            padding: '20px',
            background: 'var(--sony-gray-50)',
            borderRadius: '12px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                background: '#10B981', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px'
              }}>
                <CheckCircle size={20} color="white" />
              </div>
              <h5 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Adopt</h5>
              <p style={{ fontSize: '12px', color: 'var(--sony-gray-600)' }}>
                Proven and ready for adoption
              </p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                background: '#3B82F6', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px'
              }}>
                <Target size={20} color="white" />
              </div>
              <h5 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Trial</h5>
              <p style={{ fontSize: '12px', color: 'var(--sony-gray-600)' }}>
                Worth pursuing with pilots
              </p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                background: '#F59E0B', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px'
              }}>
                <Eye size={20} color="white" />
              </div>
              <h5 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Assess</h5>
              <p style={{ fontSize: '12px', color: 'var(--sony-gray-600)' }}>
                Explore and understand potential
              </p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                background: '#EF4444', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px'
              }}>
                <X size={20} color="white" />
              </div>
              <h5 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Hold</h5>
              <p style={{ fontSize: '12px', color: 'var(--sony-gray-600)' }}>
                Proceed with caution
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!loading && filteredTechnologies.length === 0 && (
        <div style={{ 
          textAlign: 'center',
          padding: '64px 32px',
          color: 'var(--sony-gray-600)'
        }}>
          <Zap size={48} style={{ marginBottom: '16px', color: 'var(--sony-gray-400)' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            No technologies found
          </h3>
          <p>Try adjusting your search criteria or filters</p>
        </div>
      )}

      <style jsx>{`
        .tech-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
      `}</style>
    </div>
  );
};

export default InnovationRadar;