import { useMemo, useState } from "react";
import {
  AppstoreOutlined,
  BellOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  HeartOutlined,
  HomeOutlined,
  MedicineBoxOutlined,
  MenuOutlined,
  MoreOutlined,
  PlusOutlined,
  SearchOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  DatePicker,
  Descriptions,
  Drawer,
  Dropdown,
  Input,
  Layout,
  Menu,
  Progress,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from "antd";
import { events, medications, pets, reminders, vaccines } from "./mockData";
import type { HealthStatus, Pet } from "./types";
import SmartEntryModal from "./SmartEntryModal";
import SharePetModal from "./SharePetModal";
const { Sider, Content } = Layout;
const { Title, Text } = Typography;

const nav = [
  ["dashboard", "داشبورد", HomeOutlined],
  ["pets", "حیوانات", TeamOutlined],
  ["timeline", "تایم‌لاین پزشکی", ClockCircleOutlined],
  ["vaccines", "واکسن‌ها", CheckCircleFilled],
  ["medications", "داروها", MedicineBoxOutlined],
  ["labs", "آزمایش‌ها", AppstoreOutlined],
  ["documents", "اسناد", FileTextOutlined],
  ["reminders", "یادآوری‌ها", BellOutlined],
  ["costs", "هزینه‌ها", CreditCardOutlined],
  ["settings", "تنظیمات", SettingOutlined],
] as const;
const statusColor: Record<HealthStatus, string> = {
  سالم: "green",
  "نیازمند پیگیری": "orange",
  "دارای داروی فعال": "blue",
  "عقب‌افتادگی واکسن": "red",
};

function PetMark({ pet, size = 54 }: { pet: Pet; size?: number }) {
  return (
    <div
      className="pet-mark"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(145deg,${pet.color},${pet.color}bb)`,
        fontSize: size * 0.42,
      }}
    >
      {pet.initial}
      <span>♥</span>
    </div>
  );
}
function SectionHead({
  title,
  eyebrow,
  action,
}: {
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="section-head">
      <div>
        {eyebrow && <Text className="eyebrow">{eyebrow}</Text>}
        <Title level={2}>{title}</Title>
      </div>
      {action}
    </div>
  );
}
function StatCard({
  title,
  value,
  hint,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  hint: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card className="stat-card" variant="borderless">
      <div className="stat-top">
        <span className="stat-icon" style={{ background: color }}>
          {icon}
        </span>
        <MoreOutlined />
      </div>
      <Statistic title={title} value={value} />
      <Text type="secondary">{hint}</Text>
    </Card>
  );
}
function PetCard({ pet, onOpen }: { pet: Pet; onOpen: (p: Pet) => void }) {
  return (
    <Card className="pet-card" variant="borderless" onClick={() => onOpen(pet)}>
      <div className="pet-card-head">
        <PetMark pet={pet} />
        <div>
          <Title level={4}>{pet.name}</Title>
          <Text type="secondary">
            {pet.species} · {pet.breed}
          </Text>
        </div>
        <Button type="text" shape="circle" icon={<MoreOutlined />} />
      </div>
      <div className="pet-card-data">
        <div>
          <small>سن</small>
          <b>{pet.age}</b>
        </div>
        <div>
          <small>وزن فعلی</small>
          <b>{pet.weight}</b>
        </div>
      </div>
      <div className="pet-card-meta">
        <div>
          <CalendarOutlined />
          <span>ویزیت بعدی</span>
          <b>{pet.nextVaccine}</b>
        </div>
        <Tag color={statusColor[pet.status]}>{pet.status}</Tag>
      </div>
    </Card>
  );
}
function Dashboard({ openPet, onAdd }: { openPet: (p: Pet) => void; onAdd: () => void }) {
  return (
    <>
      <SectionHead
        eyebrow="جمعه، ۱۲ تیر ۱۴۰۵"
        title="سلام، روز خوبی داشته باشید"
        action={
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
            ثبت رویداد پزشکی
          </Button>
        }
      />
      <div className="stats">
        <StatCard
          title="حیوانات تحت مراقبت"
          value={2}
          hint="همه پرونده‌ها به‌روز"
          icon={<HeartOutlined />}
          color="#E4F0EC"
        />
        <StatCard
          title="یادآوری‌های نزدیک"
          value={3}
          hint="یک مورد با اولویت بالا"
          icon={<BellOutlined />}
          color="#FFF0DC"
        />
        <StatCard
          title="داروهای فعال"
          value={1}
          hint="برای کیندر"
          icon={<MedicineBoxOutlined />}
          color="#E7EEFA"
        />
        <StatCard
          title="هزینه امسال"
          value="۱۸.۶ مـ"
          hint="۱۲٪ کمتر از سال قبل"
          icon={<CreditCardOutlined />}
          color="#EEE8F8"
        />
      </div>
      <div className="split">
        <section>
          <SectionHead
            title="پرونده‌های من"
            action={<Button type="link">مشاهده همه</Button>}
          />
          <div className="pet-grid">
            {pets.map((p) => (
              <PetCard key={p.id} pet={p} onOpen={openPet} />
            ))}
          </div>
          <SectionHead
            title="آخرین فعالیت‌های پزشکی"
            action={<Button type="link">تایم‌لاین کامل</Button>}
          />
          <Card variant="borderless" className="activity-card">
            {events.slice(0, 3).map((e, i) => (
              <div className="activity" key={e.id}>
                <span className={`activity-dot d${i}`}>
                  {i === 1 ? (
                    <AppstoreOutlined />
                  ) : i === 2 ? (
                    <CheckCircleFilled />
                  ) : (
                    <MedicineBoxOutlined />
                  )}
                </span>
                <div>
                  <b>{e.title}</b>
                  <Text type="secondary">
                    {pets.find((p) => p.id === e.petId)?.name} · {e.clinic}
                  </Text>
                </div>
                <Text type="secondary">{e.date}</Text>
              </div>
            ))}
          </Card>
        </section>
        <aside>
          <SectionHead
            title="یادآوری‌های پیش رو"
            action={<Button type="text" icon={<MoreOutlined />} />}
          />
          <Card variant="borderless" className="reminders">
            {reminders.map((r, i) => (
              <div className="reminder" key={r.id}>
                <span className={`day ${i === 0 ? "urgent" : ""}`}>
                  <b>{["۱۶", "۲۱", "۳۰"][i]}</b>
                  <small>تیر</small>
                </span>
                <div>
                  <b>{r.title}</b>
                  <Text type="secondary">
                    {pets.find((p) => p.id === r.petId)?.name} · {r.type}
                  </Text>
                </div>
                <Tag
                  color={
                    r.priority === "زیاد"
                      ? "red"
                      : r.priority === "متوسط"
                        ? "orange"
                        : "default"
                  }
                >
                  {r.priority}
                </Tag>
              </div>
            ))}
            <Button block>همه یادآوری‌ها</Button>
          </Card>
          <Card className="health-score" variant="borderless">
            <div>
              <Text>شاخص تکمیل پرونده‌ها</Text>
              <Title level={3}>۸۴٪</Title>
            </div>
            <Progress percent={84} showInfo={false} strokeColor="#315F52" />
            <Text type="secondary">
              اطلاعات پزشکی کیندر نیاز به تکمیل دارد.
            </Text>
          </Card>
        </aside>
      </div>
    </>
  );
}

function Profile({ pet, back }: { pet: Pet; back: () => void }) {
  const timeline = events.filter((e) => e.petId === pet.id);
  const [shareOpen, setShareOpen] = useState(false);
  return (
    <>
      <div className="profile-actions"><Button type="text" className="back" onClick={back}>→ بازگشت به داشبورد</Button><Button onClick={() => setShareOpen(true)} icon={<TeamOutlined />}>افزودن سرپرست</Button></div>
      <Card variant="borderless" className="profile-head">
        <div className="profile-main">
          <PetMark pet={pet} size={86} />
          <div>
            <Space>
              <Title level={2}>{pet.name}</Title>
              <Tag color={statusColor[pet.status]}>{pet.status}</Tag>
            </Space>
            <Text type="secondary">
              {pet.species} · {pet.breed} · {pet.gender}
            </Text>
          </div>
        </div>
        <Descriptions
          column={{ xs: 2, sm: 3, lg: 5 }}
          items={[
            ["سن", pet.age],
            ["وزن فعلی", pet.weight],
            ["شماره میکروچیپ", pet.microchip],
            ["دامپزشک اصلی", pet.vet],
            ["عقیم‌سازی", pet.sterilized],
          ].map(([label, children]) => ({ label, children }))}
        />
      </Card>
      <Tabs
        className="profile-tabs"
        defaultActiveKey="overview"
        items={[
          {
            key: "overview",
            label: "نمای کلی",
            children: <Overview pet={pet} timeline={timeline} />,
          },
          {
            key: "timeline",
            label: "تایم‌لاین پزشکی",
            children: <TimelineView list={timeline} />,
          },
          {
            key: "vaccines",
            label: "واکسن‌ها",
            children: <Records type="vaccines" pet={pet} />,
          },
          {
            key: "meds",
            label: "داروها",
            children: <Records type="meds" pet={pet} />,
          },
          ...[
            "بیماری‌ها",
            "آزمایش‌ها",
            "تصویربرداری",
            "جراحی‌ها",
            "آلرژی‌ها",
            "رژیم غذایی",
            "اسناد",
          ].map((x, i) => ({
            key: "x" + i,
            label: x,
            children: <EmptyState title={x} />,
          })),
        ]}
      />
      <SharePetModal pet={pet} open={shareOpen} onClose={() => setShareOpen(false)} />
    </>
  );
}
function Overview({ pet, timeline }: { pet: Pet; timeline: typeof events }) {
  return (
    <div className="overview">
      <div className="mini-stats">
        {[
          ["آخرین مراجعه", pet.lastVisit],
          ["واکسن بعدی", pet.nextVaccine],
          ["داروی فعال", pet.id === "kinder" ? "۱ دارو" : "ندارد"],
          ["آخرین وزن", pet.weight],
        ].map(([a, b]) => (
          <Card variant="borderless" key={a}>
            <Text type="secondary">{a}</Text>
            <b>{b}</b>
          </Card>
        ))}
      </div>
      <SectionHead
        title="خلاصه تایم‌لاین"
        action={<Button icon={<PlusOutlined />}>افزودن رویداد</Button>}
      />
      <TimelineView list={timeline} />
    </div>
  );
}
function TimelineView({ list }: { list: typeof events }) {
  return (
    <Card variant="borderless">
      <Timeline
        items={list.map((e) => ({
          color: e.status === "نیازمند پیگیری" ? "orange" : "green",
          content: (
            <div className="timeline-item">
              <div>
                <Text type="secondary">
                  {e.date} · {e.type}
                </Text>
                <Title level={4}>{e.title}</Title>
                <p>{e.description}</p>
                <Space wrap>
                  <Tag>{e.clinic}</Tag>
                  <Tag>{e.files} فایل</Tag>
                  {e.cost && <Tag>{e.cost}</Tag>}
                </Space>
              </div>
              <Button type="link">مشاهده جزئیات</Button>
            </div>
          ),
        }))}
      />
    </Card>
  );
}
function Records({ type, pet }: { type: "vaccines" | "meds"; pet: Pet }) {
  const data =
    type === "vaccines"
      ? vaccines.filter((x) => x.petId === pet.id)
      : medications.filter((x) => x.petId === pet.id);
  const cols =
    type === "vaccines"
      ? [
          ["name", "نام واکسن"],
          ["date", "تاریخ تزریق"],
          ["brand", "برند"],
          ["clinic", "کلینیک"],
          ["next", "یادآوری بعدی"],
          ["status", "وضعیت"],
        ]
      : [
          ["name", "نام دارو"],
          ["reason", "علت مصرف"],
          ["dose", "دوز"],
          ["frequency", "تعداد مصرف"],
          ["start", "شروع"],
          ["status", "وضعیت"],
        ];
  return (
    <>
      <div className="table-actions">
        <Button type="primary" icon={<PlusOutlined />}>
          ثبت {type === "vaccines" ? "واکسن" : "داروی"} جدید
        </Button>
      </div>
      <Table<Record<string, unknown>>
        rowKey="id"
        scroll={{ x: 700 }}
        dataSource={data as unknown as Record<string, unknown>[]}
        columns={cols.map(([dataIndex, title]) => ({
          dataIndex,
          title,
          render: (v: string) =>
            dataIndex === "status" ? (
              <Tag
                color={
                  v === "فعال"
                    ? "blue"
                    : v === "موعد نزدیک"
                      ? "orange"
                      : "green"
                }
              >
                {v}
              </Tag>
            ) : (
              v
            ),
        }))}
      />
    </>
  );
}
function EmptyState({ title }: { title: string }) {
  return (
    <Card variant="borderless" className="empty-state">
      <span>
        <FileTextOutlined />
      </span>
      <Title level={4}>هنوز موردی در {title} ثبت نشده</Title>
      <Text type="secondary">
        اولین رکورد را برای تکمیل پرونده پزشکی اضافه کنید.
      </Text>
      <Button type="primary" icon={<PlusOutlined />}>
        افزودن رکورد
      </Button>
    </Card>
  );
}

function GenericPage({ page, onAdd }: { page: string; onAdd: () => void }) {
  const labels: Record<string, string> = {
    pets: "حیوانات",
    timeline: "تایم‌لاین پزشکی",
    vaccines: "واکسن‌ها",
    medications: "داروها",
    labs: "آزمایش‌ها",
    documents: "کتابخانه اسناد",
    reminders: "یادآوری‌ها",
    costs: "هزینه‌های پزشکی",
    settings: "تنظیمات",
  };
  return (
    <>
      <SectionHead
        eyebrow="مدیریت پرونده سلامت"
        title={labels[page] || page}
        action={
          page !== "settings" && (
            <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
              ثبت مورد جدید
            </Button>
          )
        }
      />
      <div className="filterbar">
        <Input
          prefix={<SearchOutlined />}
          placeholder="جست‌وجو در پرونده‌ها..."
        />
        <Select
          defaultValue="all"
          options={[
            { value: "all", label: "همه حیوانات" },
            ...pets.map((p) => ({ value: p.id, label: p.name })),
          ]}
        />
        <DatePicker.RangePicker placeholder={["از تاریخ", "تا تاریخ"]} />
      </div>
      {page === "timeline" ? (
        <TimelineView list={events} />
      ) : page === "vaccines" ? (
        <Records type="vaccines" pet={pets[0]} />
      ) : page === "medications" ? (
        <Records type="meds" pet={pets[1]} />
      ) : (
        <EmptyState title={labels[page]} />
      )}
    </>
  );
}

export default function App() {
  const [page, setPage] = useState("dashboard"),
    [pet, setPet] = useState<Pet | null>(null),
    [drawer, setDrawer] = useState(false),
    [modal, setModal] = useState(false);
  const menuItems = useMemo(
    () => nav.map(([key, label, Icon]) => ({ key, label, icon: <Icon /> })),
    [],
  );
  const go = (key: string) => {
    setPage(key);
    setPet(null);
    setDrawer(false);
  };
  return (
    <Layout className="app">
      <Sider width={248} className="sider">
        <div className="brand">
          <span>
            <HeartOutlined />
          </span>
          <div>
            <b>پت‌پرونده</b>
            <small>سلامت، همیشه همراه</small>
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[page]}
          items={menuItems}
          onClick={({ key }) => go(key)}
        />
        <div className="sider-profile">
          <span>
            <UserOutlined />
          </span>
          <div>
            <b>امیر اسلامی</b>
            <small>سرپرست حیوانات</small>
          </div>
          <MoreOutlined />
        </div>
      </Sider>
      <Drawer
        placement="right"
        open={drawer}
        onClose={() => setDrawer(false)}
        size={280}
        title="پت‌پرونده"
      >
        <Menu
          mode="inline"
          selectedKeys={[page]}
          items={menuItems}
          onClick={({ key }) => go(key)}
        />
      </Drawer>
      <Layout>
        <header className="header">
          <Button
            className="mobile-menu"
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setDrawer(true)}
          />
          <div className="desktop-title">
            <Text type="secondary">فضای کاری</Text>
            <b>{page === "dashboard" ? "داشبورد سلامت" : "مدیریت پرونده"}</b>
          </div>
          <div className="header-actions">
            <Button shape="circle" icon={<SearchOutlined />} />
            <Badge dot>
              <Button shape="circle" icon={<BellOutlined />} />
            </Badge>
            <div className="avatar">ا</div>
          </div>
        </header>
        <Content className="content">
          {pet ? (
            <Profile pet={pet} back={() => setPet(null)} />
          ) : page === "dashboard" ? (
            <Dashboard openPet={setPet} onAdd={() => setModal(true)} />
          ) : (
            <GenericPage page={page} onAdd={() => setModal(true)} />
          )}
        </Content>
        <nav className="bottom-nav">
          {nav.slice(0, 4).map(([key, label, Icon]) => (
            <button
              className={page === key ? "active" : ""}
              key={key}
              onClick={() => go(key)}
            >
              <Icon />
              <span>{label.replace("تایم‌لاین پزشکی", "تایم‌لاین")}</span>
            </button>
          ))}
          <Dropdown
            menu={{ items: menuItems.slice(4), onClick: ({ key }) => go(key) }}
            trigger={["click"]}
          >
            <button>
              <MoreOutlined />
              <span>بیشتر</span>
            </button>
          </Dropdown>
        </nav>
      </Layout>
      <SmartEntryModal open={modal} onClose={() => setModal(false)} pets={pets} />
    </Layout>
  );
}
