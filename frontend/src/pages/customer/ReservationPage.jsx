import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { branchService } from '../../services/branchService';
import { brandingService } from '../../services/brandingService';

const today = new Date().toLocaleDateString('en-CA');
export default function ReservationPage() {
  const [branches, setBranches] = useState([]);
  const [sent, setSent] = useState(false);
  const [heroImage, setHeroImage] = useState(null);
  useEffect(() => {
    branchService
      .list()
      .then((items) => setBranches((items || []).filter((b) => b.status === 'ACTIVE')))
      .catch(() => {});
  }, []);
  useEffect(() => {
    brandingService
      .getManagedImage('reservationHero')
      .then(setHeroImage)
      .catch(() => {});
  }, []);
  const submit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const branch = branches.find((item) => String(item.id) === data.get('branch'));
    const subject = encodeURIComponent('Yêu cầu đặt bàn Aurelis');
    const body = encodeURIComponent(
      `Xin chào Aurelis,\n\nTôi muốn đặt bàn:\nHọ tên: ${data.get('name')}\nĐiện thoại: ${data.get('phone')}\nCửa hàng: ${branch?.name || 'Aurelis'}\nNgày: ${data.get('date')}\nGiờ: ${data.get('time')}\nSố khách: ${data.get('guests')}\nGhi chú: ${data.get('note') || 'Không có'}\n\nVui lòng xác nhận giúp tôi.`,
    );
    window.location.href = `mailto:hello@aureliscoffee.com?subject=${subject}&body=${body}`;
    setSent(true);
  };
  return (
    <div className="reservation-page">
      <section className="reservation-visual">
        <img
          src={
            heroImage ||
            'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1500&q=90'
          }
          alt="Bàn cà phê trong không gian Aurelis"
        />
        <div />
        <div className="reservation-visual-copy">
          <span className="lux-eyebrow">A TABLE FOR YOUR MOMENT</span>
          <h1 className="brand-display">
            Một chỗ ngồi
            <br />
            <em>đúng lúc.</em>
          </h1>
          <p>
            Gặp gỡ thân tình hay chút thời gian dành riêng cho mình — chúng tôi luôn vui lòng chuẩn
            bị.
          </p>
          <span className="reservation-hours">
            <Clock3 size={15} /> Mỗi ngày · 07:00 – 22:00
          </span>
        </div>
      </section>
      <section className="reservation-form-wrap">
        <div className="reservation-form-heading">
          <span className="lux-eyebrow">AURELIS COFFEE HOUSE</span>
          <h2 className="brand-display">Đặt bàn</h2>
          <p>Để lại thông tin, chúng tôi sẽ sớm liên hệ xác nhận với bạn.</p>
        </div>
        {sent && (
          <div className="reservation-notice">
            <CheckCircle2 size={19} />
            <span>
              Yêu cầu đã được chuẩn bị trong ứng dụng email. Vui lòng gửi email để Aurelis xác nhận
              bàn.
            </span>
          </div>
        )}
        <form className="reservation-form" onSubmit={submit}>
          <label>
            Họ và tên
            <input name="name" required autoComplete="name" placeholder="Tên của bạn" />
          </label>
          <label>
            Số điện thoại
            <input name="phone" required type="tel" autoComplete="tel" placeholder="09xx xxx xxx" />
          </label>
          <label>
            Cửa hàng
            <select name="branch" required defaultValue="">
              <option value="" disabled>
                Chọn cửa hàng
              </option>
              {branches.map((b) => (
                <option value={b.id} key={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <div className="reservation-fields">
            <label>
              <span>
                <CalendarDays size={15} /> Ngày
              </span>
              <input type="date" name="date" min={today} defaultValue={today} required />
            </label>
            <label>
              <span>
                <Clock3 size={15} /> Giờ
              </span>
              <select name="time" defaultValue="09:00">
                {Array.from({ length: 16 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`).map(
                  (t) => (
                    <option key={t}>{t}</option>
                  ),
                )}
              </select>
            </label>
          </div>
          <label>
            <span>
              <Users size={15} /> Số khách
            </span>
            <select name="guests" defaultValue="2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>
                  {n} khách
                </option>
              ))}
            </select>
          </label>
          <label>
            Ghi chú <small>(không bắt buộc)</small>
            <textarea name="note" rows="3" placeholder="Dịp đặc biệt, yêu cầu chỗ ngồi..." />
          </label>
          <button className="lux-button lux-button-dark" type="submit">
            Gửi yêu cầu đặt bàn <ArrowRight size={16} />
          </button>
          <p className="reservation-footnote">
            Yêu cầu của bạn chỉ được xác nhận sau khi cửa hàng liên hệ lại.
          </p>
        </form>
      </section>
    </div>
  );
}
