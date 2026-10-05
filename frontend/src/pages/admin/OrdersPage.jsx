import { Button, Drawer, Modal, Select, Tag, message } from 'antd';
import { Banknote, ChevronRight, Clock3, Search, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { branchService } from '../../services/branchService';
import { orderService } from '../../services/orderService';
import {
  addonLabel,
  iceLabel,
  orderTypeLabel,
  paymentMethodLabel,
  productLabel,
  statusLabel,
} from '../../utils/viLabels';

const money = (v) => new Intl.NumberFormat('vi-VN').format(Number(v || 0)) + ' ₫';
const nextMap = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['CANCELLED'],
};
const tagColor = {
  PENDING: 'gold',
  CONFIRMED: 'blue',
  PREPARING: 'processing',
  READY: 'cyan',
  COMPLETED: 'green',
  CANCELLED: 'red',
};
export default function OrdersPage() {
  const [items, setItems] = useState([]),
    [meta, setMeta] = useState({}),
    [page, setPage] = useState(1),
    [status, setStatus] = useState(''),
    [search, setSearch] = useState(''),
    [branch, setBranch] = useState(''),
    [branches, setBranches] = useState([]),
    [selected, setSelected] = useState(null),
    [payOpen, setPayOpen] = useState(false),
    [payMethod, setPayMethod] = useState('CASH');
  useEffect(() => {
    branchService.list().then(setBranches);
  }, []);
  const load = () =>
    orderService
      .list({
        page,
        limit: 12,
        status: status || undefined,
        search: search || undefined,
        branchId: branch || undefined,
      })
      .then((r) => {
        setItems(r.data);
        setMeta(r.pagination);
      })
      .catch((e) => message.error(e.response?.data?.message || 'Không thể tải danh sách đơn hàng'));
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [page, status, search, branch]);
  const detail = async (id) => {
    try {
      setSelected(await orderService.detail(id));
    } catch (e) {
      message.error(e.response?.data?.message || 'Không thể tải chi tiết đơn hàng');
    }
  };
  const changeStatus = async (s) => {
    try {
      const d = await orderService.changeStatus(selected.id, s);
      setSelected(d);
      message.success(`Đơn hàng → ${statusLabel(s)}`);
      load();
    } catch (e) {
      message.error(e.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };
  const pay = async () => {
    try {
      const d = await orderService.pay(selected.id, {
        paymentMethod: payMethod,
        amount: selected.total_amount,
      });
      setSelected(d);
      setPayOpen(false);
      message.success('Thanh toán thành công');
      load();
    } catch (e) {
      message.error(e.response?.data?.message || 'Thanh toán thất bại');
    }
  };
  return (
    <div>
      <div>
        <h1 className="brand-display text-3xl text-espresso">Đơn hàng</h1>
        <p className="mt-1 text-sm text-charcoal/50">
          Theo dõi toàn bộ vòng đời đơn hàng, pha chế và thanh toán.
        </p>
      </div>
      <div className="premium-card mt-6 p-4">
        <div className="flex flex-col gap-3 xl:flex-row">
          <label className="flex flex-1 items-center gap-2 rounded-xl bg-[#f7f4ef] px-4">
            <Search size={17} />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-transparent py-3 outline-none"
              placeholder="Tìm mã đơn hoặc khách hàng..."
            />
          </label>
          <Select
            className="w-full xl:w-56"
            allowClear
            placeholder="Tất cả chi nhánh"
            value={branch || undefined}
            onChange={(v) => {
              setBranch(v || '');
              setPage(1);
            }}
            options={branches.map((b) => ({ value: String(b.id), label: b.name }))}
          />
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {['', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'].map((s) => (
            <button
              key={s || 'ALL'}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold ${status === s ? 'bg-espresso text-white' : 'bg-[#f4efe8] text-charcoal/60'}`}
            >
              {s ? statusLabel(s) : 'TẤT CẢ'}
            </button>
          ))}
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-y border-black/5 bg-[#faf8f4] text-xs uppercase tracking-wide text-charcoal/45">
              <tr>
                <th className="p-4">Đơn hàng</th>
                <th>Khách hàng</th>
                <th>Chi nhánh / Bàn</th>
                <th>Loại</th>
                <th>Số món</th>
                <th>Tổng tiền</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((o) => (
                <tr key={o.id} className="border-b border-black/5 hover:bg-[#fcfaf6]">
                  <td className="p-4">
                    <div className="font-semibold text-espresso">{o.order_code}</div>
                    <div className="text-xs text-charcoal/40">
                      {new Date(o.created_at).toLocaleString('vi-VN')}
                    </div>
                  </td>
                  <td>
                    {o.customer_name === 'Walk-in'
                      ? 'Khách vãng lai'
                      : o.customer_name || 'Khách vãng lai'}
                  </td>
                  <td>
                    <div>{o.branch_name}</div>
                    <div className="text-xs text-charcoal/45">{o.table_code || 'Không có bàn'}</div>
                  </td>
                  <td>{orderTypeLabel(o.order_type)}</td>
                  <td>{o.item_lines}</td>
                  <td className="font-semibold">{money(o.total_amount)}</td>
                  <td>{statusLabel(o.payment_status || 'UNPAID')}</td>
                  <td>
                    <Tag color={tagColor[o.status]}>{statusLabel(o.status)}</Tag>
                  </td>
                  <td>
                    <button
                      aria-label="Xem chi tiết"
                      onClick={() => detail(o.id)}
                      className="rounded-lg p-2 hover:bg-black/5"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-charcoal/55">
          <span>{meta.total || 0} đơn hàng</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((x) => x - 1)}
              className="rounded-lg border px-3 py-1.5 disabled:opacity-30"
            >
              Trước
            </button>
            <span>
              {page}/{meta.totalPages || 1}
            </span>
            <button
              disabled={page >= Number(meta.totalPages || 1)}
              onClick={() => setPage((x) => x + 1)}
              className="rounded-lg border px-3 py-1.5 disabled:opacity-30"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
      <Drawer
        title={selected?.order_code || 'Chi tiết đơn hàng'}
        width={600}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#f7f4ef] p-4">
                <div className="text-xs text-charcoal/45">Chi nhánh</div>
                <div className="mt-1 font-semibold">{selected.branch_name}</div>
                <div className="text-sm">
                  {selected.table_code || orderTypeLabel(selected.order_type)}
                </div>
              </div>
              <div className="rounded-xl bg-[#f7f4ef] p-4">
                <div className="text-xs text-charcoal/45">Trạng thái</div>
                <div className="mt-1">
                  <Tag color={tagColor[selected.status]}>{statusLabel(selected.status)}</Tag>
                </div>
                <div className="text-sm">
                  {selected.customer_name === 'Walk-in'
                    ? 'Khách vãng lai'
                    : selected.customer_name || 'Khách vãng lai'}
                </div>
              </div>
            </div>
            <div className="mt-6 text-sm font-semibold">Sản phẩm</div>
            <div className="mt-2 space-y-3">
              {selected.items?.map((i) => (
                <div key={i.id} className="rounded-xl border border-black/5 p-4">
                  <div className="flex justify-between gap-3">
                    <div>
                      <div className="font-semibold">
                        {i.quantity}× {productLabel(i.product_name)}{' '}
                        {i.size_name && `· Cỡ ${i.size_name}`}
                      </div>
                      <div className="mt-1 text-xs text-charcoal/45">
                        Đường {i.sugar_level}% · {iceLabel(i.ice_level)}
                        {i.addons?.length
                          ? ` · ${i.addons.map((a) => addonLabel(a.addon_name)).join(', ')}`
                          : ''}
                      </div>
                    </div>
                    <div className="font-semibold">{money(i.total_price)}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-2 border-t border-black/5 pt-5 text-sm">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{money(selected.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Giảm giá</span>
                <span>-{money(selected.discount_amount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-espresso">
                <span>Tổng cộng</span>
                <span>{money(selected.total_amount)}</span>
              </div>
            </div>
            {nextMap[selected.status]?.length > 0 && (
              <div className="mt-6">
                <div className="mb-2 text-xs font-bold uppercase tracking-wide text-charcoal/40">
                  Quy trình xử lý
                </div>
                <div className="flex flex-wrap gap-2">
                  {nextMap[selected.status].map((s) => (
                    <Button key={s} danger={s === 'CANCELLED'} onClick={() => changeStatus(s)}>
                      {statusLabel(s)}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {!['COMPLETED', 'CANCELLED'].includes(selected.status) && (
              <Button
                onClick={() => setPayOpen(true)}
                className="mt-6 !h-11 w-full !border-espresso !bg-espresso !text-white"
                icon={<Banknote size={17} />}
              >
                Thanh toán {money(selected.total_amount)}
              </Button>
            )}
            {selected.status === 'COMPLETED' && (
              <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
                <div className="flex items-center gap-2 font-semibold">
                  <ShoppingBag size={17} />
                  Đơn hàng đã hoàn tất
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Clock3 size={14} />
                  {paymentMethodLabel(selected.payments?.[0]?.payment_method) ||
                    'Đã thanh toán'} · {selected.payments?.[0]?.transaction_code}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
      <Modal
        title="Hoàn tất thanh toán"
        open={payOpen}
        onCancel={() => setPayOpen(false)}
        onOk={pay}
        okText="Xác nhận thanh toán"
        cancelText="Hủy"
      >
        <div className="mb-4 rounded-xl bg-[#f7f4ef] p-4">
          <div className="text-sm text-charcoal/50">Số tiền cần thanh toán</div>
          <div className="mt-1 text-2xl font-bold text-espresso">
            {money(selected?.total_amount)}
          </div>
        </div>
        <div className="mb-2 text-sm font-medium">Phương thức thanh toán</div>
        <Select
          value={payMethod}
          onChange={setPayMethod}
          className="w-full"
          options={[
            { value: 'CASH', label: 'Tiền mặt' },
            { value: 'QR', label: 'Mã QR demo' },
            { value: 'BANK_TRANSFER', label: 'Chuyển khoản' },
          ]}
        />
      </Modal>
    </div>
  );
}
