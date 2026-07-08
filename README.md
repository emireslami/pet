# Vetrica

زیرساخت دیجیتال سلامت پت‌ها برای مدیریت پرونده پزشکی یکپارچه.

## Development

```bash
pnpm install
pnpm dev
```

## Production

```bash
pnpm build
```

خروجی تولید در پوشه `dist` ساخته می‌شود.

## ورود با پیامک کاوه‌نگار

ورود Vetrica با شماره موبایل و کد یک‌بارمصرف انجام می‌شود. ارسال پیامک از طریق Supabase Edge Function و الگوی کاوه‌نگار `otp-vertica` انجام می‌شود تا کلید API در فرانت‌اند قرار نگیرد.

متن الگو در کاوه‌نگار:

```text
کد ورود به ورتیکا
Code: %token
```

Secretهای لازم برای Supabase:

```bash
supabase secrets set KAVENEGAR_API_KEY=...
supabase secrets set OTP_HASH_SECRET=...
```

سپس migration و توابع ورود را deploy کنید:

```bash
supabase db push --linked
supabase functions deploy send-login-otp --project-ref cglqkjfqwxhckjinuhhl --no-verify-jwt
supabase functions deploy verify-login-otp --project-ref cglqkjfqwxhckjinuhhl --no-verify-jwt
```

فرانت‌اند باید با این متغیرها build شود:

```bash
VITE_SUPABASE_URL=https://cglqkjfqwxhckjinuhhl.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

## خواندن اسناد پزشکی با تصویر

رابط ثبت رکورد از ورود دستی و تصویر نسخه، تشخیص، فاکتور، آزمایش و سایر مدارک پشتیبانی می‌کند. تصویر اصلی کنار رکورد باقی می‌ماند و اطلاعات استخراج‌شده پیش از ذخیره قابل ویرایش است.

تابع امن پردازش تصویر در `supabase/functions/extract-medical-document` قرار دارد. کلید OpenAI را فقط به‌صورت secret تابع تنظیم کنید:

```bash
supabase secrets set OPENAI_API_KEY=...
supabase functions deploy extract-medical-document
```

سپس آدرس تابع را در محیط فرانت‌اند قرار دهید:

```bash
VITE_DOCUMENT_EXTRACTOR_URL=https://<project-ref>.supabase.co/functions/v1/extract-medical-document
```
