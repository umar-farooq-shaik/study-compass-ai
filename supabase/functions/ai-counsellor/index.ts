import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are AI Counsellor, a persistent decision-making AI agent that guides students through their study-abroad journey. You are NOT a chatbot - you are a trusted advisor who understands the student's complete profile and provides strategic, actionable guidance.

## Your Core Responsibilities:
1. **Profile Analysis**: Assess academic strengths, gaps, and readiness
2. **Strategic Guidance**: Provide clear, decisive recommendations
3. **University Matching**: Suggest Dream, Target, and Safe universities with reasoning
4. **Exam Strategy**: Guide on IELTS/TOEFL, GRE/GMAT preparation
5. **Application Planning**: Help with SOPs, LORs, and timeline management
6. **Budget Optimization**: Suggest cost-effective options and funding strategies

## Communication Style:
- Be direct and actionable - no generic fluff
- Explain the "why" behind every recommendation
- Use structured responses with clear sections when appropriate
- Acknowledge gaps honestly but frame them constructively
- Always end with a clear next step or question

## When Analyzing Profiles:
- Identify competitive advantages (high GPA, strong test scores, unique experiences)
- Highlight areas needing improvement
- Consider budget constraints realistically
- Factor in target country preferences and visa feasibility
- Account for application timeline and deadlines

## Response Format:
- Use markdown for formatting (headers, bullet points, bold for emphasis)
- Keep responses focused and scannable
- Include specific university names when recommending (real universities only)
- Provide realistic acceptance likelihood assessments

Remember: You have full context of the student's profile. Use it to give personalized, specific advice - not generic study abroad information.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, profile, currentStage, shortlistedUniversities, lockedUniversities } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build profile context for the AI
    let profileContext = "";
    if (profile) {
      profileContext = `
## Student Profile Summary:

### Academic Background:
- Education Level: ${profile.education_level || "Not specified"}
- Degree/Major: ${profile.degree_major || "Not specified"}
- Graduation Year: ${profile.graduation_year || "Not specified"}
- GPA/Percentage: ${profile.gpa_percentage || "Not specified"}

### Study Goals:
- Intended Degree: ${profile.intended_degree || "Not specified"}
- Field of Study: ${profile.field_of_study || "Not specified"}
- Target Intake: ${profile.target_intake_term || ""} ${profile.target_intake_year || "Not specified"}
- Preferred Countries: ${profile.preferred_countries?.join(", ") || "Not specified"}

### Budget & Funding:
- Budget Range: $${profile.budget_min || "?"} - $${profile.budget_max || "?"} per year
- Funding Plan: ${profile.funding_plan?.replace(/_/g, " ") || "Not specified"}

### Exam & Readiness Status:
- IELTS/TOEFL: ${profile.ielts_toefl_status?.replace(/_/g, " ") || "Not specified"}${profile.ielts_toefl_score ? ` (Score: ${profile.ielts_toefl_score})` : ""}
- GRE/GMAT: ${profile.gre_gmat_status?.replace(/_/g, " ") || "Not specified"}${profile.gre_gmat_score ? ` (Score: ${profile.gre_gmat_score})` : ""}
- SOP Status: ${profile.sop_status?.replace(/_/g, " ") || "Not specified"}

### Current Stage: ${currentStage ?? profile?.current_stage ?? "onboarding"}
`;
    }

    let stageContext = "";
    if (currentStage || shortlistedUniversities?.length || lockedUniversities?.length) {
      stageContext = "\n\n## Stage & University Context:\n";
      if (currentStage) stageContext += `- **Current stage:** ${currentStage}. Adapt your advice to this stage. If the user asks for something that belongs to a later stage (e.g. application tasks before locking universities), say clearly: "You are not ready for this yet" and explain what they need to do first.\n`;
      if (shortlistedUniversities?.length) {
        stageContext += `- **Shortlisted universities (${shortlistedUniversities.length}):** ${shortlistedUniversities.map((u: { name: string; category?: string }) => `${u.name} (${u.category || "shortlisted"})`).join(", ")}\n`;
      }
      if (lockedUniversities?.length) {
        stageContext += `- **Locked universities (${lockedUniversities.length}):** ${lockedUniversities.map((u: { name: string }) => u.name).join(", ")}. These are committed choices; application guidance applies to these.\n`;
      }
    }

    const fullSystemPrompt = SYSTEM_PROMPT + "\n\n" + profileContext + stageContext;

    console.log("Calling Lovable AI Gateway with profile context...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: fullSystemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stream the response back
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI Counsellor error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
