/**
 * setup.js – First-run login helper.
 *
 * Run this ONCE to log in to online.yildiz.edu.tr inside the dedicated
 * automation Chrome profile. Your session/cookies will be saved to
 * ./chrome-profile/ and reused by attend.js on every future run.
 *
 * Steps:
 *   1. node setup.js
 *   2. The browser opens with the Playwright Inspector.
 *   3. Log in manually in the browser window.
 *   4. Once logged in, click "Resume" in the Playwright Inspector.
 *   5. The browser closes and your session is saved.
 */

const { chromium } = require("playwright");
const { profileDir } = require("./config");

async function main() {
  console.log("Launching Chrome with automation profile for first-time login…");
  console.log(`Profile dir: ${profileDir}`);
  console.log("");
  console.log("INSTRUCTIONS:");
  console.log("  1. Log in to the site in the browser window that opens.");
  console.log(
    '  2. After logging in successfully, click "Resume" in the Playwright Inspector.',
  );
  console.log(
    "  3. The browser will close and your session will be saved for future runs.",
  );
  console.log("");

  const context = await chromium.launchPersistentContext(profileDir, {
    channel: "chrome",
    headless: false,
    args: ["--start-maximized"],
    viewport: null,
  });

  const page = context.pages()[0] ?? (await context.newPage());

  await page.goto("https://online.yildiz.edu.tr/", {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });

  // pause() opens the Playwright Inspector – you control when to continue.
  await page.pause();

  console.log("Login session saved. You can now run: node attend.js <classId>");
  await context.close();
}

main().catch((err) => {
  console.error("setup.js error:", err.message);
  process.exit(1);
});
