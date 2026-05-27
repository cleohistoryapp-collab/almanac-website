# almanacstudios.co.uk

Static marketing + legal site for Almanac Studios Limited and the Pliny iOS app.

Plain HTML/CSS — no framework, no build step, no JavaScript. Designed to deploy
to Cloudflare Pages by dropping the folder in, or via Git connection.

## Site map

| Path | File | Purpose |
|---|---|---|
| `/` | `index.html` | Almanac Studios homepage |
| `/pliny/` | `pliny/index.html` | Pliny marketing page |
| `/privacy/` | `privacy/index.html` | Privacy policy (App Store requirement) |
| `/support/` | `support/index.html` | Support / FAQ |
| `/terms/` | `terms/index.html` | Terms of service |

Shared styles live in `assets/styles.css`. Pliny logo (cameo on royal blue
background) lives in `assets/pliny-logo.png`.

## Local preview

Open any `.html` file directly in a browser, or for clean URLs:

```bash
cd /Users/olivermay/Documents/App/almanac-website
python3 -m http.server 8000
# → http://localhost:8000
```

## Deploying to Cloudflare Pages

1. Cloudflare Dashboard → **Workers and Pages** → **Create application** → **Pages** → **Connect to Git**
2. Select the `cleohistoryapp-collab/almanac-website` repo (this one)
3. Build settings:
   - **Framework preset**: None
   - **Build command**: leave blank
   - **Build output directory**: `/`
4. Save and Deploy — Pages provisions a `*.pages.dev` URL
5. **Custom domain** → Add `almanacstudios.co.uk` (DNS auto-configures since the
   domain is registered in the same Cloudflare account; SSL provisions in ~5 min)

## Known placeholders

The following placeholders need real values before the site is considered
final:

| Where | Placeholder | Replace with |
|---|---|---|
| `privacy/`, `terms/`, `index.html` | `[Registered office address — to be confirmed]` | Almanac Studios Limited's registered office, per Companies House |
| `pliny/` hero + final-CTA | ~~App Store button is `disabled` with placeholder text~~ | Activated 2026-05 — points at `https://apps.apple.com/app/id6770077802`. |

## Email

The site references `support@almanacstudios.co.uk` throughout. This is set up
via Cloudflare Email Routing to forward to the actual inbox — the mailbox must
be live before App Store review (Apple may test it).

## Legal review

The privacy policy and terms of service are first drafts in plain English.
Before going public, get a solicitor to review at minimum the privacy policy —
the data declarations in `/privacy/` must continue to match what's declared on
App Store Connect → App Privacy. Any change to one needs the other updated.
