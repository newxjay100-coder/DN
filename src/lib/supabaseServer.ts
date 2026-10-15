import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * [5단계] 서버 전용 Supabase 클라이언트
 * - 서버 API 라우트(/api/...)에서만 임포트되어 실행됩니다.
 * - 브라우저 번들에 절대 노출되지 않도록 NEXT_PUBLIC_ 접두사가 없는 SUPABASE_SERVICE_ROLE_KEY를 우선 사용합니다.
 * - service_role 키를 사용하면 RLS 바이패스 권한으로 데이터 수집 및 갱신(Upsert)을 안전하게 처리할 수 있습니다.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isServerSupabaseConfigured =
  supabaseUrl.length > 0 &&
  !supabaseUrl.includes("your_project_id") &&
  (serviceRoleKey.length > 0 || anonKey.length > 0);

export const hasServiceRoleKey =
  serviceRoleKey.length > 0 && !serviceRoleKey.includes("your_service_role");

let cachedServerClient: SupabaseClient | null = null;

export function getServerSupabase(): SupabaseClient | null {
  if (!isServerSupabaseConfigured) return null;

  if (cachedServerClient) return cachedServerClient;

  // service_role 키가 등록되어 있으면 해당 키 사용, 미설정 시 개발용 anon 키 fallback
  const keyToUse = hasServiceRoleKey ? serviceRoleKey : anonKey;

  cachedServerClient = createClient(supabaseUrl, keyToUse, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedServerClient;
}
