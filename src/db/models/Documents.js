// require mongoose
const mongoose = require("mongoose");
const moment = require("moment");

const Schema = mongoose.Schema;

const DocumentsSchema = new Schema(
  {
    document_name: {
      type: String,
      required: true,
    },
    document_path: {
      type: String,
      required: true,
    },
    load_number: {
      type: String,
    },
    load_number_detected: {
      type: String,
    },
    load_number_confidence: {
      type: String,
    },
    load_number_field_name: {
      type: String,
    },
    load_details: {
      type: Object,
    },
    status: {
      type: String,
      enum: [
        "uploaded",
        "id_extracted",
        "pending",
        "success",
        "failed",
        "no_details_found",
      ],
      default: "uploaded",
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  { minimize: false }
);

module.exports = mongoose.model("Documents", DocumentsSchema);
