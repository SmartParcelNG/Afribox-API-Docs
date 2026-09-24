# Afribox API Docs

Online API documentation for the Afribox backend (SmartParcel), built with
[Docusaurus](https://docusaurus.io) and `docusaurus-plugin-openapi-docs`.

- **Spec**: auto-generated from the private backend source (`tools/generate_openapi.py`).
- **Site**: bilingual — English (default) and French (`/fr/`), incl. translated API reference.
- **Try it**: enabled for **read-only** endpoints only; write endpoints are reference-only.
- **Hosting**: GitHub Pages (this repo is public; the codebase stays private).

## How it works

```
Afribox-Backend (private)  --generate-->  openapi/*.json  --gen-api-docs-->  docs/api/**  --build-->  build/
```

1. `tools/generate_openapi.py` parses the backend `v2/**/default.aspx` endpoints and the
   `App_Code/OBJ_*.vb` classes, and emits:
   - `openapi/openapi.json` (full)
   - `openapi/openapi.read.json` / `openapi/openapi.write.json` (split for Try-it control)
   - `openapi/openapi.fr.json` (French, using `tools/i18n/fr.json`)
   - `static/openapi.json` and `static/openapi-2.0.0.json` — the same spec served by the site.
2. `npm run gen-api-docs` renders MDX docs from the read/write specs.
3. `npm run build` produces the static site.

## Local development

```bash
# Needs the backend source checked out next to this repo (../Backend API or ../Afribox-Backend)
npm install
python3 tools/generate_openapi.py            # optional: path to backend
npm run gen-api-docs
npm start
```

## Editing

- Descriptions, examples, manual endpoints: `tools/overrides.json`
- French translations: `tools/i18n/fr.json`
- Redocly rules: `.redocly.yaml`
- Read/write classification: auto-generated to `tools/endpoint-classification.json`
  (git-ignored; local review only) and overridable via the `readonly` flag in
  `tools/overrides.json`

## CI/CD

`.github/workflows/deploy.yml` checks out the private backend using the `BACKEND_PAT`
secret, regenerates the specs, generates the docs, builds, and deploys to GitHub Pages.

It runs on push to `main`, on manual dispatch, and **weekly** (`cron: '0 6 * * 1'`) to
re-sync the contract from the backend. When `BACKEND_PAT` is empty the job builds from the
committed `openapi/*.json` instead. The committed spec is the source of truth for a given
release; the served copy lives at `openapi.json` (and the versioned `openapi-<version>.json`).

Set repository **Settings → Pages → Source: GitHub Actions**, and add a fine-grained
`BACKEND_PAT` secret with read access to `SmartParcelNG/Afribox-Backend`.

## URL

`https://smartparcelng.github.io/Afribox-API-Docs/`
