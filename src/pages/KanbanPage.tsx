import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  createBoardApi,
  createCardApi,
  deleteCardApi,
  moveCardApi,
  type BoardCard,
  type BoardColumn,
} from "../api";
import { inputStyle, buttonStyle, tw, v } from "../shared/theme";
import { useTheme } from "../features/theme/ThemeContext";
import { useKanbanBoardsQuery, useKanbanBoardQuery } from "../hooks/useCachedData";
import { queryKeys } from "../lib/queryClient";

function SortableCard({
  card,
  onDelete,
}: {
  card: BoardCard;
  onDelete: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `card-${card.id}`,
    data: { type: "card", card },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border p-2 mb-2 flex items-start gap-2 group"
      {...attributes}
    >
      <button
        type="button"
        className="mt-1 cursor-grab"
        style={{ color: v("text-muted") }}
        {...listeners}
      >
        <GripVertical size={14} />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: v("text-primary") }}>
          {card.title}
        </p>
        {card.description && (
          <p className="text-xs mt-1 line-clamp-2" style={{ color: v("text-tertiary") }}>
            {card.description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDelete(card.id)}
        className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: v("text-muted") }}
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

function KanbanColumn({
  column,
  onAddCard,
  onDeleteCard,
}: {
  column: BoardColumn;
  onAddCard: (columnId: number) => void;
  onDeleteCard: (id: number) => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [newCardTitle, setNewCardTitle] = useState("");
  const [showAddCard, setShowAddCard] = useState(false);

  const cardIds = column.cards.map((c) => `card-${c.id}`);

  function handleAdd() {
    if (!newCardTitle.trim()) return;
    onAddCard(column.id);
    setNewCardTitle("");
    setShowAddCard(false);
  }

  return (
    <div
      className="w-72 shrink-0 rounded-xl border p-3 flex flex-col"
      style={{
        background: v("bg-secondary"),
        borderColor: v("border-primary"),
        maxHeight: "calc(100vh - 200px)",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        {column.color && (
          <div className="w-3 h-3 rounded-full" style={{ background: column.color }} />
        )}
        <p className="text-sm font-semibold flex-1" style={{ color: v("text-primary") }}>
          {column.title}
        </p>
        <span className="text-xs" style={{ color: v("text-tertiary") }}>
          {column.cards.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-[40px]">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {column.cards.map((card) => (
            <SortableCard key={card.id} card={card} onDelete={onDeleteCard} />
          ))}
        </SortableContext>
      </div>

      {showAddCard ? (
        <div className="mt-2">
          <input
            type="text"
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") setShowAddCard(false);
            }}
            placeholder="Название карточки"
            className="w-full rounded-lg border px-2 py-1 text-sm"
            style={inputStyle(isDark)}
            autoFocus
          />
          <div className="flex gap-1 mt-1">
            <button
              type="button"
              onClick={handleAdd}
              className="rounded-lg px-2 py-1 text-xs font-medium"
              style={buttonStyle("primary", isDark)}
            >
              Добавить
            </button>
            <button
              type="button"
              onClick={() => setShowAddCard(false)}
              className="rounded-lg px-2 py-1 text-xs"
              style={buttonStyle("secondary", isDark)}
            >
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAddCard(true)}
          className="mt-2 flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors"
          style={{ color: v("text-muted") }}
          onMouseEnter={(e) => { e.currentTarget.style.background = v("bg-hover"); }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <Plus size={14} />
          Добавить карточку
        </button>
      )}
    </div>
  );
}

