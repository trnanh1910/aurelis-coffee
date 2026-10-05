import { ArrowRight, Coffee, Heart, Minus, Plus, Search, ShoppingBag, SlidersHorizontal, X } from 'lucide-react';
import { message } from 'antd';
import { createPortal } from 'react-dom';
import { useCart } from '../../context/CartContext';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/axiosClient';
import { productService } from '../../services/productService';
import { brandingService } from '../../services/brandingService';
import { assetUrl } from '../../utils/assetUrl';
import { categoryLabel, productLabel } from '../../utils/viLabels';

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
  const [quickAdd, setQuickAdd] = useState(null);
  const [quickSize, setQuickSize] = useState('');
  const [quickAddons, setQuickAddons] = useState([]);
  const [quickQuantity, setQuickQuantity] = useState(1);
  const [quickLoading, setQuickLoading] = useState(false);

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
  const categoryCounts = useMemo(
    () =>
      products.reduce((counts, product) => {
        const id = String(product.category_id || '');
        counts[id] = (counts[id] || 0) + 1;
        return counts;
      }, {}),
    [products],
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
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete('favorites');
        return next;
      },
      { replace: true },
    );
  };
  const toggleFavoritesOnly = () =>
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.get('favorites') === '1' ? next.delete('favorites') : next.set('favorites', '1');
        return next;
      },
      { replace: true },
    );

  const openQuickAdd = async (product) => {
    setQuickAdd(product);
    setQuickLoading(true);
    setQuickSize('');
    setQuickAddons([]);
    setQuickQuantity(1);
    try {
      const detail = await productService.detail(product.id);
      setQuickAdd((current) => current?.id === product.id ? { ...product, ...detail } : current);
      setQuickSize(detail.sizes?.[0] ? String(detail.sizes[0].id) : '');
    } catch {
      message.error('Chưa tải được các lựa chọn món. Vui lòng thử lại.');
      setQuickAdd(null);
    } finally {
      setQuickLoading(false);
    }
  };
  const quickSelectedSize = quickAdd?.sizes?.find((size) => String(size.id) === quickSize);
  const quickSelectedAddons = (quickAdd?.addons || []).filter((addon) => quickAddons.includes(String(addon.id)));
  const quickUnitPrice = Number(quickAdd?.base_price || 0) + Number(quickSelectedSize?.extra_price || 0) + quickSelectedAddons.reduce((sum, addon) => sum + Number(addon.price || 0), 0);
  const confirmQuickAdd = () => {
    if (!quickAdd) return;
    cart.add({ id: quickAdd.id, name: productLabel(quickAdd.name), image: quickAdd.image, price: quickUnitPrice,
      sizeId: quickSelectedSize?.id || null, sizeName: quickSelectedSize?.size_name || '',
      addonIds: quickSelectedAddons.map((addon) => addon.id), addonNames: quickSelectedAddons.map((addon) => addon.name) }, quickQuantity);
    message.success(`${productLabel(quickAdd.name)} đã thêm vào giỏ`);
    setQuickAdd(null);
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
          <span className="lux-eyebrow">AURELIS · BỘ SƯU TẬP TINH HOA</span>
          <h1 className="brand-display">
            Dư vị tinh tế
            <br />
            <em>Đặc quyền êm đềm.</em>
          </h1>
          <p>
            Chắt lọc từ những vùng trồng danh tiếng, mỗi tuyệt tác tại Aurelis là kết tinh của nghệ
            thuật chế tác và sự kiên nhẫn tuyệt đối – một đặc quyền thưởng thức dành riêng cho bạn.
          </p>
          <a className="lux-button lux-button-light" href="#menu-collection">
            Khám phá thực đơn <ArrowRight size={16} />
          </a>
        </div>
        <span className="catalog-hero-caption">
          Lựa chọn tinh túy nhất · Chiết xuất bằng trọn vẹn tâm ý
        </span>
      </section>
      <section className="catalog-content" id="menu-collection">
        <div className="catalog-heading">
          <div>
            <span className="lux-eyebrow">
              {favoritesOnly ? 'BỘ SƯU TẬP CỦA BẠN' : 'DƯ VỊ CỦA THỜI GIAN'}
            </span>
            <h2 className="brand-display">{favoritesOnly ? 'Món yêu thích' : 'Thực đơn'}</h2>
            <p>
              {favoritesOnly
                ? 'Những thức uống bạn đã lưu để tìm lại bất cứ lúc nào.'
                : 'Từng thức uống là một dải hương được chắt chiu, dịu dàng đi cùng bạn từ dải nắng đầu ngày đến những khoảng lặng bình yên nhất.'}
            </p>
          </div>
          <span className="catalog-count">
            {loading
              ? 'ĐANG TÌM MÓN'
              : `${visibleProducts.length} MÓN · ${favorites.length} ĐÃ LƯU`}
          </span>
        </div>
        <div className="catalog-layout">
          <aside className="catalog-sidebar">
            <div className="catalog-sidebar-heading">
              <span className="lux-eyebrow">TÌM HƯƠNG VỊ</span>
              <h3 className="brand-display">Khám phá</h3>
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
              <button
                className={`catalog-favorites-filter${favoritesOnly ? ' is-active' : ''}`}
                onClick={toggleFavoritesOnly}
                aria-pressed={favoritesOnly}
                disabled={!favorites.length && !favoritesOnly}
              >
                <Heart size={15} fill={favoritesOnly ? 'currentColor' : 'none'} />
                Đã lưu <span>{favorites.length}</span>
              </button>
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
                    <span>{categoryLabel(c.name)}</span>
                    <small>{categoryCounts[String(c.id)] || 0}</small>
                  </button>
                ))}
              </div>
              <label className="catalog-sort">
                Sắp xếp
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  aria-label="Sắp xếp món"
                >
                  <option value="recommended">Gợi ý</option>
                  <option value="price-asc">Giá thấp đến cao</option>
                  <option value="price-desc">Giá cao đến thấp</option>
                  <option value="name">Tên A–Z</option>
                </select>
              </label>
              {(search || category || favoritesOnly) && (
                <button className="catalog-sidebar-clear" onClick={clearFilters}>
                  Xóa bộ lọc <X size={13} />
                </button>
              )}
            </div>
          </aside>
          <div className="catalog-results">
            {!loading && !error && (search || category || favoritesOnly) && (
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
                        <div className="catalog-card-actions">
                          <Link className="catalog-detail-link" to={`/menu/${p.id}`}>
                            <span>Chi tiết</span>
                            <ArrowRight size={15} />
                          </Link>
                          <button
                            onClick={() => openQuickAdd(p)}
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
          </div>
        </div>
      </section>
      <section className="catalog-note">
        <span>THE AURELIS RITUAL</span>
        <p>“Cà phê ngon không cần vội. Chỉ cần đúng hạt, đúng cách, đúng khoảnh khắc.”</p>
        <Link to="/story">
          Tìm hiểu câu chuyện của chúng tôi <ArrowRight size={15} />
        </Link>
      </section>
      {quickAdd && createPortal((
        <div className="quick-add-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setQuickAdd(null); }}>
          <section className="quick-add-dialog" role="dialog" aria-modal="true" aria-labelledby="quick-add-title">
            <button className="quick-add-close" onClick={() => setQuickAdd(null)} aria-label="Đóng"><X size={19} /></button>
            <span className="lux-eyebrow">AURELIS · TÙY CHỈNH MÓN</span>
            <h2 className="brand-display" id="quick-add-title">{productLabel(quickAdd.name)}</h2>
            <p className="quick-add-base-price">{price(quickAdd.base_price)}</p>
            {quickLoading ? <div className="quick-add-loading">Đang chuẩn bị các lựa chọn...</div> : <>
              {quickAdd.sizes?.length > 0 && <fieldset className="quick-add-options"><legend>Kích cỡ <small>{quickSelectedSize?.size_name}</small></legend><div className="quick-add-sizes">{quickAdd.sizes.map((size) => <button key={size.id} className={quickSize === String(size.id) ? 'is-selected' : ''} onClick={() => setQuickSize(String(size.id))}><strong>{size.size_name}</strong><small>{Number(size.extra_price) ? `+ ${price(size.extra_price)}` : 'Tiêu chuẩn'}</small></button>)}</div></fieldset>}
              {quickAdd.addons?.length > 0 && <fieldset className="quick-add-options"><legend>Thêm topping <small>Tùy chọn</small></legend><div className="quick-add-toppings">{quickAdd.addons.map((addon) => { const checked = quickAddons.includes(String(addon.id)); return <label key={addon.id}><input type="checkbox" checked={checked} onChange={() => setQuickAddons((current) => checked ? current.filter((id) => id !== String(addon.id)) : [...current, String(addon.id)])} /><span>{addon.name}</span><small>+ {price(addon.price)}</small></label>; })}</div></fieldset>}
              <div className="quick-add-footer"><div className="quick-add-quantity"><button onClick={() => setQuickQuantity((value) => Math.max(1, value - 1))} aria-label="Giảm số lượng"><Minus size={15} /></button><span>{quickQuantity}</span><button onClick={() => setQuickQuantity((value) => Math.min(99, value + 1))} aria-label="Tăng số lượng"><Plus size={15} /></button></div><button className="quick-add-confirm" onClick={confirmQuickAdd}><ShoppingBag size={16} /> Thêm món <strong>{price(quickUnitPrice * quickQuantity)}</strong></button></div>
            </>}
          </section>
        </div>
      ), document.body)}
    </div>
  );
}
