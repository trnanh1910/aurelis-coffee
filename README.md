# Hệ thống Quản lý Chuỗi Cà phê Aurelis Coffee

## Cài đặt cơ sở dữ liệu

1. Mở MySQL Workbench và kết nối `localhost`.
2. Chọn **File → Open SQL Script**.
3. Mở `database/aurelis_coffee.sql`.
4. Chạy toàn bộ script.
5. Kiểm tra schema `aurelis_coffee` đã được tạo.

Nếu bạn đã import database từ bản trước và không muốn xóa dữ liệu hiện tại, chạy thêm:

```text
database/vietnamese_localization_update.sql
```

File này cập nhật dữ liệu mẫu sang tiếng Việt mà không cần tạo lại database.

## Chạy backend

```bash
cd backend
npm install
# Windows: copy .env.example .env
# macOS/Linux: cp .env.example .env
npm run dev
```

Mở `.env` và nhập mật khẩu MySQL của máy bạn. Máy chủ mặc định chạy tại `http://localhost:5000`.

## Chạy frontend

```bash
cd frontend
npm install
# Windows: copy .env.example .env
# macOS/Linux: cp .env.example .env
npm run dev
```

Mở `http://localhost:5173`.

## Tài khoản demo

| Vai trò       | Email                     | Mật khẩu     |
| ------------- | ------------------------- | ------------ |
| Quản trị viên | admin@aureliscoffee.com   | Admin@123    |
| Quản lý       | manager@aureliscoffee.com | Manager@123  |
| Thu ngân      | cashier@aureliscoffee.com | Cashier@123  |
| Pha chế       | barista@aureliscoffee.com | Barista@123  |
| Khách hàng    | customer@gmail.com        | Customer@123 |

Cơ sở dữ liệu chỉ lưu mật khẩu đã được băm bằng bcrypt.

## Luồng kiểm thử đề xuất

1. Import SQL và cấu hình `backend/.env`.
2. Khởi động backend và frontend, sau đó kiểm tra `GET /api/v1/health`.
3. Đăng nhập bằng tài khoản Quản trị viên và kiểm tra Tổng quan, Sản phẩm, Danh mục, Chi nhánh và Bàn.
4. Đăng nhập Thu ngân, mở `/pos`, chọn một bàn Trống, tùy chỉnh món và lưu đơn.
5. Đăng nhập Pha chế, mở `/barista`, chuyển đơn qua Đang pha chế → Sẵn sàng.
6. Thanh toán bằng Thu ngân/Quản trị viên và kiểm tra bàn chuyển thành Đang vệ sinh.
7. Vào Quản trị → Bàn và đánh dấu vệ sinh xong để bàn trở lại Trống.
8. Kiểm tra các bản ghi đơn hàng, thanh toán và điểm thành viên trong MySQL Workbench.

Tài liệu bổ sung nằm trong thư mục `docs/`.
