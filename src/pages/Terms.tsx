import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft } from "lucide-react";

export default function Terms() {
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
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">Terms of Service</h1>
              <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="leading-relaxed">
              By using AI Counsellor, you agree to these terms. Please read them carefully.
            </p>
            <h2 className="font-display text-xl font-semibold text-foreground mt-8">Use of Service</h2>
            <p className="leading-relaxed">
              AI Counsellor provides guidance for study-abroad planning. You must provide
              accurate information in your profile. You are responsible for verifying all
              university and application details with official sources.
            </p>
            <h2 className="font-display text-xl font-semibold text-foreground mt-8">Disclaimer</h2>
            <p className="leading-relaxed">
              This service provides guidance only and does not guarantee admission to any
              institution. Recommendations and AI advice are informational. We are not liable
              for decisions you make based on our platform.
            </p>
            <h2 className="font-display text-xl font-semibold text-foreground mt-8">Acceptable Use</h2>
            <p className="leading-relaxed">
              You agree not to misuse the service, share accounts, or use it for any unlawful
              purpose. We may suspend or terminate access if terms are violated.
            </p>
            <p className="leading-relaxed pt-4">
              For questions, contact support@aicounsellor.com.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
