"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("DevSphere SW registered scope:", registration.scope);
          })
          .catch((error) => {
            console.warn("DevSphere SW registration failed:", error);
          });
      });
    }
  }, []);

  return null;
}
