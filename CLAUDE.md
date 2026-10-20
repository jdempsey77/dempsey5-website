# dempsey5-website — Claude Code notes

## What this is

A simple static landing page for dempsey5.com: `index.html`, `styles.css`,
`script.js`, no build step, no framework, no dependencies. Includes a small
current-weather widget (`script.js`) via the OpenWeatherMap API.

## How to run it / test it

No build or dev server needed — open `index.html` directly in a browser, or
serve the directory with any static file server. No automated tests.

## Deploy

Read from `release.yaml` on `main`:

| Field | Value |
|---|---|
| target | `github-pages` |
| how | `hand`: nothing to run. GitHub Pages classic serves `main` directly, so the merge to `main` is the deploy |
| path | none. There is no checkout on any host |
| script / restart | No script, nothing to restart |
| smoke | `curl -fsS -m 10 -o /dev/null https://dempsey5.com`, 3 tries. Public, works from anywhere. It checks the page loads, not that the new commit is live |
| rollback | `hand`: revert the commit on `main`; Pages republishes |
| ledger | `none`. `/deploy` can't run a `github-pages` target yet, so no ledger line gets written (checks 2 and 6 are open) |
| order | `70` |
| secrets | `none`. The OpenWeatherMap key in `script.js` is client-side by design (see Secrets below) |

No tests and no CI yet (`test: null`, `ci: false`; check 4 is open).

## Where it deploys

GitHub Pages, custom domain via the `CNAME` file (`dempsey5.com`). No
`.github/workflows/` — this is the classic Pages setup (repo Settings →
Pages, source = this branch), not an Actions-based deploy. Push to `main`
and Pages serves the new files directly; there is no separate build/deploy
step to run.

## Secrets

None encrypted, and one real API key is intentionally committed in plain
sight: `script.js` line 263 hardcodes an OpenWeatherMap API key. This is
deliberate, not an oversight — `WEATHER_API_SETUP.md`'s own "Security Note"
acknowledges a client-side key is visible in the browser regardless, and
OpenWeatherMap's free tier (1,000 calls/day) is designed to tolerate
client-exposed keys for personal-scale use. Don't "fix" this by moving it
to an env var — there's no build step or server component to read one from.
If it ever needs rotating, `home.openweathermap.org/api_keys` is the place.

## Gotchas

- No JS dependencies and no framework by design (README: "Fast Loading: No
  heavy animations or effects") — don't introduce a bundler or framework
  for a change that doesn't need one.
- Weather widget silently no-ops if `apiKey` still equals the placeholder
  string `'YOUR_API_KEY_HERE'` (see the check in `script.js`) — useful to
  know if the widget appears broken after cloning fresh instructions from
  `WEATHER_API_SETUP.md` rather than this already-configured copy.
