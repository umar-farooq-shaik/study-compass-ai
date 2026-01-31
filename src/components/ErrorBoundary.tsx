import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4 p-8 text-center bg-background rounded-lg border border-destructive/20 mt-8">
                    <div className="rounded-full bg-destructive/10 p-4">
                        <AlertCircle className="h-8 w-8 text-destructive" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
                        <p className="text-sm text-muted-foreground max-w-[400px]">
                            {this.state.error?.message || "An unexpected error occurred while loading this page."}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => window.location.reload()}
                    >
                        Reload Page
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
