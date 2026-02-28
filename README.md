# Restaurant Deals Web

React frontend for a moderated restaurant deals marketplace. Customers browse and favorite deals, owners manage deal submissions, and admins approve or reject deals through a review queue.

## Features

- Role-aware navigation (customer, owner, admin)
- Deals explorer with live search, type filter, sort, and pagination
- Deal detail page with favorite toggle and Add to Cart
- Owner portal: create drafts, inline edit, submit for review
- Admin queue: approve/reject with inline reason form + bot audit tab
- Cart with item count badge, quantity tracking, and checkout flow
- Stripe checkout with CardElement for secure payment
- Order history page with status badges
- Notifications bell with unread count and mark-read
- Floating AI chat widget (powered by OpenAI via backend)
- Explore page: search real restaurants via Foursquare, pre-fill portal
- Register / login with JWT stored in context
- Responsive layout with mobile hamburger menu
- 404 catch-all page

## Tech Stack

- React 19 + TypeScript
- Vite
- React Router
- Tailwind CSS v4
- Fetch API (no Axios)

## Getting Started

```bash
git clone <repo-url>
cd restaurant-deals-web
npm install
cp .env.example .env   # set your API URL
npm run dev
```

Make sure the backend API is running first.

## Scripts

| Script           | Description              |
|------------------|--------------------------|
| `npm run dev`    | Start Vite dev server    |
| `npm run build`  | Type-check + build       |
| `npm run preview`| Preview production build |

## Environment Variables

| Variable                     | Description                        | Required        |
|------------------------------|------------------------------------|-----------------|
| `VITE_API_URL`               | Backend API base URL               | Yes             |
| `VITE_STRIPE_PUBLISHABLE_KEY`| Stripe publishable key (`pk_test_`)| For payments    |

## Routes

| Path          | Page              | Access        |
|---------------|-------------------|---------------|
| `/`           | Home              | Public        |
| `/deals`      | Deals Explorer    | Public        |
| `/deals/:id`  | Deal Details      | Public        |
| `/favorites`  | Favorites         | Auth required |
| `/cart`       | Cart              | Public        |
| `/checkout`   | Checkout          | Auth required |
| `/orders`     | Order History     | Customer      |
| `/explore`    | Restaurant Search | Owner         |
| `/portal`     | Owner Portal      | Owner / Admin |
| `/admin`      | Admin Panel       | Admin only    |
| `/login`      | Login             | Public        |
| `/register`   | Register          | Public        |

## Project Structure

```
src/
  App.tsx               Routes + responsive navbar
  main.tsx              Entry point + providers
  context/
    AuthContext.tsx      Global auth state (token + role)
  components/
    RequireAuth.tsx      Auth route guard
    RequireRole.tsx      Role route guard
  pages/
    HomePage.tsx         Hero + featured deals
    DealsPage.tsx        Search / filter / paginate
    DealDetailsPage.tsx  Single deal + favorite
    FavoritesPage.tsx    User favorites list
    PortalPage.tsx       Owner deal management
    AdminPage.tsx        Admin review queue
    LoginPage.tsx        Login form
    RegisterPage.tsx     Registration form
    NotFoundPage.tsx     404 page
  lib/
    api.ts              Fetch wrapper (unwraps { ok, data } envelope)
  config/
    env.ts              Vite env config
```

## Auth Flow

1. User registers or logs in → API returns JWT
2. Token stored via `AuthContext` (synced to `localStorage`)
3. `useAuth()` hook provides `role`, `isLoggedIn`, `login()`, `logout()`
4. Route guards (`RequireAuth`, `RequireRole`) check context before rendering

## Related

- Backend repo: [restaurant-deals-api](https://github.com/traliach/restaurant-deals-api)
