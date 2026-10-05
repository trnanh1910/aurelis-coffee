import { Button, Checkbox, Input, InputNumber, Modal, Radio, Select, message } from 'antd';
import {
  ChevronLeft,
  Coffee,
  Minus,
  Plus,
  Printer,
  Pencil,
  Search,
  ShoppingCart,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../../components/common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosClient';
import { branchService } from '../../services/branchService';
import { orderService } from '../../services/orderService';
import { tableService } from '../../services/tableService';
import {
  addonLabel,
  areaLabel,
  categoryLabel,
  iceLabel,
  paymentMethodLabel,
  productDescriptionLabel,
  productLabel,
} from '../../utils/viLabels';

const money = (v) => new Intl.NumberFormat('vi-VN').format(Number(v || 0)) + ' ₫';
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
export default function POSPage() {
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState([]),
    [category, setCategory] = useState(''),
    [products, setProducts] = useState([]),
    [search, setSearch] = useState(''),
    [branches, setBranches] = useState([]),
    [branchId, setBranchId] = useState(user?.branchId ? String(user.branchId) : ''),
    [tables, setTables] = useState([]),
    [tableId, setTableId] = useState(''),
    [cart, setCart] = useState([]),
    [voucher, setVoucher] = useState(''),
    [custom, setCustom] = useState(null),
    [editingKey, setEditingKey] = useState(null),
    [customData, setCustomData] = useState({
      sizeId: null,
      sugarLevel: '100',
      iceLevel: 'NORMAL',
      addonIds: [],
      quantity: 1,
      note: '',
    }),
    [payOpen, setPayOpen] = useState(false),
    [payMethod, setPayMethod] = useState('CASH'),
    [lastOrder, setLastOrder] = useState(null),
    [loading, setLoading] = useState(false),
    [productsLoading, setProductsLoading] = useState(false);
  useEffect(() => {
    Promise.all([api.get('/categories'), branchService.list()])
      .then(([c, b]) => {
        setCategories(c.data.data);
        setBranches(b);
        if (!branchId && b[0]) setBranchId(String(b[0].id));
      })
      .catch(() => message.error('Chưa thể tải danh mục hoặc danh sách chi nhánh.'));
  }, []);
  useEffect(() => {
    setProductsLoading(true);
    api
      .get('/products', {
        params: {
          limit: 50,
          category: category || undefined,
          search: search || undefined,
          status: 'ACTIVE',
        },
      })
      .then((r) => setProducts(r.data.data))
      .catch(() => {
        setProducts([]);
        message.error('Chưa thể tải thực đơn. Vui lòng thử lại.');
      })
      .finally(() => setProductsLoading(false));
  }, [category, search]);
  useEffect(() => {
    if (branchId) tableService.list({ branchId, status: 'AVAILABLE' }).then(setTables);
  }, [branchId, lastOrder]);
  const openProduct = async (p) => {
    try {
      const d = (await api.get(`/products/${p.id}`)).data.data;
      setCustom(d);
      setEditingKey(null);
      setCustomData({
        sizeId: d.sizes?.[0]?.id || null,
        sugarLevel: '100',
        iceLevel: 'NORMAL',
        addonIds: [],
        quantity: 1,
        note: '',
      });
    } catch (e) {
      message.error(e.response?.data?.message || 'Không thể tải thông tin sản phẩm');
    }
  };
  const editCartItem = async (item) => {
    try {
      const d = (await api.get(`/products/${item.productId}`)).data.data;
      setCustom(d);
      setEditingKey(item.key);
      setCustomData({
        sizeId: item.sizeId || d.sizes?.[0]?.id || null,
        sugarLevel: String(item.sugarLevel ?? '100'),
        iceLevel: item.iceLevel || 'NORMAL',
        addonIds: item.addonIds || [],
        quantity: item.quantity || 1,
        note: item.note || '',
      });
    } catch (e) {
      message.error(e.response?.data?.message || 'Không thể tải lựa chọn của món này.');
    }
  };
  const addItem = () => {
    if (!custom) return;
    const size = selectedSize;
    const addons = selectedAddons;
    const unit = customUnitPrice;
    const nextItem = {
        key: uid(),
        productId: custom.id,
        name: custom.name,
        image: custom.image,
        sizeId: customData.sizeId,
        sizeName: size?.size_name || '',
        addonIds: customData.addonIds,
        addonNames: addons.map((a) => a.name),
        sugarLevel: customData.sugarLevel,
        iceLevel: customData.iceLevel,
        quantity: Number(customData.quantity || 1),
        note: customData.note,
        unitPrice: unit,
      };
    if (editingKey) {
      nextItem.key = editingKey;
      setCart((items) => items.map((item) => item.key === editingKey ? nextItem : item));
      message.success('Đã cập nhật tùy chọn món trong đơn.');
    } else {
      setCart((items) => [...items, nextItem]);
    }
    setEditingKey(null);
    setCustom(null);
  };
  const selectedSize = custom?.sizes?.find((size) => String(size.id) === String(customData.sizeId));
  const selectedAddons = (custom?.addons || []).filter((addon) =>
    customData.addonIds.some((id) => String(id) === String(addon.id)),
  );
  const customUnitPrice =
    Number(custom?.base_price || 0) +
    Number(selectedSize?.extra_price || 0) +
    selectedAddons.reduce((total, addon) => total + Number(addon.price || 0), 0);
  const customTotalPrice = customUnitPrice * Number(customData.quantity || 1);
  const subtotal = useMemo(() => cart.reduce((n, i) => n + i.unitPrice * i.quantity, 0), [cart]);
  const changeQty = (key, d) =>
    setCart((x) =>
      x.map((i) => (i.key === key ? { ...i, quantity: Math.max(1, i.quantity + d) } : i)),
    );
  const remove = (key) => setCart((x) => x.filter((i) => i.key !== key));
  const payload = () => ({
    branchId: Number(branchId),
    tableId: Number(tableId),
    orderType: 'DINE_IN',
    voucherCode: voucher || undefined,
    items: cart.map((i) => ({
      productId: i.productId,
      sizeId: i.sizeId,
      quantity: i.quantity,
      sugarLevel: i.sugarLevel,
      iceLevel: i.iceLevel,
      addonIds: i.addonIds,
      note: i.note,
    })),
  });
  const validate = () => {
    if (!branchId) {
      message.warning('Vui lòng chọn chi nhánh');
      return false;
    }
    if (!tableId) {
      message.warning('Vui lòng chọn một bàn đang trống');
      return false;
    }
    if (!cart.length) {
      message.warning('Vui lòng thêm ít nhất một sản phẩm');
      return false;
    }
    return true;
  };
  const saveOrder = async (checkout = false) => {
    if (!validate()) return;
    try {
      setLoading(true);
      const created = await orderService.create(payload());
      const order = await orderService.changeStatus(created.id, 'CONFIRMED');
      setLastOrder(order);
      message.success(`${order.order_code} đã được gửi đến quầy pha chế`);
      if (checkout) setPayOpen(true);
      else {
        setCart([]);
        setTableId('');
        setVoucher('');
      }
    } catch (e) {
      message.error(e.response?.data?.message || 'Không thể tạo đơn hàng');
    } finally {
      setLoading(false);
    }
  };
  const pay = async () => {
    try {
      setLoading(true);
      const paid = await orderService.pay(lastOrder.id, {
        paymentMethod: payMethod,
        amount: lastOrder.total_amount,
      });
      setLastOrder(paid);
      setPayOpen(false);
      setCart([]);
      setTableId('');
      setVoucher('');
      message.success(`Thanh toán thành công · +${paid.earned_points || 0} điểm`);
    } catch (e) {
      message.error(e.response?.data?.message || 'Thanh toán thất bại');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="cashier-pos min-h-screen bg-[#f3efe8] text-charcoal">
      <header className="cashier-header flex h-16 items-center justify-between border-b border-black/5 bg-white px-4">
        <div className="flex items-center gap-5">
          <BrandLogo />
          <div className="hidden h-7 w-px bg-black/10 md:block" />
          <div className="hidden text-sm md:block">
            <div className="font-semibold">Bán hàng tại quầy</div>
            <div className="text-xs text-charcoal/40">{user?.fullName}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            className="w-44"
            value={branchId || undefined}
            disabled={user?.role !== 'ADMIN'}
            onChange={(v) => {
              setBranchId(v);
              setTableId('');
            }}
            options={branches.map((b) => ({ value: String(b.id), label: b.name }))}
          />
          {['ADMIN', 'MANAGER'].includes(user?.role) && (
            <Link className="rounded-lg border px-3 py-2 text-sm" to="/admin/dashboard">
              <ChevronLeft size={16} className="inline" /> Quản trị
            </Link>
          )}
          <button onClick={logout} className="rounded-lg bg-espresso px-3 py-2 text-sm text-white">
            Đăng xuất
          </button>
        </div>
      </header>
      <div className="cashier-layout grid min-h-[calc(100vh-64px)] lg:grid-cols-[170px_1fr_390px]">
        <aside className="cashier-category-sidebar hidden border-r border-black/5 bg-white p-3 lg:block">
          <div className="px-3 pb-3 pt-2 text-[10px] font-bold uppercase tracking-[.18em] text-charcoal/35">
            Danh mục
          </div>
          <button
            onClick={() => setCategory('')}
            className={`cashier-category-button mb-1 w-full rounded-xl px-3 py-3 text-left text-sm ${!category ? 'is-active bg-espresso text-white' : 'hover:bg-[#f6f2ec]'}`}
          >
            Tất cả món
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(String(c.id))}
              className={`cashier-category-button mb-1 w-full rounded-xl px-3 py-3 text-left text-sm ${category === String(c.id) ? 'is-active bg-espresso text-white' : 'hover:bg-[#f6f2ec]'}`}
            >
              {categoryLabel(c.name)}
            </button>
          ))}
        </aside>
        <main className="cashier-catalog min-w-0 p-4 md:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="brand-display text-2xl text-espresso">Tạo đơn hàng</h1>
              <p className="text-xs text-charcoal/45">
                Chọn món, tùy chỉnh và gửi đơn đến quầy pha chế.
              </p>
            </div>
            <label className="cashier-search flex w-full items-center gap-2 rounded-xl bg-white px-4 shadow-sm sm:w-72">
              <Search size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent py-3 text-sm outline-none"
                placeholder="Tìm món..."
              />
            </label>
          </div>
          <div className="cashier-mobile-categories lg:hidden">
            <button className={!category ? 'is-active' : ''} onClick={() => setCategory('')}>Tất cả</button>
            {categories.map((c) => <button key={c.id} className={category === String(c.id) ? 'is-active' : ''} onClick={() => setCategory(String(c.id))}>{categoryLabel(c.name)}</button>)}
          </div>
          <div className="cashier-product-grid mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {productsLoading && Array.from({ length: 8 }, (_, index) => <div className="cashier-product-skeleton" key={index}><i /><span /><b /></div>)}
            {!productsLoading && products.map((p) => (
              <button
                key={p.id}
                onClick={() => openProduct(p)}
                className="cashier-product-card overflow-hidden rounded-2xl border border-black/5 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="cashier-product-visual">
                  <span className="cashier-product-kicker">{categoryLabel(p.category_name) || 'AURELIS SELECTION'}</span>
                  <span className="cashier-product-index">{String(p.id).padStart(2, '0')}</span>
                  <span className="cashier-card-add"><Plus size={15} /></span>
                </div>
                <div className="cashier-product-info p-3">
                  <div className="line-clamp-1 font-semibold text-espresso">
                    {productLabel(p.name)}
                  </div>
                  <div className="cashier-product-price"><span>Giá cơ bản</span><strong>{money(p.base_price)}</strong></div>
                </div>
              </button>
            ))}
            {!productsLoading && !products.length && <div className="cashier-empty-products"><Coffee size={27} /><strong>Chưa tìm thấy món phù hợp</strong><span>Thử từ khóa khác hoặc chọn danh mục khác.</span></div>}
          </div>
        </main>
        <aside className="cashier-cart border-l border-black/5 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-espresso">Đơn hàng hiện tại</div>
              <div className="text-xs text-charcoal/40">{cart.length} dòng sản phẩm</div>
            </div>
            <ShoppingCart size={21} className="text-coffee" />
          </div>
          <Select
            className="mt-4 w-full"
            placeholder="Chọn bàn đang trống"
            value={tableId || undefined}
            onChange={setTableId}
            options={tables.map((t) => ({
              value: String(t.id),
              label: `${t.table_code} · ${areaLabel(t.area)} · ${t.capacity} chỗ`,
            }))}
          />
          <div className="mt-4 max-h-[45vh] space-y-3 overflow-y-auto pr-1">
            {cart.length === 0 && (
              <div className="rounded-2xl border border-dashed border-black/10 py-12 text-center text-sm text-charcoal/40">
                <ShoppingCart className="mx-auto mb-2" />
                Đơn hàng đang trống
              </div>
            )}
            {cart.map((i) => (
              <div key={i.key} className="rounded-xl bg-[#f8f5ef] p-3">
                <div className="flex justify-between gap-2">
                  <div className="min-w-0">
                    <button className="cashier-cart-item-name" onClick={() => editCartItem(i)} title="Sửa lựa chọn món">
                      <span className="truncate">{productLabel(i.name)}</span><Pencil size={12} />
                    </button>
                    <div className="mt-0.5 text-[11px] text-charcoal/45">
                      {i.sizeName ? `Cỡ ${i.sizeName}` : 'Tiêu chuẩn'} · {i.sugarLevel}% đường ·{' '}
                      {iceLabel(i.iceLevel)}
                      {i.addonNames.length ? ` · ${i.addonNames.map(addonLabel).join(', ')}` : ''}
                    </div>
                  </div>
                  <button aria-label="Xóa sản phẩm" onClick={() => remove(i.key)}>
                    <Trash2 size={15} className="text-rose-500" />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center rounded-lg bg-white">
                    <button
                      aria-label="Giảm số lượng"
                      onClick={() => changeQty(i.key, -1)}
                      className="p-1.5"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-7 text-center text-xs font-bold">{i.quantity}</span>
                    <button
                      aria-label="Tăng số lượng"
                      onClick={() => changeQty(i.key, 1)}
                      className="p-1.5"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="text-sm font-semibold">{money(i.unitPrice * i.quantity)}</div>
                </div>
              </div>
            ))}
          </div>
          <Input
            className="mt-4"
            value={voucher}
            onChange={(e) => setVoucher(e.target.value.toUpperCase())}
            placeholder="Mã ưu đãi (không bắt buộc)"
          />
          <div className="mt-4 space-y-2 border-t border-black/5 pt-4 text-sm">
            <div className="flex justify-between text-charcoal/50">
              <span>Tạm tính dự kiến</span>
              <span>{money(subtotal)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-espresso">
              <span>Tổng cộng</span>
              <span>{money(subtotal)}</span>
            </div>
            <div className="text-[11px] text-charcoal/40">
              Mã ưu đãi và số tiền cuối cùng sẽ được máy chủ kiểm tra, tính toán lại.
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button disabled={loading} onClick={() => saveOrder(false)} className="!h-11">
              Lưu đơn
            </Button>
            <Button
              loading={loading}
              onClick={() => saveOrder(true)}
              className="!h-11 !border-espresso !bg-espresso !text-white"
            >
              Thanh toán
            </Button>
          </div>
          {lastOrder?.status === 'COMPLETED' && (
            <button
              onClick={() => window.print()}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm"
            >
              <Printer size={16} />
              In hóa đơn gần nhất
            </button>
          )}
        </aside>
      </div>
      <Modal rootClassName="cashier-modal-root cashier-custom-modal"
        title={custom ? productLabel(custom.name) : 'Tùy chỉnh sản phẩm'}
        open={Boolean(custom)}
        onCancel={() => { setCustom(null); setEditingKey(null); }}
        onOk={addItem}
        okText={`${editingKey ? 'Cập nhật món' : 'Thêm vào đơn'} · ${money(customTotalPrice)}`}
        cancelText="Hủy"
        width={600}
      >
        {custom && (
          <div>
            <div className="rounded-xl bg-[#f8f5ef] p-4">
              <div className="font-semibold text-espresso">
                Giá cơ bản {money(custom.base_price)}
              </div>
              <div className="mt-1 text-sm text-charcoal/50">
                {productDescriptionLabel(custom.description, custom.name)}
              </div>
            </div>
            <div className="cashier-custom-price-summary">
              <div><span>Đơn giá tùy chọn</span><strong>{money(customUnitPrice)}</strong></div>
              <div><span>Số lượng</span><strong>× {customData.quantity}</strong></div>
              <div className="cashier-custom-grand"><span>Tổng món này</span><strong>{money(customTotalPrice)}</strong></div>
            </div>
            {custom.sizes?.length > 0 && (
              <div className="mt-5">
                <div className="mb-2 text-sm font-semibold">Kích cỡ</div>
                <Radio.Group
                  value={customData.sizeId}
                  onChange={(e) => setCustomData((x) => ({ ...x, sizeId: e.target.value }))}
                >
                  {custom.sizes.map((s) => (
                    <Radio.Button key={s.id} value={s.id}>
                      {s.size_name} {Number(s.extra_price) > 0 && `+${money(s.extra_price)}`}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </div>
            )}
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <div className="mb-2 text-sm font-semibold">Đường</div>
                <Select
                  className="w-full"
                  value={customData.sugarLevel}
                  onChange={(v) => setCustomData((x) => ({ ...x, sugarLevel: v }))}
                  options={['0', '30', '50', '70', '100'].map((v) => ({
                    value: v,
                    label: `${v}%`,
                  }))}
                />
              </div>
              <div>
                <div className="mb-2 text-sm font-semibold">Đá</div>
                <Select
                  className="w-full"
                  value={customData.iceLevel}
                  onChange={(v) => setCustomData((x) => ({ ...x, iceLevel: v }))}
                  options={[
                    { value: 'NO_ICE', label: 'Không đá' },
                    { value: 'LESS_ICE', label: 'Ít đá' },
                    { value: 'NORMAL', label: 'Đá bình thường' },
                  ]}
                />
              </div>
            </div>
            <div className="mt-5">
              <div className="mb-2 text-sm font-semibold">Món thêm</div>
              <Checkbox.Group
                className="grid grid-cols-2 gap-2"
                value={customData.addonIds}
                onChange={(v) => setCustomData((x) => ({ ...x, addonIds: v }))}
              >
                {custom.addons?.map((a) => (
                  <Checkbox key={a.id} value={a.id}>
                    {addonLabel(a.name)} +{money(a.price)}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            </div>
            <div className="mt-5 grid grid-cols-[110px_1fr] gap-3">
              <div>
                <div className="mb-2 text-sm font-semibold">Số lượng</div>
                <InputNumber
                  min={1}
                  max={20}
                  precision={0}
                  className="w-full"
                  value={customData.quantity}
                  onChange={(v) => setCustomData((x) => ({ ...x, quantity: Math.max(1, Math.min(20, Number(v) || 1)) }))}
                />
              </div>
              <div>
                <div className="mb-2 text-sm font-semibold">Ghi chú</div>
                <Input
                  showCount
                  maxLength={160}
                  value={customData.note}
                  onChange={(e) => setCustomData((x) => ({ ...x, note: e.target.value }))}
                  placeholder="Ví dụ: nóng hơn, ít ngọt..."
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
      <Modal rootClassName="cashier-modal-root"
        title="Thanh toán"
        open={payOpen}
        onCancel={() => setPayOpen(false)}
        onOk={pay}
        confirmLoading={loading}
        okText="Hoàn tất thanh toán"
        cancelText="Hủy"
      >
        <div className="rounded-xl bg-[#f8f5ef] p-4">
          <div className="text-sm text-charcoal/50">Tổng tiền được hệ thống tính lại</div>
          <div className="mt-1 text-3xl font-bold text-espresso">
            {money(lastOrder?.total_amount)}
          </div>
          {Number(lastOrder?.discount_amount) > 0 && (
            <div className="mt-1 text-sm text-emerald-700">
              Đã giảm {money(lastOrder.discount_amount)} nhờ mã ưu đãi
            </div>
          )}
        </div>
        <div className="mb-2 mt-5 text-sm font-semibold">Phương thức thanh toán</div>
        <Radio.Group
          className="grid grid-cols-3 gap-2"
          value={payMethod}
          onChange={(e) => setPayMethod(e.target.value)}
        >
          <Radio.Button value="CASH">Tiền mặt</Radio.Button>
          <Radio.Button value="QR">Mã QR</Radio.Button>
          <Radio.Button value="BANK_TRANSFER">Chuyển khoản</Radio.Button>
        </Radio.Group>
      </Modal>
      {lastOrder?.status === 'COMPLETED' && (
        <div className="print-receipt">
          <div style={{ textAlign: 'center' }}>
            <strong>AURELIS COFFEE</strong>
            <br />
            <span>{lastOrder.branch_name}</span>
          </div>
          <hr />
          <div>Đơn hàng: {lastOrder.order_code}</div>
          <div>Bàn: {lastOrder.table_code || '—'}</div>
          <div>Thu ngân: {user?.fullName}</div>
          <div>Thanh toán: {paymentMethodLabel(lastOrder.payments?.[0]?.payment_method)}</div>
          <hr />
          {lastOrder.items?.map((i) => (
            <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span>
                {i.quantity}× {productLabel(i.product_name)}
              </span>
              <span>{money(i.total_price)}</span>
            </div>
          ))}
          <hr />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Tạm tính</span>
            <span>{money(lastOrder.subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Giảm giá</span>
            <span>-{money(lastOrder.discount_amount)}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            <span>Tổng cộng</span>
            <span>{money(lastOrder.total_amount)}</span>
          </div>
          <div style={{ marginTop: 18, textAlign: 'center' }}>
            Cảm ơn bạn đã chia sẻ khoảnh khắc cùng Aurelis.
          </div>
        </div>
      )}
    </div>
  );
}
