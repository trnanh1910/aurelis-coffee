import { Link } from 'react-router-dom';
export default function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-cream px-6">
      <div className="text-center">
        <div className="brand-display text-8xl text-espresso">404</div>
        <h1 className="brand-display mt-3 text-3xl">Có vẻ chiếc tách này đang trống.</h1>
        <p className="mt-3 text-sm text-charcoal/55">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
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
