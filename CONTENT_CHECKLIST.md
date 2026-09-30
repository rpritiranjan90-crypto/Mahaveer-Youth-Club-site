# Content Verification Checklist

**Project:** Mahaveer Youth Club — Ganesh Puja & Community Portal  
**Document Status:** Production Deployment Verification  

This document audits all data and media items on the Mahaveer Youth Club portal. Every content item is classified as either **VERIFIED** (provided and confirmed by club leadership) or **PLACEHOLDER / NEEDS REPLACEMENT** (requires final input by club executives via the Admin Control Panel at `/admin/club`).

---

## 1. Organization Profile & Contact Details

| Field | Current Portal Value | Classification | Admin Update Location | Action Required |
|---|---|---|---|---|
| **Official Name** | Mahaveer Youth Club | VERIFIED | `/admin/club` | Confirmed official organization name. |
| **Short Identifier** | MYC | VERIFIED | `/admin/club` | Confirmed organization abbreviation. |
| **Tagline / Motto** | Celebrating Faith, Tradition & Community | VERIFIED | `/admin/club` | Established festival banner motto. |
| **Description** | Community non-profit youth organization organizing annual Ganesh Utsav & welfare programs. | VERIFIED | `/admin/club` | General mission summary. |
| **Primary Location** | Ward No. 12 Pandal Ground | PLACEHOLDER / NEEDS REPLACEMENT | `/admin/club` | Replace with exact municipal pandal ground address. |
| **Office Address** | Main Pandal Ground, Near Community Hall | PLACEHOLDER / NEEDS REPLACEMENT | `/admin/club` | Update with exact registered office address. |
| **Official Helpline** | `+91 XXXXX XXXXX` | PLACEHOLDER / NEEDS REPLACEMENT | `/admin/club` | Input official verified mobile/hotline number. |
| **Official Email** | `contact@mahaveeryouthclub.org` | PLACEHOLDER / NEEDS REPLACEMENT | `/admin/club` | Update with active club domain inbox. |
| **Registration No.** | `MYC/SOC/1998/412` | PLACEHOLDER / NEEDS REPLACEMENT | `/admin/club` | Verify against state Societies Registration certificate. |
| **Social Links (IG/FB/YT)** | `https://instagram.com/mahaveeryouthclub` | PLACEHOLDER / NEEDS REPLACEMENT | `/admin/club` | Link to verified live social channels or remove. |

---

## 2. History & Milestones Chronicle

| Milestone Year | Milestone Title | Classification | Action Required |
|---|---|---|---|
| **1998** | Club Foundation & First Neighborhood Puja | PLACEHOLDER / NEEDS REPLACEMENT | Confirm founding year and visionary founder names via `/admin/history`. Public site uses neutral chronicle headers until verified. |
| **2004** | Annual Blood Donation Camp Launch | PLACEHOLDER / NEEDS REPLACEMENT | Verify partner hospital and blood bank historical records. |
| **2010** | 100% Eco-Friendly Biodegradable Clay Murtis | PLACEHOLDER / NEEDS REPLACEMENT | Confirm transition year to eco-friendly clay idols. |
| **2026** | Annual Ganesh Utsav & Digital Portal Launch | VERIFIED | Current festive edition and digital transparency rollout. |

---

## 3. Member Roster & Volunteer Roster Policy

| Item | Standard Value | Classification | Action Required |
|---|---|---|---|
| **Member Nicknames (01 – 40)** | `Member Nickname 01` through `Member Nickname 40` | PLACEHOLDER STANDARD | No invented names or nicknames. Replace with official executive roster upon formal approval. |
| **Executive Committee** | Admin designations only | PLACEHOLDER / PENDING | Awaiting official committee appointment list. |

---

## 4. Puja Schedule & Ritual Activities

