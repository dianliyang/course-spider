from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Any
from sqlalchemy.orm import Session
from database import get_db, Course as DBCourse

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
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

@app.get("/")
def read_root():
    return {"message": "Welcome to Course Analyse API"}

@app.get("/courses", response_model=List[Course])
def get_courses(db: Session = Depends(get_db)):
    courses = db.query(DBCourse).all()
    return courses

@app.get("/health")
def health_check():
    return {"status": "ok"}
