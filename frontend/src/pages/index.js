import React, { useState } from "react";
import FileUploader from "../components/FileUploader";
import LoadDetails from "../components/LoadDetails";
import axios from "axios";
import { API_CONFIG } from "../config/api";

const Index = () => {
  const testData = null;
  // '{"_id":"6828b9103cd460b3f04d10d6","document_name":"Screenshot 2025-05-17 at 8.20.31â¯PM.png","document_path":"storage/Screenshot 2025-05-17 at 8.20.31â¯PM.png","status":"no_details_found","created_at":"2025-05-17T16:28:00.647Z","updated_at":"2025-05-17T16:28:00.647Z","__v":0,"load_number":"0911098","load_number_confidence":"high","load_number_detected":"0911098","load_number_field_name":"Broker Load #","load_details":[]}';
  const [loadNumber, setLoadNumber] = useState("");
  const [loadRequestId, setLoadRequestId] = useState("");
  const [loadBillData, setLoadBillData] = useState(testData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateLoadNumber = (newValue) => {
    console.log("updateLoadNumber newValue", newValue);
    setLoadNumber(newValue);
  };

  const udpdateRequestId = (value) => {
    console.log("updateRequestId value", value);
    setLoadRequestId(value);
  };

  const fetchBillDetails = () => {
    return loadBillData;
  };
  const clearState = () => {
    setLoadNumber("");
    setLoadRequestId("");
    setLoadBillData(null);
    setIsLoading(false);
    setError(null);
  };

  const getLoadBillDetails = async () => {
    setIsLoading(true);

    console.log("getLoadBillDetails", { loadNumber, loadRequestId });
    const response = await axios.post(API_CONFIG.FETCH_LOAD_BILL_DETAILS, {
      loadNumber: loadNumber,
      requestId: loadRequestId,
    });
    setIsLoading(false);
    if (response.data.success) {
      setLoadBillData(response.data.data);
    } else {
      setError(response.data.message);
    }
    console.log(response.data);
  };
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex justify-center items-center">
      <header className="bg-white dark:bg-gray-800 shadow-sm py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center text-purple-700 dark:text-purple-400">
            Lighthouz
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <FileUploader
          setLoadNumber={updateLoadNumber}
          setLoadRequestId={udpdateRequestId}
          getLoadBillDetails={getLoadBillDetails}
          clearState={clearState}
        />
        <LoadDetails
          loadNumber={loadNumber}
          loadRequestId={loadRequestId}
          // loadBillData={loadBillData}
          loadBillData={loadBillData ? JSON.stringify(loadBillData) : "{}"}
          // loadBillData={fetchBillDetails}
          isLoading={isLoading}
          error={error}
        />

        <hr className="my-4" />
        {loadNumber && (
          <div>
            <p>loadNumber: {loadNumber}</p>
            <p>loadRequestId: {loadRequestId}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
