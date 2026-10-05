import { Link } from 'react-router-dom';
export default function ForbiddenPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-cream px-6">
      <div className="text-center">
        <div className="brand-display text-8xl text-espresso">403</div>
        <h1 className="brand-display mt-3 text-3xl">Bạn không có quyền truy cập.</h1>
        <p className="mt-3 text-sm text-charcoal/55">
          Tài khoản hiện tại không được phép sử dụng chức năng này.
        </p>
        <Link
          className="mt-7 inline-block rounded-full bg-espresso px-5 py-3 text-sm text-white"
          to="/"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
