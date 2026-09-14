import { Node, mergeAttributes } from '@tiptap/react';

export const ColumnBlock = Node.create({
  name: 'columnBlock',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      columns: {
        default: 2,
        parseHTML: (element) => {
          if (element.classList.contains('doc-columns-3')) return 3;
          if (element.classList.contains('doc-columns-2')) return 2;
          return 1;
        },
        renderHTML: (attributes) => {
          const count = attributes.columns || 2;
          return {
            class: `doc-columns-${count}`,
            'data-columns': count
          };
        }
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[class*="doc-columns-"]',
        getAttrs: (element) => {
          if (typeof element === 'string') return {};
          let columns = 2;
          if (element.classList.contains('doc-columns-3')) columns = 3;
          else if (element.classList.contains('doc-columns-1')) columns = 1;
          return { columns };
        }
      }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setColumns:
        (columns = 2) =>
        ({ commands, editor }) => {
          if (columns === 1) {
            return commands.lift('columnBlock');
          }
          if (editor.isActive('columnBlock')) {
            return commands.updateAttributes('columnBlock', { columns });
          }
          return commands.wrapIn('columnBlock', { columns });
        },
      toggleColumns:
        (columns = 2) =>
        ({ commands, editor }) => {
          if (editor.isActive('columnBlock', { columns })) {
            return commands.lift('columnBlock');
          }
          if (editor.isActive('columnBlock')) {
            return commands.updateAttributes('columnBlock', { columns });
          }
          return commands.wrapIn('columnBlock', { columns });
        },
      unsetColumns:
        () =>
        ({ commands }) => {
          return commands.lift('columnBlock');
        }
    };
  }
});

export const ColumnBreak = Node.create({
  name: 'columnBreak',
  group: 'block',
  selectable: true,
  atom: true,

  parseHTML() {
    return [{ tag: 'div.column-break' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'column-break' })];
  },

  addCommands() {
    return {
      insertColumnBreak:
        () =>
        ({ commands }) => {
          return commands.insertContent('<div class="column-break"></div><p></p>');
        }
    };
  }
});
