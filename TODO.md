# Project outcomes

> Status is intentionally open until each outcome exists in the implementation. Product behavior, scope exclusions, concrete sample names/statuses, and constraints below derive from the approved brief.

## [x] Responsive cinematic shell, navigation, and home discovery
- Keep a near-black (#050505/#101010) background, vivid orange/amber typography and accents (#FF7A00/#FF9D00), legible muted light metadata, subtle dark borders, dramatic but restrained orange glow; do not use blue, purple or a generic SaaS theme.
- Provide a cinematic hero with an appropriate backdrop, featured title/description, functional Explore Movies, View Details, Explore Theatres actions; working search; Trending Movies, Popular Movies, Upcoming Releases, Fantasy and Science Fiction collections, Recently Added Movies, Featured Shows; horizontal collections usable on mobile; footer project info/navigation.
- Provide responsive desktop/tablet/mobile navigation, smooth lightweight transitions, reduced-motion respect, loading/error/empty/success feedback, and meaningful behavior for every visible control. Avoid heavy autoplay videos and excessive particles.
- The supplied Figma URL was attempted but returned HTTP 403; do not claim that its frames were inspected.

## [x] Authentication, roles, and authorization
- Make login/registration the front entry: unauthenticated visitors are sent to sign-in before the website pages; after successful User sign-in or registration, enter the website home (or the page originally requested) and provide logout.
- Provide exactly two sign-in profiles: User at `/login` and Administrator at `/admin-login`; each endpoint verifies the stored role server-side and rejects credentials for the wrong profile. Ordinary User login must not silently authenticate an Administrator through the User profile. Remove the separate Screen Manager sign-in and redirects.
- Provide responsive email/password validation, clear error/success feedback, password visibility toggle, and role-aware post-auth navigation.
- Public registration must not expose Administrator role selection; public accounts receive User role only. Provide an explicit secure local seed procedure for an initial Administrator account only.
- Hash passwords and keep secrets in environment variables. Validate inputs and return appropriate API errors.
- Enforce User and Administrator authorization on protected backend routes, not only by hiding frontend navigation: unauthenticated clients cannot call catalogue APIs; Users cannot call theatre/screen/schedule/report endpoints or Administrator endpoints; Administrator permissions are checked server-side.

## [x] Movies/shows catalogue, details, Watchlist and Favourites
- Include at least these 12 catalogue titles: Interstellar; Spider-Man; Hulk; Iron Man; Doctor Doom; Ok Kanmani; Hi Nanna; Avengers: Endgame; Dune; Avatar; The Lord of the Rings; Baahubali. Include science fiction, superheroes, fantasy, action, romance and Indian cinema, plus a separate Shows catalogue with poster/title/genre/language/year/seasons or episodes/description/availability status.
- Catalogue search and filters must update results by title, genre, language, release year and content type where applicable; include title/year/rating sorting, clear filters, empty states, details navigation, favourite and watchlist controls.
- Content details include backdrop, poster, title, synopsis, genre, language, release date/year, duration, rating when appropriate, reliable cast/director when available, content type and related titles; do not display operational screening data or screen-management controls on User pages. Screening management remains Administrator-only. Do not stream content.
- Users can add/remove titles from Watchlist and Favourites, see separate pages, open details, remove items and see useful empty states. Clearly explain if a demo-mode update is not persisted.
- Avoid dependence on an external movie API. Use genuine appropriate promotional art where available; otherwise label sample artwork/placeholders rather than unrelated art. Mark Doctor Doom entry as fictional/sample where appropriate.
- Bundle the correctly matched poster image for each real movie card and detail view under `frontend/public/posters/`, and store its stable `/posters/...` path in the catalogue. Keep fictional/unverified sample entries such as Doctor Doom and Kingdom of Ash clearly labeled as concept artwork; never pass them off as official movie posters.

## [x] Administrator catalogue and movie-submission operations
- Admin dashboard shows total movies, total shows, recent content and catalogue overview; provides searchable/filterable movie/show table, content details, genre/metadata management, Add Movie/Add Show, edit and delete catalogue CRUD; validate required fields; confirm deletion; show success/error notifications.
- Administrator has catalogue CRUD plus theatre inventory, screening production, and reports. Users do not receive screen management pages, controls, navigation, or screening data. Do not provide Add Screen or Edit Screen controls.
- Movie Submissions & Releases displays poster, title, production company, release date and Pending Review, Approved or Rejected status. Administrator can review and change submission decision with validation/feedback. Do not create a Production Company login.
- Administrator can assign only approved submitted titles to existing screens and schedule screening times.

## [x] Fictional theatre inventory and dedicated theatre detail views
- Show at least these 10 explicitly fictional demonstration theatres: Cosmic Galaxy Cinemas; Infinity Multiplex; Dragon Realm Screens; Starforge Cinemas; Eclipse Grand Theatre; Nova Universe Multiplex; Titan Cinemas; Aurora Fantasy Screens; Quantum Galaxy Theatre; Celestial Prime Cinemas.
- Every theatre card shows theatre name, fictional location, total screens, total seating capacity, currently scheduled screening count, operational summary and a working View Theatre/Explore Screens action; support search, location filter and sorting.
- Clicking a card opens its own dedicated detail page/view, not merely selected styling. Each theatre has at least 3 sample screens (30 or more total); show capacity, type (for example Standard/3D/IMAX-style), location and operational status.
- Theatre details show name/location, screen count, total capacity and operational status; screen selector/cards; daily schedule; upcoming/current/completed screenings; maintenance/unavailable periods; status indicators; and filters for date, screen, movie/show and status. Selecting a screen reveals its complete schedule for the selected date.
- Each screen card shows ID/number and name, seat capacity, screen type, operational status, currently playing movie if any, next scheduled movie, next screening start time and schedule timeline.
- All fictional locations, schedules and statistics are clearly labeled sample data.

## [x] Screening production board and schedule validation
- Provide Administrator-only Theatre & Screen Management, a production-board-style daily/weekly schedule and report access. A timeline row represents one screen and a schedule block one scheduled movie/show, with poster thumbnail, title, start/end, duration and derived status. Use orange for active/selected, muted grey for completed and warning styles for maintenance/conflicts.
- Provide date picker, previous/next day, theatre/screen/movie/show/status filters, and daily/weekly view toggle; clicking a theatre or screen opens meaningful detail. Use existing seeded screen inventory; do not display Add Screen or Edit Screen controls anywhere.
- Separate schedule form supports approved movie/show assignment to existing available screens only. Validate required fields, calculate end time from start plus content duration, reject overlapping screenings on one screen, maintenance conflicts and times outside operating availability; show a clear validation message. Include an attempted conflicting sample submission that is rejected and never treated as valid seeded data.
- Derive exact schedule labels from selected date, start/end timestamps, current time and maintenance: NOW PLAYING, UPCOMING, STARTING SOON, COMPLETED, UNDER MAINTENANCE, AVAILABLE. Include a mix of current, future, completed, gaps and maintenance; include multiple screenings on a screen at distinct non-overlapping times, including Interstellar, Spider-Man, Iron Man, Hulk, Ok Kanmani, Hi Nanna, Dune, Avatar and Baahubali. Never use “Booked” to imply booking.

## [x] Theatre and schedule reports
- Administrator Reports identifies all figures as demonstration data when seeded; show theatre utilisation summary, total screenings by date, screen-wise schedule report, movie-wise screening report, upcoming screenings, completed screenings, maintenance periods, and schedule conflict summary. Use charts and tables only when they improve understanding.

## [x] Express REST API, MongoDB models, persistence behavior and seed data
- Provide Node.js/Express REST API and MongoDB configuration using requested local port 27017 and environment-based connection string; no database credentials reach the browser. Models cover accounts/roles, catalogue, theatres, screens, screening schedules, maintenance and movie submissions as appropriate.
- Use JWT-based authentication, password hashing, backend role middleware, request validation, secure environment secrets and appropriate error responses.
- Provide at least 12 specified sample catalogue items, show entries, 10 fictional theatres and at least 30 screens with coherent sample schedules and seeded demo roles through an explicit seed script.
- If MongoDB/API persistence is unavailable in preview, use a clearly identified demonstration fallback with graceful errors; never claim a demo write has been saved to MongoDB. No third-party API key is required for core catalogue.

## [x] Local launch, documentation, and verified delivery report
- Root one-command `npm run dev` starts the frontend at http://localhost:5173 and backend at http://localhost:5000; MongoDB local connection is on port 27017. Do not alter the requested local ports.
- Include README with prerequisites, exact setup/run steps, environment-variable example, MongoDB connection setup, seeding instructions, local privileged demo credentials behavior (set/generated securely, not leaked in source), and helpful startup/connection errors.
- Keep application organized into frontend/components/pages/routes and backend/routes/controllers/models/middleware/configuration modules; use reusable components, lazy loading as appropriate, optimized/lazy posters, efficient state updates and sensible catalogue limits.
- Final verification report lists implemented behavior, checks actually run and outcomes, and remaining configuration/limitations (including MongoDB availability and Figma access). Do not claim checks or persistence not observed.
- Scope excludes movie streaming, ticket booking, seat reservations, online payment processing, subscriptions, copyright/licensing management and video playback. No Add Screen, Edit Screen, or Production Company login.


## [ ] Production container and WebDev publish contract
- Declare the existing `features.server:true` project with root `Dockerfile` and unauthenticated `GET /api/health`; do not change the already configured Preview runtime port or add separate build/static routes for this single-container design.
- The Dockerfile must use the root npm 10.9.2 workspace lockfile, build the Vite production assets, install/prune the production runtime, and start Express as the one production process.
- Production Express binds `0.0.0.0:$PORT` (default `3000`), serves the compiled frontend, `manus-routes.json` and extensionless React routes, keeps `/api/*` responses as API JSON, and provides unauthenticated HTTP success at `/api/health`.
- Production startup requires its own production-scoped `MONGODB_URI` and `JWT_SECRET`, forces `DEMO_MODE=false`, and fails closed if the database or required secrets are unavailable; never reuse/copy Development secret values, write secrets into source, build args, image or client output, or log credential material.
- Confirm only after a successful publication; do not infer deployability or a public production URL from a config write, local tests, or Preview.
## [x] Doctor Doom original concept artwork
- Complete the reserved original concept image generation and confirm the Doctor Doom catalogue card and detail page load that image. Keep the visible labels `FICTIONAL SAMPLE · CONCEPT ART · NOT OFFICIAL` and accessible alt text stating it is not an official movie poster. Until the real generated image is available, do not report this visual outcome as complete.
