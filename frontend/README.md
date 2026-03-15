# IMEICheck Frontend (React + Vite + Tailwind)

## Setup

1. Copy `.env.example` to `.env`
2. Set `VITE_API_URL` to your backend URL
3. Install dependencies

```bash
npm install
```

## Run

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Implemented MVP screens

- Login
- Register
- Wallet recharge (Stripe redirect)
- Authenticated IMEI order (wallet flow)
- Guest IMEI checkout (Stripe prepaid flow)
- My orders list

## Backend contract expected

- `POST /api/users/login`
- `POST /api/users/register`
- `GET /api/users/me`
- `GET /api/services`
- `POST /api/payments/stripe-checkout`
- `POST /api/payments/stripe/imei-checkout`
- `POST /api/imei-orders`
- `GET /api/imei-orders/me`
