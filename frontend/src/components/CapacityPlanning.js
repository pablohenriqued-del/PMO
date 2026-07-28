import React, { useState, useEffect } from "react";
import { Users, AlertTriangle, CheckCircle, Flame } from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CapacityPlanning = () => {
  const [capacity, setCapacity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCapacity();
  }, []);

  const fetchCapacity = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/capacity-planning`);
      setCapacity(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getHeatmapColor = (value) => {
    if (value === 0) return 'var(--sony-gray-100)';
    if (value <= 50) return '#D1FAE5'; // light green
    if (value <= 80) return '#10B981'; // green
    if (value <= 100) return '#F59E0B'; // yellow/orange
    return 'var(--sony-red)'; // red for over-allocated
  };

  const getTextColor = (value) => {
    if (value === 0) return 'var(--sony-gray-500)';
    if (value <= 50) return '#065F46';
    if (value <= 80) return 'white';
    if (value <= 100) return 'white';
    return 'white';
  };

  if (loading) {
    return <div style={{ padding: '32px' }}><div className="skeleton" style={{ height: '400px' }}></div></div>;
  }

  return (
    <div data-testid="capacity-planning-container">
      <div className="dashboard-header" style={{ marginBottom: '32px' }}>
        <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Users color="var(--sony-red)" size={32} />
          Capacity Planning & Heatmap
        </h1>
        <p className="dashboard-subtitle">
          Gestão de capacidade e previsão de alocação de recursos
        </p>
      </div>

      <div style={{ padding: '0 32px 32px' }}>
        <div style={{ 
          background: 'var(--sony-white)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          border: '1px solid var(--sony-gray-200)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--sony-gray-900)' }}>
              Resource Heatmap
            </h3>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '12px', height: '12px', background: '#D1FAE5', borderRadius: '2px' }}></div> 0-50%</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '12px', height: '12px', background: '#10B981', borderRadius: '2px' }}></div> 51-80%</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '12px', height: '12px', background: '#F59E0B', borderRadius: '2px' }}></div> 81-100%</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '12px', height: '12px', background: 'var(--sony-red)', borderRadius: '2px' }}></div> Overallocated (>100%)</div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--sony-gray-600)', borderBottom: '2px solid var(--sony-gray-200)' }}>Resource</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--sony-gray-600)', borderBottom: '2px solid var(--sony-gray-200)' }}>Role</th>
                  {capacity?.months.map(m => (
                    <th key={m} style={{ padding: '12px', textAlign: 'center', color: 'var(--sony-gray-600)', borderBottom: '2px solid var(--sony-gray-200)' }}>
                      {m}
                    </th>
                  ))}
                  <th style={{ padding: '12px', textAlign: 'center', color: 'var(--sony-gray-600)', borderBottom: '2px solid var(--sony-gray-200)' }}>Burnout Risk</th>
                </tr>
              </thead>
              <tbody>
                {capacity?.data.map(user => {
                  const maxAlloc = Math.max(...Object.values(user.allocations));
                  const isBurnout = maxAlloc > 100;
                  return (
                    <tr key={user.user_id} style={{ background: 'var(--sony-gray-50)' }}>
                      <td style={{ padding: '16px', fontWeight: '600', color: 'var(--sony-gray-900)', borderRadius: '8px 0 0 8px' }}>
                        {user.name}
                        <div style={{ fontSize: '11px', color: 'var(--sony-gray-500)', fontWeight: 'normal' }}>{user.department}</div>
                      </td>
                      <td style={{ padding: '16px', fontSize: '13px', color: 'var(--sony-gray-700)' }}>{user.role}</td>
                      
                      {capacity.months.map(m => {
                        const val = user.allocations[m];
                        return (
                          <td key={m} style={{ padding: '8px' }}>
                            <div style={{
                              background: getHeatmapColor(val),
                              color: getTextColor(val),
                              padding: '8px',
                              borderRadius: '6px',
                              textAlign: 'center',
                              fontWeight: 'bold',
                              fontSize: '14px'
                            }}>
                              {val}%
                            </div>
                          </td>
                        );
                      })}
                      
                      <td style={{ padding: '16px', textAlign: 'center', borderRadius: '0 8px 8px 0' }}>
                        {isBurnout ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'var(--sony-red)', fontSize: '12px', fontWeight: 'bold' }}>
                            <Flame size={16} /> HIGH
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#10B981', fontSize: '12px' }}>
                            <CheckCircle size={14} /> Low
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', borderLeft: '4px solid #3B82F6', fontSize: '13px', color: 'var(--sony-gray-700)' }}>
            <strong>💡 AI Insight:</strong> Resources showing >100% capacity indicate a high risk of burnout and project delays. The AI Copilot can automatically reallocate tasks to available resources.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapacityPlanning;