export function KanbanPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const queryClient = useQueryClient();
  const { data: boards = [], isLoading } = useKanbanBoardsQuery();
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const { data: board } = useKanbanBoardQuery(selectedBoardId);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  async function handleCreateBoard() {
    if (!newBoardTitle.trim()) return;
    try {
      const newBoard = await createBoardApi({ title: newBoardTitle });
      toast.success("Доска создана");
      setShowCreateBoard(false);
      setNewBoardTitle("");
      await queryClient.invalidateQueries({ queryKey: queryKeys.kanbanBoards });
      setSelectedBoardId(newBoard.id);
    } catch {
      toast.error("Ошибка при создании доски");
    }
  }

  async function handleAddCard(columnId: number) {
    try {
      await createCardApi(columnId, { title: "Новая карточка" });
      await queryClient.invalidateQueries({ queryKey: queryKeys.kanbanBoard(selectedBoardId!) });
    } catch {
      toast.error("Ошибка");
    }
  }

  async function handleDeleteCard(cardId: number) {
    try {
      await deleteCardApi(cardId);
      await queryClient.invalidateQueries({ queryKey: queryKeys.kanbanBoard(selectedBoardId!) });
    } catch {
      toast.error("Ошибка");
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || !board) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || activeData.type !== "card") return;

    const activeCard = activeData.card as BoardCard;
    let targetColumnId = activeCard.column_id;

    if (overData?.type === "card") {
      const overCard = overData.card as BoardCard;
      targetColumnId = overCard.column_id;
    } else if (overData?.type === "column") {
      targetColumnId = overData.columnId as number;
    }

    const targetCol = board.columns.find((c) => c.id === targetColumnId);
    if (!targetCol) return;

    const targetCards = [...targetCol.cards];
    const overIndex = overData?.type === "card"
      ? targetCards.findIndex((c) => c.id === (overData.card as BoardCard).id)
      : targetCards.length;

    if (activeCard.column_id === targetColumnId) {
      const oldIndex = targetCards.findIndex((c) => c.id === activeCard.id);
      if (oldIndex !== -1 && overIndex !== -1 && oldIndex !== overIndex) {
        const newCards = arrayMove(targetCards, oldIndex, overIndex);
        const cardOrderUpdates = newCards.map((c, i) =>
          moveCardApi(c.id, { column_id: targetColumnId, card_order: i })
        );
        Promise.all(cardOrderUpdates).then(() => {
          queryClient.invalidateQueries({ queryKey: queryKeys.kanbanBoard(selectedBoardId!) });
        });
      }
    } else {
      moveCardApi(activeCard.id, {
        column_id: targetColumnId,
        card_order: overIndex >= 0 ? overIndex : targetCards.length,
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: queryKeys.kanbanBoard(selectedBoardId!) });
      });
    }
  }

  if (isLoading) {
    return (
      <div className={tw.pageContainer}>
        <h1 className="text-2xl font-semibold" style={{ color: v("text-primary") }}>Kanban</h1>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl" style={{ background: v("bg-hover") }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold" style={{ color: v("text-primary") }}>Kanban</h1>
        <button
          type="button"
          onClick={() => setShowCreateBoard(true)}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          style={buttonStyle("primary", isDark)}
        >
          <Plus size={16} />
          Новая доска
        </button>
      </div>

      {boards.length === 0 && !showCreateBoard && (
        <p className="text-sm" style={{ color: v("text-tertiary") }}>
          Нет досок. Создайте первую.
        </p>
      )}

      {showCreateBoard && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newBoardTitle}
            onChange={(e) => setNewBoardTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateBoard();
              if (e.key === "Escape") setShowCreateBoard(false);
            }}
            placeholder="Название доски"
            className="rounded-xl border px-3 py-2 text-sm"
            style={inputStyle(isDark)}
            autoFocus
          />
          <button
            type="button"
            onClick={handleCreateBoard}
            className="rounded-lg px-4 py-2 text-sm font-medium"
            style={buttonStyle("primary", isDark)}
          >
            Создать
          </button>
        </div>
      )}

      {boards.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {boards.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setSelectedBoardId(b.id === selectedBoardId ? null : b.id)}
              className="rounded-xl border px-4 py-2 text-sm transition-colors"
              style={
                selectedBoardId === b.id
                  ? buttonStyle("primary", isDark)
                  : { borderColor: v("border-primary"), color: v("text-secondary") }
              }
            >
              {b.title}
            </button>
          ))}
        </div>
      )}

      {board && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {board.columns
              .sort((a, b) => a.column_order - b.column_order)
              .map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  onAddCard={handleAddCard}
                  onDeleteCard={handleDeleteCard}
                />
              ))}
          </div>
        </DndContext>
      )}
    </div>
  );
}
