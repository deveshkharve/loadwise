const { chromium } = require("playwright");
const fs = require("fs");
const logger = require("./logger");
// Configuration
const DEFAULT_TIMEOUT = 30000;
const HEADLESS = true;

/**
 * Creates and returns a new browser instance
 */
async function createBrowser() {
  return await chromium.launch({
    headless: HEADLESS,
    timeout: DEFAULT_TIMEOUT,
  });
}

/**
 * Opens a new page with the specified URL
 */
async function openPage(url, browser = null) {
  logger.info("Opening page:", url);
  const shouldCloseBrowser = !browser;
  browser = browser || (await createBrowser());

  // check if auth.json exists
  const contextConfig = fs.existsSync("auth.json")
    ? { storageState: "auth.json" }
    : {};

  const context = await browser.newContext(contextConfig);
  const page = await context.newPage();
  //   await page.goto(url, { timeout: DEFAULT_TIMEOUT });
  await page.goto(url, { waitUntil: "domcontentloaded" });

  return {
    browser,
    page,
    context,
    close: async () => {
      await page.close();
      if (shouldCloseBrowser) await browser.close();
    },
  };
}

/**
 * Accept cookie popup if shown
 */
async function acceptCookiePopup(page, selector = 'button:has-text("Accept")') {
  try {
    logger.debug("accepting cookie popup");
    const button = await page.locator(selector);
    if (await button.isVisible({ timeout: 5000 })) {
      logger.debug("Cookie popup found. Clicking accept.");
      await button.click();
    }
  } catch {
    logger.info("No cookie popup appeared.");
  }
}

/**
 * Fill input with a given value
 */

async function fillInputBySelector(page, selector, value) {
  const input = await page.locator(selector);
  logger.debug(`Filling input [${selector}] with: ${value}`);
  await input.waitFor({ state: "visible", timeout: DEFAULT_TIMEOUT });
  await input.fill(value);
  // move out of focus
  await page.click("body");
}

/**
 * Clicks an element and waits for navigation or state change
 */
async function clickBySelector(page, selector) {
  const button = await page.locator(selector);
  logger.debug(`Clicking element [${selector}]`);
  await button.waitFor({ state: "visible", timeout: DEFAULT_TIMEOUT });

  const navigationPromise = page
    .waitForNavigation({ timeout: 10000 })
    .catch(() => null);

  await Promise.all([navigationPromise, button.click({ force: true })]);

  logger.debug("Click complete. URL is now:", page.url());
}

module.exports = {
  createBrowser,
  openPage,
  fillInputBySelector,
  clickBySelector,
  acceptCookiePopup,
};
