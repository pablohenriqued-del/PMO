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

# Models
class Project(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    status: ProjectStatus
    priority: ProjectPriority
    type: ProjectType
    manager: str
    budget_allocated: float
    budget_spent: float
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
    budget_allocated: float
    budget_spent: float = 0.0
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
                "id": str(uuid.uuid4()),
                "name": "Airplane - Release Management Platform",
                "description": "Comprehensive platform for managing music releases and distribution across all channels",
                "status": "in_progress",
                "priority": "critical", 
                "type": "platform",
                "manager": "Pablo Duarte",
                "budget_allocated": 850000.0,
                "budget_spent": 420000.0,
                "start_date": "2024-01-15",
                "end_date": "2024-12-30",
                "progress": 65,
                "milestones": [
                    {"name": "Platform Architecture", "date": "2024-03-01", "completed": True},
                    {"name": "Core Features Development", "date": "2024-06-15", "completed": True},
                    {"name": "Beta Testing", "date": "2024-09-30", "completed": False},
                    {"name": "Production Launch", "date": "2024-12-30", "completed": False}
                ],
                "team_members": ["Dev Team A", "QA Team", "Product Owner"],
                "streaming_platforms": ["Spotify", "Apple Music", "Amazon Music", "YouTube Music"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "SMERA - Legal Participation Management",
                "description": "Legal project system for managing special participations and royalty distributions",
                "status": "in_progress",
                "priority": "critical",
                "type": "legal",
                "manager": "Diana Peluha",
                "budget_allocated": 650000.0,
                "budget_spent": 275000.0,
                "start_date": "2024-02-01",
                "end_date": "2024-11-15",
                "progress": 55,
                "milestones": [
                    {"name": "Legal Framework Setup", "date": "2024-04-01", "completed": True},
                    {"name": "Database Design", "date": "2024-06-01", "completed": True},
                    {"name": "Integration Testing", "date": "2024-09-01", "completed": False},
                    {"name": "Legal Compliance Review", "date": "2024-11-15", "completed": False}
                ],
                "team_members": ["Legal Team", "Backend Dev", "Database Admin"],
                "streaming_platforms": [],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "SQL AI Agent - Data Intelligence Platform",
                "description": "AI-powered agent for automated SQL query generation and data analysis",
                "status": "planning", 
                "priority": "critical",
                "type": "platform",
                "manager": "Andre Luiz",
                "budget_allocated": 450000.0,
                "budget_spent": 95000.0,
                "start_date": "2024-03-01",
                "end_date": "2024-10-30",
                "progress": 25,
                "milestones": [
                    {"name": "AI Model Research", "date": "2024-04-15", "completed": True},
                    {"name": "Prototype Development", "date": "2024-07-01", "completed": False},
                    {"name": "Integration & Testing", "date": "2024-09-15", "completed": False},
                    {"name": "Production Deployment", "date": "2024-10-30", "completed": False}
                ],
                "team_members": ["AI Team", "Data Scientists", "Backend Dev"],
                "streaming_platforms": [],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Bad Bunny - Nadie Sabe Lo Que Va a Pasar Mañana Campaign",
                "description": "Digital campaign and streaming optimization for Bad Bunny's latest album release",
                "status": "completed",
                "priority": "high",
                "type": "digital",
                "manager": "Nicolas Calderon",
                "budget_allocated": 1200000.0,
                "budget_spent": 1150000.0,
                "start_date": "2023-10-01",
                "end_date": "2024-01-31",
                "progress": 100,
                "milestones": [
                    {"name": "Campaign Strategy", "date": "2023-11-01", "completed": True},
                    {"name": "Content Creation", "date": "2023-12-15", "completed": True},
                    {"name": "Platform Rollout", "date": "2024-01-15", "completed": True},
                    {"name": "Performance Analysis", "date": "2024-01-31", "completed": True}
                ],
                "team_members": ["Marketing Team", "Content Creators", "Analytics Team"],
                "streaming_platforms": ["Spotify", "Apple Music", "YouTube", "Amazon Music"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Rosalía - MOTOMAMI+ Streaming Expansion",
                "description": "Streaming platform expansion and digital content optimization for Rosalía",
                "status": "in_progress",
                "priority": "high",
                "type": "streaming",
                "manager": "Pablo Duarte",
                "budget_allocated": 750000.0,
                "budget_spent": 425000.0,
                "start_date": "2024-01-01",
                "end_date": "2024-08-31",
                "progress": 70,
                "milestones": [
                    {"name": "Platform Analysis", "date": "2024-02-15", "completed": True},
                    {"name": "Content Optimization", "date": "2024-05-01", "completed": True},
                    {"name": "Regional Expansion", "date": "2024-07-15", "completed": False},
                    {"name": "Performance Metrics", "date": "2024-08-31", "completed": False}
                ],
                "team_members": ["Digital Team", "Regional Managers", "Data Analysts"],
                "streaming_platforms": ["Spotify", "Apple Music", "Deezer", "Tidal"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        
        await db.projects.insert_many(mock_projects)
        logger.info("Mock data initialized successfully")

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

@api_router.post("/reset-data")
async def reset_data():
    """Reset and reinitialize mock data"""
    await db.projects.delete_many({})
    await initialize_mock_data()
    return {"message": "Data reset successfully"}

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