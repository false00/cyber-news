# `@false00/cyber-news`

Interactive cybersecurity news extension for the Pi coding agent — aggregates live feeds from 14 industry sources and provides deep-dive research prompts.

## Project structure

- `dist/` — compiled JavaScript output (entry: `dist/index.js`)
- Source is TypeScript in `index.ts`
- `tests/` — unit and package-structure tests run with Node's built-in test runner
- `docs/COMPATIBILITY.md` — maintained compatibility notes
- `tsconfig.json` controls the build

## Key conventions

- **Default export** in `dist/index.js` — the extension function registered with Pi
- **Command naming** — all commands are prefixed `cyber_`
- **Widget key** — `"cyber-news"`
- **State persistence** — source enable/disable state is persisted via Pi custom entries under `cyber-news-config`
- **Session restoration** — source state is restored on `session_start` and `session_tree`
- **Session cleanup** — timers and widget state are torn down on `session_shutdown`
- **Source matching** — `/cyber_enable` and `/cyber_disable` accept exact or partial source names
- **Source manager** — `/cyber_sources` opens an interactive manager in TUI mode and falls back to a status list elsewhere
- **Multi-source fetching** — feeds are fetched in parallel with `Promise.allSettled`; individual source failures are swallowed
- **Widget rendering** — render against Pi's provided widget width, not `process.stdout.columns`
- **Cache fallback** — if a refresh returns no items, the last good headlines remain visible
- **Item type** — `NewsItem { title, icon, weight, source }` where lower `weight` means higher priority

## Documentation rules

Documentation must match code. When changing a command, parameter, or behavior, update all relevant places:

1. Command `description` strings in `index.ts`
2. `README.md`
3. `AGENTS.md`
4. `CHANGELOG.md` when the shipped behavior changed

## Project quirks

- `dist/` is committed — always rebuild before finishing
- The project intentionally does **not** register custom LLM tools; it only adds commands, UI, and lifecycle behavior
- The package should stay honest about limitations. Do not claim feed reliability, accuracy, or compatibility that has not been verified

## Commit & publish policy

- Never commit without explicit user approval
- Never push or publish without explicit user approval

### Publishing workflow

When the user asks to publish:

1. Check the current npm version in `package.json`
2. Check the latest git tag — it should match `v{version}`
3. If the version changed and the tag does not match, create the matching tag
4. Run `npm pack --dry-run`
5. Use `npm version patch|minor|major` for version bumps instead of editing `package.json` manually
6. Run `npm publish`
7. If 2FA is enabled, complete the npm browser/device auth flow when prompted
