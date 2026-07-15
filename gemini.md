# GEMINI.md

# F1 Race Hub - AI Development Guidelines

## Project Overview

This project is a **Formula 1 Race Hub** built for Formula 1 enthusiasts who want every important statistic, piece of information, and live update about a race weekend in one place.

The goal is **NOT** to build another Formula 1 news website.

The goal is to build the ultimate **race weekend dashboard**, combining:

* Upcoming race information
* Live session data
* Historical statistics
* Driver & Constructor information
* Circuit information
* Weather
* Tyre compounds
* Records
* Standings
* Predictions
* Interactive visualizations

The application should feel modern, premium, and data-driven.

---

# Tech Stack

Frontend

* Next.js (App Router)
* TypeScript
* TailwindCSS
* ShadCN/UI
* Framer Motion
* Recharts

Backend

* Node.js
* Express.js
* MongoDB
* REST API

Deployment

* Vercel (Frontend)
* Render / Railway (Backend)

---

# Coding Philosophy

Always write:

* Clean code
* Modular code
* Reusable components
* Type-safe code
* Well-commented logic where necessary
* Production-ready code

Never generate unnecessary files.

Never duplicate components.

Prefer reusable utility functions over repeated logic.

Always split components if they become too large.

---

# Project Folder Structure

```
client/
│
├── app/
├── components/
│   ├── ui/
│   ├── cards/
│   ├── charts/
│   ├── layout/
│   └── race/
│
├── hooks/
├── lib/
├── services/
├── types/
├── utils/
└── styles/

server/

├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
├── config/
└── cron/
```

---

# Design Philosophy

The UI should look like a premium dashboard.

Think:

* Formula 1 TV
* Motorsport.com
* Apple
* Linear
* Vercel

Characteristics:

* Glassmorphism where appropriate
* Soft shadows
* Smooth animations
* Rounded corners
* Responsive layouts
* Dark theme first
* Clean typography
* Minimal clutter
* Excellent spacing

---

# Color Palette

Use these CSS variables whenever possible.

```
--background
--foreground

--primary
--secondary
--accent

--success
--warning
--danger
```

Avoid hardcoding colors unless necessary.

---

# APIs Used

## OpenF1 API

Purpose

* Live timing
* Telemetry
* Sector times
* Tyres
* Track status
* Team radio
* DRS
* Driver position
* Speed
* Lap data

---

## Jolpica / Ergast API

Purpose

* Race calendar
* Drivers
* Constructors
* Standings
* Results
* Historical data
* Fastest laps

---

## OpenWeather API

Purpose

* Race weekend forecast
* Rain probability
* Temperature
* Wind
* Humidity

---

## Static Database

MongoDB will contain:

* Circuit information
* Track maps
* Tyre compounds
* Historical records
* Driver metadata
* Constructor metadata

---

# Data Caching

Never call external APIs directly from the frontend.

Flow should always be

```
Frontend

↓

Express Backend

↓

MongoDB Cache

↓

External API
```

Cache rules:

Race Calendar

* Update once per day

Weather

* Refresh every 6 hours during race week

Standings

* Refresh after sessions finish

Driver information

* Cache permanently

Circuit information

* Cache permanently

Historical statistics

* Cache permanently unless updated

---

# Components

Components should remain small.

Example

```
RaceCard

RaceCountdown

WeatherCard

TyreCard

StandingsTable

DriverCard

CircuitMap

SessionTimeline

DriverComparison

StatisticCard

RecordCard

LiveTimingTable

TelemetryGraph

SectorComparison
```

Avoid one massive page component.

---

# Pages

Home

Displays:

* Countdown to next race
* Weekend overview
* Current standings
* Weather
* Tyres
* Latest records
* Featured statistics

---

Race Page

Contains

* Circuit map
* Track information
* Weekend schedule
* Weather
* Tyres
* Historical winners
* Lap record
* Fastest lap
* Pole record
* Statistics
* Live sessions (when available)

---

Driver Page

Contains

* Career overview
* Team
* Championships
* Wins
* Podiums
* Poles
* Fastest laps
* Career timeline
* Performance graphs

---

Constructor Page

Contains

* Team history
* Championships
* Drivers
* Wins
* Podiums
* Constructors standings

---

Standings

* Driver standings
* Constructor standings

---

Records

Include

* Most wins
* Most poles
* Most podiums
* Most championships
* Most fastest laps
* Youngest winner
* Oldest winner
* Most consecutive wins
* Most consecutive podiums

---

Compare

Driver vs Driver

Show

* Wins
* Poles
* Podiums
* DNFs
* Average Finish
* Average Grid Position
* Fastest Laps
* Championships

---

Live Mode

Uses OpenF1.

Display

* Position
* Gap
* Interval
* Current tyre
* Tyre age
* Sector times
* Speed
* DRS
* Pit status
* Flags
* Safety Car
* Virtual Safety Car

---

# Graphs

Use Recharts.

Possible graphs

* Championship progression
* Driver points
* Constructor points
* Lap time comparison
* Tyre strategy
* Position changes
* Driver performance history

---

# Performance

Always

* Lazy load heavy components
* Cache requests
* Use skeleton loaders
* Optimize images
* Avoid unnecessary re-renders
* Use server components where beneficial
* Use client components only when needed

---

# Accessibility

Always

* Semantic HTML
* Keyboard navigation
* Proper ARIA labels
* Sufficient color contrast
* Responsive layouts
* Screen reader friendly components

---

# Code Quality

Whenever writing code

Always

* Use TypeScript
* Define interfaces
* Avoid "any"
* Keep functions short
* Prefer async/await
* Handle loading states
* Handle error states
* Handle empty states

Never ignore errors.

---

# Error Handling

Every API request should include

* Loading state
* Success state
* Error state
* Retry capability where appropriate

---

# Future Features

Possible future additions

* User accounts
* Favorite drivers
* Favorite constructors
* Fantasy predictions
* AI race predictions
* Race simulations
* Interactive track maps
* Live telemetry visualizations
* Team radio playback
* Push notifications
* Historical season explorer
* Driver career comparisons
* Circuit explorer
* Strategy simulator

---

# AI Instructions

When generating code:

* Follow existing project architecture.
* Never rewrite unrelated files.
* Reuse existing components whenever possible.
* Keep code modular and maintainable.
* Prefer composition over duplication.
* Maintain consistent naming conventions.
* Explain non-obvious logic with concise comments.
* Ensure all generated code is production-ready and responsive.

If multiple implementation approaches are possible, prefer the solution that is the most scalable and easiest to maintain.

The project should always prioritize performance, readability, and an excellent user experience.
