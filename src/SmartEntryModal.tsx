import { useEffect, useState } from "react";
import {
  AudioOutlined,
  CameraOutlined,
  CheckCircleFilled,
  FileImageOutlined,
  FilePdfOutlined,
  LoadingOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Alert, Button, Form, Image, Input, Modal, Select, Spin, Upload, message } from "antd";
import type { Pet } from "./types";
import { hasSupabase, supabase } from "./lib/supabase";

type ExtractedRecord = {
  recordType: string;
  title: string;
  date: string;
  clinic: string;
  veterinarian: string;
  diagnosis: string;
  medications: string;
  amount: string;
  notes: string;
  confidence: number;
};

const recordTypes = ["نسخه", "تشخیص", "فاکتور و هزینه", "آزمایش", "تصویربرداری", "واکسن", "سایر"];

async function fileToDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function extractDocument(file: File): Promise<ExtractedRecord> {
  const { data, error } = await supabase.functions.invoke("extract-medical-document", {
    body: { image: await fileToDataUrl(file), recordType: "تشخیص خودکار نوع مدرک" },
  });
  if (error || data?.error) throw new Error(data?.error || error?.message || "خواندن تصویر انجام نشد");
  return data as ExtractedRecord;
}

export default function SmartEntryModal({ open, onClose, onSaved, pets }: { open: boolean; onClose: () => void; onSaved: () => void; pets: Pet[] }) {
  const [step, setStep] = useState<"pet" | "source" | "analyzing" | "review">("pet");
  const [petId, setPetId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;
    setStep("pet"); setPetId(""); setFile(null); setPreview(""); setBusy(false); form.resetFields();
  }, [open, form]);

  const analyze = async (selected: File) => {
    if (!selected.type.startsWith("image/")) return message.error("در این مرحله فقط تصویر قابل ثبت است.");
    if (selected.size > 10 * 1024 * 1024) return message.error("حجم تصویر باید کمتر از ۱۰ مگابایت باشد.");
    setFile(selected);
    setPreview(await fileToDataUrl(selected));
    setStep("analyzing");
    setBusy(true);
    try {
      const result = await extractDocument(selected);
      form.setFieldsValue({ petId, ...result });
      setStep("review");
    } catch (error) {
      message.error(error instanceof Error ? error.message : "خواندن تصویر انجام نشد");
      setStep("source");
    } finally {
      setBusy(false);
    }
  };

  const save = async (values: Record<string, string>) => {
    if (!hasSupabase || !file) return message.error("اتصال دیتابیس یا تصویر در دسترس نیست.");
    setBusy(true);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const attachmentPath = `${petId}/${crypto.randomUUID()}-${safeName}`;
    const upload = await supabase.storage.from("pet-documents").upload(attachmentPath, file, { upsert: false });
    if (upload.error) { setBusy(false); return message.error("بارگذاری تصویر انجام نشد."); }
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("medical_records").insert({
      pet_id: petId, record_type: values.recordType || "سایر", title: values.title || null,
      event_date: values.date || null, clinic: values.clinic || null, veterinarian: values.veterinarian || null,
      diagnosis: values.diagnosis || null, medications: values.medications || null, amount: values.amount || null,
      notes: values.notes || null, attachment_path: attachmentPath, created_by: userData.user?.id,
    });
    setBusy(false);
    if (error) return message.error("ذخیره اطلاعات انجام نشد.");
    message.success("اطلاعات به پرونده اضافه شد."); form.resetFields(); onClose(); onSaved();
  };

  const selectedPet = pets.find((pet) => pet.id === petId);
  const progress = step === "pet" ? 1 : step === "source" ? 2 : 3;

  return (
    <Modal className="smart-modal quick-entry-modal" width={760} title={null} open={open} onCancel={onClose} footer={null} destroyOnHidden>
      <header className="quick-entry-head">
        <span>{progress} از ۳</span>
        <h2>{step === "pet" ? "برای کدام پرونده؟" : step === "source" ? "چطور می‌خواهید اضافه کنید؟" : step === "analyzing" ? "در حال خواندن مدرک" : "بررسی و ثبت اطلاعات"}</h2>
        <p>{step === "pet" ? "پرونده پتی را که این مدرک به آن مربوط است انتخاب کنید." : step === "source" ? `${selectedPet?.name || "پت"} انتخاب شده؛ نوع ورودی را مشخص کنید.` : step === "analyzing" ? "هوش مصنوعی اطلاعات پزشکی را از تصویر استخراج می‌کند." : "اطلاعات استخراج‌شده را بررسی و در صورت نیاز اصلاح کنید."}</p>
        <div className="quick-progress"><i className={progress >= 1 ? "done" : ""} /><i className={progress >= 2 ? "done" : ""} /><i className={progress >= 3 ? "done" : ""} /></div>
      </header>

      {step === "pet" && <div className="pet-choice-list">
        {pets.map((pet) => <button key={pet.id} onClick={() => { setPetId(pet.id); setStep("source"); }}>
          <span>{pet.name.slice(0, 1)}</span><div><b>{pet.name}</b><small>{[pet.species, pet.breed].filter(Boolean).join(" · ")}</small></div><i>←</i>
        </button>)}
      </div>}

      {step === "source" && <div className="source-step">
        <div className="source-grid">
          <Upload accept="image/*" capture="environment" showUploadList={false} beforeUpload={(selected) => { void analyze(selected); return false; }}>
            <button className="source-option primary"><CameraOutlined /><b>گرفتن عکس</b><small>با دوربین موبایل</small></button>
          </Upload>
          <Upload accept="image/*" showUploadList={false} beforeUpload={(selected) => { void analyze(selected); return false; }}>
            <button className="source-option"><UploadOutlined /><b>انتخاب عکس</b><small>از گالری یا فایل‌ها</small></button>
          </Upload>
          <button className="source-option disabled" disabled><FilePdfOutlined /><b>فایل PDF</b><small>به‌زودی</small></button>
          <button className="source-option disabled" disabled><AudioOutlined /><b>ضبط صدا</b><small>به‌زودی</small></button>
          <button className="source-option disabled" disabled><AudioOutlined /><b>آپلود صوت</b><small>به‌زودی</small></button>
        </div>
        <Button type="text" onClick={() => setStep("pet")}>تغییر پرونده</Button>
      </div>}

      {step === "analyzing" && <div className="ai-reading">
        <div className="ai-preview">{preview && <Image preview={false} src={preview} alt="مدرک پزشکی" />}</div>
        <Spin indicator={<LoadingOutlined spin />} size="large" />
        <b>در حال استخراج اطلاعات…</b>
        <small>نسخه، تشخیص، داروها، تاریخ و هزینه شناسایی می‌شوند.</small>
      </div>}

      {step === "review" && <div className="review-grid quick-review">
        <aside className="document-preview">{preview ? <Image src={preview} alt="تصویر مدرک پزشکی" /> : <FileImageOutlined />}<b>تصویر اصلی</b><span>همراه رکورد ذخیره می‌شود</span></aside>
        <Form form={form} layout="vertical" className="extracted-form" onFinish={save}>
          <Alert type="success" showIcon icon={<CheckCircleFilled />} message="اطلاعات از تصویر استخراج شد" description="قبل از ثبت نهایی، موارد زیر را بازبینی کنید." />
          <Form.Item name="recordType" label="نوع مدرک"><Select options={recordTypes.map((x) => ({ value: x, label: x }))} /></Form.Item>
          <Form.Item name="title" label="عنوان" rules={[{ required: true, message: "عنوان را وارد کنید" }]}><Input /></Form.Item>
          <div className="form-row"><Form.Item name="date" label="تاریخ"><Input /></Form.Item><Form.Item name="amount" label="مبلغ"><Input /></Form.Item></div>
          <div className="form-row"><Form.Item name="clinic" label="کلینیک"><Input /></Form.Item><Form.Item name="veterinarian" label="دامپزشک"><Input /></Form.Item></div>
          <Form.Item name="diagnosis" label="تشخیص"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="medications" label="داروها و دستور مصرف"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="notes" label="یادداشت"><Input.TextArea rows={2} /></Form.Item>
          <div className="modal-actions"><Button onClick={() => setStep("source")}>تغییر تصویر</Button><Button type="primary" htmlType="submit" loading={busy}>ثبت در پرونده {selectedPet?.name}</Button></div>
        </Form>
      </div>}
    </Modal>
  );
}
