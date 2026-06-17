# Contributing to `@false00/cyber-news`

Thanks for contributing.

This project is small, but it is user-facing inside Pi and should stay polished, predictable, and honest.

## Principles

- Prefer correctness over flashy behavior
- Keep widget output readable in narrow terminals
- Keep docs aligned with shipped behavior
- Avoid unverified claims about sources, compatibility, or security
- Preserve the package's narrow scope

## Repository layout

```text
index.ts                  TypeScript source of truth
dist/                     Compiled output committed to the repo
tests/                    Unit and package-structure tests
docs/COMPATIBILITY.md     Compatibility notes
README.md                 User-facing documentation
AGENTS.md                 Maintainer and agent guidance
SECURITY.md               Vulnerability reporting policy
CHANGELOG.md              Release history
```

## Local development

```bash
npm install
npm test
npm pack --dry-run
```

## Change checklist

Before handing work off or opening a PR:

1. Update `index.ts`
2. Rebuild `dist/`
3. Update `README.md` for user-visible changes
4. Update `AGENTS.md` if maintainer or agent behavior changed
5. Update `CHANGELOG.md` for shipped changes
6. Add or update tests
7. Run `npm test`
8. Run `npm pack --dry-run` if packaging or metadata changed

## Testing expectations

This repo currently prefers non-network tests so the suite stays fast and stable.

Good contributions usually include tests for:

- feed-title parsing behavior
- source name matching
- widget formatting guarantees
- package metadata and publish-file expectations

## Release policy

Maintainers do not commit, push, or publish from agent sessions unless the user explicitly asks for it.
