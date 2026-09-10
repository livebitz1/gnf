# GNF Admin Dashboard

Command center and operations portal for **GNF (Gamer Not Found)** esports platform. Built with Next.js, Cloudflare D1 (Serverless SQL), Cloudflare R2 (Object Storage), and Tailwind CSS.

---

## ⚡ Features

- **Tournament Management:** Create, configure brackets (Single/Double Elimination, Battle Royale), and manage participant rosters.
- **Match Operations:** Live scoring, room credentials distribution, match conflict resolution, and screenshot verification.
- **Team & Gamer Card Directory:** Player verification, IGN/Game ID verification (Riot, BGMI, Steam), and team management.
- **Media & Evidence Storage:** High-performance screenshot uploads and banner asset storage powered by Cloudflare R2.
- **Realtime Operations:** Instant status updates and live match synchronization.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Database:** [Cloudflare D1](https://developers.cloudflare.com/d1/) (Serverless SQLite)
- **Object Storage:** [Cloudflare R2](https://developers.cloudflare.com/r2/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or newer)
- npm or pnpm
- Cloudflare account (for D1 & R2)

### 2. Environment Configuration
Copy `.env.example` to `.env.local` and populate your Cloudflare credentials:
```bash
cp .env.example .env.local
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or your configured port) with your browser.

---

## 📦 Build & Deployment

To create an optimized production build:
```bash
npm run build
npm start
```
