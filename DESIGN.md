# DESIGN.md — Kiến Trúc Giao Diện & Hệ Thống Thiết Kế (Design System)

Tài liệu này quy chuẩn toàn bộ kiến trúc giao diện người dùng, hệ thống Design Tokens, nguyên tắc tương tác và hành vi linh kiện trong **Novel Writing Application**, tuân thủ nghiêm ngặt theo [AGENTS.md](file:///c:/Study/novel-writing-application/AGENTS.md) và hai bộ kỹ năng **Impeccable** + **UI/UX Pro Max**.

---

## 1. Phong Cách Thiết Kế & Triết Lý Thị Giác (Visual Philosophy)

- **Phong cách cốt lõi**: *Minimalism & Swiss Modernism / Soft Paper UI*.
- **Mục tiêu**: Tối ưu hóa cho người viết văn làm việc liên tục nhiều giờ liền trên máy tính để bàn (Desktop App).
- **Trạng thái giao diện**:
  - **Operate Mode**: Sidebar, Bảng dữ liệu trực quan (Category Matrix), Quản lý nhân vật, Timeline bar (tập trung tốc độ thao tác, phím tắt, độ tương phản rõ ràng).
  - **Read / Write Mode**: Không gian soạn thảo bản thảo tiểu thuyết và World-building (khoảng cách dòng thoáng đãng, màu nền dịu mắt, loại bỏ yếu tố gây xao nhãng).

---

## 2. Hệ Thống Màu Sắc & Semantic Design Tokens

Ứng dụng hỗ trợ 3 chủ đề (Themes) chuyển đổi linh hoạt: **Light (Warm Paper)**, **Dark (Night Writer)**, và **Sepia (Vintage Parchment)**. Toàn bộ mã nguồn sử dụng biến CSS Semantic Tokens, nghiêm cấm hardcode mã hex trực tiếp trong component JSX.

| Semantic Token | Light (Warm Paper) | Dark (Night Writer) | Sepia (Parchment) | Mục đích sử dụng |
| :--- | :--- | :--- | :--- | :--- |
| `--color-canvas` | `#FBF9F5` (Giấy ngà ấm) | `#141517` (Mực đêm trầm) | `#F4ECD8` (Giấy ố cổ điển) | Nền chính của ứng dụng |
| `--color-surface` | `#FFFFFF` | `#1C1D21` | `#EDE2C8` | Nền thanh công cụ, thẻ card |
| `--color-surface-hover`| `#F3EDE2` | `#282A30` | `#E2D4B5` | Hiệu ứng rê chuột (Hover) |
| `--color-border` | `#E8E2D5` | `#2D2F36` | `#DACBB0` | Đường kẻ phân cách, viền khung |
| `--color-ink-primary` | `#2C2523` (Nâu đen dịu) | `#E4E5E7` | `#3C2F23` | Văn bản chính, tiêu đề |
| `--color-ink-secondary`| `#6B635B` | `#9B9DA3` | `#705F4D` | Phụ đề, nhãn trạng thái |
| `--color-ink-tertiary` | `#A0988E` | `#63666E` | `#9C8972` | Placeholder, icon thứ cấp |
| `--color-accent` | `#C25E00` (Hổ phách ấm) | `#E07A24` | `#A85208` | Nút hành động chính, focus |
| `--color-accent-soft` | `rgba(194,94,0,0.1)` | `rgba(224,122,36,0.15)`| `rgba(168,82,8,0.12)` | Nền badge, item đang active |
| `--color-destructive` | `#DC2626` | `#EF4444` | `#B91C1C` | Nút xoá, cảnh báo nguy hiểm |

---

## 3. Typography & Nhịp Điệu Dòng (Type Scale & Rhythm)

- **Font gia đình**:
  - `font-sans`: `Inter`, system-ui, sans-serif — Dùng cho thanh điều hướng, nút bấm, bảng dữ liệu.
  - `font-serif`: `Merriweather`, `Lora`, `Newsreader`, Georgia, serif — Dùng cho tiêu đề chương và nội dung văn xuôi.
  - `font-mono`: `JetBrains Mono`, monospace — Dùng cho bộ đếm số từ, mã định danh.
- **Quy chuẩn khoảng cách dòng cho Editor**:
  - Đoạn văn (`paragraph`): `line-height: 1.75 - 1.85`, cỡ chữ `16px - 18px`, chiều rộng tối đa khối văn bản `720px - 760px` căn giữa màn hình để mắt quét tự nhiên nhất.
  - Tiêu đề chương (`H1`): `font-size: 2rem (32px)`, `font-weight: 700`.

---

## 4. Hành Vi Tương Tác & Phím Tắt (Interactions & Shortcuts)

| Phím / Thao tác | Khu vực | Hành vi hệ thống |
| :--- | :--- | :--- |
| `Ctrl + J` | Toàn ứng dụng | Bật / tắt thanh dòng thời gian Timeline ngang ở dưới chân màn hình |
| `MB4` (Nút chuột phụ 4) | Soạn thảo | Kích hoạt / tắt chế độ vẽ tay đè trực tiếp lên văn bản (Drawing Mode) |
| **Chuột trái vẽ** | Drawing Canvas | Vẽ nét chú thích hoặc sơ đồ trực tiếp lên trang văn bản |
| **Giữ chuột phải kéo** | Drawing Canvas | Di chuyển vị trí thanh công cụ vẽ tự do |
| **Bôi đen text + Chuột phải** | PureDomainEditor / NovelEditor | Mở Context Menu: Tạo danh mục mới hoặc thêm vào danh mục có sẵn |
| **Enter (khi đổi tên)** | Sidebar / Editor Header | Xác nhận lưu tên mới của chương, phân cảnh hoặc tác phẩm |
| **Lăn chuột (Wheel)** | Thanh Tab (TabBar) | Cuộn ngang danh sách các tab đang mở mượt mà |

---

## 5. Cấu Trúc Thành Phần Giao Diện (Component Architecture)

### 5.1. Sidebar Điều Hướng & Quản Lý Dự Án
- **Multi-Project Hub**: Cho phép tạo nhiều tác phẩm độc lập, đổi tên tác phẩm, chuyển đổi giữa các tác phẩm và nút reset dữ liệu 100%.
- **Bảng dữ liệu trực quan (Category Matrix View)**: Nút truy cập nhanh ở vị trí ưu tiên cao nhất của Sidebar.
- **Soạn thảo thiết lập (Thuần văn bản)**: 4 mục cốt lõi (*Hệ thống sức mạnh*, *World building*, *Thế lực/Giai cấp*, *Cốt truyện*).
- **Cấu trúc Chương & Hồi**:
  - Mỗi chương có nút: Đổi tên (`Edit2`), Thêm hồi (`Plus`), Xóa chương (`Trash2`).
  - Mỗi hồi có nút: Đổi tên (`Edit2`), Xóa hồi (`Trash2`).
  - Cho phép xóa bất kỳ chương hay hồi nào mà không bị ẩn nút; tự động đóng các tab liên quan khi bị xóa.

### 5.2. Trình Soạn Thảo Bản Thảo (Novel Editor)
- Tích hợp lớp vẽ tay trong suốt bám theo cuộn trang (`DrawingCanvas.tsx`). Nét vẽ được lưu trữ vĩnh viễn theo phân cảnh (`scene.drawingStrokes`).
- Header đầu trang hiển thị tên Chương và tên Hồi:
  - Cho phép đổi tên chương và đổi tên hồi trực tiếp tại chỗ.
  - Có nút thêm hồi mới và nút xóa hồi/chương kèm xác nhận an toàn.

### 5.3. Trích Xuất Dữ Liệu Thông Minh (Entity Extraction Matrix)
- Khi bôi đen đoạn văn bản trong `PureDomainEditor`:
  - **Tạo danh mục mới**: Tên danh mục được trích xuất từ văn bản bôi đen; nội dung văn bản gốc không hề bị mất.
  - **Thêm vào danh mục có sẵn**: Cho phép tác giả tự gõ nhãn thuộc tính tùy chọn (ví dụ: *Công thức*, *Nguyên liệu*, *Năng lượng tiêu hao*, *Quy luật*...).
- Dữ liệu trích xuất hiển thị dạng bảng trực quan tại `CategoryMatrixView.tsx` với đầy đủ tính năng lọc, tìm kiếm và xóa danh mục.

### 5.4. Dòng Thời Gian Lịch Sử & Sự Kiện (World Building Timeline)
- Bật / tắt nhanh bằng `Ctrl + J` hoặc nút toggle dưới chân màn hình.
- Thao tác cuộn ngang mượt mà, hỗ trợ zoom `ZoomIn`, `ZoomOut` và nút nhấp để reset 100%.
- Khi nhấp chọn một mốc biến cố:
  - Hộp thoại chỉnh sửa chi tiết (Floating Edit Popover) bung nổi lên **phía trên** thanh Timeline (`bottom-full`), tránh hoàn toàn lỗi bị che khuất hoặc cắt xén bởi container cuộn ngang.
  - Cho phép sửa trực tiếp: Tên mốc biến cố, Thời điểm / Niên đại, Tóm tắt diễn biến cốt truyện, Bảng màu sắc mốc.
  - Có nút xóa mốc sự kiện (`Trash2`) màu đỏ để loại bỏ mốc thừa nhanh chóng.

### 5.5. Hồ Sơ Nhân Vật & Mạng Lưới Quan Hệ (Character Codex & Interactive Graph)
- **Hồ sơ & Tính cách, Tiểu sử**: Soạn thảo thông tin cá nhân, ngoại hình, tính cách, mục tiêu và biến cố cuộc đời.
- **Vai trò & Tags nhân vật tự do (Custom Roles & Tags)**:
  - Bỏ hoàn toàn menu cố định: Cho phép tác giả tự gõ bất kỳ vai trò nào (VD: *Sư phụ, Đạo lữ, Ẩn thế cao nhân, Ma tôn, Linh vật, Boss ẩn...*) kèm hàng loạt gợi ý 1-click tham khảo.
  - Hệ thống Tags đặc điểm tự do không giới hạn (VD: `Kiếm tu`, `Chuyển sinh`, `Lạnh lùng`, `Ma giáo`...).
- **Năng lực & Tuyệt kỹ**:
  - Ô nhập thêm kỹ năng/tuyệt kỹ tự do không giới hạn.
  - Gợi ý 1-click từ các danh mục Hệ Thống Sức Mạnh đã được trích xuất từ trước.
  - Quản lý danh sách năng lực đã liên kết và nút gỡ bỏ nhanh.
- **Tùy biến Mối quan hệ tự do (Custom Relationships & Colors)**:
  - Tự do đặt tên nhãn mối quan hệ: Huynh đệ kết nghĩa, Sư đồ, Kẻ thù truyền kiếp, Tri kỷ, Nợ máu chưa trả, Tình một đêm, v.v.
  - Cho phép tự do chọn màu sắc đường nối tương ứng trên sơ đồ (Xanh lục, Đỏ, Xanh lam, Hồng, Tím, Vàng cam hoặc Color Picker tùy ý).
- **Xóa nhân vật an toàn (Safe Character Deletion)**:
  - Khi xóa nhân vật (từ Sidebar hoặc nút "Xóa nhân vật này" trong hồ sơ): Hệ thống tự động đóng tab tương ứng (`closeTabsByEntityId`), tuân thủ nghiêm ngặt React Rules of Hooks, có màn hình fallback an toàn ngăn ngừa hoàn toàn lỗi trắng trang.
- **Sơ Đồ Mạng Lưới Tương Tác (Interactive Relationship Graph)**:
  - Mở trực tiếp từ nút trên Sidebar hoặc nút trong hồ sơ nhân vật.
  - Hiển thị đầy đủ vai trò tự do và các tags đặc trưng của từng nhân vật trên thẻ node.
  - Đường nối quan hệ thể hiện đúng màu sắc mà tác giả đã custom.
  - Bộ lọc vai trò động tự động cập nhật theo các vai trò thực tế có trong tác phẩm.
  - Xếp đặt layout tự động theo hình tròn/lưới, hỗ trợ kéo thả tự do các thẻ nhân vật để tổ chức mối liên kết.
  - Nhấp đúp vào bất kỳ node nhân vật nào trên sơ đồ để mở ngay hồ sơ chi tiết.
  - Sử dụng Custom Node (`CharacterCustomNode`) loại bỏ hoàn toàn viền xám mặc định của React Flow, kiểm soát 100% kích thước và viền thẻ nhân vật, ngăn chặn triệt để lỗi tràn lệch khung.

### 5.6. Thanh Trạng Thái & Thống Kê (Status Bar)
- **Thống kê số từ thời gian thực**: Đếm số từ phân cảnh hiện tại và tổng số từ toàn bộ bản thảo.
- **Tương tác Mục tiêu số từ**: Nhấp trực tiếp vào mục tiêu để sửa số từ dự kiến cho tác phẩm, hiển thị % tiến độ kèm thanh tiến độ mini.
- **Trạng thái lưu trữ**: Hiển thị trạng thái tự động lưu; nhấp vào để kích hoạt lưu ngay lập tức.
- **Phím tắt chuyển đổi Theme**: 3 nút chuyển nhanh Theme (Giấy ấm, Đêm tối, Sách cổ) có phản hồi thị giác và viền active rõ ràng.
- **Công cụ thao tác nhanh**: Nút bật/tắt nhanh Dòng thời gian (`Timeline`) và Chế độ viết tập trung (`Zen Mode`).

---

## 6. Tiêu Chuẩn Phản Hồi & Khả Năng Tiếp Cận (Accessibility & Feedback)

- **Thời gian chuyển động (Transitions)**: `150ms - 200ms` với `ease-out`, không dùng hiệu ứng giật cục hoặc chuyển động quá rườm rà.
- **Vùng bấm tối thiểu**: Các nút icon trên Sidebar và Toolbar có vùng đệm tối thiểu `28px - 36px` để dễ bấm chính xác.
- **Độ tương phản**: Đạt chuẩn tối thiểu WCAG AA (4.5:1) ở cả 3 chế độ màu.

