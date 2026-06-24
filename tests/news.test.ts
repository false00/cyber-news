import test from "node:test";
import assert from "node:assert/strict";

import { __testing } from "../index.ts";

function visibleWidth(text: string): number {
  const plain = text.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "");
  let width = 0;
  for (const char of plain) {
    width += char.codePointAt(0)! > 0xffff ? 2 : 1;
  }
  return width;
}

test("extractFeedTitles handles RSS item feeds", () => {
  const xml = `
    <rss>
      <channel>
        <title>Example Feed</title>
        <item><title><![CDATA[Critical patch released for VPN appliance]]></title></item>
        <item><title>Researchers uncover new infostealer campaign</title></item>
      </channel>
    </rss>
  `;

  assert.deepEqual(__testing.extractFeedTitles(xml), [
    "Critical patch released for VPN appliance",
    "Researchers uncover new infostealer campaign",
  ]);
});

test("extractFeedTitles handles Atom entry feeds", () => {
  const xml = `
    <feed>
      <title>Atom Feed</title>
      <entry><title>New CISA advisory for actively exploited bug</title></entry>
      <entry><title>APT campaign targets cloud identities</title></entry>
    </feed>
  `;

  assert.deepEqual(__testing.extractFeedTitles(xml), [
    "New CISA advisory for actively exploited bug",
    "APT campaign targets cloud identities",
  ]);
});

test("extractFeedItems parses RSS, Atom, and namespaced feed dates", () => {
  const xml = `
    <rss>
      <channel>
        <item>
          <title><![CDATA[Critical patch released for VPN appliance]]></title>
          <pubDate>Tue, 23 Jun 2026 17:48:32 -0400</pubDate>
        </item>
        <entry>
          <title>APT campaign targets cloud identities</title>
          <updated>2026-06-22T12:00:00Z</updated>
        </entry>
        <item>
          <title>Researchers publish malware analysis</title>
          <dc:date>2026-06-21T08:30:00Z</dc:date>
        </item>
      </channel>
    </rss>
  `;

  const items = __testing.extractFeedItems(xml);
  assert.equal(items[0]?.publishedAt, Date.parse("Tue, 23 Jun 2026 17:48:32 -0400"));
  assert.equal(items[1]?.publishedAt, Date.parse("2026-06-22T12:00:00Z"));
  assert.equal(items[2]?.publishedAt, Date.parse("2026-06-21T08:30:00Z"));
});

test("resolveSourceQuery supports exact and partial matching", () => {
  assert.deepEqual(__testing.resolveSourceQuery("SANS ISC"), ["SANS ISC"]);
  assert.deepEqual(__testing.resolveSourceQuery("sophos"), ["Sophos Security Ops", "Sophos Threat Research"]);
});

test("rankForDisplay filters stale dated headlines when fresher items are available", () => {
  const now = Date.parse("2026-06-24T00:00:00Z");
  const ranked = __testing.rankForDisplay(
    [
      {
        icon: "💀",
        title: "Who Runs the Ransomware Group ‘The Gentlemen?’",
        weight: 1,
        source: "Krebs on Security",
        publishedAt: Date.parse("2026-06-10T14:03:44Z"),
      },
      {
        icon: "🔓",
        title: "Fresh breach headline",
        weight: 3,
        source: "BleepingComputer",
        publishedAt: now - 60 * 60 * 1000,
      },
      {
        icon: "🔧",
        title: "Fresh patch headline",
        weight: 11,
        source: "The Hacker News",
        publishedAt: now - 2 * 60 * 60 * 1000,
      },
    ],
    now,
  );

  assert.deepEqual(ranked.map((item) => item.title), ["Fresh breach headline", "Fresh patch headline"]);
});

test("rankForDisplay keeps stale dated headlines as a fallback when nothing fresh is available", () => {
  const now = Date.parse("2026-06-24T00:00:00Z");
  const ranked = __testing.rankForDisplay(
    [
      {
        icon: "💀",
        title: "Older ransomware headline",
        weight: 1,
        source: "Krebs on Security",
        publishedAt: Date.parse("2026-06-10T14:03:44Z"),
      },
    ],
    now,
  );

  assert.deepEqual(ranked.map((item) => item.title), ["Older ransomware headline"]);
});

test("widget preview lines stay within the requested width", () => {
  const lines = __testing.buildWidgetPreview(
    60,
    [
      {
        icon: "🚨",
        title: "CISA orders agencies to patch an actively exploited enterprise flaw immediately",
        weight: 1,
        source: "BleepingComputer",
      },
      {
        icon: "🔓",
        title: "Researchers detail how attackers exfiltrated data from a large SaaS provider",
        weight: 2,
        source: "The Hacker News",
      },
    ],
    3,
    14,
    59000,
  );

  assert.ok(lines.length > 0);
  assert.equal(lines.at(-1)?.includes("hides in"), true);
  for (const line of lines) {
    assert.ok(visibleWidth(line) <= 60, `line exceeds width: ${JSON.stringify(line)}`);
  }
});

test("categorizeTitle covers common headline patterns with specific emoji", () => {
  assert.equal(__testing.categorizeTitle("Why Account Takeovers Are Rising and How to Stop Them").icon, "👤");
  assert.equal(__testing.categorizeTitle("India's Telegram ban hit the UAE too. Here's how to get around it").icon, "💬");
  assert.equal(__testing.categorizeTitle("The Top 10 Attack Surface Exposures in 2026").icon, "🧭");
  assert.equal(__testing.categorizeTitle("Malicious JetBrains Plugins Steal AI API Keys").icon, "🧩");
  assert.equal(__testing.categorizeTitle("Completely uncategorized headline example").icon, "📰");
  assert.notEqual(__testing.categorizeTitle("API security roundup for enterprise developers").icon, "🕵️");
});
