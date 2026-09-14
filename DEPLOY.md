# Deploying ChimBill

Rent and utility management for Dorji Khangzang, Thimphu.

This is the whole path from an empty Vercel account to ten QR stickers on ten
doors. Follow it in order — the sequence matters more than any single command.

---

## Before you start

**Decide the domain first, and do not change it afterwards.**

Every printed QR code contains `https://your-domain/u/<token>`. If the domain
changes later, all ten printed codes are dead and every sticker has to be
reprinted and re-glued. This is the one decision in the project that is
genuinely expensive to reverse.

You need three accounts, all free at this size:

| Account | For |
| --- | --- |
| [GitHub](https://github.com) | the code — already set up |
| [Convex](https://convex.dev) | the database and file storage |
| [Vercel](https://vercel.com) | hosting the website |

### Dev and production are separate

Convex gives you two independent deployments: the **dev** one `npx convex dev`
has been using, and a **production** one. They have separate databases. Units
and tokens created in dev do not exist in production.

This means: **print the QR codes from production, never from dev.** Codes from
dev point at rows that production has never heard of.

---

## 1. Deploy the backend to production

From the project folder:

```powershell
npx convex deploy
```

This creates the production deployment, pushes the schema and functions, and
prints the production URL. Note it down.

## 2. Generate your secrets

Three values you invent. Run this twice in PowerShell, once for each secret:

```powershell
$b = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b)
[Convert]::ToBase64String($b)
```

| Secret | What it is |
| --- | --- |
| `ADMIN_PASSCODE` | what you type to log in. Long, and not a word — it is the only thing protecting every tenant's data and all ten door tokens |
| `ADMIN_SESSION_SECRET` | first generated value. Signs the login cookie |
| `ADMIN_API_SECRET` | second generated value. Proves to Convex that a request came from your own server |

Use different values from the ones on your laptop. These are production.

## 3. Give Convex the shared secret

```powershell
npx convex env set --prod ADMIN_API_SECRET '<second generated value>'
```

**`--prod` matters.** Without it you set the variable on dev again, and every
admin page in production will say "Could not load…".

Quote the value: base64 can contain `+` and `/`, which PowerShell would
otherwise interpret.

## 4. Create a Convex deploy key

Convex dashboard → your project → **Settings** → **Deploy keys** → generate a
**production** key. Copy it; you will paste it into Vercel next.

## 5. Deploy the site

1. Go to [vercel.com/new](https://vercel.com/new) and import
   `choneyseldon/rental_app`.
2. Under **Build and Output Settings**, override the build command:

   ```
   npx convex deploy --cmd 'npm run build'
   ```

   This deploys the Convex functions and the website together, so the two can
   never drift apart, and it sets `NEXT_PUBLIC_CONVEX_URL` for you.

3. Add these environment variables:

   | Name | Value |
   | --- | --- |
   | `CONVEX_DEPLOY_KEY` | the key from step 4 |
   | `APP_BASE_URL` | your domain, e.g. `https://chimbill.bt` — must be `https` |
   | `ADMIN_PASSCODE` | from step 2 |
   | `ADMIN_SESSION_SECRET` | from step 2 |
   | `ADMIN_API_SECRET` | **the same value as step 3** |

   Do not add `NEXT_PUBLIC_CONVEX_URL` yourself. The build command sets it.

4. Deploy. Then attach your domain under **Settings → Domains**.

If `ADMIN_API_SECRET` differs between Vercel and Convex by even one character,
every admin page shows "Could not load…". It is the most common first mistake.

## 6. Create the units

```powershell
npx convex run seed:seedUnits --prod
```

Expected:

```
{ created: 10, skipped: 0, units: ["1A","1B","2A","2B","3A","3B","4A","4B","6A","6B"] }
```

The seed is idempotent — it tops up to the ten doors in `convex/property.ts`
rather than duplicating, so running it twice is harmless.

## 7. Enter the real details

Log in at `https://your-domain/admin` with your `ADMIN_PASSCODE`, open
**Units**, and for each of the ten doors fill in:

- tenant name
- phone — must be a WhatsApp number; the field warns you if WhatsApp cannot
  reach it
- rent in Ngultrum
- BPC consumer number
- **Occupied** — this is what decides who the water bill is split between

Take care here. This is the data tenants will see.

## 8. Print and mount the codes

Open **Print QR**. The page checks itself and refuses to look safe unless
`APP_BASE_URL` is a real `https` address. While it is not, every card is
stamped **PROOF — DO NOT MOUNT**.

When the banner is green:

1. Print at **100% scale**. Not "fit to page" — that changes the physical size
   of the codes.
2. **Scan one card with your phone before mounting any of them.** Check it
   opens the right unit.
3. Only then mount all ten.

Each card also has a small **Open** link on screen (it does not print) so you
can see a tenant's page yourself.

---

## Updating later

Deploying is not a one-way door. After the first release:

```powershell
git push
```

Vercel rebuilds and redeploys in about a minute, Convex functions and schema go
with it, and production data is untouched.

**Free to change any time:** layout, colours, copy, new pages, new features,
bug fixes.

**Expensive once the stickers are up:**

- the **domain** — changing it kills every printed code
- **tokens** — rotating one invalidates that door's sticker, which is exactly
  what you want when a tenant moves out, and not something to do casually

**Schema changes need care.** Adding an optional field is safe. Renaming or
removing one is not: Convex validates every existing row against the schema, so
live data has to be migrated first.

---

## Known limitation

Arrears are an **estimate**, and the interface says so. Water arrears are exact,
because the amount charged is stored per unit per month. Rent arrears use the
unit's *current* rent, because the schema keeps no rent history — so if you
raise rent, past unpaid months are revalued at the new figure.

Fixing this properly means a schema change. It is much easier to do before a
year of records exists than after.

---

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| Every admin page: "Could not load…" | `ADMIN_API_SECRET` differs between Vercel and Convex, or was set without `--prod` |
| Build fails: "Missing NEXT_PUBLIC_CONVEX_URL" | the build command override in step 5 was not applied |
| "No units yet" | step 6 has not run, or ran against dev instead of production |
| QR cards stamped PROOF | `APP_BASE_URL` is unset, local, or not `https` |
| A tenant page says "This code is no longer valid" | the token was rotated, or the code was printed from the dev deployment |
| No **Nudge** button for a tenant | their phone is missing or is not a number WhatsApp can reach |

## Environment variables

| Name | Where | Set by |
| --- | --- | --- |
| `NEXT_PUBLIC_CONVEX_URL` | Vercel | the build command, automatically |
| `CONVEX_DEPLOY_KEY` | Vercel | you, from the Convex dashboard |
| `APP_BASE_URL` | Vercel | you — your public https domain |
| `ADMIN_PASSCODE` | Vercel | you |
| `ADMIN_SESSION_SECRET` | Vercel | you |
| `ADMIN_API_SECRET` | Vercel **and** Convex prod | you, the same value in both |

`ENABLE_PREVIEW=1` exists for local layout proofing only. Never set it in
production.
