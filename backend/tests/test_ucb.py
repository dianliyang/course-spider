import unittest
from scrapers.ucb import UCB

class TestUCBParser(unittest.TestCase):
    SAMPLE_HTML = """
<div class="views-row">
   <article data-history-node-id="512341" class="st">
      <div class="st--wrapper">
         <div class="st--content">
            <div class="st--term">
               <div class="st--term-year">
                  Spring 2026         
               </div>
               <div class="st--section-number">#34831</div>
               <div class="st--section-name-wraper">
                  <a href="/content/2026-spring-compsci-70-120-lec-120">
                  <span class="st--section-name">COMPSCI 70</span>
                  <span class="st--section-count">120</span> -
                  <span class="st--section-code">LEC</span>
                  <span class="st--section-count">120</span>
                  </a>
                  <span class="st-section-dept">
                     offered through 
                     <a href="http://www.eecs.berkeley.edu" class="ext" data-extlink="" target="_blank" rel="noopener noreferrer" title="(opens in a new window)">
                        Electrical Engineering and Computer Sciences
                        <svg focusable="false" width="1em" height="1em" class="ext" data-extlink-placement="append" aria-label="(link is external)" viewBox="0 0 80 40" role="img" aria-hidden="false">
                           <title>(link is external)</title>
                           <path d="M48 26c-1.1 0-2 0.9-2 2v26H10V18h26c1.1 0 2-0.9 2-2s-0.9-2-2-2H8c-1.1 0-2 0.9-2 2v40c0 1.1 0.9 2 2 2h40c1.1 0 2-0.9 2-2V28C50 26.9 49.1 26 48 26z"></path>
                           <path d="M56 6H44c-1.1 0-2 0.9-2 2s0.9 2 2 2h7.2L30.6 30.6c-0.8 0.8-0.8 2 0 2.8C31 33.8 31.5 34 32 34s1-0.2 1.4-0.6L54 12.8V20c0 1.1 0.9 2 2 2s2-0.9 2-2V8C58 6.9 57.1 6 56 6z"></path>
                        </svg>
                     </a>
                  </span>
               </div>
               <div class="st--open-toggle" title="Open/Close" aria-expanded="false" tabindex="0" data-once="sectionToggle">
                  <a class="st--open-arrow" tabindex="0" title="Open/Close" href="#" aria-expanded="false" data-once="sectionToggle"></a>
                  <span class="screenreader-state-indication">section closed</span>
               </div>
            </div>
            <div class="st--title">
               <h2>Discrete Mathematics and Probability Theory</h2>
            </div>
            <div class="st--meetings">
               <div class="st--meeting-details">
                  <div class="st--meeting-dates">
                     Jan 20, 2026 - May 08, 2026
                  </div>
                  <div class="st--meeting-days">
                     <span class="icon icon-days" aria-label="Days of the Week" title="Days of the Week"></span>
                     <span>We, Fr</span>
                  </div>
                  <div class="st--meeting-time">
                     <span class="icon icon-time" aria-label="Time" title="Time"></span>
                     <span>03:00 pm  -  03:59 pm</span>
                  </div>
                  <div class="st--location">
                     <span class="icon icon-location" aria-label="Location" title="Location"></span>
                     <a href="http://www.berkeley.edu/map/?q=evans" class="ext" data-extlink="" target="_blank" rel="noopener noreferrer" title="(opens in a new window)">
                        Evans 35
                        <svg focusable="false" width="1em" height="1em" class="ext" data-extlink-placement="append" aria-label="(link is external)" viewBox="0 0 80 40" role="img" aria-hidden="false">
                           <title>(link is external)</title>
                           <path d="M48 26c-1.1 0-2 0.9-2 2v26H10V18h26c1.1 0 2-0.9 2-2s-0.9-2-2-2H8c-1.1 0-2 0.9-2 2v40c0 1.1 0.9 2 2 2h40c1.1 0 2-0.9 2-2V28C50 26.9 49.1 26 48 26z"></path>
                           <path d="M56 6H44c-1.1 0-2 0.9-2 2s0.9 2 2 2h7.2L30.6 30.6c-0.8 0.8-0.8 2 0 2.8C31 33.8 31.5 34 32 34s1-0.2 1.4-0.6L54 12.8V20c0 1.1 0.9 2 2 2s2-0.9 2-2V8C58 6.9 57.1 6 56 6z"></path>
                        </svg>
                     </a>
                  </div>
               </div>
            </div>
            <div class="st--section-info-wrapper">
               <div class="st--section-number">
                  <span>Class #:</span>34831
               </div>
               <div class="st--details-unit">
                  <span>Units:</span>4
               </div>
            </div>
            <div class="st--extras">
               <p>
                  <strong id="im-label-34831">Instruction Mode:</strong>
                  <span aria-describedby="im-label-34831">In-Person Instruction</span>
               </p>
            </div>
            <div class="st--seats">
               <strong>No Open Seats</strong>
            </div>
         </div>
         <div class="st--image">
            <img src="/sites/default/files/COMPSCI-18-1.jpg" alt="COMPSCI 70 - LEC 120 Discrete Mathematics and Probability Theory more detail">
         </div>
         <div class="st--description">
            Logic, infinity, and induction; applications include undecidability and stable marriage problem. Modular arithmetic and GCDs; applications include primality testing and cryptography. Polynomials; examples include error correcting codes and interpolation. Probability including sample spaces, independence, random variables, law of large numbers; examples include load balancing, existence arguments, Bayesian inference. 
         </div>
      </div>
   </article>
</div>
"""

    def test_parser_basic(self):
        ucb = UCB()
        results = ucb.parser(self.SAMPLE_HTML)
        self.assertEqual(len(results), 1)
        
        course = results[0]
        self.assertEqual(course['code'], "COMPSCI 70")
        self.assertEqual(course['title'], "Discrete Mathematics and Probability Theory")
        self.assertEqual(course['section'], "LEC 120")
        self.assertEqual(course['units'], "4")
        self.assertEqual(course['days'], "We, Fr")
        self.assertEqual(course['time'], "03:00 pm  -  03:59 pm")
        self.assertEqual(course['location'], "Evans 35")
        self.assertTrue(course['description'].startswith("Logic, infinity, and induction"))

if __name__ == "__main__":
    unittest.main()
