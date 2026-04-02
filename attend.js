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
const fs = require("fs/promises");
const path = require("path");
const { profileDir, classes } = require("./config");

// How long (ms) to wait for the "Canlı Derse Katıl" button to appear.
const JOIN_BUTTON_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes

// How long (ms) to keep the browser open after clicking join.
const STAY_OPEN_MS = 2 * 60 * 1000; // 2 minutes

// How long (ms) to wait for the browser to launch before giving up.
// Chrome can hang indefinitely when the Windows screen is locked; this cap
// ensures the process exits cleanly instead of waiting forever.
const LAUNCH_TIMEOUT_MS = 80_000; // 80 seconds

const JOIN_BUTTON_SELECTOR = "text=Derse Katıl";
const LOG_FILE_PATH = path.join(__dirname, "ytu-automation-scripts.log");

function formatLogTimestamp(date = new Date()) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

async function writeLogLine(message) {
  const line = `------ ${formatLogTimestamp()}  ${message}`;
  await fs.appendFile(LOG_FILE_PATH, `${line}\n`, "utf8");
}

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

  // Write to the log file immediately – this is visible even when the
  // console window stays blank due to Windows locked-session rendering.
  await writeLogLine(`started ${classConfig.name}`);

  // ── Browser launch ────────────────────────────────────────────────────────
  // When the Windows screen is locked, Chrome can hang indefinitely during
  // launch (GPU / display-context unavailable).  The extra args below let
  // Chrome run without hardware acceleration, which avoids the hang.  We
  // also race against an explicit timeout so the process never stalls
  // silently until the join-button timeout fires.
  let context;
  try {
    const launchPromise = chromium.launchPersistentContext(profileDir, {
      channel: "chrome", // Uses your installed Google Chrome
      headless: false, // Visible window so you can see what's happening
      args: [
        "--start-maximized",
        "--disable-gpu", // avoids GPU hang in locked session
        "--disable-software-rasterizer", // fall back to CPU rasteriser
        "--no-default-browser-check", // skip "make Chrome default" prompt
        "--no-first-run", // skip first-run wizard
      ],
      viewport: null, // Disable fixed viewport when maximised
      timeout: LAUNCH_TIMEOUT_MS,
    });

    // Belt-and-suspenders: race against our own timer in case Playwright's
    // internal timeout doesn't fire (observed on some locked-screen builds).
    const timerPromise = new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `Browser launch timed out after ${LAUNCH_TIMEOUT_MS / 1000}s (screen may be locked)`,
            ),
          ),
        LAUNCH_TIMEOUT_MS,
      ),
    );

    context = await Promise.race([launchPromise, timerPromise]);
  } catch (launchErr) {
    await writeLogLine(
      `launch-failed ${classConfig.name}: ${launchErr.message}`,
    );
    console.error(
      `[${new Date().toLocaleTimeString()}] Browser launch failed: ${launchErr.message}`,
    );
    process.exit(1);
  }

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
    await writeLogLine(`joined ${classConfig.name} clicked Derse katil button`);

    console.log(
      `[${new Date().toLocaleTimeString()}] Button found – clicking…`,
    );
    await page.click(JOIN_BUTTON_SELECTOR);
    await writeLogLine(`joined ${classConfig.name} clicked Derse katil button`);

    console.log(
      `[${new Date().toLocaleTimeString()}] Clicked! Staying open for ${STAY_OPEN_MS / 60_000} minutes…`,
    );
    await page.waitForTimeout(STAY_OPEN_MS);
  } catch (err) {
    await writeLogLine(`error joining ${classConfig.name}`);
    console.error(`[${new Date().toLocaleTimeString()}] Error: ${err.message}`);
  } finally {
    await writeLogLine(`finished ${classConfig.name}`);
    console.log(`[${new Date().toLocaleTimeString()}] Closing browser.`);
    await context.close();
  }
}

main();
