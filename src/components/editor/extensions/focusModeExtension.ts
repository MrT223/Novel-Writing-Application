import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export const FocusModeExtension = Extension.create({
  name: 'focusModeExtension',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('focusModeExtension'),
        props: {
          decorations(state) {
            const { selection } = state;
            const decorations: Decoration[] = [];
            const $from = selection.$from;

            // Find top-level block node (depth 1)
            const depth = $from.depth;
            if (depth >= 1) {
              const start = $from.before(1);
              const end = $from.after(1);
              decorations.push(
                Decoration.node(start, end, {
                  class: 'has-focus',
                })
              );
            }

            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});
