import { BulletList } from '@tiptap/extension-bullet-list';

/**
 * CustomBulletList:
 * Trong sáng tác tiểu thuyết (đặc biệt là tiếng Việt), dấu gạch ngang đầu dòng `- `
 * được dùng phổ biến để viết lời thoại nhân vật (Dialogue Dash).
 * Mặc định TipTap sẽ tự động biến `- ` thành thẻ danh sách <ul><li> và ăn mất dấu gạch ngang.
 * CustomBulletList vô hiệu hóa input rule tự động này để bảo toàn nguyên vẹn dấu `- ` khi gõ.
 * Tác giả vẫn có thể tạo danh sách dấu chấm chủ động qua nút trên thanh công cụ.
 */
export const CustomBulletList = BulletList.extend({
  addInputRules() {
    return [];
  },
});
