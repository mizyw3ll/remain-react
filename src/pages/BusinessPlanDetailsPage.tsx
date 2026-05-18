import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { ExpandableText } from "../components/ExpandableText";
import toast from "react-hot-toast";
import {
  createPlanBlockApi,
  deleteBusinessPlanApi,
  deletePlanBlockApi,
  getBusinessPlanApi,
  getPlanBlocksApi,
  getFinancialPlansApi,
  reorderPlanBlocksApi,
  updateBusinessPlanApi,
  updatePlanBlockApi,
  type BusinessPlan,
  type PlanBlock,
  type FinancialPlan,
} from "../api";
import { ConfirmModal } from "../components/ConfirmModal";
import { BlockModal } from "../components/BlockModal";
import { buttonStyle, inputStyle, tw, v, theme } from "../shared/theme";
import { useTheme } from "../features/theme/ThemeContext";

function SortableBlock({
  block,
  onDelete,
  onEdit,
  financialCharts,
  isDark,
}: {
  block: PlanBlock;
  onDelete: (block: PlanBlock) => void;
  onEdit: (block: PlanBlock) => void;
  financialCharts: FinancialPlan[];
  isDark: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });

  const linkedCharts = financialCharts.filter((c) => block.linked_financial_chart_ids.includes(c.id));

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
          <p className="text-xs" style={{ color: v("text-muted") }}>{block.block_type}</p>
          {linkedCharts.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {linkedCharts.map((chart) => (
                <Link
                  key={chart.id}
                  to={`/financial-plans/${chart.id}`}
                  className="inline-block max-w-[150px] truncate rounded-md border px-2 py-0.5 text-xs transition-colors hover:bg-opacity-80"
                  style={{ borderColor: v("border-secondary"), color: v("text-secondary"), background: v("bg-hover") }}
                  title={chart.title}
                >
                  {chart.title}
                </Link>
              ))}
            </div>
          )}
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
            style={buttonStyle("danger", isDark)}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(220, 38, 38, 0.2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            onClick={() => onDelete(block)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <ExpandableText text={block.content} className="mt-2" />
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
  const [blockForm, setBlockForm] = useState<{ title: string; content: string; block_type: string; linked_financial_chart_ids: number[] }>({
    title: "",
    content: "",
    block_type: "general",
    linked_financial_chart_ids: [],
  });
  const [financialCharts, setFinancialCharts] = useState<FinancialPlan[]>([]);

  const isEditingBlock = editingBlockId !== null;
  const canSaveBlock = blockForm.title.trim() && blockForm.content.trim();

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
      toast.error("Не удалось загрузить бизнес-план");
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  function openCreateBlockModal() {
    setEditingBlockId(null);
    setBlockForm({ title: "", content: "", block_type: "general", linked_financial_chart_ids: [] });
    setBlockModalOpen(true);
  }

  async function saveBlock() {
    if (!canSaveBlock || !planId) return;
    try {
      if (isEditingBlock) {
        await updatePlanBlockApi(planId, editingBlockId, {
          title: blockForm.title.trim(),
          content: blockForm.content.trim(),
          block_type: blockForm.block_type,
          linked_financial_chart_ids: blockForm.linked_financial_chart_ids,
        });
        toast.success("Блок обновлен");
      } else {
        await createPlanBlockApi(planId, {
          title: blockForm.title.trim(),
          content: blockForm.content.trim(),
          block_type: blockForm.block_type,
          linked_financial_chart_ids: blockForm.linked_financial_chart_ids,
        });
        toast.success("Блок добавлен");
      }
      setBlockModalOpen(false);
      setEditingBlockId(null);
      setBlockForm({ title: "", content: "", block_type: "general", linked_financial_chart_ids: [] });
      await fetchData();
    } catch {
      toast.error(isEditingBlock ? "Ошибка обновления блока" : "Ошибка создания блока");
    }
  }

  function handleEditBlock(block: PlanBlock) {
    setEditingBlockId(block.id);
    setBlockForm({
      title: block.title,
      content: block.content,
      block_type: block.block_type,
      linked_financial_chart_ids: block.linked_financial_chart_ids || [],
    });
    setBlockModalOpen(true);
  }

  function handleCancelBlockEdit() {
    setBlockModalOpen(false);
    setEditingBlockId(null);
    setBlockForm({ title: "", content: "", block_type: "general", linked_financial_chart_ids: [] });
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
      toast.success("Порядок блоков обновлен");
    } catch {
      toast.error("Не удалось сохранить порядок блоков");
      setBlocks(blocks);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget || !planId) return;
    try {
      if (deleteTarget.type === "plan") {
        await deleteBusinessPlanApi(deleteTarget.id);
        toast.success("Бизнес-план удален");
        navigate("/business-plans");
      } else {
        await deletePlanBlockApi(planId, deleteTarget.id);
        toast.success("Блок удален");
        await fetchData();
      }
    } catch {
      toast.error("Ошибка удаления");
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
      toast.success("Бизнес-план обновлен");
    } catch {
      toast.error("Ошибка обновления бизнес-плана");
    }
  }

  function handleBlockFormChange(field: string, value: string | number[]) {
    setBlockForm((prev) => ({ ...prev, [field]: value }));
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
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </article>

      <BlockModal
        open={blockModalOpen}
        title={isEditingBlock ? "Редактировать блок" : "Добавить блок"}
        form={blockForm}
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
    </section>
  );
}
