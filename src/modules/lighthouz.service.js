const DocumentModel = require("../db/models/Documents");
const { convertPdfToImages } = require("../utils");
const OpenaiService = require("./openai.service");
const TPayService = require("./tpay.service");
const logger = require("../utils/logger");
const saveDocument = async (data) => {
  const document = new DocumentModel(data);
  await document.save();
  return document;
};

const updateDocument = async (documentId, data) => {
  const document = await DocumentModel.findByIdAndUpdate(documentId, data, {
    new: true,
  });
  return document;
};

const getDocument = async (documentId) => {
  const document = await DocumentModel.findById(documentId);
  return document;
};

const runAiVisionRequest = async (filePath) => {
  let images = [];

  const fileType = filePath.split(".").pop();
  if (fileType === "pdf") {
    // convert pdf to images
    logger.info("Converting pdf to images", filePath);
    images = await convertPdfToImages(filePath);
  } else {
    images.push(filePath);
  }
  // analyze images
  console.log("analyzing images...", images);
  const data = await OpenaiService.analyzeImage(images);
  logger.debug("Image analysis data", { filePath, data });
  return data;
};

const extractLoadNumber = async (filePath) => {
  try {
    const document = await saveDocument({
      document_name: filePath.split("/").pop(), // TODO: optimize this
      document_path: filePath,
    });

    //check file type
    logger.info("processing file", filePath);
    const data = await runAiVisionRequest(filePath);

    return await updateDocument(document._id, {
      status: "id_extracted",
      load_number: data.load_number,
      load_number_detected: data.load_number,
      load_number_confidence: data.confidence,
      load_number_field_name: data.field_name,
    });
  } catch (error) {
    console.error("Error in extractLoadNumber", error);
    await updateDocument(document._id, {
      status: "failed",
    });
    throw error;
  }
};

const extractLoadDetails = async (requestId, loadNumber) => {
  let document = await getDocument(requestId);
  if (!document) {
    throw new Error("Document not found");
  }

  // check if document is already processed
  if (document.status === "success") {
    return document;
  }
  let finalLoadNumber = document.load_number;
  if (loadNumber && loadNumber !== document.load_number_detected) {
    // TODO: update document with new load number
    document = await updateDocument(document._id, {
      load_number: loadNumber,
      load_number_detected: loadNumber,
      load_number_confidence: "high",
    });
    finalLoadNumber = loadNumber;
  }

  try {
    logger.info(
      "processing to extract details from portal",
      document.load_number
    );
    const data = await TPayService.getBillDetails(finalLoadNumber);
    return await updateDocument(document._id, {
      status: data && data.length > 0 ? "success" : "no_details_found",
      load_details: data,
    });
  } catch (error) {
    console.log(error);
    await updateDocument(document._id, {
      status: "failed",
    });
  }
};

module.exports = { extractLoadNumber, extractLoadDetails };
