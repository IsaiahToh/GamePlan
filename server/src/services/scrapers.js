const puppeteer = require("puppeteer");
const fs = require("fs");

async function scrapeLessonClassNamesInKRfrugFP(url) {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

  await page.waitForSelector("div.KRfrugFP", { timeout: 20000 });

  const result = await page.evaluate(() => {
    const unwanted = [
      "FRwl0Met",
      "timetable-cell",
      "HDSrsYUN",
      "hoverable",
      "QZw_5QSv",
      "color-0",
      "color-1",
      "color-2",
      "color-3",
      "color-4",
      "color-5",
      "color-6",
      "color-7",
      "color-8",
      "color-9",
    ];
    const krDivs = Array.from(document.querySelectorAll("div.KRfrugFP"));
    return krDivs.map((krDiv) => {
      const lessonDivs = Array.from(krDiv.querySelectorAll("div")).filter(
        (div) => div.className && div.className.startsWith("FRwl0Met")
      );
      return lessonDivs
        .map((div) => {
          const classes = div.className
            .split(" ")
            .filter((cls) => !unwanted.includes(cls));
          return classes[0] || null;
        })
        .filter(Boolean);
    });
  });

  await browser.close();
  return result;
}

async function getModuleInfo(acadYear, moduleCode) {
  const url = `https://api.nusmods.com/v2/${acadYear}/modules/${moduleCode}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  return await res.json();
}

async function getAllModuleInfos(nestedLessonClassNames, acadYear) {
  return Promise.all(
    nestedLessonClassNames.map(async (lessonArr) => {
      return Promise.all(
        lessonArr.map(async (lesson) => {
          const moduleCode = lesson.split("-")[0];
          try {
            return await getModuleInfo(acadYear, moduleCode);
          } catch (e) {
            return { error: `Failed to fetch ${moduleCode}` };
          }
        })
      );
    })
  );
}

const LESSON_TYPE_MAP = {
  LEC: "Lecture",
  TUT: "Tutorial",
  REC: "Recitation",
  LAB: "Laboratory",
  SEC: "Sectional Teaching",
};
const dayOrder = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
function parseLesson(lessonStr) {
  const parts = lessonStr.split("-");
  return {
    moduleCode: parts[0],
    lessonTypeShort: parts[1],
    lessonType: LESSON_TYPE_MAP[parts[1]] || parts[1],
    classNo: parts[2],
  };
}

const SEMESTER = 1;
const acadYear = "2025-2026";

async function scrape(url) {
  console.log("Scraping lessons from URL:", url);
  const allLessonClassNames = await scrapeLessonClassNamesInKRfrugFP(url);

  const allModuleInfos = await getAllModuleInfos(allLessonClassNames, acadYear);

  const flatLessons = [];
  allLessonClassNames.forEach((dayArr, i) => {
    dayArr.forEach((lessonStr, j) => {
      const parsed = parseLesson(lessonStr);
      const mod = allModuleInfos[i][j];
      if (!mod || !mod.semesterData) return;

      for (const sem of mod.semesterData) {
        if (sem.semester !== SEMESTER || !sem.timetable) continue;
        const matches = sem.timetable.filter(
          (t) =>
            t.lessonType === parsed.lessonType && t.classNo === parsed.classNo
        );
        matches.forEach((t) => {
          flatLessons.push({
            moduleCode: parsed.moduleCode,
            lessonType: parsed.lessonType,
            startTime: `${t.startTime.slice(0, 2)}:${t.startTime.slice(2)}`,
            endTime: `${t.endTime.slice(0, 2)}:${t.endTime.slice(2)}`,
            weeks: t.weeks,
            day: dayOrder.indexOf(t.day),
          });
        });
      }
    });
  });

  flatLessons.sort((a, b) => {
    return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
  });

  /*const jsonString = JSON.stringify(flatLessons, null, 2);
  fs.writeFileSync("dashboardData.json", jsonString, "utf-8");
  console.log("dashboardData.json has been written.");*/

  return flatLessons;
}

module.exports = {
  scrape,
  scrapeLessonClassNamesInKRfrugFP,
  getModuleInfo,
  getAllModuleInfos,
  parseLesson,
  SEMESTER,
  acadYear,
};