"use client";

import { useMemo, useState } from "react";

type Tone = "direct" | "calm" | "educational";
type PostType = "authority" | "contrarian" | "client";

type PriceRange = "under_500" | "500_2k" | "2k_5k" | "5k_plus" | "unsure";
type AudienceStage = "beginner" | "growing" | "scaling";

const postTypes: { value: PostType; label: string; desc: string }[] = [
  { value: "authority", label: "Authority Post", desc: "Position you as an expert with clear insight." },
  { value: "contrarian", label: "Contrarian Insight", desc: "A sharp reframe that challenges common beliefs." },
  { value: "client", label: "Client-Attracting Educational", desc: "Useful education that attracts buyers subtly." },
];

const tones: { value: Tone; label: string }[] = [
  { value: "direct", label: "Direct" },
  { value: "calm", label: "Calm" },
  { value: "educational", label: "Educational" },
];

const priceRanges: { value: PriceRange; label: string }[] = [
  { value: "under_500", label: "Under $500" },
  { value: "500_2k", label: "$500–$2k" },
  { value: "2k_5k", label: "$2k–$5k" },
  { value: "5k_plus", label: "$5k+" },
  { value: "unsure", label: "Not sure" },
];

const audienceStages: { value: AudienceStage; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "growing", label: "Growing" },
  { value: "scaling", label: "Scaling" },
];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col">
        <label className="text-sm font-medium text-slate-800">{label}</label>
        {hint ? <span className="text-xs text-slate-500 mt-1">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

function Section({
  title,
  text,
  pre = false,
}: {
  title: string;
  text: string;
  pre?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-900 mb-2">{title}</div>
      {pre ? (
        <pre className="whitespace-pre-wrap text-slate-700 text-sm leading-6">
          {text}
        </pre>
      ) : (
        <p className="text-slate-700 text-sm leading-6">{text}</p>
      )}
    </div>
  );
}

type GenerateResponse = {
  post: string;
  hooks: string[];
  why: string[];
  error?: string;
};

export default function Page() {
  // V2 Inputs
  const [service, setService] = useState("");
  const [problem, setProblem] = useState("");
  const [result, setResult] = useState("");
  const [priceRange, setPriceRange] = useState<PriceRange>("unsure");

  const [audience, setAudience] = useState("");
  const [audienceStage, setAudienceStage] = useState<AudienceStage>("growing");

  const [postType, setPostType] = useState<PostType>("authority");
  const [topic, setTopic] = useState("");

  const [tone, setTone] = useState<Tone>("direct");

  // Email gate
  const [email, setEmail] = useState("");
  const [emailGateOpen, setEmailGateOpen] = useState(false);

  // Output
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<GenerateResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const canGenerate = useMemo(() => {
    return (
      service.trim().length >= 3 &&
      problem.trim().length >= 3 &&
      result.trim().length >= 3 &&
      audience.trim().length >= 3
    );
  }, [service, problem, result, audience]);

  async function doGenerate(passedEmail: string) {
    setErrorMsg("");
    setLoading(true);
    setResultData(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service,
          problem,
          result,
          priceRange,
          audience,
          audienceStage,
          postType,
          topic,
          tone,
          email: passedEmail,
          platform: "linkedin",
        }),
      });

      const data = (await res.json()) as GenerateResponse;
      if (!res.ok) throw new Error((data as any)?.error || "Something went wrong");
      setResultData(data);
    } catch (e: any) {
      setErrorMsg(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  function onClickGenerate() {
    if (!canGenerate) {
      setErrorMsg("Fill the required fields: Service, Problem, Result, Audience.");
      return;
    }
    setEmailGateOpen(true);
  }

  async function onSubmitEmail(e: React.FormEvent) {
    e.preventDefault();
    const clean = email.trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
    if (!ok) {
      setErrorMsg("Please enter a valid email.");
      return;
    }
    setEmailGateOpen(false);
    await doGenerate(clean);
  }

  async function onRegenerate() {
    const clean = email.trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
    if (!ok) {
      setEmailGateOpen(true);
      return;
    }
    await doGenerate(clean);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-6">
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold tracking-wide text-slate-500">
              PROMPTA FLOW 
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">
              LinkedIn Authority Execution System
            </h1>
            <p className="text-slate-600">
              Turn your expertise into authority and inbound clients.
            </p>
          </div>

          {/* Offer + Audience */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field
              label="What service do you sell? *"
              hint='Example: "Web design for SaaS founders"'
            >
              <input
                className="rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                placeholder='e.g. "Landing page design for SaaS"'
                value={service}
                onChange={(e) => setService(e.target.value)}
              />
            </Field>

            <Field
              label="Who do you help? *"
              hint='Example: "Seed-stage SaaS founders"'
            >
              <input
                className="rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                placeholder='e.g. "B2B SaaS founders"'
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              />
            </Field>

            <Field
              label="What problem do you solve? *"
              hint='Example: "Low conversion pages"'
            >
              <input
                className="rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                placeholder='e.g. "Low conversion + weak messaging"'
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
              />
            </Field>

            <Field
              label="What result do you deliver? *"
              hint='Example: "More demos booked"'
            >
              <input
                className="rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                placeholder='e.g. "More qualified demos booked"'
                value={result}
                onChange={(e) => setResult(e.target.value)}
              />
            </Field>

            <Field label="Audience stage" hint="Optional, helps the angle.">
              <select
                className="rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                value={audienceStage}
                onChange={(e) => setAudienceStage(e.target.value as AudienceStage)}
              >
                {audienceStages.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Price range (optional)" hint="Used for realistic positioning.">
              <select
                className="rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value as PriceRange)}
              >
                {priceRanges.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Post type" hint="Pick the angle.">
              <select
                className="rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                value={postType}
                onChange={(e) => setPostType(e.target.value as PostType)}
              >
                {postTypes.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <div className="text-xs text-slate-500">
                {postTypes.find((p) => p.value === postType)?.desc}
              </div>
            </Field>

            <Field label="Topic (optional)" hint='Example: "pricing", "positioning", "client calls"'>
              <input
                className="rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                placeholder='Leave blank to auto-pick a strong topic.'
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </Field>

            <Field label="Tone" hint="Keep it human & sharp.">
              <select
                className="rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                value={tone}
                onChange={(e) => setTone(e.target.value as Tone)}
              >
                {tones.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={onClickGenerate}
              disabled={loading}
              className="rounded-xl px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? "Generating..." : "Generate LinkedIn Post"}
            </button>

            <button
              onClick={onRegenerate}
              disabled={loading}
              className="rounded-xl px-4 py-2 font-semibold text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-60"
            >
              New Angle
            </button>

            
          </div>

          {errorMsg ? (
            <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {errorMsg}
            </div>
          ) : null}

          {resultData ? (
            <div className="mt-8 grid gap-4">
              <Section title="✅ LinkedIn Post (Copy-Paste Ready)" text={resultData.post} pre />


              <Section
                title="🧠 Why this builds authority"
                text={(resultData.why || []).join("\n")}
                pre
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={async () => {
                    const hooksText = (resultData.hooks || []).map((h) => "- " + h).join("\n");
                    const whyText = (resultData.why || []).join("\n");
                    const allText = `${resultData.post}\n\nHOOK OPTIONS:\n${hooksText}\n\nWHY THIS WORKS:\n${whyText}`.trim();
                    await navigator.clipboard.writeText(allText);
                  }}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium border border-slate-300 bg-white hover:bg-slate-50"
                >
                  Copy All
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {emailGateOpen ? (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
              <div className="text-lg font-semibold text-slate-900">
                Get your post and save your workspace
              </div>
              <p className="mt-1 text-sm text-slate-600">
                We use your email only to generate and improve the system.
              </p>

              <form onSubmit={onSubmitEmail} className="mt-4 flex flex-col gap-3">
                <input
                  className="rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 rounded-xl px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800"
                  >
                    Generate My Post
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmailGateOpen(false)}
                    className="rounded-xl px-4 py-2 font-semibold text-slate-900 bg-white border border-slate-200 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}