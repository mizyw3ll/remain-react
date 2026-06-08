import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Folder, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  createNoteApi,
  updateNoteApi,
  deleteNoteApi,
  createProjectApi,
  deleteProjectApi,
  type Note,
  type Project,
  type Tag,
} from "../api";
import { useNotesQuery, useProjectsQuery, useTagsQuery } from "../hooks/useCachedData";
import { queryKeys } from "../lib/queryClient";
import { TagPicker } from "../components/TagPicker";
import { TagChip } from "../components/TagChip";
import { MarkdownPreview } from "../components/MarkdownPreview";
import { buttonStyle, inputStyle, tw, v } from "../shared/theme";
import { useTheme } from "../features/theme/ThemeContext";

const PROJECT_COLORS = [
  "border-l-red-500",
  "border-l-orange-500",
  "border-l-amber-500",
  "border-l-green-500",
  "border-l-teal-500",
  "border-l-blue-500",
  "border-l-indigo-500",
  "border-l-violet-500",
  "border-l-purple-500",
  "border-l-pink-500",
];

export function NotesPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const tagIdsParam = selectedTagId ? String(selectedTagId) : undefined;
  const { data: notes = [], isLoading: notesLoading } = useNotesQuery(selectedProject, tagIdsParam);
  const { data: projects = [], isLoading: projectsLoading } = useProjectsQuery();
  const { data: allTags = [], isLoading: tagsLoading } = useTagsQuery();
  const loading = notesLoading || projectsLoading || tagsLoading;

  // Note editor
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteProjectId, setNoteProjectId] = useState<number | null>(null);
  const [noteTags, setNoteTags] = useState<Tag[]>([]);

  // Project create
  const [projectInput, setProjectInput] = useState("");

  async function refreshNotes() {
    await queryClient.invalidateQueries({ queryKey: queryKeys.notes(selectedProject, tagIdsParam) });
  }

  async function refreshProjects() {
    await queryClient.invalidateQueries({ queryKey: queryKeys.projects });
  }

  function openNewNote() {
    setEditingNote(null);
    setNoteTitle("");
    setNoteContent("");
    setNoteProjectId(selectedProject);
    setNoteTags([]);
    setEditorOpen(true);
  }

  function openEditNote(note: Note) {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content_markdown);
    setNoteProjectId(note.project_id ?? null);
    setNoteTags(note.tags ?? []);
    setEditorOpen(true);
  }

  async function saveNote() {
    if (!noteTitle.trim()) return;
    try {
      if (editingNote) {
        await updateNoteApi(editingNote.id, {
          title: noteTitle.trim(),
          content_markdown: noteContent,
          project_id: noteProjectId,
          tag_ids: noteTags.map((t) => t.id),
        });
        toast.success("Заметка обновлена");
      } else {
        await createNoteApi({
          title: noteTitle.trim(),
          content_markdown: noteContent,
          project_id: noteProjectId,
          tag_ids: noteTags.map((t) => t.id),
        });
        toast.success("Заметка создана");
      }
      setEditorOpen(false);
      await refreshNotes();
    } catch {
      toast.error("Ошибка сохранения заметки");
    }
  }

  async function handleDeleteNote(note: Note) {
    try {
      await deleteNoteApi(note.id);
      toast.success("Заметка удалена");
      await refreshNotes();
    } catch {
      toast.error("Ошибка удаления заметки");
    }
  }

  async function handleCreateProject() {
    if (!projectInput.trim()) return;
    try {
      await createProjectApi({ name: projectInput.trim(), color_idx: 0 });
      setProjectInput("");
      toast.success("Проект создан");
      await refreshProjects();
    } catch {
      toast.error("Ошибка создания проекта");
    }
  }

  async function handleDeleteProject(project: Project) {
    try {
      await deleteProjectApi(project.id);
      toast.success("Проект удалён");
      if (selectedProject === project.id) setSelectedProject(null);
      await Promise.all([refreshProjects(), refreshNotes()]);
    } catch {
      toast.error("Ошибка удаления проекта");
    }
  }

  const filteredNotes = notes;

  const currentProject = projects.find((p) => p.id === selectedProject);

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">
      {/* Left sidebar - Projects */}
      <div className="w-64 shrink-0 space-y-3 overflow-y-auto rounded-2xl border p-4" style={{ borderColor: v("border-primary"), background: v("bg-secondary") }}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: v("text-primary") }}>Проекты</h2>
          <button
            onClick={() => setSelectedProject(null)}
            className="text-xs" style={{ color: v("text-muted") }}
          >
            Все
          </button>
        </div>

        <div className="space-y-1">
          {projects.map((p) => (
            <div key={p.id} className="flex items-center gap-1">
              <button
                onClick={() => setSelectedProject(p.id === selectedProject ? null : p.id)}
                className={`flex-1 flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors border-l-4 ${PROJECT_COLORS[p.color_idx % PROJECT_COLORS.length]} ${selectedProject === p.id ? "font-semibold" : ""}`}
                style={{
                  background: selectedProject === p.id ? v("bg-hover") : "transparent",
                  color: v("text-primary"),
                }}
              >
                <Folder size={14} />
                <span className="truncate">{p.name}</span>
              </button>
              <button
                onClick={() => void handleDeleteProject(p)}
                className="p-1 text-gray-400 hover:text-red-500"
                title="Удалить проект"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-1">
          <input
            type="text"
            value={projectInput}
            onChange={(e) => setProjectInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void handleCreateProject(); }}
            placeholder="Новый проект"
            className="flex-1 px-2 py-1 text-xs border rounded"
            style={inputStyle(isDark)}
          />
          <button
            onClick={() => void handleCreateProject()}
            disabled={!projectInput.trim()}
            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            +
          </button>
        </div>

        {/* Tags filter */}
        {allTags.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 mt-3">Фильтр по тегам</h3>
            <div className="flex flex-wrap gap-1">
              {allTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setSelectedTagId(selectedTagId === tag.id ? null : tag.id)}
                  className={selectedTagId === tag.id ? "opacity-100" : "opacity-60 hover:opacity-100"}
                >
                  <TagChip tag={tag} size="sm" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold" style={{ color: v("text-primary") }}>
            {currentProject ? currentProject.name : "Все заметки"}
            {selectedTagId && allTags.find((t) => t.id === selectedTagId) && (
              <span className="ml-2 text-sm font-normal" style={{ color: v("text-muted") }}>
                с тегом <TagChip tag={allTags.find((t) => t.id === selectedTagId)!} size="sm" />
              </span>
            )}
          </h1>
          <button
            onClick={openNewNote}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm"
            style={buttonStyle("primary", isDark)}
          >
            <Plus size={16} />
            Заметка
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p style={{ color: v("text-muted") }}>Загрузка...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <p style={{ color: v("text-muted") }}>Нет заметок</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="rounded-xl border p-4 cursor-pointer transition-colors"
                style={{ borderColor: v("border-primary"), background: v("bg-card") }}
                onClick={() => openEditNote(note)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm" style={{ color: v("text-primary") }}>{note.title}</h3>
                    {note.content_markdown && (
                      <div className="mt-1 text-xs line-clamp-2" style={{ color: v("text-muted") }}>
                        <MarkdownPreview content={note.content_markdown} />
                      </div>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {note.tags?.map((tag) => (
                        <TagChip key={tag.id} tag={tag} size="sm" />
                      ))}
                      {note.project_id && (
                        <span className="text-xs" style={{ color: v("text-muted") }}>
                          📁 {projects.find((p) => p.id === note.project_id)?.name || "Без проекта"}
                        </span>
                      )}
                      <span className="text-xs" style={{ color: v("text-muted") }}>
                        {new Date(note.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); void handleDeleteNote(note); }}
                    className="p-1 text-gray-400 hover:text-red-500 shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {editorOpen && (
        <div className="fixed inset-0 z-[120] grid place-items-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="w-full max-h-[90vh] overflow-y-auto rounded-2xl border p-4 sm:max-w-2xl sm:p-5" style={{ background: v("bg-sidebar"), borderColor: v("border-primary") }}>
            <h3 className="text-lg font-semibold mb-3" style={{ color: v("text-primary") }}>
              {editingNote ? "Редактировать заметку" : "Новая заметка"}
            </h3>

            <div className="space-y-3">
              <input
                className={tw.inputBase}
                style={inputStyle(isDark)}
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Заголовок"
              />

              <select
                className={tw.inputBase}
                style={inputStyle(isDark)}
                value={noteProjectId ?? ""}
                onChange={(e) => setNoteProjectId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Без проекта</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Теги</label>
                <TagPicker selectedTags={noteTags} onChange={setNoteTags} />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                  Содержимое (Markdown)
                </label>
                <textarea
                  className={`${tw.inputBase} min-h-[200px] font-mono`}
                  style={inputStyle(isDark)}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Напишите заметку в Markdown..."
                />
                {noteContent && (
                  <div className="mt-2 rounded-xl border p-3" style={{ borderColor: v("border-secondary") }}>
                    <p className="text-xs font-medium mb-1" style={{ color: v("text-muted") }}>Предпросмотр:</p>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <MarkdownPreview content={noteContent} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                className="rounded-xl border px-4 py-2 text-sm"
                style={{ borderColor: v("border-secondary"), color: v("text-secondary") }}
                onClick={() => setEditorOpen(false)}
              >
                Отмена
              </button>
              <button
                className="rounded-xl border px-4 py-2 text-sm"
                style={buttonStyle("primary", isDark)}
                disabled={!noteTitle.trim()}
                onClick={() => void saveNote()}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}