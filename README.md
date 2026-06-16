# Cybersecurity News Extension

Aggregates live cybersecurity headlines from **14 industry sources** into the Pi TUI header widget, with visual categorization (30+ emoji categories) and one-click deep-dive research summaries.

## Features

- **Live Feed**: Fetches the latest stories from all sources in parallel on session start.
- **Visual Categorization**: 30+ emoji-categories auto-assigned by headline keywords (ransomware, zero-day, APT, phishing, supply-chain, etc.).
- **Source Attribution**: Every headline shows which source it came from.
- **Interactive Selection**: `/cyber_menu` — pick any headline for an AI deep-dive analysis.
- **Refresh**: `/cyber_refresh` — manually pull the latest stories.
- **Source List**: `/cyber_sources` — view all monitored sources.

## Sources

Top 3 enabled by default — best balance of volume, quality, and breaking news. Enable others with `/cyber_enable`.

| # | Source | Icon | Default |
|---|--------|------|---------|
| 1 | BleepingComputer | 💻 | ✅ enabled |
| 2 | The Hacker News | 📰 | ✅ enabled |
| 3 | Krebs on Security | 🔍 | ✅ enabled |
| 4 | WeLiveSecurity (ESET) | 🦠 | ❌ disabled |
| 5 | Graham Cluley | 🐦 | ❌ disabled |
| 6 | Securelist (Kaspersky) | 🛡️ | ❌ disabled |
| 7 | Darknet Diaries | 🎙️ | ❌ disabled |
| 8 | SANS Internet Storm Center | 🌐 | ❌ disabled |
| 9 | Schneier on Security | 🔐 | ❌ disabled |
| 10 | Sophos Security Operations | 🛡️ | ❌ disabled |
| 11 | Sophos Threat Research | 🔬 | ❌ disabled |
| 12 | Troy Hunt (Have I Been Pwned) | 🔑 | ❌ disabled |
| 13 | USOM Threats (Turkey) | ⚠️ | ❌ disabled |
| 14 | USOM Announcements (Turkey) | 📢 | ❌ disabled |

## Installation

```bash
pi install npm:@false00/cyber-news
```

## Commands

| Command | Description |
|---------|-------------|
| `/cyber_menu` | Opens interactive menu to select a headline for deep-dive summary. |
| `/cyber_refresh` | Refreshes the header with latest headlines from all sources. |
| `/cyber_sources` | Lists all sources with enabled/disabled status. |
| `/cyber_enable` `<name>` | Enable a source by name (partial match). |
| `/cyber_disable` `<name>` | Disable a source by name. |
