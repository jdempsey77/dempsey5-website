# dempsey5-website — Claude Code notes

## What this is

A simple static landing page for dempsey5.com: `index.html`, `styles.css`,
`script.js`, no build step, no framework, no dependencies. Includes a small
current-weather widget (`script.js`) via the OpenWeatherMap API.

## How to run it / test it

No build or dev server needed — open `index.html` directly in a browser, or
serve the directory with any static file server.

Tests (stdlib Python, no network): `python -m unittest discover -s tests -v`.
`tests/check_site.py` checks every `.html` page is well-formed (balanced
tags, doctype, no duplicate ids) and that internal `href`/`src` links and
`#fragments` resolve; external URLs are skipped. CI
(`.github/workflows/tests.yml`) runs it plus `node --check script.js`.

## Deploy

Read from `release.yaml` on `main`:

| Field | Value |
|---|---|
| target | `github-pages` |
| how | `on-merge`: the merge to `main` is the deploy. GitHub Pages classic (legacy build from `main` /) publishes it; `/deploy` runs nothing on a host. It waits for the GitHub deployment of `main`'s SHA in `environment` to reach `success`, runs the smoke on the Mac, then writes the ledger line |
| environment | `github-pages` (confirmed 2026-10-21: Pages deployments of `main` land there and reach `success`) |
| path | `https://dempsey5.com` (informational, the site URL). There is no checkout on any host |
| script / restart | No script, nothing to restart |
| smoke | `curl -fsS -m 10 -o /dev/null https://dempsey5.com`, 3 tries, run on the Mac after the deployment reports `success`. It checks the page loads; the deployment status is what ties it to the new commit |
| rollback | `hand`: a revert PR through `/merge`; Pages republishes, then `/deploy` records it |
| ledger | `deploy`. `/deploy` writes one line on ska's deploy ledger, `--what on-merge --target github-pages`. A failed or timed-out deployment, or a failed smoke, is a fail line |
| order | `70` |
| secrets | `none`. The OpenWeatherMap key in `script.js` is client-side by design (see Secrets below) |
| test | `node --check script.js && /usr/bin/python3 tests/check_site.py && /usr/bin/python3 -m unittest discover -s tests -q` (what `tests.yml` runs) |
| ci | `true` (`.github/workflows/tests.yml`) |

## Where it deploys

GitHub Pages, custom domain via the `CNAME` file (`dempsey5.com`). No
`.github/workflows/` — this is the classic Pages setup (repo Settings →
Pages, source = this branch), not an Actions-based deploy. Push to `main`
and Pages serves the new files directly; there is no separate build/deploy
step to run. `/deploy dempsey5-website` after a merge only waits for that
Pages deployment, smokes the site and records it in the ledger.

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
