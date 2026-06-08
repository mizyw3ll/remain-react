import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import { useSearchQuery } from "../hooks/useCachedData";
import { inputStyle, v } from "../shared/theme";
import { useTheme } from "../features/theme/ThemeContext";

export function SearchBar({ onNavigate }: { onNavigate?: () => void }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: results, isLoading } = useSearchQuery(debouncedQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      onNavigate?.();
      setQuery("");
    }
  }

  function handleResultClick(path: string) {
    navigate(path);
    onNavigate?.();
    setQuery("");
  }

  const hasResults = results && results.total > 0;
  const showDropdown = debouncedQuery.length >= 2 && (isLoading || hasResults);

  return (
    <div className="relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: v("text-tertiary") }}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск..."
            className="w-full rounded-xl border py-2 pl-9 pr-3 text-sm"
            style={inputStyle(isDark)}
          />
          {isLoading && (
            <Loader2
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin"
              style={{ color: v("text-tertiary") }}
            />
          )}
        </div>
      </form>

      {showDropdown && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-xl border py-1"
          style={{
            background: v("bg-secondary"),
            borderColor: v("border-primary"),
          }}
        >
          {isLoading && (
            <div className="px-3 py-2 text-sm" style={{ color: v("text-tertiary") }}>
              Поиск...
            </div>
          )}

          {!isLoading && results && (
            <>
              {results.plans.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-xs font-medium" style={{ color: v("text-tertiary") }}>
                    Бизнес-планы
                  </div>
                  {results.plans.map((plan: { id: number; title: string }) => (
                    <button
                      key={`plan-${plan.id}`}
                      type="button"
                      onClick={() => handleResultClick(`/business-plans/${plan.id}`)}
                      className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--bg-hover)]"
                      style={{ color: v("text-primary") }}
                    >
                      {plan.title}
                    </button>
                  ))}
                </div>
              )}

              {results.blocks.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-xs font-medium" style={{ color: v("text-tertiary") }}>
                    Блоки
                  </div>
                  {results.blocks.map((block: { id: number; title: string; plan_id: number; plan_title: string }) => (
                    <button
                      key={`block-${block.id}`}
                      type="button"
                      onClick={() => handleResultClick(`/business-plans/${block.plan_id}`)}
                      className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--bg-hover)]"
                      style={{ color: v("text-primary") }}
                    >
                      <span className="font-medium">{block.title}</span>
                      <span className="ml-2 text-xs" style={{ color: v("text-tertiary") }}>
                        ({block.plan_title})
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {results.notes.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-xs font-medium" style={{ color: v("text-tertiary") }}>
                    Заметки
                  </div>
                  {results.notes.map((note: { id: number; title: string }) => (
                    <button
                      key={`note-${note.id}`}
                      type="button"
                      onClick={() => handleResultClick(`/notes`)}
                      className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--bg-hover)]"
                      style={{ color: v("text-primary") }}
                    >
                      {note.title}
                    </button>
                  ))}
                </div>
              )}

              {!hasResults && (
                <div className="px-3 py-2 text-sm" style={{ color: v("text-tertiary") }}>
                  Ничего не найдено
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
