import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 32, background: "#0b0d0c", color: "#f3f2eb" }}>
        <div style={{ maxWidth: 640, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <AlertTriangle size={44} color="#c8ff2e" />
          <h2 style={{ margin: 0, fontFamily: "Space Grotesk, sans-serif", fontWeight: 500 }}>Something went wrong.</h2>
          <pre style={{ width: "100%", maxHeight: 240, overflow: "auto", padding: 14, background: "rgba(255,255,255,.06)", fontSize: 11, whiteSpace: "pre-wrap" }}>{this.state.error?.message}</pre>
          <button onClick={() => window.location.reload()} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", border: 0, borderRadius: 999, background: "#c8ff2e", color: "#11140b", fontWeight: 600, cursor: "pointer" }}>
            <RotateCcw size={15} /> Reload page
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
