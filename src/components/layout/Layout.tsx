import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
  isAuthenticated?: boolean;
  currentStage?: string;
  onLogout?: () => void;
  hideFooter?: boolean;
}

export function Layout({
  children,
  isAuthenticated = false,
  currentStage,
  onLogout,
  hideFooter = false,
}: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden">
      <Navbar
        isAuthenticated={isAuthenticated}
        currentStage={currentStage}
        onLogout={onLogout}
      />
      <main className="flex-1 w-full max-w-full overflow-x-hidden">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}