import { useEffect, useState } from "react";
import { MobileOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, Typography } from "antd";
import type { Session } from "@supabase/supabase-js";
import { hasSupabase, normalizeIranPhone, supabase } from "./lib/supabase";

const { Title, Text } = Typography;

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!hasSupabase) { setReady(true); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  const requestCode = async ({ phone }: { phone: string }) => {
    setBusy(true); setError(""); setNotice("");
    const normalizedPhone = normalizeIranPhone(phone);
    const { data, error } = await supabase.functions.invoke("send-login-otp", { body: { phone: normalizedPhone } });
    if (error || data?.error) {
      setPhone(normalizedPhone);
      setStep("code");
      setNotice("ارسال پیامک فعلاً در دسترس نیست؛ کد تست 123456 فعال است.");
    } else {
      setPhone(normalizedPhone);
      setStep("code");
      setNotice(data?.cooldown ? `${data.message} کد تست 123456 هم فعلاً فعال است.` : "کد ورود با پیامک ارسال شد. کد تست 123456 هم فعلاً فعال است.");
    }
    setBusy(false);
  };

  const verifyCode = async ({ code }: { code: string }) => {
    setBusy(true); setError(""); setNotice("");
    const { data, error } = await supabase.functions.invoke("verify-login-otp", { body: { phone, code } });
    if (error || data?.error || !data?.session?.access_token || !data?.session?.refresh_token) {
      setError(data?.error || error?.message || "کد ورود صحیح نیست.");
      setBusy(false);
      return;
    }
    const result = await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
    if (result.error) setError(result.error.message);
    setBusy(false);
  };

  if (!ready) return <div className="auth-loading">در حال آماده‌سازی…</div>;
  if (!hasSupabase || session) return <>{children}</>;

  return <main className="auth-page" dir="rtl">
    <section className="auth-brand"><div className="brand-symbol">V</div><span>Vetrica</span><h1>سلامت هر پت، در یک پرونده.</h1><p>زیرساخت دیجیتال سلامت پت‌ها برای نگهداری دقیق، امن و یکپارچه تمام سوابق پزشکی.</p><div className="family-access"><span>مالک</span><i>+</i><span>همراه</span><i>+</i><span>دامپزشک</span><b>یک پرونده سلامت واحد</b></div></section>
    <section className="auth-card"><div><SafetyCertificateOutlined /><Title level={2}>ورود به Vetrica</Title><Text type="secondary">با شماره موبایل و کد یک‌بارمصرف وارد شوید</Text></div>
      {notice && <Alert type="success" showIcon message={notice} />}
      {error && <Alert type="error" showIcon message={error} />}
      {step === "phone" ? <Form layout="vertical" onFinish={requestCode} requiredMark={false}>
        <Form.Item name="phone" label="شماره موبایل" rules={[{ required: true, pattern: /^(\+98|0)?9\d{9}$/, message: "شماره موبایل معتبر وارد کنید" }]}><Input size="large" dir="ltr" prefix={<MobileOutlined />} placeholder="0912 123 4567" /></Form.Item>
        <Button htmlType="submit" type="primary" size="large" block loading={busy}>دریافت کد ورود</Button>
      </Form> : <Form layout="vertical" onFinish={verifyCode} requiredMark={false}>
        <Form.Item label="شماره موبایل"><Input size="large" dir="ltr" value={phone} disabled /></Form.Item>
        <Form.Item name="code" label="کد ورود" rules={[{ required: true, pattern: /^\d{6}$/, message: "کد ۶ رقمی را وارد کنید" }]}>
          <Input size="large" dir="ltr" inputMode="numeric" maxLength={6} placeholder="123456" />
        </Form.Item>
        <Button htmlType="submit" type="primary" size="large" block loading={busy}>ورود</Button>
        <Button type="link" block disabled={busy} onClick={() => { setStep("phone"); setNotice(""); setError(""); }}>تغییر شماره موبایل</Button>
      </Form>}
      <small>کد ورود از طریق کاوه‌نگار و الگوی otp-vertica ارسال می‌شود. فعلاً کد تست 123456 هم فعال است.</small>
    </section>
  </main>;
}
