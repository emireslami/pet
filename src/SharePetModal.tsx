import { useState } from "react";
import { EyeOutlined, FormOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Radio, message } from "antd";
import type { Pet } from "./types";
import { hasSupabase, normalizeIranPhone, supabase } from "./lib/supabase";

export default function SharePetModal({ pet, open, onClose }: { pet: Pet; open: boolean; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const [form] = Form.useForm();
  const submit = async ({ phone, accessLevel }: { phone: string; accessLevel: "view" | "edit" }) => {
    setBusy(true);
    if (hasSupabase && /^[0-9a-f-]{36}$/i.test(pet.id)) {
      const { error } = await supabase.rpc("set_pet_member_access", {
        target_pet_id: pet.id,
        target_phone: normalizeIranPhone(phone),
        access_level: accessLevel,
      });
      if (error) { message.error(error.message.includes("No registered") ? "این شماره هنوز در پت‌پرونده ثبت‌نام نکرده است." : "افزودن دسترسی انجام نشد."); setBusy(false); return; }
    }
    message.success(`دسترسی به پرونده ${pet.name} اضافه شد.`);
    setBusy(false); form.resetFields(); onClose();
  };
  return <Modal title={`اشتراک‌گذاری پرونده ${pet.name}`} open={open} onCancel={onClose} footer={null}>
    <p className="share-note">فقط مالک پرونده می‌تواند دسترسی دیگران را اضافه، محدود یا حذف کند. شماره موردنظر باید قبلاً ثبت‌نام کرده باشد.</p>
    <Form form={form} layout="vertical" onFinish={submit} initialValues={{ accessLevel: "view" }}>
      <Form.Item name="phone" label="شماره موبایل عضو خانواده" rules={[{ required: true, pattern: /^(\+98|0)?9\d{9}$/, message: "شماره معتبر وارد کنید" }]}><Input dir="ltr" placeholder="0912 123 4567" /></Form.Item>
      <Form.Item name="accessLevel" label="سطح دسترسی">
        <Radio.Group className="access-levels">
          <Radio value="view"><EyeOutlined /><span><b>فقط مشاهده</b><small>دیدن پرونده و مدارک، بدون امکان تغییر</small></span></Radio>
          <Radio value="edit"><FormOutlined /><span><b>مشاهده و ثبت اطلاعات</b><small>مشاهده پرونده و افزودن رویداد، سند و هزینه</small></span></Radio>
        </Radio.Group>
      </Form.Item>
      <Button block type="primary" htmlType="submit" loading={busy}>ثبت یا تغییر دسترسی</Button>
    </Form>
  </Modal>;
}
