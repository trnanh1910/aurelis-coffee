import {
  BarChart3,
  Boxes,
  Coffee,
  CreditCard,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Store,
  Table2,
  UsersRound,
  UserRoundCog,
  X,
  Settings,
} from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import BrandLogo from '../components/common/BrandLogo';
import PageTransition from '../components/common/PageTransition';
import { useAuth } from '../context/AuthContext';

const sections = [
  { title: 'Tổng quan', items: [['/admin/dashboard', 'Bảng điều khiển', LayoutDashboard]] },
  {
    title: 'Bán hàng',
    items: [
      ['/pos', 'Bán hàng tại quầy', CreditCard],
      ['/admin/orders', 'Đơn hàng', Coffee],
    ],
  },
  {
    title: 'Danh mục',
    items: [
      ['/admin/products', 'Sản phẩm', Coffee],
      ['/admin/categories', 'Danh mục món', Package],
    ],
  },
  {
    title: 'Vận hành',
    items: [
      ['/admin/tables', 'Bàn', Table2],
      ['/admin/branches', 'Chi nhánh', Store],
      ['/admin/inventory', 'Kho nguyên liệu', Boxes],
    ],
  },
  { title: 'Khách hàng', items: [['/admin/customers', 'Khách hàng', UsersRound]] },
  { title: 'Phân tích', items: [['/admin/reports', 'Báo cáo', BarChart3]] },
  { title: 'Hệ thống', items: [['/admin/settings', 'Cài đặt', Settings]] },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navSections =
    user?.role === 'ADMIN'
      ? [
          sections[0],
          { title: 'Quản trị', items: [['/admin/users', 'Quản lý người dùng', UserRoundCog]] },
          ...sections.slice(1),
        ]
      : sections;
  const nav = (
    <>
      <BrandLogo light />
      <div className="mt-9 space-y-7">
        {navSections.map((section) => (
          <div key={section.title}>
            <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-white/35">
              {section.title}
            </div>
            {section.items.map(([to, label, Icon]) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </div>
    </>
  );
  return (
    <div className="min-h-screen bg-[#f5f2ec] text-charcoal">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 overflow-y-auto border-r border-black/5 bg-espresso p-5 pb-8 text-white lg:block">
        {nav}
      </aside>
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/50"
            aria-label="Đóng menu"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="relative h-full w-[min(20rem,85vw)] overflow-y-auto bg-espresso p-5 text-white">
            <div className="mb-4 flex justify-end">
              <button aria-label="Đóng menu" onClick={() => setMenuOpen(false)}>
                <X />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-black/5 bg-white/90 px-5 py-4 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <button aria-label="Mở menu" className="lg:hidden" onClick={() => setMenuOpen(true)}>
              <Menu />
            </button>
            <div>
              <div className="text-xs uppercase tracking-[.15em] text-charcoal/40">
                Vận hành Aurelis
              </div>
              <div className="font-semibold">Xin chào, {user?.fullName || user?.username}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-espresso transition hover:bg-black/5"
            >
              <Home size={16} />
              Trang chủ người dùng
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-xl bg-espresso px-3 py-2 text-sm text-white"
            >
              <LogOut size={16} />
              Đăng xuất
            </button>
          </div>
        </header>
        <main className="p-5 lg:p-8">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
