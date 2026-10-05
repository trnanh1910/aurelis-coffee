import {
  ArrowRight,
  ArrowUpRight,
  Clock3,
  Coffee,
  Leaf,
  MapPin,
  Search,
  Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { branchService } from '../../services/branchService';
import { brandingService } from '../../services/brandingService';
import { productService } from '../../services/productService';
import { assetUrl } from '../../utils/assetUrl';
import { categoryLabel, productDescriptionLabel, productLabel } from '../../utils/viLabels';

const fallbackProductImage =
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=85';
const defaultHeroImage =
  'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=2200&q=90';
const defaultStoryImage =
  'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1400&q=90';
const defaultClosingImage =
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1800&q=85';
const productImage = (path) => assetUrl(path, fallbackProductImage);

const formatPrice = (price) => `${new Intl.NumberFormat('vi-VN').format(Number(price || 0))} ₫`;

function SectionHeading({ eyebrow, title, description, to, action }) {
  return (
    <div className="home-section-heading">
      <div>
        <span className="home-eyebrow">{eyebrow}</span>
        <h2 className="brand-display">{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {to && (
        <Link className="home-text-link" to={to}>
          {action} <ArrowUpRight size={16} />
        </Link>
      )}
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(false);
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [heroImage, setHeroImage] = useState(defaultHeroImage);
  const [storyImage, setStoryImage] = useState(defaultStoryImage);
  const [closingImage, setClosingImage] = useState(defaultClosingImage);

  useEffect(() => {
    let active = true;
    brandingService
      .getHero()
      .then((url) => {
        if (active && url) setHeroImage(url);
      })
      .catch(() => {});
    brandingService
      .getManagedImage('story')
      .then((url) => {
        if (active && url) setStoryImage(url);
      })
      .catch(() => {});
    brandingService
      .getManagedImage('closing')
      .then((url) => {
        if (active && url) setClosingImage(url);
      })
      .catch(() => {});
    productService
      .list({ limit: 4, featured: true })
      .then((response) => {
        if (active) setProducts(response.data || []);
      })
      .catch(() => {
        if (active) setProductsError(true);
      })
      .finally(() => {
        if (active) setProductsLoading(false);
      });

    branchService
      .list()
      .then((response) => {
        if (active)
          setBranches(response.filter((branch) => branch.status === 'ACTIVE').slice(0, 2));
      })
      .catch(() => {})
      .finally(() => {
        if (active) setBranchesLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const searchMenu = (event) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/menu?q=${encodeURIComponent(query)}` : '/menu');
  };

  return (
    <div className="home-page">
      <section className="home-hero">
        <img
          className="home-hero-image"
          src={heroImage}
          alt="Ánh nắng dịu trong không gian cà phê Aurelis"
          fetchPriority="high"
        />
        <div className="home-hero-overlay" />
        <div className="home-hero-grain" />
        <div className="home-hero-content">
          <div className="home-hero-copy">
            <div className="home-hero-eyebrow">
              <span /> HƯƠNG VỊ CỦA SỰ TINH TẾ
            </div>
            <h1 className="brand-display">
              Lắng đọng thời gian
              <br />
              <em>Trọn vẹn dư vị.</em>
            </h1>
            <p>
              Chắt lọc tinh hoa từ những hạt cà phê hảo hạng, mỗi tách pha đều là một tác phẩm nghệ
              thuật – mang đến cho bạn khoảng không gian tĩnh tại giữa nhịp sống hối hả.
            </p>
            <form className="home-search" onSubmit={searchMenu} role="search">
              <Search size={17} aria-hidden="true" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Hôm nay bạn muốn tìm hương vị nào??"
                aria-label="Tìm món trong thực đơn"
              />
              <button type="submit" aria-label="Tìm trong thực đơn">
                <ArrowRight size={18} />
              </button>
            </form>
            <div className="home-hero-actions">
              <Link to="/menu" className="home-button home-button-light">
                Khám phá thực đơn <ArrowRight size={16} />
              </Link>
              <Link to="/stores" className="home-button home-button-outline">
                <MapPin size={16} /> Tìm cửa hàng
              </Link>
            </div>
          </div>
          <div className="home-hero-note">
            <div className="home-hero-note-mark">
              <Coffee size={22} />
            </div>
            <div>
              <span>TINH HOA AURELIS</span>
              <strong>Tuyệt tác từ sự tỉ mỉ</strong>
            </div>
            <span className="home-hero-note-index">01 / 03</span>
          </div>
        </div>
        <a className="home-scroll-cue" href="#aurelis-selection">
          <span /> CUỘN ĐỂ KHÁM PHÁ
        </a>
      </section>

      <section className="home-promises" aria-label="Cam kết Aurelis">
        <div className="home-promises-inner">
          <div>
            <span className="home-promise-icon">
              <Coffee size={18} />
            </span>
            <p>
              <strong>Hạt Cà Phê Thượng Hạng</strong>
              <small>Chắt lọc tinh hoa từ những vùng trồng danh tiếng.</small>
            </p>
          </div>
          <div>
            <span className="home-promise-icon">
              <Sparkles size={18} />
            </span>
            <p>
              <strong>Nghệ Thuật Rang Xay</strong>
              <small>Đánh thức và tôn vinh mọi nốt hương nguyên bản.</small>
            </p>
          </div>
          <div>
            <span className="home-promise-icon">
              <Leaf size={18} />
            </span>
            <p>
              <strong>Chuẩn Mực Tuyệt Đối</strong>
              <small>Khắt khe và tinh tế trong từng lựa chọn nguyên liệu.</small>
            </p>
          </div>
          <div>
            <span className="home-promise-icon">
              <Clock3 size={18} />
            </span>
            <p>
              <strong>Trải Nghiệm Độc Bản</strong>
              <small>Tận hưởng đặc quyền của không gian tĩnh tại.</small>
            </p>
          </div>
        </div>
      </section>

      <section className="home-selection" id="aurelis-selection">
        <div className="home-content-width">
          <SectionHeading
            eyebrow="AURELIS SELECTION · TUYỂN CHỌN HÔM NAY"
            title="Những điều đáng để nhấp môi."
            description="Một vài hương vị được yêu mến, pha chế từ những nguyên liệu được chúng tôi lựa chọn kỹ lưỡng."
            to="/menu"
            action="Xem toàn bộ thực đơn"
          />
          {productsLoading ? (
            <div className="home-product-grid" aria-label="Đang tải món nổi bật">
              {[0, 1, 2, 3].map((item) => (
                <div className="home-product-skeleton" key={item}>
                  <div />
                  <span />
                  <span />
                </div>
              ))}
            </div>
          ) : productsError ? (
            <div className="home-empty-state">
              <Coffee size={24} />
              <p>Chưa thể tải thực đơn ngay lúc này.</p>
              <Link to="/menu">
                Mở thực đơn <ArrowRight size={15} />
              </Link>
            </div>
          ) : products.length ? (
            <div className="home-product-grid">
              {products.map((product, index) => (
                <Link className="home-product-card" to="/menu" key={product.id}>
                  <div className="home-product-photo">
                    <img
                      src={productImage(product.image)}
                      alt={productLabel(product.name)}
                      loading="lazy"
                    />
                    <span className="home-product-number">0{index + 1}</span>
                    <span className="home-product-arrow">
                      <ArrowUpRight size={17} />
                    </span>
                  </div>
                  <div className="home-product-info">
                    <span className="home-product-category">
                      {categoryLabel(product.category_name)}
                    </span>
                    <div className="home-product-title-row">
                      <h3 className="brand-display">{productLabel(product.name)}</h3>
                      <span>{formatPrice(product.base_price)}</span>
                    </div>
                    <p>{productDescriptionLabel(product.description, product.name)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="home-empty-state">
              <Coffee size={24} />
              <p>Thực đơn đặc trưng đang được chuẩn bị.</p>
              <Link to="/menu">
                Khám phá thực đơn <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="home-story">
        <div className="home-content-width home-story-layout">
          <div className="home-story-visual">
            <img src={storyImage} alt="Hạt cà phê rang thơm tại Aurelis" loading="lazy" />
            <div className="home-story-stamp">
              <span>GOOD COFFEE</span>
              <strong>
                TAKES
                <br />
                TIME
              </strong>
              <span>EST. AURELIS</span>
            </div>
            <span className="home-image-caption">TỪ HẠT CÀ PHÊ ĐẾN KHOẢNH KHẮC CỦA BẠN</span>
          </div>
          <div className="home-story-copy">
            <span className="home-eyebrow">CÂU CHUYỆN AURELIS</span>
            <h2 className="brand-display">
              Không cần vội.
              <br />
              <em>Hương vị cần thời gian.</em>
            </h2>
            <p>
              Chúng tôi tin một tách cà phê ngon bắt đầu từ sự tôn trọng dành cho từng hạt. Aurelis
              chọn nguyên liệu có chủ đích, rang vừa đủ và pha chế bằng đôi tay kiên nhẫn.
            </p>
            <p>
              Để khi bạn dừng chân, điều đọng lại không chỉ là hương vị — mà còn là cảm giác được
              chào đón.
            </p>
            <Link className="home-story-link" to="/story">
              Tìm hiểu câu chuyện của chúng tôi <ArrowRight size={16} />
            </Link>
            <div className="home-signature">
              AURELIS <span>·</span> GOOD THINGS TAKE TIME
            </div>
          </div>
        </div>
      </section>

      <section className="home-stores">
        <div className="home-content-width">
          <SectionHeading
            eyebrow="YOUR NEIGHBOURHOOD COFFEE HOUSE"
            title="Một góc quen đang chờ bạn."
            description="Ghé thăm không gian Aurelis gần bạn — nhâm nhi tách cà phê, thong thả theo nhịp riêng."
            to="/stores"
            action="Tất cả cửa hàng"
          />
          {branchesLoading ? (
            <div className="home-store-grid">
              <div className="home-store-skeleton" />
              <div className="home-store-skeleton" />
            </div>
          ) : branches.length ? (
            <div className="home-store-grid">
              {branches.map((branch, index) => (
                <article className="home-store-card" key={branch.id}>
                  <div className={`home-store-photo home-store-photo-${index + 1}`}>
                    <img
                      src={
                        branch.image
                          ? productImage(branch.image)
                          : index
                            ? 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=85'
                            : 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=85'
                      }
                      alt={`Không gian ${branch.name}`}
                      loading="lazy"
                    />
                    <span>
                      <MapPin size={14} /> AURELIS COFFEE HOUSE
                    </span>
                  </div>
                  <div className="home-store-info">
                    <div>
                      <h3 className="brand-display">{branch.name}</h3>
                      <p>{branch.address}</p>
                    </div>
                    <Link to="/stores" aria-label={`Xem cửa hàng ${branch.name}`}>
                      <ArrowUpRight size={18} />
                    </Link>
                  </div>
                  <div className="home-store-meta">
                    <span>
                      <Clock3 size={14} /> Mỗi ngày · 07:00 – 22:00
                    </span>
                    {branch.phone && (
                      <a href={`tel:${branch.phone}`}>
                        <span>{branch.phone}</span>
                        <ArrowRight size={14} />
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="home-stores-empty">
              <MapPin size={20} />
              <p>Khám phá các không gian Aurelis trên toàn thành phố.</p>
              <Link to="/stores">
                Tìm cửa hàng gần bạn <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="home-closing">
        <div className="home-closing-bg" style={{ '--closing-image': `url("${closingImage}")` }} />
        <div className="home-closing-content">
          <span className="home-eyebrow">A LITTLE MOMENT, JUST FOR YOU</span>
          <h2 className="brand-display">
            Hôm nay, bạn muốn
            <br />
            <em>thưởng thức điều gì?</em>
          </h2>
          <p>Chọn một hương vị mới. Hoặc trở về với món quen thuộc.</p>
          <Link to="/menu" className="home-button home-button-light">
            Đến với thực đơn <ArrowRight size={16} />
          </Link>
        </div>
        <span className="home-closing-wordmark">AURELIS · SLOW COFFEE</span>
      </section>
    </div>
  );
}
