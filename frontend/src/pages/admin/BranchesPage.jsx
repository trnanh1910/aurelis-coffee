import { Button, Drawer, Form, Input, Select, Upload, message } from 'antd';
import { Clock3, MapPin, Phone, Plus, RefreshCw, Search, Store, UploadCloud } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { branchService } from '../../services/branchService';
import { statusLabel } from '../../utils/viLabels';

const assetUrl = (path) =>
  path ? new URL(path, import.meta.env.VITE_ASSET_URL || 'http://localhost:5000').href : '';
const uploadFileList = (event) => (Array.isArray(event) ? event : event?.fileList || []);

export default function BranchesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]),
    [open, setOpen] = useState(false),
    [editing, setEditing] = useState(null),
    [search, setSearch] = useState(''),
    [statusFilter, setStatusFilter] = useState(''),
    [refreshing, setRefreshing] = useState(false),
    [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const load = () => {
    setRefreshing(true);
    branchService
      .list()
      .then(setItems)
      .catch((e) => message.error(e.response?.data?.message || 'Không thể tải danh sách chi nhánh'))
      .finally(() => setRefreshing(false));
  };
  useEffect(load, []);
  const showForm = (item = null) => {
    setEditing(item);
    form.resetFields();
    form.setFieldsValue(
      item
        ? {
            branchCode: item.branch_code,
            name: item.name,
            address: item.address,
            phone: item.phone,
            email: item.email,
            openingTime: item.opening_time,
            closingTime: item.closing_time,
            status: item.status,
            imageFile: item.image
              ? [
                  {
                    uid: '-1',
                    name: 'Ảnh quán hiện tại',
                    status: 'done',
                    url: assetUrl(item.image),
                  },
                ]
              : [],
          }
        : { openingTime: '07:00:00', closingTime: '23:00:00', status: 'ACTIVE' },
    );
    setOpen(true);
  };
  const visibleItems = items.filter(
    (b) =>
      (!statusFilter || b.status === statusFilter) &&
      (!search ||
        `${b.name} ${b.branch_code} ${b.address}`
          .toLocaleLowerCase('vi')
          .includes(search.toLocaleLowerCase('vi'))),
  );
  const save = async () => {
    try {
      const v = await form.validateFields();
      setLoading(true);
      const payload = new FormData();
      Object.entries(v).forEach(([key, value]) => {
        if (key !== 'imageFile' && value !== undefined && value !== null)
          payload.append(key, value);
      });
      const image = v.imageFile?.find((file) => file.originFileObj)?.originFileObj;
      if (image) payload.append('imageFile', image);
      editing
        ? await branchService.update(editing.id, payload)
        : await branchService.create(payload);
      message.success(editing ? 'Cập nhật chi nhánh thành công' : 'Tạo chi nhánh thành công');
      setOpen(false);
      form.resetFields();
      setEditing(null);
      load();
    } catch (e) {
      if (!e?.errorFields) message.error(e.response?.data?.message || 'Không thể lưu chi nhánh');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="brand-display text-3xl text-espresso">Chi nhánh</h1>
          <p className="mt-1 text-sm text-charcoal/50">
            Quản lý mạng lưới cửa hàng Aurelis và thông tin vận hành.
          </p>
        </div>
        {user?.role === 'ADMIN' && (
          <button
            onClick={() => showForm()}
            className="flex items-center justify-center gap-2 rounded-xl bg-espresso px-4 py-3 text-sm font-semibold text-white"
          >
            <Plus size={17} />
            Thêm chi nhánh
          </button>
        )}
      </div>
      <div className="premium-card mt-6 grid gap-3 p-4 md:grid-cols-[1fr_200px_auto]">
        <Input
          prefix={<Search size={16} />}
          allowClear
          placeholder="Tìm tên, mã hoặc địa chỉ"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={statusFilter || undefined}
          allowClear
          placeholder="Tất cả trạng thái"
          onChange={(v) => setStatusFilter(v || '')}
          options={[
            { value: 'ACTIVE', label: 'Đang hoạt động' },
            { value: 'INACTIVE', label: 'Ngừng hoạt động' },
          ]}
        />
        <Button icon={<RefreshCw size={15} />} loading={refreshing} onClick={load}>
          Làm mới
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-sm text-charcoal/60">
        <span>{items.length} chi nhánh</span>
        <span>·</span>
        <span>{items.filter((b) => b.status === 'ACTIVE').length} đang hoạt động</span>
        <span>·</span>
        <span>
          {items.reduce((total, b) => total + Number(b.table_count || 0), 0)} bàn toàn hệ thống
        </span>
      </div>
      <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visibleItems.map((b) => (
          <button
            key={b.id}
            onClick={() => user?.role === 'ADMIN' && showForm(b)}
            className="premium-card overflow-hidden text-left transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <div className="relative h-36 overflow-hidden bg-gradient-to-br from-[#2b1e1a] to-[#6a493a] p-5 text-white">
              {b.image && (
                <img
                  src={assetUrl(b.image)}
                  alt={`Ảnh ${b.name}`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/10" />
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[.18em] text-white/55">
                    {b.branch_code}
                  </div>
                  <div className="brand-display mt-1 text-2xl">{b.name}</div>
                </div>
                <Store size={24} className="text-[#dfbb83]" />
              </div>
            </div>
            <div className="space-y-3 p-5 text-sm">
              <div className="flex gap-3">
                <MapPin size={17} className="mt-0.5 shrink-0 text-coffee" />
                <span>{b.address}</span>
              </div>
              <div className="flex gap-3">
                <Phone size={17} className="text-coffee" />
                <span>{b.phone || '—'}</span>
              </div>
              <div className="flex gap-3">
                <Clock3 size={17} className="text-coffee" />
                <span>
                  {String(b.opening_time).slice(0, 5)} – {String(b.closing_time).slice(0, 5)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-black/5 pt-3">
                <span>
                  {b.table_count || 0} bàn · {b.employee_count || 0} nhân viên
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${b.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-stone-100 text-stone-500'}`}
                >
                  {statusLabel(b.status)}
                </span>
              </div>
            </div>
          </button>
        ))}
        {!refreshing && !visibleItems.length && (
          <div className="premium-card p-8 text-center text-sm text-charcoal/50 md:col-span-2 xl:col-span-3">
            Không tìm thấy chi nhánh phù hợp.
          </div>
        )}
      </div>
      <Drawer
        title={editing ? 'Sửa chi nhánh' : 'Thêm chi nhánh'}
        width={520}
        open={open}
        onClose={() => setOpen(false)}
        extra={
          <Button type="primary" loading={loading} onClick={save}>
            Lưu
          </Button>
        }
      >
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="branchCode"
              label="Mã chi nhánh"
              rules={[{ required: true, message: 'Vui lòng nhập mã chi nhánh' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="status" label="Trạng thái">
              <Select
                options={[
                  { value: 'ACTIVE', label: 'Hoạt động' },
                  { value: 'INACTIVE', label: 'Ngừng hoạt động' },
                ]}
              />
            </Form.Item>
          </div>
          <Form.Item
            name="imageFile"
            label="Ảnh quán"
            valuePropName="fileList"
            getValueFromEvent={uploadFileList}
          >
            <Upload
              listType="picture-card"
              maxCount={1}
              accept="image/jpeg,image/png,image/webp"
              beforeUpload={() => false}
            >
              <div className="flex flex-col items-center gap-1 text-xs">
                <UploadCloud size={18} />
                <span>Chọn ảnh</span>
              </div>
            </Upload>
          </Form.Item>
          <p className="-mt-5 mb-4 text-xs text-charcoal/45">
            Ảnh JPG, PNG hoặc WEBP, tối đa 5 MB.
          </p>
          <Form.Item
            name="name"
            label="Tên chi nhánh"
            rules={[{ required: true, message: 'Vui lòng nhập tên chi nhánh' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="phone" label="Số điện thoại">
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email">
              <Input />
            </Form.Item>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="openingTime" label="Giờ mở cửa">
              <Input placeholder="07:00:00" />
            </Form.Item>
            <Form.Item name="closingTime" label="Giờ đóng cửa">
              <Input placeholder="23:00:00" />
            </Form.Item>
          </div>
        </Form>
      </Drawer>
    </div>
  );
}
