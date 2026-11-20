# Product

<!-- impeccable:product-schema 1 -->

## Platform

web / desktop (Tauri)

## Stack

delegated: Tauri + React + Tailwind CSS + TypeScript (Frontend kiến trúc Web hiện đại đóng gói Native Desktop với Tauri cho hiệu năng cao, dung lượng nhẹ và trải nghiệm desktop app mượt mà)

## Users

Nhà văn, tiểu thuyết gia và các tác giả sáng tác truyện dài tập trong bối cảnh cần một không gian tập trung cao độ (distraction-free writing) cùng công cụ quản lý cấu trúc phức tạp: phân chia chương hồi, hệ thống nhân vật, tuyến thời gian và hồ sơ xây dựng thế giới (world-building).

## Product Purpose

Cung cấp một ứng dụng chuyên biệt hỗ trợ toàn diện quy trình sáng tác tiểu thuyết từ ý tưởng ban đầu, lên dàn ý, quản lý dữ liệu bối cảnh cho tới viết bản thảo hoàn chỉnh với hiệu suất cao và trải nghiệm người dùng tinh tế, bảo mật dữ liệu cục bộ.

## Positioning

Khác với các trình soạn thảo văn bản phổ thông (Word, Docs) hay ghi chú phân mảnh (Notion, Obsidian), ứng dụng tập trung sâu vào đặc thù của người viết truyện: tích hợp song song không gian soạn thảo không xao nhãng với hệ thống tra cứu nhanh tư liệu cốt truyện, hồ sơ nhân vật và dòng thời gian mà không làm gián đoạn dòng chảy sáng tạo.

## Operating Context

- Môi trường làm việc: Desktop (offline-first, lưu trữ dữ liệu cục bộ an toàn, quản lý đa tác phẩm độc lập).
- Quy trình sử dụng:
  - Giai đoạn chuẩn bị: Lập dàn ý chương hồi, tạo thẻ nhân vật, phác thảo thế giới và hệ thống sức mạnh dưới dạng thuần văn bản.
  - Giai đoạn sáng tác: Viết tập trung với chế độ toàn màn hình / zen mode, theo dõi mục tiêu số lượng từ thời gian thực, vẽ tay chú thích trực tiếp trên trang phân cảnh.
  - Giai đoạn trích xuất & tra cứu: Bôi đen văn bản để trích xuất danh mục và thuộc tính vào Bảng dữ liệu trực quan (Category Matrix).
  - Giai đoạn biên tập: Soát lỗi, kiểm tra tính nhất quán của cốt truyện, timeline và sơ đồ quan hệ nhân vật.

## Capabilities and Constraints

