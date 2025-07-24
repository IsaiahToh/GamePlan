const { parseLesson, getModuleInfo, getAllModuleInfos } = require("../services/scrapers");

// Mock fetch for getModuleInfo
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ moduleCode: "CS1010", title: "Programming Methodology" }),
  })
);

describe("scrapers service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("parseLesson", () => {
    it("parses a lesson string correctly", () => {
      const lessonStr = "CS1010-LEC-01";
      const parsed = parseLesson(lessonStr);
      expect(parsed).toEqual({
        moduleCode: "CS1010",
        lessonTypeShort: "LEC",
        lessonType: "Lecture",
        classNo: "01",
      });
    });

    it("handles unknown lesson types", () => {
      const lessonStr = "CS1010-XYZ-01";
      const parsed = parseLesson(lessonStr);
      expect(parsed.lessonType).toBe("XYZ");
    });
  });

  describe("getModuleInfo", () => {
    it("fetches module info from NUSMods", async () => {
      const data = await getModuleInfo("2025-2026", "CS1010");
      expect(data).toHaveProperty("moduleCode", "CS1010");
      expect(data).toHaveProperty("title", "Programming Methodology");
      expect(global.fetch).toHaveBeenCalled();
    });

    it("throws if fetch fails", async () => {
      global.fetch.mockResolvedValueOnce({ ok: false, status: 404 });
      await expect(getModuleInfo("2025-2026", "CS4040")).rejects.toThrow("Failed to fetch: 404");
    });
  });

  describe("getAllModuleInfos", () => {
    it("fetches info for all lessons in nested arrays", async () => {
      const nestedLessonClassNames = [
        ["CS1010-LEC-01", "CS1010-TUT-02"],
        ["CS2040-LEC-01"]
      ];
      // Mock fetch to return different modules
      global.fetch.mockImplementation((url) => {
        if (url.includes("CS1010")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ moduleCode: "CS1010" }),
          });
        }
        if (url.includes("CS2040")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ moduleCode: "CS2040" }),
          });
        }
        return Promise.resolve({ ok: false, status: 404 });
      });

      const result = await getAllModuleInfos(nestedLessonClassNames, "2025-2026");
      expect(result[0][0]).toHaveProperty("moduleCode", "CS1010");
      expect(result[1][0]).toHaveProperty("moduleCode", "CS2040");
    });
  });
});