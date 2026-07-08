const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type OtpRow = { created_at: string };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function normalizeIranPhone(value: string) {
  const english = String(value || "")
    .replace(/[۰-۹]/g, (x) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(x)))
    .replace(/\D/g, "");
  if (english.startsWith("09")) return `+98${english.slice(1)}`;
  if (english.startsWith("98")) return `+${english}`;
  if (english.startsWith("9") && english.length === 10) return `+98${english}`;
  return value.startsWith("+") ? value : `+${english}`;
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function supabaseRequest(path: string, init: RequestInit = {}) {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) throw new Error("Supabase service configuration is missing");
  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { phone } = await request.json();
    const normalizedPhone = normalizeIranPhone(phone);
    if (!/^\+989\d{9}$/.test(normalizedPhone)) throw new Error("شماره موبایل معتبر نیست");

    const recentResponse = await supabaseRequest(
      `login_otps?select=created_at&phone=eq.${encodeURIComponent(normalizedPhone)}&consumed_at=is.null&created_at=gte.${encodeURIComponent(new Date(Date.now() - 60_000).toISOString())}&order=created_at.desc&limit=1`,
    );
    if (!recentResponse.ok) throw new Error(await recentResponse.text());
    const recent = (await recentResponse.json()) as OtpRow[];
    if (recent.length) return json({ ok: true, cooldown: true, message: "کد قبلی هنوز معتبر است. لطفاً چند لحظه دیگر دوباره تلاش کنید." });

    const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, "0");
    const hashSecret = Deno.env.get("OTP_HASH_SECRET");
    if (!hashSecret) throw new Error("OTP_HASH_SECRET تنظیم نشده است");

    const apiKey = Deno.env.get("KAVENEGAR_API_KEY");
    if (!apiKey) throw new Error("KAVENEGAR_API_KEY تنظیم نشده است");

    const body = new URLSearchParams({
      receptor: normalizedPhone.replace(/^\+98/, "0"),
      token: code,
      template: "otp-vertica",
      type: "sms",
    });

    const kavenegarResponse = await fetch(`https://api.kavenegar.com/v1/${encodeURIComponent(apiKey)}/verify/lookup.json`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const kavenegarResult = await kavenegarResponse.json().catch(() => null);
    if (!kavenegarResponse.ok || kavenegarResult?.return?.status !== 200) {
      throw new Error(kavenegarResult?.return?.message || "ارسال کد با کاوه‌نگار ناموفق بود");
    }

    const insertResponse = await supabaseRequest("login_otps", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        phone: normalizedPhone,
        code_hash: await sha256(`${normalizedPhone}:${code}:${hashSecret}`),
        expires_at: new Date(Date.now() + 5 * 60_000).toISOString(),
      }),
    });
    if (!insertResponse.ok) throw new Error(await insertResponse.text());

    return json({ ok: true, expiresIn: 300 });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "خطای ناشناخته" }, 400);
  }
});
