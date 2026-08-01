import React, { useState, useEffect } from "react";
import VoiceCommand from "./VoiceCommand";
import PresentationMode from "./PresentationMode";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { 
  LayoutDashboard,
  LayoutGrid,
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
  X,
  Sparkles,
  ChevronDown,
  ChevronRight
} from "lucide-react";

const Layout = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [language, setLanguage] = useState(localStorage.getItem('pmo_lang') || 'PT');

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


  
  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    localStorage.setItem('pmo_lang', e.target.value);
  };

  const t = (pt, en, es) => {
    if (language === 'EN') return en;
    if (language === 'ES') return es;
    return pt;
  };

  const navigation = [
    {
      name: t("📊 Dashboard", "📊 Dashboard", "📊 Tablero"),
      href: "/",
      isAccordion: false
    },
    {
      name: t("🚀 Delivery", "🚀 Delivery", "🚀 Entrega"),
      isAccordion: true,
      children: [
        { name: t("Projetos", "Projects", "Proyectos"), href: "/projects" },
        { name: t("Timeline", "Timeline", "Cronograma"), href: "/timeline" },
        { name: t("Budget", "Budget", "Presupuesto"), href: "/budget" },
        { name: t("Capacity Planning", "Capacity Planning", "Capacidad"), href: "/capacity-planning" }
      ]
    },
    {
      name: t("🧠 Analytics & IA", "🧠 Analytics & AI", "🧠 Analítica e IA"),
      isAccordion: true,
      children: [
        { name: "AI Copilot", href: "/ai-copilot" },
        { name: t("Status Report", "Status Report", "Reporte de Estado"), href: "/status-report" },
        { name: t("Regional Analytics", "Regional Analytics", "Analítica Regional"), href: "/regional" },
        { name: t("Innovation Radar", "Innovation Radar", "Radar de Innovación"), href: "/innovation-radar" }
      ]
    },
    {
      name: t("🛡️ Governança PMO", "🛡️ PMO Governance", "🛡️ Gobernanza PMO"),
      isAccordion: true,
      children: [
        { name: t("Risk Radar", "Risk Radar", "Radar de Riesgos"), href: "/risk-radar" },
        { name: t("Root Cause Analysis", "Root Cause Analysis", "Análisis Causa Raíz"), href: "/root-cause-analysis" },
        { name: t("Lessons Learned", "Lessons Learned", "Lecciones Aprendidas"), href: "/lessons-learned" },
        { name: t("PMO Playbook", "PMO Playbook", "Manual PMO"), href: "/pmo-playbook" }
      ]
    },
    {
      name: t("📋 CRM & Demandas", "📋 CRM & Demands", "📋 CRM & Demandas"),
      href: "/crm",
      isAccordion: false
    },
    {
      name: t("⚙️ Administração", "⚙️ Administration", "⚙️ Administración"),
      isAccordion: true,
      children: [
        { name: t("Usuários", "Users", "Usuarios"), href: "/admin/users" },
        { name: t("Guia & Features", "Guide & Features", "Guía y Funciones"), href: "/features-guide" }
      ]
    }
  ];

  const [expandedMenus, setExpandedMenus] = useState({
    "🚀 Delivery": true,
    "🧠 Analytics & IA": false,
    "🛡️ Governança PMO": false,
    "⚙️ Administração": false
  });

  const toggleAccordion = (name) => {
    setExpandedMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const isCurrentRoute = (href) => location.pathname === href;
  
  const isAnyChildActive = (children) => {
    return children?.some(child => location.pathname === child.href);
  };


  const isSharedRoute = location.pathname.startsWith('/shared');

  if (isSharedRoute) {
    return <>{children}</>;
  }

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <div className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="brand-header">
          <div className="brand-logo">
            <div className="sony-icon"><img src="https://customer-assets-jai6qajn.emergentagent.net/job_84a5e55c-26a8-4190-b713-50bfc83fd45d/artifacts/ql8q4vna_Sony_Music_Logo.png" alt="Sony Music" /></div>
            <div>
              <div className="brand-text">Sony Music</div>
              <div className="brand-subtitle">Latin Ibéria PMO</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="nav-menu" style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '16px 12px' }}>
          {navigation.map((item) => {
            if (!item.isAccordion) {
              const active = isCurrentRoute(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-item ${active ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    color: active ? 'var(--pure-white)' : 'var(--sony-gray-400)',
                    background: active ? 'rgba(229, 9, 20, 0.15)' : 'transparent',
                    borderLeft: active ? '3px solid var(--sony-red)' : '3px solid transparent',
                    textDecoration: 'none',
                    fontWeight: active ? '600' : '500',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s ease',
                    marginBottom: '4px'
                  }}
                >
                  {item.name}
                </Link>
              );
            }

            // Accordion Item
            const childActive = isAnyChildActive(item.children);
            const isExpanded = expandedMenus[item.name];

            return (
              <div key={item.name} style={{ marginBottom: '4px' }}>
                <div
                  onClick={() => toggleAccordion(item.name)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    color: childActive ? 'var(--pure-white)' : 'var(--sony-gray-400)',
                    background: childActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontWeight: childActive ? '600' : '500',
                    transition: 'all 0.2s ease'
                  }}
                  className="nav-accordion-header"
                >
                  <span>{item.name}</span>
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>

                {/* Sub items */}
                {isExpanded && (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    paddingLeft: '32px', 
                    marginTop: '4px',
                    gap: '2px'
                  }}>
                    {item.children.map(child => {
                      const active = isCurrentRoute(child.href);
                      return (
                        <Link
                          key={child.name}
                          to={child.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            color: active ? 'var(--pure-white)' : 'var(--sony-gray-500)',
                            background: active ? 'rgba(229, 9, 20, 0.15)' : 'transparent',
                            borderLeft: active ? '2px solid var(--sony-red)' : '2px solid transparent',
                            textDecoration: 'none',
                            fontSize: '13px',
                            fontWeight: active ? '600' : '400',
                            transition: 'all 0.2s ease'
                          }}
                          className="nav-sub-item"
                        >
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
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
            justifyContent: 'space-between',
            gap: '12px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                {user ? user.name.substring(0,2).toUpperCase() : 'PM'}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--sony-white)' }}>
                  {user ? user.name : 'PMO Manager'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--sony-gray-400)' }}>
                  {user ? user.role : 'Sony Music LA'}
                </div>
              </div>
            </div>
            <button 
              onClick={logout}
              style={{ background: 'none', border: 'none', color: 'var(--sony-gray-400)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
              title="Sair"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content">
                {/* Global Controls */}
        <div style={{ position: 'fixed', top: '24px', right: '32px', zIndex: 1000, display: 'flex', alignItems: 'flex-start' }}>
          <PresentationMode />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '16px', alignItems: 'flex-end' }}>
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotif(!showNotif)}
                style={{ 
                  background: 'rgba(20, 20, 20, 0.8)', 
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  width: '40px', height: '40px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--pure-white)', cursor: 'pointer', position: 'relative'
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
                    {t("Notificações & Alertas", "Notifications & Alerts", "Notificaciones y Alertas")}
                  </div>
                  <div style={{ display: 'grid' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--sony-gray-600)' }}>{t("Nenhum alerta.", "No alerts.", "No hay alertas.")}</div>
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

            {/* Language Selector */}
            <select 
              value={language}
              onChange={handleLanguageChange}
              style={{
                background: 'rgba(20, 20, 20, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'var(--pure-white)',
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: '12px',
                cursor: 'pointer',
                outline: 'none',
                fontWeight: '600'
              }}
            >
              <option value="PT">PT</option>
              <option value="EN">EN</option>
              <option value="ES">ES</option>
            </select>
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
            <div className="sony-icon"><img src="https://customer-assets-jai6qajn.emergentagent.net/job_84a5e55c-26a8-4190-b713-50bfc83fd45d/artifacts/ql8q4vna_Sony_Music_Logo.png" alt="Sony Music" /></div>
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