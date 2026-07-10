import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AddRounded, AppsRounded, CalendarMonthRounded, CheckCircleRounded,
  DescriptionRounded, FavoriteRounded, GroupsRounded, HomeRounded, LogoutRounded,
  MedicationRounded, MenuRounded, NotificationsNoneRounded, PersonRounded, ScienceRounded,
  SettingsRounded, SupportAgentRounded, TimelineRounded, DeleteRounded,
} from "@mui/icons-material";
import {
  Alert, Autocomplete, Avatar, Badge, Box, Button, Card, CardContent, Chip, CircularProgress, Dialog,
  DialogActions, DialogContent, DialogTitle, Divider, Drawer, FormControl, IconButton,
  InputAdornment, InputLabel, List, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Paper, Select,
  Stack, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs,
  TextField, Typography,
} from "@mui/material";
import SmartEntryModal from "./SmartEntryModal";
import SharePetModal from "./SharePetModal";
import { AppSelectField, FormSection, PersianDateFields } from "./FormComponents";
import { hasSupabase, supabase } from "./lib/supabase";
import type { MedicalRecord, Pet, PetWeightRecord, PreventiveCareRecord, RabiesAntibodyCertificate, SurgicalHistoryRecord, UserProfile } from "./types";

const nav = [
  ["dashboard","داشبورد",HomeRounded],["pets","پت‌ها",GroupsRounded],["timeline","تایم‌لاین پزشکی",TimelineRounded],
  ["preventive","مراقبت پیشگیرانه",CheckCircleRounded],["medications","داروها",MedicationRounded],["labs","آزمایش‌ها",ScienceRounded],
  ["documents","اسناد",DescriptionRounded],["reminders","یادآوری‌ها",NotificationsNoneRounded],
] as const;

