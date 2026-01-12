from scrapers.uni import Uni
from bs4 import BeautifulSoup

class UCB(Uni):
    def __init__(self):
        super().__init__("ucb")

    def links(self, max_pages=10):
        return [f"https://classes.berkeley.edu/search/class?f%5B0%5D=subject_area:5582&f%5B1%5D=term:8573&f%5B2%5D=term:8576&page={page}" for page in range(max_pages)]


    def parser(self, html):
        soup = BeautifulSoup(html, 'html.parser')
        courses = []
        rows = soup.find_all('div', class_='views-row')
        
        for row in rows:
            article = row.find('article', class_='st')
            if not article:
                continue
            
            # Extract title
            title_div = article.find('div', class_='st--title')
            title = title_div.h2.get_text(strip=True) if title_div and title_div.h2 else ""

            # Extract course code
            section_name_span = article.find('span', class_='st--section-name')
            course_code = section_name_span.get_text(strip=True) if section_name_span else ""
            
            # Extract section info
            section_code_span = article.find('span', class_='st--section-code')
            section_code = section_code_span.get_text(strip=True) if section_code_span else ""
            
            section_count_spans = article.find_all('span', class_='st--section-count')
            section_number = section_count_spans[-1].get_text(strip=True) if section_count_spans else ""
            
            full_section = f"{section_code} {section_number}".strip()

            # Extract units
            units_div = article.find('div', class_='st--details-unit')
            units = ""
            if units_div:
                units = units_div.get_text(strip=True).replace('Units:', '').strip()

            # Extract description
            desc_div = article.find('div', class_='st--description')
            description = desc_div.get_text(strip=True) if desc_div else ""

            # Extract meetings
            meetings_div = article.find('div', class_='st--meetings')
            days = ""
            time = ""
            location = ""
            if meetings_div:
                # Days
                days_div = meetings_div.find('div', class_='st--meeting-days')
                if days_div:
                     spans = days_div.find_all('span')
                     if len(spans) > 1:
                         days = spans[1].get_text(strip=True)
                
                # Time
                time_div = meetings_div.find('div', class_='st--meeting-time')
                if time_div:
                    spans = time_div.find_all('span')
                    if len(spans) > 1:
                        time = spans[1].get_text(strip=True)
                
                # Location
                loc_div = meetings_div.find('div', class_='st--location')
                if loc_div:
                    a_tag = loc_div.find('a')
                    if a_tag:
                        for svg in a_tag.find_all('svg'):
                            svg.decompose()
                        location = a_tag.get_text(strip=True)
                    else:
                         location = loc_div.get_text(strip=True)

            courses.append({
                "code": course_code,
                "title": title,
                "section": full_section,
                "units": units,
                "description": description,
                "days": days,
                "time": time,
                "location": location
            })
        
        return courses