- **Tính năng cốt lõi**:
  - **Quản lý đa tác phẩm (Multi-Project Hub)**: Tạo mới, đổi tên, chuyển đổi giữa nhiều tác phẩm độc lập hoặc reset dữ liệu sạch sẽ.
  - **Cấu trúc Chương & Hồi linh hoạt**: Thêm, đổi tên tại chỗ và xóa chương/phân cảnh linh hoạt (thao tác trực tiếp trên Sidebar và trên đầu trang trình soạn thảo).
  - **Trình soạn thảo bản thảo (Novel Editor) chuẩn Microsoft Word**:
    - TipTap Rich Text Engine chuyên sâu cho văn xuôi và tiểu thuyết.
    - **Quản lý Bảng biểu (Table) đa năng như Word**:
      - Lưới rê chuột chọn nhanh kích thước bảng (tối đa 8x6 hoặc nhập số hàng/cột tùy ý lên đến 50 hàng).
      - Tùy chọn hàng tiêu đề (Header row).
      - **Điều hướng phím bảng thông minh**:
        - Nhấn `Enter`: Tự động nhảy con trỏ xuống ô ở hàng dưới (cùng cột). Nếu đang ở hàng dưới cùng của bảng, tự động tạo thêm 1 hàng mới và đưa con trỏ xuống.
        - Nhấn `Ctrl + Enter` (hoặc `Shift + Enter`): Xuống dòng nội bộ bên trong cùng một ô.
      - Thanh công cụ ngữ cảnh Bảng: Thêm hàng trên/dưới, xóa hàng, thêm cột trái/phải, xóa cột, gộp ô (Merge cells), tách ô (Split cell), xóa toàn bộ bảng.
    - **Bộ công cụ định dạng chữ phong phú**:
      - In đậm (B), In nghiêng (I), Gạch chân (U), Gạch ngang (Strikethrough), Khối mã/Mã code.
      - Bảng chọn màu chữ (Font Color) & Bút dạ quang tô màu nền (Highlight Background).
      - Lựa chọn Phông chữ (Serif cổ điển, Sans hiện đại, Monospace) và Cỡ chữ (13px đến 28px).
      - Thụt đầu dòng (Indent / Tab), căn lề 4 hướng (Trái, Giữa, Phải, Căn đều 2 bên).
      - Chèn liên kết web (Link), danh sách đánh số, gạch đầu dòng, todo checkbox, trích dẫn blockquote, ngắt cảnh (* * *).
      - Xóa định dạng (Clear formatting) về chữ gốc chỉ với 1 click.
    - Chế độ vẽ tay trực tiếp trên nội dung (Drawing Overlay / MB4), bám theo cuộn trang, lưu nét vẽ vĩnh viễn theo phân cảnh.
    - Thống kê số từ thời gian thực.
  - **World Building thuần văn bản tự do (Pure Domain Editors)**:
    - Không gò bó vào form mẫu/template cứng nhắc: *Hệ Thống Sức Mạnh*, *World Building & Bối Cảnh*, *Thế Lực & Giai Cấp*, *Cốt Truyện & Tuyến Tính* đều soạn tự do như viết truyện.
    - **Trích xuất thực thể qua chuột phải**: Bôi đen một đoạn văn bản bất kỳ để tạo danh mục mới hoặc thêm vào danh mục có sẵn với nhãn tự do (Công thức, Nguyên liệu, Năng lượng tiêu hao...), bảo toàn nguyên vẹn văn bản gốc.
  - **Bảng dữ liệu danh mục trực quan (Category Matrix View)**:
    - Hiển thị bảng tổng hợp các danh mục và thuộc tính đã trích xuất, hỗ trợ lọc theo domain, tìm kiếm nhanh và tùy biến thêm/sửa/xóa thuộc tính.
  - **Hồ sơ nhân vật & Sơ đồ quan hệ**:
    - Quản lý thẻ nhân vật, tùy chỉnh danh hiệu, vai trò, tag vô hạn và màu sắc đại diện.
    - Sơ đồ quan hệ mạng lưới tương tác trực quan (React Flow) với màu sắc quan hệ tùy biến, lọc theo vai trò động.
  - **Xuất bản thảo (Export) & Sao lưu (Backup/Restore)**:
    - Xuất toàn bộ tác phẩm hoặc từng chương sang: Văn bản thuần (.txt), Markdown (.md), Trang sách Web (.html), và File sao lưu đầy đủ (.json).
    - Khôi phục / nhập lại dữ liệu tác phẩm từ file sao lưu .json bất kỳ lúc nào.
  - **Chế độ gõ tập trung nâng cao (Focus Mode & Typewriter Mode)**:
    - Focus Mode: Tự động làm mờ các đoạn văn xung quanh, chỉ làm nổi bật đoạn đang đặt con trỏ gõ chữ.
    - Typewriter Mode: Tự động cuộn mượt và giữ con trỏ gõ văn bản luôn nằm ở chính giữa màn hình theo phương thẳng đứng.
  - **Thanh dòng thời gian ngang (Timeline Bar)**:
    - Toggle nhanh bằng `Ctrl + J`, hỗ trợ zoom, thêm và quản lý các mốc biến cố cốt truyện qua Floating Popover nổi.
  - **Hệ thống Tab thông minh**: Chuyển đổi mượt mà, ngăn trùng lặp tab, tự động đóng tab khi chương/phân cảnh bị xóa, nút `+` tạo nhanh phân cảnh mới.
- **Ràng buộc**:
  - Tối ưu cho hiển thị màn hình desktop, hỗ trợ phím tắt thao tác nhanh (keyboard-driven).
  - Hỗ trợ 3 theme: Sáng (Warm Paper), Tối (Dark Night), và Sepia với độ tương phản WCAG AA bảo vệ mắt tác giả viết đêm.

## Product Principles

1. **Focus First**: Giao diện soạn thảo phải tối giản, loại bỏ mọi xao nhãng thị giác để tác giả chìm đắm hoàn toàn vào câu chữ.
2. **Absolute Freedom**: Không áp đặt cấu trúc form mẫu gò bó cho sáng tạo thế giới; tác giả được tự do viết thuần văn bản và linh hoạt trích xuất theo nhu cầu.
3. **Context at a Glance**: Dễ dàng tra cứu thông tin nhân vật, bảng ma trận danh mục và ghi chú cốt truyện mà không phải rời khỏi giao diện viết chính.
4. **Local & Reliable**: Dữ liệu tác phẩm là tài sản quý giá nhất của tác giả, đảm bảo tính toàn vẹn, tự động lưu và ưu tiên lưu trữ nội bộ (offline-first).
5. **Delightful Craft**: Phông chữ, khoảng cách dòng, màu nền và chuyển động đều được chăm chút tỉ mỉ để tạo cảm giác gõ chữ đầy cảm hứng.
