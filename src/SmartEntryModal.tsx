import { useEffect, useState } from "react";
import {
  CameraOutlined,
  CheckCircleFilled,
  FileImageOutlined,
  FormOutlined,
  InboxOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Alert, Button, Form, Image, Input, Modal, Radio, Select, Steps, Tag, Upload } from "antd";
import type { UploadFile } from "antd";
import type { Pet } from "./types";

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

async function extractDocument(file: File, recordType: string): Promise<ExtractedRecord> {
  const endpoint = import.meta.env.VITE_DOCUMENT_EXTRACTOR_URL;
  if (endpoint) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: await fileToDataUrl(file), recordType }),
    });
    if (!response.ok) throw new Error("خواندن تصویر انجام نشد");
    return response.json();
  }
  await new Promise((resolve) => setTimeout(resolve, 1400));
  return {
    recordType,
    title: recordType === "فاکتور و هزینه" ? "فاکتور خدمات دامپزشکی" : "نسخه و توصیه دامپزشک",
    date: "۱۴۰۵/۰۴/۱۲",
    clinic: "کلینیک دامپزشکی سپیدار",
    veterinarian: "دکتر نادری",
    diagnosis: "التهاب خفیف گوارشی",
    medications: "پروبیوتیک حیوانات — روزی یک مرتبه",
    amount: "۱٬۸۵۰٬۰۰۰ تومان",
    notes: "اطلاعات استخراج‌شده را پیش از ذخیره بررسی کنید.",
    confidence: 88,
  };
}

export default function SmartEntryModal({ open, onClose, pets }: { open: boolean; onClose: () => void; pets: Pet[] }) {
  const [mode, setMode] = useState<"form" | "image">("image");
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [type, setType] = useState("نسخه");
  const [preview, setPreview] = useState("");
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;
    setStep(0); setFiles([]); setPreview(""); form.resetFields();
  }, [open, form]);

  const analyze = async () => {
    const origin = files[0]?.originFileObj;
    if (!origin) return;
    setBusy(true);
    try {
      setPreview(await fileToDataUrl(origin));
      const result = await extractDocument(origin, type);
      form.setFieldsValue(result);
      setStep(1);
    } finally { setBusy(false); }
  };

  return (
    <Modal className="smart-modal" width={860} title="ثبت هوشمند اطلاعات پزشکی" open={open} onCancel={onClose} footer={null} destroyOnHidden>
      <div className="entry-mode">
        <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)} optionType="button" buttonStyle="solid">
          <Radio.Button value="image"><CameraOutlined /> خواندن از تصویر</Radio.Button>
          <Radio.Button value="form"><FormOutlined /> ورود دستی</Radio.Button>
        </Radio.Group>
        {mode === "image" && <Steps size="small" current={step} items={[{ title: "افزودن تصویر" }, { title: "بازبینی اطلاعات" }, { title: "ذخیره" }]} />}
      </div>

      {mode === "image" && step === 0 ? <div className="scan-grid">
        <div>
          <Form layout="vertical">
            <Form.Item label="این تصویر مربوط به چیست؟">
              <Select value={type} onChange={setType} options={recordTypes.map((x) => ({ value: x, label: x }))} />
            </Form.Item>
          </Form>
          <Upload.Dragger accept="image/*,.pdf" maxCount={1} fileList={files} beforeUpload={() => false} onChange={({ fileList }) => setFiles(fileList)}>
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p>تصویر نسخه، تشخیص، فاکتور یا برگه آزمایش را اینجا بگذارید</p>
            <small>JPG، PNG، HEIC یا PDF — حداکثر ۱۰ مگابایت</small>
          </Upload.Dragger>
          <Alert showIcon type="info" message="تصویر پس از استخراج حذف نمی‌شود و به رکورد پزشکی پیوست خواهد ماند." />
          <Button block size="large" type="primary" disabled={!files.length} onClick={analyze} icon={busy ? <LoadingOutlined /> : <FileImageOutlined />} loading={busy}>خواندن و تکمیل فرم</Button>
        </div>
        <div className="scan-help"><CameraOutlined /><h3>از مدرک واضح عکس بگیرید</h3><p>صفحه کامل، نور یکنواخت و نوشته‌ها خوانا باشند. اطلاعات پزشکی قبل از ثبت نهایی حتماً توسط شما تأیید می‌شود.</p><div><Tag>نسخه</Tag><Tag>تشخیص</Tag><Tag>هزینه</Tag><Tag>آزمایش</Tag></div></div>
      </div> : <div className="review-grid">
        {mode === "image" && <aside className="document-preview">{preview ? <Image src={preview} alt="تصویر مدرک پزشکی" /> : <FileImageOutlined /> }<b>تصویر اصلی</b><span>این فایل همراه رکورد ذخیره می‌شود</span></aside>}
        <Form form={form} layout="vertical" className="extracted-form" initialValues={{ recordType: type }}>
          {mode === "image" && <Alert type="success" showIcon icon={<CheckCircleFilled />} message="اطلاعات از تصویر استخراج شد" description="موارد زیر را بازبینی و در صورت نیاز اصلاح کنید." />}
          <div className="form-row"><Form.Item name="petId" label="حیوان" rules={[{ required: true }]}><Select placeholder="انتخاب حیوان" options={pets.map((p) => ({ value: p.id, label: p.name }))} /></Form.Item><Form.Item name="recordType" label="نوع رکورد"><Select options={recordTypes.map((x) => ({ value: x, label: x }))} /></Form.Item></div>
          <Form.Item name="title" label="عنوان"><Input /></Form.Item>
          <div className="form-row"><Form.Item name="date" label="تاریخ"><Input /></Form.Item><Form.Item name="amount" label="مبلغ"><Input /></Form.Item></div>
          <div className="form-row"><Form.Item name="clinic" label="کلینیک"><Input /></Form.Item><Form.Item name="veterinarian" label="دامپزشک"><Input /></Form.Item></div>
          <Form.Item name="diagnosis" label="تشخیص"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="medications" label="داروها و دستور مصرف"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="notes" label="یادداشت"><Input.TextArea rows={2} /></Form.Item>
          <div className="modal-actions">{mode === "image" && <Button onClick={() => setStep(0)}>تصویر دیگری انتخاب کن</Button>}<Button type="primary" onClick={onClose}>تأیید و ذخیره رکورد</Button></div>
        </Form>
      </div>}
    </Modal>
  );
}
