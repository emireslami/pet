import {
  ArrowLeftOutlined,
  CameraOutlined,
  CheckCircleFilled,
  FileTextOutlined,
  HeartOutlined,
  MobileOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Tag } from "antd";

const features = [
  { icon: <FileTextOutlined />, title: "پرونده پزشکی یکپارچه", text: "ویزیت‌ها، آزمایش‌ها، واکسن‌ها، داروها و اسناد همیشه مرتب و در دسترس‌اند." },
  { icon: <CameraOutlined />, title: "ثبت هوشمند با تصویر", text: "از نسخه، فاکتور یا نتیجه آزمایش عکس بگیرید؛ اطلاعات به فرم قابل بازبینی تبدیل می‌شود." },
  { icon: <TeamOutlined />, title: "پرونده سلامت مشترک", text: "مالک پرونده می‌تواند دسترسی مشاهده یا ثبت اطلاعات را برای اعضای خانواده و دامپزشک مدیریت کند." },
];

export default function LandingPage() {
  return <div className="landing" dir="rtl">
    <header className="landing-nav">
      <a className="landing-logo" href="/"><span>V</span><b>Vetrica</b></a>
      <nav><a href="#features">امکانات</a><a href="#how">نحوه کار</a><a href="#security">امنیت</a></nav>
      <a href="/login"><Button>ورود به حساب</Button></a>
    </header>

    <main>
      <section className="landing-hero">
        <div className="hero-copy">
          <Tag className="hero-tag" icon={<CheckCircleFilled />}>زیرساخت دیجیتال سلامت پت‌ها</Tag>
          <h1>سلامت هر پت،<br/><em>در یک پرونده.</em></h1>
          <p>Vetrica تمام سوابق پزشکی، واکسن‌ها، داروها، آزمایش‌ها و اسناد درمانی را در محیطی امن، دقیق و یکپارچه نگهداری می‌کند.</p>
          <div className="hero-actions"><a href="/login"><Button size="large" type="primary">ساخت پرونده سلامت <ArrowLeftOutlined /></Button></a><a href="#how"><Button size="large">نحوه کار Vetrica</Button></a></div>
          <div className="hero-trust"><span><SafetyCertificateOutlined /> اطلاعات امن و خصوصی</span><span><MobileOutlined /> طراحی‌شده برای موبایل</span></div>
        </div>

        <div className="hero-visual" aria-label="نمایی از داشبورد Vetrica">
          <div className="visual-glow" />
          <div className="phone-frame">
            <div className="phone-top"><span>۹:۴۱</span><i /></div>
            <div className="phone-brand"><span>V</span><div><b>Vetrica</b><small>پرونده سلامت پت‌ها</small></div><span className="mini-avatar"><UserOutlined /></span></div>
            <div className="fresh-preview"><HeartOutlined /><h3>حساب شما آماده است</h3><p>اولین پرونده پت خود را بسازید و ثبت سوابق پزشکی را شروع کنید.</p><button><PlusOutlined /> ساخت اولین پرونده</button></div>
            <div className="fresh-checks"><span><CheckCircleFilled /> بدون اطلاعات نمایشی</span><span><SafetyCertificateOutlined /> فضای خصوصی شما</span><span><FileTextOutlined /> آماده ثبت اطلاعات واقعی</span></div>
          </div>
          <div className="floating-card float-vaccine"><span><SafetyCertificateOutlined /></span><div><b>فضای امن و خصوصی</b><small>فقط افراد مجاز دسترسی دارند</small></div></div>
          <div className="floating-card float-family"><span><TeamOutlined /></span><div><b>دسترسی قابل مدیریت</b><small>مشاهده یا ثبت اطلاعات</small></div></div>
        </div>
      </section>

      <section className="trust-strip"><span>تاریخچه درمان، همیشه در دسترس</span><div>{["واکسن‌ها","داروها","آزمایش‌ها","هزینه‌ها","اسناد پزشکی"].map(x=><b key={x}><CheckCircleFilled /> {x}</b>)}</div></section>

      <section className="landing-features" id="features">
        <div className="landing-section-title"><small>یکپارچگی اطلاعات سلامت</small><h2>یک عمر مراقبت، یک پرونده</h2><p>از اولین واکسن تا درمان‌های دوره‌ای، هر رویداد پزشکی قابل رهگیری و هر سند قابل جستجو باقی می‌ماند.</p></div>
        <div className="feature-grid">{features.map((f,i)=><article key={f.title} className={`feature f${i}`}><span>{f.icon}</span><h3>{f.title}</h3><p>{f.text}</p><a href="/login">شروع کنید <ArrowLeftOutlined /></a></article>)}</div>
      </section>

      <section className="how-section" id="how">
        <div className="how-card"><div><small>ساده و سریع</small><h2>از مدرک پزشکی تا پرونده مرتب، در چند لحظه</h2><p>اطلاعات را دستی وارد کنید یا تصویر مدرک را اضافه کنید. شما همیشه پیش از ذخیره، اطلاعات استخراج‌شده را بررسی و تأیید می‌کنید.</p><ol><li><b>۱</b><span><strong>تصویر را اضافه کنید</strong><small>نسخه، فاکتور، آزمایش یا کارت واکسن</small></span></li><li><b>۲</b><span><strong>فرم را بازبینی کنید</strong><small>اطلاعات خوانده‌شده قابل ویرایش است</small></span></li><li><b>۳</b><span><strong>در پرونده ذخیره کنید</strong><small>تصویر اصلی هم پیوست باقی می‌ماند</small></span></li></ol></div><div className="document-demo"><div className="paper"><span>کلینیک دامپزشکی</span><i/><i/><i/><i/></div><div className="scan-line"/><div className="parsed-card"><CheckCircleFilled/><b>اطلاعات آماده بازبینی است</b><span>نوع: نسخه پزشکی</span><span>۳ دارو شناسایی شد</span></div></div></div>
      </section>

      <section className="security-section" id="security"><div><SafetyCertificateOutlined /><span><small>کنترل در اختیار شماست</small><h2>پرونده خصوصی، دسترسی شفاف</h2></span></div><p>مالک هر پت تعیین می‌کند چه کسی فقط پرونده را ببیند و چه کسی امکان مشاهده و ثبت اطلاعات داشته باشد.</p><a href="/login"><Button type="primary" size="large">ساخت پرونده <ArrowLeftOutlined /></Button></a></section>

      <section className="landing-cta"><SafetyCertificateOutlined/><h2>هر پت، یک پرونده پزشکی کامل.</h2><p>مدیریت دقیق سلامت با اطلاعات منظم و قابل اعتماد آغاز می‌شود.</p><a href="/login"><Button size="large">ورود به Vetrica <ArrowLeftOutlined /></Button></a></section>
    </main>
    <footer><a className="landing-logo" href="/"><span>V</span><b>Vetrica</b></a><p>زیرساخت دیجیتال سلامت پت‌ها</p><small>© ۱۴۰۵ Vetrica</small></footer>
  </div>;
}
