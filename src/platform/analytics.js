// Light analytics: console only (no Supabase in this project).
// Events: session_start · town_complete · day_return · ai_line_shown · ai_fallback_used
export function track(event, data = {}) {
  console.info('[analytics]', event, data);
}
