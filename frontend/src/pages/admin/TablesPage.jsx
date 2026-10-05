import { Button, Drawer, Form, Input, InputNumber, Select, message } from 'antd';
import { Armchair, Plus, RefreshCw, Sparkles, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { branchService } from '../../services/branchService';
import { tableService } from '../../services/tableService';
import { useAuth } from '../../context/AuthContext';
import { areaLabel, statusLabel } from '../../utils/viLabels';

const styles = {
  AVAILABLE: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  OCCUPIED: 'bg-rose-50 border-rose-200 text-rose-800',
  RESERVED: 'bg-amber-50 border-amber-200 text-amber-800',
  CLEANING: 'bg-sky-50 border-sky-200 text-sky-800',
};
export default function TablesPage() {
  const { user } = useAuth();
  const [branches, setBranches] = useState([]),
    [branch, setBranch] = useState(''),
    [items, setItems] = useState([]),
    [filterStatus, setFilterStatus] = useState(''),
    [refreshing, setRefreshing] = useState(false),
    [open, setOpen] = useState(false),
    [editing, setEditing] = useState(null),
    [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  useEffect(() => {
    branchService.list().then((x) => {
      setBranches(x);
      const scopedBranches =
        user?.role === 'MANAGER'
          ? x.filter(
              (branchItem) => Number(branchItem.id) === Number(user.branchId || user.branch_id),
            )
          : x;
      const activeBranch = scopedBranches.find((branchItem) => branchItem.status === 'ACTIVE');
      if (activeBranch) setBranch(String(activeBranch.id));
    });
  }, [user]);
  const availableBranches =
    user?.role === 'MANAGER'
      ? branches.filter(
          (branchItem) => Number(branchItem.id) === Number(user.branchId || user.branch_id),
        )
      : branches;
  const load = () => {
    if (!branch) return;
    setRefreshing(true);
    tableService
      .list({ branchId: branch })
      .then(setItems)
      .catch((e) => message.error(e.response?.data?.message || 'Không thể tải danh sách bàn'))
      .finally(() => setRefreshing(false));
  };
  useEffect(load, [branch]);
  const visibleItems = useMemo(
    () => items.filter((x) => !filterStatus || x.status === filterStatus),
    [items, filterStatus],
  );
  const areas = useMemo(
    () => [...new Set(visibleItems.map((x) => x.area || 'Other'))],
    [visibleItems],
  );
  const showForm = (item) => {
    setEditing(item || null);
    form.setFieldsValue(
      item
        ? {
            branchId: item.branch_id,
            tableCode: item.table_code,
            area: item.area,
            capacity: item.capacity,
            status: item.status,
          }
        : { branchId: Number(branch), capacity: 4, status: 'AVAILABLE', area: 'Tầng 1' },
    );
    setOpen(true);
  };
  const save = async () => {
    try {
      const v = await form.validateFields();
      setLoading(true);
      editing ? await tableService.update(editing.id, v) : await tableService.create(v);
      message.success(editing ? 'Cập nhật bàn thành công' : 'Tạo bàn thành công');
      setOpen(false);
      load();
    } catch (e) {
      if (!e?.errorFields) message.error(e.response?.data?.message || 'Không thể lưu bàn');
    } finally {
      setLoading(false);
    }
  };
  const status = async (t, s) => {
    try {
      await tableService.changeStatus(t.id, s);
      message.success(`${t.table_code} → ${statusLabel(s)}`);
      load();
    } catch (e) {
      message.error(e.response?.data?.message || 'Không thể cập nhật trạng thái bàn');
    }
  };
  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="brand-display text-3xl text-espresso">Quản lý bàn</h1>
          <p className="mt-1 text-sm text-charcoal/50">
            Theo dõi trực quan trạng thái bàn phục vụ tại quán.
          </p>
        </div>
        <button
          onClick={() => showForm()}
          className="flex items-center justify-center gap-2 rounded-xl bg-espresso px-4 py-3 text-sm font-semibold text-white"
        >
          <Plus size={17} />
          Thêm bàn
        </button>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Select
          className="w-72"
          value={branch || undefined}
          onChange={setBranch}
          options={availableBranches
            .filter((b) => b.status === 'ACTIVE')
            .map((b) => ({ value: String(b.id), label: b.name }))}
        />
        <Button icon={<RefreshCw size={15} />} loading={refreshing} onClick={load}>
          Làm mới
        </Button>
        {Object.keys(styles).map((s) => (
          <span
            key={s}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${styles[s]}`}
          >
            {statusLabel(s)}
          </span>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.keys(styles).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
            className={`premium-card p-4 text-left transition ${filterStatus === s ? 'ring-2 ring-coffee' : ''}`}
          >
            <div className="text-xs text-charcoal/50">{statusLabel(s)}</div>
            <div className="mt-1 text-2xl font-semibold">
              {items.filter((x) => x.status === s).length}
            </div>
          </button>
        ))}
      </div>
      <div className="mt-3 flex justify-end">
        <Button type={filterStatus ? 'primary' : 'default'} onClick={() => setFilterStatus('')}>
          Tất cả bàn ({items.length})
        </Button>
      </div>
      {areas.map((area) => (
        <section key={area} className="mt-7">
          <div className="mb-3 flex items-center gap-2">
            <Armchair size={18} className="text-coffee" />
            <h2 className="font-semibold text-espresso">{areaLabel(area)}</h2>
            <span className="text-xs text-charcoal/40">
              {visibleItems.filter((x) => (x.area || 'Other') === area).length} bàn
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {visibleItems
              .filter((x) => (x.area || 'Other') === area)
              .map((t) => (
                <div key={t.id} className={`rounded-2xl border p-4 ${styles[t.status]}`}>
                  <button onClick={() => showForm(t)} className="w-full text-left">
                    <div className="flex items-start justify-between">
                      <div className="text-xl font-bold">{t.table_code}</div>
                      <Armchair size={21} />
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm">
                      <Users size={15} />
                      {t.capacity} chỗ
                    </div>
                    <div className="mt-2 text-[11px] font-bold tracking-[.12em]">
                      {statusLabel(t.status)}
                    </div>
                  </button>
                  <div className="mt-4 flex gap-2 border-t border-current/10 pt-3">
                    {t.status === 'CLEANING' && (
                      <button
                        onClick={() => status(t, 'AVAILABLE')}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-white/70 px-2 py-2 text-xs font-semibold"
                      >
                        <Sparkles size={13} />
                        Đã vệ sinh
                      </button>
                    )}
                    {t.status === 'AVAILABLE' && (
                      <button
                        onClick={() => status(t, 'RESERVED')}
                        className="flex-1 rounded-lg bg-white/70 px-2 py-2 text-xs font-semibold"
                      >
                        Đặt trước
                      </button>
                    )}
                    {t.status === 'RESERVED' && (
                      <button
                        onClick={() => status(t, 'AVAILABLE')}
                        className="flex-1 rounded-lg bg-white/70 px-2 py-2 text-xs font-semibold"
                      >
                        Hủy giữ bàn
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </section>
      ))}
      <Drawer
        title={editing ? 'Sửa bàn' : 'Thêm bàn'}
        width={420}
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
            name="branchId"
            label="Chi nhánh"
            rules={[{ required: true, message: 'Vui lòng chọn chi nhánh' }]}
          >
            <Select
              options={availableBranches
                .filter((b) => b.status === 'ACTIVE')
                .map((b) => ({ value: b.id, label: b.name }))}
            />
          </Form.Item>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="tableCode"
              label="Mã bàn"
              rules={[{ required: true, message: 'Vui lòng nhập mã bàn' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="capacity"
              label="Số chỗ"
              rules={[{ required: true, message: 'Vui lòng nhập số chỗ' }]}
            >
              <InputNumber min={1} max={20} className="w-full" />
            </Form.Item>
          </div>
          <Form.Item name="area" label="Khu vực">
            <Input placeholder="Ví dụ: Tầng 1" />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Select
              options={Object.keys(styles).map((s) => ({ value: s, label: statusLabel(s) }))}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
