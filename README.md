# Castor — local business workspace

One compact local app for business facts, updates, structured reference pages, approved public-site captures and an optional assistant. Consolidates useful code/resources from LocRaven, site-mirror-ai and GBP into Castor. No account, subscription, hosted database or AI key is needed for independent workflows.

## Run locally

Node 22.19+ (tested on Node 26.3.1) and npm:

```sh
cd frontend
npm ci
npm run build
npm start
```

Open **http://127.0.0.1:3210**. `npm run dev` provides development mode. The launcher binds only loopback and enables the local runtime guard. Use `CASTOR_PORT=3211 npm start` for another port. Run one server per workspace; the launcher enforces this with a local PID lock.

Your single workspace is stored in `frontend/.castor/workspace.json`, ignored by Git, with atomic flushed writes and revision checks. `CASTOR_DATA_DIR=/absolute/path npm start` selects another local directory. Keep a backup before moving or restoring data; corrupt files are reported and never silently reset. Private fields/keys are not part of the workspace schema. No automatic cloud migration is attempted.

## Use

- **Business:** enter facts, services, hours and FAQs; save once. More details includes accessibility, parking, languages, payment methods, specialties and social URLs. Facts stay blank until you supply them.
- **Updates:** create, edit or delete local updates with terms, special hours and optional expiry. Expired updates remain in history and are excluded from pages/briefs. Updates are local drafts, never Google posts.
- **Pages:** choose profile, updates, location/contact, services or FAQs; preview, open or export standalone HTML. Export JSON-LD separately. These are deterministic templates, not AI content or evidence of ranking gains. Only saved facts and approved source links appear.
- **Sources:** capture a public HTTP(S) page. See extracted text and an actual timestamp, status, byte count and SHA-256 receipt. Approve or reject pending versions. Sync refetches the page; unchanged content retains its current state. Changed content requires approval and displays the prior approved text. Approved sources inform the workspace brief and reference links. Export an inert extracted reference, or remove a version locally.
- **Assistant:** build/export a factual workspace brief. Create, rename and delete local conversations even without a provider. Dify chat is optional and clearly unavailable until explicitly configured. Google is inactive; the original repo implemented connection/token plumbing, not profile management.
- **Backup / Restore:** download the whole local workspace as JSON. Restore a validated backup through the file picker after saving your current backup. Restore replaces local facts, history and conversations; revision stays monotonic.

Capture supports static UTF-8 HTML up to 2 MiB, five redirects and a 20-second network deadline. It does not execute JavaScript, load assets, use cookies, log in, crawl linked pages, copy a full visual site or install a recorder/snippet. Private/reserved destinations and credential URLs are blocked, including at redirects/DNS resolution. Protected sites, DNS/network/TLS errors, non-HTML responses and pages without readable static text fail visibly. Manual sync only; no background actions.

## Optional Dify

Only if you choose to send saved facts and approved source text to Dify, supply your own legitimate project key and explicit opt-in when launching:

```sh
CASTOR_ENABLE_DIFY=1 DIFY_API_KEY='<your project key>' npm start
```

The key stays server-side and is never stored in the workspace or browser. Prefer your own project-scoped environment configuration over typing a real key into shell history. No credential discovery is implemented. The fixed official Dify endpoint uses its existing SSE chat/stop contract; errors and interrupted answers are identified. Local delete retains provider history. Account/provider operations were not acceptance requirements and have not been verified live. Gemini/Groq/OpenRouter/cloud publishing and Google OAuth/management remain archived inactive; no service success is simulated.

## Check

```sh
cd frontend
npm run type-check
npm test
npm run build
npx playwright install chromium
npm start
# In another terminal, with the server running:
npm run test:browser
```

Browser tests use separate ephemeral headless Chromium contexts at desktop/mobile sizes. **Run browser tests on a separate data directory** because they intentionally edit, restore and delete test workspace data. Set `CASTOR_DATA_DIR` when starting the server and optionally `CASTOR_EVIDENCE` when testing to keep screenshots/downloads outside Git. Public capture tests need genuine network access; no fixture is passed off as a live source. Unit tests separately exercise escaping, expiry, parser edge cases, SSRF guards, revision conflicts, corrupt storage, and split SSE events.

## Architecture & preservation

Next 15 + React 18 + TypeScript remains the foundation; six production dependencies replace the former commerce/auth/UI stack. Five UI task groups share CSS tokens and one JSON workspace. Node-only server modules perform persistence, inert HTML generation, public fetching and explicitly enabled Dify calls. The browser only calls same-origin local APIs. Hosted builds are skipped by root/frontend Vercel config and rejected by the build script; API/page middleware refuses a hosted runtime. No production endpoint or customer integration is active.

Read [architecture](docs/ARCHITECTURE.md) and [actual capability/provenance mapping](docs/CAPABILITIES.md). Verified full-ref history bundles, HEAD archives, GitHub resource metadata and checksum manifest remain in documented durable task storage and support recovery. After verifying the feature-branch push and archives, Forge moved the three original source checkouts and eight redundant task mirror/recovery directories to Trash; they are absent from their former GoalRuns paths. Moving them to Trash has not reclaimed space; that requires emptying Trash, which has not been authorized or performed.

Implementation commit `6ad5661e26b3807159df447cb4a734d9ec10fc9d` was verified and published on `feat/local-consolidation`. Michael has authorized a PR and squash merge to make `main` the canonical source for this local app. The publication plan preserves the feature branch and all hosted-build/runtime guards; it authorizes no deployment or direct push to `main`. Actual PR, squash commit and remote-main readbacks belong in the external merge-publication receipt documented in the capability mapping.

Remote legacy deletion remains outstanding: Forge's first delete attempt returned HTTP 403, reporting required admin rights and the missing `delete_repo` scope, and all three legacy repos still exist. No account/scope change or delete retry is part of publication. Local consolidation is verified; the full retirement task is not complete while remote deletion remains outstanding. Supervisor status and exact preservation/removal receipts are documented in the capability mapping.
