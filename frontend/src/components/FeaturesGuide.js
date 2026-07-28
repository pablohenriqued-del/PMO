import React from "react";
import { Sparkles, BrainCircuit, Mic, Presentation, Users, Bell, FileSpreadsheet, Activity } from "lucide-react";

const FeaturesGuide = () => {
  const features = [
    {
      icon: <BrainCircuit size={32} color="var(--sony-red)" />,
      title: "PMO AI Copilot & Prevenção de Atrasos",
      description: "O cérebro autônomo da plataforma. Ele monitora a saúde dos projetos diariamente.",
      rules: [
        "Se um projeto estiver com Progresso < 60% e possuir marcos críticos (Milestones) em aberto sem um responsável alocado, a IA aciona um alerta de gargalo.",
        "A IA vasculha automaticamente o Active Directory (Mock LDAP) para encontrar um profissional capacitado disponível.",
        "Ao aprovar, o sistema aloca o usuário e dispara e-mail e webhook no Microsoft Teams."
      ]
    },
    {
      icon: <Activity size={32} color="#10B981" />,
      title: "Trend-Driven Prioritization (Spotify/TikTok)",
      description: "Integração simulada com APIs de streaming para tomada de decisão financeira.",
      rules: [
        "A IA capta músicas ou artistas que estão com crescimento anormal (ex: +850% no TikTok).",
        "Ela cruza o artista com os projetos ativos no PMO.",
        "Sugere automaticamente a realocação de Budget (Orçamento) de projetos parados para o projeto que está em alta, injetando capital para alavancar a trend."
      ]
    },
    {
      icon: <Users size={32} color="#F59E0B" />,
      title: "Capacity Planning & Heatmap",
      description: "Previsão de carga de trabalho e risco de Burnout das equipes.",
      rules: [
        "Calcula a capacidade de cada pessoa baseada nos Milestones que ela possui nos próximos 4 meses.",
        "Gera um Mapa de Calor (Heatmap) com as cores: Verde (0-80%), Amarelo (81-100%) e Vermelho (>100%).",
        "Se a alocação passar de 100%, o sistema acusa Risco de Burnout e sinaliza criticidade ALTA."
      ]
    },
    {
      icon: <Presentation size={32} color="#3B82F6" />,
      title: "Modo TV / Apresentação Executiva",
      description: "Modo Full Screen para exibição rotativa em monitores corporativos.",
      rules: [
        "Acionado no cabeçalho superior (botão 'Modo TV').",
        "Expande o navegador para tela cheia.",
        "A cada 15 segundos, o React Router muda de página automaticamente, passando por: Dashboard, Regional Analytics, Projetos, Status Report e Capacity Planning."
      ]
    },
    {
      icon: <Mic size={32} color="#8B5CF6" />,
      title: "Comando de Voz & Spatial UI",
      description: "Navegação hands-free acessível por voz.",
      rules: [
        "Utiliza a API nativa do navegador (Web Speech API) no idioma pt-BR.",
        "Diga 'Projetos' para abrir a aba de portfólio, ou 'Capacidade' para abrir o Heatmap.",
        "Aumenta a acessibilidade e agiliza a troca de contexto do executivo."
      ]
    },
    {
      icon: <FileSpreadsheet size={32} color="#10B981" />,
      title: "Importação Excel & Microsoft Planner",
      description: "Interoperabilidade total com ferramentas de mercado.",
      rules: [
        "Dentro de um projeto, permite upload de arquivo CSV exportado do Planner ou Monday.com.",
        "Lê colunas dinâmicas (Due Date, Status, Progress) e cria os Milestones (entregas) automaticamente no banco de dados.",
        "Exportação de botões rápidos no menu para baixar todo o portfólio para o Excel."
      ]
    },
    {
      icon: <Bell size={32} color="var(--sony-red)" />,
      title: "Central de Notificações Automáticas",
      description: "Sino de alertas persistente integrado a todas as abas.",
      rules: [
        "Orçamento: Alerta gerado se Budget Gasto > Budget Alocado.",
        "Prazos: Alerta se um Milestone não-concluído estiver com vencimento para os próximos 7 dias.",
        "Riscos: Alerta se houver algum Risco cadastrado com severidade 'Crítica' e status 'Ativo'."
      ]
    }
  ];

  return (
    <div data-testid="features-guide-container">
      <div className="dashboard-header" style={{ marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Sparkles color="var(--sony-red)" size={32} />
            Guia da Plataforma & Regras de Negócio
          </h1>
          <p className="dashboard-subtitle">
            Conheça todas as funcionalidades Premium que tornam este PMO a plataforma mais moderna do mundo.
          </p>
        </div>
        {/* Decorative background glow */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(229,9,20,0.15) 0%, rgba(0,0,0,0) 70%)',
          borderRadius: '50%',
          zIndex: 1
        }}></div>
      </div>

      <div style={{ padding: '0 32px 32px 32px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '24px'
        }}>
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              style={{
                background: 'rgba(20, 20, 20, 0.7)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = 'rgba(229, 9, 20, 0.3)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(229, 9, 20, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
              }}
            >
              {/* Feature Icon Background Glow */}
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                width: '60px',
                height: '60px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 70%)',
                borderRadius: '50%',
                zIndex: 0
              }}></div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
                <div style={{ 
                  background: 'rgba(0,0,0,0.4)', 
                  padding: '12px', 
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--sony-white)', lineHeight: '1.3' }}>
                  {feature.title}
                </h3>
              </div>
              
              <p style={{ fontSize: '14px', color: 'var(--sony-gray-400)', marginBottom: '20px', lineHeight: '1.6', position: 'relative', zIndex: 1 }}>
                {feature.description}
              </p>
              
              <div style={{ 
                background: 'rgba(0, 0, 0, 0.3)', 
                borderRadius: '12px', 
                padding: '16px',
                borderLeft: '3px solid var(--sony-gray-700)',
                position: 'relative',
                zIndex: 1
              }}>
                <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--sony-gray-500)', marginBottom: '12px', fontWeight: '700' }}>
                  Regras de Negócio:
                </h4>
                <ul style={{ display: 'grid', gap: '10px', margin: 0, paddingLeft: '16px' }}>
                  {feature.rules.map((rule, i) => (
                    <li key={i} style={{ fontSize: '13px', color: 'var(--sony-gray-600)', lineHeight: '1.5' }}>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesGuide;
