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
        Retrieves data and saves it to data/{name}.json
        """
        print(f"[{self.name}] Starting retrieval...")
        data = self.retrieve()
        
        filename = f"data/{self.name}.json"
        
        try:
            with open(filename, "w") as f:
                json.dump(data, f, indent=2)
            print(f"[{self.name}] Successfully saved {len(data)} courses to {filename}")
        except Exception as e:
            print(f"[{self.name}] Error saving file: {e}")
