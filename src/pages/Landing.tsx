import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { UserCircle, Search, Lock, FileCheck, ArrowRight, Sparkles, Target, Brain } from "lucide-react";
import heroImage from "@/assets/hero-illustration.png";
const steps = [{
  icon: UserCircle,
  title: "Build Profile",
  description: "Share your academic background, goals, and preferences in a guided onboarding flow."
}, {
  icon: Search,
  title: "Discover Universities",
  description: "Explore AI-curated university recommendations tailored to your unique profile."
}, {
  icon: Lock,
  title: "Lock Decisions",
  description: "Commit to your target universities and unlock focused application guidance."
}, {
  icon: FileCheck,
  title: "Prepare Applications",
  description: "Follow personalized to-do lists and deadlines for each application."
}];
const features = [{
  icon: Brain,
  title: "Not a Chatbot",
  description: "This is a decision-making AI agent that understands your profile, reasons through options, and guides you step by step."
}, {
  icon: Target,
  title: "Not Random Browsing",
  description: "No endless scrolling through thousands of universities. Get curated Dream, Target, and Safe options."
}, {
  icon: Sparkles,
  title: "Guided Decisions",
  description: "Every stage unlocks intentionally. You'll never wonder what to do next on your study-abroad journey."
}];
export default function Landing() {
  return <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background">
        <div className="container py-20 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div className="space-y-8 text-center lg:text-left animate-fade-in">
              <div className="space-y-4">
                <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  Plan Your{" "}
                  <span className="text-gradient">Study-Abroad</span>{" "}
                  Journey with AI Counsellor
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                  Stop guessing. Start planning. Our AI counsellor guides you from confused student
                  to confident applicant with personalized, step-by-step decisions.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/auth?mode=signup">
                  <Button size="lg" className="w-full sm:w-auto gap-2 font-semibold">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/auth?mode=login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Login
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-muted-foreground">
                Free to start • No credit card required
              </p>
            </div>

            <div className="relative animate-slide-up">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl blur-3xl" />
                <img src={heroImage} alt="AI Counsellor - Study Abroad Platform" className="relative w-full h-auto rounded-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-32 bg-background">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A clear, stage-locked process that turns confusion into confidence. Every step
              unlocks intentionally.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => <div key={step.title} className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-elevated">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-lg">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>)}
          </div>
        </div>
      </section>

      {/* Why AI Counsellor */}
      <section id="why-ai" className="py-20 lg:py-32 bg-muted/30">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Why AI Counsellor?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built differently. Designed to guide, not just respond.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map(feature => <div key={feature.title} className="p-8 rounded-2xl bg-card border border-border space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center">
                  <feature.icon className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="font-display font-semibold text-xl">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>)}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="lg:py-32 bg-gradient-to-b from-background to-muted/30 py-[10px]">
        <div className="container text-center py-[80px]">
          <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg text-muted-foreground my-[20px] mb-[40px] pb-[20px]">
              Join thousands of students who've found their path. Your dream university
              awaits.
            </p>
            <Link to="/auth?mode=signup">
              <Button size="lg" className="gap-2 font-semibold">
                Get Started Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>;
}