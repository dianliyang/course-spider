import * as cheerio from "cheerio";
import { BaseScraper } from "./BaseScraper";
import { Course } from "./types";

export class UCB extends BaseScraper {
  constructor() {
    super("ucb");
  }

  getSemesterParam(): string {
    if (!this.semester) return "2258"; // Default to Fall 2025 (approx/example code)
    
    // UCB uses numeric term codes. 
    // Logic to map fa25/sp25 to specific codes would go here.
    // For now, we'll just check for basic patterns or allow direct code input.
    // Example: Spring 2025 -> 2252, Fall 2025 -> 2258
    
    const input = this.semester.toLowerCase();
    
    // Simple mock mapping for the purpose of the example
    if (input.includes('sp25') || input.includes('spring25')) return "2252";
    if (input.includes('fa25') || input.includes('fall25')) return "2258"; // 8 = Fall
    if (input.includes('su25') || input.includes('summer25')) return "2255";
    
    // Fallback to existing hardcoded if unknown
    return "8573"; 
  }

  links(maxPages: number = 10): string[] {
    const termCode = this.getSemesterParam();
    const links: string[] = [];
    ["5582", "5475"].map((i) => {
      for (let page = 0; page < maxPages; page++) {
        links.push(
          `https://classes.berkeley.edu/search/class?f%5B0%5D=term%3A${termCode}&f%5B1%5D=subject_area%3A${i}&page=${page}`
        );
      }
    });

    return links;
  }

  async parser(html: string): Promise<Course[]> {
    const $ = cheerio.load(html);
    const courses: Course[] = [];
    const rows = $("div.views-row");

    rows.each((_, rowElement) => {
      const row = $(rowElement);
      const article = row.find("article.st");
      if (article.length === 0) return;

      const titleDiv = article.find("div.st--title");
      const title = titleDiv.find("h2").text().trim();

      const sectionNameSpan = article.find("span.st--section-name");
      const courseCode = sectionNameSpan.text().trim();

      const urlPath = article
        .find("div.st--section-name-wraper a")
        .attr("href");
      const courseUrl = urlPath ? `https://classes.berkeley.edu${urlPath}` : "";

      const deptLink = article.find("span.st-section-dept a");
      const department =
        deptLink.length > 0 ? deptLink.first().text().trim() : "";

      const sectionCodeSpan = article.find("span.st--section-code");
      const sectionCode = sectionCodeSpan.text().trim();

      const sectionCountSpans = article.find("span.st--section-count");
      const sectionNumber = sectionCountSpans.last().text().trim();

      const fullSection = `${sectionCode} ${sectionNumber}`.trim();

      const unitsDiv = article.find("div.st--details-unit");
      const units =
        unitsDiv.length > 0 ? unitsDiv.text().replace("Units:", "").trim() : "";

      const descDiv = article.find("div.st--description");
      const description = descDiv.length > 0 ? descDiv.text().trim() : "";

      // Determine level: UC Berkeley undergraduate is 1-199, graduate is 200+
      let level = "undergraduate";
      const codeNumMatch = courseCode.match(/\d+/);
      if (codeNumMatch) {
        const num = parseInt(codeNumMatch[0]);
        if (num >= 200) level = "graduate";
      }

      // Extract corequisites from description if possible
      let corequisites = "";
      const coreqMatch = description.match(/(?:Corequisites?|Prerequisites?|Prereq):\s*(.*?)(?=\.|$)/i);
      if (coreqMatch) {
        corequisites = coreqMatch[1].trim();
      }

      const meetingsDiv = article.find("div.st--meetings");
      let days = "";
      let time = "";
      let location = "";

      if (meetingsDiv.length > 0) {
        const daysDiv = meetingsDiv.find("div.st--meeting-days");
        if (daysDiv.length > 0) {
          const spans = daysDiv.find("span");
          if (spans.length > 1) {
            days = $(spans[1]).text().trim();
          }
        }

        const timeDiv = meetingsDiv.find("div.st--meeting-time");
        if (timeDiv.length > 0) {
          const spans = timeDiv.find("span");
          if (spans.length > 1) {
            time = $(spans[1]).text().trim();
          }
        }

        const locDiv = meetingsDiv.find("div.st--location");
        if (locDiv.length > 0) {
          const aTag = locDiv.find("a");
          if (aTag.length > 0) {
            aTag.find("svg").remove();
            location = aTag.text().trim();
          } else {
            location = locDiv.text().trim();
          }
        }
      }

      courses.push({
        university: this.name,
        courseCode: courseCode,
        title: title,
        units: units,
        description: description,
        url: courseUrl,
        department: department,
        level: level,
        corequisites: corequisites,
        details: {
          section: fullSection,
          days: days,
          time: time,
          location: location,
        },
      });
    });

    return courses;
  }
}
