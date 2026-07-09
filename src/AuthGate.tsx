import { useEffect, useState } from "react";
import PhoneIphoneRounded from "@mui/icons-material/PhoneIphoneRounded";
import VerifiedUserRounded from "@mui/icons-material/VerifiedUserRounded";
import { Alert, Box, Button, CircularProgress, Paper, TextField, Typography } from "@mui/material";
import type { Session } from "@supabase/supabase-js";
import { hasSupabase, normalizeIranPhone, supabase } from "./lib/supabase";

export default function AuthGate({ children, forceFresh = false }: { children: React.ReactNode; forceFresh?: boolean }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!hasSupabase) { setReady(true); return; }
    const prepare = async () => {
      if (forceFresh) {
        await supabase.auth.signOut({ scope: "local" }); setSession(null); setReady(true); return;
      }
      const { data } = await supabase.auth.getSession(); setSession(data.session); setReady(true);
    };
    void prepare();
    if (forceFresh) return;
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, [forceFresh]);

  const requestCode = async (event: React.FormEvent) => {
    event.preventDefault(); setError(""); setNotice("");
    if (!/^(\+98|0)?9\d{9}$/.test(phone.replace(/\s/g, ""))) return setError("شماره موبایل معتبر وارد کنید.");
    setBusy(true);
    const normalizedPhone = normalizeIranPhone(phone);
    const { data, error: invokeError } = await supabase.functions.invoke("send-login-otp", { body: { phone: normalizedPhone } });
    setPhone(normalizedPhone); setStep("code");
    setNotice(invokeError || data?.error ? "ارسال پیامک فعلاً در دسترس نیست؛ کد تست 123456 فعال است." : "کد ورود ارسال شد. کد تست 123456 هم فعلاً فعال است.");
    setBusy(false);
  };

  const verifyCode = async (event: React.FormEvent) => {
    event.preventDefault(); setError(""); setNotice("");
    if (!/^\d{6}$/.test(code)) return setError("کد ۶ رقمی را وارد کنید.");
    setBusy(true);
    const { data, error: invokeError } = await supabase.functions.invoke("verify-login-otp", { body: { phone, code } });
    if (invokeError || data?.error || !data?.session?.access_token || !data?.session?.refresh_token) {
      setError(data?.error || invokeError?.message || "کد ورود صحیح نیست."); setBusy(false); return;
    }
    const result = await supabase.auth.setSession({ access_token: data.session.access_token, refresh_token: data.session.refresh_token });
    if (result.error) setError(result.error.message); else if (forceFresh) window.location.replace("/app");
    setBusy(false);
  };

  if (!ready) return <Box className="auth-loading"><CircularProgress /></Box>;
  if (!hasSupabase || (!forceFresh && session)) return <>{children}</>;

  return <main className="auth-page" dir="rtl">
    <section className="auth-brand"><div className="brand-symbol">V</div><span>Vetrica</span><h1>سلامت هر پت، در یک پرونده.</h1><p>زیرساخت دیجیتال سلامت پت‌ها برای نگهداری دقیق، امن و یکپارچه تمام سوابق پزشکی.</p><div className="family-access"><span>مالک</span><i>+</i><span>همراه</span><i>+</i><span>دامپزشک</span><b>یک پرونده سلامت واحد</b></div></section>
    <Paper className="auth-card" component="section">
      <div><VerifiedUserRounded /><Typography variant="h5" component="h2">ثبت‌نام یا ورود</Typography><Typography color="text.secondary">شماره موبایل خود را وارد کنید؛ اگر حساب نداشته باشید، حساب شما ساخته می‌شود.</Typography></div>
      {notice && <Alert severity="success">{notice}</Alert>}{error && <Alert severity="error">{error}</Alert>}
      {step === "phone" ? <Box component="form" onSubmit={requestCode}>
        <TextField fullWidth label="شماره موبایل" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="0912 123 4567" slotProps={{htmlInput:{dir:"ltr",inputMode:"tel"},input:{startAdornment:<PhoneIphoneRounded fontSize="small"/>}}} />
        <Button fullWidth variant="contained" size="large" type="submit" disabled={busy} sx={{mt:2}}>{busy?<CircularProgress size={22} color="inherit"/>:"ادامه با شماره موبایل"}</Button>
      </Box> : <Box component="form" onSubmit={verifyCode}>
        <TextField fullWidth label="شماره موبایل" value={phone} disabled slotProps={{htmlInput:{dir:"ltr"}}} />
        <TextField fullWidth label="کد ورود" value={code} onChange={e=>setCode(e.target.value)} placeholder="123456" slotProps={{htmlInput:{dir:"ltr",inputMode:"numeric",maxLength:6}}} sx={{mt:2}} />
        <Button fullWidth variant="contained" size="large" type="submit" disabled={busy} sx={{mt:2}}>{busy?<CircularProgress size={22} color="inherit"/>:"ورود"}</Button>
        <Button fullWidth onClick={()=>{setStep("phone");setNotice("");setError("");}} disabled={busy}>تغییر شماره موبایل</Button>
      </Box>}
      <small>کد ورود از طریق کاوه‌نگار ارسال می‌شود. فعلاً کد تست 123456 هم فعال است.</small>
    </Paper>
  </main>;
}
