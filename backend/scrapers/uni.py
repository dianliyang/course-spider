import json
import requests
import urllib3
from typing import List, Dict, Any

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class Uni:
    def __init__(self, name: str):
        self.name = name

    def links(self) -> List[str]:
        """
        Returns a list of URLs to fetch.
        """
        raise NotImplementedError

    def parser(self, html: str) -> List[Dict]:
        """
        Parses HTML and returns a list of courses.
        """
        raise NotImplementedError

    def fetch_page(self, url: str) -> str:
        """
        Fetches a single URL. Default is GET.
        Subclasses can override this to handle cookies, POST, etc.
        """
        print(f"[{self.name}] Fetching {url}...")
        try:
            resp = requests.get(url, verify=False, timeout=30)
            resp.raise_for_status()
            return resp.text
        except Exception as e:
            print(f"[{self.name}] Error fetching {url}: {e}")
            return ""

    def retrieve(self) -> List[Dict[str, Any]]:
        """
        Orchestrates the retrieval process:
        1. Get links
        2. Fetch pages
        3. Parse content
        4. Aggregate results
        """
        links = self.links()
        all_courses = []
        print(f"[{self.name}] Processing {len(links)} links...")
        
        for link in links:
            html = self.fetch_page(link)
            if html:
                courses = self.parser(html)
                all_courses.extend(courses)
        
        return all_courses

    def save(self):
        """
        Retrieves data and saves it to the SQLite database.
        """
        from database import SessionLocal, Course
        
        print(f"[{self.name}] Starting retrieval...")
        data = self.retrieve()
        
        db = SessionLocal()
        try:
            # Clear existing data for this university
            db.query(Course).filter(Course.university == self.name).delete()
            
            courses_to_add = []
            for item in data:
                # Map fields based on the scraper output structure
                course_code = item.get('id') or item.get('code')
                title = item.get('title')
                units = item.get('units')
                description = item.get('description')
                
                # Store the rest of the data in details
                # Create a copy to avoid modifying the original item while popping known fields
                details = item.copy()
                details.pop('id', None)
                details.pop('code', None)
                details.pop('title', None)
                details.pop('units', None)
                details.pop('description', None)
                
                course = Course(
                    university=self.name,
                    course_code=course_code,
                    title=title,
                    units=units,
                    description=description,
                    details=details
                )
                courses_to_add.append(course)
            
            db.add_all(courses_to_add)
            db.commit()
            print(f"[{self.name}] Successfully saved {len(courses_to_add)} courses to database.")
            
        except Exception as e:
            print(f"[{self.name}] Error saving to database: {e}")
            db.rollback()
        finally:
            db.close()
