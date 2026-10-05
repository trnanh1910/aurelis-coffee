import { Select, message } from 'antd';
import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../../api/axiosClient';

const money = (v) => new Intl.NumberFormat('vi-VN').format(Number(v || 0)) + ' ₫';
export default function ReportsPage() {
  const [days, setDays] = useState(30),
    [data, setData] = useState(null),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get('/admin/reports', { params: { days } })
      .then((r) => active && setData(r.data.data))
      .catch((e) => message.error(e.response?.data?.message || 'Không thể tải báo cáo'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [days]);
  const summary = data?.summary || {};
  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="brand-display text-3xl text-espresso">Báo cáo hoạt động</h1>
          <p className="mt-1 text-sm text-charcoal/50">
            Doanh thu và sản phẩm bán chạy theo thời gian.
          </p>
        </div>
        <Select
          value={days}
          onChange={setDays}
          className="w-44"
          options={[
            { value: 7, label: '7 ngày gần đây' },
            { value: 30, label: '30 ngày gần đây' },
            { value: 90, label: '90 ngày gần đây' },
          ]}
        />
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ['Doanh thu', money(summary.revenue)],
          ['Đơn hoàn tất', Number(summary.orders || 0).toLocaleString('vi-VN')],
          ['Giá trị đơn trung bình', money(summary.average_order)],
        ].map(([label, value]) => (
          <div className="premium-card p-5" key={label}>
            <div className="text-sm text-charcoal/50">{label}</div>
            <div className="mt-3 text-2xl font-semibold text-espresso">{loading ? '…' : value}</div>
          </div>
        ))}
      </div>
      <div className="premium-card mt-5 p-5">
        <h2 className="font-semibold">Doanh thu theo ngày</h2>
        <div className="mt-5 h-72">
          {!loading && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.daily || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={75} />
                <Tooltip formatter={(v) => money(v)} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Doanh thu"
                  stroke="#5C4033"
                  fill="#F4EFE7"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <div className="premium-card mt-5 overflow-hidden">
        <div className="border-b border-black/5 p-5 font-semibold">Sản phẩm bán chạy</div>
        <div className="divide-y divide-black/5">
          {(data?.topProducts || []).map((x, i) => (
            <div className="flex items-center justify-between gap-4 p-4" key={x.name}>
              <div>
                <span className="mr-3 text-xs text-charcoal/40">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <b>{x.name}</b>
                <div className="ml-8 text-xs text-charcoal/45">{x.quantity} sản phẩm</div>
              </div>
              <span className="font-medium">{money(x.revenue)}</span>
            </div>
          ))}
          {!loading && !data?.topProducts?.length && (
            <div className="p-5 text-sm text-charcoal/50">
              Chưa có dữ liệu trong khoảng thời gian này.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
