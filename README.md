# Internaway

Internaway is a full-stack web application that connects students with internship opportunities. It uses a React frontend, a Node.js backend server, and a Python FastAPI service for tasks such as verification and processing.

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

---

### 2. Backend Setup

#### a. Node.js Server

Navigate to the backend directory and install the required Node.js dependencies:

```bash
cd backend
npm install
```

Start the Node.js server:

```bash
node server.js
```

Ensure that the backend contains:
- `module/User.js` – defines the user schema
- `routes/` – contains route files
- `services/` – contains service logic

#### b. FastAPI Service

Navigate to the FastAPI service directory:

```bash
cd backend/api
```

Start the FastAPI server:

```bash
uvicorn verify:app --reload
```

---

### 3. Frontend Setup

Navigate to the frontend directory and install the React dependencies:

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm start
```

Your React components should be located in `src/pages`, and CSS files in `src/styles`.

---

### 4. Python Directory

The `python/` directory is used for a standalone FastAPI service or other Python-based utilities. It must include the following files:

- `.env`
- `app.py`
- `requirements.txt`

Install the required Python packages using:

```bash
pip install -r requirements.txt
```

Run the service with:

```bash
python app.py
```

---

## Dependency Files in Version Control

You should commit `package.json` and `package-lock.json` to your repository. These files ensure consistent package versions across different environments.

To include them:

```bash
git add package.json package-lock.json
git commit -m "Add project dependencies"
git push origin main
```
