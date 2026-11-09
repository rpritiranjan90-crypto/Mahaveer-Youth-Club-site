# Product Requirements Document (PRD)

**Project Name:** Mahaveer Youth Club — Ganesh Puja & Community Portal  
**Document Version:** 1.0.0 (Production Release Specification)  
**Status:** Approved for Implementation  
**Target Milestone:** Phase 0 Completion & Handover  
**Target Audience:** Club Executives, Development Team, Volunteers, Devotees & Donors  

---

## 1. Executive Summary & Product Overview

### 1.1 Context
**Mahaveer Youth Club** is a prominent non-profit community youth organization known for organizing the annual **Ganesh Puja (Ganesh Utsav)** festival along with round-the-year social, cultural, and philanthropic welfare activities (e.g., blood donation drives, flood/disaster relief, sports tournaments, tree plantation, and educational assistance for underprivileged children).

### 1.2 Vision Statement
To establish an authoritative, visually captivating, highly accessible, and transparent digital portal that serves as the official command center for the club's flagship Ganesh Puja festivities and ongoing community welfare initiatives.

### 1.3 Core Value Proposition
- **For Devotees & Community:** Real-time Puja schedules, live darshan/aarti streams, route maps, bhog timings, and festival announcements.
- **For Donors & Patrons:** Frictionless, secure digital donations (UPI / QR / Bank Transfer), automated branded digital receipts, and transparent fund utilization summaries.
- **For Volunteers & Youth:** Seamless online member onboarding, event participation, and duty schedules.
- **For Club Administration:** Centralized control over notices, photo/video archives, donor verification, and event management without requiring deep technical knowledge.

---

## 2. Goals & Success Metrics

### 2.1 Primary Business & Community Goals
1. **Digitalize Festivities:** Deliver a 100% reliable festive hub providing up-to-the-minute updates during the 10-day Ganesh Puja.
2. **Transparent Financials & Donations:** Streamline digital contributions with instant receipt generation and donor acknowledgments, increasing digital collections by over 50%.
3. **Showcase Legacy & Impact:** Archive past themes, pandal designs, idol sculptures, awards, and charity initiatives across the club’s history.
4. **Member & Volunteer Mobilization:** Build a verified registry of youth volunteers with automated intake workflows.

### 2.2 Success Metrics & KPIs
| Metric Area | Target KPI | Measurement Method |
|---|---|---|
| **Peak Traffic Reliability** | 99.9% Uptime during 10-day Ganesh Utsav | Real-time APM / server uptime monitoring |
| **Donation Conversion** | > 35% of page visitors who click "Donate" complete the contribution flow | Funnel analytics |
| **Page Speed & Performance** | Google Lighthouse score >= 90 (Performance, Accessibility, Best Practices, SEO) | Lighthouse CI / PageSpeed Insights |
| **Mobile Usage Friction** | Mobile Bounce rate < 30% | Analytics Tracking |
| **Volunteer Onboarding** | 100+ verified youth volunteers registered digitally | Admin Database Registry |

---

## 3. Target User Personas

### Persona 1: Devotee / Local Resident ("Suresh", Age 38)
- **Goal:** Wants to know exact Aarti timings, Bhog distribution hours, parking/route information, and how to participate in the Visarjan procession safely.
- **Pain Point:** Missing out on ritual schedules due to outdated WhatsApp forwards or delayed word-of-mouth.

### Persona 2: NRI / Remote Supporter & Donor ("Pooja", Age 29)
- **Goal:** Wants to contribute financially to the hometown Puja, sponsor a specific day's Bhog/Pushpanjali, get an official digital receipt, and watch the Live Darshan.
- **Pain Point:** Lack of transparent online payment options and absence of official tax/acknowledgment receipts.

### Persona 3: Youth Club Volunteer ("Rohan", Age 21)
- **Goal:** Wants to register for club membership, join specific sub-committees (Decorations, Crowd Management, Cultural Programs, PR), and view duty rosters.
- **Pain Point:** Inefficient manual registrations and lack of digital recognition for volunteer efforts.

### Persona 4: Club President / General Secretary ("Admin", Age 45)
- **Goal:** Needs to publish breaking announcements (weather advisory, VIP visits), verify incoming UPI donations, upload fresh festival photos, and showcase budget breakdowns.
- **Pain Point:** Inability to update the website instantly without depending on external webmasters.

---

## 4. Scope Boundaries

