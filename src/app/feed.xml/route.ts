import { insights } from "@/data/insights";
import { SITE_URL } from "@/lib/seo";

export async function GET() {
  const items = insights
    .map(
      (insight) => `    <item>
      <title>${insight.title}</title>
      <link>${SITE_URL}/insights/${insight.slug}</link>
      <description>${insight.excerpt}</description>
      <category>${insight.category}</category>
      <pubDate>${new Date(insight.publishedAt).toUTCString()}</pubDate>
      <guid>${SITE_URL}/insights/${insight.slug}</guid>
    </item>`,
    )
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>VANTIQ SYSTEMS — Insights</title>
    <link>${SITE_URL}/insights</link>
    <description>Engineering notes, not thought leadership.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
