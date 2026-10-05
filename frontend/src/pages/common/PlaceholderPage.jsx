import { Construction } from 'lucide-react';
export default function PlaceholderPage({ title = 'Chức năng' }) {
  return (
    <div className="premium-card p-10">
      <Construction className="text-gold" />
      <h1 className="brand-display mt-5 text-3xl text-espresso">{title}</h1>
      <p className="mt-3 max-w-xl text-sm leading-7 text-charcoal/55">
        Chức năng nghiệp vụ này đã có trong điều hướng và sẽ được hoàn thiện ở giai đoạn phát triển
        tiếp theo. Tài liệu dự án chưa đánh dấu chức năng này là đã hoàn thành.
      </p>
    </div>
  );
}
