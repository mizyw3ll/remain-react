import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, Download, Camera, Share2, MessageCircle, Check, X, Copy, Loader2, FileText, Table } from "lucide-react";
import { BlockRenderer } from "../components/BlockRenderer";
import toast from "react-hot-toast";
import {
  createPlanBlockApi,
  deleteBusinessPlanApi,
  deletePlanBlockApi,
  getBusinessPlanApi,
  getPlanBlocksApi,
  getFinancialPlansApi,
  type MediaAttachment,
  reorderPlanBlocksApi,
  updateBusinessPlanApi,
  updatePlanBlockApi,
  exportBusinessPlanApi,
  saveSnapshotApi,
  getSnapshotsApi,
  restoreSnapshotApi,
  sharePlanApi,
  unsharePlanApi,
  getCommentsApi,
  createCommentApi,
  updateCommentApi,
  deleteCommentApi,
  type BusinessPlan,
  type PlanBlock,
  type FinancialPlan,
} from "../api";
import { ConfirmModal } from "../components/ConfirmModal";
import { BlockModal } from "../components/BlockModal";
import { ExpandableText } from "../components/ExpandableText";
import { buttonStyle, inputStyle, tw, v, theme } from "../shared/theme";
import { useTheme } from "../features/theme/ThemeContext";
import { getDefaultRichContent, normalizeRichContentForBlockType } from "../lib/blockDefaults";
import { ru } from "../i18n/ru";

