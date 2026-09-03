// =====================================================================
//  ASCEND 2026 — connection settings  (LIVE)
//  Connected to the C-DAC Mumbai Supabase project.
//  Only the public URL + publishable key live here — both are safe to ship
//  to the browser. The database password is NEVER stored in the app.
// =====================================================================
window.ASCEND_CONFIG = {
  SUPABASE_URL: "https://axxwwjcjamccovsqojox.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_OUZwsPgcMDcYQxqt8jD_jw_Ru0DcIFw",

  ORG: "C-DAC Mumbai",
  PROGRAMME: "ASCEND 2026",
};

// Live mode whenever real credentials are present. (Leave the placeholders in
// to fall back to the offline demo store.)
window.ASCEND_DEMO =
  !window.ASCEND_CONFIG.SUPABASE_URL ||
  window.ASCEND_CONFIG.SUPABASE_URL.startsWith("YOUR_");
