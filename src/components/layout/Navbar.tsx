import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, X, User } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  isAuthenticated?: boolean;
  currentStage?: string;
  onLogout?: () => void;
}

export function Navbar({ isAuthenticated = false, currentStage, onLogout }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isLandingPage = location.pathname === "/";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-14 md:h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1.5 md:gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-base md:text-xl font-bold text-foreground">
            AI Counsellor
          </span>
        </Link>

        {/* Stage Indicator (Center) - Only shown when authenticated */}
        {isAuthenticated && currentStage && (
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-muted">
            <span className="text-sm text-muted-foreground">Current Stage:</span>
            <span className="text-sm font-medium text-primary">{currentStage}</span>
          </div>
        )}

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Link to="/universities">
                <Button variant="ghost" size="sm">
                  Universities
                </Button>
              </Link>
              <Link to="/applications">
                <Button variant="ghost" size="sm">
                  Applications
                </Button>
              </Link>
              <Link to="/counsellor">
                <Button variant="ghost" size="sm">
                  AI Counsellor
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={onLogout}>
                Logout
              </Button>
            </>
          ) : isLandingPage ? (
            <>
              <Link to="/auth?mode=login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button variant="default" size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          ) : null}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-muted"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container py-4 space-y-3">
            {isAuthenticated && currentStage && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
                <span className="text-sm text-muted-foreground">Stage:</span>
                <span className="text-sm font-medium text-primary">{currentStage}</span>
              </div>
            )}
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Dashboard
                  </Button>
                </Link>
                <Link to="/universities" className="block" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Universities
                  </Button>
                </Link>
                <Link to="/applications" className="block" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Applications
                  </Button>
                </Link>
                <Link to="/counsellor" className="block" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    AI Counsellor
                  </Button>
                </Link>
                <Link to="/profile" className="block" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <User className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    onLogout?.();
                    setMobileMenuOpen(false);
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth?mode=login" className="block" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Login
                  </Button>
                </Link>
                <Link to="/auth?mode=signup" className="block" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="default" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}