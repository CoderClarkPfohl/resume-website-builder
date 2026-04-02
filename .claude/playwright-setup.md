# Playwright MCP Setup for resume-website-builder

## Ports
- Frontend: http://localhost:4200
- Backend: http://localhost:3000

## Starting the servers

### Backend
```
cd /Users/clarkpfohl/Desktop/Code_Projects/resume-website-builder/backend
npm run dev
```
Verify: `curl http://localhost:3000/api/health` → `{"status":"ok"}`

### Frontend (MUST use proxy config or API calls will 404)
```
cd /Users/clarkpfohl/Desktop/Code_Projects/resume-website-builder/frontend
npx ng serve --port 4200 --proxy-config proxy.config.json
```
Verify: `curl -s -o /dev/null -w "%{http_code}" http://localhost:4200` → `200`

### Kill existing processes
```
lsof -ti:4200,3000 | xargs kill -9
```

## Playwright MCP output directory
Artifacts (snapshots, console logs) are written to:
`/Users/clarkpfohl/Desktop/claude/playwright-mcp/`

They do NOT go into the project directory. To clear them:
```
rm -rf /Users/clarkpfohl/Desktop/claude/playwright-mcp/*
```

## MCP server config
Configured in `~/.claude.json` (user scope, available in all projects):
```
Command: npx -y @playwright/mcp@latest --output-dir /Users/clarkpfohl/Desktop/claude/playwright-mcp
```
To view: `claude mcp get playwright`
To reconfigure: `claude mcp remove playwright -s user && claude mcp add playwright -s user -- npx -y @playwright/mcp@latest --output-dir /Users/clarkpfohl/Desktop/claude/playwright-mcp`

## Test resume file
The resume PDF must be inside the project directory for Playwright to access it (sandboxed to project root):
```
cp "/Users/clarkpfohl/Downloads/clark pfohl resume.pdf" \
   "/Users/clarkpfohl/Desktop/Code_Projects/resume-website-builder/test-resume.pdf"
```
Upload path for Playwright: `/Users/clarkpfohl/Desktop/Code_Projects/resume-website-builder/test-resume.pdf`

Clean up after test: `rm -f /Users/clarkpfohl/Desktop/Code_Projects/resume-website-builder/test-resume.pdf`

## Full app flow (states to navigate)
1. **idle** — drop zone at http://localhost:4200
2. **parsing** — spinner while backend parses PDF
3. **section-select** — "Choose Your Sections" screen
4. **resume-edit** — "Review & Edit" screen
5. **template-select** — "Choose a Template" screen
6. **generating** — spinner while backend generates site
7. **done** — "Your Resume Site is Ready" screen

## Playwright MCP workflow

### 1. Navigate
```
mcp__playwright__browser_navigate { url: "http://localhost:4200" }
```

### 2. Upload file
```
mcp__playwright__browser_click { ref: <drop-zone ref> }
// wait for modal state: [File chooser]
mcp__playwright__browser_file_upload { paths: ["/Users/clarkpfohl/Desktop/Code_Projects/resume-website-builder/test-resume.pdf"] }
```

### 3. Wait for state changes
```
mcp__playwright__browser_wait_for { text: "Choose Your Sections" }
mcp__playwright__browser_wait_for { text: "Review & Edit" }
mcp__playwright__browser_wait_for { text: "Choose a Template" }
mcp__playwright__browser_wait_for { text: "Your Resume Site is Ready" }
```

### 4. Snapshot the page
```
mcp__playwright__browser_snapshot {}                         // returns YAML accessibility tree
mcp__playwright__browser_snapshot { depth: 4 }              // shallower, faster
mcp__playwright__browser_snapshot { filename: "out.yml" }   // saves to /Users/clarkpfohl/Desktop/claude/playwright-mcp/out.yml
```

### 5. Click undetected sections (e.g. Relevant Coursework)
The accessibility tree may not show deep enough — use JS eval to click by text:
```
mcp__playwright__browser_evaluate {
  function: "() => { const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Relevant Coursework')); if(btn){btn.scrollIntoView();btn.click();return 'clicked';} return 'not found'; }"
}
```

### 6. Interact with buttons by ref
Always get a fresh snapshot to get current refs. Refs change between snapshots.

### 7. Check generated output
Generated sites are written to:
`/Users/clarkpfohl/Desktop/Code_Projects/resume-website-builder/backend/sites/<uuid>/index.html`

Latest site:
```bash
LATEST=$(ls -t backend/sites/ | head -1)
grep "SomeText" backend/sites/$LATEST/index.html
```

## Common gotchas
- **API calls 404**: Frontend not started with `--proxy-config proxy.config.json`
- **File upload denied**: Resume PDF must be inside the project directory
- **Iframe content inaccessible**: Generated site iframe is cross-origin — check disk files instead
- **Refs stale**: Always re-snapshot after any click/interaction before using refs
- **`<details>` expand**: Click the `<summary>` element (the "Add sections not found" row) before its children are accessible in the tree
- **Backend exits**: `npm run dev` uses nodemon — if source files change mid-test it may restart
