# Specification

## Summary
**Goal:** Build Left2Lift, a full-stack AI-powered food redistribution platform on the Internet Computer, connecting hotels donating surplus food with NGOs, featuring role-based panels, pure Motoko spoilage prediction, and NGO matching logic.

**Planned changes:**

### Backend (Motoko — single main.mo actor)
- Define stable data models: `Donation`, `NGOProfile`, `HotelProfile`, `FeedbackRecord`, `UserRole` variant stored in TrieMap/stable vars
- Internet Identity authentication with first-login role assignment (Hotel, NGO, Admin) persisted per principal
- Pure Motoko spoilage prediction: thresholds by storage condition (Refrigerated 24h, RoomTemperature 6h, Hot 4h), reduced by 2h for Fish/Dairy
- Pure Motoko NGO matching: score active NGOs by food type preference (+10pts) and remaining daily capacity; assign best match on safe donation submission
- Hotel donation submission endpoint: saves record, runs spoilage check, runs NGO matching if safe, returns spoilageSafe and matched NGO info
- NGO profile registration/update endpoint with plain-text location, food type preferences array, daily capacity
- NGO accept/reject endpoints (only matched NGO can call); rejection clears matchedNGOPrincipal for re-matching
- Admin endpoints: `listAllUsers`, `deactivateUser`, `listAllDonations` (with spoilage flag), `systemAnalytics` (totalKgRedistributed, totalUsers, totalDonations, wasteReducedKg) — all restricted to Admin role
- Feedback system: NGO submits rating (1–5) + comment for Completed donations; hotel average rating computed from feedback records

### Frontend
- Internet Identity login screen — fully static, no CSS transitions or keyframe animations; green/orange theme
- First-login role selection screen (Hotel, NGO, Admin) — static, no animations
- **Hotel Panel:** donation submission form (food type dropdown, quantity kg, time since cooked hours, storage condition dropdown, plain-text pickup address, pickup deadline datetime) with post-submit result card; hotel dashboard (total donations, total kg, successful deliveries, estimated people fed, donation history table)
- **NGO Panel:** donation requests view filtered by matched NGO principal (food type, quantity, remaining safe hours, hotel name, pickup address, Accept/Reject buttons); NGO dashboard (total received, total kg, people served, history); feedback form for Completed donations
- **Admin Panel:** user management with deactivate toggle; food safety monitoring table with spoilage highlight and status-update dropdown; system analytics display
- Consistent green (#1a6b3c) and orange (#e87722) theme, card-based layouts, sans-serif typography, food/location/impact icons (no blue or purple anywhere)
- Left2Lift logo rendered in nav bar and login screen, served from `frontend/public/assets/generated`

**User-visible outcome:** Hotels can log in, submit surplus food donations, and see spoilage safety results and matched NGO details. NGOs can view, accept, or reject assigned donations and submit feedback. Admins can manage users, monitor food safety, update donation statuses, and view platform-wide analytics — all within a consistent green and orange themed interface.
