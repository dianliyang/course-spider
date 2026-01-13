import os
from fastapi import FastAPI, Depends, Response, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Any
from sqlalchemy.orm import Session
from database import get_db, Course as DBCourse

app = FastAPI(root_path="/api" if os.environ.get("VERCEL") else "")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Course(BaseModel):
    id: int
    university: str
    course_code: Optional[str] = None
    title: Optional[str] = None
    units: Optional[str] = None
    description: Optional[str] = None
    details: Optional[Any] = None

    class Config:
        from_attributes = True

class PaginatedCourses(BaseModel):
    items: List[Course]
    total: int
    page: int
    size: int
    pages: int

@app.get("/")
def read_root():
    return {"message": "Welcome to Course Analyse API"}

@app.get("/courses", response_model=PaginatedCourses)
def get_courses(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    total = db.query(DBCourse).count()
    pages = (total + size - 1) // size
    offset = (page - 1) * size
    courses = db.query(DBCourse).offset(offset).limit(size).all()
    
    return {
        "items": courses,
        "total": total,
        "page": page,
        "size": size,
        "pages": pages
    }

@app.get("/universities", response_model=List[str])
def get_universities(response: Response, db: Session = Depends(get_db)):
    response.headers["Cache-Control"] = "public, max-age=3600"
    universities = db.query(DBCourse.university).distinct().all()
    return [u[0] for u in universities if u[0]]

@app.get("/health")
def health_check():
    return {"status": "ok"}
