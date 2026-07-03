export type HealthStatus='سالم'|'نیازمند پیگیری'|'دارای داروی فعال'|'عقب‌افتادگی واکسن';
export interface Pet{id:string;name:string;species:string;breed:string;gender:string;birthDate:string;age:string;weight:string;lastVisit:string;nextVaccine:string;status:HealthStatus;color:string;microchip:string;vet:string;sterilized:string;initial:string}
export interface MedicalEvent{id:string;petId:string;date:string;type:string;title:string;description:string;clinic:string;files:number;cost?:string;status:string}
export interface Reminder{id:string;petId:string;title:string;type:string;due:string;priority:string;status:string}
export interface VaccineRecord{id:string;petId:string;medicalEventId:string;name:string;date:string;brand:string;batch:string;clinic:string;vet:string;next:string;status:string}
export interface MedicationRecord{id:string;petId:string;medicalEventId:string;name:string;reason:string;dose:string;frequency:string;start:string;end:string;status:string}