| Activity | Scheduled Date / Time | Classification | Action Required |
|---|---|---|---|
| **Murti Sthapana & Prana Pratishtha** | Day 1 • 28 Sept 2026 (8:00 AM – 11:30 AM) | PLACEHOLDER / NEEDS REPLACEMENT | Update with current year panchang-verified Muhurat timings via `/admin/activities`. |
| **Daily Morning & Evening Aarti** | Daily • 7:30 AM & 8:00 PM | PLACEHOLDER / NEEDS REPLACEMENT | Adjust daily Maha Aarti timings as decided by the Puja sub-committee. |
| **Annual Blood Donation Camp** | Day 4 • 1 Oct 2026 (9:00 AM – 4:00 PM) | PLACEHOLDER / NEEDS REPLACEMENT | Confirm medical camp dates and venue coordinator contact. |
| **Maha Bhog & Prasad Distribution** | Day 5 • 2 Oct 2026 (12:30 PM – 3:30 PM) | PLACEHOLDER / NEEDS REPLACEMENT | Publish community feast timings and distribution protocols. |
| **Visarjan Shobhayatra Procession** | Day 10 • 7 Oct 2026 (4:00 PM Onwards) | PLACEHOLDER / NEEDS REPLACEMENT | Publish police-approved immersion route and safety rules. |

---

## 5. Photo & Media Gallery

| Category | Item Description | Classification | Action Required |
|---|---|---|---|
| **Pandal Architecture** | High-resolution Pandal Shots | PLACEHOLDER / NEEDS REPLACEMENT | Upload real photos of the current/past Vedic pandal designs via `/admin/gallery`. |
| **Ganesh Murti** | Clay Idol & Sanctum Illumination | PLACEHOLDER / NEEDS REPLACEMENT | Upload high-resolution darshan photos taken during Sthapana. |
| **Community Welfare** | Blood Donation & Relief Camps | PLACEHOLDER / NEEDS REPLACEMENT | Upload actual documentary photos from social welfare camps. |
| **Cultural Evenings** | Music, Dance & Drama Performances | PLACEHOLDER / NEEDS REPLACEMENT | Upload stage performance archives. |

---

## 6. Donation & Financial Credentials (Locked UPI QR Architecture)

| Field | Current Value | Classification | Action Required |
|---|---|---|---|
| **Beneficiary Account Name** | Mahaveer Youth Club | VERIFIED | Confirm name matches exact bank account title. |
| **Official Club UPI ID** | `mahaveeryouthclub@upi` | PLACEHOLDER / NEEDS REPLACEMENT | Input active, verified bank UPI VPA via `/admin/donation`. |
| **Official Bank UPI QR Image** | Auto-generated QR / Placeholder | PLACEHOLDER / NEEDS REPLACEMENT | Upload official bank-issued QR standee image file. |
| **Preset Contribution Tiers** | `₹101, ₹501, ₹1001, ₹2001` | VERIFIED | Preset contribution quick-select buttons. |
| **Payment Gateway Integration** | None (Direct UPI Only) | VERIFIED | Strict locked architecture (no gateway, no automated claim of success). |

---

## 7. Content Workflow & Status Governance

All announcements, notices, and activity schedules adhere to the 4-state lifecycle:
1. **Draft:** Work-in-progress, not visible on the public website.
2. **Preview:** Formatted and reviewed by club administrators in preview mode.
3. **Published:** Live on the public portal and accessible via public REST APIs.
4. **Archived:** Concluded or historical items retained in administrative records.

---

## 8. How Club Executives Can Update Content

1. Log into the secure admin portal at `https://<your-domain>/admin/login`.
2. Navigate to the relevant module:
   - **Club Profile:** `/admin/club`
   - **Donation Credentials:** `/admin/donation`
   - **Ritual Schedules:** `/admin/activities`
   - **Gallery Photos:** `/admin/gallery`
   - **Notices & Bulletins:** `/admin/updates`
   - **History Archive:** `/admin/history`
3. Enter verified club details and click **Save**. Changes reflect instantly on the public website.
