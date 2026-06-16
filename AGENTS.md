# `@false00/cyber-news`

Interactive cybersecurity news extension for the Pi coding agent — aggregates live feeds from 14 industry sources and provides deep-dive research summaries.

## Project structure

- `dist/` — compiled JavaScript output (entry: `dist/index.js`)
- Source is TypeScript (`index.ts`) compiled directly to `dist/`
- `tsconfig.json` controls the build

## Key conventions

- **Default export** in `dist/index.js` — the extension function registered with Pi
- **Command naming** — all commands prefixed `cyber_` (e.g. `cyber_menu`, `cyber_refresh`, `cyber_sources`, `cyber_enable`, `cyber_disable`)
- **Error handling** — console.error for failures, ctx.ui.notify for user-facing messages
- **Widget key** — `"cyber-news"` for the header widget
- **Multi-source** — 14 RSS sources fetched in parallel via `Promise.allSettled`; individual source failures are silently swallowed
- **Item types** — `NewsItem { title, icon, weight, source }` — weight = priority (lower = more important)
- **Source enable/disable** — each `RssSource` has an `enabled` boolean; only enabled sources are fetched. Top 3 sources enabled by default (BleepingComputer, The Hacker News, Krebs on Security)

## Documentation rules

- **Documentation must always match code.** When adding/changing a command, parameter, or behavior, update all of:
  1. The command's `description` string in `index.ts`
  2. `README.md` — the commands table and any relevant prose
  3. `AGENTS.md` — if the change affects how an agent should interact with the package

- **Verify before finishing.** After any code change, grep for stale references.

- **Command descriptions are agent-facing documentation.** Keep them accurate and concise.

## Project quirks

- **`dist/` is committed** — compiled output is checked in. Always rebuild before committing.

## Commit & publish policy

- **Never commit without explicit user approval.** Wait for the user to say "commit" or "stage and commit". Do not commit automatically.
- **Never push or publish without explicit user approval.**

### Publishing workflow

When the user asks to publish:

1. **Check the current npm version** in `package.json`
2. **Check the latest git tag** — should match `v{version}` format
3. **Verify the git tag matches the npm version.** If version was bumped, the tag must also be updated. If they don't match, create the tag:
   ```
   git tag v{version}
   ```
4. **Dry-run first:** `npm pack --dry-run` to verify the package contents include `dist/`, `AGENTS.md`, `README.md`, `LICENSE`
5. **Use `npm version patch|minor|major` to bump version** — this updates `package.json` and creates a matching git tag in one step. Do NOT edit `package.json` manually.
6. **Publish:**
   ```
   npm publish
   ```
7. If 2FA is enabled, npm will prompt for browser authentication before completing.
8. **Increment the package version** if the scope of changes warrants it. Follow semver:
   - Patch (`1.0.0 → 1.0.1`) for bug fixes and minor doc changes
   - Minor (`1.0.0 → 1.1.0`) for new commands or behavioral changes
   - Major (`1.0.0 → 2.0.0`) for breaking changes
