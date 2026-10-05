import { Button, Form, Input, InputNumber, Modal, Select, Table, Tag, message } from 'antd';
import { useEffect, useState } from 'react';
import api from '../../api/axiosClient';
import { Plus } from 'lucide-react';

export default function InventoryPage() {
  const [data, setData] = useState({ ingredients: [], suppliers: [], transactions: [] }),
    [loading, setLoading] = useState(true),
    [open, setOpen] = useState(false),
    [ingredientOpen, setIngredientOpen] = useState(false),
    [saving, setSaving] = useState(false);
  const [form] = Form.useForm(),
    [ingredientForm] = Form.useForm();
  const load = () =>
    api
      .get('/admin/inventory')
      .then((r) => setData(r.data.data))
      .catch((e) => message.error(e.response?.data?.message || 'Không thể tải tồn kho'))
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, []);
  const receive = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await api.post('/admin/inventory/receive', values);
      message.success('Đã cập nhật số lượng tồn kho');
      form.resetFields();
      setOpen(false);
      setLoading(true);
      load();
    } catch (e) {
      if (!e.errorFields) message.error(e.response?.data?.message || 'Không thể nhập kho');
    } finally {
      setSaving(false);
    }
  };
  const addIngredient = async () => {
    try {
      const values = await ingredientForm.validateFields();
      setSaving(true);
      await api.post('/admin/inventory/ingredients', values);
      message.success('Đã thêm nguyên liệu');
      ingredientForm.resetFields();
      setIngredientOpen(false);
      setLoading(true);
      load();
    } catch (e) {
      if (!e.errorFields) message.error(e.response?.data?.message || 'Không thể thêm nguyên liệu');
    } finally {
      setSaving(false);
    }
  };
  const low = data.ingredients.filter(
    (x) => Number(x.current_quantity) <= Number(x.minimum_stock),
  ).length;
  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="brand-display text-3xl text-espresso">Kho nguyên liệu</h1>
          <p className="mt-1 text-sm text-charcoal/50">Theo dõi tồn kho và lịch sử nhập hàng.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button icon={<Plus size={16} />} onClick={() => setIngredientOpen(true)}>
            Thêm nguyên liệu
          </Button>
          <Button type="primary" icon={<Plus size={16} />} onClick={() => setOpen(true)}>
            Ghi nhận nhập kho
          </Button>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="premium-card p-5">
          <div className="text-sm text-charcoal/50">Nguyên liệu hoạt động</div>
          <strong className="mt-2 block text-2xl">{data.ingredients.length}</strong>
        </div>
        <div className="premium-card p-5">
          <div className="text-sm text-charcoal/50">Cần bổ sung</div>
          <strong className="mt-2 block text-2xl text-amber-700">{low}</strong>
        </div>
        <div className="premium-card p-5">
          <div className="text-sm text-charcoal/50">Giao dịch gần đây</div>
          <strong className="mt-2 block text-2xl">{data.transactions.length}</strong>
        </div>
      </div>
      <div className="premium-card mt-5 p-4">
        <h2 className="mb-3 font-semibold">Tồn kho hiện tại</h2>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={data.ingredients}
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: 'Chưa có dữ liệu nguyên liệu' }}
          columns={[
            { title: 'Mã', dataIndex: 'id' },
            { title: 'Nguyên liệu', dataIndex: 'name' },
            { title: 'Nhà cung cấp', dataIndex: 'supplier_name', render: (v) => v || '—' },
            {
              title: 'Tồn hiện tại',
              render: (_, x) => (
                <b>
                  {Number(x.current_quantity)} {x.unit}
                </b>
              ),
            },
            { title: 'Mức tối thiểu', render: (_, x) => `${Number(x.minimum_stock)} ${x.unit}` },
            {
              title: 'Cảnh báo',
              render: (_, x) =>
                Number(x.current_quantity) <= Number(x.minimum_stock) ? (
                  <Tag color="warning">Sắp hết</Tag>
                ) : (
                  <Tag color="success">Đủ hàng</Tag>
                ),
            },
          ]}
        />
      </div>
      <div className="premium-card mt-5 p-4">
        <h2 className="mb-3 font-semibold">Giao dịch gần đây</h2>
        <Table
          rowKey="id"
          dataSource={data.transactions}
          pagination={false}
          locale={{ emptyText: 'Chưa có giao dịch kho' }}
          columns={[
            {
              title: 'Thời gian',
              dataIndex: 'created_at',
              render: (v) => new Date(v).toLocaleString('vi-VN'),
            },
            { title: 'Nguyên liệu', dataIndex: 'ingredient_name' },
            {
              title: 'Loại',
              dataIndex: 'transaction_type',
              render: (v) => (v === 'IN' ? 'Nhập kho' : v === 'OUT' ? 'Xuất kho' : 'Điều chỉnh'),
            },
            { title: 'Số lượng', render: (_, x) => `${Number(x.quantity)} ${x.unit}` },
            { title: 'Nhà cung cấp', dataIndex: 'supplier_name', render: (v) => v || '—' },
            { title: 'Ghi chú', dataIndex: 'note', render: (v) => v || '—' },
          ]}
        />
      </div>
      <Modal
        title="Ghi nhận nhập kho"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={receive}
        confirmLoading={saving}
        okText="Lưu phiếu nhập"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="ingredientId"
            label="Nguyên liệu"
            rules={[{ required: true, message: 'Vui lòng chọn nguyên liệu' }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              options={data.ingredients.map((x) => ({
                value: x.id,
                label: `${x.name} · ${x.current_quantity} ${x.unit}`,
              }))}
              placeholder="Chọn nguyên liệu"
            />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Số lượng nhập"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
          >
            <InputNumber min={0.001} step={0.1} className="w-full" />
          </Form.Item>
          <Form.Item name="supplierId" label="Nhà cung cấp" rules={[]}>
            <Select
              allowClear
              options={data.suppliers.map((x) => ({ value: x.id, label: x.name }))}
              placeholder="Theo nhà cung cấp mặc định"
            />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú">
            <Input maxLength={255} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Thêm nguyên liệu"
        open={ingredientOpen}
        onCancel={() => setIngredientOpen(false)}
        onOk={addIngredient}
        confirmLoading={saving}
        okText="Thêm nguyên liệu"
        cancelText="Hủy"
      >
        <Form form={ingredientForm} layout="vertical">
          <Form.Item
            name="name"
            label="Tên nguyên liệu"
            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
          >
            <Input maxLength={120} />
          </Form.Item>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="unit"
              label="Đơn vị"
              rules={[{ required: true, message: 'Vui lòng nhập đơn vị' }]}
            >
              <Input maxLength={30} placeholder="kg, lít, gói" />
            </Form.Item>
            <Form.Item name="minimumStock" label="Mức tồn tối thiểu" initialValue={0}>
              <InputNumber min={0} step={0.1} className="w-full" />
            </Form.Item>
          </div>
          <Form.Item name="supplierId" label="Nhà cung cấp">
            <Select
              allowClear
              options={data.suppliers.map((x) => ({ value: x.id, label: x.name }))}
              placeholder="Chọn nhà cung cấp"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
