const u = process.env.QA_LIVE_URL ?? "https://ai-automation-agency-website-lilac.vercel.app";

const get = async (path) => {
  const r = await fetch(u + path, { cache: "no-store" });
  return { status: r.status, text: await r.text() };
};

const grab = (t, re) => {
  const m = t.match(re);
  return m ? m[1] : "(missing)";
};

const home = await get("/");
console.log("status:", home.status);
console.log("canonical:", grab(home.text, /rel="canonical" href="([^"]+)"/));
console.log("og:url:", grab(home.text, /property="og:url" content="([^"]+)"/));
console.log("og:image:", grab(home.text, /property="og:image" content="([^"]+)"/));
console.log("title:", grab(home.text, /<title>([^<]+)</).slice(0, 90));
console.log("json-ld blocks:", (home.text.match(/application\/ld\+json/g) || []).length);
console.log("has localhost:", /localhost:\d+/.test(home.text));
console.log("has .example in html:", /\.example/.test(home.text));
console.log("mailto:", grab(home.text, /href="(mailto:[^"]+)"/));
console.log("viewport meta:", /name="viewport" content="width=device-width/.test(home.text));

for (const p of ["/robots.txt", "/sitemap.xml", "/feed.xml", "/opengraph-image"]) {
  const r = await fetch(u + p, { cache: "no-store" });
  const body = r.status === 200 ? await r.text() : "";
  const ok =
    p === "/robots.txt" ? body.includes("Sitemap:") : p === "/feed.xml" ? body.includes("<rss") || body.includes("<feed") : r.status === 200;
  console.log(`${p.padEnd(20)} ${r.status} ${ok ? "OK" : "UNEXPECTED"}`);
}

// integrity sweep of a few production routes
const routes = ["/", "/solutions", "/solutions/ai-agents", "/work/invoice-processing-operations", "/insights", "/start-a-project", "/roi-calculator"];
for (const p of routes) {
  const r = await get(p);
  const html = r.text;
  const canonical = grab(html, /rel="canonical" href="([^"]+)"/);
  const bad = r.status >= 400 || canonical.includes("localhost") || canonical.includes("127.0.0.1");
  console.log(`${p.padEnd(42)} ${r.status} canonical=${canonical} ${bad ? "BAD" : "ok"}`);
}
