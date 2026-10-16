# CareerSphere: Job Portal and Applicant Tracking System

CareerSphere is a client-side web application that provides a dual-role interface for job seekers and recruitment administrators. Built with semantic HTML5, CSS3 (Grid and Flexbox), and object-oriented JavaScript, the system manages authentication, job listings, multi-criteria filtering, application submissions, and candidate status evaluation using browser `localStorage`[cite: 4, 5, 6].

## Live Deployment

* **Demo URL:** [https://lokeshbalaji-11.github.io/job-portal-user-admin-project/](https://lokeshbalaji-11.github.io/job-portal-user-admin-project/)
* **Repository:** [https://github.com/LokeshBalaji-11/job-portal-user-admin-project](https://github.com/LokeshBalaji-11/job-portal-user-admin-project)[cite: 7]

---

## System Overview

The application operates as a Single-Page Application (SPA) divided into three primary modules controlled by a central `JobPortal` state class:

1. **Authentication Module:** Manages role-based login (`user` vs. `admin`), new user registration, input validation, and session persistence. Includes one-click demo authentication for rapid testing[cite: 4, 6].
2. **Candidate Portal (Job Seeker):** Enables users to search and filter active job openings by keyword, employment type, and department, submit applications via pre-filled modal forms, and track application review statuses[cite: 4, 6].
3. **Recruitment Dashboard (Admin):** Provides real-time key performance indicators (KPIs), a centralized table of all submitted candidate applications, candidate status controls (`Shortlisted` / `Rejected`), and CRUD functionality for job postings[cite: 4, 6].

---

## Technical Specifications

| Component | Implementation |
| :--- | :--- |
| **Frontend Markup** | HTML5 semantic elements, modal dialogs, and accessible form controls[cite: 4] |
| **Layout & Styling** | Pure CSS3 utilizing CSS Grid (`auto-fill` responsive card layouts, KPI metric grids, two-column form layouts) and CSS Flexbox (navigation, filter bars, alignments)[cite: 5] |
| **Application Logic** | Vanilla JavaScript (ES6+ classes), DOM manipulation, dynamic rendering, and client-side XSS sanitization |
| **State Management** | Browser `localStorage` API persisting four independent data collections (`portal_users`, `portal_active_user`, `portal_jobs`, `portal_applications`)[cite: 6] |

---

## Core Functionalities

### Role-Based Access Control (RBAC)
* Dynamically renders navigation menus and view containers based on the active user's role[cite: 4, 6].
* Persists active user sessions across browser reloads until explicit logout[cite: 6].

### Search and Filtering Engine
* **Keyword Search:** Case-insensitive matching across job titles, company names, and job descriptions[cite: 4, 6].
* **Attribute Filters:** Instant filtering by Job Type (`Full-Time`, `Remote`, `Part-Time`) and Department (`Engineering`, `Design`, `Product`, `Marketing`)[cite: 4, 6].

### End-to-End Application Workflow
* Applications submitted by any candidate account are immediately written to shared local state and surfaced in the Administrator's review table[cite: 4, 6].
* Status updates (`Pending`, `Shortlisted`, `Rejected`) triggered by an Administrator synchronize directly with the candidate's "My Applications" view[cite: 4, 6].

---

## Project Structure

```text
job-portal-user-admin-project/
├── index.html       # Application markup, authentication views, dashboards, and modals
├── style.css        # Responsive layout rules, component styles, and media queries
├── script.js        # JobPortal controller class, event listeners, and storage logic
└── README.md        # System documentation
