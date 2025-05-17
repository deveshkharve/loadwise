import React, { useRef, useState } from "react";
import {
  Button,
  Container,
  Typography,
  Box,
  TextField,
  Input,
  Paper,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { API_CONFIG } from "../config/api";

const FileUploader = ({
  setLoadNumber,
  setLoadRequestId,
  getLoadBillDetails,
  clearState,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [loadDetails, setLoadDetails] = useState({});
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setError("");
    setLoadDetails(null);
    clearState();
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setError("Only PDF or image files are allowed.");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const result = await axios.post(API_CONFIG.UPLOAD_FILE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const requestData = result.data["data"];
      setLoadDetails(requestData);
      setLoadNumber(requestData.load_number);
      setLoadRequestId(requestData._id);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError("Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };

  const renderLoadNumberText = () => {
    if (!loadDetails.load_number) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          <strong>No load number detected.</strong> Please check the file or
          enter the load number manually.
        </Alert>
      );
    }

    return (
      <Alert
        severity={
          loadDetails.load_number_confidence === "high" ? "success" : "warning"
        }
        sx={{ mt: 2 }}
      >
        {loadDetails.load_number_confidence === "high" ? (
          <>Load number detected with high confidence.</>
        ) : (
          <>
            Please check the load number, detected with{" "}
            <strong>{loadDetails.load_number_confidence}</strong> confidence.
          </>
        )}
      </Alert>
    );
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom>
            Upload PDF or Image
          </Typography>

          <Input
            type="file"
            inputRef={fileInputRef}
            inputProps={{ accept: "application/pdf,image/*" }}
            onChange={handleFileChange}
            fullWidth
            disableUnderline
            sx={{ mb: 2 }}
          />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={uploading}
            fullWidth
            startIcon={uploading && <CircularProgress size={20} />}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </form>

        {loadDetails && Object.keys(loadDetails).length > 0 && (
          <Box mt={4}>
            {renderLoadNumberText()}

            <TextField
              label="Load Number"
              variant="outlined"
              defaultValue={loadDetails.load_number || ""}
              onChange={(e) => setLoadNumber(e.target.value)}
              fullWidth
              sx={{ mt: 2 }}
            />

            <Button
              onClick={() => {
                if (typeof getLoadBillDetails === "function") {
                  getLoadBillDetails();
                }
              }}
              variant="contained"
              color="secondary"
              fullWidth
              sx={{ mt: 2 }}
            >
              Get Load Bill Details
            </Button>
          </Box>
        )}

        <Divider sx={{ my: 4 }} />
      </Paper>
    </Container>
  );
};

export default FileUploader;
