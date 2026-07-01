import test from "node:test";
import assert from "node:assert/strict";

import { eastAsianWidth } from "get-east-asian-width";

import { __testing } from "../index.ts";

const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
const zeroWidthGraphemeRegex = /^(?:\p{Default_Ignorable_Code_Point}|\p{Control}|\p{Mark})+$/u;
const emojiPresentationRegex = /\p{Extended_Pictographic}/u;

function graphemeWidth(segment: string): number {
  if (segment === "\t") return 3;
  if (segment.length === 0 || zeroWidthGraphemeRegex.test(segment)) return 0;
  if (emojiPresentationRegex.test(segment) || segment.includes("\uFE0F") || segment.includes("\u200D")) return 2;

  const cp = segment.codePointAt(0);
  if (cp === undefined) return 0;
  if (cp >= 0x1f1e6 && cp <= 0x1f1ff) return 2;

  return eastAsianWidth(cp);
}

function visibleWidth(text: string): number {
  const plain = text.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "").replace(/\t/g, "   ");
  let width = 0;
  for (const { segment } of graphemeSegmenter.segment(plain)) {
    width += graphemeWidth(segment);
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

test("source config preview writes all available source states", () => {
  const config = __testing.sourceConfigPreview();

  assert.equal(config.version, 1);
  assert.equal(config.sources.length, 14);
  assert.deepEqual(config.sources.slice(0, 3), [
    { name: "BleepingComputer", enabled: true },
    { name: "The Hacker News", enabled: true },
    { name: "Krebs on Security", enabled: true },
  ]);
});

test("source config parser supports persisted per-source states", () => {
  const parsed = __testing.parseSourceConfig(
    JSON.stringify({
      version: 1,
      sources: [
        { name: "BleepingComputer", enabled: false },
        { name: "SANS ISC", enabled: true },
      ],
    }),
  );

  assert.deepEqual(parsed, [
    ["BleepingComputer", false],
    ["SANS ISC", true],
  ]);
});

test("source config parser migrates legacy enabledSources lists", () => {
  const parsed = new Map(__testing.parseSourceConfig(JSON.stringify({ enabledSources: ["SANS ISC"] })));

  assert.equal(parsed.get("SANS ISC"), true);
  assert.equal(parsed.get("BleepingComputer"), false);
  assert.equal(parsed.get("Krebs on Security"), false);
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


test("widget preview respects width for BMP emoji headline icons", () => {
  assert.equal(visibleWidth("⚡"), 2);

  const lines = __testing.buildWidgetPreview(
    72,
    [
      {
        icon: "⚡",
        title: "Anthropic rolls out Sonnet 5 with near-Opus 4.8 performance on coding workloads",
        weight: 1,
        source: "BleepingComputer",
      },
    ],
    4,
    14,
    60000,
  );

  for (const line of lines) {
    assert.ok(visibleWidth(line) <= 72, `line exceeds width: ${JSON.stringify(line)}`);
  }
});


test("widget preview respects narrow requested widths", () => {
  const lines = __testing.buildWidgetPreview(
    20,
    [
      {
        icon: "⚡",
        title: "Short headline that still needs truncation",
        weight: 1,
        source: "BleepingComputer",
      },
    ],
    3,
    14,
    59000,
  );

  for (const line of lines) {
    assert.ok(visibleWidth(line) <= 20, `line exceeds width: ${JSON.stringify(line)}`);
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
