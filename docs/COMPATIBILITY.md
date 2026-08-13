# Compatibility notes

`@false00/cyber-news` is intentionally small, but it still depends on Pi's extension APIs and outbound network access to public feeds.

## Current expectations

- **Node.js:** `>=20`
- **Pi runtime:** `@earendil-works/pi-coding-agent` versions `>=0.79.0 <0.85.0` with the extension and `ctx.ui` APIs used in `index.ts`
- **Network:** outbound HTTPS access to the enabled RSS and Atom sources
- **Config storage:** read/write access to `~/.config/cyber-news/sources.json` for source enablement persistence

## Verified in this repository

These are the things directly verified during maintenance work in this repo:

- `npm run typecheck`
- `npm run build`
- `npm test`
- `npm pack --dry-run`

During this audit, the repository was exercised locally on:

- **Node.js:** `v26.3.0`
- **npm:** `11.16.0`
- **Installed Pi package types available during development:** `@earendil-works/pi-coding-agent@0.84.1`

## Pi compatibility guidance

The extension continues to use stable APIs available since Pi 0.79 and is typechecked and tested against Pi 0.84.1:

- `pi.on(...)`
- `pi.registerCommand(...)`
- `pi.appendEntry(...)`
- `ctx.ui.notify(...)`
- `ctx.ui.select(...)`
- `ctx.ui.setWidget(...)`

Pi 0.84.1 requires Node.js `>=22.19.0` for development. The extension keeps its own Node.js `>=20` floor because its supported peer range still includes earlier Pi versions.

If Pi changes widget rendering, command context, or session custom-entry behavior in a future major release, re-test the package before publishing a new release.

## Feed compatibility guidance

News sources can change feed URLs, XML structure, or HTML encoding over time.

The current parser is designed to handle both RSS-style `<item>` entries and Atom-style `<entry>` entries, common date fields such as `<pubDate>`, `<updated>`, `<published>`, and namespaced `<dc:date>`, with a fallback `<title>` scan for less common feeds. If a source stops returning headlines or dates, verify the upstream feed before assuming a local code regression.
