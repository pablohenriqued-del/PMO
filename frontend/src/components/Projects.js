import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Plus,
  Calendar,
  DollarSign,
  Edit2,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  X,
  Image as ImageIcon
} from "lucide-react";
import html2canvas from "html2canvas";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import axios from "axios";
// import { toast } from "../hooks/use-toast";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [managerFilter, setManagerFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid, kanban, table, gantt
  const [updateData, setUpdateData] = useState({
    progress: 0,
    budget_spent: 0,
    revenue_generated: 0,
    milestones: []
  });

  const openEditModal = () => {
    setEditFormData({
      ...selectedProject,
      team_members: Array.isArray(selectedProject.team_members) ? selectedProject.team_members.join(', ') : '',
      streaming_platforms: Array.isArray(selectedProject.streaming_platforms) ? selectedProject.streaming_platforms.join(', ') : '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditProject = async (e) => {
    e.preventDefault();
    try {
      const projectData = {
        ...editFormData,
        budget_allocated: parseFloat(editFormData.budget_allocated) || 0,
        revenue_expected: parseFloat(editFormData.revenue_expected) || 0,
        team_members: typeof editFormData.team_members === 'string' 
          ? editFormData.team_members.split(',').map(m => m.trim()).filter(Boolean)
          : editFormData.team_members,
        streaming_platforms: typeof editFormData.streaming_platforms === 'string'
          ? editFormData.streaming_platforms.split(',').map(p => p.trim()).filter(Boolean)
          : editFormData.streaming_platforms
      };

      const response = await axios.put(`${API}/projects/${selectedProject.id}`, projectData);
      
      await fetchProjects();
      
      setProjects(prev => prev.map(p => p.id === selectedProject.id ? response.data : p));
      setSelectedProject(response.data);
      
      setIsEditModalOpen(false);
      alert("Project updated successfully!");
    } catch (error) {
      console.error('Error updating project:', error);
      alert("Error: Failed to update project.");
    }
  };


  const [commentText, setCommentText] = useState("");
  const handleAddComment = async (projectId) => {
    if (!commentText.trim()) return;
    try {
      const res = await axios.post(`${API}/projects/${projectId}/comments`, { text: commentText });
      const updatedProject = { ...selectedProject };
      updatedProject.activities = [res.data, ...(updatedProject.activities || [])];
      setSelectedProject(updatedProject);
      setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p));
      setCommentText("");
    } catch(e) {
      console.error(e);
    }
  };

  const openUpdateModal = () => {
    setUpdateData({
      progress: selectedProject.progress || 0,
      budget_spent: selectedProject.budget_spent || 0,
      revenue_generated: selectedProject.revenue_generated || 0,
      milestones: selectedProject.milestones ? [...selectedProject.milestones] : []
    });
    setIsUpdateModalOpen(true);
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      const updatedProjectData = {
        ...selectedProject,
        progress: parseInt(updateData.progress, 10),
        budget_spent: parseFloat(updateData.budget_spent),
        revenue_generated: parseFloat(updateData.revenue_generated),
        milestones: updateData.milestones
      };

      const response = await axios.put(`${API}/projects/${selectedProject.id}`, updatedProjectData);
      
      // Update local state
      setProjects(prev => prev.map(p => p.id === selectedProject.id ? response.data : p));
      setSelectedProject(response.data);
      
      setIsUpdateModalOpen(false);
      alert("Project updated successfully!");
    } catch (error) {
      console.error('Error updating project:', error);
      alert("Error: Failed to update project. Please try again.");
    }
  };

  const toggleMilestone = (index) => {
    const newMilestones = [...updateData.milestones];
    newMilestones[index].completed = !newMilestones[index].completed;
    setUpdateData(prev => ({ ...prev, milestones: newMilestones }));
  };

    const addMilestone = () => {
    setUpdateData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { name: '', date: new Date().toISOString().split('T')[0], completed: false, assigned_to: null }]
    }));
  };

  const removeMilestone = (index) => {
    setUpdateData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  const updateMilestoneName = (index, name) => {
    const newMilestones = [...updateData.milestones];
    newMilestones[index].name = name;
    setUpdateData(prev => ({ ...prev, milestones: newMilestones }));
  };

  const updateMilestoneDate = (index, date) => {
    const newMilestones = [...updateData.milestones];
    newMilestones[index].date = date;
    setUpdateData(prev => ({ ...prev, milestones: newMilestones }));
  };

  const assignUserToMilestone = (index, userId) => {
    const newMilestones = [...updateData.milestones];
    newMilestones[index].assigned_to = userId;
    setUpdateData(prev => ({ ...prev, milestones: newMilestones }));
  };

  const [managers, setManagers] = useState([]);
  const [ldapUsers, setLdapUsers] = useState([]);
  const [dbLabels, setDbLabels] = useState({ 
    managers: [], 
    countries: ['Brazil', 'Argentina', 'Colombia', 'Chile', 'Peru', 'Mexico', 'USA', 'Canada', 'Spain', 'Portugal'], 
    departments: ['A&R', 'MKT', 'Legal', 'IT', 'Finance', 'Sales', 'PX'] 
  });
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    type: 'digital',
    manager: '',
    country: 'Brazil',
    budget_allocated: '',
    revenue_expected: '',
    start_date: '',
    end_date: '',
    team_members: '',
    streaming_platforms: '',
    documentations: '',
    envs: ''
  });

  useEffect(() => {
    fetchProjects();
    fetchManagers();
    fetchLdapUsers();
  }, []);

  const fetchLdapUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setLdapUsers(response.data);
    } catch (error) {
      console.error('Error fetching LDAP users:', error);
    }
  };

  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery, statusFilter, managerFilter, countryFilter, departmentFilter, typeFilter, priorityFilter]);

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
    let filtered = [...projects];

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

  const CountryFlag = ({ country, size = 16 }) => {
    const getCountryCode = (c) => {
      switch(c) {
        case 'Brazil': return 'br';
        case 'Argentina': return 'ar';
        case 'Colombia': return 'co';
        case 'Chile': return 'cl';
        case 'Peru': return 'pe';
        case 'Mexico': return 'mx';
        case 'USA': return 'us';
        case 'Canada': return 'ca';
        case 'Spain': return 'es';
        case 'Portugal': return 'pt';
        default: return 'global';
      }
    };

    const code = getCountryCode(country);
    if (code === 'global') {
      return <span style={{ fontSize: `${size}px`, lineHeight: 1 }}>🌍</span>;
    }
    return (
      <img 
        src={`https://flagcdn.com/w40/${code}.png`} 
        height={size} 
        alt={country} 
        title={country}
        style={{ borderRadius: '2px', objectFit: 'cover', display: 'inline-block' }}
      />
    );
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

  const downloadProjectCard = async (e, projectId, projectName) => {
    e.stopPropagation();
    try {
      const cardElement = document.getElementById(`project-card-${projectId}`);
      if (!cardElement) return;
      
      // Temporarily hide the download button to not include it in the image
      const downloadBtn = cardElement.querySelector('.download-card-btn');
      if (downloadBtn) downloadBtn.style.display = 'none';

      const canvas = await html2canvas(cardElement, {
        backgroundColor: '#1E1E1E', // Match the dark theme background
        scale: 2 // Higher resolution
      });

      if (downloadBtn) downloadBtn.style.display = 'flex';

      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = `Project_${projectName.replace(/\s+/g, '_')}.png`;
      link.href = image;
      link.click();
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to generate image.');
    }
  };

  
  const fileInputRef = React.useRef(null);
  
  const handleImportSchedule = async (e, projectId) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API}/projects/${projectId}/import-schedule`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setProjects(prev => prev.map(p => p.id === projectId ? response.data : p));
      if (selectedProject && selectedProject.id === projectId) {
        setSelectedProject(response.data);
      }
      alert("Cronograma importado com sucesso (Planner/Monday)!");
    } catch (error) {
      console.error("Erro na importação", error);
      alert("Falha ao importar o arquivo CSV.");
    }
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };


  const handleGenerateAI = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      await axios.post(`${API}/ai/prompt-to-project`, { prompt: aiPrompt });
      await fetchProjects();
      setIsPromptModalOpen(false);
      setAiPrompt("");
      alert("✨ Projeto gerado com sucesso pela IA!");
    } catch (err) {
      alert("Erro ao gerar projeto com a IA.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleGenerateMagicLink = async (projectId) => {
    try {
      const res = await axios.post(`${API}/projects/${projectId}/magic-link`);
      navigator.clipboard.writeText(res.data.magic_link);
      alert("🔗 Magic Link copiado para a área de transferência! Envie para o empresário/artista no WhatsApp.");
    } catch (e) {
      alert("Erro ao gerar Magic Link");
    }
  };

  const handlePlannerSync = (action) => {
    if (action === 'import') {
      alert("⬇️ Import from MS Planner/Monday.com - Feature coming soon!");
    } else if (action === 'export') {
      alert("⬆️ Export to MS Planner - Feature coming soon!");
    }
  };

  const handleExportCSV = () => {
    try {
      // Create CSV content
      const headers = ['Project Name', 'Manager', 'Status', 'Priority', 'Type', 'Country', 'Department', 'Budget Allocated', 'Budget Spent', 'Revenue Expected', 'Progress', 'Start Date', 'End Date'];
      const csvRows = [headers.join(',')];
      
      filteredProjects.forEach(project => {
        const row = [
          `"${project.name || ''}"`,
          `"${project.manager || ''}"`,
          project.status || '',
          project.priority || '',
          project.type || '',
          project.country || '',
          project.department || '',
          project.budget_allocated || 0,
          project.budget_spent || 0,
          project.revenue_expected || 0,
          project.progress || 0,
          project.start_date || '',
          project.end_date || ''
        ];
        csvRows.push(row.join(','));
      });
      
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `projects_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert("✅ Projects exported to CSV successfully!");
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert("❌ Error exporting projects to CSV");
    }
  };


  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const projectData = {
        ...newProject,
        budget_allocated: parseFloat(newProject.budget_allocated) || 0,
        revenue_expected: parseFloat(newProject.revenue_expected) || 0,
        team_members: newProject.team_members.split(',').map(member => member.trim()).filter(Boolean),
        streaming_platforms: newProject.streaming_platforms.split(',').map(platform => platform.trim()).filter(Boolean)
      };

      const response = await axios.post(`${API}/projects`, projectData);
      
      // Refresh projects list
      await fetchProjects();
      
      // Reset form
      setNewProject({
        name: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        type: 'digital',
        manager: '',
        country: 'Brazil',
        budget_allocated: '',
        revenue_expected: '',
        start_date: '',
        end_date: '',
        team_members: '',
        streaming_platforms: '',
        documentations: '',
        envs: ''
      });
      
      setIsCreateModalOpen(false);
      alert("Project created successfully!");
    } catch (error) {
      console.error('Error creating project:', error);
      alert("Error: Failed to create project. Please try again.");
    }
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 className="dashboard-title">Project Management</h1>
            <p className="dashboard-subtitle">
              Manage and track all digital projects and streaming initiatives
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="outline" onClick={() => handlePlannerSync('import')} title="Import from MS Planner">⬇️ Planner</Button>
            <Button variant="outline" onClick={() => handlePlannerSync('export')} title="Export to MS Planner">⬆️ Planner</Button>
            <Button variant="outline" onClick={handleExportCSV} title="Export as CSV/Excel">⬇️ Excel</Button>
            <Button style={{ background: 'var(--sony-red)', color: 'white', border: 'none' }} onClick={() => setIsCreateModalOpen(true)} data-testid="add-project-btn">
              <Plus size={16} style={{ marginRight: '8px' }} /> New Project
            </Button>
            <Button style={{ background: 'linear-gradient(90deg, #8B5CF6, #EC4899)', color: 'white', border: 'none', boxShadow: '0 0 15px rgba(139, 92, 246, 0.5)' }} onClick={() => setIsPromptModalOpen(true)}>
              ✨ Gerar com IA
            </Button>
          </div>
        </div>

        {/* View Mode Toggles */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant={viewMode === 'grid' ? 'default' : 'outline'} onClick={() => setViewMode('grid')} style={viewMode === 'grid' ? {background: 'var(--sony-red)', color: 'white', border: 'none'} : {}}>Grid</Button>
          <Button variant={viewMode === 'kanban' ? 'default' : 'outline'} onClick={() => setViewMode('kanban')} style={viewMode === 'kanban' ? {background: 'var(--sony-red)', color: 'white', border: 'none'} : {}}>Kanban</Button>
          <Button variant={viewMode === 'table' ? 'default' : 'outline'} onClick={() => setViewMode('table')} style={viewMode === 'table' ? {background: 'var(--sony-red)', color: 'white', border: 'none'} : {}}>Table</Button>
          <Button variant={viewMode === 'gantt' ? 'default' : 'outline'} onClick={() => setViewMode('gantt')} style={viewMode === 'gantt' ? {background: 'var(--sony-red)', color: 'white', border: 'none'} : {}}>Gantt</Button>
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
          gridTemplateColumns: '2fr repeat(6, 1fr)', 
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
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--sony-gray-700)', marginBottom: '8px' }}>
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

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--sony-gray-700)', marginBottom: '8px' }}>
              Country
            </label>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger>
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
              <SelectTrigger>
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
              <SelectTrigger>
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
              <SelectTrigger>
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
            Showing {filteredProjects.length} of {projects.length} projects
          </span>
          {(searchQuery || statusFilter !== "all" || managerFilter !== "all" || countryFilter !== "all" || typeFilter !== "all" || departmentFilter !== "all" || priorityFilter !== "all") && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setManagerFilter("all");
                setCountryFilter("all");
                setDepartmentFilter("all");
                setTypeFilter("all");
                setPriorityFilter("all");
              }}
              data-testid="clear-filters"
            >
              <X size={14} style={{ marginRight: '4px' }} />
              Clear Filters
            </Button>
          )}
        </div>
      </div>


      {/* Views Rendering */}
      {viewMode === 'grid' && (
        <div className="projects-grid">

        {filteredProjects.map((project) => {
          const budgetStatus = getBudgetStatus(project.budget_allocated, project.budget_spent);
          
          return (
            <div 
              key={project.id} 
              id={`project-card-${project.id}`}
              className="project-card"
              onClick={() => openProjectModal(project)}
              data-testid={`project-${project.id}`}
              style={{ position: 'relative' }}
            >
              <button
                className="download-card-btn"
                onClick={(e) => downloadProjectCard(e, project.id, project.name)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'var(--sony-gray-100)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--sony-gray-600)',
                  zIndex: 10,
                  transition: 'all 0.2s ease'
                }}
                title="Download as Image"
              >
                <ImageIcon size={16} />
              </button>
              
              <div className="project-header" style={{ paddingRight: '32px' }}>
                <div>
                  <h3 className="project-title">{project.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p className="project-manager">Manager: {project.manager}</p>
                    <CountryFlag country={project.country || 'Global'} size={14} />
                    {project.department && project.department !== 'Unassigned' && (
                      <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', color: 'var(--sony-gray-400)' }}>
                        {project.department}
                      </span>
                    )}
                  </div>
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

              {project.documentations && (
                <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--sony-gray-600)' }}>
                  <strong>Docs:</strong> {project.documentations.length > 30 ? project.documentations.substring(0, 30) + '...' : project.documentations}
                </div>
              )}
              {project.envs && (
                <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--sony-gray-600)' }}>
                  <strong>ENVs:</strong> {project.envs.length > 30 ? project.envs.substring(0, 30) + '...' : project.envs}
                </div>
              )}

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
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', padding: '0 32px 32px' }}>
          {['planning', 'in_progress', 'on_hold', 'completed'].map(status => (
            <div key={status} style={{ minWidth: '320px', background: 'rgba(20,20,20,0.6)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '16px' }}>
              <h3 style={{ color: 'white', marginBottom: '16px', textTransform: 'capitalize' }}>{status.replace('_', ' ')}</h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                {filteredProjects.filter(p => p.status === status).map(project => (
                  <div key={project.id} onClick={() => openProjectModal(project)} style={{ background: 'rgba(0,0,0,0.5)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                    <div style={{ fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>{project.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--sony-gray-400)' }}>{project.manager}</div>
                    <div className="progress-bar" style={{ height: '4px', marginTop: '8px' }}><div className="progress-fill" style={{ width: `${project.progress}%` }}></div></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div style={{ padding: '0 32px 32px' }}>
          <div style={{ background: 'rgba(20,20,20,0.6)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white', fontSize: '14px' }}>
              <thead style={{ background: 'rgba(0,0,0,0.5)', textAlign: 'left' }}>
                <tr>
                  <th style={{ padding: '16px' }}>Project Name</th>
                  <th style={{ padding: '16px' }}>Manager</th>
                  <th style={{ padding: '16px' }}>Status</th>
                  <th style={{ padding: '16px' }}>Budget Spent</th>
                  <th style={{ padding: '16px' }}>Progress</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map(project => (
                  <tr key={project.id} onClick={() => openProjectModal(project)} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                    <td style={{ padding: '16px', fontWeight: 'bold' }}>{project.name}</td>
                    <td style={{ padding: '16px', color: 'var(--sony-gray-400)' }}>{project.manager}</td>
                    <td style={{ padding: '16px' }}><span className={`status-badge status-${project.status}`}>{project.status.replace('_', ' ')}</span></td>
                    <td style={{ padding: '16px', color: 'var(--sony-red)' }}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(project.budget_spent)}</td>
                    <td style={{ padding: '16px' }}>{project.progress}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Gantt View */}
      {viewMode === 'gantt' && (
        <div style={{ padding: '0 32px 32px' }}>
          <div style={{ background: 'rgba(20,20,20,0.6)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '24px', overflowX: 'auto' }}>
            <div style={{ minWidth: '800px' }}>
              {filteredProjects.map(project => (
                <div key={project.id} onClick={() => openProjectModal(project)} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', cursor: 'pointer' }}>
                  <div style={{ width: '250px', color: 'white', fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.name}</div>
                  <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', height: '24px', borderRadius: '12px', position: 'relative' }}>
                    <div style={{ width: `${project.progress}%`, background: 'var(--sony-red)', height: '100%', borderRadius: '12px' }}></div>
                  </div>
                  <div style={{ width: '100px', color: 'var(--sony-gray-400)', fontSize: '12px', textAlign: 'right' }}>{project.progress}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h1>{selectedProject.name}</h1>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Button 
                      variant="outline"
                      onClick={openEditModal}
                      title="Edit Project Information"
                    >
                      <Edit2 size={16} style={{ marginRight: '8px' }} />
                      Edit Project
                    </Button>
                    <input 
                      type="file" 
                      accept=".csv" 
                      ref={fileInputRef} 
                      style={{ display: 'none' }}
                      onChange={(e) => handleImportSchedule(e, selectedProject.id)}
                    />
                    <Button 
                      style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid #10B981' }}
                      onClick={() => handleGenerateMagicLink(selectedProject.id)}
                      title="Gerar Portal do Artista (Link Read-Only seguro)"
                    >
                      🔗 Generate Magic Link
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => fileInputRef.current.click()}
                      title="Importar CSV do Monday.com ou MS Planner"
                    >
                      ⬇️ Import Planner/Monday
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={openUpdateModal}
                      data-testid="open-update-modal-btn"
                    >
                      Update Progress
                    </Button>
                  </div>
                </div>
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
                    <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--sony-gray-600)', marginBottom: '16px' }}>
                      {selectedProject.description || 'No description available'}
                    </p>
                    
                    {selectedProject.documentations && (
                      <div style={{ marginBottom: '16px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Documentations</h4>
                        <p style={{ fontSize: '13px', color: 'var(--sony-gray-600)', whiteSpace: 'pre-line' }}>{selectedProject.documentations}</p>
                      </div>
                    )}
                    
                    {selectedProject.envs && (
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>ENVs</h4>
                        <p style={{ fontSize: '13px', color: 'var(--sony-gray-600)', whiteSpace: 'pre-line' }}>{selectedProject.envs}</p>
                      </div>
                    )}
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
                        <span style={{ fontSize: '12px', color: 'var(--sony-gray-600)' }}>Country</span>
                        <div style={{ fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CountryFlag country={selectedProject.country || 'Global'} size={16} />
                          {selectedProject.country || 'Global'}
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
                            <div style={{ fontSize: '12px', color: 'var(--sony-gray-600)', marginTop: '4px' }}>
                              Due: {formatDate(milestone.date)}
                              {milestone.assigned_to && (
                                <span style={{ marginLeft: '12px', padding: '2px 8px', background: 'var(--sony-gray-200)', borderRadius: '12px' }}>
                                  Assigned to: {ldapUsers.find(u => u.id === milestone.assigned_to)?.name || 'Unknown'}
                                </span>
                              )}
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

                {/* Activity & Comments Stream */}
                <div style={{ 
                  background: 'var(--sony-gray-50)',
                  padding: '20px',
                  borderRadius: '12px',
                  gridColumn: '1 / -1',
                  marginTop: '24px'
                }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                    Activity & Comments
                  </h4>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <Input 
                      placeholder="Add a comment or update... (use @ to tag)" 
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(selectedProject.id)}
                      style={{ flex: 1 }}
                    />
                    <Button onClick={() => handleAddComment(selectedProject.id)} style={{ background: 'var(--sony-red)', color: 'white' }}>Post</Button>
                  </div>
                  <div style={{ display: 'grid', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                    {selectedProject.activities?.length > 0 ? selectedProject.activities.map((act, i) => (
                      <div key={i} style={{ padding: '12px', background: act.type === 'system' ? 'rgba(0,0,0,0.05)' : 'white', borderRadius: '8px', borderLeft: `3px solid ${act.type === 'system' ? '#F59E0B' : 'var(--sony-red)'}` }}>
                        <div style={{ fontSize: '12px', color: 'var(--sony-gray-500)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                          <strong>{act.user}</strong>
                          <span>{new Date(act.date).toLocaleString()}</span>
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--sony-gray-800)' }}>{act.text}</div>
                      </div>
                    )) : <div style={{ fontSize: '14px', color: 'var(--sony-gray-500)' }}>No activities yet.</div>}
                  </div>
                </div>

                  <div style={{ 
                    background: 'var(--sony-gray-50)',
                    padding: '20px',
                    borderRadius: '12px'
                  }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                      Financial Overview
                    </h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--sony-gray-600)' }}>Allocated Budget</span>
                        <div style={{ fontSize: '18px', fontWeight: '700' }}>
                          {formatCurrency(selectedProject.budget_allocated)}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--sony-gray-600)' }}>Budget Spent</span>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--sony-red)' }}>
                          {formatCurrency(selectedProject.budget_spent)}
                        </div>
                      </div>
                      <div style={{ borderTop: '1px solid var(--sony-gray-200)', paddingTop: '8px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--sony-gray-600)' }}>Expected Revenue</span>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#10B981' }}>
                          {formatCurrency(selectedProject.revenue_expected)}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--sony-gray-600)' }}>Generated Revenue</span>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#10B981' }}>
                          {formatCurrency(selectedProject.revenue_generated)}
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

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <div 
          className="modal-overlay"
          onClick={() => setIsCreateModalOpen(false)}
          data-testid="create-modal-overlay"
        >
          <div 
            className="project-detail-modal"
            onClick={(e) => e.stopPropagation()}
            data-testid="create-project-modal"
          >
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="modal-close-btn"
              data-testid="close-create-modal-btn"
            >
              ✕
            </button>
            
            <div className="modal-header">
              <h1>Create New Project</h1>
              <p style={{ color: 'var(--sony-gray-600)', fontSize: '16px', marginBottom: '24px' }}>
                Add a new project to the Sony Music portfolio
              </p>
            </div>

            <form onSubmit={handleCreateProject} style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <Label htmlFor="project-name">Project Name *</Label>
                  <Input
                    id="project-name"
                    value={newProject.name}
                    onChange={(e) => setNewProject(prev => ({...prev, name: e.target.value}))}
                    placeholder="Enter project name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="project-manager">Project Manager *</Label>
                  <select 
                    id="project-manager"
                    value={newProject.manager} 
                    onChange={(e) => setNewProject(prev => ({...prev, manager: e.target.value}))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--sony-gray-300)',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    required
                  >
                    <option value="">Select manager</option>
                    {managers.map(manager => (
                      <option key={manager} value={manager}>{manager}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <Label htmlFor="project-department">Area / Department *</Label>
                  <select 
                    id="project-department"
                    value={newProject.department || ""} 
                    onChange={(e) => setNewProject(prev => ({...prev, department: e.target.value}))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--sony-gray-300)',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    required
                  >
                    <option value="">Select Area</option>
                    <option value="A&R">A&R</option>
                    <option value="MKT">MKT</option>
                    <option value="Legal">Legal</option>
                    <option value="IT">IT</option>
                    <option value="Finance">Finance</option>
                    <option value="Sales">Sales</option>
                    <option value="PX">PX</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="project-country">Country</Label>
                  <select 
                    id="project-country"
                    value={newProject.country} 
                    onChange={(e) => setNewProject(prev => ({...prev, country: e.target.value}))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--sony-gray-300)',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    required
                  >
                    <option value="Global">Global</option>
                    <optgroup label="South America">
                      <option value="Brazil">Brazil</option>
                      <option value="Argentina">Argentina</option>
                      <option value="Colombia">Colombia</option>
                      <option value="Chile">Chile</option>
                      <option value="Peru">Peru</option>
                    </optgroup>
                    <optgroup label="North America">
                      <option value="USA">USA</option>
                      <option value="Canada">Canada</option>
                      <option value="Mexico">Mexico</option>
                    </optgroup>
                    <optgroup label="Europe">
                      <option value="Spain">Spain</option>
                      <option value="Portugal">Portugal</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="project-description">Description</Label>
                <Textarea
                  id="project-description"
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({...prev, description: e.target.value}))}
                  placeholder="Describe the project objectives and scope"
                  rows={3}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div>
                  <Label htmlFor="project-status">Status</Label>
                  <select 
                    id="project-status"
                    value={newProject.status} 
                    onChange={(e) => setNewProject(prev => ({...prev, status: e.target.value}))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--sony-gray-300)',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="planning">Planning</option>
                    <option value="in_progress">In Progress</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="project-priority">Priority</Label>
                  <select 
                    id="project-priority"
                    value={newProject.priority} 
                    onChange={(e) => setNewProject(prev => ({...prev, priority: e.target.value}))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--sony-gray-300)',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="project-type">Type</Label>
                  <select 
                    id="project-type"
                    value={newProject.type} 
                    onChange={(e) => setNewProject(prev => ({...prev, type: e.target.value}))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--sony-gray-300)',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="digital">Digital</option>
                    <option value="streaming">Streaming</option>
                    <option value="platform">Platform</option>
                    <option value="legal">Legal</option>
                    <option value="release">Release</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div>
                  <Label htmlFor="project-budget">Budget (USD) *</Label>
                  <Input
                    id="project-budget"
                    type="number"
                    value={newProject.budget_allocated}
                    onChange={(e) => setNewProject(prev => ({...prev, budget_allocated: e.target.value}))}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="project-revenue">Revenue Expected (USD)</Label>
                  <Input
                    id="project-revenue"
                    type="number"
                    value={newProject.revenue_expected}
                    onChange={(e) => setNewProject(prev => ({...prev, revenue_expected: e.target.value}))}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <Label htmlFor="project-start">Start Date *</Label>
                  <Input
                    id="project-start"
                    type="date"
                    value={newProject.start_date}
                    onChange={(e) => setNewProject(prev => ({...prev, start_date: e.target.value}))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="project-end">End Date *</Label>
                  <Input
                    id="project-end"
                    type="date"
                    value={newProject.end_date}
                    onChange={(e) => setNewProject(prev => ({...prev, end_date: e.target.value}))}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <Label htmlFor="project-team">Team Members</Label>
                  <Input
                    id="project-team"
                    value={newProject.team_members}
                    onChange={(e) => setNewProject(prev => ({...prev, team_members: e.target.value}))}
                    placeholder="Developer, Designer, QA (comma separated)"
                  />
                </div>
                <div>
                  <Label htmlFor="project-platforms">Streaming Platforms</Label>
                  <Input
                    id="project-platforms"
                    value={newProject.streaming_platforms}
                    onChange={(e) => setNewProject(prev => ({...prev, streaming_platforms: e.target.value}))}
                    placeholder="Spotify, Apple Music (comma separated)"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <Label htmlFor="project-docs">Documentations</Label>
                  <Textarea
                    id="project-docs"
                    value={newProject.documentations}
                    onChange={(e) => setNewProject(prev => ({...prev, documentations: e.target.value}))}
                    placeholder="Links or reference to documentation"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="project-envs">Environment Variables</Label>
                  <Textarea
                    id="project-envs"
                    value={newProject.envs}
                    onChange={(e) => setNewProject(prev => ({...prev, envs: e.target.value}))}
                    placeholder="E.g. API_KEY, DB_HOST (Comma separated or new line)"
                    rows={2}
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
                  Create Project
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {isEditModalOpen && (
        <div 
          className="modal-overlay"
          onClick={() => setIsEditModalOpen(false)}
          data-testid="create-modal-overlay"
        >
          <div 
            className="project-detail-modal"
            onClick={(e) => e.stopPropagation()}
            data-testid="create-project-modal"
          >
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="modal-close-btn"
              data-testid="close-create-modal-btn"
            >
              ✕
            </button>
            
            <div className="modal-header">
              <h1>Edit Project</h1>
              <p style={{ color: 'var(--sony-gray-600)', fontSize: '16px', marginBottom: '24px' }}>
                Edit the project details and metadata
              </p>
            </div>

            <form onSubmit={handleEditProject} style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <Label htmlFor="project-name">Project Name *</Label>
                  <Input
                    id="project-name"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData(prev => ({...prev, name: e.target.value}))}
                    placeholder="Enter project name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="project-manager">Project Manager *</Label>
                  <select 
                    id="project-manager"
                    value={editFormData.manager} 
                    onChange={(e) => setEditFormData(prev => ({...prev, manager: e.target.value}))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--sony-gray-300)',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    required
                  >
                    <option value="">Select manager</option>
                    {managers.map(manager => (
                      <option key={manager} value={manager}>{manager}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <Label htmlFor="project-department">Area / Department *</Label>
                  <select 
                    id="project-department"
                    value={editFormData.department || ""} 
                    onChange={(e) => setEditFormData(prev => ({...prev, department: e.target.value}))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--sony-gray-300)',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    required
                  >
                    <option value="">Select Area</option>
                    <option value="A&R">A&R</option>
                    <option value="MKT">MKT</option>
                    <option value="Legal">Legal</option>
                    <option value="IT">IT</option>
                    <option value="Finance">Finance</option>
                    <option value="Sales">Sales</option>
                    <option value="PX">PX</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="project-country">Country</Label>
                  <select 
                    id="project-country"
                    value={editFormData.country} 
                    onChange={(e) => setEditFormData(prev => ({...prev, country: e.target.value}))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--sony-gray-300)',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    required
                  >
                    <option value="Global">Global</option>
                    <optgroup label="South America">
                      <option value="Brazil">Brazil</option>
                      <option value="Argentina">Argentina</option>
                      <option value="Colombia">Colombia</option>
                      <option value="Chile">Chile</option>
                      <option value="Peru">Peru</option>
                    </optgroup>
                    <optgroup label="North America">
                      <option value="USA">USA</option>
                      <option value="Canada">Canada</option>
                      <option value="Mexico">Mexico</option>
                    </optgroup>
                    <optgroup label="Europe">
                      <option value="Spain">Spain</option>
                      <option value="Portugal">Portugal</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="project-description">Description</Label>
                <Textarea
                  id="project-description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({...prev, description: e.target.value}))}
                  placeholder="Describe the project objectives and scope"
                  rows={3}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div>
                  <Label htmlFor="project-status">Status</Label>
                  <select 
                    id="project-status"
                    value={editFormData.status} 
                    onChange={(e) => setEditFormData(prev => ({...prev, status: e.target.value}))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--sony-gray-300)',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="planning">Planning</option>
                    <option value="in_progress">In Progress</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="project-priority">Priority</Label>
                  <select 
                    id="project-priority"
                    value={editFormData.priority} 
                    onChange={(e) => setEditFormData(prev => ({...prev, priority: e.target.value}))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--sony-gray-300)',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="project-type">Type</Label>
                  <select 
                    id="project-type"
                    value={editFormData.type} 
                    onChange={(e) => setEditFormData(prev => ({...prev, type: e.target.value}))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--sony-gray-300)',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="digital">Digital</option>
                    <option value="streaming">Streaming</option>
                    <option value="platform">Platform</option>
                    <option value="legal">Legal</option>
                    <option value="release">Release</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div>
                  <Label htmlFor="project-budget">Budget (USD) *</Label>
                  <Input
                    id="project-budget"
                    type="number"
                    value={editFormData.budget_allocated}
                    onChange={(e) => setEditFormData(prev => ({...prev, budget_allocated: e.target.value}))}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="project-revenue">Revenue Expected (USD)</Label>
                  <Input
                    id="project-revenue"
                    type="number"
                    value={editFormData.revenue_expected}
                    onChange={(e) => setEditFormData(prev => ({...prev, revenue_expected: e.target.value}))}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <Label htmlFor="project-start">Start Date *</Label>
                  <Input
                    id="project-start"
                    type="date"
                    value={editFormData.start_date}
                    onChange={(e) => setEditFormData(prev => ({...prev, start_date: e.target.value}))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="project-end">End Date *</Label>
                  <Input
                    id="project-end"
                    type="date"
                    value={editFormData.end_date}
                    onChange={(e) => setEditFormData(prev => ({...prev, end_date: e.target.value}))}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <Label htmlFor="project-team">Team Members</Label>
                  <Input
                    id="project-team"
                    value={editFormData.team_members}
                    onChange={(e) => setEditFormData(prev => ({...prev, team_members: e.target.value}))}
                    placeholder="Developer, Designer, QA (comma separated)"
                  />
                </div>
                <div>
                  <Label htmlFor="project-platforms">Streaming Platforms</Label>
                  <Input
                    id="project-platforms"
                    value={editFormData.streaming_platforms}
                    onChange={(e) => setEditFormData(prev => ({...prev, streaming_platforms: e.target.value}))}
                    placeholder="Spotify, Apple Music (comma separated)"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <Label htmlFor="project-docs">Documentations</Label>
                  <Textarea
                    id="project-docs"
                    value={editFormData.documentations}
                    onChange={(e) => setEditFormData(prev => ({...prev, documentations: e.target.value}))}
                    placeholder="Links or reference to documentation"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="project-envs">Environment Variables</Label>
                  <Textarea
                    id="project-envs"
                    value={editFormData.envs}
                    onChange={(e) => setEditFormData(prev => ({...prev, envs: e.target.value}))}
                    placeholder="E.g. API_KEY, DB_HOST (Comma separated or new line)"
                    rows={2}
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
                  onClick={() => setIsEditModalOpen(false)}
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
                  Save Changes
                </Button>
              </div>
            </form>
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
      {/* Update Project Modal */}
      {isUpdateModalOpen && selectedProject && (
        <div 
          className="modal-overlay"
          onClick={() => setIsUpdateModalOpen(false)}
          style={{ zIndex: 1100 }}
        >
          <div 
            className="project-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsUpdateModalOpen(false)}
              className="modal-close-btn"
            >
              ✕
            </button>
            
            <div className="modal-header">
              <h1>Update Project</h1>
              <p style={{ color: 'var(--sony-gray-600)', fontSize: '16px', marginBottom: '24px' }}>
                Update progress, budget, and milestone status for {selectedProject.name}
              </p>
            </div>

            <form onSubmit={handleUpdateProject} style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div>
                  <Label htmlFor="update-progress">Progress (%) *</Label>
                  <Input
                    id="update-progress"
                    type="number"
                    min="0"
                    max="100"
                    value={updateData.progress}
                    onChange={(e) => setUpdateData(prev => ({...prev, progress: e.target.value}))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="update-budget">Budget Spent (USD) *</Label>
                  <Input
                    id="update-budget"
                    type="number"
                    min="0"
                    step="0.01"
                    value={updateData.budget_spent}
                    onChange={(e) => setUpdateData(prev => ({...prev, budget_spent: e.target.value}))}
                    required
                  />
                  <div style={{ fontSize: '12px', color: 'var(--sony-gray-500)', marginTop: '4px' }}>
                    Allocated: {formatCurrency(selectedProject.budget_allocated)}
                  </div>
                </div>
                <div>
                  <Label htmlFor="update-revenue">Revenue Gen. (USD)</Label>
                  <Input
                    id="update-revenue"
                    type="number"
                    min="0"
                    step="0.01"
                    value={updateData.revenue_generated}
                    onChange={(e) => setUpdateData(prev => ({...prev, revenue_generated: e.target.value}))}
                  />
                  <div style={{ fontSize: '12px', color: 'var(--sony-gray-500)', marginTop: '4px' }}>
                    Expected: {formatCurrency(selectedProject.revenue_expected)}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Label>Milestones & Resource Allocation (AD/LDAP)</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addMilestone}
                    style={{ fontSize: '12px', padding: '4px 8px', height: 'auto' }}
                  >
                    + Add Milestone
                  </Button>
                </div>
                <div style={{ 
                  border: '1px solid var(--sony-gray-200)', 
                  borderRadius: '8px',
                  padding: '12px',
                  marginTop: '8px',
                  display: 'grid',
                  gap: '12px'
                }}>
                  {updateData.milestones.length === 0 ? (
                    <div style={{ fontSize: '12px', color: 'var(--sony-gray-500)', textAlign: 'center' }}>No milestones added yet.</div>
                  ) : (
                    updateData.milestones.map((milestone, index) => (
                      <div 
                        key={index} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px',
                        }}
                      >
                        <input 
                          type="checkbox" 
                          checked={milestone.completed}
                          onChange={() => toggleMilestone(index)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        
                        <Input 
                          value={milestone.name}
                          onChange={(e) => updateMilestoneName(index, e.target.value)}
                          placeholder="Milestone name"
                          style={{ flex: 1, height: '32px', fontSize: '14px' }}
                          required
                        />
                        
                        <select
                          value={milestone.assigned_to || ''}
                          onChange={(e) => assignUserToMilestone(index, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            border: '1px solid var(--sony-gray-300)',
                            borderRadius: '4px',
                            fontSize: '12px',
                            maxWidth: '180px',
                            height: '32px'
                          }}
                        >
                          <option value="">Unassigned</option>
                          {ldapUsers.map(user => (
                            <option key={user.id} value={user.id}>
                              {user.name} ({user.role})
                            </option>
                          ))}
                        </select>

                        <Input 
                          type="date"
                          value={milestone.date.split('T')[0]}
                          onChange={(e) => updateMilestoneDate(index, e.target.value)}
                          style={{ width: '130px', height: '32px', fontSize: '12px' }}
                          required
                        />

                        <button 
                          type="button"
                          onClick={() => removeMilestone(index)}
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: 'var(--sony-red)', 
                            cursor: 'pointer',
                            padding: '4px' 
                          }}
                          title="Remove milestone"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
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
                  onClick={() => setIsUpdateModalOpen(false)}
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
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Prompt Modal */}
      {isPromptModalOpen && (
        <div className="modal-overlay" onClick={() => !isGenerating && setIsPromptModalOpen(false)} style={{ zIndex: 1200 }}>
          <div className="project-detail-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            {!isGenerating && <button onClick={() => setIsPromptModalOpen(false)} className="modal-close-btn">✕</button>}
            <div className="modal-header">
              <h1 style={{ background: 'linear-gradient(90deg, #8B5CF6, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                ✨ Prompt-to-Project
              </h1>
              <p style={{ color: 'var(--sony-gray-400)', fontSize: '14px', marginBottom: '24px' }}>
                Descreva o projeto em linguagem natural e deixe a IA montar o cronograma, orçamento e escopo em segundos.
              </p>
            </div>
            {isGenerating ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '48px', animation: 'spin 2s linear infinite', marginBottom: '16px' }}>✨</div>
                <h3 style={{ color: 'white' }}>A Mágica está acontecendo...</h3>
                <p style={{ color: 'var(--sony-gray-500)' }}>A IA (GPT-5.4) está estruturando o escopo, calculando o budget e definindo as datas de entrega.</p>
              </div>
            ) : (
              <form onSubmit={handleGenerateAI}>
                <Textarea 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ex: Vamos lançar um novo álbum do Bad Bunny na América Latina focado no TikTok em 3 meses com 300k de budget"
                  rows={5}
                  required
                  style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid var(--sony-gray-300)', color: 'white' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                  <Button type="button" variant="outline" onClick={() => setIsPromptModalOpen(false)}>Cancelar</Button>
                  <Button type="submit" style={{ background: 'linear-gradient(90deg, #8B5CF6, #EC4899)', color: 'white', border: 'none' }}>
                    Gerar Projeto
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;