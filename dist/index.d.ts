import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
interface NewsItem {
    title: string;
    icon: string;
    weight: number;
    source: string;
    publishedAt?: number;
}
interface FeedItem {
    title: string;
    publishedAt?: number;
}
interface SourceConfigEntry {
    name: string;
    enabled: boolean;
}
interface SourceConfigFile {
    version: 1;
    sources: SourceConfigEntry[];
}
declare function extractFeedItems(xml: string): FeedItem[];
export declare function extractFeedTitles(xml: string): string[];
export declare const __testing: {
    extractFeedItems: typeof extractFeedItems;
    extractFeedTitles: typeof extractFeedTitles;
    resolveSourceQuery(query: string): string[];
    buildWidgetPreview(width: number, items: NewsItem[], enabledCount: number, totalSources: number, remainingMs: number): string[];
    categorizeTitle(title: string): {
        icon: string;
        weight: number;
    };
    rankForDisplay(items: NewsItem[], now: number): NewsItem[];
    parseSourceConfig(content: string): Array<[string, boolean]>;
    sourceConfigPreview(): SourceConfigFile;
};
export default function cyberNewsExtension(pi: ExtensionAPI): Promise<void>;
export {};
//# sourceMappingURL=index.d.ts.map