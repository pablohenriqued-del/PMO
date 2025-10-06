import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Search, 
  Filter,
  Tag,
  User,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Plus
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import axios from "axios";
// import { toast } from "../hooks/use-toast";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LessonsLearned = () => {
  const [lessons, setLessons] = useState([]);
  const [filteredLessons, setFilteredLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [impactFilter, setImpactFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newLesson, setNewLesson] = useState({
    project: '',
    category: 'Technical',
    lesson: '',
    impact: 'Medium',
    description: '',
    tags: ''
  });

  useEffect(() => {
    fetchLessons();
  }, []);

  useEffect(() => {
    filterLessons();
  }, [lessons, searchQuery, categoryFilter, impactFilter]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/lessons-learned`);
      setLessons(response.data);
    } catch (error) {
      console.error('Error fetching lessons learned:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    try {
      const lessonData = {
        ...newLesson,
        date: new Date().toISOString().split('T')[0],
        author: "PMO Manager", // Could be dynamic based on logged user
        tags: newLesson.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };

      // For now, just add to local state since we don't have a POST endpoint
      const newLessonWithId = {
        ...lessonData,
        id: `ll-${Date.now()}`
      };
      
      setLessons(prev => [...prev, newLessonWithId]);
      
      // Reset form
      setNewLesson({
        project: '',
        category: 'Technical',
        lesson: '',
        impact: 'Medium',
        description: '',
        tags: ''
      });
      
      setIsCreateModalOpen(false);
      toast({
        title: "Success",
        description: "Lesson learned added successfully!",
      });
    } catch (error) {
      console.error('Error creating lesson:', error);
      toast({
        title: "Error", 
        description: "Failed to add lesson. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filterLessons = () => {
    let filtered = lessons;

    if (searchQuery) {
      filtered = filtered.filter(lesson => 
        lesson.lesson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.project.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(lesson => lesson.category === categoryFilter);
    }

    if (impactFilter !== "all") {
      filtered = filtered.filter(lesson => lesson.impact === impactFilter);
    }

    setFilteredLessons(filtered);
  };

  const getImpactColor = (impact) => {
    switch (impact.toLowerCase()) {
      case 'critical': return 'var(--sony-red)';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      case 'low': return '#10B981';
      default: return 'var(--sony-gray-600)';
    }
  };

  const getImpactIcon = (impact) => {
    switch (impact.toLowerCase()) {
      case 'critical': return <AlertCircle size={16} />;
      case 'high': return <TrendingUp size={16} />;
      case 'medium': return <CheckCircle size={16} />;
      case 'low': return <CheckCircle size={16} />;
      default: return <CheckCircle size={16} />;
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
      <div data-testid="lessons-loading">
        <div className="dashboard-header">
          <div className="skeleton" style={{ height: '28px', width: '300px', marginBottom: '8px' }}></div>
          <div className="skeleton" style={{ height: '16px', width: '400px' }}></div>
        </div>
        <div className="kpi-grid">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="kpi-card">
              <div className="skeleton" style={{ height: '120px' }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div data-testid="lessons-learned-container">
      {/* Header */}
      <div className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="dashboard-title">Lessons Learned</h1>
            <p className="dashboard-subtitle">
              Knowledge repository from completed projects and initiatives
            </p>
          </div>
          <Button 
            style={{ 
              background: 'var(--sony-red)',
              color: 'white',
              border: 'none'
            }}
            onClick={() => setIsCreateModalOpen(true)}
            data-testid="add-lesson-btn"
          >
            <Plus size={16} style={{ marginRight: '8px' }} />
            Add Lesson
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
              Search Lessons
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
                placeholder="Search lessons, projects, or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '44px' }}
                data-testid="lessons-search"
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
              Category
            </label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger data-testid="category-filter">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Technical">Technical</SelectItem>
                <SelectItem value="Process">Process</SelectItem>
                <SelectItem value="Legal">Legal</SelectItem>
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
              Impact Level
            </label>
            <Select value={impactFilter} onValueChange={setImpactFilter}>
              <SelectTrigger data-testid="impact-filter">
                <SelectValue placeholder="All Impact Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Impact Levels</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
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
            Showing {filteredLessons.length} of {lessons.length} lessons learned
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="var(--sony-gray-600)" />
            <span style={{ fontSize: '14px', color: 'var(--sony-gray-600)' }}>
              Active filters: {[searchQuery, categoryFilter !== 'all' ? categoryFilter : '', impactFilter !== 'all' ? impactFilter : ''].filter(Boolean).length}
            </span>
          </div>
        </div>
      </div>

      {/* Lessons Grid */}
      <div style={{ padding: '0 32px', marginBottom: '32px' }}>
        <div style={{ display: 'grid', gap: '24px' }}>
          {filteredLessons.map((lesson) => (
            <div 
              key={lesson.id}
              style={{
                background: 'var(--sony-white)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                border: '1px solid var(--sony-gray-200)',
                transition: 'all 0.3s ease'
              }}
              className="lesson-card"
              data-testid={`lesson-${lesson.id}`}
            >
              {/* Header */}
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    fontSize: '18px',
                    fontWeight: '700',
                    color: 'var(--sony-gray-900)',
                    marginBottom: '8px'
                  }}>
                    {lesson.lesson}
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      fontSize: '14px',
                      color: 'var(--sony-gray-600)',
                      background: 'var(--sony-gray-100)',
                      padding: '4px 12px',
                      borderRadius: '20px'
                    }}>
                      {lesson.project}
                    </span>
                    <span style={{
                      fontSize: '14px',
                      color: 'var(--sony-gray-600)',
                      background: 'var(--sony-gray-100)', 
                      padding: '4px 12px',
                      borderRadius: '20px'
                    }}>
                      {lesson.category}
                    </span>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  background: `${getImpactColor(lesson.impact)}15`,
                  color: getImpactColor(lesson.impact),
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {getImpactIcon(lesson.impact)}
                  {lesson.impact} Impact
                </div>
              </div>

              {/* Description */}
              <p style={{
                fontSize: '16px',
                lineHeight: '1.6',
                color: 'var(--sony-gray-700)',
                marginBottom: '20px'
              }}>
                {lesson.description}
              </p>

              {/* Tags */}
              {lesson.tags && lesson.tags.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ 
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    alignItems: 'center'
                  }}>
                    <Tag size={14} color="var(--sony-gray-500)" />
                    {lesson.tags.map((tag, index) => (
                      <span 
                        key={index}
                        style={{
                          fontSize: '12px',
                          padding: '4px 8px',
                          background: 'var(--sony-gray-100)',
                          color: 'var(--sony-gray-700)',
                          borderRadius: '12px',
                          fontWeight: '500'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '16px',
                borderTop: '1px solid var(--sony-gray-200)',
                fontSize: '14px',
                color: 'var(--sony-gray-600)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={14} />
                  <span>{lesson.author}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={14} />
                  <span>{formatDate(lesson.date)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {!loading && filteredLessons.length === 0 && (
        <div style={{ 
          textAlign: 'center',
          padding: '64px 32px',
          color: 'var(--sony-gray-600)'
        }}>
          <BookOpen size={48} style={{ marginBottom: '16px', color: 'var(--sony-gray-400)' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            No lessons found
          </h3>
          <p>Try adjusting your search criteria or filters</p>
        </div>
      )}

      {/* Create Lesson Modal */}
      {isCreateModalOpen && (
        <div 
          className="modal-overlay"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div 
            className="project-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="modal-close-btn"
            >
              ✕
            </button>
            
            <div className="modal-header">
              <h1>Add New Lesson Learned</h1>
              <p style={{ color: 'var(--sony-gray-600)', fontSize: '16px', marginBottom: '24px' }}>
                Capture valuable insights from project experiences
              </p>
            </div>

            <form onSubmit={handleCreateLesson} style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <Label htmlFor="lesson-project">Project Name *</Label>
                  <Input
                    id="lesson-project"
                    value={newLesson.project}
                    onChange={(e) => setNewLesson(prev => ({...prev, project: e.target.value}))}
                    placeholder="Enter project name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lesson-category">Category *</Label>
                  <Select 
                    value={newLesson.category} 
                    onValueChange={(value) => setNewLesson(prev => ({...prev, category: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technical">Technical</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Process">Process</SelectItem>
                      <SelectItem value="Legal">Legal</SelectItem>
                      <SelectItem value="Management">Management</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="lesson-title">Lesson Title *</Label>
                <Input
                  id="lesson-title"
                  value={newLesson.lesson}
                  onChange={(e) => setNewLesson(prev => ({...prev, lesson: e.target.value}))}
                  placeholder="Brief, actionable lesson learned"
                  required
                />
              </div>

              <div>
                <Label htmlFor="lesson-description">Description *</Label>
                <Textarea
                  id="lesson-description"
                  value={newLesson.description}
                  onChange={(e) => setNewLesson(prev => ({...prev, description: e.target.value}))}
                  placeholder="Detailed description of the lesson, context, and recommendations"
                  rows={4}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <Label htmlFor="lesson-impact">Impact Level</Label>
                  <Select 
                    value={newLesson.impact} 
                    onValueChange={(value) => setNewLesson(prev => ({...prev, impact: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="lesson-tags">Tags</Label>
                  <Input
                    id="lesson-tags"
                    value={newLesson.tags}
                    onChange={(e) => setNewLesson(prev => ({...prev, tags: e.target.value}))}
                    placeholder="streaming, api, performance (comma separated)"
                  />
                </div>
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
                  onClick={() => setIsCreateModalOpen(false)}
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
                  Add Lesson
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .lesson-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
        }
      `}</style>
    </div>
  );
};

export default LessonsLearned;