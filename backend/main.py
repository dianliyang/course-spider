from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

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
    title: str
    platform: str
    url: str

@app.get("/")
def read_root():
    return {"message": "Welcome to Course Analyse API"}

@app.get("/courses", response_model=List[Course])
def get_courses():
    return [
        {"id": 1, "title": "Introduction to Computer Science", "platform": "MIT", "url": "https://ocw.mit.edu"},
        {"id": 2, "title": "Machine Learning", "platform": "Stanford", "url": "https://online.stanford.edu"},
        {"id": 3, "title": "Data Structures", "platform": "UCB", "url": "https://cs61b.org"}
    ]

@app.get("/health")
def health_check():
    return {"status": "ok"}
