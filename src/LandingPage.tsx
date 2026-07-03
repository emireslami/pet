import {
  ArrowLeftOutlined,
  CameraOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  FileTextOutlined,
  HeartFilled,
  MedicineBoxOutlined,
  MobileOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Button, Tag } from "antd";

const features = [
  { icon: <FileTextOutlined />, title: "پرونده پزشکی یکپارچه", text: "ویزیت‌ها، آزمایش‌ها، واکسن‌ها، داروها و اسناد همیشه مرتب و در دسترس‌اند." },
  { icon: <CameraOutlined />, title: "ثبت هوشمند با تصویر", text: "از نسخه، فاکتور یا نتیجه آزمایش عکس بگیرید؛ اطلاعات به فرم قابل بازبینی تبدیل می‌شود." },
  { icon: <TeamOutlined />, title: "همراه تمام اعضای خانواده", text: "مالک پرونده می‌تواند دسترسی مشاهده یا ثبت اطلاعات را برای دیگران مدیریت کند." },
];

const timeline = [
  { date: "امروز", title: "چکاپ دوره‌ای", meta: "کلینیک سپیدار", color: "green" },
  { date: "۹ روز دیگر", title: "واکسن هاری", meta: "یادآوری برای دارچین", color: "orange" },
  { date: "فعال", title: "مکمل آهن", meta: "روزی یک مرتبه", color: "blue" },
];

export default function LandingPage() {
  return <div className="landing" dir="rtl">
    <header className="landing-nav">
      <a className="landing-logo" href="/"><span><HeartFilled /></span><b>پت‌پرونده</b></a>
      <nav><a href="#features">امکانات</a><a href="#how">نحوه کار</a><a href="#security">امنیت</a></nav>
      <a href="/app"><Button>ورود به حساب</Button></a>
    </header>

    <main>
      <section className="landing-hero">
        <div className="hero-copy">
          <Tag className="hero-tag" icon={<CheckCircleFilled />}>پرونده سلامت دیجیتال حیوانات خانگی</Tag>
          <h1>سلامت پت شما،<br/><em>در یک پرونده کامل و همیشه همراه</em></h1>
          <p>تمام سوابق پزشکی، داروها، واکسن‌ها، اسناد و یادآوری‌های حیواناتتان را امن، منظم و قابل اشتراک نگه دارید.</p>
          <div className="hero-actions"><a href="/app"><Button size="large" type="primary">ساخت پرونده رایگان <ArrowLeftOutlined /></Button></a><a href="#how"><Button size="large">ببینید چگونه کار می‌کند</Button></a></div>
          <div className="hero-trust"><span><SafetyCertificateOutlined /> اطلاعات امن و خصوصی</span><span><MobileOutlined /> طراحی‌شده برای موبایل</span></div>
        </div>

        <div className="hero-visual" aria-label="نمایی از داشبورد پت‌پرونده">
          <div className="visual-glow" />
          <div className="phone-frame">
            <div className="phone-top"><span>۹:۴۱</span><i /></div>
            <div className="phone-brand"><span><HeartFilled /></span><div><b>سلام، امیر</b><small>وضعیت سلامت پت‌ها</small></div><span className="mini-avatar">ا</span></div>
            <div className="pet-switch"><button className="selected"><i className="pet-dot darchin">د</i><span>دارچین<small>سالم</small></span></button><button><i className="pet-dot kinder">ک</i><span>کیندر<small>پیگیری</small></span></button></div>
            <div className="mobile-score"><div><span>شاخص سلامت</span><b>عالی</b></div><strong>۹۲<small>٪</small></strong></div>
            <h4>برنامه پیش رو</h4>
            <div className="mini-timeline">{timeline.map((x) => <div key={x.title}><i className={x.color}>{x.title === "مکمل آهن" ? <MedicineBoxOutlined /> : <ClockCircleOutlined />}</i><span><b>{x.title}</b><small>{x.meta}</small></span><em>{x.date}</em></div>)}</div>
          </div>
          <div className="floating-card float-vaccine"><span><CheckCircleFilled /></span><div><b>واکسن ثبت شد</b><small>پرونده دارچین به‌روز شد</small></div></div>
          <div className="floating-card float-family"><div className="family-avatars"><i>م</i><i>پ</i><i>د</i></div><div><b>پرونده مشترک</b><small>۳ عضو خانواده</small></div></div>
        </div>
      </section>

      <section className="trust-strip"><span>یک نگاه کامل به سلامت پت</span><div>{["واکسن‌ها","داروها","آزمایش‌ها","هزینه‌ها","اسناد پزشکی"].map(x=><b key={x}><CheckCircleFilled /> {x}</b>)}</div></section>

      <section className="landing-features" id="features">
        <div className="landing-section-title"><small>همه‌چیز در یک جا</small><h2>پرونده‌ای که با پت شما رشد می‌کند</h2><p>از اولین واکسن تا مراقبت‌های دوره‌ای؛ هیچ بخش مهمی از تاریخچه سلامت گم نمی‌شود.</p></div>
        <div className="feature-grid">{features.map((f,i)=><article key={f.title} className={`feature f${i}`}><span>{f.icon}</span><h3>{f.title}</h3><p>{f.text}</p><a href="/app">شروع کنید <ArrowLeftOutlined /></a></article>)}</div>
      </section>

      <section className="how-section" id="how">
        <div className="how-card"><div><small>ساده و سریع</small><h2>از مدرک پزشکی تا پرونده مرتب، در چند لحظه</h2><p>اطلاعات را دستی وارد کنید یا تصویر مدرک را اضافه کنید. شما همیشه پیش از ذخیره، اطلاعات استخراج‌شده را بررسی و تأیید می‌کنید.</p><ol><li><b>۱</b><span><strong>تصویر را اضافه کنید</strong><small>نسخه، فاکتور، آزمایش یا کارت واکسن</small></span></li><li><b>۲</b><span><strong>فرم را بازبینی کنید</strong><small>اطلاعات خوانده‌شده قابل ویرایش است</small></span></li><li><b>۳</b><span><strong>در پرونده ذخیره کنید</strong><small>تصویر اصلی هم پیوست باقی می‌ماند</small></span></li></ol></div><div className="document-demo"><div className="paper"><span>کلینیک دامپزشکی</span><i/><i/><i/><i/></div><div className="scan-line"/><div className="parsed-card"><CheckCircleFilled/><b>اطلاعات آماده بازبینی است</b><span>نوع: نسخه پزشکی</span><span>۳ دارو شناسایی شد</span></div></div></div>
      </section>

      <section className="security-section" id="security"><div><SafetyCertificateOutlined /><span><small>کنترل در اختیار شماست</small><h2>پرونده خصوصی، دسترسی شفاف</h2></span></div><p>مالک هر پت تعیین می‌کند چه کسی فقط پرونده را ببیند و چه کسی امکان مشاهده و ثبت اطلاعات داشته باشد.</p><a href="/app"><Button type="primary" size="large">ساخت پرونده <ArrowLeftOutlined /></Button></a></section>

      <section className="landing-cta"><HeartFilled/><h2>مراقبت بهتر، با اطلاعات کامل‌تر شروع می‌شود.</h2><p>همین امروز پرونده سلامت پت‌هایتان را بسازید.</p><a href="/app"><Button size="large">ورود به پت‌پرونده <ArrowLeftOutlined /></Button></a></section>
    </main>
    <footer><a className="landing-logo" href="/"><span><HeartFilled /></span><b>پت‌پرونده</b></a><p>پرونده سلامت دیجیتال حیوانات خانگی</p><small>© ۱۴۰۵ پت‌پرونده</small></footer>
  </div>;
}
