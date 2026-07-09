import {
  ArrowBackRounded as ArrowLeftOutlined,
  PhotoCameraRounded as CameraOutlined,
  CheckCircleRounded as CheckCircleFilled,
  DescriptionRounded as FileTextOutlined,
  FavoriteRounded as HeartOutlined,
  PhoneIphoneRounded as MobileOutlined,
  VerifiedUserRounded as SafetyCertificateOutlined,
  GroupsRounded as TeamOutlined,
} from "@mui/icons-material";
import { Button, Chip } from "@mui/material";

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
      <a href="/login"><Button variant="outlined">ورود به حساب</Button></a>
    </header>

    <main>
      <section className="landing-hero">
        <div className="hero-copy">
          <Chip className="hero-tag" icon={<CheckCircleFilled />} label="زیرساخت دیجیتال سلامت پت‌ها" />
          <h1>سلامت هر پت،<br/><em>در یک پرونده.</em></h1>
          <p>Vetrica تمام سوابق پزشکی، واکسن‌ها، داروها، آزمایش‌ها و اسناد درمانی را در محیطی امن، دقیق و یکپارچه نگهداری می‌کند.</p>
          <div className="hero-actions"><a href="/login"><Button size="large" variant="contained" endIcon={<ArrowLeftOutlined />}>ساخت پرونده سلامت</Button></a><a href="#how"><Button size="large" variant="outlined">نحوه کار Vetrica</Button></a></div>
          <div className="hero-trust"><span><SafetyCertificateOutlined /> اطلاعات امن و خصوصی</span><span><MobileOutlined /> طراحی‌شده برای موبایل</span></div>
        </div>

        <div className="hero-visual creative-hero" aria-label="پت‌های سالم با پرونده دیجیتال Vetrica">
          <div className="visual-glow" />
          <div className="pet-stage">
            <figure className="hero-pet hero-pet-dog"><img src="/pets/default-dog.jpg" alt="سگ با پرونده سلامت دیجیتال"/><figcaption><span><b>پرونده سلامت</b><small>همیشه به‌روز و در دسترس</small></span><CheckCircleFilled/></figcaption></figure>
            <figure className="hero-pet hero-pet-cat"><img src="/pets/default-cat.jpg" alt="گربه با پرونده سلامت دیجیتال"/></figure>
            <div className="health-orbit"><HeartOutlined/><b>یک عمر مراقبت</b><small>در یک پرونده</small></div>
          </div>
          <div className="floating-card float-vaccine"><span><CheckCircleFilled /></span><div><b>واکسن بعدی</b><small>یادآوری هوشمند و به‌موقع</small></div></div>
          <div className="floating-card float-family"><span><TeamOutlined /></span><div><b>پرونده مشترک</b><small>همراه خانواده و دامپزشک</small></div></div>
        </div>
      </section>

      <section className="trust-strip"><span>تاریخچه درمان، همیشه در دسترس</span><div>{["واکسن‌ها","داروها","آزمایش‌ها","هزینه‌ها","اسناد پزشکی"].map(x=><b key={x}><CheckCircleFilled /> {x}</b>)}</div></section>

      <section className="pet-story">
        <div className="pet-story-images"><img className="story-dog" src="/pets/default-dog.jpg" alt="پرونده سلامت سگ"/><img className="story-cat" src="/pets/default-cat.jpg" alt="پرونده سلامت گربه"/><div className="story-badge"><FileTextOutlined/><b>هیچ سابقه‌ای گم نمی‌شود</b></div></div>
        <div className="pet-story-copy"><small>از اولین روز تا سال‌های مراقبت</small><h2>زندگی آن‌ها پر از لحظه است.<br/>سلامت‌شان باید یک تاریخچه کامل داشته باشد.</h2><p>هر نسخه، واکسن، آزمایش و توصیه دامپزشک به بخشی قابل جستجو از پرونده پت تبدیل می‌شود؛ مرتب، امن و همیشه همراه شما.</p><a href="/login"><Button variant="contained" size="large" endIcon={<ArrowLeftOutlined/>}>ساخت اولین پرونده</Button></a></div>
      </section>

      <section className="landing-features" id="features">
        <div className="landing-section-title"><small>یکپارچگی اطلاعات سلامت</small><h2>یک عمر مراقبت، یک پرونده</h2><p>از اولین واکسن تا درمان‌های دوره‌ای، هر رویداد پزشکی قابل رهگیری و هر سند قابل جستجو باقی می‌ماند.</p></div>
        <div className="feature-grid">{features.map((f,i)=><article key={f.title} className={`feature f${i}`}><span>{f.icon}</span><h3>{f.title}</h3><p>{f.text}</p><a href="/login">شروع کنید <ArrowLeftOutlined /></a></article>)}</div>
      </section>

      <section className="how-section" id="how">
        <div className="how-card"><div><small>ساده و سریع</small><h2>از مدرک پزشکی تا پرونده مرتب، در چند لحظه</h2><p>اطلاعات را دستی وارد کنید یا تصویر مدرک را اضافه کنید. شما همیشه پیش از ذخیره، اطلاعات استخراج‌شده را بررسی و تأیید می‌کنید.</p><ol><li><b>۱</b><span><strong>تصویر را اضافه کنید</strong><small>نسخه، فاکتور، آزمایش یا کارت واکسن</small></span></li><li><b>۲</b><span><strong>فرم را بازبینی کنید</strong><small>اطلاعات خوانده‌شده قابل ویرایش است</small></span></li><li><b>۳</b><span><strong>در پرونده ذخیره کنید</strong><small>تصویر اصلی هم پیوست باقی می‌ماند</small></span></li></ol></div><div className="document-demo"><div className="paper"><span>کلینیک دامپزشکی</span><i/><i/><i/><i/></div><div className="scan-line"/><div className="parsed-card"><CheckCircleFilled/><b>اطلاعات آماده بازبینی است</b><span>نوع: نسخه پزشکی</span><span>۳ دارو شناسایی شد</span></div></div></div>
      </section>

      <section className="security-section" id="security"><div><SafetyCertificateOutlined /><span><small>کنترل در اختیار شماست</small><h2>پرونده خصوصی، دسترسی شفاف</h2></span></div><p>مالک هر پت تعیین می‌کند چه کسی فقط پرونده را ببیند و چه کسی امکان مشاهده و ثبت اطلاعات داشته باشد.</p><a href="/login"><Button variant="contained" size="large" endIcon={<ArrowLeftOutlined />}>ساخت پرونده</Button></a></section>

      <section className="landing-cta"><SafetyCertificateOutlined/><h2>هر پت، یک پرونده پزشکی کامل.</h2><p>مدیریت دقیق سلامت با اطلاعات منظم و قابل اعتماد آغاز می‌شود.</p><a href="/login"><Button size="large" variant="contained" endIcon={<ArrowLeftOutlined />}>ورود به Vetrica</Button></a></section>
    </main>
    <footer><a className="landing-logo" href="/"><span>V</span><b>Vetrica</b></a><p>زیرساخت دیجیتال سلامت پت‌ها</p><small>© ۱۴۰۵ Vetrica</small></footer>
  </div>;
}
