import { ArrowRight, CheckCircle2, Coffee, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { message } from 'antd';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { branchService } from '../../services/branchService';
import { orderService } from '../../services/orderService';
import { assetUrl } from '../../utils/assetUrl';

const money = (n) => `${new Intl.NumberFormat('vi-VN').format(n)} ₫`;
export default function CartPage() {
  const cart = useCart();
  const { user } = useAuth();
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState('');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [completed, setCompleted] = useState(null);
  useEffect(() => {
    branchService
      .list()
      .then((rows) => {
        const active = (rows || []).filter((b) => b.status === 'ACTIVE');
        setBranches(active);
        if (active[0]) setBranchId(String(active[0].id));
      })
      .catch(() => setBranches([]));
  }, []);
  const submit = async (event) => {
    event.preventDefault();
    if (!cart.items.length || !branchId) return;
    setSending(true);
    try {
      const order = await orderService.create({
        branchId: Number(branchId),
        orderType: 'TAKEAWAY',
        note: note.trim() || undefined,
        items: cart.items.map((item) => ({ productId: item.id, quantity: item.quantity })),
      });
      cart.clear();
      setCompleted(order);
      message.success('Đơn hàng đã được gửi đến Aurelis.');
    } catch (error) {
      message.error(error.response?.data?.message || 'Chưa thể tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="cart-page">
      <div className="cart-hero">
        <span className="lux-eyebrow">AURELIS · YOUR SELECTION</span>
        <h1 className="brand-display">
          Giỏ hàng <em>của bạn.</em>
        </h1>
        <p>Một chút hương vị bạn yêu, được chuẩn bị dành riêng cho hôm nay.</p>
      </div>
      <div className="cart-layout">
        <section className="cart-items-panel">
          <div className="cart-panel-heading">
            <div>
              <span className="lux-eyebrow">ĐÃ CHỌN</span>
              <h2>{cart.count} món trong giỏ</h2>
            </div>
            <Link to="/menu">
              Tiếp tục chọn món <ArrowRight size={15} />
            </Link>
          </div>
          {completed ? (
            <div className="cart-success">
              <CheckCircle2 size={34} />
              <span className="lux-eyebrow">ĐẶT HÀNG THÀNH CÔNG</span>
              <h2>Cảm ơn bạn đã chọn Aurelis.</h2>
              <p>
                Mã đơn hàng <strong>{completed.order_code}</strong> đã được tiếp nhận. Chúng tôi sẽ
                chuẩn bị món tại chi nhánh bạn chọn.
              </p>
              <Link className="lux-button lux-button-dark" to="/account">
                Theo dõi đơn hàng <ArrowRight size={15} />
              </Link>
            </div>
          ) : cart.items.length ? (
            <div className="cart-list">
              {cart.items.map((item) => (
                <article className="cart-item" key={item.key}>
                  <div className="cart-item-image">
                    {item.image ? (
                      <img src={assetUrl(item.image, '')} alt="" />
                    ) : (
                      <Coffee size={24} />
                    )}
                  </div>
                  <div className="cart-item-details">
                    <h3>{item.name}</h3>
                    <span>Thức uống Aurelis</span>
                    <strong>{money(item.price)}</strong>
                    <div className="cart-quantity">
                      <button
                        aria-label="Giảm số lượng"
                        onClick={() => cart.setQuantity(item.key, item.quantity - 1)}
                      >
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        aria-label="Tăng số lượng"
                        onClick={() => cart.setQuantity(item.key, item.quantity + 1)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-end">
                    <strong>{money(item.price * item.quantity)}</strong>
                    <button
                      className="cart-remove"
                      onClick={() => cart.remove(item.key)}
                      aria-label={`Xóa ${item.name}`}
                    >
                      <Trash2 size={16} />
                      <span>Xóa</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="cart-empty">
              <span>
                <ShoppingBag size={25} />
              </span>
              <h2>Giỏ hàng đang chờ bạn.</h2>
              <p>Khám phá thực đơn và chọn thức uống cho khoảnh khắc của bạn.</p>
              <Link className="lux-button lux-button-dark" to="/menu">
                Khám phá thực đơn <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </section>
        {!completed && (
          <aside className="cart-summary">
            <span className="lux-eyebrow">TÓM TẮT ĐƠN HÀNG</span>
            <h2>Hoàn tất lựa chọn</h2>
            <div className="cart-summary-line">
              <span>Tạm tính · {cart.count} món</span>
              <strong>{money(cart.subtotal)}</strong>
            </div>
            <div className="cart-summary-line">
              <span>Hình thức nhận</span>
              <strong>Mang đi</strong>
            </div>
            {cart.items.length > 0 && (
              <form onSubmit={submit} className="cart-checkout-form">
                <label>
                  Chi nhánh nhận món
                  <select value={branchId} onChange={(e) => setBranchId(e.target.value)} required>
                    <option value="" disabled>
                      Chọn chi nhánh
                    </option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Lời nhắn cho Aurelis{' '}
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ví dụ: ít đá, không ống hút…"
                    rows="3"
                    maxLength="300"
                  />
                </label>
                {user ? (
                  <button
                    className="lux-button lux-button-dark"
                    type="submit"
                    disabled={sending || !branchId || !branches.length}
                  >
                    {sending ? 'Đang gửi đơn…' : 'Đặt hàng · ' + money(cart.subtotal)}{' '}
                    <ArrowRight size={15} />
                  </button>
                ) : (
                  <Link className="lux-button lux-button-dark" to="/login">
                    Đăng nhập để đặt hàng <ArrowRight size={15} />
                  </Link>
                )}
              </form>
            )}
            {!branches.length && cart.items.length > 0 && (
              <p className="cart-hint">
                Hiện chưa tải được danh sách chi nhánh. Vui lòng thử lại sau.
              </p>
            )}
            <p className="cart-summary-note">
              Thanh toán và xác nhận đơn được thực hiện tại chi nhánh.
            </p>
          </aside>
        )}
      </div>
    </div>
  );
}
