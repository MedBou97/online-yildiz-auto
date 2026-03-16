/**
 * attend.js – Navigate to an online class page and click "Canlı Derse Katıl".
 *
 * Usage:
 *   node attend.js <classId>
 *
 * Example:
 *   node attend.js turkce2
 *
 * Class IDs are defined in config.js.
 * The script uses a persistent Chrome profile so your login session is reused.
 * Run setup.js once first to log in and save the session.
 */

const { chromium } = require("playwright");
const { profileDir, classes } = require("./config");

// How long (ms) to wait for the "Canlı Derse Katıl" button to appear.
const JOIN_BUTTON_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes

// How long (ms) to keep the browser open after clicking join.
const STAY_OPEN_MS = 5 * 60 * 1000; // 5 minutes

const JOIN_BUTTON_SELECTOR = "text=Canlı Derse Katıl";

async function main() {
  const classId = process.argv[2];

  if (!classId) {
    console.error("Usage: node attend.js <classId>");
    console.error("Available classes:", classes.map((c) => c.id).join(", "));
    process.exit(1);
  }

  const classConfig = classes.find((c) => c.id === classId);

  if (!classConfig) {
    console.error(`Unknown class id: "${classId}"`);
    console.error("Available classes:", classes.map((c) => c.id).join(", "));
    process.exit(1);
  }

  console.log(
    `[${new Date().toLocaleTimeString()}] Starting automation for: ${classConfig.name}`,
  );
  console.log(`Profile dir : ${profileDir}`);
  console.log(`URL         : ${classConfig.url}`);

  const context = await chromium.launchPersistentContext(profileDir, {
    channel: "chrome", // Uses your installed Google Chrome
    headless: false, // Visible window so you can see what's happening
    args: ["--start-maximized"],
    viewport: null, // Disable fixed viewport when maximized
  });

  const page = context.pages()[0] ?? (await context.newPage());

  try {
    console.log(
      `[${new Date().toLocaleTimeString()}] Navigating to class page…`,
    );
    await page.goto(classConfig.url, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });

    console.log(
      `[${new Date().toLocaleTimeString()}] Waiting for "${JOIN_BUTTON_SELECTOR}" button…`,
    );
    await page.waitForSelector(JOIN_BUTTON_SELECTOR, {
      timeout: JOIN_BUTTON_TIMEOUT_MS,
    });

    console.log(
      `[${new Date().toLocaleTimeString()}] Button found – clicking…`,
    );
    await page.click(JOIN_BUTTON_SELECTOR);

    console.log(
      `[${new Date().toLocaleTimeString()}] Clicked! Staying open for ${STAY_OPEN_MS / 60_000} minutes…`,
    );
    await page.waitForTimeout(STAY_OPEN_MS);
  } catch (err) {
    console.error(`[${new Date().toLocaleTimeString()}] Error: ${err.message}`);
  } finally {
    console.log(`[${new Date().toLocaleTimeString()}] Closing browser.`);
    await context.close();
  }
}

main();
