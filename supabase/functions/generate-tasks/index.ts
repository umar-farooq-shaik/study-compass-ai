import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface LockedUniversity {
  id: string;
  name: string;
  country: string;
  program_name: string | null;
  degree_type: string;
  field_of_study: string | null;
  requirements_summary: string | null;
}

interface Profile {
  intended_degree: string | null;
  field_of_study: string | null;
  target_intake_year: number | null;
  target_intake_term: string | null;
  ielts_toefl_status: string | null;
  gre_gmat_status: string | null;
  sop_status: string | null;
}

interface GeneratedTask {
  title: string;
  description: string;
  category: string;
  priority: string;
  due_date: string | null;
  sort_order: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's profile
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("intended_degree, field_of_study, target_intake_year, target_intake_term, ielts_toefl_status, gre_gmat_status, sop_status")
      .eq("user_id", user.id)
      .maybeSingle();

    // Get locked universities
    const { data: lockedUniversities } = await supabaseClient
      .from("universities")
      .select("id, name, country, program_name, degree_type, field_of_study, requirements_summary")
      .eq("user_id", user.id)
      .eq("is_locked", true);

    if (!lockedUniversities || lockedUniversities.length === 0) {
      return new Response(
        JSON.stringify({ error: "No locked universities found. Lock at least one university first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const regenerate = body?.regenerate === true;

    const { data: existingTasks } = await supabaseClient
      .from("application_tasks")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    if (existingTasks && existingTasks.length > 0 && !regenerate) {
      return new Response(
        JSON.stringify({ message: "Tasks already generated", regenerate: false }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (existingTasks && existingTasks.length > 0 && regenerate) {
      const { error: deleteError } = await supabaseClient
        .from("application_tasks")
        .delete()
        .eq("user_id", user.id);
      if (deleteError) {
        console.error("Failed to delete existing tasks:", deleteError);
        return new Response(
          JSON.stringify({ error: "Failed to regenerate tasks" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Build the prompt for AI
    const universityList = lockedUniversities.map((u: LockedUniversity) => 
      `- ${u.name} (${u.country}): ${u.program_name || u.field_of_study} - ${u.degree_type}${u.requirements_summary ? ` | Requirements: ${u.requirements_summary}` : ""}`
    ).join("\n");

    const intakeDate = profile?.target_intake_term && profile?.target_intake_year 
      ? `${profile.target_intake_term} ${profile.target_intake_year}`
      : "Not specified";

    const systemPrompt = `You are an expert study abroad application advisor. Generate a comprehensive, actionable task list for a student applying to universities abroad.

Student Profile:
- Target Degree: ${profile?.intended_degree || "Not specified"}
- Field of Study: ${profile?.field_of_study || "Not specified"}
- Target Intake: ${intakeDate}
- IELTS/TOEFL Status: ${profile?.ielts_toefl_status || "Not specified"}
- GRE/GMAT Status: ${profile?.gre_gmat_status || "Not specified"}
- SOP Status: ${profile?.sop_status || "Not specified"}

Locked Universities:
${universityList}

Generate tasks in these categories:
1. "document" - Document preparation (transcripts, degree certificates, etc.)
2. "exam" - Standardized tests (IELTS, TOEFL, GRE, GMAT)
3. "application" - Application materials (SOP, LORs, essays, forms)
4. "financial" - Financial documents (bank statements, scholarships, loans)

For each task provide:
- Clear, actionable title
- Brief description with specific guidance
- Priority (high/medium/low based on urgency)
- Suggested due date relative to intake (format: YYYY-MM-DD, assume current year is 2026)

Generate 15-20 tasks covering all critical steps. Be specific to the universities and programs listed.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate the application task list as a JSON array." }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_tasks",
              description: "Create application tasks for the student",
              parameters: {
                type: "object",
                properties: {
                  tasks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Clear, actionable task title" },
                        description: { type: "string", description: "Brief description with guidance" },
                        category: { type: "string", enum: ["document", "exam", "application", "financial"] },
                        priority: { type: "string", enum: ["low", "medium", "high"] },
                        due_date: { type: "string", description: "Due date in YYYY-MM-DD format or null" }
                      },
                      required: ["title", "description", "category", "priority"]
                    }
                  }
                },
                required: ["tasks"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_tasks" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add more credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error("Failed to generate tasks");
    }

    const aiResponse = await response.json();
    console.log("AI Response:", JSON.stringify(aiResponse, null, 2));

    // Extract tasks from tool call
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "create_tasks") {
      throw new Error("Invalid AI response format");
    }

    const tasksData = JSON.parse(toolCall.function.arguments);
    const tasks: GeneratedTask[] = tasksData.tasks;

    // Prepare tasks for insertion
    const tasksToInsert = tasks.map((task: GeneratedTask, index: number) => ({
      user_id: user.id,
      university_id: null, // General tasks, not tied to specific university
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      due_date: task.due_date || null,
      is_ai_generated: true,
      sort_order: index,
    }));

    // Insert tasks
    const { data: insertedTasks, error: insertError } = await supabaseClient
      .from("application_tasks")
      .insert(tasksToInsert)
      .select();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to save tasks");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        tasks: insertedTasks,
        message: `Generated ${insertedTasks.length} application tasks` 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-tasks:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
