import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AppstoreOutlined, BellOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined,
  CreditCardOutlined, FileTextOutlined, HeartOutlined, HomeOutlined, LogoutOutlined,
  MedicineBoxOutlined, MenuOutlined, PlusOutlined, SearchOutlined, SettingOutlined, TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Badge, Button, Card, Descriptions, Drawer, Empty, Form, Input, Layout, Menu, Modal, Select,
  Space, Spin, Statistic, Table, Tabs, Tag, Typography, message,
} from "antd";
import SmartEntryModal from "./SmartEntryModal";
import SharePetModal from "./SharePetModal";
import { hasSupabase, supabase } from "./lib/supabase";
import type { MedicalRecord, Pet } from "./types";

const { Sider, Content } = Layout;
const { Title, Text } = Typography;
const nav = [
  ["dashboard", "داشبورد", HomeOutlined], ["pets", "پت‌ها", TeamOutlined],
  ["timeline", "تایم‌لاین پزشکی", ClockCircleOutlined], ["vaccines", "واکسن‌ها", CheckCircleOutlined],
  ["medications", "داروها", MedicineBoxOutlined], ["labs", "آزمایش‌ها", AppstoreOutlined],
  ["documents", "اسناد", FileTextOutlined], ["reminders", "یادآوری‌ها", BellOutlined],
  ["costs", "هزینه‌ها", CreditCardOutlined], ["settings", "تنظیمات", SettingOutlined],
] as const;

function SectionHead({ title, eyebrow, action }: { title: string; eyebrow?: string; action?: React.ReactNode }) {
  return <div className="section-head"><div>{eyebrow && <Text className="eyebrow">{eyebrow}</Text>}<Title level={2}>{title}</Title></div>{action}</div>;
}

function PetMark({ pet, size = 54 }: { pet: Pet; size?: number }) {
  return <div className="pet-mark" style={{ width: size, height: size, background: "linear-gradient(145deg,#2563EB,#14B8A6)", fontSize: size * .4 }}>{pet.name.slice(0, 1)}</div>;
}