### 4.1 In-Scope (Phase 1 / MVP)
- Full-fledged responsive public portal with festive branding (Dark/Saffron/Gold regal aesthetic).
- Complete 10-day Ganesh Puja interactive schedule and Aarti timekeeper.
- Donation portal with custom amounts, predefined tiers, dynamic UPI QR generator, payment verification workflow, and instant downloadable PDF receipts.
- "Wall of Fame" / Donor acknowledgment ticker with opt-out for anonymous donations.
- Comprehensive Year-wise Photo/Video Gallery with lightbox, category filters, and social share buttons.
- Community Welfare section highlighting blood donation drives, relief work, and annual sports tournaments.
- Interactive Volunteer Registration form with skill categorization and automated acknowledgment.
- Admin portal for content management (Notices, Schedules, Gallery, Volunteer applications, and Donation reconciliation).
- Real-time emergency contacts, pandal location maps, and interactive feedback form.

### 4.2 Out-of-Scope (Explicit Non-Goals for Phase 1)
- Native iOS/Android apps on App Store/Play Store (Web Application + PWA only).
- Full payment gateway merchant escrow accounts requiring complex corporate KYC (Direct UPI Intent / QR + Admin Transaction ID Verification used for phase 1).
- Paid ticketed VIP seat bookings or paid queue gating (darshan is free for all).
- Multi-club SaaS tenancy (designed exclusively for Mahaveer Youth Club).

---

## 5. Public Pages & Detailed Functional Specifications

```
+-----------------------------------------------------------------------------------+
|                            MAHAVEER YOUTH CLUB PORTAL                             |
+-----------------------------------------------------------------------------------+
|  [Home]   [About Us]   [Ganesh Puja 2026]   [Gallery]   [Initiatives]   [Donate]  |
+-----------------------------------------------------------------------------------+
```

### 5.1 Homepage (`/` or `index.html`)
- **Header & Navigation:**
  - Official Club Emblem / Logo with animated glowing halo effect.
  - Sticky, glassmorphic navigation bar with links: Home, About Us, Ganesh Puja, Initiatives, Gallery, Financials, Contact.
  - Prominent "Donate / Chanda" CTA button (shimmering gold gradient) and "Join Volunteer" button.
  - Live Ticker: Emergency alerts, daily Aarti timings, and breaking club updates.
- **Hero Section:**
  - High-impact visual banner with 3D-styled Lord Ganesha illustration and festive lighting.
  - Dynamic Countdown Timer ticking down to Ganesh Chaturthi Sthapana / Next Major Aarti.
  - Primary CTAs: `[ Explore Puja Schedule ]` and `[ Contribute Online (UPI) ]`.
- **Festival Highlights & Theme Teaser:**
  - Overview of current year's Pandal Theme (e.g., "Eco-Friendly Vedic Heritage Palace").
  - Quick Glance Cards: 10-Day Festival Span, Estimated Devotee Footfall, Charity Goals, Live Darshan status indicator.
- **Live / Today's Ritual Schedule Widget:**
  - Auto-highlights the ongoing or upcoming ritual based on current device time (Morning Aarti, Bhog, Sandhya Aarti, Cultural Night).
- **Recent Photo/Video Stream:**
  - 6-image curated grid with smooth hover zoom effects and "View Full Archive" trigger.
- **Community Welfare Impact Stats:**
  - Counter metrics: e.g., 500+ Units Blood Collected, 12,000+ Meals Served, 25+ Years of Legacy, 150+ Active Youth Members.
- **Footer:**
  - Club address, registration numbers, social media channels (YouTube, Instagram, Facebook), Google Maps link, copyright, and developer credits.

### 5.2 About Us Page (`/about.html`)
- **Founding Story & Heritage:** History of Mahaveer Youth Club since its inception, visionaries, and community milestones.
- **Governing Body & Committee:**
  - Interactive org chart or profile cards: President, Secretary, Treasurer, Cultural In-charge, Youth Captains.
- **Core Pillars & Values:** Devotion (Bhakti), Youth Leadership, Social Service (Seva), Cultural Preservation.
- **Past Milestones & Accolades:** Awards won for best pandal decoration, discipline, and eco-friendly murtis.

### 5.3 Ganesh Puja Dedicated Festival Hub (`/ganesh-puja.html`)
- **Theme Reveal & Concept Note:** Comprehensive design story of the current year's pandal architecture, eco-friendly clay idol, and artisans.
- **10-Day Complete Daily Schedule (Interactive Accordion / Day Tabs):**
  - **Day 1:** Murti Agaman, Prana Pratishtha, Maha Aarti.
  - **Day 2-9:** Daily Vedic Chanting, Special Bhog Offerings, Bhajan Sandhya, Drama & Dance Competitions, Children's Talent Nights.
  - **Day 10 (Anant Chaturdashi / Visarjan):** Maha Hawan, Shobhayatra / Grand Procession, Eco-Immersion details and designated route map.
