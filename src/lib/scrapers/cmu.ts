import * as cheerio from "cheerio";
import { BaseScraper } from "./BaseScraper";
import { Course } from "./types";
import { fetch, Agent } from "undici";

export class CMU extends BaseScraper {
  constructor() {
    super("cmu");
  }

  async retrieve(): Promise<Course[]> {
    const url = "https://enr-apps.as.cmu.edu/open/SOC/SOCServlet/search";
    
    const params = new URLSearchParams();
    params.append("SEMESTER", "S25");
    params.append("MINI", "NO");
    params.append("GRAD_UNDER", "All");
    params.append("PRG_LOCATION", "All");
    params.append("DEPT", "CS");
    params.append("DEPT", "ECE");
    params.append("BEG_TIME", "All");
    params.append("KEYWORD", "");
    params.append("TITLE_ONLY", "NO");
    params.append("SUBMIT", "Retrieve Schedule");

    const html = await this.fetchPage(url, params);
    if (html) {
      return await this.parser(html);
    }
    return [];
  }

  async fetchPage(url: string, body?: URLSearchParams): Promise<string> {
    console.log(`[${this.name}] Fetching ${url}...`);

    try {
      const response = await fetch(url, {
        method: body ? "POST" : "GET",
        headers: body ? {
          "Content-Type": "application/x-www-form-urlencoded",
        } : {},
        body: body,
        dispatcher: new Agent({
          connect: {
            rejectUnauthorized: false,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch ${url}: ${response.status} ${response.statusText}`
        );
      }
      return await response.text();
    } catch (error) {
      console.error(`[${this.name}] Error fetching ${url}:`, error);
      return "";
    }
  }

  async fetchDetail(courseCode: string, semester: string): Promise<{ description: string; prerequisites: string }> {
    const cleanCode = courseCode.replace("-", "");
    const url = `https://enr-apps.as.cmu.edu/open/SOC/SOCServlet/courseDetails?COURSE=${cleanCode}&SEMESTER=${semester}`;
    
    // Small delay to be polite
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      const html = await this.fetchPage(url);
      if (!html) return { description: "", prerequisites: "" };
      
      const $ = cheerio.load(html);
      const description = $("#course-detail-description p").text().trim();
      const prerequisites = $("dt:contains('Prerequisites')").next("dd").text().trim();
      
      return { description, prerequisites };
    } catch (error) {
      console.error(`[${this.name}] Error fetching details for ${courseCode}:`, error);
      return { description: "", prerequisites: "" };
    }
  }

  async parser(html: string): Promise<Course[]> {
    const $ = cheerio.load(html);
    const courses: Course[] = [];
    const semester = "S25";

    const ALLOWED_DEPTS = [
      "ELECTRICAL & COMPUTER ENGINEERING",
      "COMPUTER SCIENCE",
    ];

    const tables = $("table#search-results-table");
    const results = [];

    let fetchCount = 0;
    const FETCH_LIMIT = 5;

    // Process tables sequentially to respect delay
    for (const tableElement of tables.toArray()) {
      const table = $(tableElement);
      const prevH4 = table.prevAll("h4.department-title").first();
      if (prevH4.length === 0) continue;

      const deptName = prevH4.text().trim();
      if (!ALLOWED_DEPTS.includes(deptName)) continue;

      const tbody = table.find("tbody");
      if (tbody.length === 0) continue;

      let currentCourse: Course | null = null;
      const rows = tbody.find("tr").toArray();

      for (const trElement of rows) {
        const cols = $(trElement).find("td");
        if (cols.length < 10) continue;

        const getText = (idx: number) => $(cols[idx]).text().trim();
        const courseIdText = getText(0);

        if (courseIdText) {
          if (currentCourse) {
            courses.push(currentCourse);
          }

          let description = "";
          let prerequisites = "";

          if (fetchCount < FETCH_LIMIT) {
            const details = await this.fetchDetail(courseIdText, semester);
            description = details.description;
            prerequisites = details.prerequisites;
            fetchCount++;
          }

          currentCourse = {
            university: this.name,
            courseCode: courseIdText,
            title: getText(1),
            units: getText(2),
            description: description,
            details: {
              sections: [],
              prerequisites: prerequisites
            },
          };
        }

        if (currentCourse) {
          const secText = getText(3);
          const meeting = {
            days: getText(5),
            begin: getText(6),
            end: getText(7),
            location: getText(8),
          };

          if (courseIdText || secText) {
            const section = {
              id: secText,
              meetings: [meeting],
            };
            (currentCourse.details as any).sections.push(section);
          } else {
            const sections = (currentCourse.details as any).sections;
            if (sections.length > 0) {
              sections[sections.length - 1].meetings.push(meeting);
            }
          }
        }
      }
      if (currentCourse) {
        courses.push(currentCourse);
      }
    }

    return courses;
  }
}
