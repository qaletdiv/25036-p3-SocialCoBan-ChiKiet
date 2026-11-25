# Kircle

Hướng dẫn chạy dự án Kircle trên Windows.

## 1. Tạo database

Mở file `database.sql` và chạy script.

## 2. Cấu hình API

Trong thư mục `backend`, sao chép `.env.example` thành `.env`:

```powershell
cd backend
copy .env.example .env
```

Mở `backend\.env` và điền thông tin MySQL, `JWT_SECRET`, email, Cloudinary và Google. API không chạy nếu còn dòng để trống.

## 3. Cài thư viện

Mở hai terminal ở thư mục gốc của project.

```powershell
cd backend
npm install
```

```powershell
cd frontend
npm install
```

## 4. Chạy

Giữ hai terminal. Mỗi bên một lệnh:

```powershell
npm run dev
```

```powershell
npm run dev
```

Mở http://localhost:3000. Database mới chưa có tài khoản, hãy đăng ký trên trang web.
