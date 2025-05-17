const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const { extractJSONFromText, convertPdfToImages } = require("../utils");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const IMAGE_PARSER_SYSTEM_PROMPT = `You are given an image or scanned document of a freight forwarding invoice. Your goal is to extract the load number from the document.

⸻

What to Look For:

The load number may appear under different field labels. Extract it using the most likely field such as:
	•	“Load Number”, “Load ID”, “Load”, “Load #”
	•	“Order Number”, “Order ID”, “Order #”
	•	“Invoice Number”, “Invoice ID”, “Invoice #”
	•	It might also appear as “PO” or “PO #”, but this is less preferred

Avoid using values from fields like “BOL Number” or “Bill of Lading” – they are not load numbers.

⸻

Key Properties:
	•	Load numbers may contain letters and numbers (e.g., LD12345, 1712457).
	•	Be careful with OCR-confusing characters:
	•	0 vs O, 1 vs I, 2 vs Z, 3 vs E, 4 vs A, 5 vs S, 6 vs G, 8 vs B, 9 vs q

⸻

Response Format (JSON Only):

{
  "load_number": "<load_number or null>",
  "field_name": "<label/field where load number was found>",
  "confidence": "high" | "low"
}

If no load number is found, return:

{
  "load_number": null,
  "field_name": null,
  "confidence": "low"
}


⸻

Final Instruction:

Pause and reason. Only return "confidence": "high" if the match is clear from layout or labeling. Use "low" when ambiguous.

`;

const getImageBase64 = (imagePath) => {
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Image file does not exist: ${imagePath}`);
  }
  const imageBase64 = fs.readFileSync(imagePath, { encoding: "base64" });
  return imageBase64;
};

const analyzeImage = async (images) => {
  const systemMessage = {
    role: "system",
    content: IMAGE_PARSER_SYSTEM_PROMPT,
  };

  const imagesRequests = images.map((image) => {
    const imageRequest = {
      type: "input_image",
      image_url: `data:image/png;base64,${getImageBase64(image)}`,
    };
    return imageRequest;
  });

  const userMessageContent = [
    { type: "input_text", text: "extract the load number from the image" },
    ...imagesRequests,
  ];

  const userMessage = {
    role: "user",
    content: userMessageContent,
  };

  // Use Azure OpenAI API instead of OpenAI's public API
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL_NAME || "gpt-4o",
    input: [systemMessage, userMessage],
    temperature: 0,
    text: {
      format: {
        type: "json_object",
      },
    },
  });

  const result = extractJSONFromText(response.output_text);
  return result;
};

const extractOTPFromText = async (text) => {
  const systemMessage = {
    role: "system",
    content: `Extract the OTP from the text and return as a JSON object of format {otp: <otp>}. if not found, return {otp: null}`,
  };

  const userMessage = {
    role: "user",
    content: text,
  };

  // Use Azure OpenAI API instead of OpenAI's public API
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL_NAME || "gpt-4o-mini",
    input: [systemMessage, userMessage],
    temperature: 0,
    text: {
      format: {
        type: "json_object",
      },
    },
  });

  const result = extractJSONFromText(response.output_text);
  return result;
};

module.exports = {
  analyzeImage,
  extractOTPFromText,
};
