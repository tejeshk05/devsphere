# 🌐 DevSphere — AI & Tech Discovery Dashboard

> A mobile-first, dark-themed personal discovery platform for trending GitHub repositories in Artificial Intelligence and modern open-source ecosystems. Featuring a true star velocity calculation engine backed by historical snapshots.

![DevSphere](public/icons/icon-192.png)

---

## ✨ Features

- **⚡ 100% Real Live GitHub Data**: Directly interfaces with the official GitHub REST API v2022-11-28. No fake or mock data.
- **📈 True Star Velocity Calculation Engine**:
  - Replaces misleading cumulative star sorting with an append-only historical snapshot database.
  - Computes mathematically rigorous star growth rates:
    $$\text{velocity} = \frac{\text{Current Stars} - \text{Baseline Stars}}{\text{Elapsed Hours}} \quad (\text{stars/hour})$$
  - Multi-window calculation: **1 hour, 6 hours, 24 hours, and 7 days**.
  - Displays: Current stars, stars gained in window, stars per hour, percentage growth, and first snapshot date.
  - Automatically identifies new repositories with insufficient historical intervals and displays *"Collecting baseline..."*.
- **🧭 4 Purpose-Built Trending Modes**:
  1. **Fastest Growing**: Ranked by verified star velocity (growth per hour).
  2. **New Releases**: Recently created repositories in the chosen window sorted by initial adoption.
  3. **Rising AI Projects**: Repositories in AI verticals exhibiting rapid percentage growth and momentum.
  4. **Popular Projects**: Established category leaders sorted by lifetime cumulative stars.
- **🤖 Background Ingestion Worker**:
  - Scheduled hourly ingestion worker pulls new snapshots across 8 AI verticals.
  - Deduplicates snapshots within the same hourly interval bucket (`UNIQUE(repo_id, interval_bucket)`).
  - Can be triggered automatically in the background or on-demand via `npm run ingest` and the dashboard UI.
- **🔒 Enterprise-Grade Security Hardening**:
  - **Shared-Store Rate Limiter**: Database-backed brute-force protection locks out malicious IPs after 5 failed login attempts for 15 minutes (`HTTP 429 Too Many Requests`).
  - **Private Service Worker Caching**: Authenticated user pages and private bookmark data are strictly excluded from Service Worker caches.
  - **Logout Cache Purge**: Logging out sends `Clear-Site-Data: "cache", "storage"` and notifies the Service Worker to purge all stored offline caches.
  - **Safe External Links**: DOMPurify hooks enforce `target="_blank"` and `rel="noopener noreferrer"` across all rendered markdown documentation, preventing reverse tabnabbing.
- **🎨 Premium Dark UI/UX**: Handcrafted developer dashboard featuring deep-space backgrounds, subtle borders, glowing neon accents, and smooth glassmorphism.
- **📱 Mobile-First & PWA Installable**: Ergonomic bottom navigation bar for mobile phones, horizontal category pill sliders, and full Web App Manifest (`manifest.webmanifest`) support for iOS and Android homescreen installation with PNG and Apple Touch icons.
- **🧠 8 Specialized AI Verticals**:
  1. **AI**: Core artificial intelligence frameworks and foundational research.
  2. **Machine Learning**: Classical & statistical learning engines and tools.
  3. **Generative AI**: Diffusion models, audio synthesis & creative engines.
  4. **LLMs**: Large Language Models, high-throughput inference runtimes (`vLLM`, `llama.cpp`), and fine-tuning suites.
  5. **AI Agents**: Autonomous multi-agent swarms, tool-calling agents, and reasoning systems.
  6. **RAG**: Retrieval-Augmented Generation, vector embeddings, and search indices.
  7. **Computer Vision**: Object detection, segmentation (`YOLO`, `OpenCV`), and visual intelligence.
  8. **MLOps**: Model deployment, feature stores, monitoring, and orchestration pipelines.
