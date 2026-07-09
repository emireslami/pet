import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AddRounded, AppsRounded, CalendarMonthRounded, CheckCircleRounded, CreditCardRounded,
  DescriptionRounded, FavoriteRounded, GroupsRounded, HomeRounded, LogoutRounded,
  MedicationRounded, MenuRounded, NotificationsNoneRounded, PersonRounded, ScienceRounded,
  SearchRounded, SettingsRounded, TimelineRounded,
} from "@mui/icons-material";
import {
  Alert, Avatar, Badge, Box, Button, Card, CardContent, Chip, CircularProgress, Dialog,
  DialogActions, DialogContent, DialogTitle, Divider, Drawer, FormControl, IconButton,
  InputLabel, List, ListItemButton, ListItemIcon, ListItemText, MenuItem, Paper, Select,
  Stack, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs,
  TextField, Typography,
} from "@mui/material";
import SmartEntryModal from "./SmartEntryModal";
import SharePetModal from "./SharePetModal";
import { hasSupabase, supabase } from "./lib/supabase";
import type { MedicalRecord, Pet } from "./types";

const nav = [
  ["dashboard","داشبورد",HomeRounded],["pets","پت‌ها",GroupsRounded],["timeline","تایم‌لاین پزشکی",TimelineRounded],
  ["vaccines","واکسن‌ها",CheckCircleRounded],["medications","داروها",MedicationRounded],["labs","آزمایش‌ها",ScienceRounded],
  ["documents","اسناد",DescriptionRounded],["reminders","یادآوری‌ها",NotificationsNoneRounded],
  ["costs","هزینه‌ها",CreditCardRounded],["settings","تنظیمات",SettingsRounded],
] as const;

function SectionHead({title,eyebrow,action}:{title:string;eyebrow?:string;action?:React.ReactNode}) {
  return <div className="section-head"><div>{eyebrow&&<Typography className="eyebrow" variant="caption">{eyebrow}</Typography>}<Typography variant="h5" component="h2">{title}</Typography></div>{action}</div>;
}
function PetMark({pet,size=54}:{pet:Pet;size?:number}) {
  return <Avatar className="pet-mark" sx={{width:size,height:size,background:"linear-gradient(145deg,#0071E3,#14B8A6)",fontSize:size*.4}}>{pet.name.slice(0,1)}</Avatar>;
}
function EmptyPanel({title,text,action}:{title:string;text:string;action?:React.ReactNode}) {
  return <Card className="empty-state"><CardContent><DescriptionRounded/><Typography variant="h6">{title}</Typography><Typography color="text.secondary">{text}</Typography>{action}</CardContent></Card>;
}

function PetForm({open,onClose,onSaved}:{open:boolean;onClose:()=>void;onSaved:()=>void}) {
  const [values,setValues]=useState({name:"",species:"",breed:"",gender:"",birth_date:"",current_weight:"",microchip_number:""});
  const [busy,setBusy]=useState(false),[error,setError]=useState("");
  const set=(key:string)=>(e:{target:{value:unknown}})=>setValues(v=>({...v,[key]:String(e.target.value)}));
  const save=async(e:React.FormEvent)=>{
    e.preventDefault(); if(!values.name||!values.species)return setError("نام و گونه پت را وارد کنید.");
    setBusy(true);setError("");const{data}=await supabase.auth.getUser();
    const{error:dbError}=await supabase.from("pets").insert({...values,breed:values.breed||null,gender:values.gender||null,birth_date:values.birth_date||null,current_weight:values.current_weight?Number(values.current_weight):null,microchip_number:values.microchip_number||null,created_by:data.user?.id});
    setBusy(false);if(dbError)return setError("ذخیره پرونده انجام نشد.");setValues({name:"",species:"",breed:"",gender:"",birth_date:"",current_weight:"",microchip_number:""});onClose();onSaved();
  };
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"><Box component="form" onSubmit={save}><DialogTitle>ساخت پرونده پت</DialogTitle><DialogContent><Stack spacing={2} sx={{pt:1}}>{error&&<Alert severity="error">{error}</Alert>}<div className="form-row"><TextField label="نام پت" value={values.name} onChange={set("name")} required/><FormControl size="small" required><InputLabel>گونه</InputLabel><Select label="گونه" value={values.species} onChange={set("species")}>{["سگ","گربه","پرنده","خرگوش","سایر"].map(x=><MenuItem key={x} value={x}>{x}</MenuItem>)}</Select></FormControl></div><div className="form-row"><TextField label="نژاد" value={values.breed} onChange={set("breed")}/><FormControl size="small"><InputLabel>جنسیت</InputLabel><Select label="جنسیت" value={values.gender} onChange={set("gender")}>{["نر","ماده","نامشخص"].map(x=><MenuItem key={x} value={x}>{x}</MenuItem>)}</Select></FormControl></div><div className="form-row"><TextField label="تاریخ تولد" type="date" value={values.birth_date} onChange={set("birth_date")} slotProps={{inputLabel:{shrink:true}}}/><TextField label="وزن فعلی" type="number" value={values.current_weight} onChange={set("current_weight")}/></div><TextField label="شماره میکروچیپ" value={values.microchip_number} onChange={set("microchip_number")}/></Stack></DialogContent><DialogActions><Button onClick={onClose}>انصراف</Button><Button variant="contained" type="submit" disabled={busy}>{busy?<CircularProgress size={20}/>:"ساخت پرونده"}</Button></DialogActions></Box></Dialog>;
}

