from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, date, timezone
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Sony Music PMO Dashboard API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class ProjectStatus(str, Enum):
    PLANNING = "planning"
    IN_PROGRESS = "in_progress" 
    ON_HOLD = "on_hold"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class ProjectType(str, Enum):
    DIGITAL = "digital"
    STREAMING = "streaming"
    PLATFORM = "platform"
    LEGAL = "legal"
    RELEASE = "release"

class ProjectPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class RiskCreate(BaseModel):
    project: str
    risk: str
    probability: str
    impact: str
    severity: str
    mitigation: str
    owner: str
    status: str
    category: str

class Risk(RiskCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# Models
class Project(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    status: ProjectStatus
    priority: ProjectPriority
    type: ProjectType
    manager: str
    country: str = "Global"
    budget_allocated: float
    budget_spent: float
    revenue_expected: float = 0.0
    revenue_generated: float = 0.0
    start_date: str
    end_date: str
    progress: int = Field(ge=0, le=100)
    milestones: List[Dict[str, Any]] = []
    team_members: List[str] = []
    streaming_platforms: List[str] = []
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    status: ProjectStatus
    priority: ProjectPriority
    type: ProjectType
    manager: str
    country: str = "Global"
    budget_allocated: float
    budget_spent: float = 0.0
    revenue_expected: float = 0.0
    revenue_generated: float = 0.0
    start_date: str
    end_date: str
    progress: int = Field(ge=0, le=100, default=0)
    milestones: List[Dict[str, Any]] = []
    team_members: List[str] = []
    streaming_platforms: List[str] = []

class DashboardStats(BaseModel):
    total_projects: int
    active_projects: int
    completed_projects: int
    total_budget: float
    budget_spent: float
    team_utilization: float
    on_track_projects: int
    delayed_projects: int

# Helper function for datetime serialization
def prepare_for_mongo(data):
    """Prepare data for MongoDB storage"""
    return data

def parse_from_mongo(item):
    """Parse data from MongoDB"""
    if "_id" in item:
        del item["_id"]
    return item

# Initialize mock data
async def initialize_mock_data():
    """Initialize the database with mock project data"""
    existing_projects = await db.projects.count_documents({})
    if existing_projects == 0:
        mock_projects = [
            {
                "id": "p-1",
                "name": "Airplane - Release Management Platform",
                "description": "Comprehensive platform for managing music releases and distribution across all channels",
                "status": "in_progress",
                "priority": "critical", 
                "type": "platform",
                "manager": "Pablo Duarte",
                "country": "Brazil",
                "budget_allocated": 420000.0,
                "budget_spent": 275000.0,
                "revenue_expected": 800000.0,
                "revenue_generated": 100000.0,
                "start_date": "2024-01-15",
                "end_date": "2024-12-30",
                "progress": 65,
                "milestones": [
                    {"name": "Platform Architecture", "date": "2024-03-01", "completed": True, "assigned_to": "u1"},
                    {"name": "Core Features Development", "date": "2024-06-15", "completed": True, "assigned_to": "u2"},
                    {"name": "Beta Testing", "date": "2024-09-30", "completed": False, "assigned_to": "u3"},
                    {"name": "Production Launch", "date": "2024-12-30", "completed": False, "assigned_to": None}
                ],
                "team_members": ["Dev Team A", "QA Team", "Product Owner"],
                "streaming_platforms": [],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "p-2",
                "name": "SMERA - Legal Participation Management",
                "description": "Legal project system for managing special participations and royalty distributions",
                "status": "in_progress",
                "priority": "critical",
                "type": "legal",
                "manager": "Diana Peluha",
                "country": "Mexico",
                "budget_allocated": 320000.0,
                "budget_spent": 185000.0,
                "revenue_expected": 500000.0,
                "revenue_generated": 0.0,
                "start_date": "2024-02-01",
                "end_date": "2024-11-15",
                "progress": 55,
                "milestones": [
                    {"name": "Legal Framework Setup", "date": "2024-04-01", "completed": True, "assigned_to": "u4"},
                    {"name": "Database Design", "date": "2024-06-01", "completed": True, "assigned_to": "u1"},
                    {"name": "Integration Testing", "date": "2024-09-01", "completed": False, "assigned_to": "u2"},
                    {"name": "Legal Compliance Review", "date": "2024-11-15", "completed": False, "assigned_to": "u4"}
                ],
                "team_members": ["Legal Team", "Backend Dev", "Database Admin"],
                "streaming_platforms": [],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "p-3",
                "name": "SQL AI Agent - Data Intelligence Platform",
                "description": "AI-powered agent for automated SQL query generation and data analysis",
                "status": "planning", 
                "priority": "critical",
                "type": "platform",
                "manager": "Andre Luiz",
                "country": "Colombia",
                "budget_allocated": 180000.0,
                "budget_spent": 45000.0,
                "revenue_expected": 600000.0,
                "revenue_generated": 0.0,
                "start_date": "2024-03-01",
                "end_date": "2024-10-30",
                "progress": 25,
                "milestones": [
                    {"name": "AI Model Research", "date": "2024-04-15", "completed": True, "assigned_to": "u5"},
                    {"name": "Prototype Development", "date": "2024-07-01", "completed": False, "assigned_to": "u2"}
                ],
                "team_members": ["AI Team", "Data Scientists"],
                "streaming_platforms": [],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "p-4",
                "name": "Bad Bunny - Nadie Sabe Lo Que Va a Pasar Mañana Campaign",
                "description": "Digital campaign and streaming optimization",
                "status": "completed",
                "priority": "high",
                "type": "digital",
                "manager": "Nicolas Calderon",
                "country": "Argentina",
                "budget_allocated": 850000.0,
                "budget_spent": 825000.0,
                "revenue_expected": 2500000.0,
                "revenue_generated": 3200000.0,
                "start_date": "2023-10-01",
                "end_date": "2024-01-31",
                "progress": 100,
                "milestones": [],
                "team_members": ["Marketing Team"],
                "streaming_platforms": ["Spotify", "Apple Music"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "p-5",
                "name": "Rosalía - MOTOMAMI+ Europe Expansion",
                "description": "Streaming platform expansion and digital content optimization for Rosalía",
                "status": "in_progress",
                "priority": "high",
                "type": "streaming",
                "manager": "Pablo Duarte",
                "country": "Spain",
                "budget_allocated": 450000.0,
                "budget_spent": 310000.0,
                "revenue_expected": 1500000.0,
                "revenue_generated": 950000.0,
                "start_date": "2024-01-01",
                "end_date": "2024-08-31",
                "progress": 75,
                "milestones": [],
                "team_members": ["Digital Team Europe"],
                "streaming_platforms": ["Spotify", "Apple Music", "Deezer", "Tidal"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "p-6",
                "name": "Fado Global Reach Playlist",
                "description": "Curated playlist strategy to expand Portuguese Fado to a global audience.",
                "status": "in_progress",
                "priority": "medium",
                "type": "streaming",
                "manager": "Diana Peluha",
                "country": "Portugal",
                "budget_allocated": 120000.0,
                "budget_spent": 60000.0,
                "revenue_expected": 350000.0,
                "revenue_generated": 120000.0,
                "start_date": "2024-04-01",
                "end_date": "2024-09-30",
                "progress": 40,
                "milestones": [],
                "team_members": ["Content Curation Team"],
                "streaming_platforms": ["Spotify", "Apple Music"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "p-7",
                "name": "US Latin Market Penetration 2024",
                "description": "Cross-platform promotion targeting Latin audiences in the US.",
                "status": "in_progress",
                "priority": "critical",
                "type": "digital",
                "manager": "Nicolas Calderon",
                "country": "USA",
                "budget_allocated": 1500000.0,
                "budget_spent": 900000.0,
                "revenue_expected": 5000000.0,
                "revenue_generated": 2800000.0,
                "start_date": "2024-01-01",
                "end_date": "2024-12-31",
                "progress": 60,
                "milestones": [],
                "team_members": ["US Marketing Team", "PR Agency"],
                "streaming_platforms": ["Spotify", "Apple Music", "YouTube"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "p-8",
                "name": "Drake x Latin Artist Collab Promo",
                "description": "Digital marketing rollout in Canada for new cross-genre collaboration.",
                "status": "planning",
                "priority": "high",
                "type": "release",
                "manager": "Andre Luiz",
                "country": "Canada",
                "budget_allocated": 600000.0,
                "budget_spent": 50000.0,
                "revenue_expected": 2000000.0,
                "revenue_generated": 0.0,
                "start_date": "2024-06-01",
                "end_date": "2024-10-31",
                "progress": 10,
                "milestones": [],
                "team_members": ["Global Partnerships"],
                "streaming_platforms": ["Spotify", "Apple Music"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "p-9",
                "name": "Indie Rock Chile Initiative",
                "description": "Development and promotion of emerging indie rock bands in Chile.",
                "status": "in_progress",
                "priority": "medium",
                "type": "streaming",
                "manager": "Pablo Duarte",
                "country": "Chile",
                "budget_allocated": 150000.0,
                "budget_spent": 120000.0,
                "revenue_expected": 400000.0,
                "revenue_generated": 320000.0,
                "start_date": "2024-01-01",
                "end_date": "2024-07-31",
                "progress": 85,
                "milestones": [],
                "team_members": ["A&R Team"],
                "streaming_platforms": ["Spotify", "YouTube"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        
        await db.projects.insert_many(mock_projects)
        logger.info("Mock projects initialized successfully")

    existing_risks = await db.risks.count_documents({})
    if existing_risks == 0:
        mock_risks = [
            {
                "id": "risk-001",
                "project": "Airplane - Release Management Platform",
                "risk": "Third-party API dependencies",
                "probability": "High",
                "impact": "High", 
                "severity": "Critical",
                "mitigation": "Implement circuit breakers and fallback mechanisms",
                "owner": "Pablo Duarte",
                "status": "Active",
                "category": "Technical",
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "risk-002",
                "project": "SQL AI Agent",
                "risk": "AI model accuracy degradation",
                "probability": "Medium",
                "impact": "High",
                "severity": "High", 
                "mitigation": "Continuous model monitoring and retraining pipeline",
                "owner": "Andre Luiz",
                "status": "Monitoring",
                "category": "Technical",
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "risk-003",
                "project": "SMERA Legal",
                "risk": "Regulatory compliance changes",
                "probability": "Low",
                "impact": "Critical",
                "severity": "High",
                "mitigation": "Quarterly legal framework reviews",
                "owner": "Diana Peluha", 
                "status": "Mitigated",
                "category": "Compliance",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db.risks.insert_many(mock_risks)
        logger.info("Mock risks initialized successfully")

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Sony Music PMO Dashboard API"}

@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    """Get dashboard statistics and KPIs"""
    projects = await db.projects.find().to_list(1000)
    
    total_projects = len(projects)
    active_projects = len([p for p in projects if p["status"] in ["in_progress", "planning"]])
    completed_projects = len([p for p in projects if p["status"] == "completed"])
    total_budget = sum(p["budget_allocated"] for p in projects)
    budget_spent = sum(p["budget_spent"] for p in projects)
    
    # Calculate team utilization (mock calculation)
    team_utilization = min(85.0 + (active_projects * 5), 100.0)
    
    # Calculate project health
    on_track_projects = len([p for p in projects if p["progress"] >= 50 and p["status"] == "in_progress"])
    delayed_projects = len([p for p in projects if p["progress"] < 30 and p["status"] == "in_progress"])
    
    return DashboardStats(
        total_projects=total_projects,
        active_projects=active_projects, 
        completed_projects=completed_projects,
        total_budget=total_budget,
        budget_spent=budget_spent,
        team_utilization=team_utilization,
        on_track_projects=on_track_projects,
        delayed_projects=delayed_projects
    )

@api_router.get("/projects", response_model=List[Project])
async def get_projects(
    status: Optional[ProjectStatus] = None,
    manager: Optional[str] = None,
    type: Optional[ProjectType] = None,
    search: Optional[str] = None
):
    """Get all projects with optional filtering"""
    query = {}
    
    if status:
        query["status"] = status.value
    if manager:
        query["manager"] = manager
    if type:
        query["type"] = type.value
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    projects = await db.projects.find(query).to_list(1000)
    return [Project(**parse_from_mongo(project)) for project in projects]

@api_router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str):
    """Get a specific project by ID"""
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return Project(**parse_from_mongo(project))

@api_router.post("/projects", response_model=Project)
async def create_project(project_data: ProjectCreate):
    """Create a new project"""
    project_dict = project_data.dict()
    project = Project(**project_dict)
    
    await db.projects.insert_one(prepare_for_mongo(project.dict()))
    return project

@api_router.put("/projects/{project_id}", response_model=Project)
async def update_project(project_id: str, project_data: ProjectCreate):
    """Update an existing project"""
    existing_project = await db.projects.find_one({"id": project_id})
    if not existing_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project_dict = project_data.dict()
    project_dict["id"] = project_id
    project_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    project = Project(**project_dict)
    await db.projects.replace_one({"id": project_id}, prepare_for_mongo(project.dict()))
    return project

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    """Delete a project"""
    result = await db.projects.delete_one({"id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return {"message": "Project deleted successfully"}

@api_router.get("/managers")
async def get_managers():
    """Get all project managers"""
    return [
        "Pablo Duarte",
        "Diana Peluha", 
        "Andre Luiz",
        "Nicolas Calderon"
    ]

@api_router.get("/streaming-platforms")
async def get_streaming_platforms():
    """Get streaming platform performance data"""
    return [
        {"name": "Spotify", "streams": 2500000000, "growth": 12.5},
        {"name": "Apple Music", "streams": 1800000000, "growth": 8.3},
        {"name": "YouTube Music", "streams": 1200000000, "growth": 15.2},
        {"name": "Amazon Music", "streams": 900000000, "growth": 10.1},
        {"name": "Deezer", "streams": 450000000, "growth": 6.8},
        {"name": "Tidal", "streams": 200000000, "growth": 4.2}
    ]

# LDAP Mock endpoint
@api_router.get("/ldap/users")
async def get_ldap_users():
    """Mock endpoint to simulate Active Directory / LDAP resources"""
    return [
        {"id": "u1", "name": "João Silva", "email": "joao.silva@sonymusic.com", "department": "Engineering", "role": "Senior Developer"},
        {"id": "u2", "name": "Maria Garcia", "email": "maria.garcia@sonymusic.com", "department": "Engineering", "role": "Frontend Developer"},
        {"id": "u3", "name": "Carlos Santos", "email": "carlos.santos@sonymusic.com", "department": "QA", "role": "QA Engineer"},
        {"id": "u4", "name": "Ana Rodriguez", "email": "ana.rodriguez@sonymusic.com", "department": "Legal", "role": "Legal Consultant"},
        {"id": "u5", "name": "Luis Gomez", "email": "luis.gomez@sonymusic.com", "department": "Data Science", "role": "Data Analyst"},
        {"id": "u6", "name": "Camila Alves", "email": "camila.alves@sonymusic.com", "department": "Marketing", "role": "Marketing Manager"},
        {"id": "u7", "name": "Pedro Lima", "email": "pedro.lima@sonymusic.com", "department": "Product", "role": "Product Owner"},
        {"id": "u8", "name": "Sofia Costa", "email": "sofia.costa@sonymusic.com", "department": "Operations", "role": "Regional Manager"}
    ]

# Analytics endpoints
@api_router.get("/analytics/countries")
async def get_country_analytics():
    """Get project analytics grouped by country"""
    projects = await db.projects.find().to_list(1000)
    
    country_data = {}
    
    for p in projects:
        country = p.get("country", "Global")
        if country not in country_data:
            country_data[country] = {
                "country": country,
                "project_count": 0,
                "budget_allocated": 0.0,
                "budget_spent": 0.0,
                "revenue_expected": 0.0,
                "revenue_generated": 0.0,
                "profitability": 0.0,
                "roi": 0.0,
                "financial_efficiency": 0.0
            }
            
        c = country_data[country]
        c["project_count"] += 1
        c["budget_allocated"] += p.get("budget_allocated", 0.0)
        c["budget_spent"] += p.get("budget_spent", 0.0)
        c["revenue_expected"] += p.get("revenue_expected", 0.0)
        c["revenue_generated"] += p.get("revenue_generated", 0.0)
        
    for c in country_data.values():
        profit = c["revenue_generated"] - c["budget_spent"]
        c["profitability"] = profit
        if c["budget_spent"] > 0:
            c["roi"] = (profit / c["budget_spent"]) * 100
            c["financial_efficiency"] = c["revenue_generated"] / c["budget_spent"]
        else:
            c["roi"] = 0.0
            c["financial_efficiency"] = 0.0
            
    return list(country_data.values())

@api_router.post("/reset-data")
async def reset_data():
    """Reset and reinitialize mock data"""
    await db.projects.delete_many({})
    await db.risks.delete_many({})
    await initialize_mock_data()
    return {"message": "Data reset successfully"}

# Lessons Learned endpoints
@api_router.get("/lessons-learned")
async def get_lessons_learned():
    """Get lessons learned from projects"""
    return [
        {
            "id": "ll-001",
            "project": "Bad Bunny - Nadie Sabe Campaign",
            "category": "Marketing",
            "lesson": "Early influencer engagement increases streaming by 35%",
            "impact": "High",
            "description": "Partnering with micro-influencers 2 weeks before release significantly boosted initial streaming numbers",
            "date": "2024-02-15",
            "tags": ["influencer-marketing", "streaming", "pre-release"],
            "author": "Nicolas Calderon"
        },
        {
            "id": "ll-002", 
            "project": "Airplane - Release Management",
            "category": "Technical",
            "lesson": "API rate limiting essential for high-volume releases",
            "impact": "Critical",
            "description": "Without proper rate limiting, platform APIs failed during peak traffic. Implement exponential backoff.",
            "date": "2024-06-20",
            "tags": ["api", "scaling", "infrastructure"],
            "author": "Pablo Duarte"
        },
        {
            "id": "ll-003",
            "project": "SMERA - Legal Participation",
            "category": "Process",
            "lesson": "Legal review cycles must be parallel, not sequential",
            "impact": "Medium",
            "description": "Sequential legal reviews added 3 weeks to project timeline. Parallel reviews with clear ownership reduced this to 1 week.",
            "date": "2024-08-10",
            "tags": ["legal-process", "timeline", "efficiency"],
            "author": "Diana Peluha"
        }
    ]

# Risk Radar endpoints
@api_router.get("/risk-radar", response_model=List[Risk])
async def get_risk_radar():
    """Get risk assessment data"""
    risks = await db.risks.find().to_list(1000)
    return [Risk(**parse_from_mongo(risk)) for risk in risks]

@api_router.post("/risk-radar", response_model=Risk)
async def create_risk(risk_data: RiskCreate):
    """Create a new risk"""
    risk_dict = risk_data.dict()
    risk = Risk(**risk_dict)
    
    await db.risks.insert_one(prepare_for_mongo(risk.dict()))
    return risk

@api_router.put("/risk-radar/{risk_id}", response_model=Risk)
async def update_risk(risk_id: str, risk_data: RiskCreate):
    """Update an existing risk"""
    existing_risk = await db.risks.find_one({"id": risk_id})
    if not existing_risk:
        raise HTTPException(status_code=404, detail="Risk not found")
    
    risk_dict = risk_data.dict()
    risk_dict["id"] = risk_id
    risk_dict["created_at"] = existing_risk.get("created_at", datetime.now(timezone.utc).isoformat())
    
    risk = Risk(**risk_dict)
    await db.risks.replace_one({"id": risk_id}, prepare_for_mongo(risk.dict()))
    return risk

@api_router.delete("/risk-radar/{risk_id}")
async def delete_risk(risk_id: str):
    """Delete a risk"""
    result = await db.risks.delete_one({"id": risk_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Risk not found")
    
    return {"message": "Risk deleted successfully"}

# PMO Playbook endpoints
@api_router.get("/pmo-playbook")
async def get_pmo_playbook():
    """Get PMO playbook frameworks and processes"""
    return {
        "frameworks": [
            {
                "name": "Sony Music Agile Framework",
                "description": "Hybrid Scrum-Kanban approach tailored for music industry projects",
                "phases": ["Discovery", "Planning", "Execution", "Launch", "Post-Launch"],
                "ceremonies": ["Sprint Planning", "Daily Standups", "Sprint Reviews", "Retrospectives"],
                "artifacts": ["Product Backlog", "Sprint Backlog", "Burndown Charts", "Release Notes"]
            },
            {
                "name": "Digital Release Framework", 
                "description": "Standardized process for digital music releases and campaigns",
                "phases": ["Pre-Production", "Content Creation", "Platform Setup", "Launch", "Analytics"],
                "gates": ["Legal Clearance", "Quality Assurance", "Platform Approval", "Go-Live"],
                "stakeholders": ["Artists", "Labels", "Digital Platforms", "Marketing"]
            }
        ],
        "governance": {
            "principles": [
                "Artist-First Approach",
                "Data-Driven Decisions", 
                "Agile Delivery",
                "Quality Excellence",
                "Stakeholder Collaboration"
            ],
            "processes": [
                "Weekly Steering Committee",
                "Monthly Portfolio Review",
                "Quarterly Strategy Alignment",
                "Continuous Improvement"
            ]
        },
        "templates": [
            {"name": "Project Charter", "type": "document"},
            {"name": "Risk Assessment Matrix", "type": "spreadsheet"},
            {"name": "Stakeholder Analysis", "type": "template"},
            {"name": "Release Checklist", "type": "checklist"}
        ]
    }

# Root Cause Analysis endpoints  
@api_router.get("/root-cause-analysis")
async def get_root_cause_analysis():
    """Get root cause analysis cases"""
    return [
        {
            "id": "rca-001",
            "incident": "Streaming Platform Outage - Bad Bunny Release",
            "date": "2024-01-15",
            "severity": "Critical",
            "impact": "2.5M lost streams in first hour",
            "root_causes": [
                "Insufficient load testing for peak traffic",
                "API rate limits not properly configured", 
                "Lack of auto-scaling mechanisms"
            ],
            "five_whys": [
                "Why did the platform crash? - Traffic exceeded capacity",
                "Why wasn't capacity adequate? - Load testing was incomplete", 
                "Why was load testing incomplete? - Test scenarios didn't include viral growth",
                "Why weren't viral scenarios tested? - No historical data for reference",
                "Why no historical data? - First release of this scale on new platform"
            ],
            "actions": [
                {"action": "Implement comprehensive load testing", "owner": "DevOps Team", "status": "Complete"},
                {"action": "Configure auto-scaling", "owner": "Infrastructure Team", "status": "In Progress"},
                {"action": "Create viral growth test scenarios", "owner": "QA Team", "status": "Planned"}
            ],
            "lessons": "Always test for 10x expected load when dealing with viral content"
        }
    ]

# Innovation Radar endpoints
@api_router.get("/innovation-radar")
async def get_innovation_radar():
    """Get innovation radar data"""
    return {
        "technologies": [
            {
                "name": "AI-Powered Music Mastering",
                "category": "AI/ML",
                "quadrant": "Assess", 
                "description": "Automated audio mastering using machine learning",
                "impact": "High",
                "timeline": "6-12 months",
                "risk": "Medium"
            },
            {
                "name": "Blockchain Rights Management",
                "category": "Blockchain",
                "quadrant": "Trial",
                "description": "Smart contracts for automated royalty distribution",
                "impact": "High", 
                "timeline": "12-18 months",
                "risk": "High"
            },
            {
                "name": "Spatial Audio Streaming",
                "category": "Audio Tech",
                "quadrant": "Adopt",
                "description": "3D audio experiences for streaming platforms",
                "impact": "Medium",
                "timeline": "3-6 months", 
                "risk": "Low"
            },
            {
                "name": "Virtual Reality Concerts",
                "category": "VR/AR",
                "quadrant": "Assess",
                "description": "Immersive concert experiences in virtual environments", 
                "impact": "Medium",
                "timeline": "12-24 months",
                "risk": "High"
            }
        ],
        "quadrants": ["Adopt", "Trial", "Assess", "Hold"],
        "categories": ["AI/ML", "Blockchain", "Audio Tech", "VR/AR", "Analytics"]
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Initialize mock data on startup"""
    await initialize_mock_data()
    logger.info("Sony Music PMO Dashboard API started successfully")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()