- **Live Stream / Darshan Portal:** Embedded low-latency player (YouTube Live / HLS stream) with live status badge ("LIVE NOW" vs "Stream Starts at 7:00 PM").
- **Visitor Guidelines & Safety Protocols:**
  - Queue routes for Senior Citizens & Families, Prasad distribution guidelines, Parking bays, First-aid station locations, and Police helpdesk contacts.

### 5.4 Donation & Chanda Portal (`/donate.html`)
- **Donation Preset Tiers & Sponsorship Categories:**
  - ₹101 / ₹251 / ₹501 — Pushpanjali & General Seva
  - ₹1,100 / ₹2,100 — 1-Day Maha Bhog Seva (Donor name announced during Aarti)
  - ₹5,100 / ₹11,000 — Cultural Night Sponsor / Pandal Illumination Partner
  - Custom Amount field (INR ₹ with input validation).
- **Payment Execution Modes:**
  - **Direct UPI Intent:** `upi://pay?pa=mahaveeryouthclub@upi&pn=Mahaveer+Youth+Club&am=...&cu=INR`
  - **Dynamic QR Code Generator:** Instantly renders scannable QR with user-entered amount and transaction note.
  - **Bank Account Transfer Details:** Beneficiary Name, Account Number, IFSC, Branch, and Bank Name for direct NEFT/RTGS/IMPS.
- **Transaction Submission & Verification Form:**
  - Donor Full Name, Mobile Number, Email, City, Amount Paid, Payment Mode, UTR/Transaction Reference Number, and Screenshot Upload (optional).
  - Public Display Toggle: `[x] Display my name on the Donor Wall of Fame` OR `[ ] Keep my donation anonymous`.
- **Instant Digital Receipt Download:**
  - Branded PDF receipt with official club watermark, unique receipt serial number (`MYC-GP-2026-XXXX`), donor name, amount in words, payment mode, and authorized signatory signature.
- **Live Donor Wall of Fame:**
  - Scrolling list of recent patrons and top contributors with celebratory badge icons.

### 5.5 Community Welfare & Initiatives Page (`/initiatives.html`)
- Dedicated sub-sections for all annual welfare activities:
  - **Annual Blood Donation Camp:** Camp dates, hospital partners, total donor count, register as emergency blood donor.
  - **Winter Warmth & Clothes Drive:** Distribution gallery, drop-off locations for donations.
  - **Annual Cricket & Football Tournaments:** Youth sports championships, tournament fixtures, and winner archives.
  - **Disaster Relief & Food Drives:** Past relief operations during floods and emergencies.

### 5.6 Photo & Video Gallery (`/gallery.html`)
- **Multi-Year Archive Filter:** `All`, `2026 (Live)`, `2025`, `2024`, `2023`, `Historical`.
- **Category Filter:** `Pandal & Murti`, `Aarti & Rituals`, `Cultural Events`, `Visarjan Shobhayatra`, `Social Work`.
- **Interactive Lightbox:** Fullscreen view, high-resolution zoom, caption details, keyboard navigation (Left/Right arrows, ESC to close), and one-click WhatsApp/Facebook share.

### 5.7 Transparency & Financial Audits (`/transparency.html`)
- **Public Accounts Summary:** Clear visual charts (Income vs Expenditure breakdown) for previous years.
- **Audited Balance Sheets:** Downloadable PDF copies of annual financial audits.
- **Patron & Sponsor Honor Roll:** Recognition of corporate sponsors, local business patrons, and community benefactors.

### 5.8 Volunteer Registration & Membership (`/join.html`)
- **Application Form:**
  - Full Name, Date of Birth / Age, Gender, Mobile Number (with WhatsApp verification note), Email, Address / Ward.
  - **Areas of Interest / Skills:** Event Decoration, Crowd Management & Security, Sound & Tech Management, Social Media & Photography, First Aid & Medical Assistance, Cooking & Bhog Distribution.
  - Availability Timings (Morning / Evening / All 10 Days).
  - Emergency Contact Person & Phone.
- **Submission Response:** Instant confirmation modal + downloadable Volunteer Registration Slip with QR verification ID.

