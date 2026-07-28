import React, { useState, useEffect } from "react";
import VoiceCommand from "./VoiceCommand";
import PresentationMode from "./PresentationMode";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard,
  LineChart,
  BrainCircuit, 
  BarChart, 
  Bell, 
  FolderOpen, 
  Calendar, 
  PiggyBank,
  Globe,
  BookOpen,
  AlertTriangle,
  FileText,
  Search,
  Zap,
  Users,
  Menu,
  X
} from "lucide-react";

const Layout = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // 1 min
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/notifications`);
      setNotifications(response.data);
    } catch (e) {
      console.error(e);
    }
  };


  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      current: location.pathname === "/"
    },
    {
      name: "Capacity Planning",
      href: "/capacity-planning",
      icon: LineChart,
      current: location.pathname === "/capacity-planning"
    },
    {
      name: "AI Copilot",
      href: "/ai-copilot",
      icon: BrainCircuit,
      current: location.pathname === "/ai-copilot"
    },
    {
      name: "Status Report",
      href: "/status-report",
      icon: BarChart,
      current: location.pathname === "/status-report"
    },
    {
      name: "Regional Analytics",
      href: "/regional",
      icon: Globe,
      current: location.pathname === "/regional"
    },
    {
      name: "Projects",
      href: "/projects", 
      icon: FolderOpen,
      current: location.pathname === "/projects"
    },
    {
      name: "Timeline",
      href: "/timeline",
      icon: Calendar,
      current: location.pathname === "/timeline"
    },
    {
      name: "Budget",
      href: "/budget",
      icon: PiggyBank,
      current: location.pathname === "/budget"
    },
    {
      name: "Lessons Learned",
      href: "/lessons-learned",
      icon: BookOpen,
      current: location.pathname === "/lessons-learned"
    },
    {
      name: "Risk Radar",
      href: "/risk-radar",
      icon: AlertTriangle,
      current: location.pathname === "/risk-radar"
    },
    {
      name: "PMO Playbook",
      href: "/pmo-playbook",
      icon: FileText,
      current: location.pathname === "/pmo-playbook"
    },
    {
      name: "Root Cause Analysis",
      href: "/root-cause-analysis",
      icon: Search,
      current: location.pathname === "/root-cause-analysis"
    },
    {
      name: "Innovation Radar",
      href: "/innovation-radar",
      icon: Zap,
      current: location.pathname === "/innovation-radar"
    },
    {
      name: "User Administration",
      href: "/admin/users",
      icon: Users,
      current: location.pathname === "/admin/users"
    }
  ];

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <div className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="brand-header">
          <div className="brand-logo">
            <div className="sony-icon">SM</div>
            <div>
              <div className="brand-text">Sony Music</div>
              <div className="brand-subtitle">Latin Ibéria PMO</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="nav-menu">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`nav-item ${item.current ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid={`nav-${item.name.toLowerCase()}`}
              >
                <Icon className="nav-icon" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div style={{ 
          padding: '20px', 
          borderTop: '1px solid var(--sony-gray-700)',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px' 
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'var(--sony-red)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--sony-white)',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              PM
            </div>
            <div>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: 'var(--sony-white)' 
              }}>
                PMO Manager
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: 'var(--sony-gray-400)' 
              }}>
                Sony Music LA
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content">
        {/* Global Controls */}
        <div style={{ position: 'fixed', top: '24px', right: '32px', zIndex: 1000, display: 'flex', alignItems: 'center' }}>
          <PresentationMode />
          <div style={{ position: 'relative', marginLeft: '16px' }}>
          <button 
            onClick={() => setShowNotif(!showNotif)}
            style={{ 
              background: 'var(--sony-gray-900)', 
              border: '1px solid var(--sony-gray-200)',
              borderRadius: '50%',
              width: '40px', height: '40px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--sony-white)', cursor: 'pointer', position: 'relative'
            }}
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span style={{ 
                position: 'absolute', top: '-4px', right: '-4px', 
                background: 'var(--sony-red)', color: 'white', 
                fontSize: '10px', fontWeight: 'bold', 
                width: '18px', height: '18px', borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                {notifications.length}
              </span>
            )}
          </button>

          {showNotif && (
            <div style={{ 
              position: 'absolute', top: '50px', right: '0', width: '320px', 
              background: 'var(--sony-white)', borderRadius: '12px', 
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '1px solid var(--sony-gray-200)',
              maxHeight: '400px', overflowY: 'auto'
            }}>
              <div style={{ padding: '16px', borderBottom: '1px solid var(--sony-gray-200)', fontWeight: 'bold' }}>
                Notificações & Alertas
              </div>
              <div style={{ display: 'grid' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--sony-gray-600)' }}>Nenhum alerta.</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} style={{ 
                      padding: '16px', borderBottom: '1px solid var(--sony-gray-200)',
                      borderLeft: `4px solid ${n.priority === 'critical' ? 'var(--sony-red)' : n.priority === 'high' ? '#F59E0B' : '#3B82F6'}`
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>{n.title}</div>
                      <div style={{ fontSize: '13px', color: 'var(--sony-gray-700)' }}>{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        </div>

        {/* Mobile Header */}
        <div className="mobile-header" style={{
          display: 'none',
          padding: '16px',
          background: 'var(--sony-white)',
          borderBottom: '1px solid var(--sony-gray-200)',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="sony-icon">SM</div>
            <span style={{ fontWeight: '700', fontSize: '16px' }}>Sony Music PMO</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px'
            }}
            data-testid="mobile-menu-toggle"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {children}
      </main>
      <VoiceCommand />

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 50
          }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <style jsx>{`
        @media (max-width: 968px) {
          .mobile-header {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;