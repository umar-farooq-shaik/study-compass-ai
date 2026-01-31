import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UniversityCard } from "@/components/universities/UniversityCard";
import { UniversityFiltersComponent } from "@/components/universities/UniversityFilters";
import { useUniversities } from "@/hooks/useUniversities";
import { useDashboardStats, STAGE_LABELS } from "@/hooks/useDashboardStats";
import { Sparkles, Search, BookmarkCheck, Lock, Loader2, GraduationCap, AlertCircle } from "lucide-react";
import type { Profile } from "@/types/profile";
import type { UniversityFilters } from "@/types/university";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
export default function Universities() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<UniversityFilters>({});
  const [unlockDialog, setUnlockDialog] = useState<string | null>(null);
  const { currentStage } = useDashboardStats(profile);
  const {
    recommendations,
    shortlisted,
    isGenerating,
    isLoading,
    lockedCount,
    generateRecommendations,
    addToShortlist,
    removeFromShortlist,
    lockUniversity,
    unlockUniversity
  } = useUniversities(profile);

  // Auth check and fetch profile
  useEffect(() => {
    const fetchData = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?mode=login");
        return;
      }
      const {
        data: profileData
      } = await supabase.from("profiles").select("*").eq("user_id", session.user.id).maybeSingle();
      if (profileData) {
        setProfile(profileData as Profile);
        if (!profileData.onboarding_completed) {
          navigate("/onboarding");
          return;
        }
      }
      setLoading(false);
    };
    fetchData();
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) navigate("/auth?mode=login");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  const handleUnlock = (id: string) => {
    setUnlockDialog(id);
  };
  const confirmUnlock = () => {
    if (unlockDialog) {
      unlockUniversity(unlockDialog);
      setUnlockDialog(null);
    }
  };

  const applyFilters = (u: { country?: string; category?: string; degree_type?: string; field_of_study?: string; acceptance_likelihood?: string; tuition_per_year?: number; living_cost_per_year?: number }) => {
    if (filters.country && u.country !== filters.country) return false;
    if (filters.category && u.category !== filters.category) return false;
    if (filters.degreeType && u.degree_type !== filters.degreeType) return false;
    if (filters.field && u.field_of_study !== filters.field) return false;
    if (filters.competitionLevel && u.acceptance_likelihood !== filters.competitionLevel) return false;
    if (filters.maxBudget != null) {
      const total = (u.tuition_per_year ?? 0) + (u.living_cost_per_year ?? 0);
      if (total > filters.maxBudget) return false;
    }
    return true;
  };

  const filteredRecommendations = recommendations.filter(applyFilters);
  const filteredShortlisted = shortlisted.filter(applyFilters);
  if (loading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>;
  }
  return <Layout isAuthenticated onLogout={handleLogout} currentStage={STAGE_LABELS[currentStage]}>
      <div className="container py-8 pb-[232px]">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">University Discovery</h1>
            <p className="text-muted-foreground">
              AI-powered recommendations based on your profile
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
              <BookmarkCheck className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{shortlisted.length} Shortlisted</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
              <Lock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{lockedCount} Locked</span>
            </div>
          </div>
        </div>

        {/* Locked Universities Banner */}
        {lockedCount > 0 && <Card className="p-4 mb-6 border-primary/20 bg-primary/5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  You have {lockedCount} locked {lockedCount === 1 ? "university" : "universities"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Ready to start your application journey? Lock more or proceed to application guidance.
                </p>
              </div>
              <Button onClick={() => navigate("/applications")} disabled={lockedCount === 0}>
                View Applications
              </Button>
            </div>
          </Card>}

        {/* Filters */}
        <UniversityFiltersComponent filters={filters} onChange={setFilters} onClear={() => setFilters({})} preferredCountries={profile?.preferred_countries || []} />

        {/* Tabs */}
        <Tabs defaultValue="discover" className="mt-6">
          <TabsList className="mb-6">
            <TabsTrigger value="discover" className="gap-2">
              <Search className="h-4 w-4" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="shortlist" className="gap-2">
              <BookmarkCheck className="h-4 w-4" />
              Shortlist ({shortlisted.length})
            </TabsTrigger>
          </TabsList>

          {/* Discover Tab */}
          <TabsContent value="discover">
            {recommendations.length === 0 ? <Card className="p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <h2 className="font-display text-xl font-semibold mb-2">
                  Discover Your Perfect Universities
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Our AI will analyze your profile and recommend universities categorized as
                  Dream, Target, and Safe based on your academic background and goals.
                </p>
                <Button size="lg" onClick={() => generateRecommendations(filters)} disabled={isGenerating} className="gap-2">
                  {isGenerating ? <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </> : <>
                      <Sparkles className="h-4 w-4" />
                      Generate Recommendations
                    </>}
                </Button>
              </Card> : <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {filteredRecommendations.length} universities found
                  </p>
                  <Button variant="outline" onClick={() => generateRecommendations(filters)} disabled={isGenerating} className="gap-2">
                    {isGenerating ? <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Regenerating...
                      </> : <>
                        <Sparkles className="h-4 w-4" />
                        Regenerate
                      </>}
                  </Button>
                </div>

                {/* Category Groups */}
                {["dream", "target", "safe"].map(category => {
              const categoryUniversities = filteredRecommendations.filter(u => u.category === category);
              if (categoryUniversities.length === 0) return null;
              return <div key={category}>
                      <h3 className="font-display font-semibold text-lg capitalize mb-4">
                        {category} Universities
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        {categoryUniversities.map((university, index) => <UniversityCard key={`${university.name}-${index}`} university={university} onAdd={() => addToShortlist(university)} />)}
                      </div>
                    </div>;
            })}
              </div>}
          </TabsContent>

          {/* Shortlist Tab */}
          <TabsContent value="shortlist">
            {shortlisted.length === 0 ? <Card className="p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <BookmarkCheck className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="font-display text-xl font-semibold mb-2">
                  No Universities Shortlisted Yet
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Generate recommendations and add universities to your shortlist to track them here.
                </p>
              </Card> : <div className="space-y-6">
                {/* Locked Universities */}
                {shortlisted.filter(u => u.is_locked).length > 0 && <div>
                    <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                      <Lock className="h-5 w-5 text-primary" />
                      Locked Universities
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {filteredShortlisted.filter(u => u.is_locked).map(university => <UniversityCard key={university.id} university={university} isShortlisted onUnlock={() => handleUnlock(university.id!)} />)}
                    </div>
                  </div>}

                {/* Unlocked Universities */}
                {shortlisted.filter(u => !u.is_locked).length > 0 && <div>
                    <h3 className="font-display font-semibold text-lg mb-4">
                      Shortlisted Universities
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {filteredShortlisted.filter(u => !u.is_locked).map(university => <UniversityCard key={university.id} university={university} isShortlisted onRemove={() => removeFromShortlist(university.id!)} onLock={() => lockUniversity(university.id!)} />)}
                    </div>
                  </div>}

                {/* Lock Prompt */}
                {shortlisted.length > 0 && lockedCount === 0 && <Card className="p-4 border-warning/30 bg-warning/5">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Lock at least one university</p>
                        <p className="text-sm text-muted-foreground">
                          Lock universities you're committed to applying to. This unlocks the application
                          guidance stage with personalized to-dos and timelines.
                        </p>
                      </div>
                    </div>
                  </Card>}
              </div>}
          </TabsContent>
        </Tabs>
      </div>

      {/* Unlock Confirmation Dialog */}
      <AlertDialog open={!!unlockDialog} onOpenChange={() => setUnlockDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlock University?</AlertDialogTitle>
            <AlertDialogDescription>
              Unlocking this university means you're reconsidering your application. Any
              application tasks specific to this university will be paused. You can lock it
              again anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUnlock}>Unlock</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>;
}