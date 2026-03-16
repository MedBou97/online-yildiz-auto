const path = require("path");

// ──────────────────────────────────────────────────────────
// Shared settings
// ──────────────────────────────────────────────────────────

/** Dedicated Chrome profile folder – keeps session cookies separate from
 *  your normal Chrome profile. Created automatically on first run. */
const profileDir = path.join(__dirname, "chrome-profile");

// ──────────────────────────────────────────────────────────
// Class definitions
// ──────────────────────────────────────────────────────────
// To add a new class, copy one of the objects below and fill in:
//   id        – short slug used as the CLI argument (e.g. node attend.js <id>)
//   name      – human-readable label shown in console output
//   url       – direct URL of the lesson-program page
//   schedule  – for documentation / Task Scheduler reference only
//               dayOfWeek: 0=Sunday 1=Monday … 6=Saturday
// ──────────────────────────────────────────────────────────
const classes = [
  // Example class definition:
  {
    id: "turkce2",
    name: "Türkçe 2",
    url: "https://online.yildiz.edu.tr/?transaction=LMS.EDU.LessonProgram.ViewLessonProgramAsStudent/XXXXX/0",
    schedule: { dayOfWeek: 1, hour: 11, minute: 0 },
  },

  // ── Add more classes here ──────────────────────────────
  // {
  //   id: 'matematik',
  //   name: 'Matematik',
  //   url: 'your class url here (the URL you see after clicking the class in the LMS dashboard)',
  //   schedule: { dayOfWeek: 3, hour: 14, minute: 0 },
  // },
];

module.exports = { profileDir, classes };
