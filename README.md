# Cybersecurity News Extension

An extension for Pi that adds an interactive cybersecurity news header to the TUI. It provides real-time headlines from BleepingComputer and allows you to trigger deep-dive research summaries with one click.

## Features

- **Live Feed**: Fetches the top 5 latest security headlines automatically on session start.
- **Visual Indicators**: Automatically categorizes headlines into types (Breach, Patch, Malware, Info) with corresponding icons.
- **Interactive Selection**: Use `/cyber_menu` to see a list of available headlines and select one for investigation.
- **AI Deep Dives**: When you select a headline, the extension instructs pi to perform a deep research analysis and provide an Executive Summary including technical details and mitigation steps.

## Installation

Install via NPM:
```bash
pi install npm:@false00/cyber-news
```

## Commands

| Command | Description |
|---------|-------------|
| `/cyber_menu` | Opens the interactive news selection menu. |
| `/cyber_refresh` | Manually updates the header with the latest headlines. |

## Contributing

Feel free to submit pull requests or open issues in this repository!
