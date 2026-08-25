import { ImageResponse } from "next/og";

export const alt = "VANTIQ SYSTEMS — AI Engineering & Automation for the Enterprise";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0a0b0e",
          color: "#f4f2ec",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "3px solid #2e6bf6",
              borderRadius: 12,
              fontSize: 36,
              fontWeight: 700,
              color: "#2e6bf6",
            }}
          >
            V
          </div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, letterSpacing: 10 }}>
            VANTIQ SYSTEMS
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -2,
            maxWidth: 980,
          }}
        >
          AI Engineering &amp; Automation for the Enterprise
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: "2px solid rgba(244,242,236,0.12)",
            paddingTop: 28,
          }}
        >
          <div style={{ display: "flex", fontSize: 26, color: "#8b93a3" }}>
            Architecture · Agents · Automation · Operations
          </div>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: "#2e6bf6" }}>
            Model-agnostic. Architecture-first.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
