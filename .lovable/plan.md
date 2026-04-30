# Pre-Publish Verification Check

## Important findings from exploration

Before building the check, I need to flag what's actually in the codebase versus what the request assumes is there:

| Feature | Status in code |
|---|---|
| Title update ("Art of Aviation Community Mural \| Reno 250…") | Present in `index.html` |
| Gillemot Foundation **text** mention | Present in `src/pages/Register.tsx` (lines 583, 588, 591, 1175) |
| Gillemot Foundation **logo image** | **Missing** — `src/assets/` has artown, discovery, rwf, soc logos but no `gillemot-logo.*` |
| Video section | Only user-uploaded video support on `/follow-along`. No hero/marketing video section exists |
| Dropoff page | **Missing** — no `/dropoff` route in `src/App.tsx`, no file references "dropoff" |

So a check that asserts "Gillemot logo + video + dropoff page exist" would fail today. We have two options for what the check should actually do — see Question 1 below.

## What the check will do

A Node script (`scripts/prepublish-check.ts`) runs `bun run scripts/prepublish-check.ts` and exits non-zero if any required asset/route/string is missing. Output is a clear pass/fail table the user can read before clicking Publish → Update.

For each item, the script verifies one of:
- **File exists** (e.g., `src/assets/gillemot-logo.png`)
- **String present** in a target file (e.g., title in `index.html`)
- **Route registered** in `src/App.tsx` (regex match on `<Route path="/dropoff"`)
- **Built bundle contains hash of asset** (run `vite build` to `dist/`, then grep `dist/assets/` for expected filenames/strings — this is the "in the frontend bundle" guarantee)

## Files to create

1. **`scripts/prepublish-check.ts`** — the checker. Reads a checklist, runs `vite build` into a temp dir, asserts each item against both source files and the built bundle, prints a colored summary, exits 0/1.
2. **`scripts/prepublish-checklist.json`** — declarative list of checks so non-devs can edit it:
   ```json
   [
     { "name": "Page title updated", "type": "string", "file": "index.html", "contains": "Art of Aviation Community Mural | Reno 250" },
     { "name": "Gillemot logo asset", "type": "file", "path": "src/assets/gillemot-logo.png" },
     { "name": "Gillemot logo in bundle", "type": "bundle", "contains": "gillemot-logo" },
     { "name": "Video section on FollowAlong", "type": "string", "file": "src/pages/FollowAlong.tsx", "contains": "<video" },
     { "name": "Dropoff route registered", "type": "string", "file": "src/App.tsx", "contains": "path=\"/dropoff\"" }
   ]
   ```
3. **`package.json`** — add script: `"prepublish:check": "bun run scripts/prepublish-check.ts"`.

## How the user runs it

Before clicking Publish → Update they (or I) run the script in the chat. If everything passes, publish. If anything fails, the output names the missing item and the file it expected to find it in.

## Open questions

I need your answers before implementing — see questions below.
