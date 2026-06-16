import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

interface NewsItem {
  title: string;
  icon: string;
  weight: number;
  source: string;
}

interface RssSource {
  name: string;
  url: string;
  lang: string;
  enabled: boolean;
}

const NEWS_TITLE = "🛡️ Cyber Briefing";
const GRN = "\x1b[32m";
const TEA = "\x1b[36m";
const RST = "\x1b[0m";
const MIN_W = 48;
const MAX_WIDGET_ROWS = 6;
const MAX_MENU_ITEMS = 30;
const ITEMS_PER_SOURCE = 3;
const FETCH_TIMEOUT = 10000;
const WIDGET_DURATION = 60000;
const SPINNER_CHARS = ["◐", "◓", "◑", "◒"];

let tickCount = 0;
let countdownInterval: ReturnType<typeof setInterval> | null = null;
let widgetStartTime = 0;
let cachedHeadlines: NewsItem[] = [];
let cachedEnabledCount = 0;

const SOURCES: RssSource[] = [
  { name: "BleepingComputer", url: "https://www.bleepingcomputer.com/feed/", lang: "en", enabled: true },
  { name: "The Hacker News", url: "https://feeds.feedburner.com/TheHackersNews?format=xml", lang: "en", enabled: true },
  { name: "Krebs on Security", url: "https://krebsonsecurity.com/feed/", lang: "en", enabled: true },
  { name: "WeLiveSecurity", url: "https://feeds.feedburner.com/eset/blog", lang: "en", enabled: false },
  { name: "Graham Cluley", url: "https://grahamcluley.com/feed/", lang: "en", enabled: false },
  { name: "Securelist", url: "https://securelist.com/feed/", lang: "en", enabled: false },
  { name: "Darknet Diaries", url: "https://podcast.darknetdiaries.com/", lang: "en", enabled: false },
  { name: "SANS ISC", url: "https://isc.sans.edu/rssfeed_full.xml", lang: "en", enabled: false },
  { name: "Schneier on Security", url: "https://www.schneier.com/feed/atom/", lang: "en", enabled: false },
  { name: "Sophos Security Ops", url: "https://news.sophos.com/en-us/category/security-operations/feed/", lang: "en", enabled: false },
  { name: "Sophos Threat Research", url: "https://news.sophos.com/en-us/category/threat-research/feed/", lang: "en", enabled: false },
  { name: "Troy Hunt", url: "https://www.troyhunt.com/rss/", lang: "en", enabled: false },
  { name: "USOM Threats", url: "https://www.usom.gov.tr/rss/tehdit.rss", lang: "tr", enabled: false },
  { name: "USOM Announcements", url: "https://www.usom.gov.tr/rss/duyuru.rss", lang: "tr", enabled: false },
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

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(c));
}

function categorize(title: string): { icon: string; weight: number } {
  const lower = title.toLowerCase();
  for (const cat of CATEGORIES) {
    if (cat.keywords.some(k => lower.includes(k))) {
      return { icon: cat.icon, weight: cat.weight };
    }
  }
  return { icon: "🔹", weight: 99 };
}

function enabledSources(): RssSource[] {
  return SOURCES.filter(s => s.enabled);
}

async function fetchSource(src: RssSource): Promise<NewsItem[]> {
  try {
    const response = await fetch(src.url, { signal: AbortSignal.timeout(FETCH_TIMEOUT) });
    if (!response.ok) return [];
    const text = await response.text();
    const regex = /<title>(.*?)<\/title>/g;
    const items: NewsItem[] = [];
    const seen = new Set<string>();
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (items.length >= ITEMS_PER_SOURCE) break;
      const raw = match[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim();
      const title = decodeEntities(raw);
      const key = title.toLowerCase();
      if (!title || title.length < 6 || seen.has(key)) continue;
      seen.add(key);
      if (key.startsWith('rss feed') || key === src.name.toLowerCase()) continue;
      const { icon, weight } = categorize(title);
      items.push({ title, icon, weight, source: src.name });
    }
    return items;
  } catch {
    return [];
  }
}

async function fetchAllNews(): Promise<NewsItem[]> {
  const active = enabledSources();
  if (active.length === 0) return [];
  const results = await Promise.allSettled(active.map(s => fetchSource(s)));
  const allItems: NewsItem[] = [];
  const seen = new Set<string>();
  for (const r of results) {
    if (r.status !== 'fulfilled') continue;
    for (const item of r.value) {
      const key = item.title.toLowerCase().slice(0, 80);
      if (!seen.has(key)) {
        seen.add(key);
        allItems.push(item);
      }
    }
  }
  return allItems.sort((a, b) => a.weight - b.weight);
}

function visualLen(s: string): number {
  let len = 0;
  for (const ch of s) {
    len += ch.codePointAt(0)! > 0xFFFF ? 2 : 1;
  }
  return len;
}

