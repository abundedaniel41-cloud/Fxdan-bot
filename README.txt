ILEM SYNTHETIC BOT V3 - ANDROID PWA
====================================

This is an early prototype. It streams public Deriv tick quotes and shows a basic,
experimental trend/momentum alert. It does NOT execute trades.

IMPORTANT:
- The default app_id 1089 is a public demo application ID and may be restricted or
  changed by Deriv. If connection fails, register your own Deriv API application
  and replace APP_ID in app.js with your app ID.
- This prototype uses a tick-based approximation, NOT true completed M5 candles.
- Boom 1000 and Crash 1000 symbol names may differ by account/API availability.
  Confirm available symbols with Deriv before relying on the feed.
- Do not use the signals for live trading until the logic has been validated on
  historical data and demo trading.
- No Deriv login, token, password, or account number is needed.

PUBLISH WITH GITHUB PAGES:
1. Create a public repository named ilem-synthetic-bot-v3.
2. Upload all files from this ZIP into the repository root (not inside another folder).
3. In GitHub repository: Settings > Pages.
4. Under Build and deployment, select Deploy from a branch.
5. Choose branch main and folder /(root), then Save.
6. Wait for the published URL shown in Settings > Pages.

INSTALL ON ANDROID:
1. Open the published GitHub Pages URL in Chrome.
2. Tap Chrome menu (three dots) > Install app or Add to Home screen.
3. Confirm installation.

TEST:
- Open the app and check that the status says Connected.
- Select Boom 1000 or Crash 1000 from the Market list if listed.
- If the stream reports an invalid symbol, do not assume the feed is working.
