import { DollarSign, ReceiptText, Coffee, UsersRound } from 'lucide-react';
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
import { productLabel, statusLabel } from '../../utils/viLabels';
const money = (v) => new Intl.NumberFormat('vi-VN').format(Number(v || 0)) + ' ₫';
export default function DashboardPage() {
  const [data, setData] = useState(null),
    [rev, setRev] = useState([]),
    [error, setError] = useState('');
  useEffect(() => {
    Promise.all([api.get('/dashboard/overview'), api.get('/dashboard/revenue?days=7')])
      .then(([a, b]) => {
        setData(a.data.data);
        setRev(b.data.data);
      })
      .catch((e) =>
        setError(e.response?.data?.message || 'Không thể tải dữ liệu bảng điều khiển.'),
      );
  }, []);
  if (error) return <div className="premium-card p-8">{error}</div>;
  if (!data) return <div className="py-20 text-center">Đang tải bảng điều khiển...</div>;
  const cards = [
    ['Doanh thu hôm nay', money(data.todayRevenue), DollarSign],
    ['Đơn hàng hôm nay', data.todayOrders, ReceiptText],
    ['Khách hàng', data.customers, UsersRound],
    ['Giá trị đơn trung bình', money(data.averageOrderValue), Coffee],
  ];
  return (
    <div>
      <div>
        <h1 className="brand-display text-3xl text-espresso">Tổng quan</h1>
        <p className="mt-1 text-sm text-charcoal/50">
          Tổng quan về hoạt động kinh doanh trong ngày
        </p>
      </div>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([k, v, Icon]) => (
          <div key={k} className="premium-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal/50">{k}</span>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-cream text-coffee">
                <Icon size={18} />
              </span>
            </div>
            <div className="mt-5 text-2xl font-semibold text-espresso">{v}</div>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        <div className="premium-card p-6">
          <div className="font-semibold">Tổng quan doanh thu</div>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rev}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={75} />
                <Tooltip formatter={(v) => money(v)} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#5C4033"
                  fill="#F4EFE7"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="premium-card p-6">
          <div className="font-semibold">Sản phẩm bán chạy</div>
          <div className="mt-5 space-y-4">
            {data.topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-cream text-xs font-bold text-coffee">
                  {i + 1}
                </div>
                <div>
                  <div className="text-sm font-medium">{productLabel(p.name)}</div>
                  <div className="text-xs text-charcoal/45">Đã bán {p.quantity} sản phẩm</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="premium-card mt-5 overflow-hidden">
        <div className="border-b border-black/5 p-5 font-semibold">Đơn hàng gần đây</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#faf8f4] text-xs uppercase tracking-wide text-charcoal/45">
              <tr>
                <th className="p-4">Đơn hàng</th>
                <th>Khách hàng</th>
                <th>Chi nhánh</th>
                <th>Trạng thái</th>
                <th className="pr-4 text-right">Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((o) => (
                <tr key={o.id} className="border-t border-black/5">
                  <td className="p-4 font-semibold">{o.order_code}</td>
                  <td>{o.customer_name === 'Walk-in' ? 'Khách vãng lai' : o.customer_name}</td>
                  <td>{o.branch_name}</td>
                  <td>{statusLabel(o.status)}</td>
                  <td className="pr-4 text-right font-medium">{money(o.total_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