function col(s: string, w: number): string {
  const vlen = visualLen(s);
  if (vlen <= w) return s + " ".repeat(w - vlen);
  let result = "";
  let cur = 0;
  for (const ch of s) {
    const cw = ch.codePointAt(0)! > 0xFFFF ? 2 : 1;
    if (cur + cw > w - 1) break;
    result += ch;
    cur += cw;
  }
  return result + "…";
}

function buildCountdownBar(remaining: number, w: number): string {
  const totalBars = 10;
  const ratio = Math.max(0, Math.min(1, remaining / WIDGET_DURATION));
  const filled = Math.round(ratio * totalBars);
  const bar = "█".repeat(filled) + "░".repeat(totalBars - filled);
  const secs = Math.ceil(remaining / 1000);
  const spinner = SPINNER_CHARS[tickCount % SPINNER_CHARS.length];
  const visible = `[${bar}] ${secs}s ${spinner}`;
  const leftPad = Math.floor((w - visible.length) / 2);
  return " ".repeat(leftPad) + GRN + visible + RST;
}

function pairedLines(items: { icon: string; title: string; source: string }[], rows: number, colW: number): string[] {
  const lines: string[] = [];
  for (let i = 0; i < rows * 2 && i < items.length; i += 2) {
    const leftText = `${items[i].icon} ${items[i].title} · ${items[i].source}`;
    const left = col(leftText, colW);
    const rightItem = i + 1 < items.length ? items[i + 1] : null;
    const rightText = rightItem ? `${rightItem.icon} ${rightItem.title} · ${rightItem.source}` : "";
    const right = rightItem ? col(rightText, colW) : " ".repeat(colW);
    lines.push(`${left} | ${right}`);
  }
  return lines;
}

function stopCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

async function renderWidget(ctx: any) {
  const tw = Math.max(MIN_W, process.stdout?.columns ?? 80);
  const colW = Math.floor((tw - 3) / 2);
  const elapsed = Date.now() - widgetStartTime;
  const remaining = Math.max(0, WIDGET_DURATION - elapsed);
  const title = "CYBER NEWS";
  const leftPad = Math.floor((tw - title.length) / 2);
  const content = [
    " ".repeat(leftPad) + TEA + title + RST,
    ...pairedLines(cachedHeadlines, MAX_WIDGET_ROWS, colW),
    "",
    buildCountdownBar(remaining, tw),
  ];
  await ctx.ui.setWidget("cyber-news", content);
}

async function updateHeaderWidget(ctx: any) {
  if (!ctx?.ui) return;
  try {
    cachedHeadlines = await fetchAllNews();
    cachedEnabledCount = enabledSources().length;
    widgetStartTime = Date.now();
    tickCount = 0;
    stopCountdown();
    await renderWidget(ctx);
    countdownInterval = setInterval(async () => {
      tickCount++;
      const elapsed = Date.now() - widgetStartTime;
      const remaining = WIDGET_DURATION - elapsed;
      if (remaining <= 0) {
        stopCountdown();
        await clearHeaderWidget(ctx);
        return;
      }
      await renderWidget(ctx);
    }, 1000);
  } catch (e) {
    console.error("[Cyber News] Widget update failed:", e);
  }
}

async function clearHeaderWidget(ctx: any) {
  if (!ctx?.ui) return;
  stopCountdown();
  await ctx.ui.setWidget("cyber-news", []);
}

function sourceColor(name: string): string {
  const map: Record<string, string> = {
    "BleepingComputer": "\x1b[31m",
    "The Hacker News": "\x1b[32m",
    "Krebs on Security": "\x1b[33m",
    "WeLiveSecurity": "\x1b[34m",
    "Graham Cluley": "\x1b[35m",
    "Securelist": "\x1b[36m",
    "Darknet Diaries": "\x1b[91m",
    "SANS ISC": "\x1b[92m",
    "Schneier on Security": "\x1b[93m",
    "Sophos Security Ops": "\x1b[94m",
    "Sophos Threat Research": "\x1b[95m",
    "Troy Hunt": "\x1b[96m",
    "USOM Threats": "\x1b[37m",
    "USOM Announcements": "\x1b[97m",
  };
  return map[name] ?? "";
}

function sourceIcon(src: RssSource): string {
  const icons: Record<string, string> = {
    "BleepingComputer": "💻",
    "Darknet Diaries": "🎙️",
    "Graham Cluley": "🐦",
    "Krebs on Security": "🔍",
    "SANS ISC": "🌐",
    "Schneier on Security": "🔐",
    "Securelist": "🛡️",
    "Sophos Security Ops": "🛡️",
    "The Hacker News": "📰",
    "Sophos Threat Research": "🔬",
    "Troy Hunt": "🔑",
    "USOM Threats": "🌍",
    "USOM Announcements": "📢",
    "WeLiveSecurity": "🦠",
  };
  return icons[src.name] || "📡";
}

