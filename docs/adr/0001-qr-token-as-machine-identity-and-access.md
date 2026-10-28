# QR token is both the Machine's identity and its only access control

Each Machine has a secret token, set in the `MACHINES` env var, carried in the URL path (`/m/<token>/…`) and printed in the Machine's QR code. Anyone holding the token can change the Current Coffee, rate and view the dashboard; there are no user accounts and no admin role. We chose this because the users are trusted colleagues standing at the Machine, and a login would kill the "scan and rate in ten seconds" flow. The token lives in the path, not a cookie, so one phone can use several Machines. Network-level IP restriction is handled by the infrastructure, outside the app.

## Consequences

- Rotating a token means reprinting that Machine's QR code.
- A leaked token gives full write access to that Machine's data (Loads, Ratings, Coffee edits) until it is rotated. Coffees are shared, so a leaked token also allows editing Coffees used by other Machines.
