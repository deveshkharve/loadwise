const { promises: fs } = require("node:fs");
const logger = require("./logger");

const formatSuccessResponse = (data, ...rest) => {
  return {
    data,
    success: true,
    ...rest,
  };
};

const formatErrorResponse = (error, ...rest) => {
  return {
    error,
    success: false,
    ...rest,
  };
};

const extractJSONFromText = (text) => {
  try {
    const json = JSON.parse(text);
    return json;
  } catch (error) {
    // trying regex to extract json from text
    const jsonRegex = /```json(.*?)```/s;
    const jsonMatch = text.match(jsonRegex);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    return null;
  }
};

const createStorageDir = () => {
  // storage/temp
  const storageDir = "./storage/temp";
  if (!require("fs").existsSync(storageDir)) {
    require("fs").mkdirSync(storageDir, { recursive: true });
  }
  return storageDir;
};

const convertPdfToImages = async (pdfPath) => {
  try {
    const { pdf } = await import("pdf-to-img");
    let counter = 1;
    const images = [];
    const document = await pdf(pdfPath, { scale: 3 });
    for await (const image of document) {
      const imagePath = `./storage/temp/page_${Date.now()}_${counter}.png`;
      await fs.writeFile(imagePath, image);
      images.push(imagePath);
      counter++;
    }
    return images;
  } catch (error) {
    logger.error("Error in convertPdfToImages", error);
    throw error;
  }
};

createStorageDir();

module.exports = {
  formatSuccessResponse,
  formatErrorResponse,
  extractJSONFromText,
  convertPdfToImages,
};
