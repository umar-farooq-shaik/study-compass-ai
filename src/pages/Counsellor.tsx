import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { ChatMessage } from "@/components/counsellor/ChatMessage";
import { ChatInput } from "@/components/counsellor/ChatInput";
import { ProfileSidebar } from "@/components/counsellor/ProfileSidebar";
import { SuggestedPrompts } from "@/components/counsellor/SuggestedPrompts";
import { useAICounsellor } from "@/hooks/useAICounsellor";
import { useDashboardStats, STAGE_LABELS } from "@/hooks/useDashboardStats";
import { useUniversities } from "@/hooks/useUniversities";
import { Button } from "@/components/ui/button";
import { Bot, RotateCcw, PanelRightClose, PanelRight } from "lucide-react";
import type { Profile } from "@/types/profile";

export default function Counsellor() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { currentStage } = useDashboardStats(profile);
  const { shortlisted } = useUniversities(profile);
  const counsellorContext = {
    currentStage: STAGE_LABELS[currentStage],
    shortlistedUniversities: shortlisted,
    lockedUniversities: shortlisted.filter((u) => u.is_locked),
  };
  const { messages, isLoading, sendMessage, clearChat } = useAICounsellor(profile, counsellorContext);

  // Auth check and fetch profile
  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?mode=login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData as Profile);
        
        // Check if onboarding is complete
        if (!profileData.onboarding_completed) {
          navigate("/onboarding");
          return;
        }
      }

      setLoading(false);
    };

    fetchData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth?mode=login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <Layout isAuthenticated onLogout={handleLogout} currentStage={STAGE_LABELS[currentStage]} hideFooter>
      <div className="flex h-[calc(100vh-64px)]">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Bot className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <h1 className="font-display font-semibold">AI Counsellor</h1>
                <p className="text-sm text-muted-foreground">
                  Your personalized study-abroad advisor
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearChat} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  New Chat
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSidebar(!showSidebar)}
                className="md:flex hidden"
              >
                {showSidebar ? (
                  <PanelRightClose className="h-4 w-4" />
                ) : (
                  <PanelRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                    <Bot className="h-8 w-8 text-secondary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold mb-2">
                    Hi! I'm your AI Counsellor
                  </h2>
                  <p className="text-muted-foreground max-w-md">
                    I have access to your complete profile and can provide personalized guidance
                    for your study-abroad journey. Ask me anything!
                  </p>
                </div>

                <div className="w-full">
                  <p className="text-sm font-medium text-muted-foreground mb-4 text-center">
                    Quick start with these prompts:
                  </p>
                  <SuggestedPrompts onSelect={sendMessage} disabled={isLoading} />
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-4">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex gap-4 p-4 rounded-xl bg-muted/50">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-background">
            <div className="max-w-3xl mx-auto">
              <ChatInput onSend={sendMessage} isLoading={isLoading} />
              <p className="text-xs text-muted-foreground text-center mt-2">
                AI Counsellor provides guidance based on your profile. Always verify information independently.
              </p>
            </div>
          </div>
        </div>

        {/* Profile Sidebar */}
        {showSidebar && (
          <div className="hidden md:block">
            <ProfileSidebar profile={profile} />
          </div>
        )}
      </div>
    </Layout>
  );
}