function EmptyPanel({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return <Card variant="borderless" className="empty-state"><span><FileTextOutlined /></span><Title level={4}>{title}</Title><Text type="secondary">{text}</Text>{action}</Card>;
}

function PetForm({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [form] = Form.useForm(); const [busy, setBusy] = useState(false);
  const save = async (values: Record<string, string>) => {
    setBusy(true); const { data } = await supabase.auth.getUser();
    const { error } = await supabase.from("pets").insert({
      name: values.name, species: values.species, breed: values.breed || null,
      gender: values.gender || null, birth_date: values.birth_date || null,
      current_weight: values.current_weight ? Number(values.current_weight) : null,
      microchip_number: values.microchip_number || null, created_by: data.user?.id,
    });
    setBusy(false); if (error) return message.error("ذخیره پرونده انجام نشد.");
    message.success("پرونده پت ساخته شد."); form.resetFields(); onClose(); onSaved();
  };
  return <Modal title="ساخت پرونده پت" open={open} onCancel={onClose} footer={null}>
    <Form form={form} layout="vertical" onFinish={save} requiredMark={false}>
      <div className="form-row"><Form.Item name="name" label="نام پت" rules={[{ required: true, message: "نام پت را وارد کنید" }]}><Input /></Form.Item><Form.Item name="species" label="گونه" rules={[{ required: true }]}><Select options={["سگ", "گربه", "پرنده", "خرگوش", "سایر"].map(x => ({ value: x, label: x }))} /></Form.Item></div>
      <div className="form-row"><Form.Item name="breed" label="نژاد"><Input /></Form.Item><Form.Item name="gender" label="جنسیت"><Select options={["نر", "ماده", "نامشخص"].map(x => ({ value: x, label: x }))} /></Form.Item></div>
      <div className="form-row"><Form.Item name="birth_date" label="تاریخ تولد"><Input type="date" dir="ltr" /></Form.Item><Form.Item name="current_weight" label="وزن فعلی (کیلوگرم)"><Input type="number" dir="ltr" /></Form.Item></div>
      <Form.Item name="microchip_number" label="شماره میکروچیپ"><Input dir="ltr" /></Form.Item>
      <Button block size="large" type="primary" htmlType="submit" loading={busy}>ساخت پرونده</Button>
    </Form>
  </Modal>;
}

function Dashboard({ pets, records, onAddPet, onAddRecord, onOpen }: { pets: Pet[]; records: MedicalRecord[]; onAddPet: () => void; onAddRecord: () => void; onOpen: (p: Pet) => void }) {
  return <>
    <SectionHead eyebrow="پرونده سلامت پت‌ها" title="داشبورد" action={<Button type="primary" icon={<PlusOutlined />} onClick={pets.length ? onAddRecord : onAddPet}>{pets.length ? "ثبت اطلاعات پزشکی" : "ساخت اولین پرونده"}</Button>} />
    {pets.length > 0 && <button className="quick-entry-launch" onClick={onAddRecord}><span><PlusOutlined /></span><div><b>ثبت اطلاعات جدید</b><small>یک عکس بگیرید؛ اطلاعات پرونده خودکار تکمیل می‌شود</small></div><i>←</i></button>}
    <div className="stats"><Card><Statistic title="تعداد پت‌ها" value={pets.length} prefix={<HeartOutlined />} /></Card><Card><Statistic title="رویدادهای پزشکی" value={records.length} prefix={<FileTextOutlined />} /></Card><Card><Statistic title="یادآوری‌های باز" value={0} prefix={<BellOutlined />} /></Card><Card><Statistic title="هزینه ثبت‌شده" value={0} suffix="تومان" prefix={<CreditCardOutlined />} /></Card></div>
    {!pets.length ? <EmptyPanel title="هنوز پرونده‌ای ندارید" text="برای شروع، پرونده اولین پت خود را بسازید. هیچ داده نمایشی در حساب شما وجود ندارد." action={<Button type="primary" icon={<PlusOutlined />} onClick={onAddPet}>ساخت پرونده پت</Button>} /> : <><SectionHead title="پرونده‌های من" action={<Button icon={<PlusOutlined />} onClick={onAddPet}>افزودن پت</Button>} /><div className="pet-grid">{pets.map(p => <Card key={p.id} className="pet-card" onClick={() => onOpen(p)}><div className="pet-card-head"><PetMark pet={p} /><div><Title level={4}>{p.name}</Title><Text type="secondary">{[p.species, p.breed].filter(Boolean).join(" · ")}</Text></div></div><div className="pet-card-data"><div><small>جنسیت</small><b>{p.gender || "ثبت نشده"}</b></div><div><small>وزن فعلی</small><b>{p.current_weight ? `${p.current_weight} کیلوگرم` : "ثبت نشده"}</b></div></div><Tag color="green">پرونده فعال</Tag></Card>)}</div></>}
    <SectionHead title="آخرین فعالیت‌ها" />
    {!records.length ? <EmptyPanel title="هنوز رویدادی ثبت نشده" text="ویزیت، نسخه، آزمایش یا هر مدرک پزشکی را دستی یا با تصویر ثبت کنید." action={pets.length ? <Button onClick={onAddRecord}>ثبت اولین رویداد</Button> : undefined} /> : <RecordTable records={records} pets={pets} />}
  </>;
}

function RecordTable({ records, pets }: { records: MedicalRecord[]; pets: Pet[] }) {
  return <Table rowKey="id" dataSource={records} scroll={{ x: 700 }} columns={[
    { title: "تاریخ", dataIndex: "event_date" }, { title: "پت", dataIndex: "pet_id", render: id => pets.find(p => p.id === id)?.name || "—" },
    { title: "نوع", dataIndex: "record_type", render: v => <Tag>{v}</Tag> }, { title: "عنوان", dataIndex: "title" },
    { title: "کلینیک", dataIndex: "clinic" }, { title: "مبلغ", dataIndex: "amount" },
  ]} />;
}

function PetProfile({ pet, records, back, onAdd, onRefresh }: { pet: Pet; records: MedicalRecord[]; back: () => void; onAdd: () => void; onRefresh: () => void }) {
  const [share, setShare] = useState(false); const list = records.filter(r => r.pet_id === pet.id);
  return <><div className="profile-actions"><Button type="text" onClick={back}>→ بازگشت</Button><Space><Button icon={<TeamOutlined />} onClick={() => setShare(true)}>مدیریت دسترسی</Button><Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>ثبت اطلاعات</Button></Space></div>
    <Card className="profile-head"><div className="profile-main"><PetMark pet={pet} size={82} /><div><Title level={2}>{pet.name}</Title><Text type="secondary">{[pet.species, pet.breed, pet.gender].filter(Boolean).join(" · ")}</Text></div></div><Descriptions column={{ xs: 2, md: 4 }} items={[{ label: "تاریخ تولد", children: pet.birth_date || "ثبت نشده" }, { label: "وزن", children: pet.current_weight ? `${pet.current_weight} کیلوگرم` : "ثبت نشده" }, { label: "میکروچیپ", children: pet.microchip_number || "ثبت نشده" }, { label: "تعداد سوابق", children: list.length }]} /></Card>
    <Tabs items={[{ key: "overview", label: "نمای کلی", children: list.length ? <RecordTable records={list} pets={[pet]} /> : <EmptyPanel title="پرونده پزشکی خالی است" text="اولین سابقه پزشکی را ثبت کنید." action={<Button onClick={onAdd}>ثبت اطلاعات</Button>} /> }, { key: "documents", label: "اسناد", children: <EmptyPanel title="سندی ثبت نشده" text="اسناد پیوست‌شده به رویدادهای پزشکی اینجا نمایش داده می‌شوند." /> }]} />
    <SharePetModal pet={pet} open={share} onClose={() => { setShare(false); onRefresh(); }} />
  </>;
}

export default function App() {
  const [modal, modalContext] = Modal.useModal();
  const [page, setPage] = useState("dashboard"), [drawer, setDrawer] = useState(false), [loading, setLoading] = useState(true);
  const [pets, setPets] = useState<Pet[]>([]), [records, setRecords] = useState<MedicalRecord[]>([]), [pet, setPet] = useState<Pet | null>(null);
  const [petModal, setPetModal] = useState(false), [recordModal, setRecordModal] = useState(false);
  const load = useCallback(async () => { if (!hasSupabase) { setLoading(false); return; } setLoading(true); const [p, r] = await Promise.all([supabase.from("pets").select("*").order("created_at"), supabase.from("medical_records").select("*").order("created_at", { ascending: false })]); setPets((p.data || []) as Pet[]); setRecords((r.data || []) as MedicalRecord[]); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);
  const items = useMemo(() => nav.map(([key, label, Icon]) => ({ key, label, icon: <Icon /> })), []);
  const go = (key: string) => { setPage(key); setPet(null); setDrawer(false); };
  const logout = () => {
    setDrawer(false);
    modal.confirm({
      title: "از حساب خارج می‌شوید؟",
      content: "برای ورود دوباره باید شماره موبایل و کد ورود را وارد کنید.",
      okText: "خروج از حساب",
      cancelText: "انصراف",
      okButtonProps: { danger: true },
      centered: true,
      async onOk() {
        const { error } = await supabase.auth.signOut({ scope: "local" });
        if (error) {
          message.error("خروج از حساب انجام نشد. دوباره تلاش کنید.");
          throw error;
        }
        window.location.replace("/app");
      },
    });
  };
  const currentTitle = pet?.name || nav.find(x => x[0] === page)?.[1] || "داشبورد";
  const content = () => {
    if (loading) return <div className="page-loading"><Spin size="large" /></div>;
    if (pet) return <PetProfile pet={pet} records={records} back={() => setPet(null)} onAdd={() => setRecordModal(true)} onRefresh={load} />;
    if (page === "dashboard" || page === "pets") return <Dashboard pets={pets} records={records} onAddPet={() => setPetModal(true)} onAddRecord={() => setRecordModal(true)} onOpen={setPet} />;
    if (page === "timeline") return <><SectionHead title="تایم‌لاین پزشکی" action={<Button type="primary" disabled={!pets.length} onClick={() => setRecordModal(true)}>ثبت رویداد</Button>} />{records.length ? <RecordTable records={records} pets={pets} /> : <EmptyPanel title="تایم‌لاین خالی است" text="هیچ رویداد پزشکی ثبت نشده است." />}</>;
    return <><SectionHead title={nav.find(x => x[0] === page)?.[1] || ""} /><EmptyPanel title="هنوز اطلاعاتی ثبت نشده" text="این بخش با ثبت اطلاعات واقعی شما تکمیل می‌شود." /></>;
  };
  return <Layout className="app">
    {modalContext}
    <Sider width={248} className="sider"><div className="brand"><span>V</span><div><b>Vetrica</b><small>Digital Pet Health</small></div></div><Menu mode="inline" selectedKeys={[page]} items={items} onClick={({ key }) => go(key)} /><Button className="logout-button" type="text" icon={<LogoutOutlined />} onClick={logout}>خروج از حساب</Button></Sider>
    <Drawer placement="right" open={drawer} onClose={() => setDrawer(false)} title="Vetrica"><Menu mode="inline" selectedKeys={[page]} items={items} onClick={({ key }) => go(key)} /><Button block icon={<LogoutOutlined />} onClick={logout}>خروج</Button></Drawer>
    <Layout>
      <header className="header">
        <div className="mobile-app-title"><span>V</span><div><small>Vetrica</small><b>{currentTitle}</b></div></div>
        <div className="desktop-title"><Text type="secondary">فضای کاری</Text><b>مدیریت سلامت پت‌ها</b></div>
        <div className="header-actions"><Button className="header-search" shape="circle" icon={<SearchOutlined />} /><Badge><Button shape="circle" icon={<BellOutlined />} /></Badge><div className="avatar"><UserOutlined /></div></div>
      </header>
      <Content className="content">{content()}</Content>
    </Layout>
    <nav className="bottom-nav" aria-label="ناوبری اصلی">
      <button className={page === "dashboard" && !pet ? "active" : ""} onClick={() => go("dashboard")}><HomeOutlined /><span>خانه</span></button>
      <button className={page === "pets" || !!pet ? "active" : ""} onClick={() => go("pets")}><HeartOutlined /><span>پت‌ها</span></button>
      <button className="mobile-add" onClick={() => pets.length ? setRecordModal(true) : setPetModal(true)}><PlusOutlined /><span>ثبت</span></button>
      <button className={page === "timeline" ? "active" : ""} onClick={() => go("timeline")}><CalendarOutlined /><span>سوابق</span></button>
      <button onClick={() => setDrawer(true)}><MenuOutlined /><span>بیشتر</span></button>
    </nav>
    <PetForm open={petModal} onClose={() => setPetModal(false)} onSaved={load} /><SmartEntryModal open={recordModal} onClose={() => setRecordModal(false)} onSaved={load} pets={pets} />
  </Layout>;
}
