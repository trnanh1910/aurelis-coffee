import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowRight, Coffee, DollarSign, RefreshCw, ReceiptText, UsersRound } from 'lucide-react';
import api from '../../api/axiosClient';
import { productLabel, statusLabel } from '../../utils/viLabels';

const money = (value) => `${new Intl.NumberFormat('vi-VN').format(Number(value || 0))} ₫`;
const dayLabel = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(date);
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [overview, trend] = await Promise.all([
        api.get('/dashboard/overview'),
        api.get('/dashboard/revenue?days=7'),
      ]);
      setData(overview.data.data);
      setRevenue(trend.data.data || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Không thể tải dữ liệu bảng điều khiển.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  if (error) return <div className="admin-dashboard-state"><span className="admin-page-eyebrow">AURELIS · BUSINESS INTELLIGENCE</span><h1 className="brand-display">Chưa thể tải tổng quan</h1><p>{error}</p><button onClick={load}><RefreshCw size={15} /> Thử tải lại</button></div>;
  if (!data) return <div className="admin-dashboard-state"><RefreshCw className={loading ? 'is-spinning' : ''} size={19} /><p>Đang tải dữ liệu tổng quan...</p></div>;

  const cards = [
    ['Doanh thu hôm nay', money(data.todayRevenue), DollarSign, 'Theo đơn đã ghi nhận'],
    ['Đơn hàng hôm nay', data.todayOrders || 0, ReceiptText, 'Tất cả trạng thái'],
    ['Khách hàng', data.customers || 0, UsersRound, 'Hồ sơ thành viên'],
    ['Giá trị đơn trung bình', money(data.averageOrderValue), Coffee, 'Theo kỳ hiện tại'],
  ];

  return <div className="admin-dashboard">
    <div className="admin-page-heading"><div><span className="admin-page-eyebrow">AURELIS · BUSINESS INTELLIGENCE</span><h1 className="brand-display">Tổng quan</h1><p>Tình hình hoạt động kinh doanh trong ngày</p></div><button className="admin-refresh-button" onClick={load} disabled={loading}><RefreshCw size={15} className={loading ? 'is-spinning' : ''} /> Làm mới dữ liệu</button></div>
    <div className="admin-stat-grid">{cards.map(([label, value, Icon, note], index) => <article className="admin-stat-card" key={label}><div className="admin-stat-top"><span>{label}</span><i className={`admin-stat-icon tone-${index}`}><Icon size={17} /></i></div><strong>{value}</strong><small>{note}</small><span className="admin-stat-index">0{index + 1}</span></article>)}</div>
    <div className="admin-dashboard-grid">
      <section className="premium-card admin-chart-card"><div className="admin-section-heading"><div><span className="admin-page-eyebrow">BẢY NGÀY GẦN NHẤT</span><h2>Doanh thu</h2></div><span className="admin-chart-total">{money(revenue.reduce((sum, item) => sum + Number(item.revenue || 0), 0))}</span></div><div className="admin-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={revenue} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}><defs><linearGradient id="aurelisRevenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9b7a52" stopOpacity={0.25} /><stop offset="95%" stopColor="#9b7a52" stopOpacity={0.015} /></linearGradient></defs><CartesianGrid stroke="#eee8df" strokeDasharray="3 5" vertical={false} /><XAxis dataKey="date" tickFormatter={dayLabel} tick={{ fontSize: 9, fill: '#9c907f' }} axisLine={false} tickLine={false} /><YAxis tickFormatter={(value) => value >= 1000000 ? `${(value / 1000000).toFixed(1)}tr` : `${Math.round(value / 1000)}k`} tick={{ fontSize: 9, fill: '#9c907f' }} axisLine={false} tickLine={false} width={45} /><Tooltip formatter={(value) => money(value)} labelFormatter={dayLabel} contentStyle={{ border: '1px solid #e5dbcf', borderRadius: 2, background: '#fffdf9', fontSize: 10 }} /><Area type="monotone" dataKey="revenue" name="Doanh thu" stroke="#81613f" fill="url(#aurelisRevenueFill)" strokeWidth={2.5} activeDot={{ r: 4, fill: '#81613f', stroke: '#fffdf9', strokeWidth: 2 }} /></AreaChart></ResponsiveContainer></div></section>
      <section className="premium-card admin-top-products"><div className="admin-section-heading"><div><span className="admin-page-eyebrow">ĐƯỢC YÊU THÍCH</span><h2>Sản phẩm bán chạy</h2></div><Coffee size={17} /></div>{data.topProducts?.length ? <div className="admin-top-product-list">{data.topProducts.map((product, index) => <div className="admin-top-product" key={`${product.name}-${index}`}><span className="admin-top-product-rank">{String(index + 1).padStart(2, '0')}</span><div><strong>{productLabel(product.name)}</strong><small>Đã bán {product.quantity} sản phẩm</small></div><ArrowRight size={14} /></div>)}</div> : <div className="admin-inline-empty">Chưa có dữ liệu sản phẩm trong kỳ này.</div>}</section>
    </div>
    <section className="premium-card admin-recent-orders"><div className="admin-section-heading"><div><span className="admin-page-eyebrow">HOẠT ĐỘNG MỚI NHẤT</span><h2>Đơn hàng gần đây</h2></div><Link to="/admin/orders">Tất cả đơn hàng <ArrowRight size={14} /></Link></div><div className="overflow-x-auto"><table className="admin-data-table"><thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Chi nhánh</th><th>Trạng thái</th><th className="text-right">Tổng tiền</th></tr></thead><tbody>{(data.recentOrders || []).map((order) => <tr key={order.id}><td><strong>{order.order_code}</strong></td><td>{order.customer_name === 'Walk-in' ? 'Khách vãng lai' : order.customer_name}</td><td>{order.branch_name}</td><td><span className={`admin-order-status status-${String(order.status).toLowerCase()}`}><i />{statusLabel(order.status)}</span></td><td className="text-right"><strong>{money(order.total_amount)}</strong></td></tr>)}{!data.recentOrders?.length && <tr><td colSpan="5" className="admin-table-empty">Chưa có đơn hàng gần đây.</td></tr>}</tbody></table></div></section>
  </div>;
}
