import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white p-12 rounded-[2.5rem] shadow-2xl border border-rose-100">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">Something went wrong</h1>
            <p className="text-gray-500 mb-10 text-lg">
              The application encountered an unexpected error. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-8 py-4 bg-[#1e3a8a] text-white rounded-2xl font-black shadow-xl shadow-blue-900/20 hover:bg-blue-800 transition-all active:scale-95 group"
            >
              <RefreshCcw className="w-5 h-5 mr-3 group-hover:rotate-180 transition-transform duration-500" />
              Refresh App
            </button>
            {process.env.NODE_ENV !== "production" && (
              <pre className="mt-8 p-4 bg-gray-100 rounded-xl text-left text-xs text-rose-600 overflow-auto max-h-40 font-mono">
                {this.state.error?.message}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}



export default ErrorBoundary;
