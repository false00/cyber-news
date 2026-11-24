# Compatibility notes

`@false00/cyber-news` is intentionally small, but it still depends on Pi's extension APIs and outbound network access to public feeds.

## Current expectations

- **Node.js:** `>=22.19.0`
- **Pi runtime:** `@earendil-works/pi-coding-agent` versions `>=1.5.0 <2.0.0` with the extension and `ctx.ui` APIs used in `index.ts`
- **Network:** outbound HTTPS access to the enabled RSS and Atom sources
- **Config storage:** read/write access to `~/.config/cyber-news/sources.json` for source enablement persistence

## Verified in this repository

These are the things directly verified during maintenance work in this repo:

- `npm run typecheck`
- `npm run build`
- `npm test`
- `npm pack --dry-run`

During this audit, the repository was exercised locally on:

- **Node.js:** `v24.22.3`
- **npm:** `11.16.0`
- **Installed Pi package types available during development:** `@earendil-works/pi-coding-agent@1.6.0`

## Pi compatibility guidance

The extension continues to use stable Pi APIs and is typechecked and tested against Pi 1.6.0:

- `pi.on(...)`
- `pi.registerCommand(...)`
- `pi.appendEntry(...)`
- `ctx.ui.notify(...)`
- `ctx.ui.select(...)`
- `ctx.ui.setWidget(...)`

Pi 1.5.0 is the minimum supported host because it includes the undici TLS-validation fixes. Both Pi and this package require Node.js `>=22.19.0`; CI runs the typecheck, build, and test suite on Node.js 22 and 24.

The `<2.0.0` upper bound follows semver for Pi 1.x, so later 1.x minors are accepted before this repository has tested them. Dependabot's weekly minor and patch updates bring each new Pi minor into CI for typechecking and tests. If Pi changes widget rendering, command context, or session custom-entry behavior in a future release, re-test the package before publishing a new release.

## Feed compatibility guidance

News sources can change feed URLs, XML structure, or HTML encoding over time.

The current parser is designed to handle both RSS-style `<item>` entries and Atom-style `<entry>` entries, common date fields such as `<pubDate>`, `<updated>`, `<published>`, and namespaced `<dc:date>`, with a fallback `<title>` scan for less common feeds. If a source stops returning headlines or dates, verify the upstream feed before assuming a local code regression.
