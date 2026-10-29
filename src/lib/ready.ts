import { useEffect, useState } from "react";

declare global {
  interface Window {
    __ymartReady?: boolean;
  }
}

/** True once the boot curtain starts opening — hero animations key off this. */
export function useReady() {
  const [ready, setReady] = useState(() => typeof window === "undefined" || !!window.__ymartReady || !document.getElementById("boot"));
  useEffect(() => {
    if (ready) return;
    const on = () => setReady(true);
    window.addEventListener("ymart:ready", on, { once: true });
    return () => window.removeEventListener("ymart:ready", on);
  }, [ready]);
  return ready;
}
