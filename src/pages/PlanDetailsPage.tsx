import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { domainApi } from "../shared/api/domainApi";
import type { BusinessPlan, PlanBlock } from "../shared/types/models";
import { ui } from "../styles/ui";

function SortableBlock({ block }: { block: PlanBlock }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: block.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`${ui.card} cursor-grab touch-none`}
      {...attributes}
      {...listeners}
    >
      <h3 className="text-base font-semibold text-title">{block.title}</h3>
      <p className={ui.subtitle}>{block.content}</p>
    </div>
  );
}

export function PlanDetailsPage() {
  const { planId = "" } = useParams();
  const [plan, setPlan] = useState<BusinessPlan | null>(null);
  const [blocks, setBlocks] = useState<PlanBlock[]>([]);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    if (!planId) return;
    void Promise.all([domainApi.getPlan(planId), domainApi.getBlocks(planId)]).then(([p, b]) => {
      setPlan(p);
      setBlocks(b);
    });
  }, [planId]);

  if (!plan) return <div className={ui.card}>Загрузка бизнес-плана...</div>;

  return (
    <section className="space-y-4">
      <article className={ui.card}>
        <h1 className={ui.title}>{plan.title}</h1>
        <p className={ui.subtitle}>{plan.description || "Описание отсутствует"}</p>
      </article>

      <article className="space-y-3">
        <h2 className="text-lg font-semibold text-title">Блоки плана (drag & drop)</h2>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => {
            const { active, over } = event;
            if (!over || active.id === over.id) return;
            const oldIndex = blocks.findIndex((b) => b.id === active.id);
            const newIndex = blocks.findIndex((b) => b.id === over.id);
            const next = arrayMove(blocks, oldIndex, newIndex);
            setBlocks(next);
            void domainApi.reorderBlocks(planId, next.map((b) => b.id));
          }}
        >
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {blocks.map((block) => (
                <SortableBlock key={block.id} block={block} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </article>
    </section>
  );
}