### 5.9 Contact Us & Location (`/contact.html`)
- **Interactive Map:** Embedded Google Map pinpointing the exact Pandal location and Club Headquarters.
- **Important Hotlines:**
  - Club President, General Secretary, Volunteer Coordinator phone numbers with one-tap dial (`tel:`) links.
  - Local Police Station, Ambulance, and Fire Station emergency numbers.
- **Direct Query Form:** Name, Email/Phone, Subject, Message with spam protection (honeypot/math captcha).

---

## 6. Admin Panel Functional Requirements (`/admin/`)

```
+-----------------------------------------------------------------------------------+
|                           ADMIN CONTROL PANEL (SECURE)                            |
+-----------------------------------------------------------------------------------+
| [Overview]  [Donations & Receipts]  [Notices]  [Schedules]  [Gallery]  [Volunteers] |
+-----------------------------------------------------------------------------------+
```

### 6.1 Authentication & Role-Based Access Control (RBAC)
- **Login Screen:** Secure login with username/email and password. Session token management with automatic timeout.
- **Roles:**
  - **Super Admin (President / Secretary):** Full access to financial data, user management, notices, and settings.
  - **Finance Admin (Treasurer):** Verify UTR numbers, approve pending donations, trigger receipts, export Excel/CSV ledgers.
  - **Content Moderator (Media Team):** Upload photos, update daily schedule timings, publish breaking news banners.

### 6.2 Admin Modules
1. **Dashboard Analytics:** Total funds collected (Online vs Offline), Total Registered Volunteers, Daily Website Visitors, Pending Verifications Count.
2. **Donation Management & Reconciliation:**
   - Table view of all submissions with filter by status: `Pending Review`, `Verified`, `Rejected`.
   - Action buttons: `[Approve & Issue Receipt]`, `[Reject / Flag Invalid UTR]`, `[Resend Receipt Email/SMS]`.
   - One-click export to CSV/Excel for auditing.
3. **Notice & Banner Ticker Manager:**
   - Add/edit/delete ticker messages, toggle "Urgent Alert" modal popup on website load.
4. **Schedule & Ritual Timekeeper:**
   - Update ritual timings dynamically (e.g., if Evening Aarti is delayed by 30 minutes, admin can update time live on the site).
5. **Photo Gallery Uploader:**
   - Drag-and-drop batch image upload with metadata tagging (Year, Event Category, Caption).
6. **Volunteer Application Roster:**
   - View applicants, filter by skill department, update status (`Under Review`, `Accepted`, `Assigned Duty`), and export contact list for WhatsApp group broadcast.

---

## 7. Non-Functional Requirements (NFRs)

### 7.1 Performance & Core Web Vitals
- **Lighthouse Performance Score:** >= 90 / 100.
- **Largest Contentful Paint (LCP):** < 1.8 seconds on 4G mobile connections.
- **First Input Delay (FID) / Interaction to Next Paint (INP):** < 100ms.
- **Cumulative Layout Shift (CLS):** < 0.05.
- **Asset Optimization:** WebP image formats, lazy loading for off-screen images, minified CSS/JS bundles, font preloading for custom Google Fonts.

### 7.2 UI/UX Aesthetics & Design System
- **Theme & Vibe:** Regal Vedic Splendor blended with Modern Glassmorphism.
- **Color Palette:**
  - *Deep Imperial Navy / Obsidian Slate:* `#0A0E17`, `#111827` (Provides premium contrast)
  - *Royal Saffron / Marigold Gold:* `#FF9933`, `#F59E0B`, `#EAB308` (Sacred festival warmth)
  - *Crimson Kumkum Accent:* `#DC2626`, `#991B1B` (Auspicious rituals & action highlights)
  - *Pure Pearl White / Silk Cream:* `#F8FAFC`, `#FEF3C7` (Crystal clear typography)
- **Typography:**
  - *Display/Headings:* **Rozha One** or **Cinzel Decorative** / **Outfit** (Regal, Indian heritage touch)
  - *Body/UI:* **Inter** or **Plus Jakarta Sans** (Ultra-crisp readability across all screen sizes)
- **Interactive Micro-animations:**
  - Subtle Diya / lamp flame shimmer, festive particle accents on Hero banner, smooth accordion expansions, button ripple feedback.

### 7.3 Responsive & Cross-Browser Compatibility
- **Breakpoints Supported:**
  - Mobile Small: 320px – 375px
  - Mobile Standard: 375px – 480px
  - Tablet: 768px – 1024px
  - Desktop / Laptop: 1024px – 1440px
  - Large Screen / 4K: 1440px+
