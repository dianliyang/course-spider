from scrapers.uni import Uni
from bs4 import BeautifulSoup
import re

class MIT(Uni):
    def __init__(self):
        super().__init__("mit")

    def links(self, term=None):
        if term == "spring":
            term = "/archive/spring"
        elif term == "fall":
            term = "/archive/fall"
        else:
            term = ""

        return [f"https://student.mit.edu/catalog{term}/m6{i}.html" for i in ['a','b','c','d', 'e']]

    def parser(self, html: str):
        soup = BeautifulSoup(html, 'html.parser')
        courses = []
        
        h3_tags = soup.find_all('h3')
        
        for h3 in h3_tags:
            header_text = h3.get_text(separator=' ', strip=True)
            match = re.match(r'^([\w\.]+J?)\s+(.+)', header_text)
            if not match:
                continue
                
            course_id = match.group(1)
            course_title = match.group(2)
            
            details = {}
            curr = h3.next_sibling
            description_started = False
            description_parts = []
            instructors = []
            consumed_nodes = set()
            
            while curr:
                if curr.name == 'h3' or (curr.name == 'a' and curr.has_attr('name') and re.match(r'^\d+\.', curr.get('name', ''))):
                    break
                
                if curr in consumed_nodes:
                    curr = curr.next_sibling
                    continue

                if isinstance(curr, str):
                    text = curr.strip()
                    if text:
                        if text.startswith('Prereq:'):
                            prereq_parts = [text.replace('Prereq:', '').strip()]
                            temp = curr.next_sibling
                            while temp and temp.name != 'br' and temp.name != 'h3':
                                prereq_parts.append(temp.get_text(strip=True))
                                consumed_nodes.add(temp)
                                temp = temp.next_sibling
                            details['prerequisites'] = " ".join(prereq_parts).strip()
                        elif text.startswith('Units:'):
                            units_parts = [text.replace('Units:', '').strip()]
                            temp = curr.next_sibling
                            while temp and temp.name != 'br' and temp.name != 'h3':
                                units_parts.append(temp.get_text(strip=True))
                                consumed_nodes.add(temp)
                                temp = temp.next_sibling
                            details['units'] = " ".join(units_parts).strip()
                        elif description_started:
                            if any(text.startswith(t) for t in ['Fall:', 'Spring:', 'Summer:', 'IAP:']):
                                inst_text = text
                                temp = curr.next_sibling
                                if temp and temp.name == 'i':
                                    inst_text += " " + temp.get_text(strip=True)
                                    consumed_nodes.add(temp)
                                instructors.append(inst_text)
                            elif not text.startswith('Textbooks') and text != 'end':
                                description_parts.append(text)
                elif curr.name == 'img':
                    alt = curr.get('alt', '')
                    if alt in ['Fall', 'Spring', 'Summer', 'IAP']:
                        if 'terms' not in details:
                            details['terms'] = []
                        if alt not in details['terms']:
                            details['terms'].append(alt)
                    elif alt == '______': 
                        description_started = True
                elif curr.name == 'a' and description_started:
                    text = curr.get_text(strip=True)
                    if text and not text.startswith('Textbooks') and text != 'end':
                        description_parts.append(text)
                elif description_started and curr.name not in ['img', 'h3', 'br']:
                    text = curr.get_text(strip=True)
                    if text and not text.startswith('Textbooks') and text != 'end' and not any(text.startswith(t) for t in ['Fall:', 'Spring:', 'Summer:', 'IAP:']):
                        description_parts.append(text)

                curr = curr.next_sibling
                
            full_description = " ".join(description_parts).strip()
            
            courses.append({
                "id": course_id,
                "title": course_title,
                "prerequisites": details.get('prerequisites'),
                "units": details.get('units'),
                "terms": details.get('terms', []),
                "description": full_description,
                "instructors": instructors
            })
            
        return courses
