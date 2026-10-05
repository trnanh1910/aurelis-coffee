import { ArrowRight, Clock3, MapPin, Phone, Navigation, Coffee } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { branchService } from '../../services/branchService';
import { statusLabel } from '../../utils/viLabels';
import { brandingService } from '../../services/brandingService';
import { assetUrl } from '../../utils/assetUrl';

const photos = [
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1400&q=85',
];
export default function StoresPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [heroImage, setHeroImage] = useState(null);
  useEffect(() => {
    brandingService
      .getManagedImage('storesHero')
      .then(setHeroImage)
      .catch(() => {});
  }, []);
  useEffect(() => {
    branchService
      .list()
      .then((data) => setStores((data || []).filter((s) => s.status === 'ACTIVE')))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="stores-page">
      <section className="stores-hero">
        <img src={heroImage || photos[0]} alt="Không gian cà phê ấm áp" />
        <div />
        <div className="stores-hero-copy">
          <span className="lux-eyebrow">A PLACE TO PAUSE</span>
          <h1 className="brand-display">
            Một góc quen
            <br />
            <em>đang chờ bạn.</em>
          </h1>
          <p>
            Mỗi cửa hàng Aurelis là một khoảng lặng ấm áp, nơi cà phê ngon và những cuộc gặp gỡ tìm
            thấy nhau.
          </p>
          <a className="lux-button lux-button-light" href="#our-stores">
            Tìm không gian gần bạn <ArrowRight size={16} />
          </a>
        </div>
      </section>
      <section className="stores-content" id="our-stores">
        <div className="catalog-heading">
          <div>
            <span className="lux-eyebrow">GẶP GỠ AURELIS</span>
            <h2 className="brand-display">Không gian của chúng tôi</h2>
            <p>Chọn điểm dừng chân, chúng tôi sẽ giữ sẵn một tách cà phê cho bạn.</p>
          </div>
          <span className="catalog-count">{stores.length} ĐỊA ĐIỂM</span>
        </div>
        {loading ? (
          <div className="store-grid">
            {[0, 1].map((x) => (
              <div className="store-skeleton" key={x} />
            ))}
          </div>
        ) : error ? (
          <div className="catalog-empty">
            <MapPin />
            <h3>Chưa thể tải danh sách cửa hàng</h3>
            <p>Vui lòng thử lại sau ít phút.</p>
            <button onClick={() => window.location.reload()}>Tải lại</button>
          </div>
        ) : stores.length ? (
          <div className="store-grid">
            {stores.map((s, i) => (
              <article className="store-card" key={s.id}>
                <div className="store-card-photo">
                  <img
                    src={assetUrl(s.image) || photos[i % photos.length]}
                    alt={`Không gian ${s.name}`}
                    loading="lazy"
                  />
                  <span>
                    <MapPin size={14} /> AURELIS COFFEE HOUSE
                  </span>
                </div>
                <div className="store-card-body">
                  <div className="store-name-line">
                    <div>
                      <span className="lux-eyebrow">ĐIỂM ĐẾN {String(i + 1).padStart(2, '0')}</span>
                      <h3 className="brand-display">{s.name}</h3>
                    </div>
                    <span className="store-status">{statusLabel(s.status)}</span>
                  </div>
                  <p className="store-address">
                    <MapPin size={16} />
                    {s.address}
                  </p>
                  <div className="store-details">
                    <span>
                      <Clock3 size={15} />
                      {String(s.opening_time || '07:00').slice(0, 5)} –{' '}
                      {String(s.closing_time || '22:00').slice(0, 5)} mỗi ngày
                    </span>
                    {s.phone && (
                      <a href={`tel:${s.phone}`}>
                        <Phone size={15} />
                        {s.phone}
                      </a>
                    )}
                  </div>
                  <div className="store-actions">
                    {s.phone ? (
                      <a className="lux-button lux-button-dark" href={`tel:${s.phone}`}>
                        Gọi cửa hàng <Phone size={15} />
                      </a>
                    ) : (
                      <Link className="lux-button lux-button-dark" to="/reservation">
                        Đặt bàn <ArrowRight size={15} />
                      </Link>
                    )}
                    <a
                      className="store-map-link"
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address || s.name)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Chỉ đường <Navigation size={15} />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="catalog-empty">
            <Coffee />
            <h3>Những góc Aurelis sẽ sớm gặp bạn</h3>
            <p>Danh sách cửa hàng hiện chưa có sẵn.</p>
          </div>
        )}
      </section>
      <section className="stores-reserve">
        <div>
          <span className="lux-eyebrow">YOUR TABLE, YOUR MOMENT</span>
          <h2 className="brand-display">
            Để chúng tôi chuẩn bị
            <br />
            <em>một chỗ ngồi cho bạn.</em>
          </h2>
        </div>
        <Link className="lux-button lux-button-light" to="/reservation">
          Đặt bàn ngay <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
