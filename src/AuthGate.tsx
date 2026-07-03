import { useEffect, useState } from "react";
import { LockOutlined, MobileOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, Segmented, Typography } from "antd";
import type { Session } from "@supabase/supabase-js";
import { hasSupabase, normalizeIranPhone, supabase } from "./lib/supabase";

const { Title, Text } = Typography;

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hasSupabase) { setReady(true); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  const submit = async ({ phone, password, name }: { phone: string; password: string; name?: string }) => {
    setBusy(true); setError("");
    const credentials = { phone: normalizeIranPhone(phone), password };
    const result = mode === "login"
      ? await supabase.auth.signInWithPassword(credentials)
      : await supabase.auth.signUp({ ...credentials, options: { data: { full_name: name } } });
    if (result.error) setError(mode === "login" ? "شماره موبایل یا رمز عبور صحیح نیست." : result.error.message);
    setBusy(false);
  };

  if (!ready) return <div className="auth-loading">در حال آماده‌سازی…</div>;
  if (!hasSupabase || session) return <>{children}</>;

  return <main className="auth-page" dir="rtl">
    <section className="auth-brand"><div className="brand-symbol">V</div><span>Vetrica</span><h1>سلامت هر پت، در یک پرونده.</h1><p>زیرساخت دیجیتال سلامت پت‌ها برای نگهداری دقیق، امن و یکپارچه تمام سوابق پزشکی.</p><div className="family-access"><span>مالک</span><i>+</i><span>همراه</span><i>+</i><span>دامپزشک</span><b>یک پرونده سلامت واحد</b></div></section>
    <section className="auth-card"><div><SafetyCertificateOutlined /><Title level={2}>{mode === "login" ? "ورود به حساب" : "ساخت حساب جدید"}</Title><Text type="secondary">با شماره موبایل و رمز ثابت وارد شوید</Text></div>
      <Segmented block value={mode} onChange={(value) => setMode(value as typeof mode)} options={[{ value: "login", label: "ورود" }, { value: "signup", label: "ثبت‌نام" }]} />
      {error && <Alert type="error" showIcon message={error} />}
      <Form layout="vertical" onFinish={submit} requiredMark={false}>
        {mode === "signup" && <Form.Item name="name" label="نام و نام خانوادگی" rules={[{ required: true, message: "نام را وارد کنید" }]}><Input size="large" placeholder="مثلاً امیر اسلامی" /></Form.Item>}
        <Form.Item name="phone" label="شماره موبایل" rules={[{ required: true, pattern: /^(\+98|0)?9\d{9}$/, message: "شماره موبایل معتبر وارد کنید" }]}><Input size="large" dir="ltr" prefix={<MobileOutlined />} placeholder="0912 123 4567" /></Form.Item>
        <Form.Item name="password" label="رمز عبور ثابت" rules={[{ required: true, min: 8, message: "رمز عبور حداقل ۸ کاراکتر باشد" }]}><Input.Password size="large" dir="ltr" prefix={<LockOutlined />} placeholder="حداقل ۸ کاراکتر" /></Form.Item>
        <Button htmlType="submit" type="primary" size="large" block loading={busy}>{mode === "login" ? "ورود به Vetrica" : "ساخت حساب"}</Button>
      </Form>
      <small>رمز عبور به‌صورت امن در Supabase Auth نگهداری می‌شود.</small>
    </section>
  </main>;
}
