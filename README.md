# Hệ thống Quản lý Chuỗi Cà phê Aurelis Coffee

## Cài đặt cơ sở dữ liệu

1. Mở MySQL Workbench và kết nối `localhost`.
2. Chọn **File → Open SQL Script**.
3. Mở `database/aurelis_coffee.sql`.
4. Chạy toàn bộ script.
5. Kiểm tra schema `aurelis_coffee` đã được tạo.

## Chạy backend

```bash
open terminal
cd backend
npm install
# Windows: copy .env.example .env
# macOS/Linux: cp .env.example .env
npm run dev
```

Mở `.env` và nhập mật khẩu MySQL của máy bạn. Máy chủ mặc định chạy tại `http://localhost:5000`.

## Chạy frontend

```bash
new terminal
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

Cơ sở dữ liệu chỉ lưu mật khẩu đã được bảo mật bằng bcrypt.
