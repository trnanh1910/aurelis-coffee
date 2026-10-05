import { ArrowLeft, ArrowRight, Check, Coffee, Heart, Minus, Plus, ShoppingBag, Star } from 'lucide-react';
import { message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { productService } from '../../services/productService';
import { assetUrl } from '../../utils/assetUrl';
import { categoryLabel, productDescriptionLabel, productLabel } from '../../utils/viLabels';

const money = (value) => `${new Intl.NumberFormat('vi-VN').format(Number(value || 0))} ₫`;
const favoritesKey = 'aurelis-menu-favorites';
const getFavorites = () => {
  try { return JSON.parse(localStorage.getItem(favoritesKey) || '[]').map(String); } catch { return []; }
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const cart = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sizeId, setSizeId] = useState('');
  const [addonIds, setAddonIds] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [favorites, setFavorites] = useState(getFavorites);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true); setError(false); setProduct(null); setSizeId(''); setAddonIds([]); setQuantity(1);
    productService.detail(id).then((data) => {
      if (!alive) return;
      setProduct(data);
      setSizeId(data.sizes?.[0] ? String(data.sizes[0].id) : '');
      productService.list({ category: data.category_id, limit: 4 }).then((result) => {
        if (alive) setRelated((result.data || []).filter((item) => String(item.id) !== String(id)).slice(0, 3));
      }).catch(() => {});
    }).catch(() => { if (alive) setError(true); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id]);
  useEffect(() => { localStorage.setItem(favoritesKey, JSON.stringify(favorites)); }, [favorites]);

  const selectedSize = product?.sizes?.find((size) => String(size.id) === sizeId);
  const selectedAddons = useMemo(() => (product?.addons || []).filter((addon) => addonIds.includes(String(addon.id))), [product, addonIds]);
  const unitPrice = Number(product?.base_price || 0) + Number(selectedSize?.extra_price || 0) + selectedAddons.reduce((sum, addon) => sum + Number(addon.price || 0), 0);
  const image = product ? assetUrl(product.image, 'https://images.unsplash.com/photo-1511081692775-05d0f180a065?auto=format&fit=crop&w=1200&q=85') : '';
  const saved = product && favorites.includes(String(product.id));
  const toggleFavorite = () => setFavorites((current) => saved ? current.filter((item) => item !== String(product.id)) : [...current, String(product.id)]);
  const addToCart = () => {
    cart.add({ id: product.id, name: productLabel(product.name), image: product.image, price: unitPrice,
      sizeId: selectedSize?.id || null, sizeName: selectedSize?.size_name || '', addonIds: selectedAddons.map((addon) => addon.id),
      addonNames: selectedAddons.map((addon) => addon.name) }, quantity);
    message.success(`${productLabel(product.name)} đã được thêm vào giỏ`);
  };

  if (loading) return <main className="product-detail-state"><span className="lux-eyebrow">AURELIS · CURATED SELECTION</span><div className="product-detail-loader" /><p>Đang chuẩn bị trải nghiệm của bạn...</p></main>;
  if (error || !product) return <main className="product-detail-state"><Coffee size={32} /><span className="lux-eyebrow">AURELIS · SELECTION</span><h1 className="brand-display">Không tìm thấy sản phẩm</h1><p>Sản phẩm này có thể đã được cập nhật hoặc tạm thời không khả dụng.</p><Link className="lux-button lux-button-dark" to="/menu"><ArrowLeft size={15} /> Trở lại thực đơn</Link></main>;

  return <main className="product-detail-page">
    <nav className="product-breadcrumb" aria-label="Điều hướng"><Link to="/">Trang chủ</Link><span>/</span><Link to="/menu">Thực đơn</Link><span>/</span><span>{productLabel(product.name)}</span></nav>
    <section className="product-detail-main">
      <div className="product-gallery">
        <div className="product-gallery-main"><img src={image} alt={productLabel(product.name)} /><span className="product-gallery-label">AURELIS · HOUSE SELECTION</span><button className={`product-save${saved ? ' is-saved' : ''}`} onClick={toggleFavorite} aria-label={saved ? 'Bỏ lưu sản phẩm' : 'Lưu sản phẩm'} aria-pressed={saved}><Heart size={18} fill={saved ? 'currentColor' : 'none'} /></button></div>
        <div className="product-gallery-thumbs"><button className="is-active" onClick={() => setActiveImage(0)} aria-label="Xem ảnh sản phẩm"><img src={image} alt="" /></button><span>01 <i /> 01</span></div>
      </div>
      <div className="product-detail-info">
        <span className="lux-eyebrow">{categoryLabel(product.category_name) || 'AURELIS SIGNATURE'}</span>
        <h1 className="brand-display">{productLabel(product.name)}</h1>
        {Number(product.rating) > 0 && <div className="product-rating"><span>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={13} fill={index < Math.round(Number(product.rating)) ? 'currentColor' : 'none'} />)}</span><strong>{Number(product.rating).toFixed(1)}</strong><small>{product.review_count || product.reviews?.length || 0} đánh giá</small></div>}
        <div className="product-price">{money(unitPrice)}{unitPrice !== Number(product.base_price) && <small>· giá đã chọn</small>}</div>
        <div className="product-divider" />
        <p className="product-description">{productDescriptionLabel(product.description, product.name) || 'Một sáng tạo được tuyển chọn từ nguyên liệu tinh túy, cân bằng trong từng tầng hương vị và lưu lại dư vị dịu dàng.'}</p>
        <div className="product-meta"><span>Mã sản phẩm</span><strong>{product.product_code || `AU-${product.id}`}</strong></div>
        {product.sizes?.length > 0 && <fieldset className="product-options"><legend>Kích cỡ <small>{selectedSize?.size_name}</small></legend><div className="product-choice-list">{product.sizes.map((size) => <button type="button" key={size.id} className={sizeId === String(size.id) ? 'is-selected' : ''} onClick={() => setSizeId(String(size.id))}><span>{size.size_name}</span><small>{Number(size.extra_price) ? `+ ${money(size.extra_price)}` : 'Tiêu chuẩn'}</small>{sizeId === String(size.id) && <Check size={15} />}</button>)}</div></fieldset>}
        {product.addons?.length > 0 && <fieldset className="product-options"><legend>Thêm hương vị <small>Tùy chọn</small></legend><div className="product-addon-list">{product.addons.map((addon) => { const checked = addonIds.includes(String(addon.id)); return <label key={addon.id} className={checked ? 'is-selected' : ''}><input type="checkbox" checked={checked} onChange={() => setAddonIds((current) => checked ? current.filter((id) => id !== String(addon.id)) : [...current, String(addon.id)])} /><span>{addon.name}</span><small>+ {money(addon.price)}</small></label>; })}</div></fieldset>}
        <div className="product-purchase"><div className="product-quantity"><button onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Giảm số lượng"><Minus size={15} /></button><span>{quantity}</span><button onClick={() => setQuantity((value) => Math.min(99, value + 1))} aria-label="Tăng số lượng"><Plus size={15} /></button></div><button className="product-add-button" onClick={addToCart}><ShoppingBag size={17} /> Thêm vào giỏ <strong>{money(unitPrice * quantity)}</strong></button></div>
        <div className="product-promises"><span><Check size={14} /> Tuyển chọn nguyên liệu</span><span><Check size={14} /> Pha chế khi bạn đặt</span></div>
      </div>
    </section>
    {product.reviews?.length > 0 && <section className="product-reviews"><div><span className="lux-eyebrow">LỜI THƯƠNG MẾN</span><h2 className="brand-display">Cảm nhận khách hàng</h2></div><div className="product-review-list">{product.reviews.slice(0, 3).map((review) => <article key={review.id}><div className="product-review-stars">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={12} fill={index < review.rating ? 'currentColor' : 'none'} />)}</div><p>{review.comment}</p><span>{review.customer_name}</span></article>)}</div></section>}
    {related.length > 0 && <section className="product-related"><div className="product-related-heading"><div><span className="lux-eyebrow">CÙNG BỘ SƯU TẬP</span><h2 className="brand-display">Có thể bạn sẽ yêu thích</h2></div><Link to="/menu">Khám phá thực đơn <ArrowRight size={15} /></Link></div><div className="product-related-grid">{related.map((item) => <Link to={`/menu/${item.id}`} className="product-related-card" key={item.id}><img src={assetUrl(item.image, image)} alt={productLabel(item.name)} /><span>{categoryLabel(item.category_name)}</span><h3 className="brand-display">{productLabel(item.name)}</h3><strong>{money(item.base_price)}</strong></Link>)}</div></section>}
  </main>;
}
