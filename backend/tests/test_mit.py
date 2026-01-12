import unittest
from backend.scrapers.mit import MIT

class TestMITLinks(unittest.TestCase):
    def test_links(self):
        mit = MIT()
        self.assertEqual(mit.links('spring'), [
            "https://student.mit.edu/catalog/archive/spring/m6a.html",
            "https://student.mit.edu/catalog/archive/spring/m6b.html",
            "https://student.mit.edu/catalog/archive/spring/m6c.html",
            "https://student.mit.edu/catalog/archive/spring/m6d.html",
            "https://student.mit.edu/catalog/archive/spring/m6e.html"
        ])

        self.assertEqual(mit.links('fall'), [
            "https://student.mit.edu/catalog/archive/fall/m6a.html",
            "https://student.mit.edu/catalog/archive/fall/m6b.html",
            "https://student.mit.edu/catalog/archive/fall/m6c.html",
            "https://student.mit.edu/catalog/archive/fall/m6d.html",
            "https://student.mit.edu/catalog/archive/fall/m6e.html"
        ])
        self.assertEqual(mit.links(), [
            "https://student.mit.edu/catalog/m6a.html",
            "https://student.mit.edu/catalog/m6b.html",
            "https://student.mit.edu/catalog/m6c.html",
            "https://student.mit.edu/catalog/m6d.html",
            "https://student.mit.edu/catalog/m6e.html"
        ])


