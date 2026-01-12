import requests
from scrapers.uni import Uni
from bs4 import BeautifulSoup

class CMU(Uni):
  def __init__(self):
    super().__init__("cmu")

  def fetch_page(self, url: str) -> str:
    print(f"[{self.name}] Fetching data from {url} using POST...")
    # Payload to fetch CS and ECE courses
    payload = {
        "SEMESTER": "S25", # Spring 2025
        "MINI": "NO",
        "GRAD_UNDER": "All",
        "PRG_LOCATION": "All",
        "DEPT": ["CS", "ECE"],
        "BEG_TIME": "All",
        "KEYWORD": "",
        "TITLE_ONLY": "NO",
        "SUBMIT": "Retrieve Schedule"
    }
    
    try:
        resp = requests.post(url, data=payload, verify=False, timeout=60)
        resp.raise_for_status()
        return resp.text
    except Exception as e:
        print(f"[{self.name}] Error fetching data: {e}")
        return ""

  def links(self):
    return ["https://enr-apps.as.cmu.edu/open/SOC/SOCServlet/search"]

  def parser(self, html):
    soup = BeautifulSoup(html, 'html.parser')
    courses = []
    
    ALLOWED_DEPTS = ['ELECTRICAL & COMPUTER ENGINEERING', 'COMPUTER SCIENCE']
    
    tables = soup.find_all('table', id='search-results-table')
    
    for table in tables:
      # Check department
      prev_h4 = table.find_previous_sibling('h4', class_='department-title')
      if not prev_h4:
        continue
        
      dept_name = prev_h4.get_text(strip=True)
      if dept_name not in ALLOWED_DEPTS:
        continue

      tbody = table.find('tbody')
      if not tbody:
        continue
      
      current_course = None
      
      for tr in tbody.find_all('tr'):
        cols = tr.find_all('td')
        if len(cols) < 10:
          continue
          
        # Extract text from columns
        def get_text(col):
          return col.get_text(strip=True)
        
        course_id_text = get_text(cols[0])
        title_text = get_text(cols[1])
        units_text = get_text(cols[2])
        sec_text = get_text(cols[3])
        days_text = get_text(cols[5])
        begin_text = get_text(cols[6])
        end_text = get_text(cols[7])
        location_text = get_text(cols[8])
        
        # Check if this is a new course
        if course_id_text:
          # Save previous course if it exists
          if current_course:
            courses.append(current_course)
            
          current_course = {
            'id': course_id_text,
            'title': title_text,
            'units': units_text,
            'sections': []
          }
        
        # Parse section info
        meeting = {
          'days': days_text,
          'begin': begin_text,
          'end': end_text,
          'location': location_text
        }
        
        if course_id_text or sec_text:
          # New section
          section = {
            'id': sec_text,
            'meetings': [meeting]
          }
          if current_course:
              current_course['sections'].append(section)
        else:
          # Continuation of previous section
          if current_course and current_course['sections']:
            current_course['sections'][-1]['meetings'].append(meeting)
            
      # Append the last course of this table
      if current_course:
        courses.append(current_course)
      
    return courses
