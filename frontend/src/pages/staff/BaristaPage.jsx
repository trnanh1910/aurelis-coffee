import { Button, message } from 'antd';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChefHat,
  Clock3,
  Coffee,
  LogOut,
  RefreshCcw,
  Search,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import BrandLogo from '../../components/common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { localizeItemSummary } from '../../utils/viLabels';

const lanes = [
  { status: 'CONFIRMED', title: 'Đơn mới', caption: 'Sẵn sàng bắt đầu', icon: Coffee },
  { status: 'PREPARING', title: 'Đang pha chế', caption: 'Đang được chuẩn bị', icon: ChefHat },
  { status: 'READY', title: 'Sẵn sàng', caption: 'Chờ phục vụ', icon: CheckCircle2 },
];
const typeLabel = (order) => order.table_code ? `Bàn ${order.table_code}` : order.order_type === 'PICKUP' ? 'Nhận tại quầy' : 'Mang đi';
const clockTime = (value) => new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
const minutesSince = (value, now) => Math.max(0, Math.floor((now - new Date(value).getTime()) / 60000));

export default function BaristaPage() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [workingId, setWorkingId] = useState(null);
  const [now, setNow] = useState(Date.now());

  const load = useCallback(async (quiet = false) => {
    try {
      if (!quiet) setLoading(true);
      setError(false);
      const result = await orderService.list({ limit: 50 });
      setOrders((result.data || []).filter((order) => ['CONFIRMED', 'PREPARING', 'READY'].includes(order.status)));
    } catch (e) {
      setError(true);
      if (!quiet) message.error(e.response?.data?.message || 'Không thể tải danh sách đơn pha chế.');
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const refreshTimer = setInterval(() => load(true), 15000);
    const clockTimer = setInterval(() => setNow(Date.now()), 30000);
    return () => {
      clearInterval(refreshTimer);
      clearInterval(clockTimer);
    };
  }, [load]);

  const advance = async (order) => {
    const next = order.status === 'CONFIRMED' ? 'PREPARING' : order.status === 'PREPARING' ? 'READY' : null;
    if (!next) return;
    setWorkingId(order.id);
    try {
      await orderService.changeStatus(order.id, next);
      message.success(`${order.order_code} · ${next === 'PREPARING' ? 'Đã bắt đầu pha chế' : 'Đã sẵn sàng phục vụ'}`);
      await load(true);
    } catch (e) {
      message.error(e.response?.data?.message || 'Không thể cập nhật đơn hàng.');
    } finally {
      setWorkingId(null);
    }
  };

  const visibleOrders = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('vi');
    return orders.filter((order) => !term || [order.order_code, order.table_code, order.customer_name, order.item_summary]
      .some((value) => String(value || '').toLocaleLowerCase('vi').includes(term)));
  }, [orders, search]);
  const laneOrders = (status) => visibleOrders
    .filter((order) => order.status === status)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  return (
    <div className="barista-workspace">
      <header className="barista-header">
        <div className="barista-brand"><BrandLogo light /><span /><div><strong>BARISTA STATION</strong><small>{user?.fullName || 'Aurelis Coffee'}</small></div></div>
        <div className="barista-header-actions"><span className="barista-live"><i /> Bảng đơn trực tiếp</span><Button loading={loading} onClick={() => load()} icon={<RefreshCcw size={15} />}>Làm mới</Button><button className="barista-logout" onClick={logout}><LogOut size={15} /><span>Đăng xuất</span></button></div>
      </header>
      <main className="barista-main">
        <section className="barista-welcome">
          <div><span className="barista-eyebrow">AURELIS · CRAFTED WITH CARE</span><h1 className="brand-display">Khu vực <em>pha chế.</em></h1><p>Mỗi tách cà phê bắt đầu từ sự tỉ mỉ trong từng thao tác.</p></div>
          <label className="barista-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm mã đơn, bàn hoặc món..." aria-label="Tìm đơn pha chế" />{search && <button onClick={() => setSearch('')} aria-label="Xóa tìm kiếm">×</button>}</label>
        </section>
        <section className="barista-summary" aria-label="Tổng quan đơn pha chế">
          <div><span>ĐƠN ĐANG PHỤC VỤ</span><strong>{orders.length}</strong><small>đơn trong hàng chờ</small></div>
          <div><span>ĐƠN MỚI</span><strong>{orders.filter((order) => order.status === 'CONFIRMED').length.toString().padStart(2, '0')}</strong><small>cần tiếp nhận</small></div>
          <div><span>ĐANG PHA CHẾ</span><strong>{orders.filter((order) => order.status === 'PREPARING').length.toString().padStart(2, '0')}</strong><small>đang thực hiện</small></div>
          <div><span>SẴN SÀNG</span><strong>{orders.filter((order) => order.status === 'READY').length.toString().padStart(2, '0')}</strong><small>chờ phục vụ</small></div>
          <div className="barista-summary-mark"><Coffee size={24} /><span>MADE TO ORDER</span></div>
        </section>

        {error ? <div className="barista-state barista-state-error"><AlertCircle size={25} /><h2>Chưa thể tải hàng chờ</h2><p>Kiểm tra kết nối rồi tải lại để tiếp tục phục vụ.</p><Button onClick={() => load()}>Thử lại</Button></div> : loading && !orders.length ? <div className="barista-lanes">{lanes.map((lane) => <section className="barista-lane" key={lane.status}><div className="barista-lane-heading"><i /><span /><b /></div><div className="barista-ticket-skeleton" /><div className="barista-ticket-skeleton" /></section>)}</div> : <div className="barista-lanes">
          {lanes.map(({ status, title, caption, icon: Icon }) => {
            const lane = laneOrders(status);
            return <section className={`barista-lane barista-lane-${status.toLowerCase()}`} key={status}>
              <div className="barista-lane-heading"><div className="barista-lane-icon"><Icon size={17} /></div><div className="barista-lane-title"><h2>{title}</h2><p>{caption}</p></div><span className="barista-lane-count">{lane.length.toString().padStart(2, '0')}</span></div>
              <div className="barista-ticket-list">{lane.map((order) => {
                const elapsed = minutesSince(order.created_at, now);
                const items = localizeItemSummary(order.item_summary).split('||').filter(Boolean);
                return <article className={`barista-ticket${elapsed >= 12 && order.status !== 'READY' ? ' is-overdue' : ''}`} key={order.id}>
                  <div className="barista-ticket-top"><div><span className="barista-ticket-kicker">ORDER TICKET</span><h3>#{order.order_code}</h3></div><span className={`barista-wait${elapsed >= 12 && order.status !== 'READY' ? ' is-overdue' : ''}`}><Clock3 size={13} />{elapsed < 1 ? 'Vừa nhận' : `${elapsed} phút`}</span></div>
                  <div className="barista-ticket-meta"><span>{typeLabel(order)}</span>{order.customer_name && <span>{order.customer_name}</span>}<time>{clockTime(order.created_at)}</time></div>
                  <div className="barista-ticket-items">{items.map((item, index) => {
                    const match = item.match(/^(\d+)\s*x\s*(.*)$/i);
                    return <div className="barista-ticket-item" key={`${order.id}-${index}`}><span className="barista-item-quantity">{match?.[1] || '1'}×</span><strong>{match?.[2] || item}</strong></div>;
                  })}</div>
                  {order.note && <div className="barista-ticket-note"><span>GHI CHÚ</span><p>{order.note}</p></div>}
                  {status !== 'READY' ? <Button className="barista-advance" type="primary" loading={workingId === order.id} disabled={workingId !== null && workingId !== order.id} onClick={() => advance(order)}>{status === 'CONFIRMED' ? <><ChefHat size={15} /> Bắt đầu pha chế <ArrowRight size={15} /></> : <><Check size={15} /> Đánh dấu sẵn sàng <ArrowRight size={15} /></>}</Button> : <div className="barista-ready-label"><CheckCircle2 size={15} /> Đã hoàn tất · chờ phục vụ</div>}
                </article>;
              })}{!lane.length && <div className="barista-lane-empty"><span><Coffee size={17} /></span><strong>{search ? 'Không tìm thấy đơn' : 'Chưa có đơn hàng'}</strong><small>{search ? 'Thử từ khóa khác.' : 'Các đơn mới sẽ xuất hiện tại đây.'}</small></div>}</div>
            </section>;
          })}
        </div>}
        <footer className="barista-footer"><span>Hàng chờ được cập nhật tự động mỗi 15 giây.</span><span>ĐỒNG HÀNH CÙNG KHOẢNH KHẮC AURELIS</span></footer>
      </main>
    </div>
  );
}