function SortableBlock({
  block,
  onDelete,
  onEdit,
  onComments,
  financialCharts,
  isDark,
}: {
  block: PlanBlock;
  onDelete: (block: PlanBlock) => void;
  onEdit: (block: PlanBlock) => void;
  onComments: (block: PlanBlock) => void;
  financialCharts: FinancialPlan[];
  isDark: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        background: isDark ? theme.colors.dark.bg.secondary : theme.colors.light.bg.secondary,
        border: `1px solid ${isDark ? theme.colors.dark.border.primary : theme.colors.light.border.primary}`,
      }}
      className="rounded-2xl border p-4 overflow-hidden"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold break-words" style={{ color: v("text-primary") }}>{block.title}</h3>
          <p className="text-xs capitalize" style={{ color: v("text-muted") }}>{block.block_type.replace("_", " ")}</p>
        </div>
        <div className="shrink-0 flex gap-2">
          <button
            className="rounded-lg border px-3 py-1 text-xs transition-colors md:hidden"
            style={{ borderColor: v("border-secondary"), color: v("text-secondary"), cursor: "grab" }}
            {...attributes} {...listeners}
            onTouchStart={(e) => {
              e.currentTarget.style.cursor = "grabbing";
              e.currentTarget.style.background = v("bg-hover");
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.cursor = "grab";
              e.currentTarget.style.background = "transparent";
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.cursor = "grabbing";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.cursor = "grab";
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = v("bg-hover"); }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.cursor = "grab";
            }}
          >
            <GripVertical size={16} />
          </button>
          <button
            className="rounded-lg border px-3 py-1 text-xs transition-colors hidden md:flex"
            style={{ borderColor: v("border-secondary"), color: v("text-secondary"), cursor: "grab" }}
            {...attributes} {...listeners}
            onMouseDown={(e) => {
              e.currentTarget.style.cursor = "grabbing";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.cursor = "grab";
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = v("bg-hover"); }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.cursor = "grab";
            }}
          >
            Перетащить
          </button>
          <button
            className="rounded-lg border px-3 py-1 text-xs transition-colors"
            style={{ borderColor: v("border-secondary"), color: v("text-secondary") }}
            onMouseEnter={(e) => { e.currentTarget.style.background = v("bg-hover"); }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            onClick={() => onEdit(block)}
          >
            <Pencil size={14} />
          </button>
          <button
            className="rounded-lg border px-3 py-1 text-xs transition-colors"
            style={{ borderColor: v("border-secondary"), color: v("text-secondary") }}
            onMouseEnter={(e) => { e.currentTarget.style.background = v("bg-hover"); }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            onClick={() => onComments(block)}
          >
            <MessageCircle size={14} />
          </button>
          <button
            className="rounded-lg border px-3 py-1 text-xs transition-colors"
            style={buttonStyle("danger", isDark)}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(220, 38, 38, 0.2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            onClick={() => onDelete(block)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <BlockRenderer block={block} financialCharts={financialCharts} isDark={isDark} />
    </article>
  );
}

export function BusinessPlanDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const planId = Number(id);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 0, tolerance: 10 } })
  );

  const [plan, setPlan] = useState<BusinessPlan | null>(null);
  const [blocks, setBlocks] = useState<PlanBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "plan" | "block"; id: number; title: string } | null>(
    null,
  );
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [planForm, setPlanForm] = useState({ title: "", description: "" });

  // Block modal state (for create and edit)
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<number | null>(null);
  const [blockForm, setBlockForm] = useState<{
    title: string;
    content: string;
    block_type: string;
    rich_content: object;
    media_attachments: MediaAttachment[];
    linked_financial_chart_ids: number[];
  }>({
    title: "",
    content: "",
    block_type: "general",
    rich_content: {},
    media_attachments: [],
    linked_financial_chart_ids: [],
  });
  const [financialCharts, setFinancialCharts] = useState<FinancialPlan[]>([]);

  // Snapshots
  const [snapshotsOpen, setSnapshotsOpen] = useState(false);
  const [snapshots, setSnapshots] = useState<{ id: number; title: string; note: string | null; created_at: string; created_by_id: number }[]>([]);
  const [snapshotsLoading, setSnapshotsLoading] = useState(false);

  // Sharing
  const [shareOpen, setShareOpen] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);

  // Comments
  const [commentBlockId, setCommentBlockId] = useState<number | null>(null);
  const [comments, setComments] = useState<{ id: number; content: string; resolved: boolean; created_at: string; user_id: number }[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Export format selection
  const [exportFormatOpen, setExportFormatOpen] = useState(false);

  const isEditingBlock = editingBlockId !== null;

  const loadFinancialCharts = useCallback(async () => {
    try {
      const charts = await getFinancialPlansApi();
      setFinancialCharts(charts.filter((c) => c.is_active));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    void loadFinancialCharts();
  }, [loadFinancialCharts]);

  const fetchData = useCallback(async () => {
    if (!planId) return;
    try {
      setLoading(true);
      const [planData, blocksData] = await Promise.all([getBusinessPlanApi(planId), getPlanBlocksApi(planId)]);
      setPlan(planData);
      setPlanForm({
        title: planData.title,
        description: planData.description ?? "",
      });
      setBlocks(blocksData);
    } catch {
      toast.error(ru.toasts.planLoadError);
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  function openCreateBlockModal() {
    setEditingBlockId(null);
    setBlockForm({ title: "", content: "", block_type: "general", rich_content: {}, media_attachments: [], linked_financial_chart_ids: [] });
    setBlockModalOpen(true);
  }

  async function saveBlock() {
    if (!planId) return;
    try {
      if (isEditingBlock) {
        await updatePlanBlockApi(planId, editingBlockId, {
          title: blockForm.title.trim(),
          content: blockForm.content.trim(),
          block_type: blockForm.block_type,
          rich_content: blockForm.rich_content,
          media_attachments: blockForm.media_attachments,
          linked_financial_chart_ids: blockForm.linked_financial_chart_ids,
        });
        toast.success(ru.toasts.blockUpdated);
      } else {
        await createPlanBlockApi(planId, {
          title: blockForm.title.trim(),
          content: blockForm.content.trim(),
          block_type: blockForm.block_type,
          rich_content: blockForm.rich_content,
          linked_financial_chart_ids: blockForm.linked_financial_chart_ids,
        });
        toast.success(ru.toasts.blockAdded);
      }
      setBlockModalOpen(false);
      setEditingBlockId(null);
      setBlockForm({ title: "", content: "", block_type: "general", rich_content: {}, media_attachments: [], linked_financial_chart_ids: [] });
      await fetchData();
    } catch {
      toast.error(isEditingBlock ? ru.toasts.blockUpdateError : ru.toasts.blockCreateError);
    }
  }

  function handleEditBlock(block: PlanBlock) {
    setEditingBlockId(block.id);
    setBlockForm({
      title: block.title,
      content: block.content,
      block_type: block.block_type,
      rich_content: normalizeRichContentForBlockType(block.block_type, block.rich_content),
      media_attachments: (block.media_attachments ?? []) as MediaAttachment[],
      linked_financial_chart_ids: block.linked_financial_chart_ids || [],
    });
    setBlockModalOpen(true);
  }

  function handleCancelBlockEdit() {
    setBlockModalOpen(false);
    setEditingBlockId(null);
    setBlockForm({ title: "", content: "", block_type: "general", rich_content: {}, media_attachments: [], linked_financial_chart_ids: [] });
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !planId) return;
    const oldIndex = blocks.findIndex((block) => block.id === active.id);
    const newIndex = blocks.findIndex((block) => block.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(blocks, oldIndex, newIndex);
    setBlocks(next);
    try {
      await reorderPlanBlocksApi(planId, next.map((block) => block.id));
      toast.success(ru.toasts.orderUpdated);
    } catch {
      toast.error(ru.toasts.orderError);
      setBlocks(blocks);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget || !planId) return;
    try {
      if (deleteTarget.type === "plan") {
        await deleteBusinessPlanApi(deleteTarget.id);
        toast.success(ru.toasts.planDeleted);
        navigate("/business-plans");
      } else {
        await deletePlanBlockApi(planId, deleteTarget.id);
        toast.success(ru.toasts.blockDeleted);
        await fetchData();
      }
    } catch {
      toast.error(ru.toasts.deleteError);
    } finally {
      setDeleteTarget(null);
    }
  }

  async function savePlan() {
    if (!planId || !planForm.title.trim()) return;
    try {
      const updated = await updateBusinessPlanApi(planId, {
        title: planForm.title.trim(),
        description: planForm.description.trim() || undefined,
      });
      setPlan(updated);
      setPlanForm({
        title: updated.title,
        description: updated.description ?? "",
      });
      setIsEditingPlan(false);
      toast.success(ru.toasts.planUpdated);
    } catch {
      toast.error(ru.toasts.planUpdateError);
    }
  }

  function handleBlockFormChange(field: string, value: string | number[] | object) {
    setBlockForm((prev) => {
      if (field === "block_type" && typeof value === "string" && value !== prev.block_type) {
        return {
          ...prev,
          block_type: value,
          rich_content: getDefaultRichContent(value),
          media_attachments: [],
          linked_financial_chart_ids: value === "chart_embed" ? prev.linked_financial_chart_ids : [],
        };
      }
      return { ...prev, [field]: value };
    });
  }

  async function handleExportPlan(format: "html" | "xlsx" | "csv" = "html") {
    if (!planId) return;
    try {
      const blob = await exportBusinessPlanApi(planId, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `plan_${planId}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(ru.toasts.planExported);
      setExportFormatOpen(false);
    } catch {
      toast.error(ru.toasts.exportError);
    }
  }

  async function loadSnapshots() {
    if (!planId) return;
    try {
      setSnapshotsLoading(true);
      const data = await getSnapshotsApi(planId);
      setSnapshots(data);
    } catch {
      toast.error(ru.toasts.snapshotsLoadError);
    } finally {
      setSnapshotsLoading(false);
    }
  }

  async function handleSaveSnapshot() {
    if (!planId) return;
    try {
      await saveSnapshotApi(planId);
      toast.success(ru.toasts.snapshotSaved);
      await loadSnapshots();
    } catch {
      toast.error(ru.toasts.snapshotSaveError);
    }
  }

  async function handleRestoreSnapshot(snapshotId: number) {
    if (!planId) return;
    try {
      await restoreSnapshotApi(planId, snapshotId);
      toast.success(ru.toasts.snapshotRestored);
      setSnapshotsOpen(false);
      await fetchData();
    } catch {
      toast.error(ru.toasts.snapshotRestoreError);
    }
  }

  async function handleShare() {
    if (!planId || !plan) return;
    try {
      if (plan.is_public) {
        await unsharePlanApi(planId);
        toast.success(ru.toasts.sharingDisabled);
        setPlan((p) => (p ? { ...p, is_public: false } : p));
      } else {
        const data = await sharePlanApi(planId);
        toast.success(ru.toasts.sharingEnabled);
        setPlan((p) => (p ? { ...p, is_public: true, share_token: data.share_token } : p));
        setShareToken(data.share_token);
      }
    } catch {
      toast.error(ru.toasts.sharingError);
    }
  }

  async function loadComments(blockId: number) {
    if (!planId) return;
    try {
      setCommentsLoading(true);
      const data = await getCommentsApi(planId, blockId);
      setComments(data);
    } catch {
      toast.error(ru.toasts.commentsLoadError);
    } finally {
      setCommentsLoading(false);
    }
  }

  async function handleAddComment() {
    if (!planId || !commentBlockId || !commentText.trim()) return;
    try {
      await createCommentApi(planId, commentBlockId, commentText.trim());
      setCommentText("");
      await loadComments(commentBlockId);
    } catch {
      toast.error(ru.toasts.commentAddError);
    }
  }

  async function handleToggleResolveComment(commentId: number, resolved: boolean) {
    if (!planId || !commentBlockId) return;
    try {
      await updateCommentApi(planId, commentBlockId, commentId, { resolved: !resolved });
      await loadComments(commentBlockId);
    } catch {
      toast.error(ru.toasts.commentUpdateError);
    }
  }

  async function handleDeleteComment(commentId: number) {
    if (!planId || !commentBlockId) return;
    try {
      await deleteCommentApi(planId, commentBlockId, commentId);
      await loadComments(commentBlockId);
    } catch {
      toast.error(ru.toasts.commentDeleteError);
    }
  }

  if (loading) return <div className="h-48 animate-pulse rounded-2xl" style={{ background: v("bg-hover") }} />;
  if (!plan) return <div style={{ color: v("text-secondary") }}>План не найден</div>;

  return (
    <section className="space-y-6 pb-8 pt-2">
      <article
        className="rounded-2xl border p-5"
        style={{
          borderColor: v("border-primary"),
          background: v("bg-secondary"),
        }}
      >
        <div className="space-y-3">
          {/* Title row with buttons */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              {isEditingPlan ? (
                <input
                  className={tw.inputBase}
                  style={inputStyle(isDark)}
                  value={planForm.title}
                  onChange={(e) => setPlanForm((prev) => ({ ...prev, title: e.target.value }))}
                />
              ) : (
                <ExpandableText
                  text={plan.title}
                  fontSize="text-2xl"
                  fontWeight="font-semibold"
                  color="text-primary"
                />
              )}
            </div>
            <div className="shrink-0 flex flex-wrap gap-2">
              {isEditingPlan ? (
                <>
                  <button className={tw.buttonPrimary} onClick={() => void savePlan()}>
                    Сохранить
                  </button>
                  <button
                    className={tw.buttonSecondary}
                    style={buttonStyle("secondary", isDark)}
                    onMouseEnter={(e) => { e.currentTarget.style.background = v("bg-hover"); }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    onClick={() => {
                      setPlanForm({ title: plan.title, description: plan.description ?? "" });
                      setIsEditingPlan(false);
                    }}
                  >
                    Отмена
                  </button>
                </>
              ) : (
                <>
                  <div className="relative">
                    <button
                      className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
                      style={{ borderColor: v("border-secondary"), color: v("text-secondary") }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = v("bg-hover"); }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                      onClick={() => setExportFormatOpen(!exportFormatOpen)}
                    >
                      <Download size={16} />
                      <span className="hidden sm:inline">{ru.modals.export}</span>
                    </button>
                    {exportFormatOpen && (
                      <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border p-1" style={{ borderColor: v("border-primary"), background: v("bg-sidebar") }}>
                        <button
                          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors"
                          style={{ color: v("text-secondary") }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = v("bg-hover"); }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                          onClick={() => void handleExportPlan("html")}
                        >
                          <FileText size={14} />
                          {ru.export.html}
                        </button>
                        <button
                          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors"
                          style={{ color: v("text-secondary") }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = v("bg-hover"); }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                          onClick={() => void handleExportPlan("xlsx")}
                        >
                          <Table size={14} />
                          {ru.export.excel}
                        </button>
                        <button
                          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors"
                          style={{ color: v("text-secondary") }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = v("bg-hover"); }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                          onClick={() => void handleExportPlan("csv")}
                        >
                          <Table size={14} />
                          {ru.export.csv}
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
                    style={{ borderColor: v("border-secondary"), color: v("text-secondary") }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = v("bg-hover"); }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    onClick={() => { setSnapshotsOpen(true); void loadSnapshots(); }}
                  >
                    <Camera size={16} />
                    <span className="hidden sm:inline">{ru.modals.snapshots}</span>
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
                    style={{ borderColor: v("border-secondary"), color: v("text-secondary") }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = v("bg-hover"); }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    onClick={() => { setShareOpen(true); setShareToken(plan.share_token ?? null); setIsPublic(plan.is_public ?? false); }}
                  >
                    <Share2 size={16} />
                    <span className="hidden sm:inline">{ru.modals.share}</span>
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
                    style={buttonStyle("secondary", isDark)}
                    onMouseEnter={(e) => { e.currentTarget.style.background = v("bg-hover"); }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    onClick={() => setIsEditingPlan(true)}
                  >
                    <Pencil size={16} />
                    <span className="hidden sm:inline">Редактировать</span>
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
                    style={buttonStyle("danger", isDark)}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(220, 38, 38, 0.2)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    onClick={() => setDeleteTarget({ type: "plan", id: plan.id, title: plan.title })}
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">Удалить</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Description - full width */}
          {isEditingPlan ? (
            <textarea
              className={tw.inputBase}
              style={inputStyle(isDark)}
              value={planForm.description}
              onChange={(e) => setPlanForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          ) : (
            <ExpandableText text={plan.description || "Без описания"} />
          )}
        </div>
      </article>

      <article className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight" style={{ color: v("text-primary") }}>Блоки</h2>
          <button
            className={tw.buttonPrimary}
            onClick={openCreateBlockModal}
          >
            Добавить блок
          </button>
        </div>
        {blocks.length === 0 ? (
          <div className="flex min-h-[150px] items-center justify-center rounded-xl border p-6" style={{ borderColor: v("border-primary"), background: v("bg-hover") }}>
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: v("text-secondary") }}>
                У вас пока нет блоков в этом плане
              </p>
              <p className="mt-1 text-xs" style={{ color: v("text-muted") }}>
                Добавьте первый блок, чтобы начать заполнять план
              </p>
            </div>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {blocks.map((block) => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    isDark={isDark}
                    financialCharts={financialCharts}
                    onEdit={handleEditBlock}
                    onDelete={(item) => setDeleteTarget({ type: "block", id: item.id, title: item.title })}
                    onComments={(item) => { setCommentBlockId(item.id); void loadComments(item.id); }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </article>

      <BlockModal
        open={blockModalOpen}
        title={isEditingBlock ? ru.modals.editBlock : ru.modals.newBlock}
        form={blockForm}
        planId={planId ?? null}
        editingBlockId={editingBlockId}
        financialCharts={financialCharts}
        isDark={isDark}
        onFormChange={handleBlockFormChange}
        onSave={saveBlock}
        onCancel={handleCancelBlockEdit}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Подтверждение удаления"
        description={
          deleteTarget
            ? `Вы действительно хотите удалить ${deleteTarget.type === "plan" ? "бизнес-план" : "блок"} "${deleteTarget.title}"?`
            : ""
        }
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />

      {/* Snapshots Modal */}
      {snapshotsOpen && (
        <div className={tw.modalOverlay} style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="w-full max-h-[90vh] overflow-y-auto rounded-2xl border p-4 sm:max-w-lg sm:p-5" style={{ background: v("bg-sidebar"), borderColor: v("border-primary") }}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold" style={{ color: v("text-primary") }}>{ru.modals.snapshots}</h3>
              <button className="rounded-lg border px-3 py-1 text-xs" style={buttonStyle("primary", isDark)} onClick={() => void handleSaveSnapshot()}>{ru.modals.saveSnapshot}</button>
            </div>
            {snapshotsLoading ? (
              <div className="flex h-40 items-center justify-center"><Loader2 className="animate-spin" size={24} style={{ color: v("text-muted") }} /></div>
            ) : (
              <div className="mt-3 space-y-2">
                {snapshots.length === 0 ? (
                  <p className="text-sm" style={{ color: v("text-muted") }}>No snapshots yet</p>
                ) : (
                  snapshots.map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-xl border p-3" style={{ borderColor: v("border-primary"), background: v("bg-primary") }}>
                      <div className="min-w-0">
                        <p className="text-sm font-medium" style={{ color: v("text-primary") }}>{s.title}</p>
                        {s.note && <p className="text-xs" style={{ color: v("text-muted") }}>{s.note}</p>}
                        <p className="text-xs" style={{ color: v("text-muted") }}>{new Date(s.created_at).toLocaleString()}</p>
                      </div>
                      <button className="rounded-lg border px-3 py-1 text-xs" style={buttonStyle("primary", isDark)} onClick={() => void handleRestoreSnapshot(s.id)}>{ru.modals.restore}</button>
                    </div>
                  ))
                )}
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button className={tw.buttonSecondary} style={buttonStyle("secondary", isDark)} onClick={() => setSnapshotsOpen(false)}>{ru.modals.close}</button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareOpen && (
        <div className={tw.modalOverlay} style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="w-full max-h-[90vh] overflow-y-auto rounded-2xl border p-4 sm:max-w-lg sm:p-5" style={{ background: v("bg-sidebar"), borderColor: v("border-primary") }}>
            <h3 className="text-lg font-semibold" style={{ color: v("text-primary") }}>{ru.modals.publicSharing}</h3>
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: v("text-secondary") }}>Enable public link</span>
                <button
                  className={`rounded-lg px-3 py-1 text-xs ${isPublic ? "bg-green-600 text-white" : ""}`}
                  style={isPublic ? {} : buttonStyle("primary", isDark)}
                  onClick={() => void handleShare()}
                >
                  {isPublic ? ru.common.on : ru.common.off}
                </button>
              </div>
              {isPublic && shareToken && (
                <div className="rounded-xl border p-3" style={{ borderColor: v("border-primary"), background: v("bg-primary") }}>
                  <p className="text-xs" style={{ color: v("text-muted") }}>Public link:</p>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      className={tw.inputBase + " flex-1 text-xs"}
                      style={inputStyle(isDark)}
                      readOnly
                      value={`${window.location.origin}/public-plans/${planId}?token=${shareToken}`}
                    />
                    <button
                      className="rounded-lg border px-2 py-1"
                      style={{ borderColor: v("border-secondary"), color: v("text-secondary") }}
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/public-plans/${planId}?token=${shareToken}`);
                        toast.success(ru.common.copied);
                      }}
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button className={tw.buttonSecondary} style={buttonStyle("secondary", isDark)} onClick={() => setShareOpen(false)}>{ru.modals.close}</button>
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {commentBlockId !== null && (
        <div className={tw.modalOverlay} style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="w-full max-h-[90vh] overflow-y-auto rounded-2xl border p-4 sm:max-w-lg sm:p-5" style={{ background: v("bg-sidebar"), borderColor: v("border-primary") }}>
            <h3 className="text-lg font-semibold" style={{ color: v("text-primary") }}>Comments</h3>
            {commentsLoading ? (
              <div className="flex h-40 items-center justify-center"><Loader2 className="animate-spin" size={24} style={{ color: v("text-muted") }} /></div>
            ) : (
              <div className="mt-3 space-y-2 max-h-[400px] overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-sm" style={{ color: v("text-muted") }}>{ru.modals.noComments}</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className={`rounded-xl border p-3 ${c.resolved ? "opacity-60" : ""}`} style={{ borderColor: v("border-primary"), background: v("bg-primary") }}>
                      <p className="text-sm" style={{ color: v("text-secondary") }}>{c.content}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button className="rounded-md border px-2 py-0.5 text-xs" style={{ borderColor: v("border-secondary"), color: v("text-muted") }} onClick={() => void handleToggleResolveComment(c.id, c.resolved)}>
                          {c.resolved ? <X size={12} /> : <Check size={12} />}
                        </button>
                        <button className="rounded-md border px-2 py-0.5 text-xs" style={buttonStyle("danger", isDark)} onClick={() => void handleDeleteComment(c.id)}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            <div className="mt-3 flex gap-2">
              <input
                className={tw.inputBase + " flex-1 text-sm"}
                style={inputStyle(isDark)}
                placeholder={ru.modals.addComment}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") void handleAddComment(); }}
              />
              <button className={tw.buttonPrimary} style={buttonStyle("primary", isDark)} onClick={() => void handleAddComment()}>{ru.modals.postComment}</button>
            </div>
            <div className="mt-3 flex justify-end">
              <button className={tw.buttonSecondary} style={buttonStyle("secondary", isDark)} onClick={() => setCommentBlockId(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
