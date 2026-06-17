const NEWS_TITLE = "Cyber Briefing";
const SOURCE_STATE_ENTRY = "cyber-news-config";
const DEFAULT_ENABLED_SOURCE_NAMES = new Set([
    "BleepingComputer",
    "The Hacker News",
    "Krebs on Security",
]);
const MIN_WIDGET_WIDTH = 32;
const MAX_WIDGET_ITEMS = 6;
const MAX_MENU_ITEMS = 30;
const ITEMS_PER_SOURCE = 3;
const FETCH_TIMEOUT_MS = 10_000;
const AUTO_REFRESH_MS = 60_000;
const SPINNER_CHARS = ["◐", "◓", "◑", "◒"];
let tickCount = 0;
let countdownInterval = null;
let widgetStartTime = 0;
let cachedHeadlines = [];
let cachedEnabledCount = 0;
let lastRefreshUsedCache = false;
let isRefreshing = false;
const SOURCES = [
    { name: "BleepingComputer", url: "https://www.bleepingcomputer.com/feed/", enabled: true },
    { name: "The Hacker News", url: "https://feeds.feedburner.com/TheHackersNews?format=xml", enabled: true },
    { name: "Krebs on Security", url: "https://krebsonsecurity.com/feed/", enabled: true },
    { name: "WeLiveSecurity", url: "https://feeds.feedburner.com/eset/blog", enabled: false },
    { name: "Graham Cluley", url: "https://grahamcluley.com/feed/", enabled: false },
    { name: "Securelist", url: "https://securelist.com/feed/", enabled: false },
    { name: "Darknet Diaries", url: "https://podcast.darknetdiaries.com/", enabled: false },
    { name: "SANS ISC", url: "https://isc.sans.edu/rssfeed_full.xml", enabled: false },
    { name: "Schneier on Security", url: "https://www.schneier.com/feed/atom/", enabled: false },
    { name: "Sophos Security Ops", url: "https://news.sophos.com/en-us/category/security-operations/feed/", enabled: false },
    { name: "Sophos Threat Research", url: "https://news.sophos.com/en-us/category/threat-research/feed/", enabled: false },
    { name: "Troy Hunt", url: "https://www.troyhunt.com/rss/", enabled: false },
    { name: "USOM Threats", url: "https://www.usom.gov.tr/rss/tehdit.rss", enabled: false },
    { name: "USOM Announcements", url: "https://www.usom.gov.tr/rss/duyuru.rss", enabled: false },
];
const CATEGORIES = [
    { icon: "💀", weight: 1, keywords: ["ransomware", "ransom", "lockbit", "blackcat", "alphv", "clop", "hive", "conti", "ryuk", "revil", "darkside", "encrypt", "decrypt"] },
    { icon: "🚨", weight: 2, keywords: ["critical", "emergency", "urgent", "active exploit", "cisa", "warning", "alert", "advisory"] },
    { icon: "🔓", weight: 3, keywords: ["breach", "data breach", "leak", "stolen", "drained", "heist", "exfiltration", "compromised", "data theft", "hacked", "dumped", "exposed", "data leak"] },
    { icon: "🎯", weight: 4, keywords: ["zero-day", "zeroday", "0-day", "0day", "cve", "exploit", "vulnerability", "flaw", "bug", "unpatched"] },
    { icon: "🦠", weight: 5, keywords: ["malware", "virus", "worm", "trojan", "botnet", "payload", "wiper", "spyware", "cryptojacking", "miner", "infostealer", "loader", "backdoor", "dropper", "stealer"] },
    { icon: "🎣", weight: 6, keywords: ["phishing", "spearphishing", "smishing", "vishing", "fraud", "scam", "fake", "impersonation", "identity theft"] },
    { icon: "🕵️", weight: 7, keywords: ["apt", "state-sponsored", "advanced persistent", "threat group", "nation-state", "intelligence", "espionage", "spy", "covert", "infiltration", "adversary", "cyberespionage"] },
    { icon: "🌊", weight: 8, keywords: ["ddos", "denial of service", "amplification", "flood"] },
    { icon: "🔗", weight: 9, keywords: ["supply chain", "npm", "github", "package", "dependency", "vendor", "third-party", "upstream", "software update", "repository", "malicious package", "open source", "pypi"] },
    { icon: "🔧", weight: 10, keywords: ["patch", "fixed", "resolved", "update", "remediation", "hotfix", "security bulletin", "patch tuesday"] },
    { icon: "🤖", weight: 11, keywords: ["ai", "machine learning", "llm", "deepfake", "generative", "prompt injection", "artificial intelligence", "chatgpt", "gpt", "shadow ai"] },
    { icon: "☁️", weight: 12, keywords: ["aws", "azure", "google cloud", "cloud", "saas", "infrastructure", "oracle", "servicenow"] },
    { icon: "📱", weight: 13, keywords: ["android", "ios", "iphone", "mobile", "samsung", "google play", "app store", "malicious app"] },
    { icon: "📡", weight: 14, keywords: ["iot", "router", "camera", "firmware", "embedded", "scada", "industrial", "critical infrastructure"] },
    { icon: "💰", weight: 15, keywords: ["crypto", "bitcoin", "ethereum", "blockchain", "wallet", "defi", "nft", "smart contract", "coin", "cryptocurrency"] },
    { icon: "🌐", weight: 16, keywords: ["network", "dns", "tcp", "protocol", "ssl", "tls", "vpn", "proxy", "firewall", "internet"] },
    { icon: "🔑", weight: 17, keywords: ["password", "credential", "authentication", "login", "mfa", "2fa", "sso", "oauth", "token"] },
    { icon: "📧", weight: 18, keywords: ["email", "spam", "mail", "outlook", "exchange", "dmarc", "spf", "dkim"] },
    { icon: "👁️", weight: 19, keywords: ["privacy", "surveillance", "tracking", "fingerprint", "cookies", "gdpr", "ccpa", "data protection"] },
    { icon: "⚔️", weight: 20, keywords: ["cyberwar", "warfare", "russia", "ukraine", "china", "iran", "north korea", "geopolitical", "sanction"] },
    { icon: "🌑", weight: 21, keywords: ["darknet", "dark web", "tor", "onion", "silk road", "marketplace", "dnmx"] },
    { icon: "🔍", weight: 22, keywords: ["forensic", "investigation", "analysis", "reverse engineering", "malware analysis"] },
    { icon: "📋", weight: 23, keywords: ["compliance", "regulation", "audit", "nist", "iso", "hipaa", "pci", "sox"] },
    { icon: "📜", weight: 24, keywords: ["certificate", "pki", "ca", "letsencrypt", "encryption"] },
    { icon: "🏆", weight: 25, keywords: ["bug bounty", "bounty", "hall of fame", "responsible disclosure"] },
    { icon: "🕸️", weight: 26, keywords: ["threat intel", "threat intelligence", "ttps", "ioc", "indicator", "campaign"] },
    { icon: "🔬", weight: 27, keywords: ["research", "report", "whitepaper", "study", "survey", "findings", "analysis"] },
    { icon: "🎙️", weight: 28, keywords: ["podcast", "episode", "interview", "darknet", "diaries"] },
    { icon: "🎤", weight: 29, keywords: ["conference", "talk", "keynote", "presentation", "bsides", "defcon", "black hat", "rsa", "hacker conference"] },
    { icon: "💼", weight: 30, keywords: ["job", "career", "hiring", "salary", "position", "recruitment", "layoff"] },
    { icon: "📰", weight: 31, keywords: ["weekly", "roundup", "digest", "recap", "newsletter"] },
    { icon: "📢", weight: 32, keywords: ["announce", "launch", "release", "introducing", "new tool"] },
    { icon: "📂", weight: 33, keywords: ["dox", "doxing", "pii", "personally identifiable"] },
    { icon: "⛓️", weight: 34, keywords: ["blockchain", "smart contract", "bridge", "cross-chain"] },
    { icon: "🛡️", weight: 35, keywords: ["defense", "protection", "security", "secure", "mitigation"] },
    { icon: "🌍", weight: 36, keywords: ["global", "international", "europe", "united states", "government"] },
    { icon: "⚡", weight: 37, keywords: ["speed", "performance", "fast", "rapid", "quick"] },
    { icon: "🖥️", weight: 38, keywords: ["windows", "linux", "macos", "operating system", "kernel", "driver"] },
];
function decodeEntities(text) {
    return text
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&nbsp;/g, " ")
        .replace(/&#x([0-9a-fA-F]+);/g, (_match, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
        .replace(/&#(\d+);/g, (_match, decimal) => String.fromCodePoint(Number(decimal)));
}
function stripTags(text) {
    return text.replace(/<[^>]+>/g, " ");
}
function stripAnsi(text) {
    return text.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "");
}
function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, " ")
        .trim();
}
export function extractFeedTitles(xml) {
    const titles = [];
    const blockRegex = /<(item|entry)\b[\s\S]*?<\/\1>/gi;
    const blocks = xml.match(blockRegex) ?? [];
    for (const block of blocks) {
        const match = block.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
        if (!match)
            continue;
        const raw = match[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1") ?? "";
        const title = decodeEntities(stripTags(raw)).replace(/\s+/g, " ").trim();
        if (title) {
            titles.push(title);
        }
    }
    if (titles.length > 0) {
        return titles;
    }
    const fallback = [];
    const titleRegex = /<title\b[^>]*>([\s\S]*?)<\/title>/gi;
    let match;
    while ((match = titleRegex.exec(xml)) !== null) {
        const raw = match[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1") ?? "";
        const title = decodeEntities(stripTags(raw)).replace(/\s+/g, " ").trim();
        if (title) {
            fallback.push(title);
        }
    }
    return fallback;
}
function categorize(title) {
    const lower = title.toLowerCase();
    for (const category of CATEGORIES) {
        if (category.keywords.some((keyword) => lower.includes(keyword))) {
            return { icon: category.icon, weight: category.weight };
        }
    }
    return { icon: "🔹", weight: 99 };
}
function enabledSources() {
    return SOURCES.filter((source) => source.enabled);
}
function sourceIcon(source) {
    const icons = {
        BleepingComputer: "💻",
        "Darknet Diaries": "🎙️",
        "Graham Cluley": "🐦",
        "Krebs on Security": "🔍",
        "SANS ISC": "🌐",
        "Schneier on Security": "🔐",
        Securelist: "🛡️",
        "Sophos Security Ops": "🛡️",
        "Sophos Threat Research": "🔬",
        "The Hacker News": "📰",
        "Troy Hunt": "🔑",
        "USOM Announcements": "📢",
        "USOM Threats": "🌍",
        WeLiveSecurity: "🦠",
    };
    return icons[source.name] ?? "📡";
}
function sourceOptionLabel(source) {
    const status = source.enabled ? "✅" : "❌";
    return `${status} ${sourceIcon(source)} ${source.name}`;
}
function resolveSourceMatches(query) {
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery)
        return [];
    const exactMatches = SOURCES.filter((source) => normalizeText(source.name) === normalizedQuery);
    if (exactMatches.length > 0) {
        return exactMatches;
    }
    return SOURCES
        .filter((source) => normalizeText(source.name).includes(normalizedQuery))
        .sort((left, right) => left.name.localeCompare(right.name));
}
async function fetchSource(source) {
    try {
        const response = await fetch(source.url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
        if (!response.ok)
            return [];
        const xml = await response.text();
        const titles = extractFeedTitles(xml);
        const items = [];
        const seen = new Set();
        for (const candidate of titles) {
            if (items.length >= ITEMS_PER_SOURCE)
                break;
            const title = candidate.replace(/\s+/g, " ").trim();
            const key = title.toLowerCase();
            if (!title || title.length < 6 || seen.has(key))
                continue;
            if (key.startsWith("rss feed") || key === source.name.toLowerCase())
                continue;
            seen.add(key);
            const { icon, weight } = categorize(title);
            items.push({ title, icon, weight, source: source.name });
        }
        return items;
    }
    catch {
        return [];
    }
}
async function fetchAllNews() {
    const activeSources = enabledSources();
    if (activeSources.length === 0)
        return [];
    const results = await Promise.allSettled(activeSources.map((source) => fetchSource(source)));
    const allItems = [];
    const seen = new Set();
    for (const result of results) {
        if (result.status !== "fulfilled")
            continue;
        for (const item of result.value) {
            const key = item.title.toLowerCase().slice(0, 120);
            if (seen.has(key))
                continue;
            seen.add(key);
            allItems.push(item);
        }
    }
    return allItems.sort((left, right) => left.weight - right.weight || left.source.localeCompare(right.source));
}
function visibleWidth(text) {
    const plain = stripAnsi(text);
    let width = 0;
    for (const char of plain) {
        width += char.codePointAt(0) > 0xFFFF ? 2 : 1;
    }
    return width;
}
function truncatePlain(text, width) {
    if (width <= 0)
        return "";
    if (visibleWidth(text) <= width)
        return text;
    if (width === 1)
        return "…";
    let result = "";
    let used = 0;
    for (const char of text) {
        const charWidth = char.codePointAt(0) > 0xFFFF ? 2 : 1;
        if (used + charWidth > width - 1)
            break;
        result += char;
        used += charWidth;
    }
    return `${result}…`;
}
function centerPlain(text, width) {
    const plain = truncatePlain(text, width);
    const remaining = Math.max(0, width - visibleWidth(plain));
    const left = Math.floor(remaining / 2);
    const right = remaining - left;
    return `${" ".repeat(left)}${plain}${" ".repeat(right)}`;
}
function buildHeadlineLine(item, width, theme) {
    const prefix = `${item.icon} `;
    const suffixPlain = ` · ${item.source}`;
    const titleWidth = Math.max(10, width - visibleWidth(prefix) - visibleWidth(suffixPlain));
    const title = truncatePlain(item.title, titleWidth);
    return `${prefix}${title}${theme.fg("muted", suffixPlain)}`;
}
function buildRefreshLine(width, remainingMs, theme) {
    const seconds = Math.max(0, Math.ceil(remainingMs / 1000));
    const spinner = SPINNER_CHARS[tickCount % SPINNER_CHARS.length];
    return theme.fg("success", centerPlain(`${spinner} refresh in ${seconds}s`, width));
}
function buildWidgetLines(width, theme, items, enabledCount, totalSources, remainingMs, usedCache) {
    const safeWidth = Math.max(MIN_WIDGET_WIDTH, width);
    const subtitle = usedCache
        ? `${enabledCount}/${totalSources} sources enabled • showing cached headlines`
        : `${enabledCount}/${totalSources} sources enabled`;
    const lines = [
        theme.fg("accent", theme.bold(centerPlain("CYBER NEWS", safeWidth))),
        theme.fg("dim", centerPlain(subtitle, safeWidth)),
        "",
    ];
    if (items.length === 0) {
        lines.push(theme.fg("warning", truncatePlain("No headlines fetched from enabled sources yet.", safeWidth)));
    }
    else {
        for (const item of items.slice(0, MAX_WIDGET_ITEMS)) {
            lines.push(buildHeadlineLine(item, safeWidth, theme));
        }
    }
    lines.push(theme.fg("dim", truncatePlain("Use /cyber_menu for a deep dive • /cyber_sources to manage", safeWidth)));
    lines.push(buildRefreshLine(safeWidth, remainingMs, theme));
    return lines;
}
function stopCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}
function renderWidget(ctx) {
    if (!ctx?.ui)
        return;
    const remainingMs = Math.max(0, AUTO_REFRESH_MS - (Date.now() - widgetStartTime));
    ctx.ui.setWidget("cyber-news", (_tui, theme) => ({
        render(width) {
            return buildWidgetLines(width, theme, cachedHeadlines, cachedEnabledCount, SOURCES.length, remainingMs, lastRefreshUsedCache);
        },
        invalidate() { },
    }));
}
async function clearHeaderWidget(ctx) {
    if (!ctx?.ui)
        return;
    stopCountdown();
    ctx.ui.setWidget("cyber-news", undefined);
}
async function updateHeaderWidget(ctx) {
    if (!ctx?.ui || isRefreshing)
        return;
    isRefreshing = true;
    stopCountdown();
    try {
        const headlines = await fetchAllNews();
        cachedEnabledCount = enabledSources().length;
        lastRefreshUsedCache = headlines.length === 0 && cachedHeadlines.length > 0;
        if (headlines.length > 0 || cachedHeadlines.length === 0) {
            cachedHeadlines = headlines;
        }
        widgetStartTime = Date.now();
        tickCount = 0;
        renderWidget(ctx);
        countdownInterval = setInterval(() => {
            tickCount += 1;
            const remainingMs = AUTO_REFRESH_MS - (Date.now() - widgetStartTime);
            if (remainingMs <= 0) {
                void updateHeaderWidget(ctx);
                return;
            }
            renderWidget(ctx);
        }, 1000);
    }
    catch (error) {
        console.error("[Cyber News] Widget update failed:", error);
        widgetStartTime = Date.now();
        cachedEnabledCount = enabledSources().length;
        renderWidget(ctx);
    }
    finally {
        isRefreshing = false;
    }
}
export const __testing = {
    extractFeedTitles,
    resolveSourceQuery(query) {
        return resolveSourceMatches(query).map((source) => source.name);
    },
    buildWidgetPreview(width, items, enabledCount, totalSources, remainingMs) {
        const plainTheme = {
            fg(_color, text) {
                return text;
            },
            bold(text) {
                return text;
            },
        };
        return buildWidgetLines(width, plainTheme, items, enabledCount, totalSources, remainingMs, false);
    },
};
export default async function cyberNewsExtension(pi) {
    function resetSourcesToDefaults() {
        for (const source of SOURCES) {
            source.enabled = DEFAULT_ENABLED_SOURCE_NAMES.has(source.name);
        }
    }
    function persistSourceState() {
        pi.appendEntry(SOURCE_STATE_ENTRY, {
            enabledSources: enabledSources().map((source) => source.name),
        });
    }
    function restoreSourceState(ctx) {
        resetSourcesToDefaults();
        let savedState;
        for (const entry of ctx.sessionManager.getBranch()) {
            if (entry.type === "custom" && entry.customType === SOURCE_STATE_ENTRY) {
                savedState = entry.data;
            }
        }
        if (!savedState?.enabledSources?.length) {
            cachedEnabledCount = enabledSources().length;
            return;
        }
        const enabled = new Set(savedState.enabledSources);
        for (const source of SOURCES) {
            source.enabled = enabled.has(source.name);
        }
        if (enabledSources().length === 0) {
            resetSourcesToDefaults();
        }
        cachedEnabledCount = enabledSources().length;
    }
    async function chooseSourceFromMatches(query, matches, ctx) {
        if (matches.length === 0)
            return undefined;
        if (matches.length === 1)
            return matches[0];
        const labels = matches.map((source) => sourceOptionLabel(source));
        if (ctx.mode === "tui") {
            const picked = await ctx.ui.select(`Multiple sources match "${query}"`, labels);
            if (typeof picked !== "string")
                return undefined;
            return matches.find((source) => sourceOptionLabel(source) === picked);
        }
        ctx.ui.notify(`Multiple sources match "${query}": ${matches.map((source) => source.name).join(", ")}`, "warning");
        return undefined;
    }
    async function resolveSource(query, ctx) {
        const matches = resolveSourceMatches(query);
        if (matches.length === 0) {
            ctx.ui.notify(`Source "${query}" not found. Use /cyber_sources to list all sources.`, "error");
            return undefined;
        }
        return chooseSourceFromMatches(query, matches, ctx);
    }
    async function setSourceEnabled(source, enabled, ctx) {
        if (enabled && source.enabled) {
            ctx.ui.notify(`${source.name} is already enabled.`, "info");
            return false;
        }
        if (!enabled && !source.enabled) {
            ctx.ui.notify(`${source.name} is already disabled.`, "info");
            return false;
        }
        if (!enabled && enabledSources().length <= 1) {
            ctx.ui.notify("Cannot disable the last enabled source. Enable another source first.", "warning");
            return false;
        }
        source.enabled = enabled;
        persistSourceState();
        await updateHeaderWidget(ctx);
        ctx.ui.notify(`${enabled ? "Enabled" : "Disabled"} ${source.name}.`, "info");
        return true;
    }
    function notifySourceList(ctx) {
        const lines = SOURCES.map((source) => `  ${sourceOptionLabel(source)}`);
        const active = enabledSources().length;
        ctx.ui.notify(`Sources (${active}/${SOURCES.length} enabled):\n${lines.join("\n")}`, "info");
    }
    async function openSourceManager(ctx) {
        if (ctx.mode !== "tui") {
            notifySourceList(ctx);
            return;
        }
        while (true) {
            const doneLabel = `Done (${enabledSources().length}/${SOURCES.length} enabled)`;
            const options = [doneLabel, ...SOURCES.map((source) => sourceOptionLabel(source))];
            const selected = await ctx.ui.select(NEWS_TITLE, options);
            if (typeof selected !== "string" || selected === doneLabel) {
                break;
            }
            const source = SOURCES.find((candidate) => sourceOptionLabel(candidate) === selected);
            if (!source)
                continue;
            await setSourceEnabled(source, !source.enabled, ctx);
        }
        ctx.ui.notify(`Source manager closed. ${enabledSources().length}/${SOURCES.length} sources enabled.`, "info");
    }
    async function performDeepDive(item, ctx) {
        ctx.ui.notify(`Queued deep-dive research for: ${item.title}`, "info");
        await clearHeaderWidget(ctx);
        pi.sendMessage({
            customType: "user",
            content: [
                {
                    type: "text",
                    text: `Perform a deep-dive cybersecurity research brief for this headline from ${item.source}: "${item.title}".\n\n` +
                        `Be explicit about what is confirmed versus inferred.\n\n` +
                        `Include:\n` +
                        `1. Executive Summary\n` +
                        `2. Why It Matters\n` +
                        `3. Technical Details / likely TTPs\n` +
                        `4. Immediate Mitigations\n` +
                        `5. What to Monitor Next`,
                },
            ],
            display: false,
        }, { triggerTurn: true });
    }
    pi.on("session_start", async (_event, ctx) => {
        restoreSourceState(ctx);
        await updateHeaderWidget(ctx);
        ctx.ui.notify(`Cyber Briefing active — ${enabledSources().length}/${SOURCES.length} sources enabled. ` +
            `Use /cyber_menu to pick a story or /cyber_sources to manage sources.`, "info");
    });
    pi.on("session_tree", async (_event, ctx) => {
        restoreSourceState(ctx);
        await updateHeaderWidget(ctx);
    });
    pi.on("session_shutdown", async (_event, ctx) => {
        await clearHeaderWidget(ctx);
    });
    pi.registerCommand("cyber_menu", {
        description: "Open a headline picker for deep-dive research on a story.",
        handler: async (_args, ctx) => {
            const available = cachedHeadlines.length > 0 ? cachedHeadlines : await fetchAllNews();
            if (available.length === 0) {
                ctx.ui.notify("No news available right now. Try /cyber_refresh or enable more sources.", "error");
                return;
            }
            const top = available.slice(0, MAX_MENU_ITEMS);
            const options = top.map((item) => `${item.icon} ${item.title} [${item.source}]`);
            const selected = await ctx.ui.select(NEWS_TITLE, options);
            if (typeof selected !== "string") {
                ctx.ui.notify("Selection cancelled.", "info");
                return;
            }
            const item = top.find((candidate) => `${candidate.icon} ${candidate.title} [${candidate.source}]` === selected);
            if (!item) {
                ctx.ui.notify("Unable to resolve the selected headline.", "error");
                return;
            }
            await performDeepDive(item, ctx);
        },
    });
    pi.registerCommand("cyber_refresh", {
        description: "Refresh the widget with the latest headlines from enabled sources.",
        handler: async (_args, ctx) => {
            await updateHeaderWidget(ctx);
            ctx.ui.notify(`Refreshed headlines from ${enabledSources().length} enabled sources.`, "info");
        },
    });
    pi.registerCommand("cyber_sources", {
        description: "Open the source manager in TUI, or print source status in non-TUI mode.",
        handler: async (_args, ctx) => {
            await openSourceManager(ctx);
        },
    });
    pi.registerCommand("cyber_enable", {
        description: "Enable a source by exact or partial name. Usage: /cyber_enable <source name>",
        handler: async (args, ctx) => {
            const query = args.trim();
            if (!query) {
                ctx.ui.notify("Specify a source name. Use /cyber_sources to browse all sources.", "warning");
                return;
            }
            const source = await resolveSource(query, ctx);
            if (!source)
                return;
            await setSourceEnabled(source, true, ctx);
        },
    });
    pi.registerCommand("cyber_disable", {
        description: "Disable a source by exact or partial name. Usage: /cyber_disable <source name>",
        handler: async (args, ctx) => {
            const query = args.trim();
            if (!query) {
                ctx.ui.notify("Specify a source name. Use /cyber_sources to browse all sources.", "warning");
                return;
            }
            const source = await resolveSource(query, ctx);
            if (!source)
                return;
            await setSourceEnabled(source, false, ctx);
        },
    });
}
//# sourceMappingURL=index.js.map