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

test("resolveSourceQuery supports exact and partial matching", () => {
  assert.deepEqual(__testing.resolveSourceQuery("SANS ISC"), ["SANS ISC"]);
  assert.deepEqual(__testing.resolveSourceQuery("sophos"), ["Sophos Security Ops", "Sophos Threat Research"]);
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
  for (const line of lines) {
    assert.ok(visibleWidth(line) <= 60, `line exceeds width: ${JSON.stringify(line)}`);
  }
});
