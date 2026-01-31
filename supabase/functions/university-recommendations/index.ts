import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an expert university admissions advisor. Generate realistic university recommendations based on the student's profile.

## Your Task:
Generate exactly 7 university recommendations divided into:
- 2 Dream universities (prestigious, lower acceptance chance)
- 3 Target universities (good fit, reasonable acceptance chance)
- 2 Safe universities (likely admission, good backup options)

## Requirements for Each University:
1. Use REAL universities only - no made-up institutions
2. Match the student's field of study and degree level
3. Consider budget constraints realistically
4. Factor in the student's academic profile (GPA, test scores)
5. Respect country preferences

## Response Format:
You MUST respond with valid JSON only. No explanations, no markdown, just the JSON array.

The JSON structure:
[
  {
    "name": "University Name",
    "country": "Country Code (US, UK, CA, etc.)",
    "city": "City Name",
    "program_name": "Specific Program Name",
    "degree_type": "masters|bachelors|mba|phd",
    "field_of_study": "Field matching student's interest",
    "tuition_per_year": 45000,
    "living_cost_per_year": 18000,
    "category": "dream|target|safe",
    "acceptance_likelihood": "low|medium|high",
    "fit_explanation": "2-3 sentences on why this fits the student's profile",
    "risk_explanation": "1-2 sentences on potential challenges or considerations",
    "requirements_summary": "Brief admission requirements (GPA, IELTS, GRE, etc.)"
  }
]

## Budget Guidelines (per year in USD):
- Low budget ($20k-35k): Focus on Germany, Netherlands, Canada public universities
- Medium budget ($35k-55k): UK, Australia, mid-tier US universities
- High budget ($55k+): Top US/UK universities, Ivy League

## Acceptance Likelihood Based on Profile:
- Dream (low): Reaches above student's profile, but not impossible
- Target (medium): Matches student's academic credentials
- Safe (high): Student exceeds typical admitted profile

Respond ONLY with the JSON array. No other text.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile, filters } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the user prompt with profile context
    const userPrompt = `Generate university recommendations for this student:

## Student Profile:
- Education Level: ${profile.education_level || "Not specified"}
- Current Degree/Major: ${profile.degree_major || "Not specified"}
- GPA/Percentage: ${profile.gpa_percentage || "Not specified"}
- Graduation Year: ${profile.graduation_year || "Not specified"}

## Study Goals:
- Intended Degree: ${profile.intended_degree || "Not specified"}
- Field of Study: ${profile.field_of_study || "Not specified"}
- Target Intake: ${profile.target_intake_term || ""} ${profile.target_intake_year || "Not specified"}
- Preferred Countries: ${profile.preferred_countries?.join(", ") || "Any"}

## Budget:
- Range: $${profile.budget_min || "?"} - $${profile.budget_max || "?"} per year
- Funding: ${profile.funding_plan?.replace(/_/g, " ") || "Not specified"}

## Test Scores:
- IELTS/TOEFL: ${profile.ielts_toefl_status?.replace(/_/g, " ") || "Not specified"}${profile.ielts_toefl_score ? ` (Score: ${profile.ielts_toefl_score})` : ""}
- GRE/GMAT: ${profile.gre_gmat_status?.replace(/_/g, " ") || "Not specified"}${profile.gre_gmat_score ? ` (Score: ${profile.gre_gmat_score})` : ""}

${filters?.country ? `## Filter Applied: Focus on ${filters.country}` : ""}
${filters?.category ? `## Category Filter: Only show ${filters.category} universities` : ""}

Generate 7 realistic university recommendations (2 Dream, 3 Target, 2 Safe) as a JSON array.`;

    console.log("Calling Lovable AI Gateway for university recommendations...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
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

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response");
      return new Response(
        JSON.stringify({ error: "Empty AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON response
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      }
      if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      cleanContent = cleanContent.trim();

      const universities = JSON.parse(cleanContent);
      
      console.log(`Generated ${universities.length} university recommendations`);

      return new Response(
        JSON.stringify({ universities }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError, content);
      return new Response(
        JSON.stringify({ error: "Failed to parse university recommendations" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("University recommendations error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
