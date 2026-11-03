# 🌐 DevSphere — AI & Tech Discovery Dashboard

> A mobile-first, dark-themed personal discovery platform for trending GitHub repositories in Artificial Intelligence and modern open-source ecosystems.

![DevSphere](public/icons/icon-192.png)

---

## ✨ Features

- **⚡ 100% Real Live GitHub Data**: Directly interfaces with the official GitHub REST API v2022-11-28. No fake or mock data.
- **🚀 Dual Discovery Engine (Velocity vs All-Time)**:
  - **Breakout Velocity**: Discovers newly created repositories (`created:>threshold`) surging within your selected window (Past 24h, 7d, 30d).
  - **All-Time Heavyweights**: Tracks established category leaders with active commits (`pushed:>threshold`).
  - Transparent ranking methodology explained directly in the dashboard UI.
  - Infinite / Multi-page loading with pagination support.
- **🎨 Premium Dark UI/UX**: Handcrafted developer dashboard featuring deep-space backgrounds, subtle borders, glowing neon accents, and smooth glassmorphism.
- **📱 Mobile-First & PWA Installable**: Ergonomic bottom navigation bar for mobile phones, horizontal category pill sliders, offline caching with a dedicated Service Worker (`/sw.js`), and full Web App Manifest (`manifest.webmanifest`) support for iOS and Android homescreen installation with PNG and Apple Touch icons.
- **🧠 8 Specialized AI Verticals**:
  1. **AI**: Core artificial intelligence frameworks and foundational research.
  2. **Machine Learning**: Classical & statistical learning engines and tools.
  3. **Generative AI**: Diffusion models, audio synthesis & creative engines.
  4. **LLMs**: Large Language Models, high-throughput inference runtimes (`vLLM`, `llama.cpp`), and fine-tuning suites.
  5. **AI Agents**: Autonomous multi-agent swarms, tool-calling agents, and reasoning systems.
  6. **RAG**: Retrieval-Augmented Generation, vector embeddings, and search indices.
  7. **Computer Vision**: Object detection, segmentation (`YOLO`, `OpenCV`), and visual intelligence.
  8. **MLOps**: Model deployment, feature stores, monitoring, and orchestration pipelines.