class TestMITParser(unittest.TestCase):
    SAMPLE_HTML = """
    <tbody><tr><td>
    <h2>Programming &amp; Software Engineering</h2>
    <a name="6.100A"></a>
    <p></p><h3>6.100A Introduction to Computer Science Programming in Python
    <br><img alt="______" src="/icns/hr.gif"></h3>
    <img width="16" height="16" align="bottom" alt="Undergrad" title="Undergrad" src="/icns/under.gif">  (<img width="16" height="16" align="bottom" alt="Fall" title="Fall" src="/icns/fall.gif">, <img width="16" height="16" align="bottom" alt="Spring" title="Spring" src="/icns/spring.gif">); first half of term
    <br>Prereq: None
    <br>Units: 2-0-4
    <br>Credit cannot also be received for <a href="m6a.html#6.100L">6.100L</a>
    <br>URL: <a href="https://introcomp.mit.edu/fall24">https://introcomp.mit.edu/fall24</a>
    <br>Ends Mar 21. <b>Lecture:</b> <i>MW3-4.30</i> (<a href="http://whereis.mit.edu/map-jpg?mapterms=26">26-100</a>) <b>Recitation:</b> <i>F10</i> (<a href="http://whereis.mit.edu/map-jpg?mapterms=5">5-134</a>) or <i>F11</i> (<a href="http://whereis.mit.edu/map-jpg?mapterms=5">5-134</a>, <a href="http://whereis.mit.edu/map-jpg?mapterms=24">24-121</a>) or <i>F12</i> (<a href="http://whereis.mit.edu/map-jpg?mapterms=24">24-121</a>) or <i>F1</i> (<a href="http://whereis.mit.edu/map-jpg?mapterms=5">5-134</a>) or <i>F2</i> (<a href="http://whereis.mit.edu/map-jpg?mapterms=5">5-134</a>) or <i>F1</i> (<a href="http://whereis.mit.edu/map-jpg?mapterms=5">5-217</a>) or <i>F2</i> (<a href="http://whereis.mit.edu/map-jpg?mapterms=5">5-217</a>)<!--s-->
    <br><img alt="______" src="/icns/hr.gif">
    <br>Introduction to computer science and programming for students with little or no programming experience. Students develop skills to program and use computational techniques to solve problems. Topics include the notion of computation, Python, simple algorithms and data structures, testing and debugging, and algorithmic complexity. Combination of 6.100A and 6.100B or 16.C20 counts as REST subject. Final given in the seventh week of the term.
    <br>Fall: <i>A. Bell</i><br>Spring: <i>A. Bell</i><br><a href="javascript:PopUpHelp('http://eduapps.mit.edu/textbook/books.html?Term=2025SP&amp;Subject=6.100A');">Textbooks (Spring 2025)</a>
    <p></p><!--end-->
    <a name="6.100B"></a>
    <p></p><h3>6.100B Introduction to Computational Thinking and Data Science
    <br><img alt="______" src="/icns/hr.gif"></h3>
    <img width="16" height="16" align="bottom" alt="Undergrad" title="Undergrad" src="/icns/under.gif">  (<img width="16" height="16" align="bottom" alt="Fall" title="Fall" src="/icns/fall.gif">, <img width="16" height="16" align="bottom" alt="Spring" title="Spring" src="/icns/spring.gif">); second half of term
    <br>Prereq: <a href="m6a.html#6.100A">6.100A</a> or permission of instructor
    <br>Units: 2-0-4
    <br>Credit cannot also be received for <a href="m9b.html#9.C20">9.C20</a>, <a href="m16a.html#16.C20">16.C20</a>, <a href="m18b.html#18.C20">18.C20</a>, <a href="mCSEa.html#CSE.C20">CSE.C20</a>
    <br>URL: <a href="https://introcomp.mit.edu/spring25">https://introcomp.mit.edu/spring25</a>
    <br>Begins Mar 31. <b>Lecture:</b> <i>MW3-4.30</i> (<a href="http://whereis.mit.edu/map-jpg?mapterms=26">26-100</a>) <b>Recitation:</b> <i>F10</i> (<a href="http://whereis.mit.edu/map-jpg?mapterms=5">5-134</a>) or <i>F11</i> (<a href="http://whereis.mit.edu/map-jpg?mapterms=5">5-134</a>, <a href="http://whereis.mit.edu/map-jpg?mapterms=24">24-121</a>) or <i>F12</i> (<a href="http://whereis.mit.edu/map-jpg?mapterms=24">24-121</a>) or <i>F1</i> (<a href="http://whereis.mit.edu/map-jpg?mapterms=5">5-134</a>) or <i>F2</i> (<a href="http://whereis.mit.edu/map-jpg?mapterms=5">5-134</a>) or <i>F1</i> (<a href="http://whereis.mit.edu/map-jpg?mapterms=5">5-217</a>) or <i>F2</i> (<a href="http://whereis.mit.edu/map-jpg?mapterms=5">5-217</a>)<!--s-->
    <br><img alt="______" src="/icns/hr.gif">
    <br>Provides an introduction to using computation to understand real-world phenomena. Topics include plotting, stochastic programs, probability and statistics, random walks, Monte Carlo simulations, modeling data, optimization problems, and clustering. Combination of 6.100A and 6.100B counts as REST subject.
    <br>Fall: <i>A. Bell</i><br>Spring: <i>A. Bell</i><br><a href="javascript:PopUpHelp('http://eduapps.mit.edu/textbook/books.html?Term=2025SP&amp;Subject=6.100B');">Textbooks (Spring 2025)</a>
    <p></p><!--end-->
    <a name="6.100L"></a>
    <p></p><h3>6.100L Introduction to Computer Science and Programming
    <br><img alt="______" src="/icns/hr.gif"></h3>
    <img width="16" height="16" align="bottom" alt="Undergrad" title="Undergrad" src="/icns/under.gif">  (<img width="16" height="16" align="bottom" alt="Fall" title="Fall" src="/icns/fall.gif">, <img width="16" height="16" align="bottom" alt="Spring" title="Spring" src="/icns/spring.gif">)
    <br>Prereq: None
    <br>Units: 2-0-4
    <br>Credit cannot also be received for <a href="m6a.html#6.100A">6.100A</a>
    <br>URL: <a href="https://introcomp.mit.edu/6.100L_fa24">https://introcomp.mit.edu/6.100L_fa24</a>
    <br><b>Lecture:</b> <i>MW3-4.30</i> (<a href="http://whereis.mit.edu/map-jpg?mapterms=34">34-101</a>) <b>Recitation:</b> <i>F10</i> (<a href="http://whereis.mit.edu/map-jpg?mapterms=32">32-123</a>)<!--s-->
    <br><img alt="______" src="/icns/hr.gif">
    <br>Introduction to computer science and programming for students with no programming experience. Presents content taught in 6.100A over an entire semester. Students develop skills to program and use computational techniques to solve problems. Topics include the notion of computation, Python, simple algorithms and data structures, testing and debugging, and algorithmic complexity. Lectures are viewed outside of class; in-class time is dedicated to problem-solving and discussion. Combination of 6.100L and 6.100B or 16.C20 counts as REST subject.
    <br>Fall: <i>A. Bell</i><br>Spring: <i>A. Bell</i><br><a href="javascript:PopUpHelp('http://eduapps.mit.edu/textbook/books.html?Term=2025SP&amp;Subject=6.100L');">Textbooks (Spring 2025)</a>
    <p></p><!--end-->
    </td></tr></tbody>
    """

    def test_parser_basic(self):
        mit = MIT()
        results = mit.parser(self.SAMPLE_HTML)
        self.assertEqual(len(results), 3)
        
        # Test 6.100A
        course_a = results[0]
        self.assertEqual(course_a['id'], "6.100A")
        self.assertEqual(course_a['title'], "Introduction to Computer Science Programming in Python")
        self.assertEqual(course_a['prerequisites'], "None")
        self.assertEqual(course_a['units'], "2-0-4")
        self.assertIn("Fall", course_a['terms'])
        self.assertIn("Spring", course_a['terms'])
        self.assertTrue(course_a['description'].startswith("Introduction to computer science"))
        self.assertIn("Fall: A. Bell", course_a['instructors'])
        self.assertIn("Spring: A. Bell", course_a['instructors'])

        # Test 6.100B
        course_b = results[1]
        self.assertEqual(course_b['id'], "6.100B")
        self.assertEqual(course_b['title'], "Introduction to Computational Thinking and Data Science")
        self.assertEqual(course_b['prerequisites'], "6.100A or permission of instructor")
        self.assertEqual(course_b['units'], "2-0-4")

if __name__ == "__main__":
    unittest.main()