const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type OtpRow = {
  id: string;
  phone: string;
  code_hash: string;
  expires_at: string;
  attempts: number;
  consumed_at: string | null;
};

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

function serviceHeaders() {
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY تنظیم نشده است");
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };
}

function anonHeaders() {
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!anonKey) throw new Error("SUPABASE_ANON_KEY تنظیم نشده است");
  return {
    apikey: anonKey,
    "Content-Type": "application/json",
  };
}

async function supabaseRest(path: string, init: RequestInit = {}) {
  const url = Deno.env.get("SUPABASE_URL");
  if (!url) throw new Error("SUPABASE_URL تنظیم نشده است");
  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { ...serviceHeaders(), ...(init.headers || {}) },
  });
}

async function supabaseAuth(path: string, init: RequestInit = {}, useAnon = false) {
  const url = Deno.env.get("SUPABASE_URL");
  if (!url) throw new Error("SUPABASE_URL تنظیم نشده است");
  return fetch(`${url}/auth/v1/${path}`, {
    ...init,
    headers: { ...(useAnon ? anonHeaders() : serviceHeaders()), ...(init.headers || {}) },
  });
}

async function getUserIdByPhone(phone: string) {
  const response = await supabaseRest("rpc/get_auth_user_id_by_phone", {
    method: "POST",
    body: JSON.stringify({ target_phone: phone }),
  });
  if (!response.ok) throw new Error(await response.text());
  return (await response.json()) as string | null;
}

async function ensureUser(phone: string, password: string) {
  const existingUserId = await getUserIdByPhone(phone);
  if (existingUserId) {
    const updateResponse = await supabaseAuth(`admin/users/${existingUserId}`, {
      method: "PUT",
      body: JSON.stringify({ password, phone_confirm: true }),
    });
    if (!updateResponse.ok) throw new Error(await updateResponse.text());
    return existingUserId;
  }

  const createResponse = await supabaseAuth("admin/users", {
    method: "POST",
    body: JSON.stringify({
      phone,
      password,
      phone_confirm: true,
      user_metadata: {},
    }),
  });
  if (!createResponse.ok) throw new Error(await createResponse.text());
  const created = await createResponse.json();
  return created?.id as string;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { phone, code } = await request.json();
    const normalizedPhone = normalizeIranPhone(phone);
    const normalizedCode = String(code || "")
      .replace(/[۰-۹]/g, (x) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(x)))
      .replace(/\D/g, "");

    if (!/^\+989\d{9}$/.test(normalizedPhone)) throw new Error("شماره موبایل معتبر نیست");
    if (!/^\d{6}$/.test(normalizedCode)) throw new Error("کد ورود باید ۶ رقم باشد");

    const isTemporaryOtp = normalizedCode === "123456";
    let otp: OtpRow | undefined;

    if (!isTemporaryOtp) {
      const otpResponse = await supabaseRest(
        `login_otps?select=*&phone=eq.${encodeURIComponent(normalizedPhone)}&consumed_at=is.null&order=created_at.desc&limit=1`,
      );
      if (!otpResponse.ok) throw new Error(await otpResponse.text());
      [otp] = (await otpResponse.json()) as OtpRow[];
      if (!otp) throw new Error("کد معتبری برای این شماره پیدا نشد");
      if (new Date(otp.expires_at).getTime() < Date.now()) throw new Error("کد ورود منقضی شده است");
      if (otp.attempts >= 5) throw new Error("تعداد تلاش‌ها بیش از حد مجاز است. دوباره کد بگیرید");

      const hashSecret = Deno.env.get("OTP_HASH_SECRET");
      if (!hashSecret) throw new Error("OTP_HASH_SECRET تنظیم نشده است");
      const expectedHash = await sha256(`${normalizedPhone}:${normalizedCode}:${hashSecret}`);

      if (expectedHash !== otp.code_hash) {
        await supabaseRest(`login_otps?id=eq.${otp.id}`, {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({ attempts: otp.attempts + 1 }),
        });
        throw new Error("کد ورود صحیح نیست");
      }
    }

    const loginPassword = crypto.randomUUID() + crypto.randomUUID();
    await ensureUser(normalizedPhone, loginPassword);

    if (otp) {
      await supabaseRest(`login_otps?id=eq.${otp.id}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ consumed_at: new Date().toISOString(), attempts: otp.attempts + 1 }),
      });
    }

    const tokenResponse = await supabaseAuth("token?grant_type=password", {
      method: "POST",
      body: JSON.stringify({ phone: normalizedPhone, password: loginPassword }),
    }, true);
    const session = await tokenResponse.json();
    if (!tokenResponse.ok) throw new Error(session?.error_description || session?.msg || "ساخت نشست کاربر ناموفق بود");

    return json({ ok: true, session, temporaryCode: isTemporaryOtp });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "خطای ناشناخته" }, 400);
  }
});
