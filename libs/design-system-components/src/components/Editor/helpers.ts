import { Editor, Transforms, Element, Node, Point } from 'slate';
import { ReactEditor } from 'slate-react';
import ReactDOM from 'react-dom';
import {
  CustomElement,
  CustomText,
  LinkElement,
  MentionElement,
  TagElement,
} from '@akashaorg/typings/lib/ui';
import { Profile } from '@akashaorg/typings/lib/ui';

export const LIST_TYPES = ['numbered-list', 'bulleted-list'];
export const TEXT_ALIGN_TYPES = ['left', 'center', 'right'];

const CustomEditor = {
  isBlockActive(editor: Editor, format: string, blockType = 'type') {
    const { selection } = editor;
    if (!selection) return false;

    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: n => !Editor.isEditor(n) && Element.isElement(n) && n[blockType] === format,
      }),
    );

    return !!match;
  },

  isMarkActive(editor, format) {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  },

  toggleBlock(editor, format) {
    const isActive = this.isBlockActive(
      editor,
      format,
      TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type',
    );
    const isList = LIST_TYPES.includes(format);

    Transforms.unwrapNodes(editor, {
      match: n =>
        !Editor.isEditor(n) &&
        Element.isElement(n) &&
        LIST_TYPES.includes(n.type) &&
        !TEXT_ALIGN_TYPES.includes(format),
      split: true,
    });
    let newProperties: Partial<Element>;
    if (TEXT_ALIGN_TYPES.includes(format)) {
      newProperties = {
        align: isActive ? undefined : format,
      };
    } else {
      const inactiveFormat = isList ? 'list-item' : format;
      newProperties = {
        type: isActive ? 'paragraph' : inactiveFormat,
      };
    }
    Transforms.setNodes<Element>(editor, newProperties);

    if (!isActive && isList) {
      const block = { type: format, children: [] };
      Transforms.wrapNodes(editor, block);
    }
  },

  toggleMark(editor, format) {
    const isActive = this.isMarkActive(editor, format);

    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  },

  insertText(editor: Editor, text: string) {
    ReactEditor.focus(editor);
    const textElem: CustomText = { text };
    Transforms.insertNodes(editor, textElem);
  },

  insertMention(editor: Editor, mentionData: Profile) {
    const baseMention: { type: 'mention'; children: [{ text: '' }] } = {
      type: 'mention',
      children: [{ text: '' }],
    };
    const mention: MentionElement = Object.assign(baseMention, mentionData);
    Transforms.insertNodes(editor, mention);
    ReactEditor.focus(editor);
    Transforms.move(editor);
  },

  insertTag(editor: Editor, tagData: { name: string; totalPosts: number }) {
    const baseTag: { type: 'tag'; children: [{ text: '' }] } = {
      type: 'tag',
      children: [{ text: '' }],
    };
    const tag: TagElement = Object.assign(baseTag, tagData);
    Transforms.insertNodes(editor, tag);
    ReactEditor.focus(editor);
    Transforms.move(editor);
  },

  insertLink(editor: Editor, linkData: { url: string }) {
    const baseLink: { type: 'link'; children: [{ text: '' }] } = {
      type: 'link',
      children: [{ text: '' }],
    };
    const link: LinkElement = Object.assign(baseLink, linkData);
    Transforms.insertNodes(editor, link);
    ReactEditor.focus(editor);
    Transforms.move(editor);
  },

  deleteImage(editor: Editor, element: Element) {
    const path = ReactEditor.findPath(editor, element);
    Transforms.removeNodes(editor, {
      voids: true,
      at: path,
    });
    ReactEditor.focus(editor);
    Transforms.move(editor);
  },
  /**
   * resetNodes resets the value of the editor.
   * It should be noted that passing the `at` parameter may cause a "Cannot resolve a DOM point from Slate point" error.
   */
  resetNodes(
    editor: Editor,
    options: {
      nodes?: Node | Node[];
      at?: Location;
    } = {},
  ): void {
    const children = [...editor.children];

    children.forEach(node => editor.apply({ type: 'remove_node', path: [0], node }));

    if (options.nodes) {
      const nodes = Node.isNode(options.nodes) ? [options.nodes] : options.nodes;

      nodes.forEach((node, i) => editor.apply({ type: 'insert_node', path: [i], node: node }));
    }

    const point = options.at && Point.isPoint(options.at) ? options.at : Editor.end(editor, []);

    if (point) {
      Transforms.select(editor, point);
    }
  },

  clearEditor(editor: Editor) {
    Transforms.select(editor, []);
    Transforms.delete(editor);
  },
};

export const isEditorEmpty = (editorState?: CustomElement[]) => {
  return !editorState?.find(content => {
    if (content && 'children' in content) {
      return content.children.find(childContent =>
        'text' in childContent ? !!childContent.text : true,
      );
    }
    return content && 'text' in content ? !!content.text : false;
  });
};

interface IPortal {
  children: React.ReactNode;
}

export const Portal: React.FC<IPortal> = ({ children }) => {
  return ReactDOM.createPortal(children, document.body);
};

export { CustomEditor };
