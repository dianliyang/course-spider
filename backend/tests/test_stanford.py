import unittest
from backend.scrapers.stanford import Stanford

class TestStanfordParser(unittest.TestCase):
    SAMPLE_HTML = """<div class="searchResult">
   <div class="courseInfo">
      <h2><span class="courseNumber">CS 7:</span><span class="courseTitle">Personal Finance for Engineers</span></h2>
      <div class="courseDescription">Introduction to the fundamentals and analysis specifically needed by engineers to make informed and intelligent financial decisions. Course will focus on actual industry-based financial information from technology companies and realistic financial issues. Topics include: behavioral finance, budgeting, debt, compensation, stock options, investing and real estate. No prior finance or economics experience required.</div>
   </div>
   <div class="courseAttributes">
      Terms: Aut
      | Units: 1
   </div>
   <div class="courseAttributes">
      Instructors: ; <a href="instructor/smashman">Nash, A. (PI)</a>	
   </div>
</div>"""

    def test_parser(self):
        stanford = Stanford()
        results = stanford.parser(self.SAMPLE_HTML)
        self.assertEqual(len(results), 1)
        
        course = results[0]
        self.assertEqual(course['id'], "CS 7")
        self.assertEqual(course['title'], "Personal Finance for Engineers")
        self.assertEqual(course['units'], "1")
        self.assertIn("Aut", course['terms'])
        self.assertTrue(course['description'].startswith("Introduction to the fundamentals"))
        self.assertIn("Nash, A. (PI)", course['instructors'])

    def test_links(self):
        stanford = Stanford()
        
        # Test default
        default_links = stanford.links()
        self.assertIsInstance(default_links, list)
        self.assertEqual(len(default_links), 1)
        self.assertIn("q=CS", default_links[0])
        
        # Test custom query
        math_links = stanford.links(query="MATH")
        self.assertIn("q=MATH", math_links[0])
        
        # Test specific terms
        term_links = stanford.links(terms=["Winter"])
        self.assertIn("filter-term-Winter=on", term_links[0])
        self.assertNotIn("filter-term-Autumn=on", term_links[0])

if __name__ == "__main__":
    unittest.main()