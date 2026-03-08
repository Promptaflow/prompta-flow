"use client";

export default function LandingCTA() {
  return (
    <a
      href="/app"
      onClick={() => {
        fetch("/api/track", {
          method: "POST",
          body: JSON.stringify({
            event_name: "landing_cta_click",
          }),
        });
      }}
      className="inline-block mt-10 rounded-xl bg-slate-900 px-8 py-3 text-white font-semibold hover:bg-slate-800"
    >
      Generate Your First LinkedIn Authority Post →
    </a>
  );
}