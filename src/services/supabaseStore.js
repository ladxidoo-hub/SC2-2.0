const DEFAULT_SUPABASE_URL = "https://unyeguxmctujtvrlinfa.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_SoBoYKDjeKVgrX8arJ23Cg_DVOzo29S";
const DEFAULT_TABLE_NAME = "sc2_app_state";
const APP_STATE_ID = "corp-command";

const supabaseUrl = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL);
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  || import.meta.env.VITE_SUPABASE_ANON_KEY
  || DEFAULT_SUPABASE_PUBLISHABLE_KEY;
const tableName = import.meta.env.VITE_SUPABASE_STATE_TABLE || DEFAULT_TABLE_NAME;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && publishableKey);
}

export async function loadRemoteState() {
  const rows = await supabaseRequest(
    `${tableName}?id=eq.${encodeURIComponent(APP_STATE_ID)}&select=payload,updated_at`,
    {
      headers: {
        Accept: "application/json"
      }
    }
  );

  return rows?.[0]?.payload || null;
}

export async function saveRemoteState(payload) {
  const rows = await supabaseRequest(tableName, {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation"
    },
    body: JSON.stringify({
      id: APP_STATE_ID,
      payload,
      updated_at: new Date().toISOString()
    })
  });

  return rows?.[0]?.payload || payload;
}

async function supabaseRequest(path, options = {}) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase no esta configurado.");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase respondio ${response.status}: ${detail}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function normalizeSupabaseUrl(value) {
  return String(value || "")
    .trim()
    .replace(/\/rest\/v1\/?$/i, "")
    .replace(/\/+$/, "");
}
