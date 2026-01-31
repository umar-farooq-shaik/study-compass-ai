import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";
export function Footer() {
  return <footer className="border-t border-border bg-muted/30">
      <div className="container pb-[20px] my-0 pt-[20px] py-[20px]">
        <div className="grid gap-8 md:grid-cols-4 pb-0 mb-[10px]">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold">AI Counsellor</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your guided study-abroad journey starts here. Plan, decide, and execute with confidence.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-foreground">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/#how-it-works" className="hover:text-foreground transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/#why-ai" className="hover:text-foreground transition-colors">
                  Why AI Counsellor
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-foreground">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <a href="mailto:support@aicounsellor.com" className="hover:text-foreground transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-0 pt-[10px]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} AI Counsellor. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/70 max-w-md text-center md:text-right">
              <strong>Disclaimer:</strong> This service provides guidance only and does not guarantee admission to any institution.
            </p>
          </div>
        </div>
      </div>
    </footer>;
}