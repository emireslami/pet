const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { image, recordType } = await request.json();
    if (!image || !String(image).startsWith("data:")) throw new Error("تصویر معتبر نیست");
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("OPENAI_API_KEY تنظیم نشده است");

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-5.4-mini",
        input: [{ role: "user", content: [
          { type: "input_text", text: `این مدرک پزشکی حیوانات از نوع ${recordType} است. فقط اطلاعات قابل مشاهده را استخراج کن. حدس نزن. تاریخ و مبالغ را همان‌طور که نوشته شده برگردان.` },
          { type: "input_image", image_url: image, detail: "high" },
        ]}],
        text: { format: { type: "json_schema", name: "pet_medical_record", strict: true, schema: {
          type: "object", additionalProperties: false,
          properties: {
            recordType:{type:"string"}, title:{type:"string"}, date:{type:"string"}, clinic:{type:"string"}, veterinarian:{type:"string"}, diagnosis:{type:"string"}, medications:{type:"string"}, amount:{type:"string"}, notes:{type:"string"}, confidence:{type:"number"}
          }, required:["recordType","title","date","clinic","veterinarian","diagnosis","medications","amount","notes","confidence"]
        }}}
      }),
    });
    if (!response.ok) throw new Error(await response.text());
    const result = await response.json();
    return new Response(result.output_text, { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "خطای ناشناخته" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