- **🔖 Persistent Bookmarks with JSON Backup & Restore**: Save repositories locally in your browser with zero latency. Includes bookmark search, JSON export, and full schema-validated JSON import with duplicate protection.
- **🤖 AI Repository Explainer Architecture**: Powered by Google Gemini 2.0 Flash (with resilient heuristic fallback) that ingests the repository `README.md` and metadata to provide plain-English summaries, architectural highlights, learning roadmaps, and developer use cases.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org) 16 (App Router, Server & Client Components)
- **Language**: [TypeScript](https://www.typescriptlang.org) (Strict type checking)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) v3 + Custom Dark Theme
- **Database**: SQLite (`sql.js` WASM engine with binary persistence) + PostgreSQL support via `pg`
- **Security**: Node.js Web Crypto (HMAC-SHA256 sessions), DOMPurify (HTML sanitization), Shared-store Rate Limiter
- **PWA & Offline**: Custom Service Worker (`public/sw.js`), Web Manifest & PNG icons
- **API**: Official GitHub REST API & Google Gemini 2.0 Flash API

---

## 🗄️ Database Schema

DevSphere uses a portable, append-only historical database:

```sql
-- Repositories metadata table
CREATE TABLE repositories (
  id INTEGER PRIMARY KEY,
  owner TEXT NOT NULL,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  description TEXT,
  language TEXT,
  category TEXT NOT NULL,
  html_url TEXT NOT NULL,
  created_at TEXT NOT NULL,
  pushed_at TEXT,
  first_snapshot_at INTEGER NOT NULL,
  last_snapshot_at INTEGER NOT NULL,
  current_stars INTEGER NOT NULL,
  forks_count INTEGER DEFAULT 0,
  open_issues_count INTEGER DEFAULT 0
);

-- Append-only star snapshots table
CREATE TABLE star_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  repo_id INTEGER NOT NULL,
  stars INTEGER NOT NULL,
  timestamp INTEGER NOT NULL,
  interval_bucket TEXT NOT NULL,
  UNIQUE(repo_id, interval_bucket),
  FOREIGN KEY (repo_id) REFERENCES repositories(id) ON DELETE CASCADE
);
CREATE INDEX idx_snapshots_repo_time ON star_snapshots(repo_id, timestamp);

-- Shared-store brute-force login rate limiting
CREATE TABLE auth_rate_limits (
  key TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 0,
  locked_until INTEGER NOT NULL DEFAULT 0,
  last_attempt_at INTEGER NOT NULL
);
```

---

## 🚀 Beginner-Friendly Quickstart Guide

Follow these simple steps to run DevSphere on your local machine:

### 1. Prerequisites
Ensure you have **Node.js** (v18.17+ or v20/v22) installed on your computer:
```bash
node -v
npm -v
```

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/devsphere.git
cd devsphere
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env.local
```
*(On Windows PowerShell, run: `Copy-Item .env.example .env.local`)*

Open `.env.local` in your editor:
```env
# 1. Private Login Secret
DEVSPHERE_ACCESS_KEY=your-secure-access-key-here
AUTH_SESSION_SECRET=your-random-32-char-session-secret-vault
AUTHORIZED_ACCOUNT_NAME="D. Tejesh Kumar"

# 2. GitHub Token (Server-Side Only - unlocks 5,000 req/hr)
# Generate at: https://github.com/settings/tokens
GITHUB_TOKEN=ghp_yourPersonalAccessTokenHere

# 3. Gemini API Key (Server-Side Only)
# Get a free key at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere
```

### 5. Run Ingestion Worker (Optional)
Seed or pull the latest snapshot data:
```bash
npm run ingest
```

### 6. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser and enter your `DEVSPHERE_ACCESS_KEY`.

---

## 🧪 Verification & Test Commands

DevSphere includes an automated test runner for all Phase 3 features:

```bash
# Run complete verification test suite
npx tsx scripts/run-all-tests.ts

# Test database persistence and velocity formulas
npm run test:db

# Run hourly ingestion manually
npm run ingest

# Run TypeScript compilation check
npx tsc --noEmit

# Run Next.js production build
npm run build
```

---

## 🔒 Security Architecture

- **HMAC-SHA256 Session Tokens**: Universal Web Crypto API (`crypto.subtle`) tokens prevent token spoofing, replay attacks, and cookie forgery across both Edge Middleware and API routes.
- **Database-Backed Rate Limiting**: Tracks failed authentication attempts in a persistent table. 5 failed attempts trigger a 15-minute IP lockout with `HTTP 429 Too Many Requests` and `Retry-After: 900`.
- **Zero Client Leakage**: All GitHub tokens and Gemini API keys reside strictly on the server; client bundles contain zero secrets.
- **DOMPurify HTML Sanitization & Safe External Links**: Raw GitHub README documents are stripped of malicious script injection, onerror triggers, and iframe traps, while ensuring all external links enforce `target="_blank"` and `rel="noopener noreferrer"`.
- **Service Worker Cache Isolation**: Sensitive authenticated navigation HTML shells are never stored in Service Worker caches; logging out triggers complete cache deletion via `Clear-Site-Data`.

---

## 📄 License

[MIT License](LICENSE). Copyright (c) 2026 D. Tejesh Kumar. Crafted for modern AI engineers and open-source contributors.
