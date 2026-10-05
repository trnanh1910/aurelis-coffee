import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDownLeft, ArrowRight, CalendarDays, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Coffee, CreditCard, MapPin, PackageCheck, RefreshCw, Search, ShoppingBag, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { assetUrl } from '../../utils/assetUrl';

const money = (value) => `${new Intl.NumberFormat('vi-VN').format(Number(value || 0))} ₫`;
const dateTime = (value) => value ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';
const statusInfo = {
  PENDING: { label: 'Chờ xác nhận', tone: 'pending', note: 'Đơn hàng đang chờ Aurelis tiếp nhận.' },
  CONFIRMED: { label: 'Đã xác nhận', tone: 'confirmed', note: 'Đơn hàng đã được xác nhận.' },
  PREPARING: { label: 'Đang chuẩn bị', tone: 'preparing', note: 'Barista đang chuẩn bị lựa chọn của bạn.' },
  READY: { label: 'Sẵn sàng', tone: 'ready', note: 'Đơn hàng đã sẵn sàng tại cửa hàng.' },
  COMPLETED: { label: 'Hoàn tất', tone: 'completed', note: 'Cảm ơn bạn đã chọn Aurelis.' },
  CANCELLED: { label: 'Đã hủy', tone: 'cancelled', note: 'Đơn hàng này đã được hủy.' },
};
const stages = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED'];
const filters = [
  ['ALL', 'Tất cả'], ['PENDING', 'Chờ xác nhận'], ['CONFIRMED', 'Đã xác nhận'],
  ['PREPARING', 'Đang chuẩn bị'], ['READY', 'Sẵn sàng'], ['COMPLETED', 'Hoàn tất'], ['CANCELLED', 'Đã hủy'],
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadOrders = useCallback(async (quiet = false) => {
    quiet ? setRefreshing(true) : setLoading(true);
    setError(false);
    try {
      const result = await orderService.list({ page, limit: 8, status: status === 'ALL' ? undefined : status, search: query || undefined });
      setOrders(result.data || []);
      setPagination(result.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch {
      setError(true);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, status, query]);

  useEffect(() => { loadOrders(); }, [loadOrders]);
  useEffect(() => { setPage(1); }, [status, query]);

  const openDetail = async (order) => {
    setSelected({ ...order, _loading: true });
    setDetailLoading(true);
    try {
      const detail = await orderService.detail(order.id);
      setSelected(detail);
    } catch {
      setSelected({ ...order, _error: true });
    } finally {
      setDetailLoading(false);
    }
  };
  const shownFilters = useMemo(() => filters, []);
  const info = selected ? statusInfo[selected.status] || statusInfo.PENDING : null;
  const activeStage = selected ? stages.indexOf(selected.status) : -1;

  return <main className="orders-page">
    <header className="orders-hero">
      <div className="orders-hero-inner">
        <div className="orders-breadcrumb"><Link to="/">Trang chủ</Link><span>/</span><span>Theo dõi đơn hàng</span></div>
        <div className="orders-hero-copy"><span className="lux-eyebrow">AURELIS · YOUR JOURNEY</span><h1 className="brand-display">Mỗi đơn hàng, <em>một trải nghiệm.</em></h1><p>Theo dõi hành trình những hương vị bạn đã chọn, từ lúc xác nhận đến khi sẵn sàng.</p></div>
        <div className="orders-hero-mark"><PackageCheck size={33} /><span>MADE WITH CARE</span></div>
      </div>
    </header>

    <section className="orders-content">
      <div className="orders-heading"><div><span className="lux-eyebrow">HÀNH TRÌNH CỦA BẠN</span><h2 className="brand-display">Đơn hàng</h2><p>{pagination.total || 0} đơn hàng được lưu trong tài khoản</p></div><button className="orders-refresh" onClick={() => loadOrders(true)} disabled={refreshing || loading}><RefreshCw size={15} className={refreshing ? 'is-spinning' : ''} /> Làm mới</button></div>
      <div className="orders-toolbar"><label className="orders-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo mã đơn hàng..." aria-label="Tìm đơn hàng" />{search && <button onClick={() => setSearch('')} aria-label="Xóa tìm kiếm"><X size={14} /></button>}</label><div className="orders-filters" role="tablist" aria-label="Lọc trạng thái đơn hàng">{shownFilters.map(([value, label]) => <button key={value} role="tab" aria-selected={status === value} className={status === value ? 'is-active' : ''} onClick={() => setStatus(value)}>{label}</button>)}</div></div>
      {loading ? <div className="orders-skeleton-list">{[0, 1, 2].map((item) => <div className="orders-skeleton" key={item}><i /><span /><b /></div>)}</div> : error ? <div className="orders-empty"><Coffee size={30} /><h3>Chưa thể tải đơn hàng</h3><p>Vui lòng kiểm tra kết nối rồi thử lại.</p><button onClick={() => loadOrders()}>Thử lại <RefreshCw size={14} /></button></div> : orders.length ? <>
        <div className="orders-list">{orders.map((order) => { const state = statusInfo[order.status] || statusInfo.PENDING; return <article className="order-card" key={order.id}>
          <div className="order-card-top"><div className="order-code-block"><span className="lux-eyebrow">MÃ ĐƠN HÀNG</span><strong>{order.order_code}</strong></div><span className={`order-status-badge ${state.tone}`}><i />{state.label}</span></div>
          <div className="order-card-meta"><span><CalendarDays size={14} />{dateTime(order.created_at)}</span><span><MapPin size={14} />{order.branch_name}</span><span><ShoppingBag size={14} />{order.item_lines || '—'} món</span></div>
          {order.item_summary && <p className="order-card-summary">{order.item_summary.split('||').join('  ·  ')}</p>}
          <div className="order-card-bottom"><div><span>TỔNG THANH TOÁN</span><strong>{money(order.total_amount)}</strong></div><button onClick={() => openDetail(order)}>Chi tiết đơn hàng <ArrowRight size={15} /></button></div>
        </article>; })}</div>
        {pagination.totalPages > 1 && <nav className="orders-pagination" aria-label="Phân trang"><button disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} aria-label="Trang trước"><ChevronLeft size={17} /></button><span>Trang <strong>{page}</strong> / {pagination.totalPages}</span><button disabled={page >= pagination.totalPages} onClick={() => setPage((value) => Math.min(pagination.totalPages, value + 1))} aria-label="Trang sau"><ChevronRight size={17} /></button></nav>}
      </> : <div className="orders-empty"><Coffee size={30} /><span className="lux-eyebrow">A MOMENT IS WAITING</span><h3>{query || status !== 'ALL' ? 'Không tìm thấy đơn hàng phù hợp' : 'Hành trình Aurelis của bạn bắt đầu từ đây'}</h3><p>{query || status !== 'ALL' ? 'Thử thay đổi từ khóa hoặc bộ lọc trạng thái.' : 'Khi bạn đặt món, thông tin và tiến độ sẽ được lưu tại đây.'}</p><Link to="/menu">Khám phá thực đơn <ArrowRight size={15} /></Link></div>}
    </section>

    {selected && createPortal(<div className="order-detail-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }} role="presentation"><section className="order-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="order-detail-title"><button className="order-detail-close" onClick={() => setSelected(null)} aria-label="Đóng"><X size={19} /></button>{detailLoading ? <div className="order-detail-loading"><span className="orders-spinner" /><p>Đang tải chi tiết đơn hàng...</p></div> : <>
      <span className="lux-eyebrow">AURELIS · ORDER JOURNAL</span><h2 className="brand-display" id="order-detail-title">Đơn hàng <em>{selected.order_code}</em></h2><div className="order-detail-subhead"><span><CalendarDays size={14} />{dateTime(selected.created_at)}</span><span className={`order-status-badge ${info?.tone}`}><i />{info?.label}</span></div>
      {selected._error ? <div className="order-detail-error">Không thể tải chi tiết đơn hàng. Hãy đóng cửa sổ và thử lại.</div> : <>
        <div className="order-progress">{selected.status === 'CANCELLED' ? <div className="order-cancelled-note"><X size={17} /><div><strong>Đơn hàng đã được hủy</strong><span>Vui lòng liên hệ cửa hàng nếu bạn cần hỗ trợ.</span></div></div> : stages.map((stage, index) => <div className={`order-progress-step${index < activeStage ? ' is-done' : ''}${index === activeStage ? ' is-current' : ''}`} key={stage}><span className="order-progress-icon">{index < activeStage ? <Check size={14} /> : index === 0 ? <Clock3 size={14} /> : index === 4 ? <CheckCircle2 size={14} /> : <Coffee size={14} />}</span><div><strong>{statusInfo[stage].label}</strong>{index === activeStage && <small>{statusInfo[stage].note}</small>}</div></div>)}</div>
        <div className="order-detail-section"><div className="order-detail-section-title"><h3>Món đã chọn</h3><span>{selected.items?.length || 0} món</span></div>{(selected.items || []).map((item) => <div className="order-detail-item" key={item.id}><div className="order-detail-item-image">{item.image ? <img src={assetUrl(item.image, '')} alt="" /> : <Coffee size={19} />}</div><div className="order-detail-item-copy"><strong>{item.product_name}</strong><span>{[item.size_name, ...(item.addons || []).map((addon) => addon.addon_name)].filter(Boolean).join(' · ') || 'Aurelis selection'}</span><small>Số lượng: {item.quantity}</small></div><b>{money(item.total_price)}</b></div>)}</div>
        <div className="order-detail-location"><MapPin size={16} /><div><span>ĐỊA ĐIỂM NHẬN ĐƠN</span><strong>{selected.branch_name}</strong><small>{selected.branch_address}</small></div></div>
        <div className="order-detail-total"><div><span>Tạm tính</span><strong>{money(selected.subtotal)}</strong></div>{Number(selected.discount_amount) > 0 && <div><span>Ưu đãi</span><strong>− {money(selected.discount_amount)}</strong></div>}<div className="order-detail-grand"><span>Tổng thanh toán</span><strong>{money(selected.total_amount)}</strong></div></div>
        <div className="order-payment-state"><CreditCard size={15} /><span>Thanh toán</span><strong>{selected.payments?.[0]?.payment_status === 'PAID' ? 'Đã thanh toán' : 'Thanh toán tại cửa hàng'}</strong></div>
      </>}
    </>}</section></div>, document.body)}
  </main>;
}
