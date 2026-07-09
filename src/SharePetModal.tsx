import { useEffect, useState } from "react";
import { EditNoteRounded, VisibilityRounded } from "@mui/icons-material";
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Radio, RadioGroup, Stack, TextField, Typography } from "@mui/material";
import type { Pet } from "./types";
import { hasSupabase, normalizeIranPhone, supabase } from "./lib/supabase";

export default function SharePetModal({pet,open,onClose}:{pet:Pet;open:boolean;onClose:()=>void}) {
  const[busy,setBusy]=useState(false),[phone,setPhone]=useState(""),[accessLevel,setAccessLevel]=useState<"view"|"edit">("view"),[error,setError]=useState("");
  useEffect(()=>{if(open){setPhone("");setAccessLevel("view");setError("");}},[open]);
  const submit=async(e:React.FormEvent)=>{
    e.preventDefault();if(!/^(\+98|0)?9\d{9}$/.test(phone.replace(/\s/g,"")))return setError("شماره معتبر وارد کنید.");
    setBusy(true);setError("");
    if(hasSupabase&&/^[0-9a-f-]{36}$/i.test(pet.id)){const{error:dbError}=await supabase.rpc("set_pet_member_access",{target_pet_id:pet.id,target_phone:normalizeIranPhone(phone),access_level:accessLevel});if(dbError){setError(dbError.message.includes("No registered")?"این شماره هنوز در Vetrica ثبت‌نام نکرده است.":"افزودن دسترسی انجام نشد.");setBusy(false);return;}}
    setBusy(false);onClose();
  };
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"><Box component="form" onSubmit={submit}><DialogTitle>اشتراک‌گذاری پرونده {pet.name}</DialogTitle><DialogContent><Stack spacing={2} sx={{pt:1}}><Alert severity="info">فقط مالک پرونده می‌تواند دسترسی دیگران را مدیریت کند.</Alert>{error&&<Alert severity="error">{error}</Alert>}<TextField label="شماره موبایل عضو خانواده" placeholder="0912 123 4567" value={phone} onChange={e=>setPhone(e.target.value)} slotProps={{htmlInput:{dir:"ltr"}}}/><RadioGroup value={accessLevel} onChange={e=>setAccessLevel(e.target.value as "view"|"edit")} className="access-levels"><FormControlLabel value="view" control={<Radio/>} label={<span><VisibilityRounded/><b>فقط مشاهده</b><small>دیدن پرونده و مدارک، بدون امکان تغییر</small></span>}/><FormControlLabel value="edit" control={<Radio/>} label={<span><EditNoteRounded/><b>مشاهده و ثبت اطلاعات</b><small>افزودن رویداد، سند و مدرک پزشکی</small></span>}/></RadioGroup></Stack></DialogContent><DialogActions><Button onClick={onClose}>انصراف</Button><Button variant="contained" type="submit" disabled={busy}>{busy?<CircularProgress size={20}/>:"ثبت یا تغییر دسترسی"}</Button></DialogActions></Box></Dialog>;
}
