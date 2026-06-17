# `@false00/cyber-news` maintainer guide

This file is the operating manual for agents and maintainers working on `@false00/cyber-news`.

## Mission

Keep this package readable, honest, and dependable inside the Pi TUI.

The package exists to give Pi users a small, trustworthy cybersecurity news briefing surface with predictable widget behavior, accurate documentation, and conservative release practices.

## Repository map

- `index.ts` — TypeScript source of truth for the extension
- `dist/index.js` — compiled default-exported Pi extension entrypoint
- `dist/index.d.ts` — published type declarations
- `tests/news.test.ts` — feed parsing, source matching, and widget-width formatting checks
- `tests/package.test.ts` — package metadata and trust-signal structure checks
- `docs/COMPATIBILITY.md` — maintained compatibility notes
- `.github/` — CI workflow and repository automation
- `README.md` — user-facing package documentation
- `CONTRIBUTING.md` — contributor workflow
- `SECURITY.md` — security and disclosure policy
- `CHANGELOG.md` — release history

## Project facts

- The project is **TypeScript**.
- `dist/` is **committed directly**.
- The package is intended for **Pi package installation via npm**.
- The extension entrypoint must remain registered in `package.json` under `pi.extensions`.
- The project intentionally **does not register custom LLM tools**; it adds commands, a widget, and lifecycle behavior only.
- The current Node.js floor is **20+**.

## Pi package conventions

Follow current Pi package guidance:

- Keep the `pi-package` keyword in `package.json`.
- Preserve `pi.extensions` so Pi can load the package root directly.
- If package metadata changes, make sure `npm pack --dry-run` still includes the intended runtime files and top-level docs.
- Use Pi session custom entries for branch-aware persistence instead of ad hoc local files.
- Render widgets against Pi's provided widget width, not guessed terminal width.

## Coding standards

- Prefer small, explicit helpers over clever abstractions.
- Keep command descriptions concise and agent-readable.
- Preserve stable command names; all commands must remain prefixed with `cyber_`.
- Do not present inferred threat details as confirmed facts.
- Never fabricate feed reliability, upstream source behavior, or Pi runtime behavior.
- Keep the package narrow in scope; resist turning it into a general-purpose threat-intel platform unless the repo is intentionally redesigned for that.

## Runtime guarantees

Maintain these behavioral guarantees:

- `/cyber_menu`, `/cyber_refresh`, `/cyber_sources`, `/cyber_enable`, and `/cyber_disable` remain the public command surface.
- `/cyber_enable` and `/cyber_disable` continue to support exact or partial source-name matching.
- `/cyber_sources` remains interactive in TUI mode and falls back to plain status output outside TUI mode.
- Widget rendering stays width-aware and must not depend on `process.stdout.columns`.
- The widget is an ephemeral banner: when its countdown expires, it should clear itself instead of auto-refreshing forever.
- Source enable/disable state must remain branch-aware through Pi custom session entries.
- Selecting a story for deep-dive research should continue to inject a hidden Pi message rather than exposing raw internal prompt text to the user by default.
- Timers and widget state must be cleaned up on `session_shutdown`.

## Documentation policy

Documentation must match code.

Whenever you change a command, default, widget behavior, source list, emoji categorization, or persistence behavior, update all affected docs:

1. Command `description` strings in `index.ts`
2. `README.md`
3. `AGENTS.md` if maintainer or agent expectations changed
4. `CHANGELOG.md` when shipped behavior changed
5. `CONTRIBUTING.md` or `SECURITY.md` if contributor or trust processes changed

Before finishing, grep for stale references:

- old command descriptions
- outdated source counts
- outdated Node.js requirements
- outdated widget behavior
- removed or renamed files

## Testing policy

Every code change should be backed by tests appropriate to the behavior being touched.

Current suites:

- `tests/news.test.ts` — feed parsing, source matching, and widget formatting behavior
- `tests/package.test.ts` — package metadata, published file expectations, and README command coverage

Expectations:

- Run `npm test` before considering work complete.
- Run `npm pack --dry-run` when packaging or metadata changes.
- New parsing or formatting behavior should include both success-path and edge-case coverage where practical.
- User-facing packaging or documentation changes should include a structural or metadata check when feasible.
- Keep the test suite non-network by default unless the project explicitly decides to add live-feed validation later.

## Security and trust posture

Treat this package as user-facing runtime software, not a throwaway demo.

- Do not add hidden telemetry.
- Do not add credential handling unless it is explicitly documented and justified.
- Do not log secrets, cookies, or private tokens in code, docs, or tests.
- Prefer explicit limitations over vague marketing language.
- If a behavior is uncertain, say so and inspect the code or upstream feed instead of guessing.

## Release discipline

- Never commit without explicit user approval.
- Never push or publish without explicit user approval.
- Do not skip npm versions.
- Dry-run with `npm pack --dry-run` before publish.
- Keep tags aligned with `package.json` versions.
- If npm browser auth / 2FA interrupts publish flow, tell the user plainly and let them complete the auth flow rather than pretending publish succeeded.
- If the user wants to finish the release manually after prep is done, provide the one-liner `npm publish --ignore-scripts && git push origin master --tags`.
- If the first publish attempt stops to show a browser-auth URL, tell the user to complete that auth flow and then rerun the same one-liner.

## Release checklist

When asked to prepare a release:

1. Run `npm test`
2. Run `npm pack --dry-run`
3. Verify `package.json` metadata is current
4. Verify `README.md` and `AGENTS.md` reflect shipped behavior
5. Check whether the current version is already published before bumping
6. Only commit, tag, push, or publish with explicit user approval
7. If the user prefers to finish the release manually, provide the publish/push one-liner instead of repeatedly retrying around browser-auth prompts
