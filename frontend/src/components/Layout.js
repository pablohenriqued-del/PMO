import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FolderOpen, 
  Calendar, 
  PiggyBank,
  BookOpen,
  AlertTriangle,
  FileText,
  Search,
  Zap,
  Menu,
  X
} from "lucide-react";

const Layout = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      current: location.pathname === "/"
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