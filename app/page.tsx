"use client";

"use client";

import { useMemo, useState, useRef } from "react";

import {
  Leaf,
  Heart,
  Sparkles,
  SunMedium,
  ShieldCheck,
  Brain,
  Lock,
} from "lucide-react";

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
        {hint ? <span className="text-xs text-[#5F6B76] mt-1">{hint}</span> : null}
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
    <div className="rounded-2xl border border-[#E4E7E2] bg-white p-4">
      <div className="text-sm font-semibold text-[#1E2A38]  mb-2">{title}</div>
      {pre ? (
        <pre className="whitespace-pre-wrap text-[#1E2A38] text-[15px] leading-8">
          {text}
        </pre>
      ) : (
        <div className="whitespace-pre-wrap text-[#1E2A38] text-[15px] leading-8">
  {text}
</div>
      )}
    </div>
  );
}

type GenerateResponse = {
    text: string;
};

export default function Page() {
  // V2 Inputs
  const [service, setService] = useState("");
 const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Email gate
  const [email, setEmail] = useState("");
  const [emailGateOpen, setEmailGateOpen] = useState(false);

  // Output
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<GenerateResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const canGenerate = useMemo(() => {
  return service.trim().length >= 3;
}, [service]);

  async function doGenerate() {
    setErrorMsg("");
    setLoading(true);
    setResultData(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: service
          
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
     setErrorMsg("Please write what’s on your mind first.");
    }
    doGenerate();
  }

  async function onSubmitEmail(e: React.FormEvent) {
    e.preventDefault();
    const clean = email.trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
    if (!ok) {
      setErrorMsg("Please enter a valid email.");
      return;
    }
    fetch("/api/track", {
    method: "POST",
    body: JSON.stringify({
      event_name: "email_submit_click",
    }),
  });
    setEmailGateOpen(false);
    await doGenerate();
  }


  return (
  <main className="min-h-screen bg-[#F5F5F2] px-6 py-6">
<div className="mx-auto min-h-[92vh] max-w-[1400px] rounded-[28px] border border-[#E7ECE6] bg-white/85 px-5 py-5 shadow-[0_10px_40px_rgba(30,42,56,0.06)] md:px-8 md:py-8 xl:px-12 xl:py-10">      
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src="/mindeazy-logo.png"
            alt="Mindeazy logo"
className="h-[100px] w-[100px] self-center object-contain drop-shadow-[0_4px_12px_rgba(30,42,56,0.08)]"        />
          <div className="text-2xl font-bold leading-none tracking-[-0.03em] text-[#1E2A38]">
            Mindeazy
          </div>
        </div>

        <div className="hidden items-center gap-2.5 text-[15px] text-[#5F6B76] md:flex">
          <Lock className="h-[14px] w-[14px] text-[#6F9B75]" strokeWidth={2} />
          <span>Private. Safe. Yours.</span>
        </div>
      </header>

      {/* Main layout */}
      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_0.9fr] xl:gap-12 lg:grid-cols-2 lg:items-center">
        
        {/* Left side */}
        <section className="max-w-[620px]">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#EEF4EE] px-5 py-2 text-sm font-bold uppercase tracking-[0.18em] text-[#4F7A58]">
            <Leaf className="h-4 w-4" strokeWidth={2} />
            Personal Reset
          </div>

          <h1 className="mt-8 max-w-2xl text-4xl md:text-[3.4rem] xl:text-[4.2rem] - font-semibold leading-[1.05] tracking-[-0.05em] text-[#1E2A38] md:text-6xl">
            Calm your mind.
            <br />
            <span className="text-[#5D8A67]">Reset your day.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#1E2A38] md:text-xl xl:text-2xl">
  Write what&apos;s on your mind and get a calm, personalized reset in seconds.
</p>

          {/* Text box */}
<div
  onClick={() => textareaRef.current?.focus()}
  className="mt-7 cursor-text rounded-[24px] border border-[#C9D9CC] bg-white p-7 shadow-sm"
>            <div className="text-6xl font-semibold leading-none text-[#5D8A67] opacity-90">
  “
</div>

           {service.trim().length === 0 && (
  <>
    <label className="mt-3 block text-xl font-medium text-[#1E2A38]">
      What&apos;s on your mind right now?
    </label>

    <p className="mt-2 text-lg text-[#8A9690]">
      Write freely. Just get it out of your head.
    </p>
  </>
)}
            <textarea
              ref={textareaRef}
              className="mt-5 h-[120px] md:h-[140px] xl:h-[160px] w-full resize-none bg-transparent text-lg md:text-xl leading-relaxed text-[#1E2A38] outline-none placeholder:text-[#A0AAA4]"
              placeholder=""
              value={service}
              onChange={(e) => setService(e.target.value)}
            />

            <div className="flex justify-end">
  <Leaf className="h-6 w-6 text-[#5D8A67]" strokeWidth={1.8} />
</div>
          </div>

          <button
            onClick={() => {
              fetch("/api/track", {
                method: "POST",
                body: JSON.stringify({
                  event_name: "real_generate_click",
                }),
              });
              onClickGenerate();
            }}
            disabled={loading}
            className="mt-8 rounded-[18px] bg-[#1E2A38] px-6 py-4 text-lg md:px-8 md:py-5 md:text-xl font-bold text-white shadow-[0_14px_35px_rgba(30,42,56,0.28)] transition hover:-translate-y-0.5 hover:bg-[#263545] disabled:opacity-60"
          >
            {loading ? "Creating your reset..." : "✦ Get My Reset"}
          </button>

          <div className="mt-7 flex items-center gap-2 text-base text-[#5F6B76]">
            <ShieldCheck className="h-[15px] w-[15px] text-[#6F9B75]" strokeWidth={2.3} />
            <span>100% private • No login required • Just for you</span>
          </div>

          {errorMsg ? (
            <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              {errorMsg}
            </div>
          ) : null}
        </section>

        {/* Right side */}
        <section className="rounded-[32px] border border-[#E5ECE4] bg-[#FAFCF8]/95 p-5 md:p-5 xl:p-6">
          <div className="flex justify-center">
<div
  className="
  flex
    h-24
    w-24
    items-center
    justify-center
    rounded-full
    border
    border-[#D6E2D6]
    bg-[#F8FAF7]
    shadow-[0_8px_25px_rgba(163,191,168,0.15)]
  "
>              <img
                src="/mindeazy-logo.png"
                alt="Mindeazy logo"
                className="h-28 w-28 object-contain "
              />
            </div>
          </div>

          <h2 className="mt-5 text-center text-3xl font-semibold text-[#4F7A58]">
            Your Personal Reset
          </h2>

          <div className="my-7 flex items-center gap-5">
  <div className="h-px flex-1 bg-[#E5ECE4]" />

  <Leaf
    className="h-[18px] w-[18px] text-[#6F9B75]"
    strokeWidth={1.8}
  />

  <div className="h-px flex-1 bg-[#E5ECE4]" />
</div>

          {resultData ? (
            <div className="space-y-5 text-[17px] leading-[1.9] text-[#1E2A38]">
  {resultData.text.split("\n\n").map((paragraph, index) => (
    <p key={index}>{paragraph}</p>
  ))}
</div>
          ) : (
            <div className="space-y-0">
              {[
                "Your mind is doing its best to protect you, but constant overthinking only keeps you stuck in the same loop.",
                "You don’t need to solve everything today. You just need a small step that moves you forward.",
                "Give yourself permission to pause, breathe, and focus on what you can control right now.",
                "Progress isn’t about big leaps. It’s about showing up for yourself, even in the smallest ways.",
              ].map((item, index) => (
                <div key={index} className="flex gap-5 border-b border-[#E5ECE4] py-5 last:border-b-0">
<div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#F4F6F1] text-[#6E9771]">                    {index === 0 ? (
  <Brain className="h-[30px] w-[30px]" strokeWidth={1.8} />
) : index === 1 ? (
  <Leaf className="h-[30px] w-[30px]" strokeWidth={1.8} />
) : index === 2 ? (
  <Heart className="h-[30px] w-[30px]" strokeWidth={1.8} />
) : (
  <Sparkles className="h-[30px] w-[30px]" strokeWidth={1.8} />
)}
                  </div>
                  <p className="text-base md:text-[17px] xl:text-lg leading-relaxed text-[#1E2A38]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 rounded-2xl bg-[#F1F5EF] px-6 py-6 text-center text-lg font-semibold text-[#4F7A58]">
            You&apos;ve got this. One reset at a time.
            <div className="mt-3 flex justify-center">
  <Heart className="h-5 w-5 text-[#5D8A67]" strokeWidth={1.8} />
</div>
          </div>

          {resultData ? (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => {
                  setService("");
                  setResultData(null);
                  textareaRef.current?.focus();
                }}
                className="text-sm text-[#5F6B76] transition hover:text-[#1E2A38]"
              >
                Write a new reset
              </button>
            </div>
          ) : null}
        </section>
      </div>

      <div className="mt-14 text-sm text-[#6F7D73]">
        <div className="mt-14 flex items-center gap-2 text-sm text-[#6F7D73]">
  <Leaf
    className="h-[18px] w-[18px] text-[#6F9B75]"
    strokeWidth={1.8}
  />

  <span>
    You don&apos;t have to carry it all. Let&apos;s take it one thought at a time.
  </span>
</div>
      </div>
    </div>
  </main>
);
}