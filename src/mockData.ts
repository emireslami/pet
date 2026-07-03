import type {MedicalEvent,MedicationRecord,Pet,Reminder,VaccineRecord} from './types';
export const pets:Pet[]=[
 {id:'darchin',name:'دارچین',species:'سگ',breed:'نژاد ترکیبی',gender:'ماده',birthDate:'۱۴۰۰/۰۲/۱۸',age:'۵ سال',weight:'۱۲٫۴ کیلوگرم',lastVisit:'۱۴۰۵/۰۳/۲۴',nextVaccine:'۱۴۰۵/۰۴/۱۲',status:'سالم',color:'#D78A5A',microchip:'IR-982-000-418',vet:'دکتر نادری',sterilized:'انجام شده',initial:'د'},
 {id:'kinder',name:'کیندر',species:'گربه',breed:'موکوتاه خانگی',gender:'نر',birthDate:'۱۴۰۱/۰۸/۰۶',age:'۳ سال و ۸ ماه',weight:'۵٫۱ کیلوگرم',lastVisit:'۱۴۰۵/۰۳/۱۲',nextVaccine:'۱۴۰۵/۰۳/۲۸',status:'نیازمند پیگیری',color:'#557B87',microchip:'IR-982-000-732',vet:'دکتر فرهمند',sterilized:'انجام شده',initial:'ک'}
];
export const events:MedicalEvent[]=[
 {id:'e1',petId:'darchin',date:'۲۴ خرداد ۱۴۰۵',type:'ویزیت دامپزشکی',title:'چکاپ دوره‌ای و معاینه عمومی',description:'وضعیت عمومی پایدار؛ ادامه رژیم غذایی فعلی توصیه شد.',clinic:'کلینیک دامپزشکی سپیدار',files:2,cost:'۱٬۸۵۰٬۰۰۰ تومان',status:'انجام شده'},
 {id:'e2',petId:'kinder',date:'۱۲ خرداد ۱۴۰۵',type:'آزمایش',title:'آزمایش خون CBC',description:'کاهش خفیف هموگلوبین؛ تکرار آزمایش طی یک ماه.',clinic:'آزمایشگاه پاستور',files:1,cost:'۲٬۲۰۰٬۰۰۰ تومان',status:'نیازمند پیگیری'},
 {id:'e3',petId:'darchin',date:'۱۹ اردیبهشت ۱۴۰۵',type:'واکسن',title:'واکسن چندگانه سالانه',description:'تزریق واکسن DHPPi؛ بدون عارضه مشاهده‌شده.',clinic:'کلینیک دامپزشکی سپیدار',files:1,cost:'۱٬۳۰۰٬۰۰۰ تومان',status:'انجام شده'}
];
export const reminders:Reminder[]=[{id:'r1',petId:'kinder',title:'تکرار آزمایش خون',type:'آزمایش',due:'۴ روز دیگر',priority:'زیاد',status:'باز'},{id:'r2',petId:'darchin',title:'یادآوری واکسن هاری',type:'واکسن',due:'۹ روز دیگر',priority:'متوسط',status:'باز'},{id:'r3',petId:'darchin',title:'قرص ضد انگل',type:'انگل‌زدایی',due:'۱۸ روز دیگر',priority:'کم',status:'باز'}];
export const vaccines:VaccineRecord[]=[{id:'v1',petId:'darchin',medicalEventId:'e3',name:'چندگانه DHPPi',date:'۱۴۰۵/۰۲/۱۹',brand:'Nobivac',batch:'NB-2408',clinic:'سپیدار',vet:'دکتر نادری',next:'۱۴۰۶/۰۲/۱۹',status:'انجام شده'},{id:'v2',petId:'kinder',medicalEventId:'e4',name:'سه‌گانه گربه',date:'۱۴۰۴/۰۳/۲۸',brand:'Purevax',batch:'PV-1831',clinic:'آریا',vet:'دکتر فرهمند',next:'۱۴۰۵/۰۳/۲۸',status:'موعد نزدیک'}];
export const medications:MedicationRecord[]=[{id:'m1',petId:'kinder',medicalEventId:'e2',name:'مکمل آهن',reason:'کم‌خونی خفیف',dose:'۲ میلی‌لیتر',frequency:'روزی یک بار',start:'۱۴۰۵/۰۳/۱۳',end:'۱۴۰۵/۰۴/۱۳',status:'فعال'}];
