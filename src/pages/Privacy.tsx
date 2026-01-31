import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft } from "lucide-react";

export default function Privacy() {
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
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">Privacy Policy</h1>
              <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="leading-relaxed">
              AI Counsellor ("we") respects your privacy. This policy describes how we collect,
              use, and protect your information when you use our service.
            </p>
            <h2 className="font-display text-xl font-semibold text-foreground mt-8">Information We Collect</h2>
            <p className="leading-relaxed">
              We collect information you provide when signing up and completing your profile,
              including name, email, academic background, study goals, budget, and exam status.
              We use this to personalize your university recommendations and AI guidance.
            </p>
            <h2 className="font-display text-xl font-semibold text-foreground mt-8">How We Use It</h2>
            <p className="leading-relaxed">
              Your data is used to power the AI counsellor, generate university recommendations,
              and manage your application tasks. We do not sell your personal information to third parties.
            </p>
            <h2 className="font-display text-xl font-semibold text-foreground mt-8">Data Security</h2>
            <p className="leading-relaxed">
              We use industry-standard measures to protect your data. Authentication and
              storage are handled by secure, trusted providers.
            </p>
            <p className="leading-relaxed pt-4">
              For questions about this policy, contact us at support@aicounsellor.com.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
