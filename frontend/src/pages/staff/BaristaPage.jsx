import { Button, Tag, message } from 'antd';
import { ChefHat, Clock3, Coffee, LogOut, RefreshCcw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import BrandLogo from '../../components/common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { localizeItemSummary, statusLabel } from '../../utils/viLabels';

const lanes = [
  ['CONFIRMED', 'ĐƠN MỚI'],
  ['PREPARING', 'ĐANG PHA CHẾ'],
  ['READY', 'SẴN SÀNG'],
];
const tag = { CONFIRMED: 'gold', PREPARING: 'processing', READY: 'cyan' };
export default function BaristaPage() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]),
    [loading, setLoading] = useState(false);
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const r = await orderService.list({ limit: 50 });
      setOrders(r.data.filter((x) => ['CONFIRMED', 'PREPARING', 'READY'].includes(x.status)));
    } catch (e) {
      message.error(e.response?.data?.message || 'Không thể tải đơn pha chế');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [load]);
  const advance = async (o) => {
    const next = o.status === 'CONFIRMED' ? 'PREPARING' : o.status === 'PREPARING' ? 'READY' : null;
    if (!next) return;
    try {
      await orderService.changeStatus(o.id, next);
      message.success(`${o.order_code} → ${statusLabel(next)}`);
      load();
    } catch (e) {
      message.error(e.response?.data?.message || 'Không thể cập nhật đơn hàng');
    }
  };
  return (
    <div className="min-h-screen bg-[#f2eee7]">
      <header className="flex items-center justify-between border-b border-black/5 bg-espresso px-5 py-4 text-white">
        <div className="flex items-center gap-5">
          <BrandLogo light />
          <div className="hidden sm:block">
            <div className="flex items-center gap-2 font-semibold">
              <ChefHat size={18} />
              Màn hình pha chế
            </div>
            <div className="text-xs text-white/45">{user?.fullName}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button loading={loading} onClick={load} icon={<RefreshCcw size={15} />}>
            Làm mới
          </Button>
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm"
          >
            <LogOut size={15} />
            Đăng xuất
          </button>
        </div>
      </header>
      <main className="p-4 md:p-6">
        <div className="mb-5">
          <h1 className="brand-display text-3xl text-espresso">Khu vực pha chế</h1>
          <p className="text-sm text-charcoal/50">
            Chỉ hiển thị các đơn thuộc chi nhánh được phân công cho bạn.
          </p>
        </div>
        <div className="grid gap-5 xl:grid-cols-3">
          {lanes.map(([status, label]) => (
            <section key={status}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-espresso">
                  <Coffee size={18} />
                  {label}
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold">
                  {orders.filter((o) => o.status === status).length}
                </span>
              </div>
              <div className="space-y-4">
                {orders
                  .filter((o) => o.status === status)
                  .map((o) => (
                    <article
                      key={o.id}
                      className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-lg font-bold text-espresso">#{o.order_code}</div>
                          <div className="mt-1 text-sm font-semibold">
                            {o.table_code ? `BÀN ${o.table_code}` : 'ĐƠN MANG ĐI/NHẬN TẠI QUẦY'}
                          </div>
                        </div>
                        <Tag color={tag[o.status]}>{label}</Tag>
                      </div>
                      <div className="mt-4 space-y-2 border-y border-black/5 py-4">
                        {localizeItemSummary(o.item_summary)
                          .split('||')
                          .filter(Boolean)
                          .map((x, i) => (
                            <div key={i} className="text-sm font-medium">
                              {x}
                            </div>
                          ))}
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-charcoal/45">
                          <Clock3 size={14} />
                          {new Date(o.created_at).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        {status !== 'READY' && (
                          <Button type="primary" onClick={() => advance(o)}>
                            {status === 'CONFIRMED' ? 'BẮT ĐẦU PHA CHẾ' : 'ĐÁNH DẤU SẴN SÀNG'}
                          </Button>
                        )}
                      </div>
                    </article>
                  ))}
                {!orders.some((o) => o.status === status) && (
                  <div className="rounded-2xl border border-dashed border-black/10 bg-white/40 py-12 text-center text-sm text-charcoal/35">
                    Không có đơn ở trạng thái này
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
