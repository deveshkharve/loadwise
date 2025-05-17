const { getLatestSmsCode } = require("./twillio.service");
const { openPage, acceptCookiePopup } = require("../utils/playwright");
const logger = require("../utils/logger");

const TPAY_URLS = {
  LOGIN: "https://secure.triumphpay.com/okta/login",
  BILL_DETAILS: "https://secure.triumphpay.com/payee/paperwork",
  DASHBOARD: "https://secure.triumphpay.com/",
};

const handleTPayEmail = async (page, emailValue) => {
  let success = false;
  const isEmailVisible = await page.getByLabel("Email").isVisible();
  logger.debug("handle if EmailVisible", isEmailVisible);

  if (isEmailVisible) {
    await page.getByLabel("Email").fill(emailValue);
    await page.getByLabel("Email").press("Tab"); // trigger blur/change
    success = true;
  }

  const isEmailEntered =
    (await page.locator(`input[value='${emailValue}']`).count()) > 0;

  logger.debug("handle if isEmailEntered", isEmailEntered);
  const nextButtonVisible = await page.getByRole("button", { name: "Next" });

  if (isEmailEntered && nextButtonVisible) {
    logger.debug("clicking next button for email");
    await page.getByRole("button", { name: "Next" }).click();
    success = true;
  }
  await page.waitForLoadState("domcontentloaded");
  return success;
};

const handleTPayPassword = async (page, passwordValue) => {
  const pwd = await page.locator("input[type='password']");
  const isPwdVisible = await pwd.isVisible();
  logger.debug("handle if isPwdVisible", isPwdVisible);
  if (isPwdVisible) {
    logger.debug("Email submitted, password input appeared.");
    await pwd.focus();
    await pwd.fill(passwordValue);
    await pwd.press("Tab"); // trigger blur/change

    const submitButton = await page.locator(
      "input[type='submit'][value='Verify']"
    );
    const submitButtonVisible = await submitButton.isVisible();
    if (submitButtonVisible) {
      logger.debug("clicking submit button for password");
      await submitButton.click();
    }
  }
};

const handleTPay2FA = async (page) => {
  // <input class="button button-primary" type="submit" value="Receive a code via SMS" data-type="save"></input>
  logger.debug(`handling 2FA`);
  const smsButton = await page.locator("input[value='Receive a code via SMS']");
  const smsButtonVisible = await smsButton.isVisible();
  logger.debug("handle if smsButtonVisible", smsButtonVisible);
  if (smsButtonVisible) {
    const otpSubmitTime = new Date().toISOString();
    if (smsButtonVisible) {
      logger.debug("clicking sms button");
      await smsButton.click();
    }

    // get OTP from twilio
    logger.debug("fetching sms button");
    const otp = await getLatestSmsCode(otpSubmitTime);
    logger.debug("otp>>", otp);
    if (!otp) {
      throw new Error("No OTP found");
    }

    // <input type="text" placeholder="" name="credentials.passcode" id="input106" value="" aria-label="" autocomplete="off">
    const passcodeInput = await page.locator(
      "input[name='credentials.passcode']"
    );
    await passcodeInput.fill(otp);
    await passcodeInput.press("Tab");
    const submitButton = await page.locator(
      "input[type='submit'][value='Verify']"
    );
    const submitButtonVisible = await submitButton.isVisible();
    logger.debug("handle if submitButtonVisible", submitButtonVisible);
    if (submitButtonVisible) {
      logger.debug("clicking submit button");
      await submitButton.click();
    }
  }
};

const tPayLogin = async (context, page, emailValue, passwordValue) => {
  // 1. Fill email and click "Next"
  logger.info("trying to login into tpay portal...");
  let tries = 0;
  await acceptCookiePopup(page);

  while (true && tries < 5) {
    try {
      logger.info("filling email");
      await handleTPayEmail(page, emailValue);
      await page.waitForTimeout(5000);

      // 2. Fill password and click "Sign In"
      logger.info("filling password");
      await handleTPayPassword(page, passwordValue);

      logger.info("filling 2FA");
      await handleTPay2FA(page);
    } catch (error) {
      logger.error("failed to login", error);
      logger.info("retrying...");
    }

    tries++;
  }

  logger.info("Login form submitted, login flow should be complete.");
  // Do something post-login
  await page.waitForLoadState("networkidle");
  console.log("Current URL:", page.url());
  // store all fo the context in a json
  await context.storageState({ path: "auth.json" });
};

const getTableHeaders = async (page) => {
  logger.debug("getting table headers");
  const columnHeaders = await page.locator("div.th.table_table-header-cell");
  const columnHeadersCount = await columnHeaders.count();

  const headers = await Promise.all(
    Array.from({ length: columnHeadersCount }, async (_, i) => {
      const header = await columnHeaders.nth(i);
      return { idx: i, text: await header.textContent() };
    })
  );
  return headers;
};

const extractDetails = async (element, headers) => {
  logger.debug("extracting table row details");
  const rowCells = element.locator("div.td.table_table-cell");
  const rowCellsCount = await rowCells.count();
  const rowOb = {};
  for (let j = 0; j < rowCellsCount; j++) {
    const cell = rowCells.nth(j);
    const cellText = await cell.textContent();
    if (headers[j]["text"] && cellText) {
      rowOb[headers[j]["text"]] = cellText;
    }
  }
  return rowOb;
};

const tPayGetBillDetails = async (page, loadNumber) => {
  logger.info("navigating to bill details page");
  await page.goto(
    `${TPAY_URLS.BILL_DETAILS}?q%5Bload_number_or_invoice_number_cont%5D=${loadNumber}`
  );
  await page.waitForLoadState("networkidle");
  await page.waitForLoadState("domcontentloaded");

  // Re-query the buttons after DOM is updated
  //   < div aria-label="Click Table Row"
  const viewDetailsButtons = await page.locator(
    "div[aria-label='Click Table Row']"
  );
  const count = await viewDetailsButtons.count();
  logger.info(`Found", ${count} 'View details' buttons`);

  if (count === 0) {
    logger.debug("No results found:", loadNumber);
    return [];
  }

  const data = [];
  // column headers
  const headers = await getTableHeaders(page);

  for (let i = 0; i < count; i++) {
    // Re-query to avoid stale reference

    const element = viewDetailsButtons.nth(i);
    const rowOb = await extractDetails(element, headers);
    data.push(rowOb);
  }

  return data;
};

const getBillDetails = async (loadNumber, accountConfig) => {
  //   const loadNumber = "1224f5";
  logger.info("getting bill details for", loadNumber);

  const emailValue = process.env.TPAY_EMAIL;
  const passwordValue = process.env.TPAY_PASSWORD;
  const pageUrl = TPAY_URLS.DASHBOARD;

  const { page, context, close } = await openPage(pageUrl);
  await page.waitForLoadState("networkidle");
  await page.waitForLoadState("domcontentloaded");

  // check if page contains "I Forgot My Password"
  const forgotPassword = await page.locator("text=I Forgot My Password");
  const isLikelyLoginPage = await forgotPassword.isVisible();

  // check if page is redirected to login page
  if (isLikelyLoginPage || page.url() === TPAY_URLS.LOGIN) {
    logger.info("redirected to login page. need to login again");
    await tPayLogin(context, page, emailValue, passwordValue);
  }

  const data = await tPayGetBillDetails(page, loadNumber);
  await close();

  // ensure data is an array
  return Array.isArray(data) ? data : [data];
};

const TPayService = {
  getBillDetails,
};

module.exports = TPayService;
