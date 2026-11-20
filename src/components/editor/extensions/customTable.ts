import Table from '@tiptap/extension-table';
import { isInTable, selectedRect } from '@tiptap/pm/tables';
import { Selection } from '@tiptap/pm/state';

/**
 * CustomTable:
 * Tùy chỉnh hành vi phím khi soạn thảo trong bảng (chuẩn Excel / Word):
 * 1. Khi nhấn Enter:
 *    - Di chuyển con trỏ xuống ô ở hàng dưới (cùng cột).
 *    - Nếu đang ở hàng dưới cùng của bảng: Tự động tạo 1 hàng mới bên dưới và đưa con trỏ xuống ô tương ứng.
 * 2. Để xuống dòng trong cùng một ô:
 *    - Nhấn `Ctrl + Enter` (hoặc `Cmd + Enter`, hoặc `Shift + Enter`).
 */
export const CustomTable = Table.extend({
  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),

      // Khi nhấn Enter trong bảng: Nhảy xuống hàng dưới; nếu là hàng cuối cùng thì tự tạo hàng mới
      Enter: () => {
        const { state, view } = this.editor;
        if (!isInTable(state)) {
          return false;
        }

        try {
          const rect = selectedRect(state);
          const targetRow = rect.bottom; // Hàng ngay phía dưới ô hiện tại
          const targetCol = rect.left; // Giữ nguyên cột hiện tại

          // Trường hợp 1: Chưa phải hàng cuối cùng -> Chuyển con trỏ xuống ô ở hàng dưới
          if (targetRow < rect.map.height) {
            const cellOffset = rect.map.positionAt(targetRow, targetCol, rect.table);
            const targetPos = rect.tableStart + cellOffset + 1;
            const sel = Selection.near(state.doc.resolve(targetPos));
            view.dispatch(state.tr.setSelection(sel).scrollIntoView());
            return true;
          }

          // Trường hợp 2: Đang ở hàng dưới cùng -> Thêm hàng mới phía dưới và đưa con trỏ xuống ô mới
          if (!this.editor.can().addRowAfter()) {
            return false;
          }

          this.editor.chain().addRowAfter().run();

          // Sau khi tạo hàng mới, tìm toạ độ ô ở hàng mới tạo
          const newState = this.editor.state;
          const newRect = selectedRect(newState);
          const newRow = newRect.map.height - 1;
          const newCellOffset = newRect.map.positionAt(newRow, targetCol, newRect.table);
          const newTargetPos = newRect.tableStart + newCellOffset + 1;
          const newSel = Selection.near(newState.doc.resolve(newTargetPos));
          this.editor.view.dispatch(newState.tr.setSelection(newSel).scrollIntoView());
          return true;
        } catch (err) {
          console.error('Error navigating table on Enter:', err);
          return false;
        }
      },

      // Để xuống dòng trong cùng một ô: Ctrl + Enter hoặc Cmd + Enter
      'Mod-Enter': () => {
        const { state } = this.editor;
        if (!isInTable(state)) {
          return false;
        }
        return this.editor.commands.splitBlock();
      },

      // Hỗ trợ thêm Shift + Enter để xuống dòng trong cùng ô
      'Shift-Enter': () => {
        const { state } = this.editor;
        if (!isInTable(state)) {
          return false;
        }
        return this.editor.commands.splitBlock();
      },
    };
  },
});
