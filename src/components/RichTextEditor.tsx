import { useEffect } from "react";
import { useEditor, EditorContent, type Content } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Bold, Italic, List, ListOrdered, Heading2, Quote, Code, Undo, Redo, Table as TableIcon, Rows3 } from "lucide-react";
import { ru } from "../i18n/ru";
import { inputStyle, tw, v } from "../shared/theme";

interface RichTextEditorProps {
  content: object | null;
  onChange: (json: object) => void;
  isDark: boolean;
  placeholder?: string;
  readOnly?: boolean;
}

export function RichTextEditor({ content, onChange, isDark, placeholder, readOnly }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
      }),
      BulletList,
      OrderedList,
      ListItem,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: placeholder ?? ru.editor.placeholder }),
    ],
    content: (content as Content) ?? undefined,
    editable: !readOnly,
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

  if (!editor) return null;

  const btn = (active: boolean, onClick: () => void, icon: React.ReactNode, title: string) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="rounded-md border p-1.5 text-xs transition-colors"
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
          {btn(editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), <Bold size={14} />, ru.editor.bold)}
          {btn(editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), <Italic size={14} />, ru.editor.italic)}
          {btn(editor.isActive("heading", { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), <Heading2 size={14} />, ru.editor.heading)}
          {btn(editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run(), <List size={14} />, ru.editor.bulletList)}
          {btn(editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run(), <ListOrdered size={14} />, ru.editor.orderedList)}
          {btn(editor.isActive("blockquote"), () => editor.chain().focus().toggleBlockquote().run(), <Quote size={14} />, ru.editor.quote)}
          {btn(editor.isActive("code"), () => editor.chain().focus().toggleCode().run(), <Code size={14} />, ru.editor.code)}
          <div className="mx-1 w-px" style={{ background: v("border-primary") }} />
          {btn(false, () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(), <TableIcon size={14} />, ru.editor.table)}
          {btn(false, () => editor.chain().focus().addRowAfter().run(), <Rows3 size={14} />, ru.editor.addRow)}
          {btn(false, () => editor.chain().focus().deleteRow().run(), <Rows3 size={14} />, ru.editor.deleteRow)}
          <div className="mx-1 w-px" style={{ background: v("border-primary") }} />
          {btn(false, () => editor.chain().focus().undo().run(), <Undo size={14} />, ru.editor.undo)}
          {btn(false, () => editor.chain().focus().redo().run(), <Redo size={14} />, ru.editor.redo)}
        </div>
      )}
      <div className={`p-3 text-sm tiptap ${readOnly ? "" : tw.inputBase}`} style={readOnly ? {} : inputStyle(isDark)}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
