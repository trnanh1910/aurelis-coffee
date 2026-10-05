import { ArrowRight, Coffee, Heart, Search, ShoppingBag, SlidersHorizontal, X } from 'lucide-react';
import { message } from 'antd';
import { useCart } from '../../context/CartContext';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/axiosClient';
import { productService } from '../../services/productService';
import { brandingService } from '../../services/brandingService';
import { assetUrl } from '../../utils/assetUrl';
import { categoryLabel, productDescriptionLabel, productLabel } from '../../utils/viLabels';

const asset = (path) =>
  assetUrl(
    path,
    'https://images.unsplash.com/photo-1511081692775-05d0f180a065?auto=format&fit=crop&w=900&q=85',
  );
const price = (value) => `${new Intl.NumberFormat('vi-VN').format(Number(value || 0))} ₫`;
const readFavorites = () => {
  try {
    return JSON.parse(localStorage.getItem('aurelis-menu-favorites') || '[]').map(String);
  } catch {
    return [];
  }
};

export default function MenuPage() {
  const cart = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('recommended');
  const [favorites, setFavorites] = useState(readFavorites);
  const favoritesOnly = searchParams.get('favorites') === '1';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);
  const [heroImage, setHeroImage] = useState(null);

  useEffect(() => {
    api
      .get('/categories')
      .then((r) => setCats(r.data.data || []))
      .catch(() => setCats([]));
  }, []);
  useEffect(() => {
    brandingService
      .getManagedImage('menuHero')
      .then(setHeroImage)
      .catch(() => {});
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      setError(false);
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          search.trim() ? next.set('q', search.trim()) : next.delete('q');
          category ? next.set('category', category) : next.delete('category');
          return next;
        },
        { replace: true },
      );
      productService
        .list({ search, category: category || undefined, limit: 48 })
        .then((r) => setProducts(r.data || []))
        .catch(() => {
          setProducts([]);
          setError(true);
        })
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [search, category, reload, setSearchParams]);

  useEffect(() => {
    localStorage.setItem('aurelis-menu-favorites', JSON.stringify(favorites));
  }, [favorites]);
  const visibleProducts = useMemo(
    () =>
      [...products]
        .filter((product) => !favoritesOnly || favorites.includes(String(product.id)))
        .sort((a, b) => {
          if (sort === 'price-asc') return Number(a.base_price) - Number(b.base_price);
          if (sort === 'price-desc') return Number(b.base_price) - Number(a.base_price);
          if (sort === 'name')
            return productLabel(a.name).localeCompare(productLabel(b.name), 'vi');
          return 0;
        }),
    [products, sort, favoritesOnly, favorites],
  );
  const toggleFavorite = (id) =>
    setFavorites((current) =>
      current.includes(String(id))
        ? current.filter((item) => item !== String(id))
        : [...current, String(id)],
    );
  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setSort('recommended');
  };

  return (
    <div className="catalog-page">
      <section className="catalog-hero">
        <div
          className="catalog-hero-image"
          style={heroImage ? { '--catalog-hero-image': `url("${heroImage}")` } : undefined}
        />
        <div className="catalog-hero-shade" />
        <div className="catalog-hero-copy">
          <span className="lux-eyebrow">AURELIS · THE COFFEE COLLECTION</span>
          <h1 className="brand-display">
            Một hương vị,
            <br />
            <em>một khoảnh khắc riêng.</em>
          </h1>
          <p>
            Từ hạt cà phê tuyển chọn đến tách uống được pha bằng sự kiên nhẫn — khám phá những điều
            Aurelis dành riêng cho bạn.
          </p>
          <a className="lux-button lux-button-light" href="#menu-collection">
            Khám phá thực đơn <ArrowRight size={16} />
          </a>
        </div>
        <span className="catalog-hero-caption">SINGLE ORIGIN · THOUGHTFULLY BREWED</span>
      </section>
      <section className="catalog-content" id="menu-collection">
        <div className="catalog-heading">
          <div>
            <span className="lux-eyebrow">
              {favoritesOnly ? 'BỘ SƯU TẬP CỦA BẠN' : 'ĐƯỢC PHA CHẾ MỖI NGÀY'}
            </span>
            <h2 className="brand-display">
              {favoritesOnly ? 'Món yêu thích' : 'Thực đơn Aurelis'}
            </h2>
            <p>
              {favoritesOnly
                ? 'Những thức uống bạn đã lưu để tìm lại bất cứ lúc nào.'
                : 'Những lựa chọn tinh tế cho buổi sáng dịu dàng, chiều thong thả và mọi khoảnh khắc ở giữa.'}
            </p>
          </div>
          <span className="catalog-count">
            {loading
              ? 'ĐANG TÌM MÓN'
              : `${visibleProducts.length} MÓN · ${favorites.length} ĐÃ LƯU`}
          </span>
        </div>
        <div className="catalog-toolbar">
          <label className="catalog-search">
            <Search size={17} />
            <input
              placeholder="Tìm thức uống bạn yêu thích..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Tìm thức uống"
            />
            {search && (
              <button onClick={() => setSearch('')} aria-label="Xóa tìm kiếm">
                <X size={15} />
              </button>
            )}
          </label>
          <div className="catalog-filter-label">
            <SlidersHorizontal size={15} /> LỌC THEO
          </div>
          <div className="catalog-categories" role="group" aria-label="Danh mục thực đơn">
            <button
              className={!category ? 'is-selected' : ''}
              aria-pressed={!category}
              onClick={() => setCategory('')}
            >
              Tất cả
            </button>
            {cats.map((c) => (
              <button
                className={category === String(c.id) ? 'is-selected' : ''}
                aria-pressed={category === String(c.id)}
                key={c.id}
                onClick={() => setCategory(String(c.id))}
              >
                {categoryLabel(c.name)}
              </button>
            ))}
          </div>
          <label className="catalog-sort">
            Sắp xếp
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sắp xếp món">
              <option value="recommended">Gợi ý</option>
              <option value="price-asc">Giá thấp đến cao</option>
              <option value="price-desc">Giá cao đến thấp</option>
              <option value="name">Tên A–Z</option>
            </select>
          </label>
        </div>
        {!loading && !error && (search || category) && (
          <div className="catalog-active-filter">
            <span>
              Đang xem {visibleProducts.length} kết quả{search ? ` cho “${search}”` : ''}
            </span>
            <button onClick={clearFilters}>
              Xóa bộ lọc <X size={13} />
            </button>
          </div>
        )}
        {loading ? (
          <div className="catalog-grid">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div className="catalog-skeleton" key={i}>
                <div />
                <span />
                <span />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="catalog-empty">
            <Coffee />
            <h3>Thực đơn đang được chuẩn bị</h3>
            <p>Vui lòng thử lại sau ít phút.</p>
            <button onClick={() => setReload((value) => value + 1)}>Tải lại thực đơn</button>
          </div>
        ) : visibleProducts.length ? (
          <div className="catalog-grid">
            {visibleProducts.map((p, i) => {
              const saved = favorites.includes(String(p.id));
              return (
                <article className="catalog-card" key={p.id}>
                  <div className="catalog-card-image">
                    <img src={asset(p.image)} alt={productLabel(p.name)} loading="lazy" />
                    <span className="catalog-card-index">
                      <i>{String(i + 1).padStart(2, '0')}</i>
                      <span>CURATED FOR YOU</span>
                    </span>
                    <span className="catalog-card-category">
                      {categoryLabel(p.category_name) || 'AURELIS SELECTION'}
                    </span>
                    <button
                      className={`catalog-favorite${saved ? ' is-saved' : ''}`}
                      onClick={() => toggleFavorite(p.id)}
                      aria-label={
                        saved ? `Bỏ lưu ${productLabel(p.name)}` : `Lưu ${productLabel(p.name)}`
                      }
                      aria-pressed={saved}
                    >
                      <Heart size={17} fill={saved ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <div className="catalog-card-info">
                    <div className="catalog-title-line">
                      <h3 className="brand-display">{productLabel(p.name)}</h3>
                      <strong>{price(p.base_price)}</strong>
                    </div>
                    <span className="catalog-card-rule" />
                    <p>{productDescriptionLabel(p.description, p.name)}</p>
                    <div className="catalog-card-actions">
                      <Link to="/reservation">
                        <span>Khám phá tại cửa hàng</span>
                        <ArrowRight size={15} />
                      </Link>
                      <button
                        onClick={() => {
                          cart.add({
                            id: p.id,
                            name: productLabel(p.name),
                            image: p.image,
                            price: p.base_price,
                          });
                          message.success(`${productLabel(p.name)} đã thêm vào giỏ`);
                        }}
                        aria-label={`Thêm ${productLabel(p.name)} vào giỏ`}
                      >
                        <ShoppingBag size={15} />
                        <span>Thêm món</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="catalog-empty">
            <Search />
            <h3>{favoritesOnly ? 'Bạn chưa lưu món nào' : 'Chưa tìm thấy hương vị phù hợp'}</h3>
            <p>
              {favoritesOnly
                ? 'Chạm vào biểu tượng trái tim ở món bạn yêu thích để lưu lại.'
                : 'Thử một từ khóa khác hoặc xem toàn bộ thực đơn.'}
            </p>
            {favoritesOnly ? (
              <Link to="/menu">Khám phá thực đơn</Link>
            ) : (
              <button onClick={clearFilters}>Xem tất cả món</button>
            )}
          </div>
        )}
      </section>
      <section className="catalog-note">
        <span>THE AURELIS RITUAL</span>
        <p>“Cà phê ngon không cần vội. Chỉ cần đúng hạt, đúng cách, đúng khoảnh khắc.”</p>
        <Link to="/story">
          Tìm hiểu câu chuyện của chúng tôi <ArrowRight size={15} />
        </Link>
      </section>
    </div>
  );
}
