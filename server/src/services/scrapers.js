const puppeteer = require('puppeteer');

async function scrapeLessonClassNamesInKRfrugFP(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    await page.waitForSelector('div.KRfrugFP', { timeout: 20000 });

    const result = await page.evaluate(() => {
        const unwanted = [
            'FRwl0Met',
            'timetable-cell',
            'HDSrsYUN',
            'hoverable',
            'QZw_5QSv',
            'color-0',
            'color-1',
            'color-2',
            'color-3',
            'color-4',
            'color-5',
            'color-6',
            'color-7',
            'color-8',
            'color-9'
        ];
        const krDivs = Array.from(document.querySelectorAll('div.KRfrugFP'));
        return krDivs.map(krDiv => {
            const lessonDivs = Array.from(krDiv.querySelectorAll('div'))
                .filter(div => div.className && div.className.startsWith('FRwl0Met'));
            return lessonDivs.map(div => {
                const classes = div.className.split(' ').filter(cls => !unwanted.includes(cls));
                return classes[0] || null;
            }).filter(Boolean);
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
        nestedLessonClassNames.map(async lessonArr => {
            return Promise.all(
                lessonArr.map(async lesson => {
                    const moduleCode = lesson.split('-')[0];
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
    LEC: 'Lecture',
    TUT: 'Tutorial',
    REC: 'Recitation',
    LAB: 'Laboratory',
};

function parseLesson(lessonStr) {
    const parts = lessonStr.split('-');
    return {
        moduleCode: parts[0],
        lessonTypeShort: parts[1],
        lessonType: LESSON_TYPE_MAP[parts[1]] || parts[1],
        classNo: parts[2]
    };
}

const SEMESTER = 2;
const acadYear = '2024-2025';
(async () => {
    const url = 'https://shorten.nusmods.com?shortUrl=etm1gx';
    const allLessonClassNames = await scrapeLessonClassNamesInKRfrugFP(url);
    console.log('Lesson class names:', allLessonClassNames);

    const allModuleInfos = await getAllModuleInfos(allLessonClassNames, acadYear);

    const summary = allLessonClassNames.map((dayArr, i) =>
        dayArr.map((lessonStr, j) => {
            const parsed = parseLesson(lessonStr);
            const mod = allModuleInfos[i][j];
            if (!mod || !mod.semesterData) return { error: 'No module data' };

            const timetable = [];
            for (const sem of mod.semesterData) {
                if (sem.semester !== SEMESTER || !sem.timetable) continue;
                const matches = sem.timetable.filter(t =>
                    t.lessonType === parsed.lessonType && t.classNo === parsed.classNo
                );
                if (matches.length > 0) {
                    timetable.push(...matches.map(t => ({
                        semester: sem.semester,
                        ...t
                    })));
                }
            }

            return {
                moduleCode: parsed.moduleCode,
                lessonType: parsed.lessonType,
                classNo: parsed.classNo,
                timetable
            };
        })
    );

    console.dir(summary, { depth: null });
})();