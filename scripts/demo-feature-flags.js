#!/usr/bin/env node

/**
 * Demo script to show navigation with different feature flag configurations
 */

console.log("🚀 Feature Flags Navigation Demo\n");

// Function to show what navigation would look like
const showNavigation = (envConfig, description) => {
  console.log(`📋 ${description}:`);
  console.log("Environment variables:");

  // Clear all env vars first
  delete process.env.NEXT_PUBLIC_FEATURE_CLASIFICACION;
  delete process.env.NEXT_PUBLIC_FEATURE_COLECCIONABLES;
  delete process.env.NEXT_PUBLIC_FEATURE_GALERIA;
  delete process.env.NEXT_PUBLIC_FEATURE_RSVP;
  delete process.env.NEXT_PUBLIC_FEATURE_SOCIAL_MEDIA;
  delete process.env.NEXT_PUBLIC_FEATURE_CONTACTO;
  delete process.env.NEXT_PUBLIC_FEATURE_HISTORY;
  delete process.env.NEXT_PUBLIC_FEATURE_NOSOTROS;

  // Set the configuration
  Object.entries(envConfig).forEach(([key, value]) => {
    process.env[key] = value;
    console.log(`  ${key}=${value}`);
  });

  // Simulate navigation items logic
  const allNavigationItems = [
    { name: "Inicio", href: "/", feature: null },
    { name: "RSVP", href: "/rsvp", feature: "NEXT_PUBLIC_FEATURE_RSVP" },
    {
      name: "Clasificación",
      href: "/clasificacion",
      feature: "NEXT_PUBLIC_FEATURE_CLASIFICACION",
    },
    {
      name: "Coleccionables",
      href: "/coleccionables",
      feature: "NEXT_PUBLIC_FEATURE_COLECCIONABLES",
    },
    {
      name: "Galería",
      href: "/galeria",
      feature: "NEXT_PUBLIC_FEATURE_GALERIA",
    },
    {
      name: "Nosotros",
      href: "/nosotros",
      feature: "NEXT_PUBLIC_FEATURE_NOSOTROS",
    },
    {
      name: "Contacto",
      href: "/contacto",
      feature: "NEXT_PUBLIC_FEATURE_CONTACTO",
    },
    {
      name: "Historia",
      href: "/historia",
      feature: "NEXT_PUBLIC_FEATURE_HISTORY",
    },
  ];

  const visibleItems = allNavigationItems.filter(
    (item) => item.feature === null || process.env[item.feature] === "true"
  );

  console.log("Visible navigation items:");
  visibleItems.forEach((item) => {
    console.log(`  ✅ ${item.name} (${item.href})`);
  });

  const hiddenItems = allNavigationItems.filter(
    (item) => item.feature !== null && process.env[item.feature] !== "true"
  );

  if (hiddenItems.length > 0) {
    console.log("Hidden navigation items:");
    hiddenItems.forEach((item) => {
      console.log(`  ❌ ${item.name} (${item.href})`);
    });
  }

  console.log("---\n");
};

// Demo scenarios
showNavigation({}, "Default (No environment variables) - SECURE BY DEFAULT");

showNavigation(
  {
    NEXT_PUBLIC_FEATURE_RSVP: "true",
    NEXT_PUBLIC_FEATURE_NOSOTROS: "true",
  },
  "Minimal Community Setup"
);

showNavigation(
  {
    NEXT_PUBLIC_FEATURE_RSVP: "true",
    NEXT_PUBLIC_FEATURE_NOSOTROS: "true",
    NEXT_PUBLIC_FEATURE_HISTORY: "true",
    NEXT_PUBLIC_FEATURE_CONTACTO: "true",
  },
  "Basic Community Features"
);

showNavigation(
  {
    NEXT_PUBLIC_FEATURE_CLASIFICACION: "true",
    NEXT_PUBLIC_FEATURE_RSVP: "true",
    NEXT_PUBLIC_FEATURE_NOSOTROS: "true",
  },
  "Football Fan Focus"
);

showNavigation(
  {
    NEXT_PUBLIC_FEATURE_CLASIFICACION: "true",
    NEXT_PUBLIC_FEATURE_COLECCIONABLES: "true",
    NEXT_PUBLIC_FEATURE_GALERIA: "true",
    NEXT_PUBLIC_FEATURE_RSVP: "true",
    NEXT_PUBLIC_FEATURE_SOCIAL_MEDIA: "true",
    NEXT_PUBLIC_FEATURE_CONTACTO: "true",
    NEXT_PUBLIC_FEATURE_HISTORY: "true",
    NEXT_PUBLIC_FEATURE_NOSOTROS: "true",
  },
  "Full Feature Set - Everything Enabled"
);

console.log("💡 Key Benefits:");
console.log("   ✅ Security: No features exposed accidentally");
console.log("   ✅ Control: Each feature requires explicit enablement");
console.log(
  "   ✅ Flexibility: Easy to enable/disable features per environment"
);
console.log("   ✅ Testing: Can test different feature combinations safely");
