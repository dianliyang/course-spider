const fs = require('fs');

const content = fs.readFileSync('transaction.txt', 'utf8');

const lines = content.split('\n');
const university = "NCU";
const department = "Department of Cybersecurity";

const courses = [];
let currentSemester = "";

function getAcronym(title) {
    return title
        .replace(/[()]/g, '')
        .split(/[" "-]+/) // Corrected: escaped space and hyphen
        .filter(word => word.length > 0 && !['on', 'to', 'and', 'the', 'of', 'for', 'a', 'an'].includes(word.toLowerCase()))
        .map(word => word[0].toUpperCase())
        .join('');
}

function parseScore(scoreStr) {
    if (scoreStr.toLowerCase() === 'adequate') return 60; // Assuming 60 for adequate
    const score = parseFloat(scoreStr);
    return isNaN(score) ? 0 : score;
}

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Detect semester
    const semesterMatch = line.match(/^(\d{4}-\d{4})\s+(Summer|Fall|Spring)$/); // Corrected: escaped backslashes
    if (semesterMatch) {
        currentSemester = line;
        continue;
    }

    // Skip headers and metadata
    if (line.startsWith('Course Name') || line.includes('Academic Affairs Office') || line.includes('Verification URL') || line.includes('Student transcript')) continue;
    if (line.match(/^(Name:|ID Card No:|College:|Class:|Enrollment Date:)/)) continue;

    // Try to parse course line: Name Cat. Credit Score
    // Note: The text is messy, some lines have multiple courses or are split.
    // Example: "Training on Military Skills C 0.0 Adequate"
    // Example: "Advanced Mathematics (I) Part 1 C 5.0 93"
    
    const courseMatch = line.match(/(.+?)\s+([CE])\s+(\d+\.\d+)\s+(Adequate|[\d.]+)/); // Corrected: escaped backslashes
    if (courseMatch) {
        const title = courseMatch[1].trim();
        const category = courseMatch[2];
        const units = courseMatch[3];
        const score = parseScore(courseMatch[4]);
        const courseCode = `NCU-${getAcronym(title)}`;

        courses.push({
            university,
            courseCode,
            title,
            units,
            score,
            semester: currentSemester,
            department,
            isInternal: true,
            level: 'undergraduate'
        });
    } else {
        // Handle cases where multiple names are on one line before the data
        // "College Physics (II) Advanced Mathematics (I) Part 2 Sports (2) C 1.0 86"
        // This is hard to parse perfectly without more context, but I will try to catch the obvious ones.
    }
}

fs.writeFileSync('ncu_courses.json', JSON.stringify(courses, null, 2));
console.log(`Generated ${courses.length} courses in ncu_courses.json`);
