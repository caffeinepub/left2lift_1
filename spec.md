# Specification

## Summary
**Goal:** Build a full-featured "From Waste to Plate – Maharashtra Edition" food rescue hackathon platform with AI-powered food safety, NGO/volunteer dashboards, impact analytics, emergency mode, and rich UX features.

**Planned changes:**

### Home Page
- Animated hero section with tagline "From waste to plate — powered by AI, delivered with dignity", glassmorphism card styling, and food/impact iconography
- Maharashtra city selector (Mumbai, Pune, Nagpur, Nashik, Aurangabad, Kolhapur) persisted in app state
- Live animated impact counters: Meals Saved, People Fed, CO₂ Reduced (seeded demo values)
- Two CTA buttons: "Donate Food" and "I Am an NGO"
- Voice mic button using Web Speech API that pre-fills the Donate Food form

### Donate Food Page
- Form with fields: food type (Rice, Curry, Bread, Desserts, Vegetables, Fish, Dairy, Other), quantity (kg), time since cooked (hours), storage condition (Refrigerated, Room Temperature, Hot), pickup address with Maharashtra area suggestions, city selector
- Voice input toggle populating form fields via Web Speech API
- On submit: AI safety badge (Safe/Urgent/Unsafe) with remaining hours text, animated NGO matching result card (name, distance, estimated pickup time), and route preview section

### AI Food Safety Engine (frontend TypeScript)
- Base expiry thresholds: Refrigerated 24h, Room Temperature 6h, Hot 4h
- Reduce threshold by 2h for Fish and Dairy
- Climate factor: Mumbai, Nashik, Aurangabad, Nagpur reduce threshold by additional 0.5h
- Status classification: Safe (≥3h remaining), Urgent (1–3h), Unsafe (<1h)
- Returns status label, remaining hours string, and color badge class

### Smart Nearest Trust Finder (frontend TypeScript)
- Hardcoded NGO data: 3 Mumbai NGOs, 2 Pune NGOs, 2 Nagpur NGOs with coordinates
- Haversine formula for distance calculation
- Urgency score = (remainingHours × 0.4) + ((1/distanceKm) × 0.4) + (capacityScore × 0.2)
- Displays nearest NGO name, distance (1 decimal km), estimated pickup time (distance / 0.5 km/min)

### NGO Dashboard Page
- Donation request cards with food type, quantity, safety badge, remaining hours countdown, hotel name, pickup address, distance, Accept/Reject buttons
- Priority badge on Urgent/Unsafe donations
- Embedded map preview placeholder (OpenStreetMap iframe or styled placeholder)
- NGO metrics: total donations, total kg, people served (kg × 2.5)
- Donation history table (date, hotel name, food type, quantity, status)

### Volunteer Dashboard Page
- Pickup assignment cards with donor name/address, food type, quantity, urgency color borders, expiry countdown timer, route button
- Smart assignment note explaining proximity-based selection
- Urgent pickup notification banners for Urgent/Unsafe donations
- Mark as Picked Up / Mark as Delivered status buttons
- Realistic demo data for Mumbai/Pune/Nagpur

### Impact Dashboard Page
- Animated stat cards: total meals rescued, total kg redistributed, CO₂ saved (kg × 2.1), total people fed
- City-wise bar/donut chart for all 6 Maharashtra cities using demo data
- Top donors leaderboard (donor name, city, total kg, top contributor badge)
- AI voice summary button using speechSynthesis API
- Animated chart transitions on page load

### Emergency Mode
- Global toggle in header navigation
- Red-accented theme when active (red header, card borders, status indicators)
- Persistent full-width red banner: "HUNGER EMERGENCY MODE ACTIVE – All volunteers notified"
- Urgent/Unsafe donations float to top of NGO and Volunteer dashboard lists
- Deactivating restores green/orange theme; persists in React session state

### Bonus UX Features
- Multi-language toggle (English, Hindi, Marathi) with i18n string map for all static UI labels
- Dark mode toggle applying dark theme across all pages
- Animated loading states (skeleton screens or spinner overlays)
- Toast notifications for: donation submitted, NGO matched, donation accepted/rejected, volunteer assigned

### Visual Design
- Glassmorphism cards with backdrop-filter blur and semi-transparent backgrounds
- Soft green (#16a34a range) and warm orange (#ea7c2b range) palette throughout
- CSS hover transitions (scale/shadow) on buttons, mobile-responsive layout
- Food, location, and impact iconography via Lucide icons or inline SVG on all pages

### Backend – Volunteer Role
- Add Volunteer to UserRole variant
- VolunteerProfile type: principal, name, city, active, availabilityStatus
- registerVolunteer update function, getMyVolunteerProfile query
- listVolunteerAssignments query returning Pending/Matched donations in volunteer's city
- Volunteer profiles stored in stable TrieMap keyed by principal

### Backend – Analytics Extension
- Add city Text field to donation records; submitDonation accepts city parameter
- systemAnalytics returns: totalVolunteers, citywiseStats (city, totalKg, donationCount), co2SavedKg (totalKgRedistributed × 2.1)

**User-visible outcome:** Users can donate food via form or voice, receive an AI-powered food safety assessment and instant NGO match, while NGOs and volunteers manage pickups through dedicated dashboards. An impact dashboard shows city-wise analytics with voice summaries, emergency mode enables crisis response, and the app supports English/Hindi/Marathi with dark mode.
