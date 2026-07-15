# DATA_ARCHITECTURE.md

# Formula 1 Race Hub - Data Architecture & API Strategy

## Overview

This document outlines how the application should acquire, process, store, and serve Formula 1 data.

The philosophy of this project is:

> **External APIs are data sources. MongoDB is the source of truth.**

The frontend should **never directly consume OpenF1 or Jolpica**. Every request must pass through our backend, which is responsible for caching, combining, and enriching the data.

---

# Overall Architecture

```text
                    OpenF1 API
                        │
                        │
                  Historical + Live
                        │
                        ▼
                Data Processing Layer
                        ▲
                        │
                  Jolpica API
                        │
                Historical Records
                        │
                        ▼
                  MongoDB Database
                        │
                        ▼
                 Express REST API
                        │
                        ▼
                  Next.js Frontend
```

The backend has four responsibilities:

1. Retrieve data from external APIs
2. Normalize all responses into our own schema
3. Compute derived statistics
4. Serve optimized responses to the frontend

---

# API Responsibilities

## OpenF1

Use OpenF1 for everything related to **race sessions**.

### Provides

* Meetings
* Sessions
* Drivers
* Laps
* Position data
* GPS coordinates
* Telemetry
* Car data
* Team radio
* Pit stops
* Tyre stints
* Race control messages
* Weather
* Session results

OpenF1 should be considered the **live race API**.

---

## Jolpica

Use Jolpica for everything related to Formula 1 history.

### Provides

* Driver standings
* Constructor standings
* Race calendar
* Drivers
* Constructors
* Circuits
* Results
* Sprint results
* Qualifying
* Seasons

Jolpica should be considered the **historical database**.

---

# API Usage Strategy

## OpenF1

Used for

```text
Current Season

Race Weekend

Session Analysis

Telemetry

Weather

Live Timing
```

---

## Jolpica

Used for

```text
Historical Seasons

Career Statistics

Championship History

Race History

Driver History

Constructor History
```

---

# Understanding OpenF1

Everything starts from **Meetings**.

```text
Meeting

↓

Session

↓

Driver

↓

Telemetry
```

Example

```text
2026 Belgian GP

↓

Qualifying

↓

Oscar Piastri

↓

Lap 12

↓

Telemetry
```

Never request telemetry before identifying the meeting and session.

---

# OpenF1 Endpoints

## Meetings

Purpose

Represents an entire Grand Prix weekend.

Contains

* Meeting name
* Country
* Circuit
* Meeting key

Store permanently.

---

## Sessions

Each meeting contains

* FP1
* FP2
* FP3
* Sprint Qualifying
* Sprint
* Qualifying
* Race

Each session has a unique

```text
session_key
```

Most OpenF1 endpoints require this.

---

## Drivers

Contains

* Driver Number
* Team
* Name
* Headshot
* Country
* Team Colour

Cache permanently.

---

## Laps

Contains

* Lap Number
* Lap Time
* Sector Times
* Personal Best
* Pit In
* Pit Out

Use for

* Fastest laps
* Consistency
* Pace analysis
* Lap charts

---

## Position

Contains

Live race positions.

Use for

* Position chart
* Overtakes
* Race replay

---

## Location

Contains

GPS coordinates.

Use for

* Interactive circuit map
* Live car tracker
* Race replay

---

## Car Data

Contains

* Speed
* Gear
* RPM
* DRS
* Brake
* Throttle

Use for

* Telemetry comparison
* Speed graph
* Lap analysis

---

## Team Radio

Contains

* Audio URL
* Timestamp
* Driver

Use for

Radio timeline.

---

## Weather

Contains

* Air temperature
* Track temperature
* Wind
* Humidity
* Rainfall

Use for

Race weekend weather dashboard.

---

## Pit

Contains

* Pit Entry
* Pit Exit
* Duration

Use for

Pit stop analysis.

---

## Stints

Contains

* Tyre Compound
* Start Lap
* End Lap
* Tyre Age

Use for

Strategy visualization.

---

## Race Control

Contains

* Yellow Flag
* Red Flag
* Safety Car
* VSC
* Penalties

Use for

Race timeline.

---

# Understanding Jolpica

Think of Jolpica as the Formula 1 encyclopedia.

Use it to build

* Driver pages
* Constructor pages
* Circuit pages
* Championship history

It should rarely be called once data has been imported.

---

# MongoDB Collections

## drivers

Contains

```text
Driver Info

Biography

Number

Country

Team

Championships

Career Statistics

Profile Images
```

---

## constructors

Contains

```text
Name

Nationality

History

Championships

Wins

Podiums
```

---

## circuits

Contains

```text
Circuit Name

Country

Length

Turns

Direction

Elevation

DRS Zones

Images

Track SVG

Corner Information
```

---

## meetings

Contains

Every Grand Prix weekend.

