import { describe, expect, it } from "vitest";
import { formatDate, formatNumberIntl, supportedLocales } from "@/lib/i18n";
import { softwareJsonLd } from "@/lib/seo";

describe("i18n helpers", () => {
  it("formats dates with an explicit locale", () => {
    expect(formatDate("2026-07-14", "en-US")).toBe("July 14, 2026");
  });

  it("formats numbers with an explicit locale", () => {
    expect(formatNumberIntl(48210, "en-US")).toBe("48,210");
  });

  it("ships English only until a locale is added", () => {
    expect(supportedLocales).toEqual(["en-US"]);
  });
});

describe("softwareJsonLd", () => {
  it("describes interactive tools as free web applications", () => {
    const json = softwareJsonLd({
      name: "VANTIQ ROI Calculator",
      description: "Estimate automation returns.",
      path: "/roi-calculator",
    });
    expect(json["@type"]).toBe("SoftwareApplication");
    expect(json["operatingSystem"]).toBe("Web");
    expect(json["url"]).toContain("/roi-calculator");
  });
});
