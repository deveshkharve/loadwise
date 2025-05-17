const express = require("express");
const multer = require("multer");
const { formatSuccessResponse, formatErrorResponse } = require("../utils");
const AiParseService = require("../modules/lighthouz.service");
// express router

const router = express.Router();

// multer storage middleware
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./storage");
  },
  filename: function (req, file, cb) {
    // Use the original file name
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });
router.use(upload.any());
// handle uploaded file

router.post("/upload-file", async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    // Assuming only one file is uploaded
    const uploadedFile = req.files[0];
    const filePath = uploadedFile.path;

    const data = await AiParseService.extractLoadNumber(filePath);

    res.json(formatSuccessResponse(data));
  } catch (error) {
    console.error("Error in /upload-file:", error);
    res.status(500).json(formatErrorResponse(error.message));
  }
});

// get all accounts
router.post("/tpay/get-bill-details", async (req, res) => {
  const { loadNumber, requestId } = req.body;

  const data = await AiParseService.extractLoadDetails(requestId, loadNumber);
  res.json(formatSuccessResponse(data));
});

// export router
module.exports = router;
