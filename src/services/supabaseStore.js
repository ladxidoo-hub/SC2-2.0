const DEFAULT_SUPABASE_URL = "https://unyeguxmctujtvrlinfa.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_SoBoYKDjeKVgrX8arJ23Cg_DVOzo29S";
const DEFAULT_TABLE_NAME = "app_state";
const APP_STATE_ID = "corp-command";
const GUIDES_STATE_ID = "guides-library";
const EVENTS_STATE_ID = "community-events";

const supabaseUrl = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL);
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  || import.meta.env.VITE_SUPABASE_ANON_KEY
  || DEFAULT_SUPABASE_PUBLISHABLE_KEY;
const tableName = import.meta.env.VITE_SUPABASE_STATE_TABLE || DEFAULT_TABLE_NAME;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && publishableKey);
}

export async function loadAppState(recordId = APP_STATE_ID) {
  const safeRecordId = normalizeRecordId(recordId);
  const rows = await supabaseRequest(
    `${tableName}?id=eq.${encodeURIComponent(safeRecordId)}&select=data,updated_at`,
    {
      headers: {
        Accept: "application/json"
      }
    }
  );

  return rows?.[0]?.data || null;
}

export async function saveAppState(recordId = APP_STATE_ID, payload = {}) {
  const safeRecordId = normalizeRecordId(recordId);
  const rows = await supabaseRequest(tableName, {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation"
    },
    body: JSON.stringify({
      id: safeRecordId,
      data: payload,
      updated_at: new Date().toISOString()
    })
  });

  return rows?.[0]?.data || payload;
}

export async function loadRemoteState() {
  return loadAppState(APP_STATE_ID);
}

export async function saveRemoteState(payload) {
  return saveAppState(APP_STATE_ID, payload);
}

export async function loadGuidesState() {
  return loadAppState(GUIDES_STATE_ID);
}

export async function saveGuidesState(payload) {
  return saveAppState(GUIDES_STATE_ID, payload);
}

export async function loadEventsState() {
  return loadAppState(EVENTS_STATE_ID);
}

export async function saveEventsState(payload) {
  return saveAppState(EVENTS_STATE_ID, payload);
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

function normalizeRecordId(value) {
  const recordId = String(value || "").trim();

  if (!recordId) {
    throw new Error("El documento de Supabase no es valido.");
  }

  return recordId;
}
