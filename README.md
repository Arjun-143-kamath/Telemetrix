# F1 Race Hub 🏎️

F1 Race Hub is a blazing fast, modern Formula 1 dashboard application built to provide fans with real-time race data, historical circuit statistics, and upcoming race schedules. 

Designed with a premium, dynamic UI featuring glassmorphism, micro-animations, and striking typography, the dashboard acts as a central hub for all things F1.

## 🌟 Features

- **Next Race Countdown**: Stay up to date with exactly how many days are left until the next Grand Prix weekend.
- **Dynamic Track Maps**: View official track layouts perfectly scaled and styled for the upcoming Grand Prix.
- **Circuit Records**: Automatically calculated historical records for each circuit, including Fastest Lap, Most Wins, and Most Poles by legendary drivers.
- **Live Conditions & Tyres**: Real-time track temperature and rain risk pulled straight from the sessions, alongside the designated tyre compounds for the weekend.
- **Smart Data Scraping & Aggregation**: Combines data from multiple APIs (OpenF1, Jolpica) and web scrapers to provide a comprehensive, 100% data-driven experience with zero hardcoded values.
- **Blazing Fast Caching**: Features a robust in-memory caching layer (`node-cache`) on the backend to prevent rate-limiting and ensure lightning-fast page loads.

## 🛠️ Tech Stack

F1 Race Hub is built as a monorepo utilizing **Turborepo** for optimized build performance.

### Frontend (`apps/client`)
- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Styling**: Tailwind CSS with custom aesthetic tokens, dark mode gradients, and dynamic layout constraints.
- **Architecture**: A fully data-driven dashboard consuming aggregated backend APIs.

### Backend (`apps/server`)
- **Framework**: [Node.js](https://nodejs.org/) & Express
- **APIs Consumed**: 
  - **OpenF1 API**: For live session data, weather, and current season race schedules.
  - **Jolpica (Ergast) API**: For deep historical F1 results and standings.
- **Tools**: `axios` for fetching, `cheerio` for web scraping (tyres/Driver of the Day), and `node-cache` for TTL-based memory caching.

## 🚀 Getting Started

To run F1 Race Hub locally, ensure you have Node.js and a package manager (npm, yarn, or pnpm) installed.

1. **Install Dependencies**
   ```sh
   npm install
   ```

2. **Run the Development Server**
   Start both the frontend and backend simultaneously using Turborepo:
   ```sh
   npm run dev
   ```

3. **View the Application**
   - Frontend: Open [http://localhost:3000](http://localhost:3000) in your browser.
   - Backend API: Running on [http://localhost:5001](http://localhost:5001).

## 📁 Architecture 

- `apps/client/`: The Next.js frontend application.
- `apps/server/`: The Express backend application acting as an API aggregator and caching layer.
- `packages/`: Shared configurations (TypeScript, ESLint, UI stubs) across the monorepo.
