# Resume Website Builder

Upload a PDF or DOCX resume and get a deployable personal website in seconds. Pick which sections to include, choose a design template, preview the result, and deploy to GitHub + Netlify with one click.

---

## How it works

1. **Upload** — drop a `.pdf` or `.docx` resume
2. **Pick sections** — toggle which sections to include (the parser auto-detects what's in your resume)
3. **Pick a template** — choose from 10 design themes
4. **Preview** — see your site rendered live in the browser
5. **Deploy** — one click creates a GitHub repo and deploys to Netlify

---

## Templates

| Name | Style |
|------|-------|
| Classic | Traditional single-column |
| Modern | Two-column with dark sidebar |
| Minimal | Clean, lots of whitespace |
| Terminal | CLI/hacker aesthetic |
| Bento | CSS grid card layout |
| Dark | Dark-mode first |
| Editorial | Magazine / newspaper typography |
| Glass | Glassmorphism with blurred panels |
| Sidebar | Fixed side nav + scrollable content |
| Retro | Windows 95 / early-web nostalgia |

---

## Tech stack

**Backend** — Node.js · Express · TypeScript · Handlebars
**Frontend** — Angular 19 (standalone components)
**Parsing** — `pdf-parse` (PDF), `mammoth` (DOCX)
**Deploy** — GitHub REST API · Netlify API

---

## Prerequisites

- Node.js 18+
- A [GitHub personal access token](https://github.com/settings/tokens) with `repo` scope
- A [Netlify personal access token](https://app.netlify.com/user/applications#personal-access-tokens)

---

## Setup

```bash
# Install all dependencies
npm run install:all

# Add credentials (backend only needs these for deployment)
cp backend/.env.example backend/.env
# Edit backend/.env and fill in GITHUB_TOKEN and NETLIFY_TOKEN
```

**`backend/.env`**

```
GITHUB_TOKEN=ghp_...
NETLIFY_TOKEN=...
PORT=3000
```

---

## Development

```bash
# Start both backend (port 3000) and frontend (port 4200) concurrently
npm run dev
```

The frontend dev server proxies `/api` and `/sites` to the backend, so there's no CORS issue during development.

---

## Production build

```bash
npm run build
```

- Backend compiles to `backend/dist/`
- Frontend compiles to `frontend/dist/frontend/`

To run the backend in production:

```bash
node backend/dist/index.js
```

Serve the Angular build from any static host, or point Express at the dist folder.

---

## Project structure

```
resume-website-builder/
├── backend/
│   └── src/
│       ├── parser/           # PDF/DOCX text extraction + section detection
│       ├── generator/        # Handlebars site generation
│       │   └── templates/    # 10 template directories (index.hbs + style.css)
│       ├── routes/           # upload, generate, templates, deploy
│       ├── models/           # Shared TypeScript interfaces
│       └── index.ts
├── frontend/
│   └── src/app/
│       ├── components/
│       │   ├── upload/         # Drag-and-drop + state machine
│       │   ├── section-picker/ # Section toggle UI
│       │   ├── template-picker/# Template selection grid
│       │   └── result/         # Preview iframe + deploy form
│       ├── services/           # HTTP calls to backend
│       └── models/             # Frontend interfaces
└── package.json                # Root scripts (dev, build, install:all)
```

---

## Supported resume sections

The parser detects ~48 section types across categories including work experience, education, skills, projects, certifications, publications, and more. Any section not auto-detected can be manually added via the section picker UI.

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `GITHUB_TOKEN` | For deploy | Personal access token with `repo` scope |
| `NETLIFY_TOKEN` | For deploy | Netlify personal access token |
| `PORT` | No | Backend port (default: `3000`) |
