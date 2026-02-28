import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type PriceRange = "under_500" | "500_2k" | "2k_5k" | "5k_plus" | "unsure";
type AudienceStage = "beginner" | "growing" | "scaling";
type PostType = "authority" | "contrarian" | "client";
type Tone = "direct" | "calm" | "educational";

function priceRangeToText(p?: PriceRange) {
  switch (p) {
    case "under_500":
      return "Under $500";
    case "500_2k":
      return "$500–$2k";
    case "2k_5k":
      return "$2k–$5k";
    case "5k_plus":
      return "$5k+";
    default:
      return "Not specified";
  }
}

function stageToText(s?: AudienceStage) {
  switch (s) {
    case "beginner":
      return "Beginner";
    case "growing":
      return "Growing";
    case "scaling":
      return "Scaling";
    default:
      return "Growing";
  }
}

function postTypeToText(t?: PostType) {
  switch (t) {
    case "authority":
      return "Authority Post";
    case "contrarian":
      return "Contrarian Insight";
    case "client":
      return "Client-Attracting Educational";
    default:
      return "Authority Post";
  }
}

function toneToText(t?: Tone) {
  switch (t) {
    case "direct":
      return "Direct, confident, concise";
    case "calm":
      return "Calm, grounded, clear";
    case "educational":
      return "Educational, practical, simple";
    default:
      return "Direct, confident, concise";
  }
}

