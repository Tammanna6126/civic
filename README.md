# CIVIC INTELLIGENCE — AI-Powered Smart City Infrastructure Management Platform

> An AI-powered civic operations platform that converts scattered citizen infrastructure reports into organized, prioritized, explainable, and trackable municipal actions.

---

## 🏛️ System Overview

Modern cities struggle with fragmented complaints across multiple channels. **Civic Intelligence** delivers a unified operating system that answers the five vital municipal questions:
1. **Where is the problem?** Real-time GPS coordinate pin-dropping mapped to municipal wards via Leaflet.
2. **What is the problem?** Natural language parsing with Google Gemini to identify the root cause and department.
3. **How serious is it?** Transparent, explainable 0–100 priority scoring that prioritizes life-safety hazards over mere complaint volume.
4. **Are there similar problems nearby?** Geo-proximity (Haversine formula within radius) + token similarity to detect duplicates and cascading risks.
5. **What should authorities do next?** AI-generated tactical action briefs and automated department routing.

---

## 🚀 Technology Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Leaflet & React-Leaflet, Recharts, Lucide Icons
- **Backend:** Node.js, Express.js, TypeScript
- **Database & Services:** Supabase Cloud PostgreSQL, Row Level Security (RLS), Supabase Storage
- **AI Engine:** Google Gemini AI with Structured Output & Zod Validation
- **Architecture:** Monorepo (`client/` and `server/`) with separation of client and server secrets.

---

## ⚡ Quick Start & Setup

### 1. Prerequisites
- Node.js v18+ (tested on Node v20/v24)
- A free [Supabase](https://supabase.com) project
- A free [Google AI Studio](https://aistudio.google.com) API Key

### 2. Configure Environment Variables

#### Backend (`server/.env`):
```ini
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_secret_key
SUPABASE_ANON_KEY=your_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

#### Frontend (`client/.env`):
```ini
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Initialize the Database
1. Open your **Supabase Dashboard** -> **SQL Editor** -> **+ New query**.
2. Copy and paste the contents of [`supabase/migrations/001_initial_schema.sql`](file:///c:/Users/Tammanna/OneDrive/Desktop/civic%20complaints/supabase/migrations/001_initial_schema.sql) (or [`supabase/update_rls.sql`](file:///c:/Users/Tammanna/OneDrive/Desktop/civic%20complaints/supabase/update_rls.sql)).
3. Click **Run**. This immediately provisions all 8 tables, security policies, and 45 realistic synthetic complaints with city coordinates.

### 4. Run the Application

#### Start the Backend API (Port 5000):
```bash
cd server
npm run dev
```

#### Start the Frontend UI (Port 5173):
```bash
cd client
npm run dev
```

Visit **`http://localhost:5173`** in your browser!

---

## 🎭 Role-Based Experiences

Civic Intelligence includes a built-in **Demo Persona Switcher** in the top navigation bar for seamless hackathon judge evaluation:

1. **Citizen Persona (`Citizen`):**
   - Submit new complaints with interactive map pin-dropping.
   - Upload evidence photos.
   - Live ticket status tracking pipeline (`Submitted` -> `AI Analyzed` -> `Under Review` -> `Assigned` -> `In Progress` -> `Resolved`).
   - Browse city-wide complaints feed.

2. **Municipal Admin Persona (`Municipal Admin`):**
   - Real-time command center with interactive Leaflet map and hotspot density rings.
   - High-level KPI metrics: Total Incidents, Critical Hazards, Pending Triage, Resolved Rate.
   - Filterable triage table with search, category, status, and severity filters.
   - **AI Duplicate Reviewer:** Review pairs of nearby similar reports, inspect similarity score & distance in meters, and link duplicates without losing originals.
   - **Department Dispatch:** Route work orders to Roads, Water & Sewerage, Drainage, Waste, Electrical, or Safety teams.
   - **Gemini AI Action Brief:** 1-click executive summary of city hazards, cascading infrastructure relationships, and recommended priorities.

3. **Field Maintenance Worker Persona (`Maintenance Worker`):**
   - High-contrast, mobile-first task list of assigned field work orders.
   - Exact GPS coordinates with 1-click Google Maps navigation.
   - Work order progression: `Start Work` (`in_progress`) -> `Mark Resolved` (`resolved`).
   - Submit resolution notes and photo proof of repair.

---

## 🎯 5-Minute Competition Demonstration Script

Follow this exact walkthrough during your presentation:

1. **Minute 1: The Problem & The Platform Overview**
   - Open `http://localhost:5173`. Show the clean, modern civic technology interface.
   - Explain how cities receive disorganized complaints and citizens never know what happens after submission.

2. **Minute 2: Citizen Complaint Filing & Instant AI Triage**
   - In the Citizen Portal, fill in:
     - Title: *"Massive crater and exposed water pipe outside metro station"*
     - Category: *Pothole*
     - Click on the interactive map to position the pin.
     - Click **Submit Complaint with Instant AI Triage**.
   - Show how the system registers the ticket in milliseconds, displays the unique ticket number (`CIVIC-2026-XXXX`), and presents the **Explainable Priority Score** with reasons (e.g. Safety 33/35, Severity 24/25).

3. **Minute 3: Municipal Admin Command Center & Map Hotspots**
   - In the top navbar, switch **Demo Persona** to **Municipal Admin**.
   - Show the command dashboard with live KPI counters and the Leaflet city map.
   - Show the pulsing red pins for Critical hazards and hotspot density rings in Indiranagar and Koramangala.
   - Open the **Triage Feed** to show the newly submitted complaint ranked right at the top.
   - Click **Dispatch** to assign it to the *Roads & Infrastructure Maintenance* department.

4. **Minute 4: Gemini AI Municipal Action Brief**
   - Click the **AI Action Brief** tab.
   - Show the executive briefing generated by Google Gemini:
     - Urgent life-safety hazards.
     - Cascading infrastructure dependencies (e.g. *commercial trash dumping blocks drains -> standing water softens sub-base -> asphalt disintegrates into potholes*).
     - Recommended directives for the Municipal Commissioner.

5. **Minute 5: Field Worker Resolution & Closed Loop**
   - In the top navbar, switch **Demo Persona** to **Maintenance Worker**.
   - Show the assigned work order appearing immediately in the technician's queue.
   - Click **Start Work** (status transitions to `In Progress`).
   - Click **Mark Resolved**, enter resolution notes (*"Deployed 1.5 tons of cold-mix asphalt, compacted sub-base, and restored traffic flow"*), and click **Complete & Close Ticket**.
   - Switch back to **Citizen** persona -> open the complaint detail -> show the verified **Resolved** status, completion timestamp, and notes!

---

## 📐 Transparent Priority Scoring Formula (0–100)

Unlike black-box AI scores or pure complaint counts, Civic Intelligence calculates:

$$\text{Score} = \text{Safety Risk} (0\text{--}35) + \text{Severity} (0\text{--}25) + \text{Public Impact} (0\text{--}15) + \text{Time Unresolved} (0\text{--}10) + \text{Cluster Bonus} (0\text{--}15)$$

- **Life-Safety Fast-Track:** Active lethal hazards (exposed 11kV lines, open submerged manholes) automatically elevate the score to $\ge 88$ (Critical).
- Every ticket preserves a transparent audit breakdown for citizen accountability.
