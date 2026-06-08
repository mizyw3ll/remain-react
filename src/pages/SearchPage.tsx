import { useSearchParams, Link } from "react-router-dom";
import { ScrollText, FileText, Loader2 } from "lucide-react";
import { useSearchQuery } from "../hooks/useCachedData";
import { cardStyle, tw, v } from "../shared/theme";
import { useTheme } from "../features/theme/ThemeContext";

export function SearchPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { data: results, isLoading } = useSearchQuery(query);

  return (
    <div className={tw.pageContainer}>
      <h1 className="text-2xl font-semibold" style={{ color: v("text-primary") }}>
        Результаты поиска
      </h1>

      {query && (
        <p className="text-sm" style={{ color: v("text-tertiary") }}>
          Запрос: "{query}"
        </p>
      )}

      {isLoading && (
        <div className="flex items-center gap-2" style={{ color: v("text-tertiary") }}>
          <Loader2 size={16} className="animate-spin" />
          Поиск...
        </div>
      )}

      {!isLoading && results && results.total === 0 && (
        <p className="text-sm" style={{ color: v("text-tertiary") }}>
          Ничего не найдено
        </p>
      )}

      {!isLoading && results && (
        <div className="space-y-6">
          {results.plans.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold" style={{ color: v("text-primary") }}>
                Бизнес-планы ({results.plans.length})
              </h2>
              <div className="space-y-2">
                {results.plans.map((plan: { id: number; title: string; description?: string | null }) => (
                  <Link
                    key={`plan-${plan.id}`}
                    to={`/business-plans/${plan.id}`}
                    className="flex items-center gap-3 rounded-xl border p-3 transition hover:-translate-y-0.5"
                    style={cardStyle("business", isDark)}
                  >
                    <ScrollText size={18} style={{ color: v("text-secondary") }} />
                    <div>
                      <p className="font-medium" style={{ color: v("text-primary") }}>
                        {plan.title}
                      </p>
                      {plan.description && (
                        <p className="text-sm line-clamp-1" style={{ color: v("text-tertiary") }}>
                          {plan.description}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.blocks.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold" style={{ color: v("text-primary") }}>
                Блоки ({results.blocks.length})
              </h2>
              <div className="space-y-2">
                {results.blocks.map((block: { id: number; title: string; content: string; plan_id: number; plan_title: string }) => (
                  <Link
                    key={`block-${block.id}`}
                    to={`/business-plans/${block.plan_id}`}
                    className="block rounded-xl border p-3 transition hover:-translate-y-0.5"
                    style={cardStyle("business", isDark)}
                  >
                    <div className="flex items-center gap-2">
                      <p className="font-medium" style={{ color: v("text-primary") }}>
                        {block.title}
                      </p>
                      <span className="text-xs" style={{ color: v("text-tertiary") }}>
                        ({block.plan_title})
                      </span>
                    </div>
                    {block.content && (
                      <p className="mt-1 text-sm line-clamp-2" style={{ color: v("text-tertiary") }}>
                        {block.content}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.notes.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold" style={{ color: v("text-primary") }}>
                Заметки ({results.notes.length})
              </h2>
              <div className="space-y-2">
                {results.notes.map((note: { id: number; title: string; content_markdown: string }) => (
                  <Link
                    key={`note-${note.id}`}
                    to="/notes"
                    className="block rounded-xl border p-3 transition hover:-translate-y-0.5"
                    style={cardStyle("note", isDark)}
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={18} style={{ color: v("text-secondary") }} />
                      <p className="font-medium" style={{ color: v("text-primary") }}>
                        {note.title}
                      </p>
                    </div>
                    {note.content_markdown && (
                      <p className="mt-1 text-sm line-clamp-2" style={{ color: v("text-tertiary") }}>
                        {note.content_markdown}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
