"use client";

import { useEffect } from "react";

export default function FacebookSDK() {
  useEffect(() => {
    // This ensures the Facebook SDK script is only loaded on the client side
    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v23.0";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div id="fb-root"></div>;
}