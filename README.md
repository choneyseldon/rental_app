# ChimBill

Rent and utility management for **Dorji Khangzang**, Jungshina, Thimphu.

A printed QR code is mounted at each of the ten doors. Tenants scan it to see
what they owe and to send proof of payment. The owner reviews those
submissions, publishes the monthly water bill, and can see at a glance who has
not paid.

## How it works

**Tenants** have no account, no password and nothing to install. The QR at
their door contains a long random token, and that token is the credential. It
resolves to one unit and shows only that unit's bills.

**The owner** signs in with a passcode and reviews payment screenshots by eye.
There is no payment gateway — at ten units, a person looking at an image is the
right amount of machinery.

Three money flows, handled differently:

| | How |
| --- | --- |
| **Rent** | paid to the owner's account, screenshot uploaded, owner approves |
| **Water** | one Thromde bill, split equally across occupied units, then as rent |
| **Electricity** | display only — the page shows the BPC consumer number to pay BPC directly |

## Running it locally

```bash
npm install
npx convex dev        # leave running; it writes NEXT_PUBLIC_CONVEX_URL
```

Copy `.env.local.example` and fill in the rest, then in a second terminal:

```bash
npx convex env set ADMIN_API_SECRET '<same value as .env.local>'
npx convex run seed:seedUnits --push
npm run dev
```

- `/admin` — the owner's side, passcode from `ADMIN_PASSCODE`
- `/u/<token>` — a tenant's page; use the **Open** link on the Print QR page

## Going live

See **[DEPLOY.md](./DEPLOY.md)** for the full path to production, including the
one decision that is expensive to reverse: the domain, which every printed QR
code contains.

## Stack

Next.js 16 (App Router) · Convex · Tailwind 4 · deployed on Vercel.

Property details, the unit list and the rent account live in
`convex/property.ts`, shared by the backend and the UI so they cannot drift.