---

## sessions

Contains

Each session of every meeting.

---

## laps

Contains

Every recorded lap.

---

## telemetry

Contains

Speed

Throttle

Brake

RPM

Gear

DRS

---

## weather

Historical weather.

---

## pitStops

Pit stop information.

---

## tyreStints

Tyre strategy.

---

## raceControl

Flags

Penalties

Safety Cars

---

## radios

Team radio metadata.

---

## records

Derived statistics.

This collection should NOT exist inside OpenF1.

It is generated by us.

---

# Derived Statistics

These are calculated by our backend.

## Circuit Records

Store

* Official lap record
* Fastest qualifying lap
* Fastest race lap
* Most wins
* Most poles
* Most podiums
* Most DNFs
* Most Safety Cars
* Most retirements
* Most overtakes
* Highest average speed
* Lowest average speed

---

## Driver Records

Store

* Wins
* Poles
* Podiums
* Fastest laps
* Championships
* Sprint wins
* DNFs
* Pole conversion %
* Podium conversion %
* Win percentage
* Average finish
* Average qualifying position
* Average grid position
* Total laps led
* Career points
* Career races

---

## Constructor Records

Store

* Championships
* Wins
* Podiums
* Pole positions
* Fastest laps
* Total points
* Total races
* Average finish

---

## Season Records

Store

* Champion
* Constructor Champion
* Most Wins
* Most Poles
* Most Podiums
* Most DNFs
* Fastest Driver
* Most Laps Led
* Closest Finish
* Longest Safety Car
* Wet Races
* Dry Races

---

# Race Weekend Facts

Display

* Countdown
* Weather
* Session Schedule
* Tyre Compounds
* Track Length
* Number of Turns
* DRS Zones
* Race Distance
* Previous Winner
* Previous Pole
* Fastest Lap
* Current Championship Standings

---

# Circuit Facts

Display

* First Grand Prix
* Number of Races Held
* Track Record
* Fastest Qualifying Lap
* Average Speed
* Maximum Speed
* Elevation Change
* Corner Count
* Race Distance
* Clockwise / Anti-clockwise
* Weather Forecast
* Safety Car Probability
* Historical Rain Probability

---

# Driver Facts

Display

* Career Wins
* Championships
* Pole Positions
* Podiums
* Fastest Laps
* Sprint Wins
* Best Finish
* Average Finish
* Home Grand Prix
* Debut Season
* Team History
* Recent Form

---

# Constructor Facts

Display

* Championships
* Wins
* Podiums
* Engine Supplier
* Drivers
* Debut Year
* Historical Performance
* Recent Form

---

# Live Dashboard

During a live session display

* Live Timing
* Sector Colours
* Speed Trap
* Tyre Age
* DRS Status
* Current Compound
* Gap
* Interval
* Position Changes
* Fastest Sector
* Race Control Messages
* Weather
* Pit Window
* Team Radio
* GPS Track Map

---

# Data Update Strategy

## Permanent Data

Update once.

Examples

* Drivers
* Constructors
* Circuits
* Historical records

---

## Seasonal Data

Update

After every race.

Examples

* Standings
* Career wins
* Constructor standings

---

## Race Weekend Data

Update

Every 5–10 minutes outside live sessions.

Examples

* Weather
* Schedule
* Session information

---

## Live Data

Update

Every 1–3 seconds.

Examples

* Timing
* Telemetry
* Position
* Weather
* Team Radio

---

# Caching Strategy

Never repeatedly request the same API.

Use this priority.

```text
Frontend

↓

Express

↓

Redis Cache

↓

MongoDB

↓

External API
```

Suggested TTLs

| Data               | Cache Duration                |
| ------------------ | ----------------------------- |
| Drivers            | Permanent                     |
| Constructors       | Permanent                     |
| Circuits           | Permanent                     |
| Historical Results | Permanent                     |
| Standings          | Until next completed session  |
| Meetings           | 24 hours                      |
| Weather            | 5–10 minutes during race week |
| Telemetry          | 1–3 seconds (live only)       |
| Position           | 1–3 seconds (live only)       |
| Race Control       | Live                          |
| Team Radio         | Live                          |

---

# Long-Term Goal

The objective is **not** to mirror the APIs.

The objective is to create a **Formula 1 knowledge graph**.

External APIs provide raw data.

Our backend transforms that raw data into meaningful insights.

Examples

Raw Data

```text
Driver

Lap Time

Sector Time
```

Our Database

```text
Fastest Lap Ever

Fastest Driver at Spa

Average Pole Speed

Average Pit Stop Time

Most Successful Constructor

Rain Performance

Tyre Performance

Pole Conversion Rate

Safety Car Probability
```

The frontend should consume **only these optimized endpoints**, making the application fast, scalable, and capable of presenting statistics that no single API provides directly.
