# Changelog

All notable changes to `@false00/cyber-news` are documented here.

## Unreleased

### Added
- Dependabot updates for npm dependencies and GitHub Actions.
- GitHub security automation with dependency review on pull requests and scheduled CodeQL scanning.
- A bundled README widget preview asset plus package tests that lock in Pi discovery metadata.

### Changed
- Bumped the local Pi dev dependency floor to `@earendil-works/pi-coding-agent@^0.79.10` so `npm audit` clears the current high-severity transitive findings.

## 1.1.6 - 2026-07-01

### Fixed
- The Cyber News widget now clears itself when Pi starts an agent run, so it does not linger onscreen during long tool or subagent work.

## 1.1.5 - 2026-07-01

### Fixed
- Widget headline rendering now uses grapheme-aware width measurement for emoji, so BMP icons like `⚡` no longer overflow Pi's exact widget width and crash narrow sessions.
- Widget layout now respects the exact width provided by Pi instead of expanding to an internal minimum width on narrow terminals.

## 1.1.4 - 2026-06-24

### Changed
- Source enablement now persists globally in `~/.config/cyber-news/sources.json`, with automatic folder/file creation and legacy session-state migration.

## 1.1.3 - 2026-06-24

### Changed
- Added feed-date parsing and freshness-aware ranking so dated headlines older than 7 days no longer outrank fresher stories when newer items are available.

## 1.1.2 - 2026-06-17

### Changed
- The widget countdown now behaves like a true ephemeral banner again: it hides when the timer expires instead of auto-refreshing indefinitely.
- Expanded headline categorization so more stories get specific emoji coverage, with a friendlier news-style fallback for uncategorized headlines.

## 1.1.1 - 2026-06-17

### Changed
- Refined `README.md` and `AGENTS.md` again after reviewing the structure used in `../pi-proxmox`, adding clearer design-philosophy, stability, quick-start, repository-map, runtime-guarantee, and release-checklist guidance.

## 1.1.0 - 2026-06-17

### Added
- `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`, and `docs/COMPATIBILITY.md`
- Non-network test coverage for feed parsing, source matching, widget formatting, and package metadata
- GitHub CI workflow for typecheck, build, test, and package dry-run
- Package metadata links for homepage, bugs, docs, and published support files
- Explicit dev dependency on `@earendil-works/pi-coding-agent@^0.79.6` plus a narrowed `0.79.x` peer range

### Changed
- Reworked the widget to render against Pi's provided widget width instead of guessing terminal width
- Simplified the widget layout to avoid broken wrapping and mid-word line breaks
- Widget now auto-refreshes every 60 seconds instead of clearing itself after one countdown cycle
- Source enable/disable state now persists in the current Pi session branch
- `/cyber_sources` now acts as an interactive source manager in TUI mode
- `/cyber_enable` and `/cyber_disable` now support exact or partial source-name matching
- Deep-dive prompt wording now asks Pi to distinguish confirmed facts from inference
- README and AGENTS documentation were rewritten to better reflect actual behavior
- Local dependency resolution now targets Pi `0.79.6`, which cleared the previously inherited `npm audit` findings in the dev environment

### Fixed
- Removed stale documentation claiming partial source matching before the code actually supported it
- Added session-shutdown cleanup for widget timers
- Kept the last good headlines visible when a refresh returns no items

## 1.0.2 - 2026-06-16

- Initial published package state before the trust, formatting, and repo-hardening audit in the current unreleased section.
