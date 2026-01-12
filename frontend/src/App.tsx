import { useEffect, useState } from 'react'
import './App.css'

interface Course {
  id: number;
  title: string;
  platform: string;
  url: string;
}

function App() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:8000/courses')
      .then(res => res.json())
      .then(data => {
        setCourses(data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Error fetching courses:", err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="container">
      <h1>Course Analyser</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="course-list">
          {courses.map(course => (
            <div key={course.id} className="course-card">
              <h3>{course.title}</h3>
              <span className="platform-tag">{course.platform}</span>
              <a href={course.url} target="_blank" rel="noopener noreferrer">View Course</a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App