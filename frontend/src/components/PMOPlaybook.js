import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Download, 
  BookOpen,
  CheckCircle,
  Users,
  Target,
  Workflow,
  Settings,
  ArrowRight,
  Code,
  Play
} from "lucide-react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PMOPlaybook = () => {
  const [playbookData, setPlaybookData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlaybookData();
  }, []);

  const fetchPlaybookData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/pmo-playbook`);
      setPlaybookData(response.data);
    } catch (error) {
      console.error('Error fetching PMO playbook:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPlaybook = () => {
    const playbookContent = generatePlaybookPDF();
    const blob = new Blob([playbookContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Sony_Music_PMO_Playbook_${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePlaybookPDF = () => {
    return `
SONY MUSIC LATIN IBÉRIA PMO PLAYBOOK
====================================

Generated: ${new Date().toLocaleDateString()}

FRAMEWORKS:
-----------
${playbookData?.frameworks.map(fw => `
${fw.name}
${fw.description}

Phases: ${fw.phases?.join(' → ') || 'N/A'}
Ceremonies: ${fw.ceremonies?.join(', ') || 'N/A'}
`).join('\n') || 'No frameworks available'}

GOVERNANCE PRINCIPLES:
---------------------
${playbookData?.governance.principles?.map(p => `• ${p}`).join('\n') || 'No principles available'}

GOVERNANCE PROCESSES:
--------------------
${playbookData?.governance.processes?.map(p => `• ${p}`).join('\n') || 'No processes available'}

TEMPLATES:
----------
${playbookData?.templates?.map(t => `• ${t.name} (${t.type})`).join('\n') || 'No templates available'}

© Sony Music Entertainment
    `;
  };

  const handleDownloadTemplate = (template) => {
    const templateContent = generateTemplateContent(template);
    const blob = new Blob([templateContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${template.name.replace(/\s+/g, '_')}_Template.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateTemplateContent = (template) => {
    const templates = {
      'Project Charter': `
PROJECT CHARTER TEMPLATE
========================

Project Name: ___________________
Project Manager: ___________________
Sponsor: ___________________

PROJECT OVERVIEW:
_________________________________

OBJECTIVES:
• 
• 
• 

SUCCESS CRITERIA:
• 
• 

STAKEHOLDERS:
• 
• 

RISKS:
• 
• 

TIMELINE:
Start Date: ___________
End Date: ___________

BUDGET:
$___________

© Sony Music Entertainment`,

      'Risk Assessment Matrix': `
RISK ASSESSMENT MATRIX
======================

Project: ___________________
Date: ___________________

Risk ID | Risk Description | Probability | Impact | Risk Score | Mitigation Strategy | Owner
--------|------------------|-------------|--------|------------|-------------------|-------
R001    |                  | H/M/L      | H/M/L  |           |                   |
R002    |                  | H/M/L      | H/M/L  |           |                   |

Risk Scoring:
High = 3, Medium = 2, Low = 1
Risk Score = Probability × Impact

© Sony Music Entertainment`,

      'Stakeholder Analysis': `
STAKEHOLDER ANALYSIS TEMPLATE
=============================

Project: ___________________
Date: ___________________

Stakeholder | Role | Influence | Interest | Engagement Strategy
------------|------|-----------|----------|-------------------
           |      | H/M/L     | H/M/L    |
           |      | H/M/L     | H/M/L    |

© Sony Music Entertainment`,

      'Release Checklist': `
RELEASE CHECKLIST
=================

Project: ___________________
Release Date: ___________________

PRE-RELEASE:
□ Legal clearance obtained
□ Quality assurance complete
□ Platform approvals received
□ Marketing materials ready
□ Distribution setup complete

RELEASE DAY:
□ Go-live executed
□ Monitoring active
□ Support team ready
□ Communication sent

POST-RELEASE:
□ Performance metrics reviewed
□ Issues documented
□ Lessons learned captured
□ Success celebration

