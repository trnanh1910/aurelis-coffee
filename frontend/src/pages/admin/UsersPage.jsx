import { Form, Input, Modal, Select, Table, Tag, message } from 'antd';
import { Pencil, Plus, Search, ShieldCheck, Trash2, UserRoundCog } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import api from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

const roleLabels = {
  ADMIN: 'Quản trị viên',
  MANAGER: 'Quản lý',
  CASHIER: 'Thu ngân',
  BARISTA: 'Pha chế',
  CUSTOMER: 'Khách hàng',
};
const statusLabels = {
  ACTIVE: ['Đang hoạt động', 'green'],
  INACTIVE: ['Ngưng hoạt động', 'default'],
  LOCKED: ['Đã khóa', 'red'],
  DELETED: ['Đã xóa', 'default'],
};

export default function UsersPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [branches, setBranches] = useState([]);
  const [form] = Form.useForm();
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users', {
        params: { page, limit: 12, search, status: status || undefined },
      });
      setRows(data.data || []);
      setPagination(data.pagination || {});
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);
  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);
  useEffect(() => {
    api
      .get('/branches')
      .then(({ data }) =>
        setBranches((data.data || []).filter((branch) => branch.status === 'ACTIVE')),
      )
      .catch(() => setBranches([]));
  }, []);

  const changeStatus = async (record, nextStatus) => {
    try {
      await api.patch(`/admin/users/${record.id}/status`, { status: nextStatus });
      message.success('Đã cập nhật trạng thái tài khoản');
      load();
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể cập nhật tài khoản');
    }
  };
  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      username: record.username,
      email: record.email,
      fullName: record.full_name,
      phone: record.phone || '',
    });
  };
  const openCreate = () => {
    form.resetFields();
    form.setFieldsValue({ role: 'CUSTOMER' });
    setEditing({ id: null });
  };
  const saveEdit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editing.id) {
        await api.put(`/admin/users/${editing.id}`, values);
        message.success('Đã lưu thông tin người dùng');
      } else {
        await api.post('/admin/users', values);
        message.success('Đã tạo tài khoản người dùng');
      }
      setEditing(null);
      load();
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể lưu thông tin');
    } finally {
      setSaving(false);
    }
  };
  const deleteUser = (record) =>
    Modal.confirm({
      title: `Xóa tài khoản ${record.username}?`,
      content:
        'Tài khoản sẽ bị vô hiệu hóa và hồ sơ sẽ được giữ lại để bảo toàn lịch sử đơn hàng. Thao tác này không thể hoàn tác tại màn hình này.',
      okText: 'Xóa tài khoản',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          await api.delete(`/admin/users/${record.id}`);
          message.success('Đã xóa tài khoản');
          load();
        } catch (error) {
          message.error(error.response?.data?.message || 'Không thể xóa tài khoản');
          throw error;
        }
      },
    });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-[#9a7b53]">
            <ShieldCheck size={15} /> Quản trị hệ thống
          </div>
          <h1 className="brand-display text-3xl text-espresso">Quản lý người dùng</h1>
          <p className="mt-1 text-sm text-charcoal/50">
            Tra cứu tài khoản và kiểm soát trạng thái truy cập.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm text-charcoal/60 shadow-sm">
            <UserRoundCog size={17} />
            {pagination.total || 0} tài khoản
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-espresso px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#49382c]"
          >
            <Plus size={16} /> Thêm người dùng
          </button>
        </div>
      </div>
      <div className="premium-card mt-6 p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_210px]">
          <Input
            prefix={<Search size={16} />}
            allowClear
            placeholder="Tìm tên, username hoặc email"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          <Select
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'Tất cả trạng thái' },
              { value: 'ACTIVE', label: 'Đang hoạt động' },
              { value: 'INACTIVE', label: 'Ngưng hoạt động' },
              { value: 'LOCKED', label: 'Đã khóa' },
              { value: 'DELETED', label: 'Đã xóa' },
            ]}
          />
        </div>
        <Table
          className="users-table mt-4"
          rowKey="id"
          loading={loading}
          dataSource={rows}
          tableLayout="fixed"
          pagination={{
            current: page,
            pageSize: 12,
            total: pagination.total || 0,
            onChange: setPage,
            showSizeChanger: false,
          }}
          locale={{ emptyText: 'Không tìm thấy tài khoản phù hợp' }}
          columns={[
            {
              title: 'Người dùng',
              width: '18%',
              render: (_, row) => (
                <div className="min-w-0">
                  <b className="block truncate">{row.full_name}</b>
                  <div className="truncate text-xs text-charcoal/45">@{row.username}</div>
                </div>
              ),
            },
            {
              title: 'Thông tin liên hệ',
              width: '25%',
              ellipsis: true,
              render: (_, row) => (
                <div className="min-w-0">
                  <div className="truncate" title={row.email}>
                    {row.email}
                  </div>
                  <div className="truncate text-xs text-charcoal/45">{row.phone || '—'}</div>
                </div>
              ),
            },
            {
              title: 'Vai trò',
              width: '14%',
              render: (_, row) => (
                <Tag
                  color={
                    row.role === 'ADMIN' ? 'purple' : row.role === 'MANAGER' ? 'blue' : 'default'
                  }
                >
                  {roleLabels[row.role] || row.role}
                </Tag>
              ),
            },
            {
              title: 'Đăng nhập gần nhất',
              width: '21%',
              ellipsis: true,
              dataIndex: 'last_login',
              render: (value) =>
                value
                  ? new Date(value).toLocaleString('vi-VN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })
                  : 'Chưa đăng nhập',
            },
            {
              title: 'Thao tác',
              width: '22%',
              render: (_, row) =>
                row.status === 'DELETED' ? (
                  <span className="text-xs text-charcoal/35">Đã xóa</span>
                ) : (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Select
                      size="small"
                      value={row.status}
                      disabled={Number(row.id) === Number(user?.id)}
                      title={
                        Number(row.id) === Number(user?.id)
                          ? 'Không thể đổi trạng thái tài khoản đang đăng nhập'
                          : undefined
                      }
                      style={{ width: 122 }}
                      onChange={(value) => changeStatus(row, value)}
                      options={[
                        { value: 'ACTIVE', label: 'Đang hoạt động' },
                        { value: 'INACTIVE', label: 'Ngưng hoạt động' },
                        { value: 'LOCKED', label: 'Khóa tài khoản' },
                      ]}
                    />
                    <button
                      className="rounded-lg border border-black/10 p-1.5 text-charcoal/60 hover:bg-black/5 disabled:opacity-30"
                      aria-label={`Sửa ${row.username}`}
                      disabled={Number(row.id) === Number(user?.id)}
                      onClick={() => openEdit(row)}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-30"
                      aria-label={`Xóa ${row.username}`}
                      disabled={Number(row.id) === Number(user?.id)}
                      onClick={() => deleteUser(row)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ),
            },
          ]}
        />
      </div>
      <Modal
        title={editing?.id ? 'Chỉnh sửa người dùng' : 'Thêm người dùng'}
        open={Boolean(editing)}
        onCancel={() => setEditing(null)}
        onOk={saveEdit}
        okText={editing?.id ? 'Lưu thay đổi' : 'Tạo tài khoản'}
        cancelText="Hủy"
        confirmLoading={saving}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-5">
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[
              { required: true, min: 2, max: 120, message: 'Nhập họ tên từ 2 đến 120 ký tự' },
            ]}
          >
            <Input maxLength={120} />
          </Form.Item>
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[
              {
                required: true,
                pattern: /^[a-zA-Z0-9_.-]{3,80}$/,
                message: 'Dùng 3–80 ký tự chữ, số, dấu chấm, gạch ngang hoặc gạch dưới',
              },
            ]}
          >
            <Input maxLength={80} />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email', max: 150, message: 'Nhập email hợp lệ' }]}
          >
            <Input maxLength={150} />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại">
            <Input maxLength={30} />
          </Form.Item>
          {editing && !editing.id ? (
            <>
              <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'CUSTOMER', label: 'Khách hàng' },
                    { value: 'BARISTA', label: 'Pha chế' },
                    { value: 'CASHIER', label: 'Thu ngân' },
                    { value: 'MANAGER', label: 'Quản lý' },
                    { value: 'ADMIN', label: 'Quản trị viên' },
                  ]}
                />
              </Form.Item>
              <Form.Item noStyle shouldUpdate={(prev, next) => prev.role !== next.role}>
                {({ getFieldValue }) =>
                  getFieldValue('role') !== 'CUSTOMER' ? (
                    <Form.Item
                      name="branchId"
                      label="Chi nhánh"
                      rules={[{ required: true, message: 'Chọn chi nhánh cho nhân viên' }]}
                    >
                      <Select
                        placeholder="Chọn chi nhánh"
                        options={branches.map((branch) => ({
                          value: branch.id,
                          label: branch.name,
                        }))}
                      />
                    </Form.Item>
                  ) : null
                }
              </Form.Item>
              <Form.Item
                name="password"
                label="Mật khẩu tạm thời"
                rules={[
                  { required: true, min: 8, max: 100, message: 'Mật khẩu cần từ 8 đến 100 ký tự' },
                ]}
              >
                <Input.Password maxLength={100} />
              </Form.Item>
            </>
          ) : (
            <p className="text-xs text-charcoal/45">
              Vai trò không chỉnh sửa tại đây để tránh làm sai liên kết hồ sơ nhân viên và quyền
              truy cập.
            </p>
          )}
        </Form>
      </Modal>
    </div>
  );
}
