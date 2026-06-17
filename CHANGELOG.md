# Changelog

All notable changes to `@false00/cyber-news` are documented here.

## Unreleased

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
