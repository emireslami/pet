import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AddRounded, AppsRounded, CalendarMonthRounded, CheckCircleRounded,
  DescriptionRounded, FavoriteRounded, GroupsRounded, HomeRounded, LogoutRounded,
  MedicationRounded, MenuRounded, NotificationsNoneRounded, PersonRounded, ScienceRounded,
  SearchRounded, SettingsRounded, SupportAgentRounded, TimelineRounded,
} from "@mui/icons-material";
import {
  Alert, Autocomplete, Avatar, Badge, Box, Button, Card, CardContent, Chip, CircularProgress, Dialog,
  DialogActions, DialogContent, DialogTitle, Divider, Drawer, FormControl, IconButton,
  InputLabel, List, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Paper, Select,
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
  ["settings","تنظیمات",SettingsRounded],
] as const;

function SectionHead({title,eyebrow,action}:{title:string;eyebrow?:string;action?:React.ReactNode}) {
  return <div className="section-head"><div>{eyebrow&&<Typography className="eyebrow" variant="caption">{eyebrow}</Typography>}<Typography variant="h5" component="h2">{title}</Typography></div>{action}</div>;
}
function PetMark({pet,size=54}:{pet:Pet;size?:number}) {
  const fallback=pet.species==="گربه"?"/pets/default-cat.jpg":"/pets/default-dog.jpg";
  return <Avatar className="pet-mark" src={pet.photo_url||fallback} alt={pet.name} sx={{width:size,height:size,background:"linear-gradient(145deg,#0071E3,#14B8A6)",fontSize:size*.4}}>{pet.name.slice(0,1)}</Avatar>;
}
function EmptyPanel({title,text,action}:{title:string;text:string;action?:React.ReactNode}) {
  return <Card className="empty-state"><CardContent><DescriptionRounded/><Typography variant="h6">{title}</Typography><Typography color="text.secondary">{text}</Typography>{action}</CardContent></Card>;
}

