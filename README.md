# Internaway

Internaway is a full-stack web application that simplifies the management of student internships. It enables students to upload and manage internship documents while allowing coordinators to verify details and maintain centralized records efficiently.

---

## Tech Stack

- **Frontend**: React.js
- **Backend (Student & Admin APIs)**: Node.js with Express
- **Backend (Verification & Email Services)**: Python with FastAPI
- **Database**: MongoDB
- **External Integrations**: Google Drive API, Google Sheets API, OCR API (OCR.space)

---

## Project Structure

```
internaway/
├── backend/
│   ├── api/
│   │   └── verify.py
│   ├── module/
│   │   └── User.js
│   ├── routes/
│   ├── services/
│   └── server.js
│
├── frontend/
│   └── src/
│       ├── pages/
│       └── styles/
│
├── python/
│   ├── .env
│   ├── app.py
│   └── requirements.txt
│
├── package.json
├── package-lock.json
└── README.md
```

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/internaway.git
cd internaway
```

### 2. Backend Setup

#### a. Node.js Server

```bash
cd backend
npm install
node server.js
```

Ensure:
- `module/User.js` – defines the user schema
- `routes/` – contains route files
- `services/` – contains service logic

#### b. FastAPI Service

```bash
cd backend/api
uvicorn verify:app --reload
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Components: `src/pages` | Styles: `src/styles`

### 4. Python Directory

Contains independent services:
- `.env`
- `app.py`
- `requirements.txt`

Install dependencies and run:

```bash
pip install -r requirements.txt
python app.py
```

---
## Application Features

### Student Module

- **Home Page**: Access core modules.
- **Profile Page**: View personal and internship info (static fields only).
- **Edit Details Page**: Update internship details like company, period, stipend, etc.
- **Manage Files Page**: Upload, replace, delete, and download documents with consistent naming.

### Coordinator Module

- **Home Page**: View all batches and year-wise data.
- **Internship Details Page**: 
  - View pending and rejected submissions
  - Send emails
  - Search and filter internship data
- **Student Details Page**: 
  - View student records and files
  - Trigger OCR-based verification
  - Update status and remarks to Google Sheets

### Contributors
