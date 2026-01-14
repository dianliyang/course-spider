import * as cheerio from "cheerio";
import { BaseScraper } from "./BaseScraper";
import { Course } from "./types";

export class UCB extends BaseScraper {
  constructor() {
    super("ucb");
  }

  links(maxPages: number = 10): string[] {
    const links: string[] = [];
    ["5582", "5475"].map((i) => {
      for (let page = 0; page < maxPages; page++) {
        links.push(
          `https://classes.berkeley.edu/search/class?f%5B0%5D=term%3A8573&f%5B1%5D=subject_area%3A${i}&page=${page}`
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
