import React, { useState, useEffect } from "react";
import {
  Typography,
  CircularProgress,
  Alert,
  Box,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
} from "@mui/material";

const LoadDetails = ({ loadBillData, isLoading, error }) => {
  const data = loadBillData ? JSON.parse(loadBillData) : null;
  const status = data?.status;
  console.log("load_details", data?.load_details);
  console.log("status", data?.status);

  return (
    <Paper elevation={2} sx={{ p: 4, mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Load Details
      </Typography>

      {isLoading && (
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <CircularProgress size={20} />
          <Typography variant="body2">Loading...</Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {(!data || !data?.load_details) && (
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Typography variant="body2">Upload a bill to get started</Typography>
        </Box>
      )}
      {data?.load_details && data?.load_details.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}></Typography>
          <TableContainer component={Paper} sx={{ mt: 4 }}>
            <Table size="small" aria-label="display data table">
              <TableHead>
                <TableRow>
                  {Object.keys(data?.load_details[0]).map((key) => (
                    <TableCell key={key} sx={{ fontWeight: "bold" }}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.load_details.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {Object.values(row).map((value, colIndex) => (
                      <TableCell key={colIndex}>{value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      {data?.status && (
        <Alert
          severity={
            status === "success"
              ? "success"
              : status === "failed"
              ? "error"
              : "warning"
          }
          sx={{ mt: 2 }}
        >
          Status: {status.replaceAll("_", " ")}
        </Alert>
      )}
    </Paper>
  );
};

export default LoadDetails;
