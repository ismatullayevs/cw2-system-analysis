# Ikat Trips — Telegram Mini App (CW2 high-fi prototype)

Frontend-only Mini App. Real Mini App inside Telegram, usable in a plain
browser via mock mode (for the marked screencast).

## Run (30 seconds)

```bash
cd itms-miniapp
python3 -m http.server 8000
# open http://localhost:8000 (?mockTelegram=1 is automatic outside Telegram)
```

No install, no build, no keys. Data persists in `localStorage`.

## Demo script (≤ 60 s video)

1. Trips tab: search + difficulty chips, live seats (Chimgan nearly full).
2. Open Sukok → reviews, price tiers → Book → pick seats on the
   18-seat map → names + health + age → Review → Pay with Click (mock).
3. Tickets tab: e-ticket with code, cancel + Rate trip.
4. Admin tab: stats, confirm a card transfer, postpone Campfire → notice.
5. Check-in tab: search manifest, tick a traveller, health flag visible.

## Wire to real Telegram (stretch, optional)

1. BotFather → create bot → Menu Button → set Web App URL to your HTTPS
   host (GitHub Pages / Vercel) serving this folder.
2. `telegram-web-app.js` picks up `Telegram.WebApp.initData` automatically;
   the app prefills the real user and applies `themeParams`.
3. Server contract (documented, stubbed in UI): POST `initData` → verify
   HMAC-SHA256 with bot token → `answerWebAppQuery` / `sendMessage` for
   e-tickets and postpone/cancel notices; Click/Payme webhook → idempotent
   `paid` update keyed by `(bookingId, providerTxn)`.

## Mapping to CW1

FR-01 booking/live seats/group vehicle · FR-02 Click/Payme/transfer + e-ticket ·
FR-03 one price for everyone · FR-04 postpone/cancel + refunds · FR-05 manifest +
health flags. NFR-01 spike-safe static page · NFR-02 no card data, idempotent
mock callbacks · NFR-03 health minimised · NFR-04 localStorage manifest works
offline · NFR-05 mobile-first, Telegram entry.
