"use client";

import { useEffect, useRef } from "react";

export default function FacebookSDK() {
  const loadedRef = useRef(false);

  useEffect(() => {
    // Only load Facebook SDK when user interacts with the page
    // This prevents the SDK from blocking initial page load
    const loadFBSDK = () => {
      if (loadedRef.current) return;
      loadedRef.current = true;
      
      const script = document.createElement("script");
      script.src = "https://connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v23.0";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      // Use low fetch priority to not compete with critical resources
      script.setAttribute("fetchpriority", "low");
      document.body.appendChild(script);
      
      // Remove event listeners after loading
      window.removeEventListener("scroll", loadFBSDK);
      window.removeEventListener("mousemove", loadFBSDK);
      window.removeEventListener("touchstart", loadFBSDK);
    };

    // Use requestIdleCallback with a longer timeout
    const scheduleLoad = () => {
      if ('requestIdleCallback' in window) {
        (window as typeof window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number })
          .requestIdleCallback(loadFBSDK, { timeout: 8000 });
      } else {
        // Fallback: load after 5 seconds to prioritize initial render
        setTimeout(loadFBSDK, 5000);
      }
    };

    // Add interaction listeners as a trigger
    window.addEventListener("scroll", loadFBSDK, { once: true, passive: true });
    window.addEventListener("mousemove", loadFBSDK, { once: true, passive: true });
    window.addEventListener("touchstart", loadFBSDK, { once: true, passive: true });
    
    // Schedule load regardless after a longer delay
    const timer = setTimeout(scheduleLoad, 3000);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", loadFBSDK);
      window.removeEventListener("mousemove", loadFBSDK);
      window.removeEventListener("touchstart", loadFBSDK);
    };
  }, []);

  return <div id="fb-root"></div>;
}