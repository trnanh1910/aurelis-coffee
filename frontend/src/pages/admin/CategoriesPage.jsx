import { Button, Drawer, Form, Input, InputNumber, Select, message } from 'antd';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../api/axiosClient';
import { categoryDescriptionLabel, categoryLabel, statusLabel } from '../../utils/viLabels';
export default function CategoriesPage() {
  const [items, setItems] = useState([]),
    [open, setOpen] = useState(false),
    [editing, setEditing] = useState(null),
    [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const load = () => api.get('/categories').then((r) => setItems(r.data.data));
  useEffect(() => {
    load();
  }, []);
  const startAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: 'ACTIVE', displayOrder: items.length + 1 });
    setOpen(true);
  };
  const startEdit = (x) => {
    setEditing(x);
    form.setFieldsValue({
      name: x.name,
      description: x.description,
      displayOrder: x.display_order,
      status: x.status,
    });
    setOpen(true);
  };
  const save = async () => {
    try {
      const v = await form.validateFields();
      setLoading(true);
      if (editing) await api.put(`/categories/${editing.id}`, v);
      else await api.post('/categories', v);
      message.success(editing ? 'Cập nhật danh mục thành công' : 'Tạo danh mục thành công');
      setOpen(false);
      load();
    } catch (e) {
      if (!e?.errorFields) message.error(e.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setLoading(false);
    }
  };
  const remove = async (x) => {
    try {
      await api.delete(`/categories/${x.id}`);
      message.success('Xóa danh mục thành công');
      load();
    } catch (e) {
      message.error(e.response?.data?.message || 'Không thể xóa danh mục');
    }
  };
  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="brand-display text-3xl text-espresso">Danh mục món</h1>
          <p className="mt-1 text-sm text-charcoal/50">Tổ chức cấu trúc thực đơn Aurelis.</p>
        </div>
        <button
          onClick={startAdd}
          className="flex items-center gap-2 rounded-xl bg-espresso px-4 py-3 text-sm font-semibold text-white"
        >
          <Plus size={17} />
          Thêm danh mục
        </button>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((x) => (
          <article key={x.id} className="premium-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-[.18em] text-gold">
                  Thứ tự {x.display_order}
                </div>
                <h2 className="brand-display mt-2 text-2xl text-espresso">
                  {categoryLabel(x.name)}
                </h2>
              </div>
              <span className="rounded-full bg-cream px-2.5 py-1 text-xs">
                {statusLabel(x.status)}
              </span>
            </div>
            <p className="mt-3 min-h-12 text-sm leading-6 text-charcoal/55">
              {x.description ? categoryDescriptionLabel(x.description) : 'Chưa có mô tả.'}
            </p>
            <div className="mt-5 flex gap-2 border-t border-black/5 pt-4">
              <button
                onClick={() => startEdit(x)}
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold"
              >
                <Pencil size={14} />
                Sửa
              </button>
              <button
                onClick={() => remove(x)}
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold text-red-600"
              >
                <Trash2 size={14} />
                Xóa
              </button>
            </div>
          </article>
        ))}
      </div>
      <Drawer
        title={editing ? 'Sửa danh mục' : 'Thêm danh mục'}
        width={480}
        open={open}
        onClose={() => setOpen(false)}
        extra={
          <Button type="primary" loading={loading} onClick={save}>
            Lưu
          </Button>
        }
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="displayOrder" label="Thứ tự hiển thị">
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Select
              options={[
                { value: 'ACTIVE', label: 'Hoạt động' },
                { value: 'INACTIVE', label: 'Ngừng hoạt động' },
              ]}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
