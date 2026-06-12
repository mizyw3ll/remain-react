import { useEffect, useRef } from "react";
import { useEditor, EditorContent, type Content } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Image } from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Code,
  FileCode,
  Undo,
  Redo,
  Table as TableIcon,
  Rows3,
  Columns3,
  Trash2,
  SquareX,
  X,
  Strikethrough,
  Highlighter,
  Subscript as SubscriptIcon,
  Paperclip,
  ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { ru } from "../i18n/ru";
import { uploadBlockAttachmentApi } from "../api";
import { inputStyle, tw, v } from "../shared/theme";

export interface RichTextEditorUploadContext {
  planId: number;
  blockId: number;
}

interface RichTextEditorProps {
  content: object | null;
  onChange: (json: object) => void;
  isDark: boolean;
  placeholder?: string;
  readOnly?: boolean;
  uploadContext?: RichTextEditorUploadContext | null;
}

export function RichTextEditor({
  content,
  onChange,
  isDark,
  placeholder,
  readOnly,
  uploadContext,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: { openOnClick: false },
      }),
      Highlight.configure({ multicolor: false }),
      Subscript,
      Image.configure({ inline: true, allowBase64: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: placeholder ?? ru.editor.placeholder }),
    ],
    content: (content as Content) ?? undefined,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: "tiptap-editor focus:outline-none",
      },
    },
    onUpdate: ({ editor: ed }) => {
      if (!readOnly) {
        onChange(ed.getJSON());
      }
    },
  });

  useEffect(() => {
    if (!editor || content == null) return;
    const current = JSON.stringify(editor.getJSON());
    const incoming = JSON.stringify(content);
    if (current !== incoming) {
      editor.commands.setContent(content as Content, { emitUpdate: false });
    }
  }, [editor, content]);

  async function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;
    if (!uploadContext) {
      toast.error(ru.editor.saveBlockFirst);
      return;
    }
    try {
      const meta = await uploadBlockAttachmentApi(uploadContext.planId, uploadContext.blockId, file);
      const url = meta.url;
      if (file.type.startsWith("image/")) {
        editor.chain().focus().setImage({ src: url, alt: meta.name }).run();
      } else {
        editor.chain().focus().insertContent(`<a href="${url}">${meta.name}</a> `).run();
      }
    } catch {
      toast.error(ru.editor.fileUploadError);
    }
  }

  if (!editor) return null;

  const btn = (active: boolean, onClick: () => void, icon: React.ReactNode, title: string, disabled = false) => (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className="rounded-md border p-1.5 text-xs transition-colors disabled:opacity-40"
      style={{
        borderColor: active ? v("border-secondary") : "transparent",
        background: active ? v("bg-hover") : "transparent",
        color: active ? v("text-primary") : v("text-muted"),
      }}
    >
      {icon}
    </button>
  );

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: v("border-primary"), background: v("bg-primary") }}
    >
      {!readOnly && (
        <div className="flex flex-wrap gap-1 border-b px-2 py-1.5" style={{ borderColor: v("border-primary") }}>
          {btn(
            editor.isActive("bold"),
            () => editor.chain().focus().toggleBold().run(),
            <Bold size={14} />,
            ru.editor.bold,
          )}
          {btn(
            editor.isActive("italic"),
            () => editor.chain().focus().toggleItalic().run(),
            <Italic size={14} />,
            ru.editor.italic,
          )}
          {btn(
            editor.isActive("strike"),
            () => editor.chain().focus().toggleStrike().run(),
            <Strikethrough size={14} />,
            ru.editor.strike,
          )}
          {btn(
            editor.isActive("highlight"),
            () => editor.chain().focus().toggleHighlight().run(),
            <Highlighter size={14} />,
            ru.editor.highlight,
          )}
          {btn(
            editor.isActive("subscript"),
            () => editor.chain().focus().toggleSubscript().run(),
            <SubscriptIcon size={14} />,
            ru.editor.subscript,
          )}
          {btn(
            editor.isActive("heading", { level: 2 }),
            () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            <Heading2 size={14} />,
            ru.editor.heading,
          )}
          {btn(
            editor.isActive("bulletList"),
            () => editor.chain().focus().toggleBulletList().run(),
            <List size={14} />,
            ru.editor.bulletList,
          )}
          {btn(
            editor.isActive("orderedList"),
            () => editor.chain().focus().toggleOrderedList().run(),
            <ListOrdered size={14} />,
            ru.editor.orderedList,
          )}
          {btn(
            editor.isActive("blockquote"),
            () => editor.chain().focus().toggleBlockquote().run(),
            <Quote size={14} />,
            ru.editor.quote,
          )}
          {btn(
            editor.isActive("code"),
            () => editor.chain().focus().toggleCode().run(),
            <Code size={14} />,
            ru.editor.code,
          )}
          {btn(
            editor.isActive("codeBlock"),
            () => editor.chain().focus().toggleCodeBlock().run(),
            <FileCode size={14} />,
            ru.editor.codeBlock,
          )}
          <div className="mx-1 w-px self-stretch" style={{ background: v("border-primary") }} />
          {btn(
            false,
            () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
            <TableIcon size={14} />,
            ru.editor.table,
          )}
          {btn(false, () => editor.chain().focus().addRowAfter().run(), <Rows3 size={14} />, ru.editor.addRow)}
          {btn(false, () => editor.chain().focus().deleteRow().run(), <Trash2 size={14} />, ru.editor.deleteRow)}
          {btn(false, () => editor.chain().focus().addColumnAfter().run(), <Columns3 size={14} />, ru.editor.addColumn)}
          {btn(false, () => editor.chain().focus().deleteColumn().run(), <SquareX size={14} />, ru.editor.deleteColumn)}
          {btn(false, () => editor.chain().focus().deleteTable().run(), <X size={14} />, ru.editor.deleteTable)}
          <div className="mx-1 w-px self-stretch" style={{ background: v("border-primary") }} />
          {btn(
            false,
            () => fileInputRef.current?.click(), // eslint-disable-line react-hooks/refs
            <Paperclip size={14} />,
            ru.editor.attachFile,
            !uploadContext,
          )}
          {btn(
            false,
            () => fileInputRef.current?.click(), // eslint-disable-line react-hooks/refs
            <ImageIcon size={14} />,
            ru.editor.insertImage,
            !uploadContext,
          )}
          <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => void handleFilePick(e)} />
          <div className="mx-1 w-px self-stretch" style={{ background: v("border-primary") }} />
          {btn(false, () => editor.chain().focus().undo().run(), <Undo size={14} />, ru.editor.undo)}
          {btn(false, () => editor.chain().focus().redo().run(), <Redo size={14} />, ru.editor.redo)}
        </div>
      )}
      <div
        className={`p-3 text-sm tiptap ${readOnly ? "" : tw.inputBase}`}
        style={readOnly ? { minHeight: 120 } : inputStyle(isDark)}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