© Sony Music Entertainment`
    };

    return templates[template.name] || `Template: ${template.name}\nType: ${template.type}\n\nTemplate content would be here.`;
  };

  if (loading) {
    return (
      <div data-testid="pmo-playbook-loading">
        <div className="dashboard-header">
          <div className="skeleton" style={{ height: '28px', width: '200px', marginBottom: '8px' }}></div>
          <div className="skeleton" style={{ height: '16px', width: '400px' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="pmo-playbook-container">
      {/* Header */}
      <div className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="dashboard-title">PMO Playbook</h1>
            <p className="dashboard-subtitle">
              Standard delivery framework integrating Agile methodologies and Sony Music governance principles
            </p>
          </div>
          <Button 
            style={{ 
              background: 'var(--sony-red)',
              color: 'white',
              border: 'none'
            }}
            onClick={handleDownloadPlaybook}
            data-testid="download-playbook-btn"
          >
            <Download size={16} style={{ marginRight: '8px' }} />
            Download Playbook
          </Button>
        </div>
      </div>

      {playbookData && (
        <div style={{ padding: '0 32px' }}>
          <Tabs defaultValue="frameworks" style={{ width: '100%' }}>
            <TabsList style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              width: '100%',
              background: 'var(--sony-white)',
              border: '1px solid var(--sony-gray-200)',
              borderRadius: '12px',
              padding: '4px',
              marginBottom: '32px'
            }}>
              <TabsTrigger value="frameworks" data-testid="frameworks-tab">
                <Workflow size={16} style={{ marginRight: '8px' }} />
                Frameworks
              </TabsTrigger>
              <TabsTrigger value="governance" data-testid="governance-tab">
                <Settings size={16} style={{ marginRight: '8px' }} />
                Governance
              </TabsTrigger>
              <TabsTrigger value="templates" data-testid="templates-tab">
                <FileText size={16} style={{ marginRight: '8px' }} />
                Templates
              </TabsTrigger>
              <TabsTrigger value="dev-manual" data-testid="dev-manual-tab">
                <Code size={16} style={{ marginRight: '8px' }} />
                Manual do DEV
              </TabsTrigger>
            </TabsList>

            {/* Frameworks Tab */}
            <TabsContent value="frameworks">
              <div style={{ display: 'grid', gap: '24px' }}>
                {playbookData.frameworks.map((framework, index) => (
                  <div 
                    key={index}
                    style={{
                      background: 'var(--sony-white)',
                      borderRadius: '16px',
                      padding: '32px',
                      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                      border: '1px solid var(--sony-gray-200)'
                    }}
                    data-testid={`framework-${index}`}
                  >
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ 
                        fontSize: '24px', 
                        fontWeight: '700', 
                        color: 'var(--sony-gray-900)',
                        marginBottom: '8px'
                      }}>
                        {framework.name}
                      </h3>
                      <p style={{ 
                        fontSize: '16px', 
                        color: 'var(--sony-gray-600)',
                        lineHeight: '1.6'
                      }}>
                        {framework.description}
                      </p>
                    </div>

                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '24px'
                    }}>
                      {/* Phases */}
                      <div>
                        <h4 style={{ 
                          fontSize: '16px', 
                          fontWeight: '600',
                          color: 'var(--sony-gray-900)',
                          marginBottom: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <Play size={16} color="var(--sony-red)" />
                          Phases
                        </h4>
                        <div style={{ display: 'grid', gap: '8px' }}>
                          {framework.phases.map((phase, phaseIndex) => (
                            <div 
                              key={phaseIndex}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                background: 'var(--sony-gray-50)',
                                borderRadius: '8px'
                              }}
                            >
                              <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: 'var(--sony-red)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}>
                                {phaseIndex + 1}
                              </div>
                              <span style={{ fontSize: '14px', fontWeight: '500' }}>{phase}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Ceremonies */}
                      {framework.ceremonies && (
                        <div>
                          <h4 style={{ 
                            fontSize: '16px', 
                            fontWeight: '600',
                            color: 'var(--sony-gray-900)',
                            marginBottom: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <Users size={16} color="var(--sony-red)" />
                            Ceremonies
                          </h4>
                          <div style={{ display: 'grid', gap: '8px' }}>
                            {framework.ceremonies.map((ceremony, ceremonyIndex) => (
                              <div 
                                key={ceremonyIndex}
                                style={{
                                  padding: '8px 12px',
                                  background: 'var(--sony-gray-50)',
                                  borderRadius: '8px',
                                  fontSize: '14px'
                                }}
                              >
                                {ceremony}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Artifacts or Gates */}
                      {framework.artifacts && (
                        <div>
                          <h4 style={{ 
                            fontSize: '16px', 
                            fontWeight: '600',
                            color: 'var(--sony-gray-900)',
                            marginBottom: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <FileText size={16} color="var(--sony-red)" />
                            Artifacts
                          </h4>
                          <div style={{ display: 'grid', gap: '8px' }}>
                            {framework.artifacts.map((artifact, artifactIndex) => (
                              <div 
                                key={artifactIndex}
                                style={{
                                  padding: '8px 12px',
                                  background: 'var(--sony-gray-50)',
                                  borderRadius: '8px',
                                  fontSize: '14px'
                                }}
                              >
                                {artifact}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {framework.gates && (
                        <div>
                          <h4 style={{ 
                            fontSize: '16px', 
                            fontWeight: '600',
                            color: 'var(--sony-gray-900)',
                            marginBottom: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <CheckCircle size={16} color="var(--sony-red)" />
                            Quality Gates
                          </h4>
                          <div style={{ display: 'grid', gap: '8px' }}>
                            {framework.gates.map((gate, gateIndex) => (
                              <div 
                                key={gateIndex}
                                style={{
                                  padding: '8px 12px',
                                  background: 'var(--sony-gray-50)',
                                  borderRadius: '8px',
                                  fontSize: '14px'
                                }}
                              >
                                {gate}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Governance Tab */}
            <TabsContent value="governance">
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px'
              }}>
                {/* Principles */}
                <div style={{
                  background: 'var(--sony-white)',
                  borderRadius: '16px',
                  padding: '32px',
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                  border: '1px solid var(--sony-gray-200)'
                }}>
                  <h3 style={{ 
                    fontSize: '20px', 
                    fontWeight: '700',
                    color: 'var(--sony-gray-900)',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Target size={20} color="var(--sony-red)" />
                    Governance Principles
                  </h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {playbookData.governance.principles.map((principle, index) => (
                      <div 
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          background: 'var(--sony-gray-50)',
                          borderRadius: '12px'
                        }}
                      >
                        <CheckCircle size={20} color="var(--sony-red)" />
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>{principle}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Processes */}
                <div style={{
                  background: 'var(--sony-white)',
                  borderRadius: '16px',
                  padding: '32px',
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                  border: '1px solid var(--sony-gray-200)'
                }}>
                  <h3 style={{ 
                    fontSize: '20px', 
                    fontWeight: '700',
                    color: 'var(--sony-gray-900)',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Settings size={20} color="var(--sony-red)" />
                    Governance Processes
                  </h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {playbookData.governance.processes.map((process, index) => (
                      <div 
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          background: 'var(--sony-gray-50)',
                          borderRadius: '12px'
                        }}
                      >
                        <ArrowRight size={20} color="var(--sony-red)" />
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>{process}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates">
              <div style={{
                background: 'var(--sony-white)',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                border: '1px solid var(--sony-gray-200)'
              }}>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: '700',
                  color: 'var(--sony-gray-900)',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FileText size={20} color="var(--sony-red)" />
                  Project Templates & Tools
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '16px'
                }}>
                  {playbookData.templates.map((template, index) => (
                    <div 
                      key={index}
                      style={{
                        padding: '20px',
                        background: 'var(--sony-gray-50)',
                        borderRadius: '12px',
                        border: '1px solid var(--sony-gray-200)',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                      className="template-card"
                      onClick={() => handleDownloadTemplate(template)}
                      data-testid={`template-${index}`}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px'
                      }}>
                        <h4 style={{ 
                          fontSize: '16px', 
                          fontWeight: '600',
                          color: 'var(--sony-gray-900)'
                        }}>
                          {template.name}
                        </h4>
                        <span style={{
                          fontSize: '12px',
                          padding: '4px 8px',
                          background: 'var(--sony-red)',
                          color: 'white',
                          borderRadius: '12px',
                          textTransform: 'uppercase'
                        }}>
                          {template.type}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ 
                          fontSize: '14px', 
                          color: 'var(--sony-gray-600)'
                        }}>
                          Click to download
                        </span>
                        <Download size={16} color="var(--sony-gray-600)" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Dev Manual Tab */}
            <TabsContent value="dev-manual">
              <div style={{
                background: 'var(--sony-white)',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                border: '1px solid var(--sony-gray-200)'
              }}>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: '700',
                  color: 'var(--sony-gray-900)',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Code size={20} color="var(--sony-red)" />
                  Manual do DEV (Developer Guide)
                </h3>
                
                <div style={{ display: 'grid', gap: '24px' }}>
                  
                  <div style={{ background: 'var(--sony-gray-50)', padding: '24px', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: 'var(--sony-gray-900)' }}>1. Arquitetura do Projeto</h4>
                    <p style={{ fontSize: '14px', color: 'var(--sony-gray-600)', lineHeight: '1.6', marginBottom: '12px' }}>
                      O painel do PMO é uma aplicação Full-Stack composta por:
                    </p>
                    <ul style={{ fontSize: '14px', color: 'var(--sony-gray-700)', paddingLeft: '20px', lineHeight: '1.8' }}>
                      <li><strong>Frontend:</strong> React 18, React Router, Tailwind CSS, Componentes shadcn/ui.</li>
                      <li><strong>Backend:</strong> FastAPI (Python 3), Motor (MongoDB Async Driver).</li>
                      <li><strong>Banco de Dados:</strong> MongoDB (Coleções: projects, risks, users).</li>
                    </ul>
                  </div>

                  <div style={{ background: 'var(--sony-gray-50)', padding: '24px', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: 'var(--sony-gray-900)' }}>2. Padrões de Código</h4>
                    <ul style={{ fontSize: '14px', color: 'var(--sony-gray-700)', paddingLeft: '20px', lineHeight: '1.8' }}>
                      <li>Utilize <strong>Hooks customizados</strong> (ou manipulação de estado local via <code>useState/useEffect</code>) para chamadas na API.</li>
                      <li>Para componentes visuais, reaproveite a pasta <code>/src/components/ui/</code>.</li>
                      <li>As rotas de backend do FastAPI obrigatoriamente possuem o prefixo <code>/api</code>. Ex: <code>/api/projects</code>.</li>
                      <li>No MongoDB, sempre exclua o campo <code>_id</code> antes de retornar o modelo e trabalhe com IDs customizados mapeados no Pydantic.</li>
                    </ul>
                  </div>

                  <div style={{ background: 'var(--sony-gray-50)', padding: '24px', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: 'var(--sony-gray-900)' }}>3. Integrações e Variáveis de Ambiente</h4>
                    <p style={{ fontSize: '14px', color: 'var(--sony-gray-600)', lineHeight: '1.6' }}>
                      As variáveis necessárias para rodar o projeto estão definidas no arquivo <code>.env</code>.
                      No Frontend, para apontar corretamente para a API, deve ser usada a variável: <code>REACT_APP_BACKEND_URL</code>.
                      <br /><br />
                      Para simulações de AD/LDAP, foi implementada uma coleção <code>users</code> onde a aba "User Administration" atualiza os recursos para alocação.
                    </p>
                  </div>

                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      <style jsx>{`
        .template-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
      `}</style>
    </div>
  );
};

export default PMOPlaybook;