- **⏱️ Flexible Trending Windows**: Daily (past 24h), Weekly (past 7d), and Monthly (past 30d) velocity filters.
- **🔖 Persistent Bookmarks with JSON Backup & Restore**: Save repositories locally in your browser with zero latency. Includes bookmark search, JSON export, and full schema-validated JSON import with duplicate protection.
- **📄 Deep Repository Detail Pages**: View metadata, stargazers, forks, open issues, commit velocity, and rendered `README.md` documents securely sanitized with DOMPurify against XSS.
- **🤖 AI Repository Explainer Architecture**: Powered by Google Gemini (with resilient heuristic fallback) that ingests the repository `README.md` and file structure to provide plain-English summaries, architectural highlights, learning roadmaps, and developer use cases.
- **🔒 Cryptographic Session Authentication**: Protect your private cloud deployment. Only you (the authorized owner) can access the dashboard using HMAC-SHA256 signed session tokens verified via Next.js Middleware and direct API guards with secure HTTP-only cookies.
- **🛡️ Server-Side Secret Protection**: Keeps all GitHub tokens and AI API keys on the server. No secrets are ever leaked to client bundles.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org) 16 (App Router, Server & Client Components)
- **Language**: [TypeScript](https://www.typescriptlang.org) (Strict type checking)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) v3 + Custom Dark Theme
- **Icons**: [Lucide React](https://lucide.dev) + Custom Vector Icons
- **Security**: Node.js `crypto` (HMAC-SHA256 sessions) & `DOMPurify` (HTML sanitization)
- **Offline & PWA**: Custom Service Worker (`public/sw.js`), Web Manifest & PNG icons
- **API**: Official GitHub REST API & Google Gemini API

---

## 🚀 Beginner-Friendly Quickstart Guide

Follow these simple steps to run DevSphere on your local machine:

### 1. Prerequisites
Ensure you have **Node.js** (v18.17+ or v20/v22) installed on your computer.
Check with:
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

Open `.env.local` in your editor and configure your settings:
```env
# 1. Private Login Secret (Choose your personal access key)
DEVSPHERE_ACCESS_KEY=your-secure-access-key-here
AUTH_SESSION_SECRET=your-random-32-char-session-secret-vault
AUTHORIZED_ACCOUNT_NAME="D. Tejesh Kumar"

# 2. GitHub Token (Optional but Recommended)
# Unauthenticated GitHub requests are limited to 60/hr.
# Adding a free personal token unlocks 5,000 requests/hr!
# Generate one at: https://github.com/settings/tokens
GITHUB_TOKEN=ghp_yourPersonalAccessTokenHere

# 3. Gemini API Key (Optional for AI Explanations)
# Get a free key at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere
```

### 5. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

When prompted by the login vault, enter your `DEVSPHERE_ACCESS_KEY`.

---

## 📱 Installing DevSphere as a PWA on Your Phone

1. Deploy DevSphere to Vercel or any HTTPS host (e.g. `https://your-devsphere.vercel.app`).
2. Open the URL in Safari (iOS) or Chrome (Android).
3. **On iOS (Safari)**: Tap the **Share** button (box with upward arrow) -> Tap **"Add to Home Screen"**.
4. **On Android (Chrome)**: Tap the three dots menu -> Tap **"Install App"** (or click the **"Install App"** button in DevSphere's top header).
5. DevSphere will now run as a full-screen, standalone app on your smartphone with instant launch, offline cache fallback, and homescreen integration!

---

## 🏗️ Project Architecture & File Structure

```
devsphere/
├── public/
│   ├── icons/
│   │   ├── apple-touch-icon.png  # Apple homescreen icon (180x180)
│   │   ├── icon-192.png          # PWA raster icon (192x192)
│   │   ├── icon-512.png          # PWA high-res raster icon (512x512)
│   │   ├── icon-192.svg          # Vector icon
│   │   └── icon-512.svg          # Vector high-res icon
│   ├── sw.js                     # Offline caching Service Worker
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai/explain/       # Server endpoint for AI codebase analysis
│   │   │   ├── auth/             # Login, logout, session status endpoint
│   │   │   └── github/
│   │   │       ├── repo/         # Server endpoint for repo details & README
│   │   │       └── trending/     # Server endpoint for GitHub trending search
│   │   ├── ai-explainer/         # AI Architecture Explainer Studio page
│   │   ├── auth-status/          # Security & Owner authorization page
│   │   ├── bookmarks/            # Bookmarks page with JSON Export & Import
│   │   ├── login/                # Private developer authentication vault
│   │   ├── repo/[owner]/[name]   # Dynamic repository detail page
│   │   ├── globals.css           # Dark theme & glassmorphic utilities
│   │   ├── layout.tsx            # Root layout (Sidebar + Mobile Nav + PWA)
│   │   ├── manifest.ts           # Native Next.js Web App Manifest
│   │   └── page.tsx              # Main Discovery Dashboard (Velocity / All-Time)
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── AIExplainModal.tsx     # Interactive AI architecture drawer
│   │   │   ├── CategoryPills.tsx      # Swipeable 8-category selector
│   │   │   ├── RepoCard.tsx           # Repository card with live metrics
│   │   │   ├── RepoCardSkeleton.tsx   # Shimmer loading skeleton
│   │   │   └── TimeframeSelector.tsx  # Daily, Weekly, Monthly toggle
│   │   ├── layout/
│   │   │   ├── Header.tsx             # Responsive header with live search
│   │   │   ├── MobileNav.tsx          # Fixed bottom navigation for phones
│   │   │   └── Sidebar.tsx            # Desktop developer sidebar
│   │   └── pwa/
│   │       └── ServiceWorkerRegister.tsx # Client-side Service Worker registration
│   ├── context/
│   │   └── BookmarkContext.tsx   # Persistent LocalStorage bookmarks state & import
│   ├── lib/
│   │   ├── ai/explainer.ts       # Gemini AI & heuristic analyzer engine
│   │   ├── auth.ts               # Cryptographic HMAC session tokens & constant-time validation
│   │   ├── constants.ts          # Categories, color maps & timefilters
│   │   ├── github.ts             # GitHub search query builder & server cache
│   │   └── utils.ts              # Relative time & number formatters
│   ├── middleware.ts             # Edge middleware private auth gatekeeper
│   └── types/
│       └── github.ts             # TypeScript interfaces for repos & APIs
├── .env.example                  # Example environment variables (committed)
├── .env.local                    # Local environment secrets (git-ignored)
├── LICENSE                       # Official MIT License file
├── next.config.ts                # Next.js App Router configuration
├── package.json
├── tailwind.config.ts            # Dark theme Tailwind configuration
└── tsconfig.json
```

---

## 🔒 Security Best Practices

- **HMAC-SHA256 Session Tokens**: Uses Node.js `crypto` with `createHmac` and random entropy to prevent token spoofing, replay attacks, and cookie forgery.
- **Double-Layered Auth Guards**: Enforced both at the Edge Middleware level and directly inside internal API routes via `verifyRequestAuth(request)`.
- **Zero Client Leakage**: All GitHub tokens and Gemini API keys reside strictly on the server; client bundles contain zero secrets.
- **Fail-Secure Defaults**: In production environments (`NODE_ENV=production`), the application refuses to start or authenticate if master access keys or session secrets are unset.
- **DOMPurify HTML Sanitization**: Raw GitHub README documents are stripped of malicious script injection, onerror triggers, and iframe traps before client rendering.
- **Hardened Cookies**: Auth cookies utilize `HttpOnly`, `SameSite=Lax`, and `Secure` (in production) flags with a 30-day bounded expiration.

---

## 📄 License

[MIT License](LICENSE). Copyright (c) 2026 D. Tejesh Kumar. Crafted for modern AI engineers and open-source contributors.