function RecordTable({records,pets}:{records:MedicalRecord[];pets:Pet[]}) {
  return <TableContainer component={Paper} variant="outlined"><Table size="small"><TableHead><TableRow>{["تاریخ","پت","نوع","عنوان","کلینیک","مبلغ"].map(x=><TableCell key={x}>{x}</TableCell>)}</TableRow></TableHead><TableBody>{records.map(r=><TableRow key={r.id}><TableCell>{r.event_date||"—"}</TableCell><TableCell>{pets.find(p=>p.id===r.pet_id)?.name||"—"}</TableCell><TableCell><Chip size="small" label={r.record_type}/></TableCell><TableCell>{r.title||"—"}</TableCell><TableCell>{r.clinic||"—"}</TableCell><TableCell>{r.amount||"—"}</TableCell></TableRow>)}</TableBody></Table></TableContainer>;
}
function Dashboard({pets,records,onAddPet,onAddRecord,onOpen}:{pets:Pet[];records:MedicalRecord[];onAddPet:()=>void;onAddRecord:()=>void;onOpen:(p:Pet)=>void}) {
  const stats=[[pets.length,"تعداد پت‌ها",FavoriteRounded],[records.length,"رویدادهای پزشکی",DescriptionRounded],[0,"یادآوری‌های باز",NotificationsNoneRounded],[0,"هزینه ثبت‌شده",CreditCardRounded]] as const;
  return <><SectionHead eyebrow="پرونده سلامت پت‌ها" title="داشبورد" action={<Button variant="contained" startIcon={<AddRounded/>} onClick={pets.length?onAddRecord:onAddPet}>{pets.length?"ثبت اطلاعات پزشکی":"ساخت اولین پرونده"}</Button>}/>{pets.length>0&&<button className="quick-entry-launch" onClick={onAddRecord}><span><AddRounded/></span><div><b>ثبت اطلاعات جدید</b><small>یک عکس بگیرید؛ اطلاعات پرونده خودکار تکمیل می‌شود</small></div><i>←</i></button>}<div className="stats">{stats.map(([value,label,Icon])=><Card key={label}><CardContent><Icon color="primary"/><Typography color="text.secondary" variant="caption">{label}</Typography><Typography variant="h5">{value}</Typography></CardContent></Card>)}</div>
  {!pets.length?<EmptyPanel title="هنوز پرونده‌ای ندارید" text="برای شروع، پرونده اولین پت خود را بسازید." action={<Button variant="contained" startIcon={<AddRounded/>} onClick={onAddPet}>ساخت پرونده پت</Button>}/>:<><SectionHead title="پرونده‌های من" action={<Button startIcon={<AddRounded/>} onClick={onAddPet}>افزودن پت</Button>}/><div className="pet-grid">{pets.map(p=><Card key={p.id} className="pet-card" onClick={()=>onOpen(p)}><CardContent><div className="pet-card-head"><PetMark pet={p}/><div><Typography variant="h6">{p.name}</Typography><Typography color="text.secondary">{[p.species,p.breed].filter(Boolean).join(" · ")}</Typography></div></div><div className="pet-card-data"><div><small>جنسیت</small><b>{p.gender||"ثبت نشده"}</b></div><div><small>وزن فعلی</small><b>{p.current_weight?`${p.current_weight} کیلوگرم`:"ثبت نشده"}</b></div></div><Chip color="success" size="small" label="پرونده فعال"/></CardContent></Card>)}</div></>}
  <SectionHead title="آخرین فعالیت‌ها"/>{!records.length?<EmptyPanel title="هنوز رویدادی ثبت نشده" text="ویزیت، نسخه، آزمایش یا هر مدرک پزشکی را با تصویر ثبت کنید." action={pets.length?<Button onClick={onAddRecord}>ثبت اولین رویداد</Button>:undefined}/>:<RecordTable records={records} pets={pets}/>}</>;
}
function PetProfile({pet,records,back,onAdd,onRefresh}:{pet:Pet;records:MedicalRecord[];back:()=>void;onAdd:()=>void;onRefresh:()=>void}) {
  const[share,setShare]=useState(false),[tab,setTab]=useState(0);const list=records.filter(r=>r.pet_id===pet.id);
  return <><div className="profile-actions"><Button onClick={back}>→ بازگشت</Button><Stack direction="row"><Button startIcon={<GroupsRounded/>} onClick={()=>setShare(true)}>مدیریت دسترسی</Button><Button variant="contained" startIcon={<AddRounded/>} onClick={onAdd}>ثبت اطلاعات</Button></Stack></div><Card className="profile-head"><CardContent><div className="profile-main"><PetMark pet={pet} size={82}/><div><Typography variant="h4">{pet.name}</Typography><Typography color="text.secondary">{[pet.species,pet.breed,pet.gender].filter(Boolean).join(" · ")}</Typography></div></div><div className="pet-card-data">{[["تاریخ تولد",pet.birth_date||"ثبت نشده"],["وزن",pet.current_weight?`${pet.current_weight} کیلوگرم`:"ثبت نشده"],["میکروچیپ",pet.microchip_number||"ثبت نشده"],["تعداد سوابق",list.length]].map(([a,b])=><div key={String(a)}><small>{a}</small><b>{b}</b></div>)}</div></CardContent></Card><Tabs value={tab} onChange={(_,v)=>setTab(v)}><Tab label="نمای کلی"/><Tab label="اسناد"/></Tabs><Box sx={{mt:2}}>{tab===0?(list.length?<RecordTable records={list} pets={[pet]}/>:<EmptyPanel title="پرونده پزشکی خالی است" text="اولین سابقه پزشکی را ثبت کنید." action={<Button onClick={onAdd}>ثبت اطلاعات</Button>}/>):<EmptyPanel title="سندی ثبت نشده" text="اسناد پیوست‌شده اینجا نمایش داده می‌شوند."/ >}</Box><SharePetModal pet={pet} open={share} onClose={()=>{setShare(false);onRefresh();}}/></>;
}

