# Social Growth AI

> **Production-oriented social media analytics, public profile audits, and AI-powered organic growth platform.**

Social Growth AI enables creators, brands, and agencies to enter any supported social media handle or public URL (Instagram, YouTube, TikTok, Facebook, X/Twitter), inspect verified public engagement benchmarks and historical growth curves, and generate high-retention captions, 3-second visual hooks, 45-second viral scripts, and weekly content schedules powered by Gemini AI.

---

## 1. Core Principles & Organic Compliance Manifesto

- **Zero Bot Manipulation**: We never sell fake followers, fake views, bot engagement, or credential scrapers.
- **Data Integrity**: We never fabricate profile metrics. If an API permission or lifetime view metric is restricted to the account owner (e.g. private reels saves, impression CTR), it is transparently labeled as **"Unavailable"** alongside its data source and last-updated timestamp.
- **Zero Credential Theft**: We never request a user's social media password or scrape private data. All platform integrations use official authorized APIs or public metadata indexes.

---

## 2. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion.
- **Backend**: Node.js 22, Express 4.21, TypeScript (`tsx`), REST API architecture.
- **Database**: 
  - Production: PostgreSQL with Prisma ORM (`prisma/schema.prisma`).
  - Embedded/Local: Fast file-backed persistent store (`.data/db.json`) with zero external DB dependencies for instant setup.
- **AI Engine**: Google Gemini API (`@google/genai`, model `gemini-3.8-flash`) with structured offline fallback engine.
- **Mobile / Android**: Capacitor native packaging with Android SDK 34 (`com.socialgrowth.ai`), edge-to-edge system navigation, and back-button lifecycle hooks.
- **Testing**: Node built-in test runner (`tsx --test`) & Playwright CLI.
- **CI / CD**: GitHub Actions (`.github/workflows/ci.yml` and `.github/workflows/android.yml`).

---

## 3. Project Directory Structure

```text
├── .github/
│   └── workflows/
│       ├── ci.yml               # Linting, type check, unit tests, web build
│       └── android.yml          # Android SDK 34, JDK 17, Gradle assembleDebug APK
├── android/                     # Capacitor native Android Studio project
│   ├── app/
│   │   ├── src/main/AndroidManifest.xml
│   │   ├── src/main/java/com/socialgrowth/ai/MainActivity.java
│   │   └── src/main/res/values/ (strings, styles, colors)
│   ├── build.gradle
│   └── settings.gradle
├── prisma/
│   └── schema.prisma            # Production PostgreSQL Prisma ORM schema
├── src/
│   ├── components/
│   │   ├── AdminPortal.tsx      # Health checks, integration connectors & audit stream
│   │   ├── AiStudio.tsx         # Captions, viral hooks, 45s scripts & thumbnails
│   │   ├── AuthModal.tsx        # Registration, login, password recovery & demo login
│   │   ├── ContentCalendar.tsx  # Interactive scheduling calendar & clipboard copy
│   │   ├── LandingHero.tsx      # Public value prop, live demo audit bar & pricing
│   │   ├── Navbar.tsx           # Navigation, quota meters & account controls
│   │   ├── ProfileAuditor.tsx   # Public profile inspection, SVG trajectory & playbook
│   │   ├── SavedProfiles.tsx    # Watchlist & head-to-head competitor comparator
│   │   └── SettingsModal.tsx    # GDPR data export, account deletion & Android guide
│   ├── server/
│   │   ├── adapters/            # Instagram, YouTube, TikTok, Facebook, X adapters
│   │   ├── ai/                  # Gemini AI service & structured offline generator
│   │   ├── auth/                # PBKDF2/scrypt auth, session tokens, SSRF validator
│   │   ├── db/                  # In-memory & file-backed persistent database store
│   │   ├── routes.ts            # Express REST API routes
│   │   └── tests/               # Automated unit tests (adapters, auth, AI)
│   ├── services/
│   │   └── api.ts               # Frontend API client
│   ├── App.tsx                  # Master application controller
│   ├── main.tsx                 # Client entry point
│   └── types.ts                 # TypeScript type definitions
├── capacitor.config.ts          # Capacitor native runtime configuration
├── server.ts                    # Full-stack server entry with Vite middleware
├── .env.example                 # Documented environment variables template
├── SECURITY.md                  # Vulnerability disclosure & security practices
└── README.md                    # Documentation & setup guide
```

---

## 4. Local Installation & Development Setup

### Prerequisites
- Node.js >= 20.x or 22.x
- npm >= 10.x

### Step 1: Clone and Install
```bash
git clone https://github.com/your-org/social-growth-ai.git
cd social-growth-ai
npm install
```

### Step 2: Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure `GEMINI_API_KEY` for AI features and any platform API keys you possess (e.g. `YOUTUBE_API_KEY`, `INSTAGRAM_ACCESS_TOKEN`). If credentials are not supplied, the platform runs seamlessly in clearly-labeled **Demo Mode with synthetic baseline data** and offline AI fallback.

### Step 3: Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Running Automated Tests

Run unit tests for platform handle parsers, SSRF blockers, scrypt password hashing, quota deduction, and AI output schemas:
```bash
npm test
```
All tests run with Node's native test runner (`node:test` via `tsx --test`).

To validate TypeScript types across the entire project:
```bash
npm run lint
```

---

## 6. Database Setup & PostgreSQL Migrations

The platform comes with a local JSON persistent store (`.data/db.json`) pre-seeded with sample creator profiles, demo accounts, and calendar entries.

To connect a production PostgreSQL database with Prisma:
1. Update `DATABASE_URL` in `.env`:
   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/socialgrowth_db?schema=public"
   ```
2. Run Prisma migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
3. Generate the Prisma client:
   ```bash
   npx prisma generate
   ```

---

## 7. Android Application & APK Build (Capacitor)

### Architecture
- Application ID: `com.socialgrowth.ai`
- Target SDK: 34 (Android 14)
- Min SDK: 23 (Android 6.0 Marshmallow)

### Building the Debug APK
1. Build the production web bundle:
   ```bash
   npm run build
   ```
2. Sync web assets with Capacitor:
   ```bash
   npx cap sync android
   ```
3. Build the APK using Gradle:
   ```bash
   cd android
   ./gradlew assembleDebug
   ```
4. Output file:
   `android/app/build/outputs/apk/debug/app-debug.apk`

### Testing on an Android Emulator or Physical Device
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 8. GitHub Actions CI/CD Workflows

1. **Continuous Integration (`.github/workflows/ci.yml`)**:
   - Triggers on push or pull request to `main`/`master`.
   - Runs `npm install`, TypeScript type check (`tsc --noEmit`), unit test runner (`npm test`), production web build (`npm run build`), and dependency security audit (`npm audit`).

2. **Android APK Build & Artifacts (`.github/workflows/android.yml`)**:
   - Configures JDK 17 and Android SDK 34.
   - Compiles web assets, triggers `./gradlew assembleDebug`, verifies that `app-debug.apk` exists, and uploads the artifact using `actions/upload-artifact@v4`.

---

## 9. Pre-Configured Demo Credentials

For quick evaluation without manual signup:
- **Creator Account (Pro Tier)**:
  - Email: `creator@socialgrowth.ai`
  - Password: `CreatorDemo123!`
  - Includes pre-seeded tracked profiles (National Geographic, Marques Brownlee) and active calendar entries.
- **Administrator Account (Agency Tier)**:
  - Email: `admin@socialgrowth.ai`
  - Password: `AdminPass123!`
  - Full access to the Admin Portal, system telemetry, platform health statuses, and raw audit events.

---

## 10. License

Released under the [MIT License](LICENSE).
