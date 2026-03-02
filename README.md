# Restaurant Deals Web

React frontend for a moderated restaurant deals marketplace. Customers browse and purchase deals, owners manage deal submissions, and admins approve or reject deals through a review queue.

## Features

- Role-aware navigation (customer, owner, admin)
- Deals explorer with live search, city filter, type filter, price filter, sort, and pagination
- Deal detail page with image, address, directions link, favorite toggle, and Add to Cart
- Shopping cart with quantity controls and localStorage persistence (survives refresh)
- Stripe checkout with CardElement for secure payment
- Order history page with status badges
- Owner portal: create drafts, inline edit, submit for review, view incoming orders
- Admin queue: approve/reject with inline reason form + AI bot audit tab
- Notifications bell with unread count and mark-read
- Floating AI chat widget (Groq) — type budget or city, filters apply automatically
- Explore page: search real restaurants via Yelp, pre-fill owner portal
- Register / login with JWT stored in React Context
- Responsive layout with mobile hamburger menu
- 404 catch-all page

## Tech Stack

- React 19 + TypeScript
- Vite
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

| Path          | Page              | Access        |
|---------------|-------------------|---------------|
| `/`           | Home              | Public        |
| `/deals`      | Deals Explorer    | Public        |
| `/deals/:id`  | Deal Details      | Public        |
| `/favorites`  | Favorites         | Auth required |
| `/cart`       | Cart              | Public        |
| `/checkout`   | Checkout          | Auth required |
| `/orders`     | Order History     | Auth required |
| `/explore`    | Restaurant Search | Owner         |
| `/portal`     | Owner Portal      | Owner / Admin |
| `/admin`      | Admin Panel       | Admin only    |
| `/login`      | Login             | Public        |
| `/register`   | Register          | Public        |

## Project Structure

```
src/
  App.tsx                   Routes + responsive navbar
  main.tsx                  Entry point + providers
  config/
    env.ts                  Vite env config
  context/
    AuthContext.tsx          Global auth state (token + role)
    CartContext.tsx          Global cart state (localStorage)
  components/
    RequireAuth.tsx          Auth route guard
    RequireRole.tsx          Role route guard
    DealCard.tsx             Reusable deal card
    NotificationsBell.tsx   Unread count + dropdown
    ChatWidget.tsx           Floating AI chat (Groq)
  pages/
    HomePage.tsx             Hero + featured deals
    DealsPage.tsx            Search / filter / paginate
    DealDetailsPage.tsx      Single deal + favorite + cart
    FavoritesPage.tsx        User favorites list
    CartPage.tsx             Cart with quantity controls
    CheckoutPage.tsx         Stripe payment form
    OrdersPage.tsx           Order history + status badges
    ExplorePage.tsx          Yelp restaurant search
    PortalPage.tsx           Owner deal management + orders
    AdminPage.tsx            Admin review queue + bot audit
    LoginPage.tsx            Login form
    RegisterPage.tsx         Registration form + role select
    NotFoundPage.tsx         404 page
  lib/
    api.ts                   Fetch wrapper (unwraps { ok, data } envelope)
```

## Auth Flow

1. User registers or logs in → API returns JWT
2. Token stored via `AuthContext` (synced to `localStorage`)
3. `useAuth()` hook provides `role`, `isLoggedIn`, `login()`, `logout()`
4. Route guards (`RequireAuth`, `RequireRole`) check context before rendering

## Cart Flow

1. Customer clicks "Add to Cart" on a deal → `CartContext` updates
2. Cart persists in `localStorage` — survives page refresh and logout
3. Checkout sends cart items to `/api/orders` + `/api/payments/create-intent`
4. Stripe confirms payment → order saved → cart cleared

## Related

- Backend repo: [restaurant-deals-api](https://github.com/traliach/restaurant-deals-api)
