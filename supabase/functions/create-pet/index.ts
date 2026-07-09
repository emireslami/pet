const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function toEnglishDigits(value: unknown) {
  return String(value ?? "")
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

function numericOnly(value: unknown) {
  return toEnglishDigits(value).replace(/\D/g, "");
}

function decimalOnly(value: unknown) {
  return toEnglishDigits(value).replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const authorization = request.headers.get("Authorization");
    if (!supabaseUrl || !anonKey || !serviceKey || !authorization) throw new Error("نشست کاربر معتبر نیست");

    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: anonKey, Authorization: authorization },
    });
    const user = await userResponse.json();
    if (!userResponse.ok || !user?.id) throw new Error("نشست کاربر منقضی شده است");

    const input = await request.json();
    const name = String(input.name || "").trim();
    const species = String(input.species || "").trim();
    const currentWeight = decimalOnly(input.current_weight);
    const microchipNumber = numericOnly(input.microchip_number);
    if (!name || !species) throw new Error("نام و گونه پت الزامی است");

    const petResponse = await fetch(`${supabaseUrl}/rest/v1/pets?select=*`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        name,
        species,
        breed: input.breed || null,
        gender: input.gender || null,
        birth_date: input.birth_date || null,
        current_weight: currentWeight ? Number(currentWeight) : null,
        microchip_number: microchipNumber || null,
        created_by: user.id,
      }),
    });
    const pets = await petResponse.json();
    if (!petResponse.ok || !pets?.[0]?.id) throw new Error(pets?.message || "ساخت پرونده انجام نشد");
    const pet = pets[0];

    const memberResponse = await fetch(`${supabaseUrl}/rest/v1/pet_members?on_conflict=pet_id,user_id`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({ pet_id: pet.id, user_id: user.id, role: "owner", can_edit: true }),
    });
    if (!memberResponse.ok) throw new Error("ایجاد دسترسی مالک انجام نشد");

    return json({ ok: true, pet });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "خطای ناشناخته" }, 400);
  }
});
