# Afterglow — Movie & Show Management System

A responsive black-and-ember movie catalogue and fictional theatre/screen scheduling application. Poster copyrights remain with their respective owners; the fictional Doctor Doom/Kingdom of Ash concept art, theatre locations, screening schedules and release submissions are demonstration data. The application does not provide movie streaming, ticket/seat booking, payments, subscriptions or licensing functions.

## Requirements

- Node.js 20+ (the current environment uses Node 22) and npm.
- MongoDB Community running on `127.0.0.1:27017` for persistent accounts and application data.
- Local frontend: Vite starts at `http://localhost:5173` and automatically selects the next free port if that port is occupied; Express API on `http://localhost:5000`.

## Start the application

1. Copy `.env.example` to `.env` and set a long, unique random `JWT_SECRET`.
2. Use `MONGODB_URI=mongodb://127.0.0.1:27017/afterglow_cinema`. With MongoDB unreachable, `DEMO_MODE=true` keeps the API catalogue browsable and enables explicitly simulated demo-role sessions; mutations exist only in temporary server memory and do not persist. Use `DEMO_MODE=false` for persistent-only deployments; the API refuses to start if MongoDB is then unavailable. Do not use demo mode in production.
3. Install dependencies with `npm install`.
4. Start both services with one command: `npm run dev`.
5. Open the exact local URL Vite prints in the terminal (usually `http://localhost:5173`). If 5173 is already in use, Vite automatically moves to the next free port, such as 5174. API health is available at `http://localhost:5000/api/health`.

The startup notice `Using a development-only JWT secret` is informational for local/demo development. Set a long, unique `JWT_SECRET` in `.env` for local accounts you want to keep valid across server restarts; never reuse the development value for production. If the API port 5000 is also occupied, stop the other process or set `API_PORT` to another free port in `.env` and restart.

In the managed Preview, Vite listens on the configured platform port (3000) and proxies same-origin `/api` requests to Express on internal port 5000. If launching manually in the managed shell, use `PORT=3000 npm run dev`; the ordinary local `npm run dev` continues to use ports 5173/5000. The managed preview does not provision MongoDB, so it uses transient sample data unless an available MongoDB connection is explicitly configured.

## Roles, demo sessions and security

Unauthenticated visitors see the sign-in/registration entry before the catalogue. User accounts enter the website after sign-in; dedicated profile pages are available at `/admin-login` and `/login`. Administrator authentication includes theatre, screen, schedule, and report operations; the API enforces role permissions server-side. Public registration always creates a standard User account and cannot create privileged profiles.

When `DEMO_MODE=true`, sign-in offers simulated User and Administrator sessions. The API issues a demo JWT and still checks role authorization; demo sessions and writes are temporary and are not persisted. Public registration creates only a standard `User` account. Administrator role choices never appear in public registration.

