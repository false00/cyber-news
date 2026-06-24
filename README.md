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
- **Persistent source state** — enabled source choices persist across Pi sessions in `~/.config/cyber-news/sources.json`
- **Ephemeral banner behavior** — the widget shows a short-lived headline banner, then disappears instead of lingering forever
- **Pi-native packaging** — installable through npm as a normal Pi package

## Design philosophy

This package is intentionally a **small, TUI-native news briefing extension** for Pi.

That means:

- it focuses on concise headline discovery rather than becoming a full threat-intelligence platform
- it favors predictable rendering over dense layouts that look impressive but break in real terminals
- it keeps persistence lightweight with a single user-level JSON file for source state
- it tries to be explicit about what is confirmed versus what Pi may infer during a deep-dive follow-up

## Stability guarantees

This repository aims to provide a stable lightweight automation surface for Pi users.

Current guarantees:

- published command names are treated as stable once released
- the widget remains width-aware and should not guess based on full terminal width
- source state persists through the documented `~/.config/cyber-news/sources.json` file
- the public behavior stays command-driven; the package does not currently expose custom Pi tools

## Trust, safety, and operating model

This extension is intentionally narrow in scope.

Important expectations:

- It **does not register custom LLM tools**; it only adds Pi commands, a widget, and lifecycle hooks
- It **fetches public RSS/Atom feeds over HTTPS** from the configured news sources
- It **does not require API keys or secrets**; it creates `~/.config/cyber-news/sources.json` only for source preferences
- Choosing a story from `/cyber_menu` sends a hidden user-style message into Pi to trigger a research turn
- Source enable/disable state persists globally in `~/.config/cyber-news/sources.json`; legacy Pi session entries are only used for migration/fallback
- Deep-dive output quality depends on the current model and the available public reporting behind the selected headline

If you are evaluating the package for team or long-term use, review:

- [AGENTS.md](AGENTS.md)
- [CHANGELOG.md](CHANGELOG.md)
- [SECURITY.md](SECURITY.md)
- [docs/COMPATIBILITY.md](docs/COMPATIBILITY.md)
- [tests/](tests/)

## Install

Install into Pi as a package:

```bash
pi install npm:@false00/cyber-news
```

Use it for a single run without changing your settings:

```bash
pi -e npm:@false00/cyber-news
```

Run it from this repository during local development:

```bash
pi -e .
```

## Quick start

A typical flow:

```text
/cyber_sources
/cyber_enable sophos
/cyber_refresh
/cyber_menu
```

You can also ask Pi to help operate the extension in plain English, for example:

```text
Enable SANS ISC in the cyber-news extension
Refresh the cyber-news widget
Open the cyber-news headline menu
Disable Troy Hunt in the cyber-news extension
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
- shows fresh, prioritized headlines from enabled sources
- filters dated items older than 7 days when fresher headlines are available, so old high-severity stories do not stay pinned
- disappears after 60 seconds unless you manually refresh it again
- keeps layout bounded to the widget width instead of guessing based on the full terminal width
- uses broader headline categorization so more stories get specific emoji instead of a generic fallback

## Sources

Top 3 are enabled by default. Source choices persist globally in `~/.config/cyber-news/sources.json`; the folder and JSON file are created automatically the first time the extension starts or sources are changed.

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

## Support and feedback

When reporting problems, include the package version, Pi version, command used, and source name if relevant.

## See also

- [AGENTS.md](AGENTS.md) — maintainer and agent guidance
- [CHANGELOG.md](CHANGELOG.md) — release history
- [CONTRIBUTING.md](CONTRIBUTING.md) — contributor workflow
- [SECURITY.md](SECURITY.md) — security policy
- [docs/COMPATIBILITY.md](docs/COMPATIBILITY.md) — compatibility notes

## License

MIT — see [LICENSE](LICENSE).
