import {
  ArrowRight,
  ChevronDown,
  Clock3,
  Coffee,
  Mail,
  MapPin,
  Menu,
  Phone,
  ShoppingBag,
  Heart,
  LogOut,
  UserRound,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import BrandLogo from '../components/common/BrandLogo';
import PageTransition from '../components/common/PageTransition';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const links = [
  ['/', 'Trang chủ'],
  ['/menu', 'Thực đơn'],
  ['/story', 'Câu chuyện'],
  ['/stores', 'Cửa hàng'],
  ['/reservation', 'Đặt bàn'],
];

export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const cart = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const accountPath =
    user?.role === 'CUSTOMER'
      ? '/account'
      : user?.role === 'CASHIER'
        ? '/pos'
        : user?.role === 'BARISTA'
          ? '/barista'
          : user
            ? '/admin/dashboard'
            : '/login';
  const closeMenu = () => setMenuOpen(false);
  const linkClass = ({ isActive }) => `aurelis-nav-link${isActive ? ' is-active' : ''}`;

  return (
    <div className="aurelis-site">
      <div className="aurelis-topline">
        <div className="aurelis-topline-inner">
          <span>
            <Clock3 size={12} /> Mỗi ngày, 07:00 – 22:00
          </span>
          <span className="aurelis-topline-note">Một khoảng lặng mang tên cà phê.</span>
          <a href="tel:19006868">
            <Phone size={12} /> 1900 6868
          </a>
        </div>
      </div>
      <header className="aurelis-header">
        <div className="aurelis-header-inner">
          <Link
            to="/"
            className="aurelis-brand"
            aria-label="Aurelis Coffee — Trang chủ"
            onClick={closeMenu}
          >
            <BrandLogo />
            <span className="aurelis-brand-note">THE ART OF LINGERING</span>
          </Link>
          <nav className="aurelis-nav" aria-label="Điều hướng chính">
            {links.map(([to, label]) => (
              <NavLink key={to} end={to === '/'} to={to} className={linkClass}>
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="aurelis-actions">
            <Link to="/cart" className="aurelis-icon-link" aria-label="Giỏ hàng" title="Giỏ hàng">
              <ShoppingBag size={18} />
              <span>Giỏ hàng</span>
              {cart.count > 0 && <b className="aurelis-cart-count">{cart.count}</b>}
            </Link>
            <div className="aurelis-account-menu">
              <Link
                to={accountPath}
                className="aurelis-account-link"
                aria-label={user ? 'Tài khoản của tôi' : 'Đăng nhập'}
                aria-haspopup={user?.role === 'CUSTOMER'}
              >
                <span className="aurelis-account-icon">
                  <UserRound size={17} />
                </span>
                <span>{user ? user.fullName?.split(' ').at(-1) || 'Tài khoản' : 'Đăng nhập'}</span>
                <ChevronDown size={13} className="aurelis-account-chevron" />
              </Link>
              {user?.role === 'CUSTOMER' && (
                <div className="aurelis-account-dropdown">
                  <Link to="/account">
                    <UserRound size={15} /> Hồ sơ cá nhân
                  </Link>
                  <Link to="/menu?favorites=1">
                    <Heart size={15} /> Yêu thích
                  </Link>
                  <button
                    onClick={async () => {
                      await logout();
                      navigate('/');
                    }}
                  >
                    <LogOut size={15} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
            <button
              className="aurelis-mobile-toggle"
              aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
        <div className={`aurelis-mobile-menu${menuOpen ? ' is-open' : ''}`} aria-hidden={!menuOpen}>
          <nav aria-label="Điều hướng điện thoại">
            {links.map(([to, label], index) => (
              <NavLink key={to} end={to === '/'} to={to} className={linkClass} onClick={closeMenu}>
                <span className="aurelis-mobile-index">0{index + 1}</span>
                {label}
                <ArrowRight size={15} />
              </NavLink>
            ))}
            <Link to={accountPath} className="aurelis-mobile-account" onClick={closeMenu}>
              <UserRound size={16} />
              {user ? 'Tài khoản của tôi' : 'Đăng nhập / Đăng ký'}
              <ArrowRight size={15} />
            </Link>
            {user?.role === 'CUSTOMER' && (
              <>
                <Link to="/menu?favorites=1" className="aurelis-mobile-account" onClick={closeMenu}>
                  <Heart size={16} /> Yêu thích <ArrowRight size={15} />
                </Link>
                <button
                  className="aurelis-mobile-account"
                  onClick={async () => {
                    await logout();
                    closeMenu();
                    navigate('/');
                  }}
                >
                  <UserRound size={16} /> Đăng xuất <ArrowRight size={15} />
                </button>
              </>
            )}
          </nav>
          <div className="aurelis-mobile-contact">
            <span>HẸN GẶP BẠN MỖI NGÀY</span>
            <a href="tel:19006868">1900 6868</a>
          </div>
        </div>
      </header>
      <main className="aurelis-main">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <footer className="aurelis-footer">
        <div className="aurelis-footer-top">
          <div className="aurelis-footer-inner">
            <section className="aurelis-footer-brand">
              <Link to="/" aria-label="Aurelis Coffee — Trang chủ">
                <BrandLogo light />
              </Link>
              <div className="aurelis-footer-rule" />
              <p>
                Một tách cà phê được chăm chút. Một không gian đủ yên. Và một khoảnh khắc dành riêng
                cho bạn.
              </p>
              <div className="aurelis-footer-social">
                <a href="mailto:hello@aureliscoffee.com" aria-label="Gửi email">
                  <Mail size={15} />
                </a>
                <a href="tel:19006868" aria-label="Gọi Aurelis Coffee">
                  <Phone size={15} />
                </a>
              </div>
            </section>
            <section className="aurelis-footer-column">
              <span className="aurelis-footer-eyebrow">KHÁM PHÁ</span>
              <h2>
                Chọn một điều
                <br />
                bạn yêu thích.
              </h2>
              <Link to="/menu">
                Thực đơn <ArrowRight size={14} />
              </Link>
              <Link to="/story">
                Câu chuyện Aurelis <ArrowRight size={14} />
              </Link>
              <Link to="/stores">
                Không gian của chúng tôi <ArrowRight size={14} />
              </Link>
            </section>
            <section className="aurelis-footer-column">
              <span className="aurelis-footer-eyebrow">GẶP GỠ</span>
              <h2>
                Luôn có chỗ
                <br />
                cho bạn.
              </h2>
              <Link to="/stores">
                Tìm cửa hàng <ArrowRight size={14} />
              </Link>
              <Link to="/reservation">
                Đặt bàn <ArrowRight size={14} />
              </Link>
              <a href="tel:19006868">
                Liên hệ với chúng tôi <ArrowRight size={14} />
              </a>
            </section>
            <section className="aurelis-footer-contact">
              <span className="aurelis-footer-eyebrow">AURELIS COFFEE</span>
              <div className="aurelis-footer-contact-block">
                <MapPin size={17} />
                <p>
                  Không gian cà phê
                  <br />
                  dành cho những khoảnh khắc chậm.
                </p>
              </div>
              <div className="aurelis-footer-contact-block">
                <Clock3 size={17} />
                <p>
                  Mỗi ngày
                  <br />
                  07:00 – 22:00
                </p>
              </div>
              <a className="aurelis-footer-phone" href="tel:19006868">
                1900 6868 <ArrowRight size={14} />
              </a>
            </section>
          </div>
        </div>
        <div className="aurelis-footer-bottom">
          <div className="aurelis-footer-bottom-inner">
            <span>© 2026 AURELIS COFFEE. MADE FOR SLOW MOMENTS.</span>
            <span className="aurelis-footer-legal">
              Điều khoản <span className="aurelis-footer-dot">·</span> Quyền riêng tư
            </span>
            <span className="aurelis-footer-vietnam">
              TỪ VIỆT NAM, VỚI SỰ CHĂM CHÚT <Coffee size={13} />
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