export async function POST(req: Request) {
  try {
    const {
      service,
      problem,
      result,
      priceRange,
      audience,
      audienceStage,
      postType,
      topic,
      tone,
      email,
    } = await req.json();

    // ✅ Basic validation
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }
    if (!service || !problem || !result || !audience) {
      return NextResponse.json(
        { error: "Please fill required fields: Service, Problem, Result, Audience." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    // ✅ Save/Update lead in Supabase (V1 schema)
try {
  const payload = {
    email: String(email).trim().toLowerCase(),

    service: String(service).trim(),
    problem: String(problem).trim(),
    result: String(result).trim(),

    audience: String(audience).trim(),
    audience_stage: audienceStage ?? null,
    price_range: priceRange ?? null,

    post_type: postType ?? null,
    topic: topic?.trim() ? topic.trim() : null,
    tone: tone ?? null,

    source: "prompta-flow",
    last_seen_at: new Date().toISOString(),
  };

  const { error: leadErr } = await supabaseAdmin
    .from("leads")
    .upsert(payload, { onConflict: "email" });

  if (leadErr) console.log("Supabase lead save error:", leadErr.message);
} catch (err: any) {
  console.log("Supabase lead save exception:", err?.message || err);
}

    const openai = new OpenAI({
  apiKey,
  timeout: 60000,   // 60s
  maxRetries: 2,
});

    // ✅ V4: Positioning Machine (Hook واحد فقط + WHY فقط)
 const system = `
You are a strategic positioning advisor writing a LinkedIn post for a skilled freelancer.

Your goal is not engagement.
Your goal is authority and inbound clients.

This must feel written by someone who has seen patterns in real client work — not someone teaching theory.

ABSOLUTE RULES:

- Never use the word “Most”.
- Never start with generic framing.
- No clichés.
- No motivational tone.
- No hashtags.
- No markdown.
- No long paragraphs.
- Do not sound like a teacher.
- Do not label sections (no "Insight", no "Lesson", no "Framework", no numbering labels).
- Never explain like a tutorial.

QUALITY CONTROL:

- Open with a short, pain-targeted line (max 8 words).
- The first two lines must create tension.
- Include one micro-specific detail (client call, real quote, specific mistake observed).
- Reveal 2–3 sharp observations (without over-explaining).
- Include one uncomfortable truth in 6 words or less.
- Use at least one strong contrast sentence (short and punchy).
- Include one subtle boundary (who this is NOT for).
- End with a selective CTA that invites a concrete reply (not "thoughts?").

Avoid vague statements like:
"Clients buy results."
"Consistency matters."
"Authority takes time."
"Design is important."
"Clarity is key."

Tone:

Calm authority.
Strategic.
Psychological depth.
Slight edge allowed.
Never aggressive.
Never hype.

FORMAT STRICTLY:
- The POST must be formatted with line breaks.
- Use 1 empty line between paragraphs.
- The first line is the hook. It must be a single sentence on its own line.
POST:
<post>

WHY THIS BUILDS AUTHORITY:
- <bullet>
- <bullet>
- <bullet>
`.trim();

    const profile = `
Writer profile:
- Platform: LinkedIn
- Persona: Skilled freelancer
- Service sold: ${service}
- Problem solved: ${problem}
- Result delivered: ${result}
- Price range: ${priceRangeToText(priceRange)}
- Audience: ${audience}
- Audience stage: ${stageToText(audienceStage)}
- Post type: ${postTypeToText(postType)}
- Tone: ${toneToText(tone)}
- Topic (optional): ${topic ? topic : "Auto-pick the most strategic angle"}

Strategy notes:
- Must feel like lived experience (client calls, audits, patterns).
- Must signal systems thinking without selling a tool.
- Must be specific enough that generic creators can't copy it.
`.trim();

    // ✅ 1) Mode guidance
    const modeGuidance = (() => {
      if (postType === "contrarian") {
        return `
Mode: Contrarian Insight
- Challenge a common belief in this niche.
- Back it with a specific pattern.
- CTA invites people who disagree/relate to reply with a concrete detail.
`.trim();
      }
      if (postType === "client") {
        return `
Mode: Client-Attracting Educational
- Teach a buyer-relevant insight (not obvious).
- Show the cost of staying stuck.
- CTA attracts people actively trying to solve this now.
`.trim();
      }
      return `
Mode: Authority Post
- Sharp opinion + clear standards.
- Signal who you work with / don’t work with.
- CTA filters for serious clients or serious peers.
`.trim();
    })();

    // ✅ 2) Stage guidance (برا modeGuidance باش يبقى معروف فـ user)
    const stageGuidance = (() => {
      if (audienceStage === "beginner") {
        return `
Audience level: Beginner.
Use simpler language and less edge.
Reduce assumptions.
CTA should be easy and low-friction.
`.trim();
      }

      if (audienceStage === "scaling") {
        return `
Audience level: Scaling.
Assume competence.
Sharper, more selective.
More psychological depth.
CTA should be selective and confident.
`.trim();
      }

      return `
Audience level: Growing.
Balance clarity with strategic depth.
Confident but not aggressive.
`.trim();
    })();

    const user = `
${profile}

${modeGuidance}

${stageGuidance}

Now produce the output in the EXACT format required.
`.trim();
async function withRetry<T>(fn: () => Promise<T>, tries = 3) {
  let lastErr: any;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e: any) {
      lastErr = e;
      // انتظار صغير قبل retry
      await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
  throw lastErr;
}
    const response = await withRetry(() =>
  openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.75,
    max_output_tokens: 420,
  })
);

    const text = response.output_text || "";

    // ✅ Parse strict format: POST + WHY
    const postMatch = text.match(/POST:\s*([\s\S]*?)\n\s*WHY THIS BUILDS AUTHORITY:/i);
    const whyMatch = text.match(/WHY THIS BUILDS AUTHORITY:\s*([\s\S]*)$/i);

    const post = (postMatch?.[1] || "").trim();
    const whyRaw = (whyMatch?.[1] || "").trim();

    const why = whyRaw
      .split("\n")
      .map((l) => l.replace(/^\s*-\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 3);

    if (!post) {
      return NextResponse.json({
        post: text.trim(),
        why: [],
      });
    }

    return NextResponse.json({ post, why });
  } catch (e: any) {
  console.log("Generate error FULL:", e);
  console.log("Generate error message:", e?.message);
  console.log("Generate error cause:", e?.cause);
  console.log("OpenAI error:", e?.message || e);
  return NextResponse.json(
    { error: "Something went wrong. Please try again in a few seconds." },
    { status: 500 }
  );
}
}