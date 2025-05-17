A full-stack tool to extract load numbers from freight documents using OCR + AI and fetch associated billing details from the TriumphPay portal. Built with Node.js, React, and OpenAI Vision API.

⸻

### 🛠️ Prerequisites

    •	Node.js (v14 or higher)
    •	Access to OpenAI API (for Vision capabilities)
    •	Twilio credentials (for automating 2FA with TriumphPay)
    •	TriumphPay account credentials

### ⚙️ Setup Guide

#### Install Dependencies

Backend

From the project root directory:

```bash
npm install
```

Frontend

Navigate to the frontend folder and install dependencies:

```bash
cd frontend
npm install
```

⸻

#### Setup Environment Variables

Create a .env file in the project root with the following (or follow file `.env.example`):

```bash
PORT=3005
NODE_ENV=development

# MongoDB URI

MONGO_URI=

# TriumphPay Credentials

TPAY_EMAIL=
TPAY_PASSWORD=

# Twilio Configuration (for automating TriumphPay 2FA)

TWILIO_PHONE_NUMBER=
TWILIO_AC_SID=
TWILIO_AUTH_TOKEN=

# OpenAI API Config

OPENAI_API_KEY=
OPENAI_MODEL_NAME=gpt-4o
```

⸻

### 🚀 Running the Application

#### Start Backend Server

```bash
npm start
```

Start Frontend Server

In a new terminal:

```bash
cd frontend
npm start
```

- Frontend available at: http://localhost:3000
- Backend available at: http://localhost:3005
- Logs: stored in the logs/ directory
- Uploaded files: saved in storage/

⸻

#### 📌 Usage

1. Upload a Load Document

- Upload a freight invoice or load-related document.
- The system will extract the load number using OCR + AI, along with a confidence score.
- If the detection is incorrect, manually update the load number before proceeding.

2. Verify & Fetch Bill Details

- After confirming the correct load number, click `Get Load Bill Details`
- The system logs into TriumphPay and retrieves the bill details associated with the load.

3. View Data

- Once retrieved, data is displayed in a tabular format.
- If no data is found or the process fails, you may revise the load number and retry.

⸻

### ⚠️ Known Limitations

1. Character Confusion in OCR

- OCR may misread visually similar characters (e.g., O vs 0, S vs 5, I vs 1), leading to incorrect load number extraction.

2. Scraping Limitations

- Extraction of load number needs to be enhanced by adding a list of valid identifiers.
- Currently only supports TriumphPay.
- Expanding to support other providers would require additional automation or agent-based approaches (e.g., headless browser + workflow agent), but this could increase cost.

3. Scalability

- For large PDF files, we can process pages in small batches and if can break the loop once we find the load number
- To Scale this project, we can introduce queues between resource heavy (time/compute) operations, e.g. we can make the load number and details extraction services as a part of distributed system where the process is executed asynchronously using some message broker and the UI can be extended to use web-sockets or long-polling.
- Dependency on REST APIs for communication, while in demo app the system can manage longer running requests, this becomes a bottleneck in heavy load systems and we might need to consider alternatives like web-sockets.