export default function App(){
  const[page,setPage]=useState("dashboard"),[drawer,setDrawer]=useState(false),[loading,setLoading]=useState(true),[logoutOpen,setLogoutOpen]=useState(false);
  const[pets,setPets]=useState<Pet[]>([]),[records,setRecords]=useState<MedicalRecord[]>([]),[pet,setPet]=useState<Pet|null>(null);
  const[petModal,setPetModal]=useState(false),[recordModal,setRecordModal]=useState(false);
  const load=useCallback(async()=>{if(!hasSupabase){setLoading(false);return;}setLoading(true);const[p,r]=await Promise.all([supabase.from("pets").select("*").order("created_at"),supabase.from("medical_records").select("*").order("created_at",{ascending:false})]);setPets((p.data||[])as Pet[]);setRecords((r.data||[])as MedicalRecord[]);setLoading(false);},[]);
  useEffect(()=>{void load();},[load]);const items=useMemo(()=>nav,[]);
  const go=(key:string)=>{setPage(key);setPet(null);setDrawer(false);};
  const logout=async()=>{const{error}=await supabase.auth.signOut({scope:"local"});if(!error)window.location.replace("/");};
  const content=()=>{if(loading)return <div className="page-loading"><CircularProgress/></div>;if(pet)return <PetProfile pet={pet} records={records} back={()=>setPet(null)} onAdd={()=>setRecordModal(true)} onRefresh={load}/>;if(page==="dashboard"||page==="pets")return <Dashboard pets={pets} records={records} onAddPet={()=>setPetModal(true)} onAddRecord={()=>setRecordModal(true)} onOpen={setPet}/>;if(page==="timeline")return <><SectionHead title="تایم‌لاین پزشکی" action={<Button variant="contained" disabled={!pets.length} onClick={()=>setRecordModal(true)}>ثبت رویداد</Button>}/>{records.length?<RecordTable records={records} pets={pets}/>:<EmptyPanel title="تایم‌لاین خالی است" text="هیچ رویداد پزشکی ثبت نشده است."/ >}</>;return <><SectionHead title={nav.find(x=>x[0]===page)?.[1]||""}/><EmptyPanel title="هنوز اطلاعاتی ثبت نشده" text="این بخش با ثبت اطلاعات واقعی شما تکمیل می‌شود."/ ></>;};
  const menu=<List>{items.map(([key,label,Icon])=><ListItemButton key={key} selected={page===key} onClick={()=>go(key)}><ListItemIcon><Icon/></ListItemIcon><ListItemText primary={label}/></ListItemButton>)}</List>;
  return <Box className="app"><aside className="sider"><div className="brand"><span>V</span><div><b>Vetrica</b><small>Digital Pet Health</small></div></div>{menu}<Button className="logout-button" startIcon={<LogoutRounded/>} onClick={()=>setLogoutOpen(true)}>خروج از حساب</Button></aside><Drawer anchor="right" open={drawer} onClose={()=>setDrawer(false)}><Box sx={{width:300,p:2}}><Typography variant="h6">Vetrica</Typography>{menu}<Divider/><Button fullWidth startIcon={<LogoutRounded/>} onClick={()=>{setDrawer(false);setLogoutOpen(true)}}>خروج</Button></Box></Drawer><Box className="app-main"><header className="header"><div className="mobile-app-title"><span>V</span><div><small>Vetrica</small><b>{pet?.name||nav.find(x=>x[0]===page)?.[1]}</b></div></div><div className="desktop-title"><Typography color="text.secondary" variant="caption">فضای کاری</Typography><b>مدیریت سلامت پت‌ها</b></div><Stack className="header-actions" direction="row"><IconButton className="header-search"><SearchRounded/></IconButton><IconButton><Badge variant="dot" color="primary"><NotificationsNoneRounded/></Badge></IconButton><Avatar><PersonRounded/></Avatar></Stack></header><main className="content">{content()}</main></Box><nav className="bottom-nav"><button className={page==="dashboard"&&!pet?"active":""} onClick={()=>go("dashboard")}><HomeRounded/><span>خانه</span></button><button className={page==="pets"||!!pet?"active":""} onClick={()=>go("pets")}><FavoriteRounded/><span>پت‌ها</span></button><button className="mobile-add" onClick={()=>pets.length?setRecordModal(true):setPetModal(true)}><AddRounded/><span>ثبت</span></button><button className={page==="timeline"?"active":""} onClick={()=>go("timeline")}><CalendarMonthRounded/><span>سوابق</span></button><button onClick={()=>setDrawer(true)}><MenuRounded/><span>بیشتر</span></button></nav><PetForm open={petModal} onClose={()=>setPetModal(false)} onSaved={load}/><SmartEntryModal open={recordModal} onClose={()=>setRecordModal(false)} onSaved={load} pets={pets}/><Dialog open={logoutOpen} onClose={()=>setLogoutOpen(false)}><DialogTitle>از حساب خارج می‌شوید؟</DialogTitle><DialogContent><Typography color="text.secondary">برای ورود دوباره باید شماره موبایل و کد ورود را وارد کنید.</Typography></DialogContent><DialogActions><Button onClick={()=>setLogoutOpen(false)}>انصراف</Button><Button color="error" variant="contained" onClick={logout}>خروج از حساب</Button></DialogActions></Dialog></Box>;
}
