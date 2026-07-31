import React, { useState, useEffect } from "react";
import { Users, Plus, Edit2, Trash2, Mail, Briefcase, Building } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    role: '',
    is_admin: false
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setFormData({
      name: '',
      email: '',
      department: '',
      role: '',
      is_admin: false
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setIsEditMode(true);
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      department: user.department,
      role: user.role,
      is_admin: user.is_admin || false
    });
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode && selectedUser) {
        await axios.put(`${API}/users/${selectedUser.id}`, formData);
      } else {
        await axios.post(`${API}/users`, formData);
      }
      await fetchUsers();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving user:', error);
      alert("Failed to save user. Please try again.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      await axios.delete(`${API}/users/${userId}`);
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert("Failed to delete user.");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '32px' }}>
        <div className="skeleton" style={{ height: '40px', width: '300px', marginBottom: '32px' }}></div>
        <div className="skeleton" style={{ height: '400px', width: '100%', borderRadius: '12px' }}></div>
      </div>
    );
  }

  return (
    <div data-testid="admin-users-container">
      {/* Header */}
      <div className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Users color="var(--sony-red)" size={32} />
              User Administration
            </h1>
            <p className="dashboard-subtitle">
              Manage AD/LDAP resources, emails, and roles for project allocation
            </p>
          </div>
          <Button 
            style={{ 
              background: 'var(--sony-red)',
              color: 'white',
              border: 'none'
            }}
            onClick={openCreateModal}
          >
            <Plus size={16} style={{ marginRight: '8px' }} />
            New User
          </Button>
        </div>
      </div>

      <div style={{ padding: '0 32px', marginBottom: '32px' }}>
        <div style={{ 
          background: 'var(--sony-white)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
          border: '1px solid var(--sony-gray-200)',
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: 'var(--sony-gray-900)' }}>
            Registered Users ({users.length})
          </h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid var(--sony-gray-200)', color: 'var(--sony-gray-600)' }}>Name</th>
                  <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid var(--sony-gray-200)', color: 'var(--sony-gray-600)' }}>Email</th>
                  <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid var(--sony-gray-200)', color: 'var(--sony-gray-600)' }}>Department</th>
                  <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid var(--sony-gray-200)', color: 'var(--sony-gray-600)' }}>Role</th>
                  <th style={{ padding: '16px', textAlign: 'center', borderBottom: '2px solid var(--sony-gray-200)', color: 'var(--sony-gray-600)' }}>Admin</th>
                  <th style={{ padding: '16px', textAlign: 'center', borderBottom: '2px solid var(--sony-gray-200)', color: 'var(--sony-gray-600)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--sony-gray-200)' }}>
                    <td style={{ padding: '16px', fontWeight: '600', color: 'var(--sony-gray-900)' }}>
                      {user.name}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--sony-gray-800)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Mail size={14} color="var(--sony-gray-500)" />
                        {user.email}
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--sony-gray-800)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building size={14} color="var(--sony-gray-500)" />
                        {user.department}
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--sony-gray-800)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Briefcase size={14} color="var(--sony-gray-500)" />
                        {user.role}
                      </div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      {user.is_admin ? (
                        <span style={{ background: 'rgba(229,9,20,0.1)', color: 'var(--sony-red)', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>ADMIN</span>
                      ) : (
                        <span style={{ color: 'var(--sony-gray-500)', fontSize: '11px' }}>User</span>
                      )}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => openEditModal(user)}
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          style={{ color: 'var(--sony-red)' }}
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--sony-gray-500)' }}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create/Edit User Modal */}
      {isModalOpen && (
        <div 
          className="modal-overlay"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="project-detail-modal"
            style={{ maxWidth: '600px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="modal-close-btn"
            >
              ✕
            </button>
            
            <div className="modal-header">
              <h1>{isEditMode ? 'Edit User' : 'Create New User'}</h1>
              <p style={{ color: 'var(--sony-gray-600)', fontSize: '16px', marginBottom: '24px' }}>
                {isEditMode ? 'Update user details' : 'Register a new resource for project allocation'}
              </p>
            </div>

            <form onSubmit={handleSaveUser} style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <Label htmlFor="user-name">Full Name *</Label>
                  <Input
                    id="user-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                    placeholder="e.g. Maria Garcia"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="user-email">Email Address *</Label>
                  <Input
                    id="user-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                    placeholder="maria.garcia@sonymusic.com"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <Label htmlFor="user-dept">Department *</Label>
                  <Input
                    id="user-dept"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({...prev, department: e.target.value}))}
                    placeholder="e.g. Engineering"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="user-role">Role / Job Title *</Label>
                  <Input
                    id="user-role"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({...prev, role: e.target.value}))}
                    placeholder="e.g. Frontend Developer"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(229,9,20,0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(229,9,20,0.1)' }}>
                <input 
                  type="checkbox" 
                  id="user-admin"
                  checked={formData.is_admin}
                  onChange={(e) => setFormData(prev => ({...prev, is_admin: e.target.checked}))}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--sony-red)' }}
                />
                <Label htmlFor="user-admin" style={{ cursor: 'pointer', margin: 0, fontWeight: 'bold' }}>Usuário é Administrador do Portal</Label>
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
                  onClick={() => setIsModalOpen(false)}
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
                  {isEditMode ? 'Save Changes' : 'Create User'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
