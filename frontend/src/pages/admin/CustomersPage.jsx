import { Input, Table, Tag, message } from 'antd';
import { Search, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../api/axiosClient';

const money = (value) => new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + ' ₫';
const levels = { MEMBER: 'Thành viên', SILVER: 'Bạc', GOLD: 'Vàng', PLATINUM: 'Bạch kim' };
export default function CustomersPage() {
  const [rows, setRows] = useState([]),
    [page, setPage] = useState(1),
    [search, setSearch] = useState(''),
    [pagination, setPagination] = useState({}),
    [loading, setLoading] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true);
    const timer = setTimeout(
      () =>
        api
          .get('/admin/customers', { params: { page, limit: 12, search } })
          .then(({ data }) => {
            if (active) {
              setRows(data.data);
              setPagination(data.pagination);
            }
          })
          .catch((e) => message.error(e.response?.data?.message || 'Không thể tải khách hàng'))
          .finally(() => active && setLoading(false)),
      250,
    );
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [page, search]);
  return (
    <div>
      <h1 className="brand-display text-3xl text-espresso">Khách hàng</h1>
      <p className="mt-1 text-sm text-charcoal/50">
        Theo dõi thành viên, điểm thưởng và giá trị mua hàng.
      </p>
      <div className="premium-card mt-6 p-4">
        <Input
          prefix={<Search size={16} />}
          allowClear
          placeholder="Tìm tên, mã, số điện thoại hoặc email"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <Table
          className="mt-4"
          rowKey="id"
          loading={loading}
          dataSource={rows}
          pagination={{
            current: page,
            pageSize: 12,
            total: pagination.total || 0,
            onChange: setPage,
            showSizeChanger: false,
          }}
          locale={{ emptyText: 'Chưa có khách hàng phù hợp' }}
          columns={[
            {
              title: 'Khách hàng',
              render: (_, x) => (
                <div>
                  <b>{x.full_name}</b>
                  <div className="text-xs text-charcoal/45">{x.customer_code}</div>
                </div>
              ),
            },
            {
              title: 'Liên hệ',
              render: (_, x) => (
                <div>
                  {x.phone || '—'}
                  <div className="text-xs text-charcoal/45">{x.email || ''}</div>
                </div>
              ),
            },
            {
              title: 'Hạng',
              render: (_, x) => (
                <Tag
                  color={
                    x.membership_level === 'PLATINUM'
                      ? 'purple'
                      : x.membership_level === 'GOLD'
                        ? 'gold'
                        : 'default'
                  }
                >
                  {levels[x.membership_level] || x.membership_level}
                </Tag>
              ),
            },
            { title: 'Điểm', dataIndex: 'points', align: 'right' },
            { title: 'Đơn hoàn tất', dataIndex: 'order_count', align: 'right' },
            { title: 'Tổng chi tiêu', dataIndex: 'total_spending', align: 'right', render: money },
          ]}
        />
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-charcoal/45">
        <UsersRound size={15} /> Danh sách thành viên Aurelis
      </div>
    </div>
  );
}
