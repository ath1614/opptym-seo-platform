# Tests

This directory contains ad-hoc test and verification scripts used during development to exercise API endpoints and flows locally.

How to run:
- Start the dev server: `npm run dev`
- Execute a test script: `node tests/<script>.js`

HTML tests:
- Standalone pages live under `tests/html/`
- Open in browser or serve via `npx serve tests/html`

Notes:
- These scripts are not part of an automated test runner; they are manual checks.
- Some tests require authentication and will respond with 401 unless run with a valid session.