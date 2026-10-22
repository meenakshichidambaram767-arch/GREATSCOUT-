# GreatScout — Local Development Setup Guide

**Tagline:** Scout Smart, Build Better.

---

## 1. Prerequisites

Before installing GreatScout locally, ensure you have:
- **Python**: Version 3.10 to 3.14 (CPython AMD64).
- **Node.js**: Version 18.0 or higher.
- **npm**: Version 9.0 or higher.
- **Git**: For version control.

---

## 2. Quickstart (Under 3 Minutes)

### Step 1: Clone and Navigate to the Repository
```bash
git clone https://github.com/your-org/greatscout.git
cd greatscout
```

### Step 2: Backend Setup
```bash
# 1. Create a Python virtual environment
python -m venv backend/venv

# 2. Activate virtual environment
# On Windows (PowerShell):
.\backend\venv\Scripts\Activate.ps1
# On Linux/macOS:
source backend/venv/bin/activate

# 3. Install backend dependencies
pip install -r backend/requirements.txt

# 4. Initialize SQLite database and run migrations
python -m alembic upgrade head

# 5. Seed the database with initial demo opportunities & evidence
python backend/scripts/seed.py

# 6. Start the FastAPI development server
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```
Backend API will be running at: `http://127.0.0.1:8000`  
Interactive Swagger docs: `http://127.0.0.1:8000/docs`

---

### Step 3: Frontend Setup
Open a separate terminal window:
```bash
cd frontend

# 1. Install frontend dependencies
npm install

# 2. Launch Vite development server
npm run dev
```
Frontend web application will be accessible at: `http://localhost:5173`

---

## 3. Database Modes (SQLite vs PostgreSQL)

GreatScout includes dual database support:

| Environment | Database Engine | Vector Extension | Config File / URL |
|---|---|---|---|
| **Local Development** | SQLite (`greatscout.db`) | JSON Vector Fallback Adapter | `DATABASE_URL=sqlite+aiosqlite:///./greatscout.db` |
| **Production / Docker** | PostgreSQL 16 | native `pgvector` extension | `DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/greatscout` |

The SQLite adapter automatically serializes 384-dimensional embeddings into JSON text fields while maintaining full compatibility with the SQLAlchemy schema.

---

## 4. Running Automated Tests

### Run Backend Unit & Integration Tests (Pytest)
```bash
./backend/venv/Scripts/python -m pytest backend/tests -v
```
Expected output: **31 passed in < 2 seconds**.

### Run Frontend Component Tests (Vitest)
```bash
cd frontend
npm test
```
Expected output: **2 passed test files (3 tests passed)**.

### Run Production Build Verification
```bash
cd frontend
npm run build
```
Expected output: Clean distribution artifacts generated in `frontend/dist/`.

---

## 5. Environment Variables (`.env`)

A default `.env` file is generated automatically. To customize settings, edit `.env`:

```env
# Application Settings
PROJECT_NAME="GreatScout"
ENVIRONMENT="development"
DEBUG=true

# Database (Default: local zero-config SQLite)
DATABASE_URL="sqlite+aiosqlite:///./greatscout.db"

# Optional External API Tokens (for live scraping)
PRODUCT_HUNT_API_TOKEN=""
REDDIT_USER_AGENT="GreatScoutMarketIntel/1.0"
```