To seed a persistent Administrator account, configure `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in the gitignored `.env`. Passwords must be at least 14 characters. Then run `npm run seed`; the project does not ship privileged credentials. Remove the seed variables when no longer needed. Passwords are hashed with bcrypt, and JWT secrets remain server-side.

The frontend accesses the API only through its relative same-origin `/api` proxy; catalogue API routes require a valid signed-in session, while theatre, schedule, production, submission-review, and report APIs require the Administrator role. No cross-origin browser API allowlist is enabled. Helmet applies its other default protections, but Content-Security-Policy and X-Frame-Options/frameguard are left off so the Manus cross-site Preview iframe can render. Before any standalone production deployment, set an embed-compatible, site-specific `frame-ancestors` CSP and corresponding framing policy for that deployment.

## Seed the fictional MongoDB demonstration dataset

With MongoDB running and `MONGODB_URI` set, run `npm run seed`. This opt-in command creates/updates the supplied catalogue, ten fictional theatres, three screens per theatre, a rolling 21-day set of coherent screening/maintenance blocks, and sample release submissions. It only deletes/replaces documents explicitly marked sample data and does not overwrite normal user accounts. **Do not run it against a shared or production database without first reviewing that sample-data write scope.** Administrator demo mode generates matching sample events in memory without MongoDB writes.

## Implemented areas

- Authenticated home/discovery, separate movie and show catalogues, content details, browser-backed Watchlist/Favourites, and responsive search/filter/sort controls.
- Role-aware login/registration, Administrator catalogue CRUD and Movie Submissions & Releases review.
- Ten fictional theatres with 30 screens, theatre-specific daily schedules, and daily/weekly Administrator production/report pages.
- Schedule create/edit form with duration-derived end time, operating-hour checks (09:00–23:30), maintenance and same-screen overlap rejection. The built-in overlap test is a rejected simulation and never inserts a conflicting event.
- Express REST API, MongoDB models/seeding, JWT authentication, bcrypt password hashing and backend role enforcement.

## API and schedule semantics

API routes use `/api`. Health reports whether MongoDB is available and whether the API is in demo mode. Schedule status is derived when read: `NOW PLAYING`, `STARTING SOON`, `UPCOMING`, `COMPLETED`, `UNDER MAINTENANCE`, or `AVAILABLE`. Screening end time is the content runtime added to the selected start time. Requests that overlap another screening, a maintenance window, or 09:00–23:30 operating time return a clear error. Movies and shows must be approved before being assigned to existing screens. No Add Screen/Edit Screen controls or ticket booking states are included.

## Poster artwork and source pages

The 11 real-film posters below are bundled in `frontend/public/posters/` and served from stable local `/posters/...` URLs on catalogue cards and detail pages; each detail page links to its listed source page. The source pages do **not** provide an image-reuse license or permission. Poster copyright remains with the applicable owner; attribution alone does not grant reuse rights. Verify rights-holder permission before broader public or commercial use. Avengers: Endgame's direct poster came from an image-search catalog whose Reddit source-page fetch was unavailable; the poster itself visibly matches the 2019 film, but its original source page is not verified.

| Catalogue entry | Matched poster | Source / attribution |
|---|---|---|
| Interstellar | 2014 U.S. teaser poster | [Space.com](https://www.space.com/25778-interstellar-movie-teaser-poster-photo.html) |
| Spider-Man | Spider-Man: No Way Home (2021) | [IMDb title media](https://www.imdb.com/title/tt10872600/mediaindex/) |
| Hulk | Hulk (2003) theatrical poster | [IMP Awards](https://www.impawards.com/2003/hulk.html) |
| Iron Man | Iron Man (2008) theatrical poster | [IMP Awards](http://www.impawards.com/2008/iron_man.html) |
| Ok Kanmani | O Kadhal Kanmani (2015) | [Moviebuff](https://www.moviebuff.com/o-kadhal-kanmani) |
| Hi Nanna | Hi Nanna (2023) | [IMDb media](https://www.imdb.com/title/tt25433734/mediaviewer/rm1113351681/) |
| Avengers: Endgame | Avengers: Endgame (2019) | [Reddit poster-result thread](https://www.reddit.com/r/movies/comments/bf9c8h/avengers_endgame_2019_official_poster/) — source page could not be verified |
| Dune | Dune (2021), theatrical poster #19 | [IMP Awards](https://www.impawards.com/2021/dune_ver19.html) |
| Avatar | Avatar (2009), original French theatrical teaser poster | [Original Film Art](https://www.originalfilmart.com/products/avatar-2009) |
| The Lord of the Rings | The Fellowship of the Ring (2001) advance U.S. one-sheet | [Posteritati](https://posteritati.com/poster/42509/the-lord-of-the-rings-the-fellowship-of-the-ring-original-2001-us-one-sheet-movie-poster) |
| Baahubali | Baahubali: The Beginning (2015) | [CinemaMaterial](https://www.cinematerial.com/movies/baahubali-the-beginning-i3470600) |

Doctor Doom and Kingdom of Ash are fictional catalogue/submission samples, not real releases. Doctor Doom is wired to original concept art and is clearly labeled as fictional and non-official; if generation is still pending, the app may show a temporary placeholder until the asset is ready.

## Container deployment

The root `Dockerfile` uses the pinned npm workspace lockfile to build the React bundle, prune development dependencies, then starts one production Express process. In production, that process honors `PORT` (default `3000`), binds to `0.0.0.0`, serves the compiled frontend/route manifest/SPA paths and continues to serve the REST API under `/api`. The unauthenticated health endpoint is `/api/health`.

Production requires a separate production-scoped `MONGODB_URI` and a long, unique `JWT_SECRET`, with `DEMO_MODE=false`. Provide both only through WebDev's protected **Production** secret input. The Dockerfile does not copy `.env`, and the production entrypoint ignores `.env`; the app refuses startup when either secret is missing, MongoDB cannot connect, or demo mode is enabled. Do not reuse the development/local MongoDB URI or JWT signing key in production. The configured database is external MongoDB; no Manus-managed database is enabled.

## Current limitations

- MongoDB must be available to persist accounts, catalogue changes, release reviews, watchlists/favourites and screen schedules; it is not included in the project workspace or managed Preview.
- The supplied Figma URL returned HTTP 403, so its frames could not be inspected. The approved written brief was used as the source of layout requirements.
- Real catalogue titles use bundled poster images with source attribution on their detail pages. Poster copyrights remain with their respective rights holders; confirm reuse rights before a wider public or commercial launch. Doctor Doom and Kingdom of Ash are fictional demo entries; Doctor Doom is configured for clearly labeled non-official concept artwork, not a real movie poster. Theatre names, locations and all sample operational reports are fictional.
- Run `npm run check` and `npm test` from the root for local production-build and schedule-rule checks; do not infer Mongo persistence from demo-mode responses.
