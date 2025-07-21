"use client";

import { useEffect } from "react";
import { refreshFlags } from "@/lib/flagsmith";
import { initializeFeatureFlags } from "@/lib/featureFlags"; // Import initializeFeatureFlags

export default function FlagsmithRefresher() {
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const setupFlagsmith = async () => {
      try {
        // Ensure Flagsmith is initialized on the client side
        await initializeFeatureFlags();
        console.log("[FlagsmithRefresher] Flagsmith initialized on client.");

        // Start refreshing only after successful initialization
        interval = setInterval(() => {
          console.log("[FlagsmithRefresher] Explicitly refreshing flags...");
          refreshFlags();
          window.dispatchEvent(new Event('flags-updated'));
        }, 30000); // Refresh every 30 seconds
      } catch (error) {
        console.error("[FlagsmithRefresher] Error initializing Flagsmith on client:", error);
      }
    };

    setupFlagsmith();

    return () => {
      if (interval) {
        clearInterval(interval); // Cleanup on unmount
      }
    };
  }, []);

  return null; // This component doesn't render anything visible
}
