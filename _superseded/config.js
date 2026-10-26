// =====================================================================
//  ASCEND 2026 — connection settings
//  Paste your Supabase project values below, then commit + push.
//  Find them in: Supabase Dashboard → Project Settings → API
// =====================================================================
window.ASCEND_CONFIG = {
  SUPABASE_URL: "YOUR_SUPABASE_URL",          // e.g. https://abcdxyz.supabase.co
  SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_KEY", // the "anon / public" key (safe for the browser)

  ORG: "C-DAC Mumbai",
  PROGRAMME: "ASCEND 2026",
};

// If you leave the values as placeholders, the site runs in DEMO MODE with
// sample data so you can preview the interface without a database.
window.ASCEND_DEMO =
  !window.ASCEND_CONFIG.SUPABASE_URL ||
  window.ASCEND_CONFIG.SUPABASE_URL.startsWith("YOUR_");
