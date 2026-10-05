export const statusLabels = {
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Ngừng hoạt động',
  LOCKED: 'Đã khóa',
  OUT_OF_STOCK: 'Hết hàng',
  DELETED: 'Đã xóa',
  AVAILABLE: 'Trống',
  OCCUPIED: 'Đang sử dụng',
  RESERVED: 'Đã đặt trước',
  CLEANING: 'Đang vệ sinh',
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SEATED: 'Đã nhận bàn',
  PREPARING: 'Đang pha chế',
  READY: 'Sẵn sàng',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
  PAID: 'Đã thanh toán',
  UNPAID: 'Chưa thanh toán',
  FAILED: 'Thất bại',
  REFUNDED: 'Đã hoàn tiền',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
};
export const orderTypeLabels = { DINE_IN: 'Tại bàn', TAKEAWAY: 'Mang đi', PICKUP: 'Nhận tại quầy' };
export const paymentMethodLabels = { CASH: 'Tiền mặt', QR: 'Mã QR', BANK_TRANSFER: 'Chuyển khoản' };
export const iceLabels = { NO_ICE: 'Không đá', LESS_ICE: 'Ít đá', NORMAL: 'Đá bình thường' };
export const roleLabels = {
  ADMIN: 'Quản trị viên',
  MANAGER: 'Quản lý',
  CASHIER: 'Thu ngân',
  BARISTA: 'Pha chế',
  CUSTOMER: 'Khách hàng',
};

export const membershipLabels = {
  MEMBER: 'Thành viên',
  SILVER: 'Bạc',
  GOLD: 'Vàng',
  PLATINUM: 'Bạch kim',
};
export const areaLabels = {
  'Floor 1': 'Tầng 1',
  'Floor 2': 'Tầng 2',
  Garden: 'Khu vườn',
  Indoor: 'Trong nhà',
  VIP: 'Khu VIP',
  Other: 'Khu vực khác',
};
export const addonLabels = {
  'Espresso Shot': 'Thêm shot Espresso',
  Cream: 'Kem',
  Milk: 'Sữa',
  Caramel: 'Caramel',
  Boba: 'Trân châu',
};
export const categoryLabels = {
  'Cà phê Espresso': 'Cà phê Espresso',
  'Cà phê ủ lạnh': 'Cà phê ủ lạnh',
  'Trà xanh Matcha': 'Trà xanh Matcha',
  Signature: 'Đặc trưng',
  Espresso: 'Cà phê Espresso',
  'Cold Brew': 'Cà phê ủ lạnh',
  Tea: 'Trà',
  Matcha: 'Trà xanh Matcha',
  'Non-Coffee': 'Không cà phê',
  Bakery: 'Bánh ngọt',
  Dessert: 'Tráng miệng',
};
export const categoryDescriptionLabels = {
  'Aurelis signature compositions': 'Những thức uống đặc trưng mang dấu ấn riêng của Aurelis.',
  'Espresso-based classics': 'Các thức uống kinh điển được pha trên nền Espresso.',
  'Slow-steeped cold coffee': 'Cà phê ủ lạnh chậm, vị êm và hậu vị thanh.',
  'Tea and fruit infusions': 'Trà và trái cây thanh mát, cân bằng vị giác.',
  'Premium matcha drinks': 'Các thức uống Matcha tuyển chọn chất lượng cao.',
  'Chocolate and milk-based drinks':
    'Thức uống từ sô-cô-la, sữa và các hương vị không chứa cà phê.',
  'Fresh bakery selections': 'Bánh nướng tươi được tuyển chọn dùng kèm đồ uống.',
  'Elegant desserts': 'Các món tráng miệng tinh tế cho trải nghiệm trọn vẹn.',
};
export const statusLabel = (v) => statusLabels[v] || v || '—';
export const orderTypeLabel = (v) => orderTypeLabels[v] || v || '—';
export const paymentMethodLabel = (v) => paymentMethodLabels[v] || v || '—';
export const iceLabel = (v) => iceLabels[v] || String(v || '').replaceAll('_', ' ');
export const roleLabel = (v) => roleLabels[v] || v || '—';
export const membershipLabel = (v) => membershipLabels[v] || v || '—';
export const areaLabel = (v) => areaLabels[v] || v || 'Khu vực khác';
export const addonLabel = (v) => addonLabels[v] || v;
// Category names are managed content; display the stored name verbatim.
export const categoryLabel = (v) => v;
export const categoryDescriptionLabel = (v) => categoryDescriptionLabels[v] || v;
// Product names are user-managed content; always display the stored name verbatim.
export const productLabel = (v) => v;
export const productDescriptionLabel = (description, name) => {
  if (!description) return '';
  if (description.startsWith('A refined Aurelis interpretation'))
    return `${productLabel(name)} được Aurelis hoàn thiện với hương vị cân bằng, tinh tế và hậu vị dễ nhớ.`;
  return description;
};

export const localizeItemSummary = (value) => {
  return String(value || '');
};