- **Browser Support:** Chrome, Safari (iOS & macOS), Firefox, Edge, Samsung Internet.

### 7.4 Security & Data Privacy
- **Client-side Sanitization:** All user inputs (names, messages, UTR numbers) strictly sanitized against XSS attacks.
- **Transaction Safety:** No banking credentials or CVVs ever collected; transactions rely purely on authenticated UPI protocols.
- **Privacy Protection:** Public Donor Wall allows donor anonymity and masks mobile numbers (`98****1234`).
- **CSRF & Rate Limiting:** Form submissions throttled to prevent spam bot flooding.

### 7.5 Accessibility (a11y)
- **Standard:** WCAG 2.1 Level AA Compliance.
- **Color Contrast:** Minimum 4.5:1 text-to-background contrast ratio across all light/dark elements.
- **Keyboard Navigation:** Full focus-visible tab ordering for all forms, modals, navigation menus, and gallery lightboxes.
- **Screen Reader Support:** Semantic HTML5 tags (`<nav>`, `<main>`, `<section>`, `<article>`, `<header>`, `<footer>`) with descriptive `aria-label` and `alt` attributes on all images.

---

## 8. Technical Architecture & Data Model

### 8.1 Technology Stack Selection
- **Core Architecture:** Modern, lightweight, ultra-fast Jamstack / Static Web with dynamic JavaScript modules and client-side reactive state.
- **Markup & Styling:** Semantic HTML5, Modular Modern CSS (CSS Grid, Flexbox, Custom Variables, Glassmorphism, CSS Animations).
- **Client Logic:** Modern Vanilla JavaScript (ES6+) for ultra-fast load times, zero bloat, offline storage support, and direct hardware acceleration.
- **Receipt Rendering Engine:** Client-side HTML5 Canvas / jsPDF vector receipt engine for instant receipt generation without server lag.
- **Data Persistence:** LocalStorage / IndexedDB mock database with sync readiness for Firebase / Supabase / REST API endpoints.

### 8.2 Data Entities

```
+-------------------------------------------------------------+
|                         DATA SCHEMAS                        |
+-------------------------------------------------------------+

[Donation Record]
- id: string (UUID / Timestamp)
- receiptNo: string (e.g. "MYC-GP-2026-1042")
- donorName: string
- phone: string
- email: string
- amount: number
- category: string ("General", "Bhog", "Cultural", "Pandal")
- utrNumber: string
- paymentMode: string ("UPI_INTENT", "UPI_QR", "BANK_TRANSFER")
- isAnonymous: boolean
- status: enum ("VERIFIED", "PENDING", "REJECTED")
- date: ISOString

[Volunteer Application]
- id: string
- registrationId: string (e.g. "VOL-2026-089")
- fullName: string
- phone: string
- email: string
- age: number
- department: string ("Crowd", "Tech", "Decoration", "Medical", "Prasad")
- availability: string ("Morning", "Evening", "All_Days")
- emergencyContact: string
- status: enum ("PENDING", "APPROVED", "ASSIGNED")
- createdAt: ISOString

[Puja Schedule Item]
- id: string
- dayNumber: number (1 to 10)
- dateStr: string
- title: string
- timeStr: string
- description: string
- type: enum ("RITUAL", "BHOG", "AARTI", "CULTURAL", "VISARJAN")
- isHighlight: boolean

[Notice / Alert Item]
- id: string
- text: string
- severity: enum ("INFO", "WARNING", "URGENT")
- isActive: boolean
- createdAt: ISOString
```

---

## 9. Future Roadmap (Phase 2 & Beyond)

| Milestone | Feature Description |
|---|---|
| **Phase 2.1** | Multilingual Toggle (English, Hindi, Regional Language Odia/Marathi/Bengali). |
| **Phase 2.2** | Automated SMS / WhatsApp Gateway integration for instant receipt delivery to donor phone numbers. |
| **Phase 2.3** | Live Pandal Crowd Meter & Queue Wait Time tracker with real-time status updates from ground volunteers. |
| **Phase 2.4** | Online E-Prasad Home Delivery booking with delivery partner integration. |
| **Phase 2.5** | Interactive Cultural Competitions portal with online drawing/singing contest video uploads and public voting. |

---

## 10. Approval & Next Steps

This PRD represents the locked, comprehensive product requirement specification for the **Mahaveer Youth Club** website.

**Next Immediate Document / Step:**
- **Phase 1: Architecture & Technical Design Document (`ARCHITECTURE.md`)** detailing component hierarchy, styling tokens, data store mechanisms, file structures, and interactive states.
