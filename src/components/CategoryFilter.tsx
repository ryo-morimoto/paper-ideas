type Props = {
  selected: string;
  onSelect: (category: string) => void;
  totalCount: number;
  categories: string[];
  categoryCounts: Record<string, number>;
  categoryColorMap: Record<string, string>;
};

export default function CategoryFilter({
  selected,
  onSelect,
  totalCount,
  categories,
  categoryCounts,
  categoryColorMap,
}: Props) {
  return (
    <div className="mb-5 flex flex-wrap gap-[5px]">
      <button
        onClick={() => onSelect("All")}
        className={`cursor-pointer rounded-xl border px-[11px] py-1 text-[11px] transition-all ${
          selected === "All"
            ? "border-zinc-900 bg-zinc-900 font-semibold text-white"
            : "border-zinc-200 bg-white font-normal text-zinc-600"
        }`}
      >
        All ({totalCount})
      </button>
      {categories.map((category) => {
        const color = categoryColorMap[category] || "#888";
        const active = selected === category;
        return (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className="cursor-pointer rounded-xl border px-[11px] py-1 text-[11px] transition-all"
            style={{
              borderColor: active ? color : "#e4e4e7",
              background: active ? color : "#fff",
              color: active ? "#fff" : "#52525b",
              fontWeight: active ? 600 : 400,
            }}
          >
            {category} ({categoryCounts[category]})
          </button>
        );
      })}
    </div>
  );
}
