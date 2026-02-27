import { useState } from "react";
import {
  papers,
  categories,
  categoryCounts,
  categoryColorMap,
} from "../data/papers";
import CategoryFilter from "./CategoryFilter";
import PaperCard from "./PaperCard";

export default function PaperExplorer() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState("All");

  const filtered = papers.filter((p) => {
    if (selectedCategory !== "All" && p.category !== selectedCategory) return false;
    if (diffFilter !== "All" && p.difficulty !== diffFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      // All fields are matched case-insensitively.
      return (
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.value.toLowerCase().includes(q) ||
        p.ideas.some((i) => i.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q) ||
        p.stack.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <main className="mx-auto min-h-screen max-w-[920px] bg-stone-50 px-4 py-6 font-sans">
      {/* Header */}
      <div className="mb-6">
        <h1 className="m-0 text-[22px] font-extrabold tracking-tight text-zinc-900">
          📄 2026 論文実装リスト
        </h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-500">
          50本 × 専門用語なし × 各3つの社会実装アイデア（根本価値からの演繹）×
          論文URL付き
        </p>
      </div>

      {/* Search bar */}
      <input
        type="text"
        placeholder="🔍 キーワード・技術スタック・カテゴリで検索..."
        aria-label="キーワード・技術スタック・カテゴリで検索"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3 box-border w-full rounded-[10px] border border-zinc-200 bg-white px-[14px] py-[10px] text-sm outline-none"
      />

      {/* Difficulty filter */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="mr-0.5 text-[11px] text-zinc-400">難易度</span>
        {(["All", "★☆☆", "★★☆", "★★★"] as const).map((d) => (
          <button
            key={d}
            onClick={() => setDiffFilter(d)}
            aria-pressed={diffFilter === d}
            className={`cursor-pointer rounded-xl border px-[10px] py-[3px] text-[11px] transition-all ${
              diffFilter === d
                ? "border-zinc-900 bg-zinc-900 font-semibold text-white"
                : "border-zinc-200 bg-white font-normal text-zinc-600"
            }`}
          >
            {d === "All" ? "全て" : d}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <CategoryFilter
        selected={selectedCategory}
        onSelect={setSelectedCategory}
        totalCount={papers.length}
        categories={categories}
        categoryCounts={categoryCounts}
        categoryColorMap={categoryColorMap}
      />

      {/* Result count */}
      <div className="mb-[10px] text-xs text-zinc-400" role="status" aria-live="polite">
        {filtered.length} / {papers.length} 件
      </div>

      {/* Paper list */}
      <div className="flex flex-col gap-2" role="list">
        {filtered.map((p) => (
          <div key={p.id} role="listitem">
            <PaperCard
              paper={p}
              isOpen={expandedId === p.id}
              onToggle={() =>
                setExpandedId(expandedId === p.id ? null : p.id)
              }
            />
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="py-10 text-center text-sm text-zinc-400">
          該当する論文がありません
        </div>
      )}
    </main>
  );
}
