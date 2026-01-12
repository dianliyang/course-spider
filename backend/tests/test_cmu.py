import unittest
from backend.scrapers.cmu import CMU

class TestCMUParser(unittest.TestCase):
    SAMPLE_HTML = """
    <h4 class="department-title">MECHANICAL ENGINEERING</h4>
    <table id="search-results-table">
     <thead><tr><th>Course</th><th>Title</th><th>Units</th><th>Sec</th><th>Mini</th><th>Days</th><th>Begin</th><th>End</th><th>Loc</th><th>Mode</th></tr></thead>
     <tbody>
            <tr>
                <td><a href="#">24000</a></td>
                <td>MechE Course</td>
                <td>12</td>
                <td>A</td>
                <td></td>
                <td>MWF</td>
                <td>09:00AM</td>
                <td>10:00AM</td>
                <td>Pittsburgh</td>
                <td>In-person</td>
            </tr>
     </tbody>
    </table>

    <h4 class="department-title">COMPUTER SCIENCE</h4>
    <table id="search-results-table">
     <thead><tr><th>Course</th><th>Title</th><th>Units</th><th>Sec</th><th>Mini</th><th>Days</th><th>Begin</th><th>End</th><th>Loc</th><th>Mode</th></tr></thead>
     <tbody>
            <tr>
                <td><a href="#">15213</a></td>
                <td>Intro to Computer Systems</td>
                <td>12</td>
                <td>Lec 1</td>
                <td></td>
                <td>TR</td>
                <td>12:30PM</td>
                <td>01:50PM</td>
                <td>Pittsburgh</td>
                <td>In-person</td>
            </tr>
     </tbody>
    </table>
    """

    def test_parser_filtering(self):
        cmu = CMU()
        results = cmu.parser(self.SAMPLE_HTML)
        self.assertEqual(len(results), 1)
        
        # Should only have CS course
        c1 = results[0]
        self.assertEqual(c1['id'], '15213')
        self.assertEqual(c1['title'], 'Intro to Computer Systems')

    def test_links(self):
        cmu = CMU()
        links = cmu.links()
        self.assertIsInstance(links, list)
        self.assertEqual(len(links), 1)
        self.assertEqual(links[0], "https://enr-apps.as.cmu.edu/open/SOC/SOCServlet/search")

if __name__ == "__main__":
    unittest.main()
