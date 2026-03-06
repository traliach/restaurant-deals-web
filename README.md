# Restaurant Deals Web

React frontend for a moderated restaurant deals marketplace. Customers browse and purchase deals, owners manage deal submissions, and admins approve or reject deals through a review queue.

## Features

- Role-aware navigation (customer, owner, admin)
- Deals explorer with live search, city, type, cuisine, dietary tag filters, price range, sort, and pagination
- Deal cards showing Yelp star rating (★), countdown timer, cuisine badge, and dietary tags
- Clicking a deal card opens a right-side drawer with full details (no page navigation needed)
- Deal detail page accessible directly via `/deals/:id` (for sharing/bookmarks)
- Shopping cart with quantity controls and localStorage persistence (survives refresh)
- Stripe checkout with CardElement for secure payment (test mode: `4242 4242 4242 4242`)
- Order history page with status badges
- Owner portal: create drafts (with cuisine type, dietary tags, expiry), inline edit, submit for review, view incoming orders
- Separate Admin layout with sidebar (Dashboard, Deal Queue, Users, Bot Audit)
- Admin Dashboard: platform metrics (users, owners, restaurants, deal counts, most active owners table)
- Admin Deal Queue: sortable table of all deals with detail drawer on row click
- Admin User Management: searchable/filterable table with per-user delete (owners/customers only)
- Notifications bell with unread count, mark-read, and deal-submitted type
- Floating AI chat widget (Groq) — type budget or city, filters apply automatically
- Explore page: search real restaurants via Yelp, pre-fill owner portal
- Auth token expiry detection — auto-logout on 401 via `auth:expired` custom event
- Register / login with JWT stored in Redux + localStorage
- Responsive layout with mobile hamburger menu
- 404 catch-all page

## Tech Stack

- React 19 + TypeScript
- Vite
- Redux Toolkit (auth + cart)
- React Router v6
- Tailwind CSS v4
- Stripe.js + React Stripe Elements
- Fetch API (no Axios)

## Getting Started

```bash
git clone https://github.com/traliach/restaurant-deals-web
cd restaurant-deals-web
npm install
cp .env.example .env   # set your API URL and Stripe key
npm run dev
```

Make sure the backend API is running first.

## Scripts

| Script            | Description              |
|-------------------|--------------------------|
| `npm run dev`     | Start Vite dev server    |
| `npm run build`   | Type-check + build       |
| `npm run preview` | Preview production build |

## Environment Variables

| Variable                      | Description                         | Required     |
|-------------------------------|-------------------------------------|--------------|
| `VITE_API_URL`                | Backend API base URL                | Yes          |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_test_`) | For payments |

## Routes

| Path                | Page                   | Access        |
|---------------------|------------------------|---------------|
| `/`                 | Home                   | Public        |
| `/deals`            | Deals Explorer         | Public        |
| `/deals/:id`        | Deal Details           | Public        |
| `/favorites`        | Favorites              | Auth required |
| `/cart`             | Cart                   | Public        |
| `/checkout`         | Checkout               | Auth required |
| `/orders`           | Order History          | Auth required |
| `/explore`          | Restaurant Search      | Owner only    |
| `/portal`           | Owner Portal           | Owner only    |
| `/admin/dashboard`  | Admin Dashboard        | Admin only    |
| `/admin/queue`      | Admin Deal Queue       | Admin only    |
| `/admin/users`      | Admin User Management  | Admin only    |
| `/admin/bot`        | Admin Bot Audit        | Admin only    |
| `/login`            | Login                  | Public        |
| `/register`         | Register               | Public        |

## Project Structure

```
src/
  App.tsx                   Routes + responsive navbar
  main.tsx                  Entry point + providers
  config/
    env.ts                  Vite env config
  store/
    index.ts                Redux store (auth + cart slices)
    authSlice.ts            Auth state (token + role)
    cartSlice.ts            Cart state (localStorage persistence)
    hooks.ts                useAppSelector, useAppDispatch
  components/
    RequireAuth.tsx          Auth route guard
    RequireRole.tsx          Role route guard
    DealCard.tsx             Reusable deal card (rating, countdown, cuisine, dietary tags)
    DealDetailsDrawer.tsx    Right-side slide-in panel for deal details
    AdminLayout.tsx          Admin sidebar layout (wraps all /admin/* routes)
    AdminDealDrawer.tsx      Admin deal detail panel with approve/reject actions
    NotificationsBell.tsx    Unread count + dropdown
    ChatWidget.tsx           Floating AI chat (Groq)
  pages/
    HomePage.tsx             Hero + featured deals (with drawer)
    DealsPage.tsx            Search / filter / paginate (with drawer)
    DealDetailsPage.tsx      Single deal + favorite + cart
    FavoritesPage.tsx        User favorites list
    CartPage.tsx             Cart with quantity controls
    CheckoutPage.tsx         Stripe payment form
    OrdersPage.tsx           Order history + status badges
    ExplorePage.tsx          Yelp restaurant search
    PortalPage.tsx           Owner deal management + orders
    AdminDashboardPage.tsx   Platform metrics + most active owners
    AdminQueuePage.tsx       Sortable deals table + detail drawer
    AdminUsersPage.tsx       User table with search, filter, delete
    AdminBotPage.tsx         AI bot interaction audit log
    LoginPage.tsx            Login form
    RegisterPage.tsx         Registration form + role select
    NotFoundPage.tsx         404 page
  lib/
    api.ts                   Fetch wrapper (unwraps { ok, data } envelope)
```

## Auth Flow

1. User registers or logs in → API returns JWT
2. Token stored in Redux `authSlice` (synced to `localStorage`)
3. `useAppSelector` / `useAppDispatch` for `role`, `isLoggedIn`, `login()`, `logout()`
4. Route guards (`RequireAuth`, `RequireRole`) check Redux state before rendering

## Cart Flow

1. Customer clicks "Add to Cart" on a deal → Redux `cartSlice` updates
2. Cart persists in `localStorage` — survives page refresh and logout
3. Checkout sends cart items to `/api/orders` + `/api/payments/create-intent`
4. Stripe confirms payment → order saved → cart cleared

## Related

- Backend repo: [restaurant-deals-api](https://github.com/traliach/restaurant-deals-api)
