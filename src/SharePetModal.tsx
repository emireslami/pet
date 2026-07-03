import { useState } from "react";
import { Button, Form, Input, Modal, Select, Switch, message } from "antd";
import type { Pet } from "./types";
import { hasSupabase, normalizeIranPhone, supabase } from "./lib/supabase";

export default function SharePetModal({ pet, open, onClose }: { pet: Pet; open: boolean; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const [form] = Form.useForm();
  const submit = async ({ phone, role, canEdit }: { phone: string; role: string; canEdit: boolean }) => {
    setBusy(true);
    if (hasSupabase && /^[0-9a-f-]{36}$/i.test(pet.id)) {
      const { error } = await supabase.rpc("invite_pet_member", {
        target_pet_id: pet.id,
        target_phone: normalizeIranPhone(phone),
        target_role: role,
        target_can_edit: canEdit,
      });
      if (error) { message.error(error.message.includes("No registered") ? "این شماره هنوز در پت‌پرونده ثبت‌نام نکرده است." : "افزودن دسترسی انجام نشد."); setBusy(false); return; }
    }
    message.success(`دسترسی به پرونده ${pet.name} اضافه شد.`);
    setBusy(false); form.resetFields(); onClose();
  };
  return <Modal title={`اشتراک‌گذاری پرونده ${pet.name}`} open={open} onCancel={onClose} footer={null}>
    <p className="share-note">شماره موردنظر باید قبلاً در پت‌پرونده ثبت‌نام کرده باشد.</p>
    <Form form={form} layout="vertical" onFinish={submit} initialValues={{ role: "caregiver", canEdit: true }}>
      <Form.Item name="phone" label="شماره موبایل عضو خانواده" rules={[{ required: true, pattern: /^(\+98|0)?9\d{9}$/, message: "شماره معتبر وارد کنید" }]}><Input dir="ltr" placeholder="0912 123 4567" /></Form.Item>
      <Form.Item name="role" label="نقش"><Select options={[{ value: "owner", label: "مالک" },{ value: "caregiver", label: "مراقب" },{ value: "veterinarian", label: "دامپزشک" },{ value: "viewer", label: "فقط مشاهده" }]} /></Form.Item>
      <Form.Item name="canEdit" label="اجازه ویرایش" valuePropName="checked"><Switch checkedChildren="دارد" unCheckedChildren="ندارد" /></Form.Item>
      <Button block type="primary" htmlType="submit" loading={busy}>افزودن به پرونده</Button>
    </Form>
  </Modal>;
}
