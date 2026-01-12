# CourseSpider

CourseSpider is a tool designed to scrape, aggregate, and analyze university course data from institutions like CMU, MIT, Stanford, and UCB.

## Project Structure

- **backend/**: Python-based backend using FastAPI, BeautifulSoup4, and SQLAlchemy for scraping and serving data.
- **frontend/**: React-based frontend using Vite and TypeScript for visualizing course information.
- **data/**: Contains scraped course data (JSON).

## Getting Started

### Backend

Navigate to the `backend` directory and install dependencies:

```bash
cd backend
uv sync # or pip install -r requirements.txt if applicable
fastapi dev main.py
```

### Frontend

Navigate to the `frontend` directory and start the development server:

```bash
cd frontend
npm install
npm run dev
```
