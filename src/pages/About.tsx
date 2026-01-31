import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowLeft } from "lucide-react";

export default function About() {
  return (
    <Layout>
      <div className="container py-12 lg:py-16">
        <Link to="/">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">About AI Counsellor</h1>
              <p className="text-muted-foreground">Your guided study-abroad advisor</p>
            </div>
          </div>
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              AI Counsellor is a decision-driven, stage-locked platform designed to take you from
              confused student to confident applicant. We are not a chatbot or a listing site—we
              guide your decisions with AI that reasons, explains, and helps you execute your
              study-abroad journey step by step.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our mission is to reduce overwhelm by giving you one clear path: build your profile,
              discover universities that fit, lock your choices, and prepare applications with
              personalized to-dos. Every stage unlocks intentionally so you always know what to do next.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This service provides guidance only and does not guarantee admission to any institution.
              Always verify information with official university sources.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
