import React, { useState, useEffect } from "react";
import { Globe, TrendingUp, DollarSign, Activity, Target } from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RegionalDashboard = () => {
  const [countryData, setCountryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCountryData();
  }, []);

  const fetchCountryData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/analytics/countries`);
      setCountryData(response.data);
    } catch (error) {
      console.error('Error fetching country data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercent = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  };

  if (loading) {
    return (
      <div style={{ padding: '32px' }}>
        <div className="skeleton" style={{ height: '40px', width: '300px', marginBottom: '32px' }}></div>
        <div className="skeleton" style={{ height: '400px', width: '100%', borderRadius: '12px' }}></div>
      </div>
    );
  }

  // Calculate totals
  const totalRevenue = countryData.reduce((sum, c) => sum + c.revenue_generated, 0);
  const totalSpent = countryData.reduce((sum, c) => sum + c.budget_spent, 0);
  const totalProfit = totalRevenue - totalSpent;
  const globalROI = totalSpent > 0 ? (totalProfit / totalSpent) * 100 : 0;

  return (
    <div data-testid="regional-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Globe color="var(--sony-red)" size={32} />
          Regional Analytics
        </h1>
        <p className="dashboard-subtitle">
          Financial performance, ROI, and efficiency breakdown by country
        </p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Global Revenue</span>
            <div className="kpi-icon" style={{ background: 'var(--sony-red)' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: 'var(--sony-gray-900)' }}>
            {formatCurrency(totalRevenue)}
          </div>
          <div className="kpi-change positive">
            <span>Generated vs Expected</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Global Profitability</span>
            <div className="kpi-icon" style={{ background: '#10B981' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: totalProfit >= 0 ? '#10B981' : 'var(--sony-red)' }}>
            {formatCurrency(totalProfit)}
          </div>
          <div className="kpi-change">
            <span>Net profit across all regions</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Global ROI</span>
            <div className="kpi-icon" style={{ background: '#F59E0B' }}>
              <Target size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#F59E0B' }}>
            {formatPercent(globalROI)}
          </div>
          <div className="kpi-change">
            <span>Return on Investment</span>
          </div>
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
            Performance by Country
          </h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid var(--sony-gray-200)', color: 'var(--sony-gray-600)' }}>Country</th>
                  <th style={{ padding: '16px', textAlign: 'center', borderBottom: '2px solid var(--sony-gray-200)', color: 'var(--sony-gray-600)' }}>Projects</th>
                  <th style={{ padding: '16px', textAlign: 'right', borderBottom: '2px solid var(--sony-gray-200)', color: 'var(--sony-gray-600)' }}>Budget Spent</th>
                  <th style={{ padding: '16px', textAlign: 'right', borderBottom: '2px solid var(--sony-gray-200)', color: 'var(--sony-gray-600)' }}>Revenue Gen.</th>
                  <th style={{ padding: '16px', textAlign: 'right', borderBottom: '2px solid var(--sony-gray-200)', color: 'var(--sony-gray-600)' }}>Profitability</th>
                  <th style={{ padding: '16px', textAlign: 'center', borderBottom: '2px solid var(--sony-gray-200)', color: 'var(--sony-gray-600)' }}>ROI</th>
                  <th style={{ padding: '16px', textAlign: 'center', borderBottom: '2px solid var(--sony-gray-200)', color: 'var(--sony-gray-600)' }}>Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {countryData.map((data, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid var(--sony-gray-200)' }}>
                    <td style={{ padding: '16px', fontWeight: '600', color: 'var(--sony-gray-900)' }}>
                      {data.country}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', color: 'var(--sony-gray-800)' }}>
                      {data.project_count}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', color: 'var(--sony-gray-800)' }}>
                      {formatCurrency(data.budget_spent)}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', color: 'var(--sony-gray-800)', fontWeight: '600' }}>
                      {formatCurrency(data.revenue_generated)}
                    </td>
                    <td style={{ 
                      padding: '16px', 
                      textAlign: 'right', 
                      fontWeight: '700',
                      color: data.profitability >= 0 ? '#10B981' : 'var(--sony-red)'
                    }}>
                      {formatCurrency(data.profitability)}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        background: data.roi >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(229, 9, 20, 0.1)',
                        color: data.roi >= 0 ? '#10B981' : 'var(--sony-red)',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}>
                        {formatPercent(data.roi)}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <Activity size={16} color={data.financial_efficiency >= 1 ? '#10B981' : '#F59E0B'} />
                        <span style={{ fontWeight: '600', color: 'var(--sony-gray-800)' }}>
                          {data.financial_efficiency.toFixed(2)}x
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionalDashboard;
