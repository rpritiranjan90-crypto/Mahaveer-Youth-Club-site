# Public Experience, Localization & Finalization — Mahaveer Youth Club Banza

## Overview
Phase 5 finalizes the public-facing experience for Mahaveer Youth Club Banza, introducing a lightweight, type-safe English and Odia localization system, a simplified voluntary donation experience, a clean contact channel interface, strict 2012 founding year alignment, and comprehensive accessibility and SEO improvements while preserving the Phase 1–4 foundation, authentication, CMS, and dynamic API architecture.

---

## 1. Localization Architecture

### Supported Languages
- **English (`en`)**: Default public language.
- **Odia (`or` / ଓଡ଼ିଆ)**: Natural, respectful Odia translation for all public UI chrome, navigation, headers, badges, controls, empty states, and error messages.
- **Admin Portal**: Strictly English-only.

### Architecture & Storage
- **Context**: `LanguageContext.tsx` provides `language`, `setLanguage`, and `t(key, params?, fallback?)`.
- **Persistence**: Language selection is saved to `localStorage` under `myc_language`.
- **Validation**: On application startup, `localStorage` value is strictly validated against `['en', 'or']`. Invalid or missing values safely fall back to `'en'`.
- **HTML Document Sync**: Changing the language dynamically syncs `<html lang="en">` or `<html lang="or">` for accessibility and screen readers.
- **Missing Key Fallback**: If an Odia key is missing, `t()` transparently falls back to the English dictionary, then the fallback string, and never displays `undefined`, `null`, or raw missing keys.
- **Dynamic CMS Content**: User-authored CMS updates, activity descriptions, and circulars are rendered as authored without automated machine distortion.

### Public Language Toggle
- **Desktop Navbar**: Distinct `English | ଓଡ଼ିଆ` toggle button group with visual indicator on active language.
- **Mobile Drawer & Header**: Fast toggle in top bar and mobile navigation menu.

---

## 2. Donation Experience

### Voluntary Contribution Philosophy
The website is **not** a payment gateway or banking ledger. The donation page is an informational guide for voluntary contributions to support annual Sri Ganesh Puja, prasad distribution (bhog seva), pandal arrangements, and neighborhood welfare seva.

### Key Components
1. **Official UPI QR Code**: Responsive, clear container for scanning via any UPI app (GPay, PhonePe, Paytm, BHIM).
2. **Official UPI ID Display**: Monospace display with one-click "Copy UPI ID" button and feedback toast.
3. **Recipient Verification Notice**: Prominent, non-alarming safety warning:
   > *"Please verify the recipient name shown in your UPI app before completing the payment."*
4. **Cash Donation Guidance**: Clear guidance stating that cash contributions should be handed directly to authorized club seniors at the pandal counter with physical counterfoil receipts.
5. **Removed Obsolete Features**: Zero UTR submissions, zero digital receipt claims, zero transaction ledgers.

---

## 3. Contact & Communication Channels

### Streamlined Communication
The contact page focuses exclusively on direct, reliable communication methods:
- **Direct Phone Call**: `tel:<phone>` action button.
- **WhatsApp Messaging**: `https://wa.me/<phone>` link without pre-filled message parameters.
- **Google Maps Directions**: `Get Directions` button linking to the pandal / village location in a new tab (`rel="noopener noreferrer"`).
- **Instagram**: Official social profile link for festival photos and reels.
- **YouTube**: Official channel link for festival live streams and bhajans.
- **Physical Mandap Box**: Physical location in Banza Village with festival visiting hours.
- **Removed**: Email addresses, contact inquiry forms, and message submission databases.

---

## 4. 2012 History Consistency

### Confirmed Story & Founding Year
- **Founding Year**: Confirmed as **2012**.
- **Confirmed Story**:
  > *"The senior members started the club to celebrate Ganesh Chaturthi in a devotional way and bring happiness to the region."*
  *(Odia: "ବରିଷ୍ଠ ସଦସ୍ୟମାନେ ଭକ୍ତିପୂର୍ଣ୍ଣ ଭାବରେ ଗଣେଶ ଚତୁର୍ଥୀ ପାଳନ କରିବା ଏବଂ ଅଞ୍ଚଳରେ ଖୁସି ଆଣିବା ପାଇଁ ଏହି କ୍ଲବ୍ ଆରମ୍ଭ କରିଥିଲେ।")*
- **Anomalies Removed**: All conflicting references (e.g. 1998, 28th year) have been audited and eliminated from all public pages.

---

## 5. Dynamic API Integration & Public UX

### Dynamic Content Pages
- **Celebrations / Gallery**: Dynamic years and categories retrieved via `/api/v1/gallery/years` and `/api/v1/gallery/categories`. Photo grids fetched via `/api/v1/gallery/public`.
- **Updates & Bulletins**: Published notices fetched via `/api/v1/updates/public` with search and modal circular reader.
- **Community Activities**: Published programs fetched via `/api/v1/activities/public` with category filtering.
- **Members Directory**: Public roster of approved nicknames and roles fetched via `/api/v1/members/public` preserving the privacy model.

### State Management
- **Loading States**: Consistent, non-blank skeleton/spinner indicators across all API-driven views.
- **Empty States**: Culturally sensitive, localized empty messages.
- **Error States**: Human-readable error messages with retry actions that prevent exposure of backend stack traces or internal endpoints.

---

## 6. SEO, Robots & Accessibility

### SEO & Metadata
- Descriptive title tags and meta descriptions on all routes managed via `usePageMeta`.
- Open Graph tags configured in `index.html`.
- `sitemap.xml` properly lists all 9 public routes (`/`, `/about`, `/history`, `/members`, `/celebrations`, `/activities`, `/updates`, `/donate`, `/contact`).
- `robots.txt` allows indexing of public routes while disallowing `/admin/` and `/api/`.

### Accessibility
- Semantic HTML5 structure (`<header>`, `<main>`, `<footer>`, `<nav>`, `<article>`, `<section>`).
- Skip-to-content accessibility link (`#main-content`).
- Keyboard navigation (Escape key closes modals and lightbox; Arrow keys navigate gallery photos).
- ARIA attributes (`aria-expanded`, `aria-controls`, `aria-label`, `aria-modal="true"`, `aria-pressed`).
- Dynamic `<html lang="...">` sync on language toggle.
- Gallery images utilize CMS `alt_text` with graceful fallback to image title.

---

## 7. Features Deliberately Excluded

To keep the application fast, secure, low-cost, and easy to maintain, the following were intentionally not implemented:
- Payment gateway integration or digital transaction processing
- UTR number collection or verification workflows
- Digital receipt generation or financial ledger databases
- Public user registration or comment sections
- AI chatbot or voice agent widgets
- Third-party social feed embeds
- Heavy external i18n libraries
- Cloud storage (S3/R2) or Redis caching