const OTHER_OPTION = "سایر";
type TaxonomySpecies = { id:string; code:"DOG"|"CAT"|"RABBIT"|"BIRD"|"OTHER"; name_fa:string; name_en:string; is_custom_allowed:boolean };
type TaxonomyBreed = { id:string; species_id:string; code:string; name_fa:string; name_en:string; group_fa?:string|null; group_en?:string|null };
const speciesEmoji: Record<string,string> = { DOG:"🐶", CAT:"🐱", BIRD:"🐦", RABBIT:"🐰", OTHER:"✨" };
const speciesLabel = (option:TaxonomySpecies) => `${speciesEmoji[option.code] || "•"} ${option.name_fa} / ${option.name_en}`;
const breedLabel = (option:TaxonomyBreed) => `${option.name_fa} / ${option.name_en}`;
const taxonomySearchText = (option:TaxonomySpecies|TaxonomyBreed) => [
  "code" in option ? option.code : "",
  option.name_fa,
  option.name_en,
  "group_fa" in option ? option.group_fa || "" : "",
  "group_en" in option ? option.group_en || "" : "",
].join(" ").toLowerCase();
const filterTaxonomyOptions = <T extends TaxonomySpecies|TaxonomyBreed>(options:T[],state:{inputValue:string}) => {
  const query=toEnglishDigits(state.inputValue).trim().toLowerCase();
  if(!query)return options;
  return options.filter(option=>taxonomySearchText(option).includes(query));
};
const persianMonths = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
const toEnglishDigits = (value:string) => value
  .replace(/[۰-۹]/g, digit => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
  .replace(/[٠-٩]/g, digit => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
const numericOnly = (value:string) => toEnglishDigits(value).replace(/\D/g,"");
const decimalOnly = (value:string) => toEnglishDigits(value).replace(/[^\d.]/g,"").replace(/(\..*)\./g,"$1");
const faNumber = new Intl.NumberFormat("fa-IR");
const pad2 = (value:number) => String(value).padStart(2,"0");
function jalaliToGregorian(jy:number,jm:number,jd:number) {
  jy+=1595;let days=-355668+(365*jy)+Math.floor(jy/33)*8+Math.floor(((jy%33)+3)/4)+jd+(jm<7?(jm-1)*31:((jm-7)*30)+186);
  let gy=400*Math.floor(days/146097);days%=146097;
  if(days>36524){gy+=100*Math.floor(--days/36524);days%=36524;if(days>=365)days++;}
  gy+=4*Math.floor(days/1461);days%=1461;
  if(days>365){gy+=Math.floor((days-1)/365);days=(days-1)%365;}
  let gd=days+1;const sal=[0,31,((gy%4===0&&gy%100!==0)||gy%400===0)?29:28,31,30,31,30,31,31,30,31,30,31];let gm=0;
  for(gm=1;gm<=12&&gd>sal[gm];gm++)gd-=sal[gm];
  return [gy,gm,gd] as const;
}
function gregorianToJalali(gy:number,gm:number,gd:number) {
  const gdm=[0,31,59,90,120,151,181,212,243,273,304,334];let jy=(gy<=1600)?0:979;gy-=(gy<=1600)?621:1600;
  let gy2=(gm>2)?gy+1:gy;let days=(365*gy)+Math.floor((gy2+3)/4)-Math.floor((gy2+99)/100)+Math.floor((gy2+399)/400)-80+gd+gdm[gm-1];
  jy+=33*Math.floor(days/12053);days%=12053;jy+=4*Math.floor(days/1461);days%=1461;
  if(days>365){jy+=Math.floor((days-1)/365);days=(days-1)%365;}
  const jm=days<186?1+Math.floor(days/31):7+Math.floor((days-186)/30);
  const jd=1+(days<186?days%31:(days-186)%30);
  return [jy,jm,jd] as const;
}
const jalaliToIso = (jy:string,jm:string,jd:string) => {
  const year=Number(jy),month=Number(jm||"1"),day=Number(jd||"1");
  if(!year)return "";
  const [gy,gm,gd]=jalaliToGregorian(year,month,day);
  return `${gy}-${pad2(gm)}-${pad2(gd)}`;
};
function formatJalaliDate(iso?:string|null) {
  if(!iso)return "";
  const date=new Date(`${iso}T00:00:00`);
  if(Number.isNaN(date.getTime()))return iso;
  const [jy,jm,jd]=gregorianToJalali(date.getFullYear(),date.getMonth()+1,date.getDate());
  return `${jd} ${persianMonths[jm-1]} ${jy}`;
}
const thisJalaliYear = gregorianToJalali(new Date().getFullYear(),new Date().getMonth()+1,new Date().getDate())[0];
const jalaliYears = Array.from({length:35},(_,i)=>thisJalaliYear-i);
const jalaliMonthDays = (year:string,month:string) => {
  const m=Number(month||"1"),y=Number(year);
  if(m<=6)return 31;
  if(m<=11)return 30;
  if(!y)return 29;
  const [startGy,startGm,startGd]=jalaliToGregorian(y,12,1);
  const [endGy,endGm,endGd]=jalaliToGregorian(y+1,1,1);
  return Math.round((Date.UTC(endGy,endGm-1,endGd)-Date.UTC(startGy,startGm-1,startGd))/86400000);
};
function calculateAgeText(jy:string,jm:string,jd:string) {
  if(!jy)return "با انتخاب سال تولد، سن تا امروز اینجا نمایش داده می‌شود.";
  const birthYear=Number(jy),birthMonth=Number(jm||"1"),birthDay=Number(jd||"1");
  const today=new Date(),[todayYear,todayMonth,todayDay]=gregorianToJalali(today.getFullYear(),today.getMonth()+1,today.getDate());
  let years=todayYear-birthYear,months=todayMonth-birthMonth,days=todayDay-birthDay;
  if(days<0){
    const prevMonth=todayMonth===1?12:todayMonth-1;
    const prevMonthYear=todayMonth===1?todayYear-1:todayYear;
    days+=jalaliMonthDays(String(prevMonthYear),String(prevMonth));
    months-=1;
  }
  if(months<0){years-=1;months+=12;}
  if(years<0)return "تاریخ تولد در آینده است.";
  if(!years&&!months&&!days)return "امروز";
  return [years?`${faNumber.format(years)} سال`:"",months?`${faNumber.format(months)} ماه`:"",days?`${faNumber.format(days)} روز`:""].filter(Boolean).join(" و ");
}

function PetForm({open,onClose,onSaved}:{open:boolean;onClose:()=>void;onSaved:()=>void}) {
  const [values,setValues]=useState({name:"",species:"",species_id:"",breed:"",breed_id:"",gender:"",birth_date:"",current_weight:"",microchip_number:""});
  const [busy,setBusy]=useState(false),[error,setError]=useState(""),[photo,setPhoto]=useState<File|null>(null),[photoPreview,setPhotoPreview]=useState("");
  const [customSpecies,setCustomSpecies]=useState(""),[customBreed,setCustomBreed]=useState("");
  const [speciesOptions,setSpeciesOptions]=useState<TaxonomySpecies[]>([]),[breedOptions,setBreedOptions]=useState<TaxonomyBreed[]>([]);
  const [taxonomyLoading,setTaxonomyLoading]=useState(false);
  const [birth,setBirth]=useState({year:"",month:"",day:""});
  const set=(key:string)=>(e:{target:{value:unknown}})=>setValues(v=>({...v,[key]:String(e.target.value)}));
  const selectedSpecies=speciesOptions.find(option=>option.id===values.species_id)||null;
  const selectedBreed=breedOptions.find(option=>option.id===values.breed_id)||null;
  const setSpeciesOption=(option:TaxonomySpecies|null)=>{setValues(v=>({...v,species:option?.name_fa||"",species_id:option?.id||"",breed:"",breed_id:""}));setCustomSpecies("");setCustomBreed("");setBreedOptions([]);};
  const setBreedOption=(option:TaxonomyBreed|null)=>{setValues(v=>({...v,breed:option?.name_fa||"",breed_id:option?.id||""}));setCustomBreed("");};
  useEffect(()=>{if(!open||!hasSupabase)return;let active=true;setTaxonomyLoading(true);supabase.from("species").select("id,code,name_fa,name_en,is_custom_allowed").eq("is_active",true).order("code").then(({data,error})=>{if(!active)return;if(error)setError("دریافت فهرست گونه‌ها انجام نشد.");else setSpeciesOptions((data||[]) as TaxonomySpecies[]);setTaxonomyLoading(false);});return()=>{active=false};},[open]);
  useEffect(()=>{if(!open||!values.species_id||!hasSupabase){setBreedOptions([]);return;}let active=true;supabase.from("breeds").select("id,species_id,code,name_fa,name_en,group_fa,group_en").eq("species_id",values.species_id).eq("is_active",true).order("group_en").order("name_en").then(({data,error})=>{if(!active)return;if(error)setError("دریافت فهرست نژادها انجام نشد.");else setBreedOptions((data||[]) as TaxonomyBreed[]);});return()=>{active=false};},[open,values.species_id]);
  const setBirthPart=(key:"year"|"month"|"day",raw:string)=>{
    const clean=numericOnly(raw).slice(0,key==="year"?4:2);
    const next={...birth,[key]:clean};
    if(key==="month"||key==="year"){
      const maxDay=jalaliMonthDays(key==="year"?clean:next.year,key==="month"?clean:next.month);
      if(Number(next.day)>maxDay)next.day="";
    }
    setBirth(next);
    setValues(v=>({...v,birth_date:jalaliToIso(next.year,next.month,next.day)}));
  };
  const resetForm=()=>{setValues({name:"",species:"",species_id:"",breed:"",breed_id:"",gender:"",birth_date:"",current_weight:"",microchip_number:""});setPhoto(null);setPhotoPreview("");setCustomSpecies("");setCustomBreed("");setBirth({year:"",month:"",day:""});setBreedOptions([]);};
  const save=async(e:React.FormEvent)=>{
    e.preventDefault();
    const isOtherSpecies=selectedSpecies?.is_custom_allowed||selectedSpecies?.code==="OTHER";
    const isOtherBreed=selectedBreed?.name_en==="Other"||selectedBreed?.name_fa===OTHER_OPTION;
    const species=isOtherSpecies?customSpecies.trim():selectedSpecies?.name_fa||values.species;
    const breed=isOtherBreed?customBreed.trim():selectedBreed?.name_fa||values.breed;
    if(!values.name.trim()||!species)return setError("نام و گونه پت را وارد کنید.");
    if(isOtherBreed&&!breed)return setError("نام نژاد را وارد کنید یا گزینه نامشخص را انتخاب کنید.");
    setBusy(true);setError("");
    const payload={...values,name:values.name.trim(),species,breed:breed||null,species_id:values.species_id||null,breed_id:isOtherBreed?null:values.breed_id||null,custom_species:isOtherSpecies?species:null,custom_breed:isOtherBreed?breed:null,current_weight:values.current_weight?Number(decimalOnly(values.current_weight)):null,microchip_number:numericOnly(values.microchip_number)||null};
    const{data:createResult,error:createError}=await supabase.functions.invoke("create-pet",{body:payload});
    const created=createResult?.pet as {id?:string}|undefined;
    if(createError||createResult?.error||!created?.id){setBusy(false);return setError(createResult?.error||"ذخیره پرونده انجام نشد.");}
    if(photo&&created?.id){const upload=await supabase.storage.from("pet-documents").upload(`${created.id}/avatar`,photo,{contentType:photo.type,upsert:true});if(upload.error)setError("پرونده ساخته شد، اما بارگذاری عکس انجام نشد.");}
    setBusy(false);resetForm();onClose();onSaved();
  };
  const isOtherSpecies=selectedSpecies?.is_custom_allowed||selectedSpecies?.code==="OTHER",isOtherBreed=selectedBreed?.name_en==="Other"||selectedBreed?.name_fa===OTHER_OPTION;
  const calculatedAge=calculateAgeText(birth.year,birth.month,birth.day);
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" slotProps={{paper:{className:"rtl-pet-dialog",sx:{direction:"rtl",textAlign:"right"}}}}><Box component="form" onSubmit={save}><DialogTitle>ساخت پرونده پت</DialogTitle><DialogContent><Stack spacing={2} sx={{pt:1}}>{error&&<Alert severity="error">{error}</Alert>}<Box className="pet-photo-picker" component="label">{photoPreview?<img src={photoPreview} alt="پیش‌نمایش عکس پت"/>:<><img src={values.species==="گربه"?"/pets/default-cat.jpg":"/pets/default-dog.jpg"} alt="عکس پیش‌فرض پت"/><span>افزودن عکس پت</span></>}<input hidden type="file" accept="image/*" onChange={e=>{const selected=e.target.files?.[0];if(!selected)return;if(selected.size>5*1024*1024)return setError("حجم عکس باید کمتر از ۵ مگابایت باشد.");setPhoto(selected);setPhotoPreview(URL.createObjectURL(selected));setError("");}}/></Box>
    <div className="form-row"><TextField label="نام پت" value={values.name} onChange={set("name")} required helperText="فارسی یا انگلیسی قابل قبول است."/><Autocomplete loading={taxonomyLoading} options={speciesOptions} value={selectedSpecies} filterOptions={filterTaxonomyOptions} getOptionLabel={speciesLabel} isOptionEqualToValue={(option,value)=>option.id===value.id} onChange={(_,option)=>setSpeciesOption(option)} renderOption={(props,option)=><li {...props} key={option.id}><span className="option-emoji">{speciesEmoji[option.code]}</span><span className="option-text"><b>{option.name_fa}</b><small>{option.name_en}</small></span></li>} renderInput={params=><TextField {...params} label="گونه" required placeholder="جستجو: سگ یا Dog"/>}/></div>
    {isOtherSpecies&&<TextField label="نام گونه" value={customSpecies} onChange={e=>setCustomSpecies(e.target.value)} required helperText="اگر گونه در فهرست نیست، نام فارسی یا انگلیسی آن را وارد کنید."/>}
    <div className="form-row"><Autocomplete disabled={!values.species_id} options={breedOptions} value={selectedBreed} filterOptions={filterTaxonomyOptions} getOptionLabel={breedLabel} isOptionEqualToValue={(option,value)=>option.id===value.id} groupBy={option=>option.group_fa||"نژادها"} onChange={(_,option)=>setBreedOption(option)} renderOption={(props,option)=><li {...props} key={option.id}><span className="option-text"><b>{option.name_fa}</b><small>{option.name_en}{option.group_en?` · ${option.group_en}`:""}</small></span></li>} renderInput={params=><TextField {...params} label="نژاد" placeholder={values.species_id?"جستجو: Golden یا گلدن":"ابتدا گونه را انتخاب کنید"}/>}/><FormControl><InputLabel>جنسیت</InputLabel><Select label="جنسیت" value={values.gender} onChange={set("gender")}>{["نر","ماده"].map(x=><MenuItem key={x} value={x}>{x}</MenuItem>)}</Select></FormControl></div>
    {isOtherBreed&&<TextField label="نام نژاد" value={customBreed} onChange={e=>setCustomBreed(e.target.value)} helperText="نام نژاد می‌تواند فارسی یا انگلیسی باشد."/>}
    <Box className="pet-birth-card"><Typography variant="subtitle2">تاریخ تولد شمسی</Typography><Typography color="text.secondary" variant="caption">سال کافی است؛ اگر ماه و روز وارد نشود، فروردین و روز یکم ذخیره می‌شود. سن تا امروز خودکار محاسبه می‌شود.</Typography><div className="form-row birth-row"><FormControl><InputLabel>سال</InputLabel><Select label="سال" value={birth.year} onChange={e=>setBirthPart("year",String(e.target.value))}>{jalaliYears.map(y=><MenuItem key={y} value={String(y)}>{y}</MenuItem>)}</Select></FormControl><FormControl><InputLabel>ماه، اختیاری</InputLabel><Select label="ماه، اختیاری" value={birth.month} onChange={e=>setBirthPart("month",String(e.target.value))}><MenuItem value="">فروردین پیش‌فرض</MenuItem>{persianMonths.map((m,i)=><MenuItem key={m} value={String(i+1)}>{m}</MenuItem>)}</Select></FormControl><FormControl><InputLabel>روز، اختیاری</InputLabel><Select label="روز، اختیاری" value={birth.day} onChange={e=>setBirthPart("day",String(e.target.value))}><MenuItem value="">روز ۱ پیش‌فرض</MenuItem>{Array.from({length:jalaliMonthDays(birth.year,birth.month)},(_,i)=>i+1).map(day=><MenuItem key={day} value={String(day)}>{day}</MenuItem>)}</Select></FormControl></div><div className="calculated-age"><span>سن محاسبه‌شده تا امروز</span><b>{calculatedAge}</b></div></Box>
    <div className="form-row"><TextField label="وزن فعلی" value={values.current_weight} onChange={e=>setValues(v=>({...v,current_weight:decimalOnly(e.target.value)}))} slotProps={{htmlInput:{inputMode:"decimal"}}}/><TextField label="شماره میکروچیپ" value={values.microchip_number} onChange={e=>setValues(v=>({...v,microchip_number:numericOnly(e.target.value)}))} slotProps={{htmlInput:{inputMode:"numeric"}}} helperText="فقط عدد؛ اعداد فارسی خودکار تبدیل می‌شوند."/></div>
  </Stack></DialogContent><DialogActions><Button onClick={onClose}>انصراف</Button><Button variant="contained" type="submit" disabled={busy}>{busy?<CircularProgress size={20}/>:"ساخت پرونده"}</Button></DialogActions></Box></Dialog>;
}

function RecordTable({records,pets}:{records:MedicalRecord[];pets:Pet[]}) {
  return <TableContainer component={Paper} variant="outlined"><Table size="small"><TableHead><TableRow>{["تاریخ","پت","نوع","عنوان","کلینیک"].map(x=><TableCell key={x}>{x}</TableCell>)}</TableRow></TableHead><TableBody>{records.map(r=><TableRow key={r.id}><TableCell>{r.event_date||"—"}</TableCell><TableCell>{pets.find(p=>p.id===r.pet_id)?.name||"—"}</TableCell><TableCell><Chip size="small" label={r.record_type}/></TableCell><TableCell>{r.title||"—"}</TableCell><TableCell>{r.clinic||"—"}</TableCell></TableRow>)}</TableBody></Table></TableContainer>;
}
function Dashboard({pets,records,onAddPet,onAddRecord,onOpen}:{pets:Pet[];records:MedicalRecord[];onAddPet:()=>void;onAddRecord:()=>void;onOpen:(p:Pet)=>void}) {
  const stats=[[pets.length,"تعداد پت‌ها",FavoriteRounded],[records.length,"رویدادهای پزشکی",DescriptionRounded],[0,"یادآوری‌های باز",NotificationsNoneRounded],[pets.filter(p=>p.microchip_number).length,"میکروچیپ ثبت‌شده",CheckCircleRounded]] as const;
  return <><SectionHead eyebrow="پرونده سلامت پت‌ها" title="داشبورد" action={<Button variant="contained" startIcon={<AddRounded/>} onClick={pets.length?onAddRecord:onAddPet}>{pets.length?"ثبت اطلاعات پزشکی":"ساخت اولین پرونده"}</Button>}/>{pets.length>0&&<button className="quick-entry-launch" onClick={onAddRecord}><span><AddRounded/></span><div><b>ثبت اطلاعات جدید</b><small>یک عکس بگیرید؛ اطلاعات پرونده خودکار تکمیل می‌شود</small></div><i>←</i></button>}<div className="stats">{stats.map(([value,label,Icon])=><Card key={label}><CardContent><Icon color="primary"/><Typography color="text.secondary" variant="caption">{label}</Typography><Typography variant="h5">{value}</Typography></CardContent></Card>)}</div>
  {!pets.length?<EmptyPanel title="هنوز پرونده‌ای ندارید" text="برای شروع، پرونده اولین پت خود را بسازید." action={<Button variant="contained" startIcon={<AddRounded/>} onClick={onAddPet}>ساخت پرونده پت</Button>}/>:<><SectionHead title="پرونده‌های من" action={<Button startIcon={<AddRounded/>} onClick={onAddPet}>افزودن پت</Button>}/><div className="pet-grid">{pets.map(p=><Card key={p.id} className="pet-card visual-pet-card" onClick={()=>onOpen(p)}><div className="pet-card-photo"><PetMark pet={p} size={220}/><Chip className="pet-status" color="success" size="small" label="پرونده فعال"/></div><CardContent><div className="pet-card-head"><div><Typography variant="h5">{p.name}</Typography><Typography color="text.secondary">{[p.species,p.breed].filter(Boolean).join(" · ")}</Typography></div></div><div className="pet-card-data"><div><small>جنسیت</small><b>{p.gender||"ثبت نشده"}</b></div><div><small>وزن فعلی</small><b>{p.current_weight?`${p.current_weight} کیلوگرم`:"ثبت نشده"}</b></div></div></CardContent></Card>)}</div></>}
  <SectionHead title="آخرین فعالیت‌ها"/>{!records.length?<EmptyPanel title="هنوز رویدادی ثبت نشده" text="ویزیت، نسخه، آزمایش یا هر مدرک پزشکی را با تصویر ثبت کنید." action={pets.length?<Button onClick={onAddRecord}>ثبت اولین رویداد</Button>:undefined}/>:<RecordTable records={records} pets={pets}/>}</>;
}
function PetProfile({pet,records,back,onAdd,onRefresh}:{pet:Pet;records:MedicalRecord[];back:()=>void;onAdd:()=>void;onRefresh:()=>void}) {
  const[share,setShare]=useState(false),[tab,setTab]=useState(0);const list=records.filter(r=>r.pet_id===pet.id);
  return <><div className="profile-actions"><Button onClick={back}>→ بازگشت</Button><Stack direction="row"><Button startIcon={<GroupsRounded/>} onClick={()=>setShare(true)}>مدیریت دسترسی</Button><Button variant="contained" startIcon={<AddRounded/>} onClick={onAdd}>ثبت اطلاعات</Button></Stack></div><Card className="profile-head"><CardContent><div className="profile-main"><PetMark pet={pet} size={82}/><div><Typography variant="h4">{pet.name}</Typography><Typography color="text.secondary">{[pet.species,pet.breed,pet.gender].filter(Boolean).join(" · ")}</Typography></div></div><div className="pet-card-data">{[["تاریخ تولد",formatJalaliDate(pet.birth_date)||"ثبت نشده"],["وزن",pet.current_weight?`${pet.current_weight} کیلوگرم`:"ثبت نشده"],["میکروچیپ",pet.microchip_number||"ثبت نشده"],["تعداد سوابق",list.length]].map(([a,b])=><div key={String(a)}><small>{a}</small><b>{b}</b></div>)}</div></CardContent></Card><Tabs value={tab} onChange={(_,v)=>setTab(v)}><Tab label="نمای کلی"/><Tab label="اسناد"/></Tabs><Box sx={{mt:2}}>{tab===0?(list.length?<RecordTable records={list} pets={[pet]}/>:<EmptyPanel title="پرونده پزشکی خالی است" text="اولین سابقه پزشکی را ثبت کنید." action={<Button onClick={onAdd}>ثبت اطلاعات</Button>}/>):<EmptyPanel title="سندی ثبت نشده" text="اسناد پیوست‌شده اینجا نمایش داده می‌شوند."/ >}</Box><SharePetModal pet={pet} open={share} onClose={()=>{setShare(false);onRefresh();}}/></>;
}

export default function App(){
  const[page,setPage]=useState("dashboard"),[drawer,setDrawer]=useState(false),[loading,setLoading]=useState(true),[logoutOpen,setLogoutOpen]=useState(false);
  const[pets,setPets]=useState<Pet[]>([]),[records,setRecords]=useState<MedicalRecord[]>([]),[pet,setPet]=useState<Pet|null>(null);
  const[petModal,setPetModal]=useState(false),[recordModal,setRecordModal]=useState(false);
  const[userMenuAnchor,setUserMenuAnchor]=useState<HTMLElement|null>(null);
  const load=useCallback(async()=>{if(!hasSupabase){setLoading(false);return;}setLoading(true);const[p,r]=await Promise.all([supabase.from("pets").select("*").order("created_at"),supabase.from("medical_records").select("*").order("created_at",{ascending:false})]);const raw=(p.data||[])as Pet[];const withPhotos=await Promise.all(raw.map(async pet=>{const listed=await supabase.storage.from("pet-documents").list(pet.id,{search:"avatar",limit:1});if(!listed.data?.length)return pet;const signed=await supabase.storage.from("pet-documents").createSignedUrl(`${pet.id}/avatar`,3600);return{...pet,photo_url:signed.data?.signedUrl||null};}));setPets(withPhotos);setRecords((r.data||[])as MedicalRecord[]);setLoading(false);},[]);
  useEffect(()=>{void load();},[load]);const items=useMemo(()=>nav,[]);
  const go=(key:string)=>{setPage(key);setPet(null);setDrawer(false);};
  const openAccount=()=>{setUserMenuAnchor(null);go("settings");};
  const logout=async()=>{const{error}=await supabase.auth.signOut({scope:"local"});if(!error)window.location.replace("/");};
  const content=()=>{if(loading)return <div className="page-loading"><CircularProgress/></div>;if(pet)return <PetProfile pet={pet} records={records} back={()=>setPet(null)} onAdd={()=>setRecordModal(true)} onRefresh={load}/>;if(page==="dashboard"||page==="pets")return <Dashboard pets={pets} records={records} onAddPet={()=>setPetModal(true)} onAddRecord={()=>setRecordModal(true)} onOpen={setPet}/>;if(page==="timeline")return <><SectionHead title="تایم‌لاین پزشکی" action={<Button variant="contained" disabled={!pets.length} onClick={()=>setRecordModal(true)}>ثبت رویداد</Button>}/>{records.length?<RecordTable records={records} pets={pets}/>:<EmptyPanel title="تایم‌لاین خالی است" text="هیچ رویداد پزشکی ثبت نشده است."/ >}</>;return <><SectionHead title={nav.find(x=>x[0]===page)?.[1]||""}/><EmptyPanel title="هنوز اطلاعاتی ثبت نشده" text="این بخش با ثبت اطلاعات واقعی شما تکمیل می‌شود."/ ></>;};
  const menu=<List>{items.map(([key,label,Icon])=><ListItemButton key={key} selected={page===key} onClick={()=>go(key)}><ListItemIcon><Icon/></ListItemIcon><ListItemText primary={label}/></ListItemButton>)}</List>;
  return <Box className="app"><aside className="sider"><div className="brand"><span>V</span><div><b>Vetrica</b><small>Digital Pet Health</small></div></div>{menu}<Button className="side-support-button" startIcon={<SupportAgentRounded/>}>پشتیبانی</Button></aside><Drawer anchor="right" open={drawer} onClose={()=>setDrawer(false)}><Box sx={{width:300,p:2}}><Typography variant="h6">Vetrica</Typography>{menu}<Divider/><Button fullWidth startIcon={<SupportAgentRounded/>}>پشتیبانی</Button></Box></Drawer><Box className="app-main"><header className="header"><div className="mobile-app-title"><span>V</span><div><small>Vetrica</small><b>{pet?.name||nav.find(x=>x[0]===page)?.[1]}</b></div></div><div className="desktop-title"><Typography color="text.secondary" variant="caption">فضای کاری</Typography><b>مدیریت سلامت پت‌ها</b></div><Stack className="header-actions" direction="row"><IconButton className="header-search"><SearchRounded/></IconButton><IconButton><Badge variant="dot" color="primary"><NotificationsNoneRounded/></Badge></IconButton><IconButton onClick={e=>setUserMenuAnchor(e.currentTarget)} aria-label="منوی حساب کاربری"><Avatar><PersonRounded/></Avatar></IconButton><Menu anchorEl={userMenuAnchor} open={Boolean(userMenuAnchor)} onClose={()=>setUserMenuAnchor(null)} anchorOrigin={{vertical:"bottom",horizontal:"left"}} transformOrigin={{vertical:"top",horizontal:"left"}}><MenuItem onClick={openAccount}><ListItemIcon><PersonRounded fontSize="small"/></ListItemIcon><ListItemText primary="حساب کاربری"/></MenuItem><MenuItem onClick={()=>{setUserMenuAnchor(null);setLogoutOpen(true);}}><ListItemIcon><LogoutRounded fontSize="small"/></ListItemIcon><ListItemText primary="خروج از حساب"/></MenuItem></Menu></Stack></header><main className="content">{content()}</main></Box><nav className="bottom-nav"><button className={page==="dashboard"&&!pet?"active":""} onClick={()=>go("dashboard")}><HomeRounded/><span>خانه</span></button><button className={page==="pets"||!!pet?"active":""} onClick={()=>go("pets")}><FavoriteRounded/><span>پت‌ها</span></button><button className="mobile-add" onClick={()=>pets.length?setRecordModal(true):setPetModal(true)}><AddRounded/><span>ثبت</span></button><button className={page==="timeline"?"active":""} onClick={()=>go("timeline")}><CalendarMonthRounded/><span>سوابق</span></button><button onClick={()=>setDrawer(true)}><MenuRounded/><span>بیشتر</span></button></nav><PetForm open={petModal} onClose={()=>setPetModal(false)} onSaved={load}/><SmartEntryModal open={recordModal} onClose={()=>setRecordModal(false)} onSaved={load} pets={pets}/><Dialog open={logoutOpen} onClose={()=>setLogoutOpen(false)}><DialogTitle>از حساب خارج می‌شوید؟</DialogTitle><DialogContent><Typography color="text.secondary">برای ورود دوباره باید شماره موبایل و کد ورود را وارد کنید.</Typography></DialogContent><DialogActions><Button onClick={()=>setLogoutOpen(false)}>انصراف</Button><Button color="error" variant="contained" onClick={logout}>خروج از حساب</Button></DialogActions></Dialog></Box>;
}
