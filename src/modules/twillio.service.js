const twilio = require("twilio");
const logger = require("../utils/logger");
const { extractOTPFromText } = require("./openai.service");

const TWILIO_ACCOUNT_SID = process.env.TWILIO_AC_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const getLatestSms = async (fromPhoneNumber = "") => {
  const filter = {
    to: TWILIO_PHONE_NUMBER,
    limit: 5,
  };
  if (fromPhoneNumber) {
    filter.from = fromPhoneNumber;
  }

  const messages = await client.messages.list(filter);

  if (messages.length === 0) throw new Error("No messages found");
  return messages;
};

async function getLatestSmsCode(sentAfter, fromPhoneNumber = "") {
  const maxTries = 5;
  let tries = 0;
  const sentAfterDate = new Date(sentAfter);

  // max 5 tries with 5 seconds sleep, max 30 seconds
  while (tries < maxTries) {
    const messages = await getLatestSms(fromPhoneNumber);
    // filter message where dateSent is after sentAfter
    for (const message of messages) {
      logger.debug(
        `checking for latest message after: ${sentAfter}. got: ${message.dateSent}`
      );
      if (message.dateSent.getTime() > sentAfterDate.getTime()) {
        const match = message.body.match(/\b\d{4,8}\b/);
        if (match) {
          return match[0];
        } else {
          const response = await extractOTPFromText(message.body);
          if (response.otp) {
            return response.otp;
          }
        }
      }
    }

    tries++;
    // sleep for 6 seconds
    await new Promise((resolve) => setTimeout(resolve, 6000));
  }
  return null;
}

module.exports = {
  getLatestSmsCode,
};
