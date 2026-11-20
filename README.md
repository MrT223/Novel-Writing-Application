# Novel Writing Application ✍️📖

Ứng dụng desktop chuyên biệt hỗ trợ toàn diện quy trình sáng tác tiểu thuyết và xây dựng thế giới (World-building) với trải nghiệm không xao nhãng (*Distraction-free / Zen mode*).

Được phát triển với kiến trúc Web hiện đại trên nền tảng **Tauri + React + TypeScript + Tailwind CSS**, tuân thủ nghiêm ngặt các quy chuẩn thiết kế tại [PRODUCT.md](file:///c:/Study/novel-writing-application/PRODUCT.md), [DESIGN.md](file:///c:/Study/novel-writing-application/DESIGN.md) và [AGENTS.md](file:///c:/Study/novel-writing-application/AGENTS.md).

---

## 🌟 Tính Năng Nổi Bật

### 1. Không Gian Soạn Thảo Tập Trung (Focus First)
- **TipTap Rich Text Engine**: Tối ưu riêng cho văn xuôi với nhịp điệu dòng êm ái, bộ đếm số từ theo thời gian thực.
- **Vẽ tay trực tiếp trên văn bản (Drawing Mode)**:
  - Bật / tắt nhanh bằng nút chuột phụ **MB4** hoặc icon cọ vẽ.
  - Lớp canvas trong suốt đè trực tiếp lên văn bản và bám theo thao tác cuộn trang.
  - Nét vẽ được lưu trữ vĩnh viễn theo từng phân cảnh (`scene.drawingStrokes`).
- **Hỗ trợ 3 Theme bảo vệ mắt**: Sáng (Warm Paper), Tối (Night Writer), và Sepia (Parchment).

### 2. Quản Lý Chương & Hồi Linh Hoạt
- Thêm mới, đổi tên tại chỗ và xóa chương/hồi dễ dàng cả trên **Sidebar** lẫn ngay trên **tiêu đề đầu trang soạn thảo**.
- Không hạn chế số lượng, tự động đồng bộ hóa và đóng các tab liên quan khi có phân cảnh bị xóa.

### 3. World-Building Thuần Văn Bản Tự Do & Trích Xuất Dữ Liệu Thông Minh
- **Bỏ hẳn form mẫu gò bó**: Các phân khu *Hệ Thống Sức Mạnh*, *World Building & Bối Cảnh*, *Thế Lực & Giai Cấp*, *Cốt Truyện & Tuyến Tính* đều được viết thuần văn bản tự do như bản thảo truyện.
- **Trích xuất thực thể qua chuột phải (Entity Extraction)**:
  - Bôi đen một đoạn văn bản bất kỳ và nhấp chuột phải:
    - **Tạo danh mục mới**: Lấy đoạn bôi đen làm tên danh mục (ví dụ: tên một loại đan dược, môn phái, võ học...).
    - **Thêm vào danh mục có sẵn**: Tự do đặt tên nhãn nội dung (ví dụ: *Công thức*, *Nguyên liệu*, *Năng lượng tiêu hao*, *Phương thức đột phá*...). Không giới hạn số lượng thuộc tính.
  - **Bảo toàn văn bản gốc**: Nội dung trong trình soạn thảo vẫn giữ nguyên 100%, không bị mất hay biến mất.
- **Bảng Ma Trận Danh Mục (Category Matrix View)**: Bảng dữ liệu trực quan giúp tra cứu, lọc theo mảng, tìm kiếm nhanh và quản lý toàn bộ các danh mục đã trích xuất.

### 4. Mạng Lưới Nhân Vật & Dòng Thời Gian (Timeline)
- **Hồ sơ nhân vật**: Quản lý thông tin, phân loại vai trò và nút xóa nhân vật thừa nhanh gọn.
- **Sơ đồ quan hệ mạng lưới (React Flow)**: Trực quan hóa các mối liên kết giữa các nhân vật trong tác phẩm.
- **Thanh Timeline ngang**: Phím tắt `Ctrl + J` để bật/tắt tức thì ở dưới đáy màn hình, hỗ trợ zoom và quản lý các sự kiện cốt truyện.

### 5. Quản Lý Đa Tác Phẩm (Multi-Project Hub)
- Tạo nhiều bộ tiểu thuyết độc lập trên cùng một ứng dụng.
- Dễ dàng đổi tên tác phẩm, chuyển đổi qua lại hoặc xóa sạch dữ liệu để bắt đầu tác phẩm mới tinh.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### Yêu Cầu Môi Trường
- **Node.js**: >= 18.x
- **Trình duyệt**: Bất kỳ trình duyệt hiện đại nào (Chrome, Edge, Firefox, Brave) hoặc môi trường Tauri Desktop.

### Các Lệnh Thao Tác

```bash
# Cài đặt các gói phụ thuộc
npm install

# Khởi chạy máy chủ phát triển (Dev Server)
npm run dev
# Mở ứng dụng tại: http://localhost:1420/

# Kiểm tra kiểu dữ liệu (TypeScript Type Check)
npx tsc --noEmit

# Biên dịch sản phẩm (Production Build)
npm run build
```

---

## 📚 Tài Liệu Kỹ Thuật

- [PRODUCT.md](file:///c:/Study/novel-writing-application/PRODUCT.md): Tầm nhìn sản phẩm, nguyên tắc cốt lõi và định vị tính năng.
- [DESIGN.md](file:///c:/Study/novel-writing-application/DESIGN.md): Hệ thống Design Tokens, quy chuẩn Typography, màu sắc và phím tắt thao tác.
- [AGENTS.md](file:///c:/Study/novel-writing-application/AGENTS.md): Quy chuẩn làm việc và tiêu chuẩn chất lượng (Impeccable & UI/UX Pro Max).