export default async function (pi: ExtensionAPI) {

  async function performDeepDive(headline: string, ctx: any) {
    if (!ctx?.ui) return;
    ctx.ui.notify("Summarizing...", "info");
    await clearHeaderWidget(ctx);
    pi.sendMessage({
      customType: "user",
      content: [{
        type: "text",
        text: `Perform a deep-dive research and provide an EXECUTIVE SUMMARY for this headline: "${headline}".\n\nInclude:\n1. **Executive Summary** (Impact/Business logic)\n2. **Technical Details** (Attack mechanism)\n3. **Mitigation** (Immediate steps)`,
      }],
      display: false,
    }, { triggerTurn: true });
  }

  pi.on("session_start", async (_event, ctx) => {
    await updateHeaderWidget(ctx);
    if (ctx.ui?.notify) {
      const active = enabledSources().length;
      const total = SOURCES.length;
      ctx.ui.notify(`Cyber Briefing active — ${active}/${total} sources enabled. /cyber_menu to pick a story, /cyber_sources to manage sources.`, "info");
    }
  });

  pi.registerCommand("cyber_menu", {
    description: "Open interactive menu to select a headline for deep-dive summary.",
    handler: async (_args, ctx) => {
      const all = await fetchAllNews();
      if (all.length === 0) {
        ctx.ui.notify("No news available. Enable sources with /cyber_enable.", "error");
        return;
      }
      const top = all.slice(0, MAX_MENU_ITEMS);
      const options = top.map(item => `${item.icon}  ${item.title}  [${item.source}]`);
      const selected = await ctx.ui.select(NEWS_TITLE, options);
      if (typeof selected === 'string') {
        await clearHeaderWidget(ctx);
        const stripped = selected.replace(/^.\s\s/, '').replace(/\s+\[.*?\]$/, '');
        await performDeepDive(stripped, ctx);
      } else {
        ctx.ui.notify("Selection cancelled.", "info");
      }
    },
  });

  pi.registerCommand("cyber_refresh", {
    description: "Refresh the cybersecurity header with latest headlines from all enabled sources.",
    handler: async (_args, ctx) => {
      await updateHeaderWidget(ctx);
      if (ctx.ui?.notify) {
        const active = enabledSources().length;
        ctx.ui.notify(`Refreshed from ${active} sources.`, "info");
      }
    },
  });

  pi.registerCommand("cyber_sources", {
    description: "List all sources with status (✅ enabled / ❌ disabled).",
    handler: async (_args, ctx) => {
      const lines = SOURCES.map(s => {
        const status = s.enabled ? "✅" : "❌";
        return `  ${status}  ${sourceIcon(s)}  ${sourceColor(s.name)}${s.name}${RST}`;
      });
      const active = enabledSources().length;
      ctx.ui.notify(`Sources (${active}/${SOURCES.length} enabled). Use /cyber_enable or /cyber_disable:\n${lines.join('\n')}`, "info");
    },
  });

  pi.registerCommand("cyber_enable", {
    description: "Enable a source by name. Usage: /cyber_enable <source name>",
    handler: async (args, ctx) => {
      const name = args.trim();
      if (!name) {
        ctx.ui.notify("Specify a source name. /cyber_sources to list them.", "warning");
        return;
      }
      const src = SOURCES.find(s => s.name.toLowerCase() === name.toLowerCase());
      if (!src) {
        ctx.ui.notify(`Source "${name}" not found. Use /cyber_sources to list all.`, "error");
        return;
      }
      if (src.enabled) {
        ctx.ui.notify(`${src.name} is already enabled.`, "info");
        return;
      }
      src.enabled = true;
      ctx.ui.notify(`✅ ${sourceColor(src.name)}${src.name}${RST} enabled.`, "info");
    },
  });

  pi.registerCommand("cyber_disable", {
    description: "Disable a source by name. Usage: /cyber_disable <source name>",
    handler: async (args, ctx) => {
      const name = args.trim();
      if (!name) {
        ctx.ui.notify("Specify a source name. /cyber_sources to list them.", "warning");
        return;
      }
      const src = SOURCES.find(s => s.name.toLowerCase() === name.toLowerCase());
      if (!src) {
        ctx.ui.notify(`Source "${name}" not found. Use /cyber_sources to list all.`, "error");
        return;
      }
      if (!src.enabled) {
        ctx.ui.notify(`${src.name} is already disabled.`, "info");
        return;
      }
      const activeCount = enabledSources().length;
      if (activeCount <= 1) {
        ctx.ui.notify("Cannot disable the last enabled source. Enable another first.", "warning");
        return;
      }
      src.enabled = false;
      ctx.ui.notify(`❌ ${src.name} disabled.`, "info");
    },
  });
}
