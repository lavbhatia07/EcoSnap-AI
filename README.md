# EcoSnap AI – Snap. Analyze. Reduce.

**EcoSnap AI** is a modern, premium sustainability application designed to identify items, compute their carbon footprint, and generate environmental recommendations using AI Vision.

---

## 🌟 Core Idea & Experience

A user uploads or captures a photo of food, clothing, electronics, or household products. The app immediately:
1. **Identifies** the item using OpenAI Vision API.
2. **Calculates** its carbon footprint by matching the result against a local database containing 30+ items.
3. **Generates** customized advice (why it matters, eco tips, greener alternatives) using GPT.
4. **Visualizes** a comparative savings dashboard.

---

## 🚀 Key Features

* **Apple-Inspired Design:** Clean responsive grids, rounded container cards, glassmorphic loading states, and emerald/teal accents.
* **Drag-and-Drop System:** Responsive drop zone that accepts images via drag-and-drop, traditional file selection, and camera input on mobile browsers.
* **Intelligent Footprint Engine:** Normalized match logic comparing input text with a localized database of 34 sustainability entries.
* **Comparative Savings Visualizer:** Dual animated progress bars representing emissions comparisons and percentage carbon reductions.
* **Analysis History:** A persistent client-side log (using `localStorage`) showing the latest 10 scans with direct click-to-reload support.
* **Robust Security:** File format whitelist (JPG, PNG, WEBP), file size checks (max 10MB limit), and a sliding-window API rate-limiting wrapper.
* **Accessibility Compliant:** High-contrast layout, system native typography, custom focus outlines, full keyboard controls, and complete ARIA landmarks.

---

## 🛠️ Tech Stack

* **Core Framework:** Next.js 15 (App Router, dynamic API handling, static generation)
* **Language:** TypeScript (strict checks)
* **Styling:** Tailwind CSS v4 (system font stack, custom laser scanning keyframe animations)
* **Icons:** Lucide React
* **AI Client:** OpenAI SDK (`gpt-4o-mini` for Vision classification & structured JSON outputs)
* **Testing:** Jest & React Testing Library (compiling under Next.js test pipeline)

---

## 📁 Directory Structure

```text
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts         # Image parsing, validation, rate limiting & OpenAI pipeline
│   ├── globals.css              # Custom Tailwind CSS v4 configurations & system theme
│   ├── layout.tsx               # Root container & SEO metadata headers
│   └── page.tsx                 # Core Landing, scanner console & history wrapper
├── components/
│   ├── AnalysisHistory.tsx      # localStorage wrapper for 10 historical scans
│   ├── CarbonCard.tsx           # Visual carbon values, units, and rating badges (Excellent/Moderate/High)
│   ├── ImageUploader.tsx        # Drag & drop upload controls & mobile camera capture
│   ├── LoadingScanner.tsx       # Laser scanning animation with rotating status prompts
│   └── ResultsDashboard.tsx     # Diagnostic grids, comparisons, and AI text cards
├── data/
│   └── carbonDatabase.ts        # Database of 34 items containing categories, values, and alternatives
├── lib/
│   ├── carbonCalculator.ts      # String normalization & database fuzzy search algorithms
│   └── openai.ts                # OpenAI SDK wrappers for vision and completion requests
├── types/
│   └── analysis.ts              # Strict TypeScript models
├── tests/
│   ├── carbon.test.ts           # Calculator, fuzzy match, and database integrity unit tests
│   └── uploader.test.tsx        # Uploader rendering and button presence tests
├── .env.example                 # Environment variables checklist
├── jest.config.js               # Jest environment settings
└── package.json                 # Core scripts and project package dependencies
```

---

## 🏃 Local Setup & Development

### 1. Pre-requisites
Ensure Node.js (v18+) is installed on your system.

### 2. Install Dependencies
```bash
npm install
```

### 3. Add Environment Variables
Create a `.env.local` file in the root directory:
```env
OPENAI_API_KEY=your_actual_openai_api_key_here
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

---

## 🧪 Testing

We use Jest and React Testing Library to verify application logic.

Run the test suite:
```bash
npm test
```

Build the production bundle:
```bash
npm run build
```

---

## ☁️ Vercel Deployment

EcoSnap AI is fully optimized for immediate serverless deployment on Vercel.

### Option 1: Via Vercel CLI
If you have Vercel CLI installed:
1. Log in to Vercel:
   ```bash
   npx vercel login
   ```
2. Initialize project & deploy:
   ```bash
   npx vercel
   ```
3. Set the environment variable when prompted or via the Vercel dashboard:
   * Key: `OPENAI_API_KEY`
   * Value: `your_openai_api_key_here`
4. Promote to production:
   ```bash
   npx vercel --prod
   ```

### Option 2: Via Vercel Dashboard
1. Push this repository to GitHub.
2. Link your GitHub account to Vercel and import the repository.
3. Under **Environment Variables**, add:
   * **Key:** `OPENAI_API_KEY`
   * **Value:** `your_openai_api_key_here`
4. Click **Deploy**. Vercel will automatically build the Next.js production bundle and host it at a generated live URL.
