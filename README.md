# @false00/cyber-news

[![npm version](https://img.shields.io/npm/v/@false00/cyber-news.svg)](https://www.npmjs.com/package/@false00/cyber-news)
[![license](https://img.shields.io/npm/l/@false00/cyber-news.svg)](LICENSE)
[![CI](https://github.com/false00/cyber-news/actions/workflows/ci.yml/badge.svg)](https://github.com/false00/cyber-news/actions/workflows/ci.yml)

Interactive cybersecurity news briefing for the Pi coding agent.

`@false00/cyber-news` adds a Pi-native header widget that pulls live headlines from 14 cybersecurity sources, lets you manage sources from the TUI, and can queue a deep-dive research prompt for any story you pick.

| Resource | Link |
|---|---|
| npm | [`@false00/cyber-news`](https://www.npmjs.com/package/@false00/cyber-news) |
| GitHub | [github.com/false00/cyber-news](https://github.com/false00/cyber-news) |
| License | [MIT](LICENSE) |
| Changelog | [CHANGELOG.md](CHANGELOG.md) |
| Security policy | [SECURITY.md](SECURITY.md) |
| Contributing guide | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Compatibility notes | [docs/COMPATIBILITY.md](docs/COMPATIBILITY.md) |

## Why this package

This package is for Pi users who want a lightweight, always-available cybersecurity news surface inside the TUI without leaving their current session.

What it does well:

- **Live multi-source feed** — fetches enabled RSS and Atom feeds in parallel
- **Readable Pi widget** — width-aware rendering that avoids the broken wrapping shown by earlier builds
- **Interactive source management** — `/cyber_sources` opens a simple TUI source manager
- **Deep-dive handoff** — `/cyber_menu` queues a focused research prompt for a selected headline
- **Session-aware state** — enabled source choices persist in the session branch through Pi custom entries
- **Graceful refresh behavior** — the widget auto-refreshes every minute and keeps the last good headlines when a refresh comes back empty

## Trust model and operating behavior

This extension is intentionally narrow in scope.

Important expectations:

- It **does not register custom LLM tools**; it only adds Pi commands, a widget, and lifecycle hooks
- It **fetches public RSS/Atom feeds over HTTPS** from the configured news sources
- It **does not require API keys, secrets, or local config files**
- Choosing a story from `/cyber_menu` sends a hidden user-style message into Pi to trigger a research turn
- Source enable/disable state is persisted in the current Pi session branch via custom session entries

If you are evaluating the package for team or long-term use, review:

- [AGENTS.md](AGENTS.md)
- [CHANGELOG.md](CHANGELOG.md)
- [SECURITY.md](SECURITY.md)
- [tests/](tests/)

## Install

Install into Pi as a package:

```bash
pi install npm:@false00/cyber-news
```

Run it from this repository during local development:

```bash
pi -e .
```

## Commands

| Command | Description |
|---|---|
| `/cyber_menu` | Open a headline picker for deep-dive research on a story. |
| `/cyber_refresh` | Refresh the widget with the latest headlines from enabled sources. |
| `/cyber_sources` | Open the source manager in TUI, or print source status in non-TUI mode. |
| `/cyber_enable <source name>` | Enable a source by exact or partial name. |
| `/cyber_disable <source name>` | Disable a source by exact or partial name. |

## Widget behavior

The widget:

- renders above the editor
- shows the top prioritized headlines from enabled sources
- auto-refreshes every 60 seconds
- keeps layout bounded to the widget width instead of guessing based on the full terminal width
- preserves the last good refresh if a later refresh comes back empty

## Sources

Top 3 are enabled by default.

| # | Source | Icon | Default |
|---|---|---|---|
| 1 | BleepingComputer | 💻 | ✅ enabled |
| 2 | The Hacker News | 📰 | ✅ enabled |
| 3 | Krebs on Security | 🔍 | ✅ enabled |
| 4 | WeLiveSecurity (ESET) | 🦠 | ❌ disabled |
| 5 | Graham Cluley | 🐦 | ❌ disabled |
| 6 | Securelist | 🛡️ | ❌ disabled |
| 7 | Darknet Diaries | 🎙️ | ❌ disabled |
| 8 | SANS ISC | 🌐 | ❌ disabled |
| 9 | Schneier on Security | 🔐 | ❌ disabled |
| 10 | Sophos Security Ops | 🛡️ | ❌ disabled |
| 11 | Sophos Threat Research | 🔬 | ❌ disabled |
| 12 | Troy Hunt | 🔑 | ❌ disabled |
| 13 | USOM Threats | 🌍 | ❌ disabled |
| 14 | USOM Announcements | 📢 | ❌ disabled |

## Deep-dive workflow

A typical flow looks like this:

1. Start Pi with the package enabled
2. Let the widget populate from the enabled sources
3. Run `/cyber_menu`
4. Pick a story
5. Pi receives a hidden follow-up prompt asking for:
   - Executive Summary
   - Why It Matters
   - Technical Details / likely TTPs
   - Immediate Mitigations
   - What to Monitor Next

## Repository layout

```text
dist/                     Compiled extension output committed to the repo
index.ts                  TypeScript source
tests/                    Non-network unit and package-structure tests
docs/COMPATIBILITY.md     Compatibility notes
README.md                 User-facing package documentation
AGENTS.md                 Maintainer and agent guidance
CONTRIBUTING.md           Contributor workflow
SECURITY.md               Vulnerability reporting policy
CHANGELOG.md              Release history
```

## Compatibility

Current project expectations:

- Node.js `>=20`
- Pi extension runtime support
- outbound HTTPS access to the enabled news feeds

See [docs/COMPATIBILITY.md](docs/COMPATIBILITY.md) for the maintained notes.

## Development

```bash
npm install
npm test
npm pack --dry-run
```

The test suite covers:

- feed title extraction behavior
- source-query matching behavior
- widget line-width formatting guarantees
- package metadata and publish-file expectations

## Publishing

```bash
npm pack --dry-run
npm publish
```

Versioning and release discipline live in [AGENTS.md](AGENTS.md).

## License

MIT — see [LICENSE](LICENSE).
