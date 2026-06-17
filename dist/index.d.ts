import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
interface NewsItem {
    title: string;
    icon: string;
    weight: number;
    source: string;
}
export declare function extractFeedTitles(xml: string): string[];
export declare const __testing: {
    extractFeedTitles: typeof extractFeedTitles;
    resolveSourceQuery(query: string): string[];
    buildWidgetPreview(width: number, items: NewsItem[], enabledCount: number, totalSources: number, remainingMs: number): string[];
};
export default function cyberNewsExtension(pi: ExtensionAPI): Promise<void>;
export {};
//# sourceMappingURL=index.d.ts.map