import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

/**
 * Cybersecurity News Extension for Pi (Fixed Version)
 * 
 * Fixes:
 * - Replaced `ctx.sendUserMessage` with the correct method to avoid "not a function" errors.
 * - Fixed "[object Object]" display by properly extracting strings from selection results.
 * - Provides interactive menu and deep-dive summarization.
 */

export default async function (pi: ExtensionAPI) {
  const NEWS_TITLE = "🛡️ Cyber Briefing";

  // 1. Fetch the latest news items from a live source (BleepingComputer)
  async function fetchNewsItems(): Promise<{title: string, icon: string, weight: number}[]> {
    const RSS_URL = "https://www.bleepingcomputer.com/feed/";
    try {
      const response = await fetch(RSS_URL);
      if (!response.ok) throw new Error(`Network response for ${RSS_URL} was not ok: ${response.statusText}`);
      const text = await response.text();
      
      // Improved regex to capture titles from various common feed structures
      const headlineRegex = /<title>(.*?)<\/title>/g;
      let results: {title: string, icon: string, weight: number}[] = [];
      let match;
      
      while ((match = headlineRegex.exec(text)) !== null) {
        // Only take the first 5 relevant headlines
        if (results.length >= 5) break;
        const title = match[1].replace(/&nbsp;/g, ' ').trim();
        
        // Basic entity decoding for better readability in TUI
        const decodedTitle = title
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");

        // Filter out non-headlines and common source names that might appear as titles
        if (decodedTitle && !decodedTitle.startsWith('RSS Feed') && decodedTitle.length > 8 && decodedTitle !== "BleepingComputer") {
          const CATEGORIES = [
            { name: "breach", icon: "⚠️", weight: 1, keywords: ["breach", "leak", "stolenskii", "stolen", "drained", "heist", "exfiltration", "compromised", "private keys", "data theft", "hacked", "dumped"] },
            { name: "supply_chain", icon: "🔗", weight: 2, keywords: ["npm", "github", "supply chain", "package", "dependency", "vendor", "third-party", "upstream", "software update", "repository", "malicious package"] },
            { name: "malware", icon: "🦠", weight: 3, keywords: ["malware", "virus", "worm","trojan", "infestation", "botnet", "shai-hulud", "payload", "wiper", "ransomware", "spyware", "cryptojacking", "miner"] },
            { name: "espionage", icon: "🕵️‍♂️", weight: 4, keywords: ["spy", "espionage", "state-sponsored", "apt", "infiltration", "china", "russia", "stealth", "adversary", "insider threat", "covert", "intelligence"] },
            { name: "patch", icon: "🔧", weight: 5, keywords: ["patch", "fixed", "resolved", "update", "remediation", "cve", "vulnerability", "zero-day", "exploit", "hotfix", "advisory", "security bulletin", "critical flaw"] },
            { name: "scam", icon: "🎣", weight: 6, keywords: ["scam", "fraud", "fake", "phishing", "crypto scam", "identity theft", "impersonation"] },
            { name: "ai", icon: "🤖", weight: 7, keywords: ["ai", "machine learning", "llm", "deepfake", "generative", "shadow ai", "prompt injection"] },
            { name: "cloud_infra", icon: "☁️", weight: 10, keywords: ["servicenow", "aws", "azure", "google cloud", "saas", "platform", "infrastructure", "cloud", "microsoft", "oracle"] }
          ];

          let selectedCat = { name: "info", icon: "🔹", weight: 8 };
          const lowerTitle = decodedTitle.toLowerCase();
          for (const cat of CATEGORIES) {
            if (cat.keywords.some(keyword => lowerTitle.includes(keyword))) {
              selectedCat = cat;
              break;
            }
          }
          
          results.push({ title: decodedTitle, icon: selectedCat.icon, weight: selectedCat.weight });
        }
      }

      // Sort results by priority (lowest weight first)
      return [...results].sort((a, b) => a.weight - b.weight);
    } catch (e) {
      console.error("[Cyber News] Failed to fetch live news:", e);
      return [{title: "❌ News feed currently unavailable", icon: "⚠️", weight: 10}];
    }
  }

  // 2. Internal logic for updating the header widget
  async function updateHeaderWidget(ctx: any) {
    if (!ctx || !ctx.ui) return;
    try {
      const news = await fetchNewsItems();
      
      const formattedContent = [
        NEWS_TITLE,
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "Source: BleepingComputer",
        "----------------------------------------",
        ...news.map(item => `[ ${item.icon} ] ${item.title}`),
        ""
      ];
      await ctx.ui.setWidget("cyber-news", formattedContent);
    } catch (e) {
      console.error("[Cyber News] Widget update failed:", e);
    }
  }

  // Helper to clear the widget
  async function clearHeaderWidget(ctx: any) {
    if (!ctx || !ctx.ui) return;
    await ctx.ui.setWidget("cyber-news", []);
  }

  // 3. The Deep Dive Trigger - This uses the agent's ability to follow a new command automatically
  async function performDeepDive(headline: string, ctx: any) {
    if (!ctx || !ctx.ui) return;

    ctx.ui.notify("Summarizing...", "info");
    // Clear intro banner when deep dive starts (active use detected)
    await clearHeaderWidget(ctx);

    // CORRECT WAY TO SEND MESSAGE IN AN EXTENSION:
    pi.sendMessage({
      role: "user",
      content: [{ 
        type: "text", 
        text: `Please perform a deep-dive research and provide an EXECUTIVE SUMMARY for this headline: "${headline}". \n\nPlease include:\n1. **Executive Summary** (Impact level/Business logic)\n2. **Technical Details** (Mechanism of attack)\n3. **Mitigation** (Immediate steps to take)` 
      }],
    }, { triggerTurn: true });
  }

  // --- Command Handlers ---

  // Lifecycle: Startup
  pi.on("session_start", async (_event, ctx) => {
    await updateHeaderWidget(ctx);
    if (ctx.ui?.notify) {
      ctx.ui.notify("Cyber Briefing active. Type /cyber_menu to select a news item.", "info");
    }
    
    // Intro behavior: Auto-clear banner after 20 seconds so it doesn't stay persistent
    setTimeout(async () => {
      if (ctx.ui) {
        await clearHeaderWidget(ctx);
      }
    }, 20000);
  });

  // The Interactive Menu Command
  pi.registerCommand("cyber_menu", {
    description: "Open interactive menu to select a headline for summary.",
    handler: async (_args, ctx) => {
      const newsItems = await fetchNewsItems();
      
      if (newsItems.length === 0 || (newsItems.length === 1 && newsItems[0].type === "error")) {
        ctx.ui.notify(newsItems.length > 0 ? newsItems[0].title : "No news available.", "error");
        return;
      }

      // Map to an array of strings so they display correctly in the menu
      const options = newsItems.map(item => item.title);

      // Display the selection menu in TUI mode
      const selectedValue = await ctx.ui.select(NEWS_TITLE, options);

      if (typeof selectedValue === 'string') {
        // Clear intro banner immediately on user interaction of this tool
        await clearHeaderWidget(ctx);
        await performDeepDive(selectedValue, ctx);
      } else {
        ctx.ui.notify("Selection cancelled.", "info");
      }
    },
  });

  // Manual Refresh Command - Renamed from refresh_cyber to cyber_refresh
  pi.registerCommand("cyber_refresh", {
    description: "Refresh the cybersecurity header with latest headlines.",
    handler: async (_args, ctx) => {
      await updateHeaderWidget(ctx);
      if (ctx.ui?.notify) {
        ctx.ui.notify("Header updated.", "success");
      }
    },
  });
}
