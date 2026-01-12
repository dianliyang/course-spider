import requests
from scrapers.uni import Uni
from bs4 import BeautifulSoup

class Stanford(Uni):
  def __init__(self):
    super().__init__("stanford")

  def fetch_page(self, url: str) -> str:
    print(f"[{self.name}] Fetching {url} with cookies...")
    cookies = {"jsenabled": "1"}
    try:
        resp = requests.get(url, verify=False, timeout=30, cookies=cookies)
        resp.raise_for_status()
        return resp.text
    except Exception as e:
        print(f"[{self.name}] Error fetching {url}: {e}")
        return ""

  def links(self, query="CS", terms=None):
    if terms is None:
      terms = ["Autumn", "Winter", "Spring", "Summer"]
    
    base_url = "https://explorecourses.stanford.edu/print"
    params = [
      "filter-coursestatus-Active=on",
      "descriptions=on",
      f"q={query}"
    ]
    
    for term in terms:
      params.append(f"filter-term-{term}=on")
      
    # Return as a list
    return [f"{base_url}?{'&'.join(params)}"]

  def parser(self, html: str):
    soup = BeautifulSoup(html, 'html.parser')
    courses = []

    for result in soup.find_all('div', class_='searchResult'):
      course = {
        'id': None,
        'title': None,
        'description': None,
        'terms': [],
        'units': None,
        'instructors': []
      }

      course_info = result.find('div', class_='courseInfo')
      if course_info:
        number_span = course_info.find('span', class_='courseNumber')
        if number_span:
          course['id'] = number_span.get_text(strip=True).rstrip(':')

        title_span = course_info.find('span', class_='courseTitle')
        if title_span:
          course['title'] = title_span.get_text(strip=True)

        desc_div = course_info.find('div', class_='courseDescription')
        if desc_div:
          course['description'] = desc_div.get_text(strip=True)

      for attr_div in result.find_all('div', class_='courseAttributes'):
        text = attr_div.get_text(separator=' ', strip=True)

        if 'Terms:' in text:
          parts = text.split('|')
          for part in parts:
            part = part.strip()
            if part.startswith('Terms:'):
              terms_str = part.replace('Terms:', '').strip()
              course['terms'] = [t.strip() for t in terms_str.split(',') if t.strip()]
            elif part.startswith('Units:'):
              course['units'] = part.replace('Units:', '').strip()

        if 'Instructors:' in text:
          instructors_text = text.replace('Instructors:', '').strip()
          if instructors_text.startswith(';'):
            instructors_text = instructors_text[1:].strip()
          
          if instructors_text:
             # Try to extract names from links if available, as they are cleaner
             links = attr_div.find_all('a')
             if links:
                 course['instructors'] = [a.get_text(strip=True) for a in links]
             else:
                 course['instructors'] = [instructors_text]

      courses.append(course)

    return courses
