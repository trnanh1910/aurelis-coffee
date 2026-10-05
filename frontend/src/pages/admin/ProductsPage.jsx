import {
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Switch,
  Upload,
  message,
} from 'antd';
import { Pencil, Plus, Search, Trash2, UploadCloud } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../services/productService';
import { categoryLabel, productLabel, statusLabel } from '../../utils/viLabels';
const money = (v) => new Intl.NumberFormat('vi-VN').format(Number(v || 0)) + ' ₫';
export default function ProductsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]),
    [cats, setCats] = useState([]),
    [meta, setMeta] = useState({}),
    [search, setSearch] = useState(''),
    [category, setCategory] = useState(''),
    [page, setPage] = useState(1),
    [open, setOpen] = useState(false),
    [editing, setEditing] = useState(null),
    [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const load = () =>
    productService.list({ page, limit: 8, search, category: category || undefined }).then((r) => {
      setItems(r.data);
      setMeta(r.pagination);
    });
  useEffect(() => {
    api.get('/categories').then((r) => setCats(r.data.data));
  }, []);
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [page, search, category]);
  const startCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: 'ACTIVE', isFeatured: false, isBestseller: false });
    setOpen(true);
  };
  const startEdit = async (product) => {
    try {
      const p = await productService.detail(product.id);
      setEditing(p);
      form.setFieldsValue({
        productCode: p.product_code,
        name: p.name,
        categoryId: p.category_id,
        basePrice: Number(p.base_price),
        description: p.description,
        status: p.status,
        isFeatured: Boolean(p.is_featured),
        isBestseller: Boolean(p.is_bestseller),
      });
      setOpen(true);
    } catch (e) {
      message.error(e.response?.data?.message || 'Không thể tải sản phẩm');
    }
  };
  const remove = async (product) => {
    try {
      await productService.remove(product.id);
      message.success('Đã ngừng kinh doanh sản phẩm');
      load();
    } catch (e) {
      message.error(e.response?.data?.message || 'Không thể ngừng kinh doanh sản phẩm');
    }
  };
  const submit = async () => {
    try {
      const v = await form.validateFields();
      setLoading(true);
      const fd = new FormData();
      Object.entries(v).forEach(([k, val]) => {
        if (k !== 'imageFile' && val !== undefined && val !== null) fd.append(k, val);
      });
      const file = v.imageFile?.fileList?.[0]?.originFileObj;
      if (file) fd.append('imageFile', file);
      if (editing) await productService.update(editing.id, fd);
      else await productService.create(fd);
      message.success(editing ? 'Cập nhật sản phẩm thành công' : 'Tạo sản phẩm thành công');
      form.resetFields();
      setOpen(false);
      load();
    } catch (e) {
      if (!e?.errorFields) message.error(e.response?.data?.message || 'Không thể tạo sản phẩm');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="brand-display text-3xl text-espresso">Sản phẩm</h1>
          <p className="mt-1 text-sm text-charcoal/50">
            Quản lý thực đơn và tình trạng kinh doanh của từng món.
          </p>
        </div>
        <button
          onClick={startCreate}
          className="flex items-center justify-center gap-2 rounded-xl bg-espresso px-4 py-3 text-sm font-semibold text-white"
        >
          <Plus size={17} />
          Thêm sản phẩm
        </button>
      </div>
      <div className="premium-card mt-6 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <label className="flex items-center gap-2 rounded-xl bg-[#f7f4ef] px-4">
            <Search size={17} />
            <input
              className="w-full bg-transparent py-3 outline-none"
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </label>
          <select
            className="rounded-xl border border-black/10 px-4"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả danh mục</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {categoryLabel(c.name)}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-y border-black/5 bg-[#faf8f4] text-xs uppercase tracking-wide text-charcoal/45">
              <tr>
                <th className="p-4">Sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Trạng thái</th>
                <th>Nổi bật</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b border-black/5">
                  <td className="p-4">
                    <div className="font-semibold text-espresso">{productLabel(p.name)}</div>
                    <div className="text-xs text-charcoal/40">{p.product_code}</div>
                  </td>
                  <td>{categoryLabel(p.category_name)}</td>
                  <td>{money(p.base_price)}</td>
                  <td>{statusLabel(p.status)}</td>
                  <td>{p.is_featured ? 'Có' : 'Không'}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Button
                        type="text"
                        aria-label="Sửa sản phẩm"
                        icon={<Pencil size={15} />}
                        onClick={() => startEdit(p)}
                      />
                      {user?.role === 'ADMIN' && (
                        <Popconfirm
                          title="Ngừng kinh doanh sản phẩm này?"
                          onConfirm={() => remove(p)}
                          okText="Ngừng kinh doanh"
                          cancelText="Hủy"
                        >
                          <Button
                            danger
                            type="text"
                            aria-label="Ngừng kinh doanh"
                            icon={<Trash2 size={15} />}
                          />
                        </Popconfirm>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-charcoal/55">
          <span>{meta.total || 0} sản phẩm</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((x) => x - 1)}
              className="rounded-lg border px-3 py-1.5 disabled:opacity-30"
            >
              Trước
            </button>
            <span className="px-2 py-1.5">
              {page} / {meta.totalPages || 1}
            </span>
            <button
              disabled={page >= Number(meta.totalPages || 1)}
              onClick={() => setPage((x) => x + 1)}
              className="rounded-lg border px-3 py-1.5 disabled:opacity-30"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
      <Drawer
        title={editing ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
        width={520}
        open={open}
        onClose={() => setOpen(false)}
        extra={
          <Button loading={loading} type="primary" onClick={submit}>
            Lưu
          </Button>
        }
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={{ status: 'ACTIVE', isFeatured: false, isBestseller: false }}
        >
          <Form.Item
            name="productCode"
            label="Mã sản phẩm"
            rules={[{ required: true, message: 'Vui lòng nhập mã sản phẩm' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="categoryId"
            label="Danh mục"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
          >
            <Select options={cats.map((c) => ({ value: c.id, label: categoryLabel(c.name) }))} />
          </Form.Item>
          <Form.Item
            name="basePrice"
            label="Giá cơ bản"
            rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
          >
            <InputNumber className="w-full" min={0} step={1000} />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Select
              options={[
                { value: 'ACTIVE', label: 'Hoạt động' },
                { value: 'INACTIVE', label: 'Ngừng hoạt động' },
                { value: 'OUT_OF_STOCK', label: 'Hết hàng' },
              ]}
            />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="isFeatured" label="Sản phẩm nổi bật" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="isBestseller" label="Bán chạy" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>
          <Form.Item name="imageFile" label="Hình ảnh">
            <Upload
              maxCount={1}
              beforeUpload={() => false}
              accept="image/png,image/jpeg,image/webp"
            >
              <Button icon={<UploadCloud size={16} />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
