SET
  NAMES utf8mb4;
SET
  FOREIGN_KEY_CHECKS = 0;
DROP DATABASE IF EXISTS aurelis_coffee;
CREATE DATABASE aurelis_coffee CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE aurelis_coffee;
CREATE TABLE roles(
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB;
CREATE TABLE users(
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT UNSIGNED NOT NULL,
  STATUS ENUM('ACTIVE', 'INACTIVE', 'LOCKED', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
  last_login DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY(role_id) REFERENCES roles(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_users_email(email),
  INDEX idx_users_role(role_id)
) ENGINE = InnoDB;
CREATE TABLE branches(
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  branch_code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  address VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  email VARCHAR(150),
  opening_time TIME NOT NULL DEFAULT '07:00:00',
  closing_time TIME NOT NULL DEFAULT '23:00:00',
  image VARCHAR(255),
  STATUS ENUM('ACTIVE', 'INACTIVE', 'DELETED') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB;
CREATE TABLE employees(
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL UNIQUE,
  branch_id INT UNSIGNED NOT NULL,
  employee_code VARCHAR(30) NOT NULL UNIQUE,
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(30),
  avatar VARCHAR(255),
  position ENUM('ADMIN', 'MANAGER', 'CASHIER', 'BARISTA') NOT NULL,
  hire_date DATE,
  STATUS ENUM('ACTIVE', 'INACTIVE', 'DELETED') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY(branch_id) REFERENCES branches(id) ON DELETE RESTRICT,
  INDEX idx_employee_branch(branch_id)
) ENGINE = InnoDB;
CREATE TABLE customers(
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL UNIQUE,
  customer_code VARCHAR(30) NOT NULL UNIQUE,
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(30),
  email VARCHAR(150),
  avatar VARCHAR(255),
  points INT UNSIGNED NOT NULL DEFAULT 0,
  membership_level ENUM('MEMBER', 'SILVER', 'GOLD', 'PLATINUM') NOT NULL DEFAULT 'MEMBER',
  total_spending DECIMAL(15, 2) NOT NULL DEFAULT 0,
  STATUS ENUM('ACTIVE', 'INACTIVE', 'DELETED') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE
  SET
    NULL,
    INDEX idx_customer_email(email)
) ENGINE = InnoDB;
CREATE TABLE categories(
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(120) NOT NULL UNIQUE,
  description VARCHAR(255),
  image VARCHAR(255),
  display_order INT NOT NULL DEFAULT 0,
  STATUS ENUM('ACTIVE', 'INACTIVE', 'DELETED') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB;
CREATE TABLE products(
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id INT UNSIGNED NOT NULL,
  product_code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  description TEXT,
  base_price DECIMAL(12, 2) NOT NULL,
  image VARCHAR(255),
  STATUS ENUM('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'DELETED') DEFAULT 'ACTIVE',
  is_featured TINYINT(1) DEFAULT 0,
  is_bestseller TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  CHECK(base_price >= 0),
  INDEX idx_products_name(name),
  INDEX idx_products_category(category_id)
) ENGINE = InnoDB;
CREATE TABLE product_images(
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  is_primary TINYINT(1) DEFAULT 0,
  sort_order INT DEFAULT 0,
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE = InnoDB;
CREATE TABLE product_sizes(
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  size_name ENUM('S', 'M', 'L') NOT NULL,
  extra_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  UNIQUE(product_id, size_name),
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
  CHECK(extra_price >= 0)
) ENGINE = InnoDB;
CREATE TABLE product_addons(
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  STATUS ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
  CHECK(price >= 0)
) ENGINE = InnoDB;
CREATE TABLE cafe_tables(
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  branch_id INT UNSIGNED NOT NULL,
  table_code VARCHAR(20) NOT NULL,
  area VARCHAR(50),
  capacity INT UNSIGNED NOT NULL,
  STATUS ENUM('AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING') DEFAULT 'AVAILABLE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE(branch_id, table_code),
  FOREIGN KEY(branch_id) REFERENCES branches(id) ON DELETE RESTRICT,
  CHECK(capacity > 0)
) ENGINE = InnoDB;
CREATE TABLE vouchers(
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  discount_type ENUM('PERCENT', 'FIXED') NOT NULL,
  discount_value DECIMAL(12, 2) NOT NULL,
  min_order_value DECIMAL(12, 2) DEFAULT 0,
  max_discount DECIMAL(12, 2),
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  usage_limit INT UNSIGNED,
  per_customer_limit INT UNSIGNED DEFAULT 1,
  STATUS ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK(discount_value >= 0),
  CHECK(end_date > start_date)
) ENGINE = InnoDB;
CREATE TABLE orders(
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_code VARCHAR(30) NOT NULL UNIQUE,
  branch_id INT UNSIGNED NOT NULL,
  customer_id BIGINT UNSIGNED NULL,
  employee_id BIGINT UNSIGNED NULL,
  table_id INT UNSIGNED NULL,
  order_type ENUM('DINE_IN', 'TAKEAWAY', 'PICKUP') NOT NULL,
  STATUS ENUM(
    'PENDING',
    'CONFIRMED',
    'PREPARING',
    'READY',
    'COMPLETED',
    'CANCELLED'
  ) DEFAULT 'PENDING',
  subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  voucher_id BIGINT UNSIGNED NULL,
  note VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(branch_id) REFERENCES branches(id) ON DELETE RESTRICT,
  FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE
  SET
    NULL,
    FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE
  SET
    NULL,
    FOREIGN KEY(table_id) REFERENCES cafe_tables(id) ON DELETE
  SET
    NULL,
    FOREIGN KEY(voucher_id) REFERENCES vouchers(id) ON DELETE
  SET
    NULL,
    INDEX idx_orders_code(order_code),
    INDEX idx_orders_created(created_at),
    INDEX idx_orders_branch(branch_id),
    INDEX idx_orders_customer(customer_id),
    CHECK(total_amount >= 0)
) ENGINE = InnoDB;
CREATE TABLE order_items(
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  size_id BIGINT UNSIGNED NULL,
  quantity INT UNSIGNED NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  total_price DECIMAL(15, 2) NOT NULL,
  sugar_level ENUM('0', '30', '50', '70', '100') DEFAULT '100',
  ice_level ENUM('NO_ICE', 'LESS_ICE', 'NORMAL') DEFAULT 'NORMAL',
  note VARCHAR(255),
  FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE RESTRICT,
  FOREIGN KEY(size_id) REFERENCES product_sizes(id) ON DELETE
  SET
    NULL,
    CHECK(quantity > 0),
    CHECK(unit_price >= 0),
    CHECK(total_price >= 0)
) ENGINE = InnoDB;
CREATE TABLE order_item_addons(
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_item_id BIGINT UNSIGNED NOT NULL,
  addon_id INT UNSIGNED NOT NULL,
  addon_name VARCHAR(100) NOT NULL,
  addon_price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY(order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
  FOREIGN KEY(addon_id) REFERENCES product_addons(id) ON DELETE RESTRICT
) ENGINE = InnoDB;
CREATE TABLE payments(
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  payment_method ENUM('CASH', 'QR', 'BANK_TRANSFER') NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  payment_status ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
  transaction_code VARCHAR(100),
  paid_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE RESTRICT,
  CHECK(amount >= 0)
) ENGINE = InnoDB;
CREATE TABLE reservations(
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reservation_code VARCHAR(30) NOT NULL UNIQUE,
  customer_id BIGINT UNSIGNED NULL,
  branch_id INT UNSIGNED NOT NULL,
  table_id INT UNSIGNED NULL,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  number_of_guests INT UNSIGNED NOT NULL,
  customer_name VARCHAR(120) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  note VARCHAR(500),
  STATUS ENUM(
    'PENDING',
    'CONFIRMED',
    'SEATED',
    'COMPLETED',
    'CANCELLED'
  ) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE
  SET
    NULL,
    FOREIGN KEY(branch_id) REFERENCES branches(id) ON DELETE RESTRICT,
    FOREIGN KEY(table_id) REFERENCES cafe_tables(id) ON DELETE
  SET
    NULL,
    INDEX idx_reservation_date(reservation_date),
    CHECK(number_of_guests > 0)
) ENGINE = InnoDB;
CREATE TABLE voucher_usages(
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  voucher_id BIGINT UNSIGNED NOT NULL,
  customer_id BIGINT UNSIGNED NULL,
  order_id BIGINT UNSIGNED NOT NULL,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(voucher_id) REFERENCES vouchers(id),
  FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE
  SET
    NULL,
    FOREIGN KEY(order_id) REFERENCES orders(id),
    UNIQUE(voucher_id, order_id)
) ENGINE = InnoDB;
CREATE TABLE suppliers(
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(30),
  email VARCHAR(150),
  address VARCHAR(255),
  STATUS ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE'
) ENGINE = InnoDB;
CREATE TABLE ingredients(
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  unit VARCHAR(30) NOT NULL,
  current_quantity DECIMAL(12, 3) NOT NULL DEFAULT 0,
  minimum_stock DECIMAL(12, 3) NOT NULL DEFAULT 0,
  supplier_id INT UNSIGNED NULL,
  STATUS ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
  FOREIGN KEY(supplier_id) REFERENCES suppliers(id) ON DELETE
  SET
    NULL,
    CHECK(current_quantity >= 0),
    CHECK(minimum_stock >= 0)
) ENGINE = InnoDB;
CREATE TABLE inventory_transactions(
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ingredient_id INT UNSIGNED NOT NULL,
  supplier_id INT UNSIGNED NULL,
  employee_id BIGINT UNSIGNED NULL,
  transaction_type ENUM('IN', 'OUT', 'ADJUSTMENT') NOT NULL,
  quantity DECIMAL(12, 3) NOT NULL,
  note VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(ingredient_id) REFERENCES ingredients(id),
  FOREIGN KEY(supplier_id) REFERENCES suppliers(id) ON DELETE
  SET
    NULL,
    FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE
  SET
    NULL,
    CHECK(quantity > 0)
) ENGINE = InnoDB;
CREATE TABLE reviews(
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  order_id BIGINT UNSIGNED NULL,
  rating TINYINT UNSIGNED NOT NULL,
  COMMENT TEXT,
  STATUS ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'APPROVED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(customer_id) REFERENCES customers(id),
  FOREIGN KEY(product_id) REFERENCES products(id),
  FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE
  SET
    NULL,
    CHECK(
      rating BETWEEN 1
      AND 5
    )
) ENGINE = InnoDB;
CREATE TABLE favorites(
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(customer_id, product_id),
  FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE = InnoDB;
CREATE TABLE loyalty_transactions(
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT UNSIGNED NOT NULL,
  order_id BIGINT UNSIGNED NULL,
  transaction_type ENUM('EARN', 'REDEEM', 'ADJUST') NOT NULL,
  points INT NOT NULL,
  note VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(customer_id) REFERENCES customers(id),
  FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE
  SET
    NULL
) ENGINE = InnoDB;
CREATE TABLE notifications(
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(150) NOT NULL,
  message VARCHAR(500) NOT NULL,
  TYPE VARCHAR(50),
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notifications_user(user_id, is_read)
) ENGINE = InnoDB;
INSERT INTO
  roles(name, description)
VALUES
  ('ADMIN', 'Toàn quyền hệ thống'),
  ('MANAGER', 'Quản lý chi nhánh được phân công'),
  (
    'CASHIER',
    'Bán hàng tại quầy, quản lý bàn, đơn hàng và thanh toán'
  ),
  (
    'BARISTA',
    'Màn hình pha chế và cập nhật trạng thái món'
  ),
  ('CUSTOMER', 'Khách hàng tự phục vụ');
INSERT INTO
  branches(
    branch_code,
    name,
    address,
    phone,
    email,
    opening_time,
    closing_time
  )
VALUES
  (
    'HP-LT',
    'Aurelis Lạch Tray',
    '88 Lạch Tray, Ngô Quyền, Hải Phòng',
    '02253686868',
    'lachtray@aureliscoffee.com',
    '07:00',
    '23:00'
  ),
  (
    'HP-TD',
    'Aurelis Trần Phú',
    '42 Trần Phú, Ngô Quyền, Hải Phòng',
    '02253696868',
    'tranphu@aureliscoffee.com',
    '07:00',
    '23:00'
  ),
  (
    'HN-TH',
    'Aurelis Tây Hồ',
    '18 Quảng An, Tây Hồ, Hà Nội',
    '0243686868',
    'tayho@aureliscoffee.com',
    '07:00',
    '23:30'
  ),
  (
    'HN-HK',
    'Aurelis Hoàn Kiếm',
    '21 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội',
    '0243696868',
    'hoankiem@aureliscoffee.com',
    '07:00',
    '23:30'
  );
INSERT INTO
  users(username, email, password_hash, role_id, STATUS)
VALUES
  (
    'admin',
    'admin@aureliscoffee.com',
    '$2b$12$MMzqUpL6/TPPZ/MZQxq4I.1y2UprL0Celerotbv1f6zv982QF8cim',
    1,
    'ACTIVE'
  ),
  (
    'manager',
    'manager@aureliscoffee.com',
    '$2b$12$R3YZkhTvAvh4sG5idBzdN.xOMZ93elJhru6F4YZ9GIMiN4wH.rBY.',
    2,
    'ACTIVE'
  ),
  (
    'cashier',
    'cashier@aureliscoffee.com',
    '$2b$12$zHLSnn5CTTQouAINqPooweb5XKHIZJ1lOHnGI9vc4QPRiCDZcwH4q',
    3,
    'ACTIVE'
  ),
  (
    'barista',
    'barista@aureliscoffee.com',
    '$2b$12$S6X5dTEMjnJGNlUUfbKm9ubF4FJDtD72mOKpCbIXqR4hKnNGA4N4K',
    4,
    'ACTIVE'
  ),
  (
    'customer',
    'customer@gmail.com',
    '$2b$12$3lVQPQ8T7y9V.Za1wPw5vOUWMMe1tEmdDSaUbQzru9b7YC9LQrove',
    5,
    'ACTIVE'
  );
INSERT INTO
  employees(
    user_id,
    branch_id,
    employee_code,
    full_name,
    phone,
    position,
    hire_date
  )
VALUES
  (
    1,
    1,
    'EMP0001',
    'Trần Ngọc Anh',
    '0901000001',
    'ADMIN',
    '2024-01-05'
  ),
  (
    2,
    1,
    'EMP0002',
    'Nguyễn Thu Hà',
    '0901000002',
    'MANAGER',
    '2024-02-10'
  ),
  (
    3,
    1,
    'EMP0003',
    'Phạm Quốc Huy',
    '0901000003',
    'CASHIER',
    '2025-03-12'
  ),
  (
    4,
    1,
    'EMP0004',
    'Lê Mai Anh',
    '0901000004',
    'BARISTA',
    '2025-04-08'
  );
INSERT INTO
  customers(
    user_id,
    customer_code,
    full_name,
    phone,
    email,
    points,
    membership_level,
    total_spending
  )
VALUES
  (
    5,
    'CUS00001',
    'Nguyễn Hoàng Nam',
    '0912000001',
    'customer@gmail.com',
    1850,
    'GOLD',
    12450000
  ),
  (
    NULL,
    'CUS00002',
    'Trần Ngọc Linh',
    '0912000002',
    'linh@example.com',
    430,
    'MEMBER',
    2980000
  ),
  (
    NULL,
    'CUS00003',
    'Đỗ Thanh Tú',
    '0912000003',
    'tu@example.com',
    860,
    'SILVER',
    6150000
  ),
  (
    NULL,
    'CUS00004',
    'Vũ Khánh An',
    '0912000004',
    'an@example.com',
    3150,
    'PLATINUM',
    28500000
  ),
  (
    NULL,
    'CUS00005',
    'Phan Hải Yến',
    '0912000005',
    'yen@example.com',
    1550,
    'GOLD',
    10900000
  );
INSERT INTO
  categories(name, slug, description, display_order)
VALUES
  (
    'Đặc trưng',
    'signature',
    'Những thức uống đặc trưng mang dấu ấn riêng của Aurelis.',
    1
  ),
  (
    'Cà phê Espresso',
    'espresso',
    'Các thức uống kinh điển được pha trên nền Espresso.',
    2
  ),
  (
    'Cà phê ủ lạnh',
    'cold-brew',
    'Cà phê ủ lạnh chậm, vị êm và hậu vị thanh.',
    3
  ),
  (
    'Trà',
    'tea',
    'Trà và trái cây thanh mát, cân bằng vị giác.',
    4
  ),
  (
    'Trà xanh Matcha',
    'matcha',
    'Các thức uống trà xanh Matcha tuyển chọn chất lượng cao.',
    5
  ),
  (
    'Không cà phê',
    'non-coffee',
    'Thức uống từ sô-cô-la, sữa và các hương vị không chứa cà phê.',
    6
  ),
  (
    'Bánh ngọt',
    'bakery',
    'Bánh nướng tươi được tuyển chọn dùng kèm đồ uống.',
    7
  ),
  (
    'Tráng miệng',
    'dessert',
    'Các món tráng miệng tinh tế cho trải nghiệm trọn vẹn.',
    8
  );
INSERT INTO
  products(
    category_id,
    product_code,
    name,
    slug,
    description,
    base_price,
    image,
    STATUS,
    is_featured,
    is_bestseller
  )
VALUES
  (
    1,
    'AUR-SIG-001',
    'Latte Đặc Trưng Aurelis',
    'aurelis-signature-latte',
    'Latte Đặc Trưng Aurelis được Aurelis hoàn thiện với hương vị cân bằng, tinh tế và hậu vị dễ nhớ.',
    65000,
    NULL,
    'ACTIVE',
    1,
    1
  ),
  (
    1,
    'AUR-SIG-002',
    'Caramel Macchiato Ánh Vàng',
    'golden-caramel-macchiato',
    'Caramel Macchiato Ánh Vàng được Aurelis hoàn thiện với hương vị cân bằng, tinh tế và hậu vị dễ nhớ.',
    69000,
    NULL,
    'ACTIVE',
    1,
    1
  ),
  (
    1,
    'AUR-SIG-003',
    'Mocha Nhung Mịn',
    'velvet-mocha',
    'Mocha Nhung Mịn được Aurelis hoàn thiện với hương vị cân bằng, tinh tế và hậu vị dễ nhớ.',
    72000,
    NULL,
    'ACTIVE',
    1,
    0
  ),
  (
    1,
    'AUR-SIG-004',
    'Cà Phê Muối Biển',
    'sea-salt-coffee',
    'Cà Phê Muối Biển được Aurelis hoàn thiện với hương vị cân bằng, tinh tế và hậu vị dễ nhớ.',
    59000,
    NULL,
    'ACTIVE',
    1,
    1
  ),
  (
    1,
    'AUR-SIG-005',
    'Espresso Đường Nâu',
    'brown-sugar-espresso',
    'Espresso Đường Nâu được Aurelis hoàn thiện với hương vị cân bằng, tinh tế và hậu vị dễ nhớ.',
    62000,
    NULL,
    'ACTIVE',
    0,
    0
  ),
  (
    2,
    'AUR-ESP-001',
    'Espresso',
    'espresso',
    'Espresso được Aurelis hoàn thiện với hương vị cân bằng, tinh tế và hậu vị dễ nhớ.',
    42000,
    NULL,
    'ACTIVE',
    0,
    0
  ),
  (
    2,
    'AUR-ESP-002',
    'Espresso Đôi',
    'double-espresso',
    'Espresso Đôi được Aurelis hoàn thiện với hương vị cân bằng, tinh tế và hậu vị dễ nhớ.',
    52000,
    NULL,
    'ACTIVE',
    0,
    0
  ),
  (
    2,
    'AUR-ESP-003',
    'Americano',
    'americano',
    'Americano được Aurelis hoàn thiện với hương vị cân bằng, tinh tế và hậu vị dễ nhớ.',
    49000,
    NULL,
    'ACTIVE',
    0,
    1
  ),
  (
    2,
    'AUR-ESP-004',
    'Cappuccino',
    'cappuccino',
    'Cappuccino được Aurelis hoàn thiện với hương vị cân bằng, tinh tế và hậu vị dễ nhớ.',
    59000,
    NULL,
    'ACTIVE',
    0,
    0
  ),
  (
    2,
    'AUR-ESP-005',
    'Flat White',
    'flat-white',
    'Flat White được Aurelis hoàn thiện với hương vị cân bằng, tinh tế và hậu vị dễ nhớ.',
    62000,
    NULL,
    'ACTIVE',
    0,
    0
  ),
  (
    2,
    'AUR-ESP-006',
    'Cà Phê Latte',
    'cafe-latte',
    'Cà Phê Latte được Aurelis hoàn thiện với hương vị cân bằng, tinh tế và hậu vị dễ nhớ.',
    59000,
    NULL,
    'ACTIVE',
    1,
    0
  ),
  (
    3,
    'AUR-CB-001',
    'Cà Phê Ủ Lạnh Nguyên Bản',
    'classic-cold-brew',
    'Cà Phê Ủ Lạnh Nguyên Bản được Aurelis hoàn thiện với hương vị cân bằng, tinh tế và hậu vị dễ nhớ.',
    59000,
    NULL,
    'ACTIVE',
    0,
    1
  ),
  (
    3,
    'AUR-CB-002',
    'Cà Phê Ủ Lạnh Kem Vani',
    'vanilla-cream-cold-brew',
    'Cà Phê Ủ Lạnh Kem Vani được Aurelis hoàn thiện với hương vị cân bằng, tinh tế và hậu vị dễ nhớ.',
    68000,
    NULL,
    'ACTIVE',
    1,
    0
  ),
  (
    3,
    'AUR-CB-003',
    'Cà Phê Ủ Lạnh Cam',
    'orange-cold-brew',
    'Cà Phê Ủ Lạnh Cam được Aurelis hoàn thiện với hương vị cân bằng, tinh tế và hậu vị dễ nhớ.',
    69000,
    NULL,
    'ACTIVE',
    0,
    0
  ),
  (
    3,
    'AUR-CB-004',
    'Cà Phê Ủ Lạnh Dừa',
    'coconut-cold-brew',
    'Cà Phê Ủ Lạnh Dừa được Aurelis hoàn thiện với hương vị cân bằng, tinh tế và hậu vị dễ nhớ.',
    69000,
    NULL,
    'ACTIVE',
    0,
    0
  ),
  (
    4,
    'AUR-TEA-001',
    'Trà Nhài Đào',
    'peach-jasmine-tea',
    'Trà Nhài Đào được Aurelis hoàn thiện với hương vị cân bằng, tinh tế và hậu vị dễ nhớ.',
    59000,
    NULL,
    'ACTIVE',
    0,
    1
  ),
  (
    4,
    'AUR-TEA-002',
    'Trà Vải',
    'lychee-tea',
    'Trà Vải được Aurelis hoàn thiện với hương vị cân bằng, tinh tế và hậu vị dễ nhớ.',
    62000,
    NULL,
    'ACTIVE',
    0,
    0
  ),
  (
    4,
    'AUR-TEA-003',
    'Trà Sữa Earl Grey',
    'earl-grey-milk-tea',
    'Trà Sữa Earl Grey được Aurelis hoàn thiện với hương vị cân bằng, tinh tế và hậu vị dễ nhớ.',
    65000,
    NULL,
    'ACTIVE',
    0,
    0
  ),
  (
    4,
    'AUR-TEA-004',
    'Ô Long Macchiato',
    'oolong-macchiato',
    'Ô Long Macchiato được Aurelis hoàn thiện với hương vị cân bằng, tinh tế và hậu vị dễ nhớ.',
    65000,
    NULL,
    'ACTIVE',
    0,
    0
  ),
  (
    5,
    'AUR-MAT-001',
    'Latte Trà Xanh Cao Cấp',
    'premium-matcha-latte',
    'Latte Trà Xanh Cao Cấp được Aurelis hoàn thiện với hương vị cân bằng, tinh tế và hậu vị dễ nhớ.',
    69000,
    NULL,
    'ACTIVE',
    1,
    1
  ),
  (
    5,
    'AUR-MAT-002',
    'Trà Xanh Dâu',
    'strawberry-matcha',
    'Trà Xanh Dâu được Aurelis hoàn thiện với hương vị cân bằng, tinh tế và hậu vị dễ nhớ.',
    75000,
    NULL,
    'ACTIVE',
    1,
    0
  ),
  (
    5,
    'AUR-MAT-003',
    'Trà Xanh Dừa',
    'coconut-matcha',
    'Trà Xanh Dừa được Aurelis hoàn thiện với hương vị cân bằng, tinh tế và hậu vị dễ nhớ.',
    72000,
    NULL,
    'ACTIVE',
    0,
    0
  ),
  (
    6,
    'AUR-NC-001',
    'Sô-cô-la Bỉ',
    'belgian-chocolate',
    'Sô-cô-la Bỉ được Aurelis hoàn thiện với hương vị cân bằng, tinh tế và hậu vị dễ nhớ.',
    65000,
    NULL,
    'ACTIVE',
    0,
    0
  ),
  (
    6,
    'AUR-NC-002',
    'Sữa Vani',
    'vanilla-bean-milk',
    'Sữa Vani được Aurelis hoàn thiện với hương vị cân bằng, tinh tế và hậu vị dễ nhớ.',
    59000,
    NULL,
    'ACTIVE',
    0,
    0
  ),
  (
    6,
    'AUR-NC-003',
    'Kem Caramel Muối',
    'salted-caramel-cream',
    'Kem Caramel Muối được Aurelis hoàn thiện với hương vị cân bằng, tinh tế và hậu vị dễ nhớ.',
    68000,
    NULL,
    'ACTIVE',
    0,
    0
  ),
  (
    7,
    'AUR-BAK-001',
    'Bánh Sừng Bò Bơ',
    'butter-croissant',
    'Bánh Sừng Bò Bơ được Aurelis hoàn thiện với hương vị cân bằng, tinh tế và hậu vị dễ nhớ.',
    45000,
    NULL,
    'ACTIVE',
    1,
    1
  ),
  (
    7,
    'AUR-BAK-002',
    'Bánh Sừng Bò Hạnh Nhân',
    'almond-croissant',
    'Bánh Sừng Bò Hạnh Nhân được Aurelis hoàn thiện với hương vị cân bằng, tinh tế và hậu vị dễ nhớ.',
    52000,
    NULL,
    'ACTIVE',
    0,
    0
  ),
  (
    8,
    'AUR-DES-001',
    'Tiramisu',
    'tiramisu',
    'Tiramisu được Aurelis hoàn thiện với hương vị cân bằng, tinh tế và hậu vị dễ nhớ.',
    65000,
    NULL,
    'ACTIVE',
    1,
    1
  ),
  (
    8,
    'AUR-DES-002',
    'Bánh Phô Mai Basque',
    'basque-cheesecake',
    'Bánh Phô Mai Basque được Aurelis hoàn thiện với hương vị cân bằng, tinh tế và hậu vị dễ nhớ.',
    68000,
    NULL,
    'ACTIVE',
    0,
    0
  ),
  (
    8,
    'AUR-DES-003',
    'Bánh Muffin Sô-cô-la',
    'chocolate-muffin',
    'Bánh Muffin Sô-cô-la được Aurelis hoàn thiện với hương vị cân bằng, tinh tế và hậu vị dễ nhớ.',
    48000,
    NULL,
    'ACTIVE',
    0,
    0
  );
INSERT INTO
  product_sizes(product_id, size_name, extra_price)
SELECT
  id,
  'S',
  0
FROM
  products
WHERE
  category_id <= 6;
INSERT INTO
  product_sizes(product_id, size_name, extra_price)
SELECT
  id,
  'M',
  10000
FROM
  products
WHERE
  category_id <= 6;
INSERT INTO
  product_sizes(product_id, size_name, extra_price)
SELECT
  id,
  'L',
  20000
FROM
  products
WHERE
  category_id <= 6;
INSERT INTO
  product_addons(name, price)
VALUES
  ('Thêm shot Espresso', 15000),
  ('Kem', 10000),
  ('Sữa', 10000),
  ('Caramel', 10000),
  ('Trân châu', 12000);
INSERT INTO
  cafe_tables(branch_id, table_code, area, capacity, STATUS)
VALUES
  (1, 'B01', 'Tầng 1', 4, 'AVAILABLE'),
  (1, 'B02', 'Tầng 1', 2, 'OCCUPIED'),
  (1, 'B03', 'Tầng 1', 6, 'RESERVED'),
  (1, 'B04', 'Tầng 1', 4, 'AVAILABLE'),
  (1, 'B05', 'Tầng 2', 4, 'AVAILABLE'),
  (2, 'B01', 'Tầng 1', 4, 'AVAILABLE'),
  (2, 'B02', 'Tầng 1', 2, 'AVAILABLE'),
  (2, 'B03', 'Khu VIP', 6, 'AVAILABLE'),
  (2, 'B04', 'Tầng 2', 4, 'CLEANING'),
  (2, 'B05', 'Tầng 2', 4, 'AVAILABLE'),
  (3, 'T01', 'Khu vườn', 4, 'AVAILABLE'),
  (3, 'T02', 'Khu vườn', 2, 'AVAILABLE'),
  (3, 'T03', 'Trong nhà', 6, 'AVAILABLE'),
  (3, 'T04', 'Trong nhà', 4, 'AVAILABLE'),
  (3, 'T05', 'Khu VIP', 6, 'AVAILABLE'),
  (4, 'H01', 'Tầng 1', 4, 'AVAILABLE'),
  (4, 'H02', 'Tầng 1', 2, 'AVAILABLE'),
  (4, 'H03', 'Tầng 2', 6, 'AVAILABLE'),
  (4, 'H04', 'Tầng 2', 4, 'AVAILABLE'),
  (4, 'H05', 'Khu VIP', 6, 'AVAILABLE');
INSERT INTO
  vouchers(
    code,
    name,
    discount_type,
    discount_value,
    min_order_value,
    max_discount,
    start_date,
    end_date,
    usage_limit,
    per_customer_limit
  )
VALUES
  (
    'AURELIS10',
    'Chào mừng đến Aurelis',
    'PERCENT',
    10,
    150000,
    50000,
    '2026-01-01',
    '2027-12-31',
    1000,
    1
  ),
  (
    'GOLD50',
    'Ưu đãi thành viên Vàng',
    'FIXED',
    50000,
    300000,
    50000,
    '2026-01-01',
    '2027-12-31',
    500,
    3
  );
INSERT INTO
  orders(
    order_code,
    branch_id,
    customer_id,
    employee_id,
    table_id,
    order_type,
    STATUS,
    subtotal,
    discount_amount,
    total_amount,
    created_at
  )
VALUES
  (
    'ORD-1021',
    1,
    1,
    3,
    2,
    'DINE_IN',
    'COMPLETED',
    195000,
    0,
    195000,
    DATE_SUB(NOW(), INTERVAL 6 DAY)
  ),
  (
    'ORD-1022',
    1,
    2,
    3,
    NULL,
    'TAKEAWAY',
    'COMPLETED',
    108000,
    0,
    108000,
    DATE_SUB(NOW(), INTERVAL 5 DAY)
  ),
  (
    'ORD-1023',
    2,
    3,
    3,
    NULL,
    'PICKUP',
    'COMPLETED',
    203000,
    10000,
    193000,
    DATE_SUB(NOW(), INTERVAL 4 DAY)
  ),
  (
    'ORD-1024',
    1,
    1,
    3,
    2,
    'DINE_IN',
    'PREPARING',
    130000,
    0,
    130000,
    NOW()
  ),
  (
    'ORD-1025',
    3,
    4,
    3,
    NULL,
    'TAKEAWAY',
    'COMPLETED',
    203000,
    20000,
    183000,
    DATE_SUB(NOW(), INTERVAL 2 DAY)
  ),
  (
    'ORD-1026',
    1,
    5,
    3,
    NULL,
    'TAKEAWAY',
    'COMPLETED',
    118000,
    0,
    118000,
    NOW()
  ),
  (
    'ORD-1027',
    4,
    NULL,
    3,
    NULL,
    'TAKEAWAY',
    'COMPLETED',
    101000,
    0,
    101000,
    NOW()
  );
INSERT INTO
  order_items(
    order_id,
    product_id,
    size_id,
    quantity,
    unit_price,
    total_price,
    sugar_level,
    ice_level
  )
VALUES
  (1, 1, NULL, 2, 65000, 130000, '50', 'LESS_ICE'),
  (1, 26, NULL, 1, 45000, 45000, '100', 'NORMAL'),
  (2, 8, NULL, 1, 49000, 49000, '0', 'NORMAL'),
  (2, 11, NULL, 1, 59000, 59000, '50', 'LESS_ICE'),
  (3, 2, NULL, 2, 69000, 138000, '50', 'NORMAL'),
  (3, 28, NULL, 1, 65000, 65000, '100', 'NORMAL'),
  (4, 1, NULL, 2, 65000, 130000, '30', 'LESS_ICE'),
  (5, 20, NULL, 2, 69000, 138000, '50', 'LESS_ICE'),
  (5, 28, NULL, 1, 65000, 65000, '100', 'NORMAL'),
  (6, 4, NULL, 1, 59000, 59000, '50', 'LESS_ICE'),
  (6, 12, NULL, 1, 59000, 59000, '0', 'NORMAL'),
  (7, 6, NULL, 1, 42000, 42000, '0', 'NO_ICE'),
  (7, 16, NULL, 1, 59000, 59000, '50', 'NORMAL');
INSERT INTO
  payments(
    order_id,
    payment_method,
    amount,
    payment_status,
    paid_at
  )
SELECT
  id,
  'CASH',
  total_amount,
  'PAID',
  created_at
FROM
  orders
WHERE
  STATUS = 'COMPLETED';
INSERT INTO
  reviews(
    customer_id,
    product_id,
    order_id,
    rating,
    COMMENT,
    STATUS
  )
VALUES
  (
    1,
    1,
    1,
    5,
    'Cân bằng, mượt mà và hương thơm rõ nét.',
    'APPROVED'
  ),
  (
    2,
    8,
    2,
    4,
    'Vị Espresso sạch, rõ ràng và hậu vị êm.',
    'APPROVED'
  ),
  (
    3,
    2,
    3,
    5,
    'Vị ngọt Caramel tinh tế, không gây ngấy.',
    'APPROVED'
  ),
  (
    4,
    20,
    5,
    5,
    'Trà xanh Matcha có vị tươi, thanh và chất lượng cao.',
    'APPROVED'
  );
INSERT INTO
  suppliers(name, phone, email, address)
VALUES
  (
    'Nhà cung cấp Rang xay Aurelis',
    '0909000001',
    'supply@aureliscoffee.com',
    'Hải Phòng'
  ),
  (
    'Sữa Xanh Việt Nam',
    '0909000002',
    'sales@greendairy.vn',
    'Hà Nội'
  );
INSERT INTO
  ingredients(
    name,
    unit,
    current_quantity,
    minimum_stock,
    supplier_id
  )
VALUES
  ('Hạt cà phê', 'kg', 36.5, 10, 1),
  ('Sữa tươi', 'lít', 28, 12, 2),
  ('Sữa yến mạch', 'lít', 9, 8, 2),
  ('Bột trà xanh Matcha', 'kg', 5.2, 2, 1),
  ('Đường', 'kg', 22, 5, 1),
  ('Sô-cô-la', 'kg', 7, 3, 1),
  ('Sốt caramel', 'lít', 6, 2, 1);
INSERT INTO
  inventory_transactions(
    ingredient_id,
    supplier_id,
    employee_id,
    transaction_type,
    quantity,
    note
  )
VALUES
  (
    1,
    1,
    2,
    'IN',
    20,
    'Nhập hạt cà phê định kỳ hằng tuần'
  ),
  (2, 2, 2, 'IN', 30, 'Nhập sữa tươi'),
  (
    3,
    2,
    2,
    'OUT',
    3,
    'Xuất dùng cho hoạt động trong ngày'
  );
INSERT INTO
  notifications(user_id, title, message, TYPE)
VALUES
  (
    1,
    'Tình trạng kho',
    'Sữa yến mạch sắp chạm mức tồn kho tối thiểu.',
    'LOW_STOCK'
  ),
  (
    3,
    'Có đơn hàng mới',
    'Đơn #ORD-1024 đang chờ pha chế.',
    'ORDER'
  ),
  (
    5,
    'Điểm Aurelis',
    'Bạn hiện có 1.850 điểm Aurelis.',
    'LOYALTY'
  );
SET
  FOREIGN_KEY_CHECKS = 1;
