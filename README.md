# Pet Health Record

رابط کاربری موبایل‌فرست برای مدیریت پرونده سلامت حیوانات خانگی.

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
