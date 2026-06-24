# Security policy

`@false00/cyber-news` is a Pi extension that fetches public news feeds and injects a hidden research prompt when the user selects a story.

## Security posture

This package aims to stay:

- explicit about what it does
- free of hard-coded secrets
- conservative about persistence
- honest about feed and runtime limitations

## What this package does

Security-relevant behavior:

- fetches public RSS and Atom feeds over HTTPS
- stores enabled-source state in `~/.config/cyber-news/sources.json`, with legacy Pi custom session entries used only for migration/fallback
- injects a hidden user-style message when `/cyber_menu` is used
- renders a live widget above the editor in Pi

## What this package does not do

- no custom LLM tools
- no shell execution
- no local file writes outside normal npm/package files except `~/.config/cyber-news/sources.json` for source preferences
- no credential handling
- no external API keys

## Reporting a vulnerability

If you discover a security issue, report it privately to the maintainer before opening a public issue.

Current maintainer contact from `package.json`:

- `false00 <jortega@curl.red>`

Please include:

- package version
- Pi version
- affected command or code path
- reproduction steps
- impact assessment

## Areas worth reviewing carefully

- source-preference persistence in `~/.config/cyber-news/sources.json`
- hidden prompt injection for deep-dive workflows
- feed parsing logic for malformed or hostile XML content
- package-install trust signals and published file set

## Secrets handling expectations

- do not commit tokens, cookies, or private feed URLs
- do not add telemetry or analytics without explicit documentation
- keep the package dependency surface small and review changes before publishing