function SectionHead({title,eyebrow,action}:{title:string;eyebrow?:string;action?:React.ReactNode}) {
  return <div className="section-head"><div>{eyebrow&&<Typography className="eyebrow" variant="caption">{eyebrow}</Typography>}<Typography variant="h5" component="h2">{title}</Typography></div>{action}</div>;
}
const defaultPetAvatarByCode: Record<string,string> = {
  DOG: "/pets/default-dog.jpg",
  CAT: "/pets/default-cat.jpg",
  BIRD: "/pets/default-bird.png",
  RABBIT: "/pets/default-rabbit.png",
  OTHER: "/pets/default-other.png",
};
const defaultPetAvatar = (species?:string|null,speciesCode?:string|null) => {
  const code=speciesCode?.toUpperCase();
  if(code&&defaultPetAvatarByCode[code])return defaultPetAvatarByCode[code];
  const normalized=(species||"").trim().toLowerCase();
  if(["گربه","cat"].includes(normalized))return defaultPetAvatarByCode.CAT;
  if(["پرنده","bird"].includes(normalized))return defaultPetAvatarByCode.BIRD;
  if(["خرگوش","rabbit"].includes(normalized))return defaultPetAvatarByCode.RABBIT;
  if(["سگ","dog"].includes(normalized))return defaultPetAvatarByCode.DOG;
  return defaultPetAvatarByCode.OTHER;
};
function PetMark({pet,size=54}:{pet:Pet;size?:number}) {
  const fallback=defaultPetAvatar(pet.species,pet.species_code);
  return <Avatar className="pet-mark" src={pet.photo_url||fallback} alt={pet.name} sx={{width:size,height:size,background:"linear-gradient(145deg,#0071E3,#14B8A6)",fontSize:size*.4}}>{pet.name.slice(0,1)}</Avatar>;
}
function EmptyPanel({title,text,action}:{title:string;text:string;action?:React.ReactNode}) {
  return <Card className="empty-state"><CardContent><span className="empty-pet-illustration"><img src="/pets/default-dog.jpg" alt="پرونده پت"/></span><Typography variant="h6">{title}</Typography><Typography color="text.secondary">{text}</Typography>{action}</CardContent></Card>;
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
const jalaliPartsToValue = (year:string,month:string,day:string) => year ? `${year}-${pad2(Number(month||"1"))}-${pad2(Number(day||"1"))}` : "";
const jalaliValueToParts = (value?:string|null) => {
  const [year="",month="",day=""]=(value||"").split("-");
  return {year,month:month?String(Number(month)):"",day:day?String(Number(day)):""};
};
function formatJalaliDate(iso?:string|null) {
  if(!iso)return "";
  const date=new Date(`${iso}T00:00:00`);
  if(Number.isNaN(date.getTime()))return iso;
  const [jy,jm,jd]=gregorianToJalali(date.getFullYear(),date.getMonth()+1,date.getDate());
  return `${jd} ${persianMonths[jm-1]} ${jy}`;
}
function isoToJalaliValue(iso?:string|null) {
  if(!iso)return "";
  const date=new Date(`${iso}T00:00:00`);
  if(Number.isNaN(date.getTime()))return "";
  const [jy,jm,jd]=gregorianToJalali(date.getFullYear(),date.getMonth()+1,date.getDate());
  return `${jy}-${pad2(jm)}-${pad2(jd)}`;
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
function JalaliDateField({label,value,onChange,optional=true,helperText}:{label:string;value?:string|null;onChange:(next:{jalali:string;gregorian:string})=>void;optional?:boolean;helperText?:string}) {
  const parts=jalaliValueToParts(value);
  const update=(key:"year"|"month"|"day",raw:string)=>{
    const clean=numericOnly(raw).slice(0,key==="year"?4:2);
    const next={...parts,[key]:clean};
    if(key==="month"||key==="year"){
      const maxDay=jalaliMonthDays(key==="year"?clean:next.year,key==="month"?clean:next.month);
      if(Number(next.day)>maxDay)next.day="";
    }
    const jalali=jalaliPartsToValue(next.year,next.month,next.day);
    onChange({jalali,gregorian:jalali?jalaliToIso(next.year,next.month,next.day):""});
  };
  return <PersianDateFields label={label} helperText={helperText} year={parts.year} month={parts.month} day={parts.day} years={jalaliYears} months={persianMonths} days={Array.from({length:jalaliMonthDays(parts.year,parts.month)},(_,i)=>i+1)} required={!optional} onChange={update} footer={value&&<Typography color="text.secondary" variant="caption">ذخیره شمسی: {value}</Typography>}/>;
}

function PetForm({open,onClose,onSaved}:{open:boolean;onClose:()=>void;onSaved:()=>void}) {
  const [values,setValues]=useState({name:"",species:"",species_id:"",breed:"",breed_id:"",gender:"",birth_date:"",birth_date_jalali:"",current_weight:"",color:""});
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
    setValues(v=>({...v,birth_date:jalaliToIso(next.year,next.month,next.day),birth_date_jalali:jalaliPartsToValue(next.year,next.month,next.day)}));
  };
  const resetForm=()=>{setValues({name:"",species:"",species_id:"",breed:"",breed_id:"",gender:"",birth_date:"",birth_date_jalali:"",current_weight:"",color:""});setPhoto(null);setPhotoPreview("");setCustomSpecies("");setCustomBreed("");setBirth({year:"",month:"",day:""});setBreedOptions([]);};
  const save=async(e:React.FormEvent)=>{
    e.preventDefault();
    const isOtherSpecies=selectedSpecies?.is_custom_allowed||selectedSpecies?.code==="OTHER";
    const isOtherBreed=selectedBreed?.name_en==="Other"||selectedBreed?.name_fa===OTHER_OPTION;
    const species=isOtherSpecies?customSpecies.trim():selectedSpecies?.name_fa||values.species;
    const breed=isOtherBreed?customBreed.trim():selectedBreed?.name_fa||values.breed;
    if(!values.name.trim()||!species)return setError("نام و گونه پت را وارد کنید.");
    if(isOtherBreed&&!breed)return setError("نام نژاد را وارد کنید یا گزینه نامشخص را انتخاب کنید.");
    setBusy(true);setError("");
    const payload={...values,name:values.name.trim(),species,breed:breed||null,species_id:values.species_id||null,breed_id:isOtherBreed?null:values.breed_id||null,custom_species:isOtherSpecies?species:null,custom_breed:isOtherBreed?breed:null,current_weight:values.current_weight?Number(decimalOnly(values.current_weight)):null,color:values.color.trim()||null};
    const{data:createResult,error:createError}=await supabase.functions.invoke("create-pet",{body:payload});
    const created=createResult?.pet as {id?:string}|undefined;
    if(createError||createResult?.error||!created?.id){setBusy(false);return setError(createResult?.error||"ذخیره پرونده انجام نشد.");}
    if(photo&&created?.id){const upload=await supabase.storage.from("pet-documents").upload(`${created.id}/avatar`,photo,{contentType:photo.type,upsert:true});if(upload.error)setError("پرونده ساخته شد، اما بارگذاری عکس انجام نشد.");}
    setBusy(false);resetForm();onClose();onSaved();
  };
  const isOtherSpecies=selectedSpecies?.is_custom_allowed||selectedSpecies?.code==="OTHER",isOtherBreed=selectedBreed?.name_en==="Other"||selectedBreed?.name_fa===OTHER_OPTION;
  const calculatedAge=calculateAgeText(birth.year,birth.month,birth.day);
  const weightNumber=Number(decimalOnly(values.current_weight));
  const weightHelper=values.current_weight&&Number.isFinite(weightNumber)?`(${faNumber.format(Math.round(weightNumber*1000))} گرم)`:"واحد وزن کیلوگرم است.";
  const defaultAvatar=defaultPetAvatar(values.species,selectedSpecies?.code);
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="md"><Box component="form" onSubmit={save}><DialogTitle>ساخت پرونده پت</DialogTitle><DialogContent><Stack spacing={2} sx={{pt:1}}>{error&&<Alert severity="error">{error}</Alert>}<Box className="pet-photo-picker" component="label">{photoPreview?<img src={photoPreview} alt="پیش‌نمایش عکس پت"/>:<><img src={defaultAvatar} alt="عکس پیش‌فرض پت"/><span>افزودن عکس پت</span></>}<input hidden type="file" accept="image/*" onChange={e=>{const selected=e.target.files?.[0];if(!selected)return;if(selected.size>5*1024*1024)return setError("حجم عکس باید کمتر از ۵ مگابایت باشد.");setPhoto(selected);setPhotoPreview(URL.createObjectURL(selected));setError("");}}/></Box>
    <div className="form-row"><TextField label="نام پت" value={values.name} onChange={set("name")} required helperText="فارسی یا انگلیسی قابل قبول است."/><Autocomplete loading={taxonomyLoading} options={speciesOptions} value={selectedSpecies} filterOptions={filterTaxonomyOptions} getOptionLabel={speciesLabel} isOptionEqualToValue={(option,value)=>option.id===value.id} onChange={(_,option)=>setSpeciesOption(option)} renderOption={(props,option)=><li {...props} key={option.id}><span className="option-emoji">{speciesEmoji[option.code]}</span><span className="option-text"><b>{option.name_fa}</b><small>{option.name_en}</small></span></li>} renderInput={params=><TextField {...params} label="گونه" required placeholder="جستجو: سگ یا Dog"/>}/></div>
    {isOtherSpecies&&<TextField label="نام گونه" value={customSpecies} onChange={e=>setCustomSpecies(e.target.value)} required helperText="اگر گونه در فهرست نیست، نام فارسی یا انگلیسی آن را وارد کنید."/>}
    <div className="form-row"><Autocomplete disabled={!values.species_id} options={breedOptions} value={selectedBreed} filterOptions={filterTaxonomyOptions} getOptionLabel={breedLabel} isOptionEqualToValue={(option,value)=>option.id===value.id} groupBy={option=>option.group_fa||"نژادها"} onChange={(_,option)=>setBreedOption(option)} renderOption={(props,option)=><li {...props} key={option.id}><span className="option-text"><b>{option.name_fa}</b><small>{option.name_en}{option.group_en?` · ${option.group_en}`:""}</small></span></li>} renderInput={params=><TextField {...params} label="نژاد" placeholder={values.species_id?"جستجو: Golden یا گلدن":"ابتدا گونه را انتخاب کنید"}/>}/><AppSelectField label="جنسیت" value={values.gender} onChange={set("gender")} options={["نر","ماده"].map(x=>({value:x,label:x}))}/></div>
    {isOtherBreed&&<TextField label="نام نژاد" value={customBreed} onChange={e=>setCustomBreed(e.target.value)} helperText="نام نژاد می‌تواند فارسی یا انگلیسی باشد."/>}
    <PersianDateFields label="تاریخ تولد شمسی" helperText="سال کافی است؛ اگر ماه و روز وارد نشود، فروردین و روز یکم ذخیره می‌شود. سن تا امروز خودکار محاسبه می‌شود." year={birth.year} month={birth.month} day={birth.day} years={jalaliYears} months={persianMonths} days={Array.from({length:jalaliMonthDays(birth.year,birth.month)},(_,i)=>i+1)} required onChange={setBirthPart} emptyMonthLabel="فروردین پیش‌فرض" emptyDayLabel="روز ۱ پیش‌فرض" footer={<div className="calculated-age"><span>سن محاسبه‌شده تا امروز</span><b>{calculatedAge}</b></div>}/>
    <div className="form-row"><TextField label="وزن فعلی" value={values.current_weight} onChange={e=>setValues(v=>({...v,current_weight:decimalOnly(e.target.value)}))} slotProps={{input:{endAdornment:<InputAdornment position="end">کیلوگرم</InputAdornment>},htmlInput:{inputMode:"decimal"}}} helperText={weightHelper}/><TextField label="رنگ" value={values.color} onChange={set("color")} helperText="مثلاً سفید، قهوه‌ای، مشکی یا ترکیبی."/></div>
  </Stack></DialogContent><DialogActions><Button onClick={onClose}>انصراف</Button><Button variant="contained" type="submit" disabled={busy}>{busy?<CircularProgress size={20}/>:"ساخت پرونده"}</Button></DialogActions></Box></Dialog>;
}

function RecordTable({records,pets}:{records:MedicalRecord[];pets:Pet[]}) {
  return <TableContainer component={Paper} variant="outlined"><Table size="small"><TableHead><TableRow>{["تاریخ","پت","نوع","عنوان","کلینیک"].map(x=><TableCell key={x}>{x}</TableCell>)}</TableRow></TableHead><TableBody>{records.map(r=><TableRow key={r.id}><TableCell>{r.event_date_jalali||r.event_date||"—"}</TableCell><TableCell>{pets.find(p=>p.id===r.pet_id)?.name||"—"}</TableCell><TableCell><Chip size="small" label={r.record_type}/></TableCell><TableCell>{r.title||"—"}</TableCell><TableCell>{r.clinic||"—"}</TableCell></TableRow>)}</TableBody></Table></TableContainer>;
}
type MedicalTimelineRow={id:string;source:"medical_records"|"pet_preventive_care_records"|"pet_surgical_history"|"pet_rabies_antibody_certificates"|"pet_weight_records"|"pets";sourceId:string;petId:string;sortDate:string;dateLabel:string;category:string;title:string;details:string};
const dateOnly=(value?:string|null)=>value?String(value).slice(0,10):"";
const timelineDateLabel=(jalali?:string|null,gregorian?:string|null,fallback?:string|null)=>jalali||formatJalaliDate(dateOnly(gregorian))||formatJalaliDate(dateOnly(fallback))||"—";
const byNewestTimeline=(a:MedicalTimelineRow,b:MedicalTimelineRow)=>String(b.sortDate).localeCompare(String(a.sortDate))||String(b.sourceId).localeCompare(String(a.sourceId));
function MedicalTimelineTable({rows,pets}:{rows:MedicalTimelineRow[];pets:Pet[]}) {
  const petName=(id:string)=>pets.find(p=>p.id===id)?.name||"—";
  return <TableContainer component={Paper} variant="outlined"><Table size="small"><TableHead><TableRow>{["تاریخ","پت","دسته","عنوان","جزئیات","منبع"].map(x=><TableCell key={x}>{x}</TableCell>)}</TableRow></TableHead><TableBody>{rows.map(row=><TableRow key={row.id}><TableCell>{row.dateLabel}</TableCell><TableCell>{petName(row.petId)}</TableCell><TableCell><Chip size="small" label={row.category}/></TableCell><TableCell>{row.title||"—"}</TableCell><TableCell>{row.details||"—"}</TableCell><TableCell>{row.source}</TableCell></TableRow>)}</TableBody></Table></TableContainer>;
}
function Dashboard({pets,timelineRows,onAddPet,onAddRecord,onOpen}:{pets:Pet[];timelineRows:MedicalTimelineRow[];onAddPet:()=>void;onAddRecord:()=>void;onOpen:(p:Pet)=>void}) {
  const stats=[[pets.length,"تعداد پت‌ها",FavoriteRounded],[timelineRows.length,"رویدادهای پزشکی",DescriptionRounded],[0,"یادآوری‌های باز",NotificationsNoneRounded],[pets.filter(p=>p.microchip_number).length,"میکروچیپ ثبت‌شده",CheckCircleRounded]] as const;
  return <div className="dashboard-shell"><SectionHead eyebrow="پرونده سلامت پت‌ها" title="داشبورد" action={<Button className="dashboard-cta" variant="contained" onClick={pets.length?onAddRecord:onAddPet}><AddRounded/><span>{pets.length?"ثبت اطلاعات پزشکی":"ساخت اولین پرونده"}</span></Button>}/>{pets.length>0&&<button className="quick-entry-launch" onClick={onAddRecord}><span><AddRounded/></span><div><b>ثبت اطلاعات جدید</b><small>یک عکس بگیرید؛ اطلاعات پرونده خودکار تکمیل می‌شود</small></div><i>←</i></button>}<div className="stats">{stats.map(([value,label,Icon])=><Card key={label}><CardContent><Icon color="primary"/><Typography variant="h5">{value}</Typography><Typography color="text.secondary" variant="caption">{label}</Typography></CardContent></Card>)}</div>
  {!pets.length?<EmptyPanel title="هنوز پرونده‌ای ندارید" text="برای شروع، پرونده اولین پت خود را بسازید." action={<Button className="dashboard-cta empty-cta" variant="contained" onClick={onAddPet}><AddRounded/><span>ساخت پرونده پت</span></Button>}/>:<><SectionHead title="پرونده‌های من" action={<Button startIcon={<AddRounded/>} onClick={onAddPet}>افزودن پت</Button>}/><div className="pet-grid">{pets.map(p=><Card key={p.id} className="pet-card visual-pet-card" onClick={()=>onOpen(p)}><div className="pet-card-photo"><PetMark pet={p} size={220}/><Chip className="pet-status" color="success" size="small" label="پرونده فعال"/></div><CardContent><div className="pet-card-head"><div><Typography variant="h5">{p.name}</Typography><Typography color="text.secondary">{[p.species,p.breed].filter(Boolean).join(" · ")}</Typography></div></div><div className="pet-card-data"><div><small>جنسیت</small><b>{p.gender||"ثبت نشده"}</b></div><div><small>وزن فعلی</small><b>{p.current_weight?`${p.current_weight} کیلوگرم`:"ثبت نشده"}</b></div></div></CardContent></Card>)}</div></>}
  <SectionHead title="آخرین فعالیت‌ها"/>{!timelineRows.length?<EmptyPanel title="هنوز رویدادی ثبت نشده" text="ویزیت، نسخه، آزمایش یا هر مدرک پزشکی را ثبت کنید." action={pets.length?<Button onClick={onAddRecord}>ثبت اولین رویداد</Button>:undefined}/>:<MedicalTimelineTable rows={timelineRows.slice(0,8)} pets={pets}/>}</div>;
}
const emptyText = (value?:string|null) => value || "ثبت نشده";
const yesNoText = (value?:boolean|null) => value == null ? "ثبت نشده" : value ? "بله" : "خیر";
const careLabels:Record<PreventiveCareRecord["type"],{title:string;substance:string;date:string;next:string}> = {
  RABIES_VACCINATION:{title:"واکسن هاری",substance:"واکسن استفاده‌شده",date:"تاریخ واکسیناسیون",next:"اعتبار تا"},
  ANTI_PARASITIC_TREATMENT:{title:"درمان ضدانگل",substance:"داروی استفاده‌شده",date:"تاریخ مصرف",next:"دوز بعدی"},
  OTHER_VACCINATION:{title:"سایر واکسن‌ها",substance:"واکسن استفاده‌شده",date:"تاریخ واکسیناسیون",next:"اعتبار تا"},
};
const careTypes=Object.keys(careLabels) as PreventiveCareRecord["type"][];
function buildMedicalTimelineRows({pets,records,care,surgeries,certificates,weights}:{pets:Pet[];records:MedicalRecord[];care:PreventiveCareRecord[];surgeries:SurgicalHistoryRecord[];certificates:RabiesAntibodyCertificate[];weights:PetWeightRecord[]}):MedicalTimelineRow[] {
  return [
    ...records.map(item=>({id:`medical_records:${item.id}`,source:"medical_records" as const,sourceId:item.id,petId:item.pet_id,sortDate:item.event_date_gregorian||item.event_date||item.created_at||"",dateLabel:timelineDateLabel(item.event_date_jalali,item.event_date_gregorian||item.event_date,item.created_at),category:item.record_type||"رکورد پزشکی",title:item.title||item.diagnosis||item.medications||"رکورد پزشکی",details:[item.clinic,item.veterinarian,item.diagnosis,item.medications,item.notes].filter(Boolean).join(" · ")})),
    ...care.map(item=>({id:`pet_preventive_care_records:${item.id}`,source:"pet_preventive_care_records" as const,sourceId:item.id,petId:item.pet_id,sortDate:item.administered_at||item.created_at||"",dateLabel:timelineDateLabel(item.administered_at_jalali,item.administered_at,item.created_at),category:"مراقبت پیشگیرانه",title:careLabels[item.type].title,details:[item.substance_name,item.next_relevant_date_jalali||formatJalaliDate(dateOnly(item.next_relevant_date)),item.veterinarian_name,item.notes].filter(Boolean).join(" · ")})),
    ...weights.map(item=>({id:`pet_weight_records:${item.id}`,source:"pet_weight_records" as const,sourceId:item.id,petId:item.pet_id,sortDate:item.created_at||"",dateLabel:timelineDateLabel(null,null,item.created_at),category:"وزن",title:`${item.weight_kg} کیلوگرم`,details:item.notes||"تغییر وزن"})),
    ...surgeries.map(item=>({id:`pet_surgical_history:${item.id}`,source:"pet_surgical_history" as const,sourceId:item.id,petId:item.pet_id,sortDate:item.performed_at||item.created_at||"",dateLabel:timelineDateLabel(item.performed_at_jalali,item.performed_at,item.created_at),category:"جراحی",title:item.procedure_name||"جراحی",details:[item.veterinarian_name,item.description].filter(Boolean).join(" · ")})),
    ...certificates.map(item=>({id:`pet_rabies_antibody_certificates:${item.id}`,source:"pet_rabies_antibody_certificates" as const,sourceId:item.id,petId:item.pet_id,sortDate:item.issued_at||item.created_at||"",dateLabel:timelineDateLabel(item.issued_at_jalali,item.issued_at,item.created_at),category:"گواهی هاری",title:"Rabies Antibody Titre",details:[item.veterinarian_name,item.telephone_number,item.email,item.address].filter(Boolean).join(" · ")})),
    ...pets.filter(pet=>pet.microchip_number).map(pet=>({id:`pets:microchip:${pet.id}`,source:"pets" as const,sourceId:pet.id,petId:pet.id,sortDate:pet.microchip_implant_date||pet.updated_at||pet.created_at||"",dateLabel:timelineDateLabel(pet.microchip_implant_date_jalali,pet.microchip_implant_date,pet.updated_at||pet.created_at),category:"میکروچیپ",title:pet.microchip_number||"میکروچیپ",details:[pet.issuing_veterinarian_name,pet.passport_number?`پاسپورت: ${pet.passport_number}`:""].filter(Boolean).join(" · ")})),
  ].sort(byNewestTimeline);
}
type CareDraft={id?:string;type:PreventiveCareRecord["type"];substance_name:string;administered_at:string;administered_at_jalali:string;next_relevant_date:string;next_relevant_date_jalali:string;veterinarian_name:string;notes:string};
const emptyCareDraft=(type:PreventiveCareRecord["type"]="RABIES_VACCINATION"):CareDraft=>({type,substance_name:"",administered_at:"",administered_at_jalali:"",next_relevant_date:"",next_relevant_date_jalali:"",veterinarian_name:"",notes:""});

function UserProfilePage(){
  const[profile,setProfile]=useState<UserProfile|null>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
  useEffect(()=>{let active=true;(async()=>{const{data:userData}=await supabase.auth.getUser();const user=userData.user;if(!user)return;const{data}=await supabase.from("profiles").select("*").eq("id",user.id).maybeSingle();if(!active)return;setProfile({id:user.id,phone_number:user.phone||data?.phone_number||data?.phone,...data});})();return()=>{active=false};},[]);
  const setField=(key:keyof UserProfile)=>(e:{target:{value:string}})=>setProfile(p=>p?{...p,[key]:e.target.value}:p);
  const save=async()=>{if(!profile)return;setBusy(true);setMessage("");const payload={id:profile.id,first_name_fa:profile.first_name_fa||null,last_name_fa:profile.last_name_fa||null,address_fa:profile.address_fa||null,first_name_en:profile.first_name_en||null,last_name_en:profile.last_name_en||null,address_en:profile.address_en||null,phone_number:numericOnly(profile.phone_number||profile.phone||"")||null,updated_at:new Date().toISOString()};const{error}=await supabase.from("profiles").upsert(payload,{onConflict:"id"});setBusy(false);setMessage(error?"ذخیره پروفایل انجام نشد.":"پروفایل ذخیره شد.");};
  if(!profile)return <div className="page-loading"><CircularProgress/></div>;
  return <><SectionHead title="حساب کاربری" action={<Button variant="contained" onClick={save} disabled={busy}>{busy?<CircularProgress size={18}/>:"ذخیره"}</Button>}/>{message&&<Alert severity={message.includes("نشد")?"error":"success"} sx={{mb:2}}>{message}</Alert>}<div className="profile-edit-grid"><FormSection title="اطلاعات فارسی"><Stack spacing={2}><div className="form-row"><TextField label="نام فارسی" value={profile.first_name_fa||""} onChange={setField("first_name_fa")}/><TextField label="نام خانوادگی فارسی" value={profile.last_name_fa||""} onChange={setField("last_name_fa")}/></div><TextField label="آدرس فارسی" value={profile.address_fa||""} onChange={setField("address_fa")} multiline minRows={3}/><TextField label="شماره موبایل" value={profile.phone_number||profile.phone||""} onChange={setField("phone_number")} slotProps={{htmlInput:{inputMode:"numeric"}}}/></Stack></FormSection><FormSection title="English Information"><Stack spacing={2}><div className="form-row"><TextField label="First name" value={profile.first_name_en||""} onChange={setField("first_name_en")}/><TextField label="Last name" value={profile.last_name_en||""} onChange={setField("last_name_en")}/></div><TextField label="Address" value={profile.address_en||""} onChange={setField("address_en")} multiline minRows={3}/></Stack></FormSection></div></>;
}

function PreventiveCarePanel({pet,care,surgeries,certificates,onRefresh}:{pet:Pet;care:PreventiveCareRecord[];surgeries:SurgicalHistoryRecord[];certificates:RabiesAntibodyCertificate[];onRefresh:()=>void}) {
  const[careDraft,setCareDraft]=useState<CareDraft>(emptyCareDraft()),[surgery,setSurgery]=useState({id:"",procedure_name:"",description:"",performed_at:"",performed_at_jalali:"",veterinarian_name:""}),[cert,setCert]=useState({id:"",veterinarian_name:"",address:"",telephone_number:"",email:"",issued_at:"",issued_at_jalali:""}),[busy,setBusy]=useState("");
  const petCare=care.filter(x=>x.pet_id===pet.id).sort((a,b)=>String(b.administered_at||b.created_at||"").localeCompare(String(a.administered_at||a.created_at||"")));
  const petSurgeries=surgeries.filter(x=>x.pet_id===pet.id).sort((a,b)=>String(b.performed_at||b.created_at||"").localeCompare(String(a.performed_at||a.created_at||"")));
  const petCerts=certificates.filter(x=>x.pet_id===pet.id).sort((a,b)=>String(b.issued_at||b.created_at||"").localeCompare(String(a.issued_at||a.created_at||"")));
  const saveCare=async()=>{setBusy("care");const payload={pet_id:pet.id,type:careDraft.type,substance_name:careDraft.substance_name||null,administered_at:careDraft.administered_at||null,administered_at_jalali:careDraft.administered_at_jalali||null,next_relevant_date:careDraft.next_relevant_date||null,next_relevant_date_jalali:careDraft.next_relevant_date_jalali||null,veterinarian_name:careDraft.veterinarian_name||null,notes:careDraft.notes||null,updated_at:new Date().toISOString()};const query=careDraft.id?supabase.from("pet_preventive_care_records").update(payload).eq("id",careDraft.id):supabase.from("pet_preventive_care_records").insert(payload);await query;setBusy("");setCareDraft(emptyCareDraft(careDraft.type));onRefresh();};
  const saveSurgery=async()=>{setBusy("surgery");const payload={pet_id:pet.id,procedure_name:surgery.procedure_name||null,description:surgery.description||null,performed_at:surgery.performed_at||null,performed_at_jalali:surgery.performed_at_jalali||null,veterinarian_name:surgery.veterinarian_name||null,updated_at:new Date().toISOString()};const query=surgery.id?supabase.from("pet_surgical_history").update(payload).eq("id",surgery.id):supabase.from("pet_surgical_history").insert(payload);await query;setBusy("");setSurgery({id:"",procedure_name:"",description:"",performed_at:"",performed_at_jalali:"",veterinarian_name:""});onRefresh();};
  const saveCert=async()=>{setBusy("cert");const payload={pet_id:pet.id,veterinarian_name:cert.veterinarian_name||null,address:cert.address||null,telephone_number:numericOnly(cert.telephone_number)||null,email:cert.email||null,issued_at:cert.issued_at||null,issued_at_jalali:cert.issued_at_jalali||null,updated_at:new Date().toISOString()};const query=cert.id?supabase.from("pet_rabies_antibody_certificates").update(payload).eq("id",cert.id):supabase.from("pet_rabies_antibody_certificates").insert(payload);await query;setBusy("");setCert({id:"",veterinarian_name:"",address:"",telephone_number:"",email:"",issued_at:"",issued_at_jalali:""});onRefresh();};
  const remove=async(table:string,id:string)=>{await supabase.from(table).delete().eq("id",id);onRefresh();};
  const currentLabel=careLabels[careDraft.type];
  return <Stack spacing={2}><FormSection title="مراقبت پیشگیرانه"><Stack spacing={2}><div className="form-row"><AppSelectField label="دسته‌بندی" value={careDraft.type} onChange={e=>setCareDraft(emptyCareDraft(e.target.value as PreventiveCareRecord["type"]))} options={careTypes.map(type=>({value:type,label:careLabels[type].title}))}/><TextField label={currentLabel.substance} value={careDraft.substance_name} onChange={e=>setCareDraft(v=>({...v,substance_name:e.target.value}))}/></div><JalaliDateField label={`${currentLabel.date} شمسی`} value={careDraft.administered_at_jalali} onChange={next=>setCareDraft(v=>({...v,administered_at_jalali:next.jalali,administered_at:next.gregorian}))}/><JalaliDateField label={`${currentLabel.next} شمسی`} value={careDraft.next_relevant_date_jalali} onChange={next=>setCareDraft(v=>({...v,next_relevant_date_jalali:next.jalali,next_relevant_date:next.gregorian}))}/><TextField label="نام دامپزشک" value={careDraft.veterinarian_name} onChange={e=>setCareDraft(v=>({...v,veterinarian_name:e.target.value}))}/><TextField label="یادداشت" value={careDraft.notes} onChange={e=>setCareDraft(v=>({...v,notes:e.target.value}))} multiline minRows={2}/><Button variant="contained" onClick={saveCare} disabled={busy==="care"}>{careDraft.id?"ذخیره ویرایش":"افزودن رکورد"}</Button></Stack><div className="record-list">{petCare.map(item=><Paper key={item.id} variant="outlined" className="record-item"><div><b>{careLabels[item.type].title}</b><small>{[item.substance_name,item.administered_at_jalali||item.administered_at,item.next_relevant_date_jalali||item.next_relevant_date,item.veterinarian_name].filter(Boolean).join(" · ")}</small></div><Stack direction="row"><Button onClick={()=>setCareDraft({id:item.id,type:item.type,substance_name:item.substance_name||"",administered_at:item.administered_at||"",administered_at_jalali:item.administered_at_jalali||isoToJalaliValue(item.administered_at),next_relevant_date:item.next_relevant_date||"",next_relevant_date_jalali:item.next_relevant_date_jalali||isoToJalaliValue(item.next_relevant_date),veterinarian_name:item.veterinarian_name||"",notes:item.notes||""})}>ویرایش</Button><IconButton onClick={()=>remove("pet_preventive_care_records",item.id)}><DeleteRounded/></IconButton></Stack></Paper>)}</div></FormSection><FormSection title="تاریخچه جراحی"><Stack spacing={2}><TextField label="جراحی / پروسیجر" value={surgery.procedure_name} onChange={e=>setSurgery(v=>({...v,procedure_name:e.target.value}))}/><JalaliDateField label="تاریخ جراحی شمسی" value={surgery.performed_at_jalali} onChange={next=>setSurgery(v=>({...v,performed_at_jalali:next.jalali,performed_at:next.gregorian}))}/><TextField label="نام دامپزشک" value={surgery.veterinarian_name} onChange={e=>setSurgery(v=>({...v,veterinarian_name:e.target.value}))}/><TextField label="توضیحات" value={surgery.description} onChange={e=>setSurgery(v=>({...v,description:e.target.value}))} multiline minRows={2}/><Button variant="contained" onClick={saveSurgery} disabled={busy==="surgery"}>{surgery.id?"ذخیره ویرایش":"افزودن جراحی"}</Button></Stack><div className="record-list">{petSurgeries.map(item=><Paper key={item.id} variant="outlined" className="record-item"><div><b>{item.procedure_name||"جراحی"}</b><small>{[item.performed_at_jalali||item.performed_at,item.veterinarian_name].filter(Boolean).join(" · ")}</small></div><Stack direction="row"><Button onClick={()=>setSurgery({id:item.id,procedure_name:item.procedure_name||"",description:item.description||"",performed_at:item.performed_at||"",performed_at_jalali:item.performed_at_jalali||isoToJalaliValue(item.performed_at),veterinarian_name:item.veterinarian_name||""})}>ویرایش</Button><IconButton onClick={()=>remove("pet_surgical_history",item.id)}><DeleteRounded/></IconButton></Stack></Paper>)}</div></FormSection><FormSection title="Rabies Antibody Titre"><Stack spacing={2}><TextField label="نام دامپزشک مجاز" value={cert.veterinarian_name} onChange={e=>setCert(v=>({...v,veterinarian_name:e.target.value}))}/><JalaliDateField label="تاریخ شمسی" value={cert.issued_at_jalali} onChange={next=>setCert(v=>({...v,issued_at_jalali:next.jalali,issued_at:next.gregorian}))}/><div className="form-row"><TextField label="تلفن" value={cert.telephone_number} onChange={e=>setCert(v=>({...v,telephone_number:numericOnly(e.target.value)}))}/><TextField label="ایمیل" value={cert.email} onChange={e=>setCert(v=>({...v,email:e.target.value}))}/></div><TextField label="آدرس" value={cert.address} onChange={e=>setCert(v=>({...v,address:e.target.value}))} multiline minRows={2}/><Button variant="contained" onClick={saveCert} disabled={busy==="cert"}>{cert.id?"ذخیره ویرایش":"افزودن گواهی"}</Button></Stack><div className="record-list">{petCerts.map(item=><Paper key={item.id} variant="outlined" className="record-item"><div><b>{item.veterinarian_name||"گواهی هاری"}</b><small>{[item.issued_at_jalali||item.issued_at,item.telephone_number,item.email].filter(Boolean).join(" · ")}</small></div><Stack direction="row"><Button onClick={()=>setCert({id:item.id,veterinarian_name:item.veterinarian_name||"",address:item.address||"",telephone_number:item.telephone_number||"",email:item.email||"",issued_at:item.issued_at||"",issued_at_jalali:item.issued_at_jalali||isoToJalaliValue(item.issued_at)})}>ویرایش</Button><IconButton onClick={()=>remove("pet_rabies_antibody_certificates",item.id)}><DeleteRounded/></IconButton></Stack></Paper>)}</div></FormSection></Stack>;
}

function PetProfile({pet,records,care,surgeries,certificates,timelineRows,back,onAdd,onRefresh,onPetUpdated}:{pet:Pet;records:MedicalRecord[];care:PreventiveCareRecord[];surgeries:SurgicalHistoryRecord[];certificates:RabiesAntibodyCertificate[];timelineRows:MedicalTimelineRow[];back:()=>void;onAdd:()=>void;onRefresh:()=>void;onPetUpdated:(pet:Pet)=>void}) {
  const petDraft=(source:Pet)=>({...source,birth_date_jalali:source.birth_date_jalali||isoToJalaliValue(source.birth_date),passport_issue_date_jalali:source.passport_issue_date_jalali||isoToJalaliValue(source.passport_issue_date),microchip_implant_date_jalali:source.microchip_implant_date_jalali||isoToJalaliValue(source.microchip_implant_date),current_weight:source.current_weight?String(source.current_weight):"",is_neutered:source.is_neutered==null?"":source.is_neutered?"true":"false"});
  const[share,setShare]=useState(false),[tab,setTab]=useState(0),[draft,setDraft]=useState(petDraft(pet)),[saving,setSaving]=useState(false);const list=records.filter(r=>r.pet_id===pet.id),petTimeline=timelineRows.filter(row=>row.petId===pet.id);
  useEffect(()=>setDraft(petDraft(pet)),[pet]);
  const setDraftField=(key:string)=>(e:{target:{value:unknown}})=>setDraft(v=>({...v,[key]:String(e.target.value)}));
  const savePet=async()=>{setSaving(true);const nextWeight=draft.current_weight?Number(decimalOnly(String(draft.current_weight))):null,previousWeight=pet.current_weight??null,weightChanged=nextWeight!==previousWeight;const payload={name:draft.name,species:draft.species,breed:draft.breed||null,gender:draft.gender||null,birth_date:draft.birth_date||null,birth_date_jalali:draft.birth_date_jalali||null,current_weight:nextWeight,color:draft.color||null,distinctive_marks:draft.distinctive_marks||null,is_neutered:draft.is_neutered===""?null:draft.is_neutered==="true",passport_number:draft.passport_number||null,passport_issue_date:draft.passport_issue_date||null,passport_issue_date_jalali:draft.passport_issue_date_jalali||null,microchip_number:numericOnly(draft.microchip_number||"")||null,microchip_implant_date:draft.microchip_implant_date||null,microchip_implant_date_jalali:draft.microchip_implant_date_jalali||null,issuing_veterinarian_name:draft.issuing_veterinarian_name||null,updated_at:new Date().toISOString()};const{data,error}=await supabase.from("pets").update(payload).eq("id",pet.id).select("*").single();if(!error&&data&&weightChanged&&nextWeight){await supabase.from("pet_weight_records").insert({pet_id:pet.id,weight_kg:nextWeight,notes:"به‌روزرسانی وزن از پروفایل"});}setSaving(false);if(!error&&data){onPetUpdated({...data,photo_url:pet.photo_url} as Pet);onRefresh();}};
  return <><div className="profile-actions"><Button onClick={back}>→ بازگشت</Button><Stack direction="row"><Button startIcon={<GroupsRounded/>} onClick={()=>setShare(true)}>مدیریت دسترسی</Button><Button variant="contained" startIcon={<AddRounded/>} onClick={onAdd}>ثبت اطلاعات</Button></Stack></div><Card className="profile-head"><CardContent><div className="profile-main"><PetMark pet={pet} size={82}/><div><Typography variant="h4">{pet.name}</Typography><Typography color="text.secondary">{[pet.species,pet.breed,pet.gender].filter(Boolean).join(" · ")}</Typography></div></div><div className="pet-card-data">{[["تاریخ تولد",pet.birth_date_jalali||formatJalaliDate(pet.birth_date)||"ثبت نشده"],["وزن",pet.current_weight?`${pet.current_weight} کیلوگرم`:"ثبت نشده"],["رنگ",emptyText(pet.color)],["میکروچیپ",pet.microchip_number||"ثبت نشده"],["تعداد سوابق",petTimeline.length]].map(([a,b])=><div key={String(a)}><small>{a}</small><b>{b}</b></div>)}</div></CardContent></Card><Tabs value={tab} onChange={(_,v)=>setTab(v)}><Tab label="پروفایل"/><Tab label="پاسپورت"/><Tab label="مراقبت پیشگیرانه"/><Tab label="تایم‌لاین"/><Tab label="اسناد"/></Tabs><Box sx={{mt:2}}>{tab===0&&<Card><CardContent><SectionHead title="پروفایل پت" action={<Button variant="contained" onClick={savePet} disabled={saving}>{saving?<CircularProgress size={18}/>:"ذخیره"}</Button>}/><Stack spacing={2}><div className="form-row"><TextField label="نام" value={draft.name||""} onChange={setDraftField("name")}/><TextField label="گونه" value={draft.species||""} onChange={setDraftField("species")}/></div><div className="form-row"><TextField label="نژاد" value={draft.breed||""} onChange={setDraftField("breed")}/><AppSelectField label="جنسیت" value={draft.gender||""} onChange={setDraftField("gender")} options={[{value:"",label:"ثبت نشده"},{value:"نر",label:"نر"},{value:"ماده",label:"ماده"}]}/></div><JalaliDateField label="تاریخ تولد شمسی" value={draft.birth_date_jalali} onChange={next=>setDraft(v=>({...v,birth_date_jalali:next.jalali,birth_date:next.gregorian}))}/><TextField label="وزن" value={String(draft.current_weight||"")} onChange={e=>setDraft(v=>({...v,current_weight:decimalOnly(e.target.value)}))} slotProps={{input:{endAdornment:<InputAdornment position="end">کیلوگرم</InputAdornment>}}}/><div className="form-row"><TextField label="رنگ" value={draft.color||""} onChange={setDraftField("color")}/><AppSelectField label="عقیم شده؟" value={draft.is_neutered} onChange={setDraftField("is_neutered")} options={[{value:"",label:"ثبت نشده"},{value:"true",label:"بله"},{value:"false",label:"خیر"}]}/></div><TextField label="علائم متمایز" value={draft.distinctive_marks||""} onChange={setDraftField("distinctive_marks")} multiline minRows={2}/></Stack></CardContent></Card>}{tab===1&&<Card><CardContent><SectionHead title="اطلاعات پاسپورت و شناسایی" action={<Button variant="contained" onClick={savePet} disabled={saving}>{saving?<CircularProgress size={18}/>:"ذخیره"}</Button>}/><Stack spacing={2}><TextField label="شماره پاسپورت / گواهی" value={draft.passport_number||""} onChange={setDraftField("passport_number")}/><JalaliDateField label="تاریخ صدور شمسی" value={draft.passport_issue_date_jalali} onChange={next=>setDraft(v=>({...v,passport_issue_date_jalali:next.jalali,passport_issue_date:next.gregorian}))}/><TextField label="شماره میکروچیپ" value={draft.microchip_number||""} onChange={e=>setDraft(v=>({...v,microchip_number:numericOnly(e.target.value)}))}/><JalaliDateField label="تاریخ کاشت میکروچیپ شمسی" value={draft.microchip_implant_date_jalali} onChange={next=>setDraft(v=>({...v,microchip_implant_date_jalali:next.jalali,microchip_implant_date:next.gregorian}))}/><TextField label="نام دامپزشک صادرکننده" value={draft.issuing_veterinarian_name||""} onChange={setDraftField("issuing_veterinarian_name")}/></Stack></CardContent></Card>}{tab===2&&<PreventiveCarePanel pet={pet} care={care} surgeries={surgeries} certificates={certificates} onRefresh={onRefresh}/>} {tab===3&&(petTimeline.length?<MedicalTimelineTable rows={petTimeline} pets={[pet]}/>:<EmptyPanel title="تایم‌لاین خالی است" text="برای این پت هنوز داده پزشکی، وزن، واکسن یا میکروچیپ ثبت نشده است." action={<Button onClick={onAdd}>ثبت اطلاعات</Button>}/>)} {tab===4&&(list.length?<RecordTable records={list} pets={[pet]}/>:<EmptyPanel title="سندی ثبت نشده" text="اسناد پیوست‌شده اینجا نمایش داده می‌شوند." action={<Button onClick={onAdd}>ثبت اطلاعات</Button>}/>)}</Box><SharePetModal pet={pet} open={share} onClose={()=>{setShare(false);onRefresh();}}/></>;
}

function GlobalPreventivePage({pets,care,surgeries,certificates,weights,onOpen}:{pets:Pet[];care:PreventiveCareRecord[];surgeries:SurgicalHistoryRecord[];certificates:RabiesAntibodyCertificate[];weights:PetWeightRecord[];onOpen:(pet:Pet)=>void}) {
  const petName=(id:string)=>pets.find(p=>p.id===id)?.name||"پت";
  const petFor=(id:string)=>pets.find(p=>p.id===id);
  const rows=[
    ...care.map(item=>({id:item.id,pet_id:item.pet_id,title:careLabels[item.type].title,body:[item.substance_name,item.administered_at_jalali||item.administered_at,item.next_relevant_date_jalali||item.next_relevant_date,item.veterinarian_name].filter(Boolean).join(" · "),date:item.administered_at||item.created_at||""})),
    ...weights.map(item=>({id:item.id,pet_id:item.pet_id,title:"وزن",body:[`${item.weight_kg} کیلوگرم`,item.notes].filter(Boolean).join(" · "),date:item.created_at||""})),
    ...surgeries.map(item=>({id:item.id,pet_id:item.pet_id,title:"تاریخچه جراحی",body:[item.procedure_name,item.performed_at_jalali||item.performed_at,item.veterinarian_name].filter(Boolean).join(" · "),date:item.performed_at||item.created_at||""})),
    ...certificates.map(item=>({id:item.id,pet_id:item.pet_id,title:"Rabies Antibody Titre",body:[item.veterinarian_name,item.issued_at_jalali||item.issued_at,item.telephone_number].filter(Boolean).join(" · "),date:item.issued_at||item.created_at||""})),
  ].sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  return <><SectionHead title="مراقبت پیشگیرانه و تاریخچه پزشکی"/>{!rows.length?<EmptyPanel title="رکوردی ثبت نشده" text="از داخل پروفایل هر پت می‌توانید واکسن، درمان ضدانگل، جراحی و گواهی هاری را ثبت کنید."/>:<div className="record-list">{rows.map(row=><Paper key={`${row.title}-${row.id}`} variant="outlined" className="record-item"><div><b>{row.title}</b><small>{petName(row.pet_id)}{row.body?` · ${row.body}`:""}</small></div>{petFor(row.pet_id)&&<Button onClick={()=>onOpen(petFor(row.pet_id)!)}>پرونده پت</Button>}</Paper>)}</div>}</>;
}

export default function App(){
  const[page,setPage]=useState("dashboard"),[drawer,setDrawer]=useState(false),[loading,setLoading]=useState(true),[logoutOpen,setLogoutOpen]=useState(false);
  const[pets,setPets]=useState<Pet[]>([]),[records,setRecords]=useState<MedicalRecord[]>([]),[pet,setPet]=useState<Pet|null>(null);
  const[care,setCare]=useState<PreventiveCareRecord[]>([]),[surgeries,setSurgeries]=useState<SurgicalHistoryRecord[]>([]),[certificates,setCertificates]=useState<RabiesAntibodyCertificate[]>([]);
  const[weights,setWeights]=useState<PetWeightRecord[]>([]);
  const[timelinePetId,setTimelinePetId]=useState("");
  const[petModal,setPetModal]=useState(false),[recordModal,setRecordModal]=useState(false);
  const[userMenuAnchor,setUserMenuAnchor]=useState<HTMLElement|null>(null);
  const load=useCallback(async()=>{if(!hasSupabase){setLoading(false);return;}setLoading(true);const[p,r,c,s,cert,w]=await Promise.all([supabase.from("pets").select("*").order("created_at"),supabase.from("medical_records").select("*").order("created_at",{ascending:false}),supabase.from("pet_preventive_care_records").select("*").order("created_at",{ascending:false}),supabase.from("pet_surgical_history").select("*").order("created_at",{ascending:false}),supabase.from("pet_rabies_antibody_certificates").select("*").order("created_at",{ascending:false}),supabase.from("pet_weight_records").select("*").order("created_at",{ascending:false})]);const raw=(p.data||[])as Pet[];const withPhotos=await Promise.all(raw.map(async pet=>{const listed=await supabase.storage.from("pet-documents").list(pet.id,{search:"avatar",limit:1});if(!listed.data?.length)return pet;const signed=await supabase.storage.from("pet-documents").createSignedUrl(`${pet.id}/avatar`,3600);return{...pet,photo_url:signed.data?.signedUrl||null};}));setPets(withPhotos);setRecords((r.data||[])as MedicalRecord[]);setCare((c.data||[])as PreventiveCareRecord[]);setSurgeries((s.data||[])as SurgicalHistoryRecord[]);setCertificates((cert.data||[])as RabiesAntibodyCertificate[]);setWeights((w.data||[])as PetWeightRecord[]);setLoading(false);},[]);
  useEffect(()=>{void load();},[load]);const items=useMemo(()=>nav,[]);
  const timelineRows=useMemo(()=>buildMedicalTimelineRows({pets,records,care,surgeries,certificates,weights}),[pets,records,care,surgeries,certificates,weights]);
  const filteredTimelineRows=useMemo(()=>timelinePetId?timelineRows.filter(row=>row.petId===timelinePetId):timelineRows,[timelineRows,timelinePetId]);
  const go=(key:string)=>{setPage(key);setPet(null);setDrawer(false);};
  const openAccount=()=>{setUserMenuAnchor(null);setPage("account");setPet(null);setDrawer(false);};
  const openSettings=()=>{setUserMenuAnchor(null);setPage("settings");setPet(null);setDrawer(false);};
  const logout=async()=>{const{error}=await supabase.auth.signOut({scope:"local"});if(!error)window.location.replace("/");};
  const pageTitle=pet?.name||nav.find(x=>x[0]===page)?.[1]||(page==="account"?"حساب کاربری":page==="settings"?"تنظیمات":"داشبورد");
  const updateSelectedPet=(updated:Pet)=>{setPet(updated);setPets(list=>list.map(item=>item.id===updated.id?updated:item));};
  const content=()=>{if(loading)return <div className="page-loading"><CircularProgress/></div>;if(pet)return <PetProfile pet={pet} records={records} care={care} surgeries={surgeries} certificates={certificates} timelineRows={timelineRows} back={()=>setPet(null)} onAdd={()=>setRecordModal(true)} onRefresh={load} onPetUpdated={updateSelectedPet}/>;if(page==="account")return <UserProfilePage/>;if(page==="dashboard"||page==="pets")return <Dashboard pets={pets} timelineRows={timelineRows} onAddPet={()=>setPetModal(true)} onAddRecord={()=>setRecordModal(true)} onOpen={setPet}/>;if(page==="preventive")return <GlobalPreventivePage pets={pets} care={care} surgeries={surgeries} certificates={certificates} weights={weights} onOpen={setPet}/>;if(page==="timeline")return <><SectionHead title="تایم‌لاین پزشکی" action={<Button variant="contained" disabled={!pets.length} onClick={()=>setRecordModal(true)}>ثبت رویداد</Button>}/>{timelineRows.length?<><Card sx={{mb:2}}><CardContent><FormControl fullWidth size="small"><InputLabel>فیلتر پرونده پت</InputLabel><Select label="فیلتر پرونده پت" value={timelinePetId} onChange={e=>setTimelinePetId(String(e.target.value))}><MenuItem value="">همه پت‌ها</MenuItem>{pets.map(item=><MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}</Select></FormControl></CardContent></Card>{filteredTimelineRows.length?<MedicalTimelineTable rows={filteredTimelineRows} pets={pets}/>:<EmptyPanel title="برای این پت رکوردی نیست" text="برای این پرونده هنوز داده پزشکی، واکسن، وزن یا میکروچیپی ثبت نشده است."/ >}</>:<EmptyPanel title="تایم‌لاین خالی است" text="هیچ داده پزشکی، واکسن، وزن یا میکروچیپی ثبت نشده است."/ >}</>;return <><SectionHead title={pageTitle}/><EmptyPanel title="هنوز اطلاعاتی ثبت نشده" text="این بخش با ثبت اطلاعات واقعی شما تکمیل می‌شود."/ ></>;};
  const menu=<List>{items.map(([key,label,Icon])=><ListItemButton key={key} selected={page===key} onClick={()=>go(key)}><ListItemIcon><Icon/></ListItemIcon><ListItemText primary={label}/></ListItemButton>)}</List>;
  return <Box className="app"><aside className="sider"><div className="brand"><span>V</span><div><b>Vetrica</b><small>Digital Pet Health</small></div></div>{menu}<Button className="side-support-button" startIcon={<SupportAgentRounded/>}>پشتیبانی</Button></aside><Drawer anchor="right" open={drawer} onClose={()=>setDrawer(false)}><Box sx={{width:300,p:2}}><Typography variant="h6">Vetrica</Typography>{menu}<Divider/><Button fullWidth startIcon={<SupportAgentRounded/>}>پشتیبانی</Button></Box></Drawer><Box className="app-main"><header className="header"><div className="mobile-app-title"><span>V</span><div><small>Vetrica</small><b>{pageTitle}</b></div></div><div className="desktop-title"><Typography color="text.secondary" variant="caption">فضای کاری</Typography><b>مدیریت سلامت پت‌ها</b></div><Stack className="header-actions" direction="row"><IconButton><Badge variant="dot" color="primary"><NotificationsNoneRounded/></Badge></IconButton><IconButton onClick={e=>setUserMenuAnchor(e.currentTarget)} aria-label="منوی حساب کاربری"><Avatar><PersonRounded/></Avatar></IconButton><Menu anchorEl={userMenuAnchor} open={Boolean(userMenuAnchor)} onClose={()=>setUserMenuAnchor(null)} anchorOrigin={{vertical:"bottom",horizontal:"left"}} transformOrigin={{vertical:"top",horizontal:"left"}}><MenuItem onClick={openAccount}><ListItemIcon><PersonRounded fontSize="small"/></ListItemIcon><ListItemText primary="حساب کاربری"/></MenuItem><MenuItem onClick={openSettings}><ListItemIcon><SettingsRounded fontSize="small"/></ListItemIcon><ListItemText primary="تنظیمات"/></MenuItem><MenuItem onClick={()=>{setUserMenuAnchor(null);setLogoutOpen(true);}}><ListItemIcon><LogoutRounded fontSize="small"/></ListItemIcon><ListItemText primary="خروج از حساب"/></MenuItem></Menu></Stack></header><main className="content">{content()}</main></Box><nav className="bottom-nav"><button className={page==="dashboard"&&!pet?"active":""} onClick={()=>go("dashboard")}><HomeRounded/><span>خانه</span></button><button className={page==="pets"||!!pet?"active":""} onClick={()=>go("pets")}><FavoriteRounded/><span>پت‌ها</span></button><button className="mobile-add" onClick={()=>pets.length?setRecordModal(true):setPetModal(true)}><AddRounded/><span>ثبت</span></button><button className={page==="timeline"?"active":""} onClick={()=>go("timeline")}><CalendarMonthRounded/><span>سوابق</span></button><button onClick={()=>setDrawer(true)}><MenuRounded/><span>بیشتر</span></button></nav><PetForm open={petModal} onClose={()=>setPetModal(false)} onSaved={load}/><SmartEntryModal open={recordModal} onClose={()=>setRecordModal(false)} onSaved={load} pets={pets}/><Dialog open={logoutOpen} onClose={()=>setLogoutOpen(false)}><DialogTitle>از حساب خارج می‌شوید؟</DialogTitle><DialogContent><Typography color="text.secondary">برای ورود دوباره باید شماره موبایل و کد ورود را وارد کنید.</Typography></DialogContent><DialogActions><Button onClick={()=>setLogoutOpen(false)}>انصراف</Button><Button color="error" variant="contained" onClick={logout}>خروج از حساب</Button></DialogActions></Dialog></Box>;
}
