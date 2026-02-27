import type { Paper } from "../types/paper";

function isSafeUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		return parsed.protocol === "https:" || parsed.protocol === "http:";
	} catch {
		return false;
	}
}

type Props = {
	paper: Paper;
	isOpen: boolean;
	onToggle: () => void;
};

export default function PaperCard({ paper: p, isOpen, onToggle }: Props) {
	return (
		<button
			type="button"
			aria-expanded={isOpen}
			onClick={onToggle}
			className="w-full cursor-pointer rounded-xl border bg-white px-4 py-[14px] text-left transition-all focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
			style={{
				borderColor: isOpen ? p.color + "55" : "#e4e4e7",
				boxShadow: isOpen ? `0 4px 20px ${p.color}12` : "0 1px 2px rgba(0,0,0,0.03)",
			}}
		>
			{/* Collapsed: always visible */}
			<div className="flex items-start gap-[10px]">
				<span
					className="mt-0.5 shrink-0 whitespace-nowrap rounded-[10px] px-2 py-0.5 text-[10px] font-bold"
					style={{
						color: p.color,
						backgroundColor: p.color + "12",
					}}
				>
					{p.category}
				</span>
				<div className="min-w-0 flex-1">
					<div className="text-sm font-bold leading-[1.45] text-zinc-900">
						<span className="mr-1.5 text-[11px] font-normal text-zinc-300">#{p.id}</span>
						{p.title}
						{p.github && (
							<span className="ml-1.5 rounded-lg bg-green-50 px-1.5 py-px text-[10px] font-semibold text-green-600 align-middle">
								GitHub
							</span>
						)}
					</div>
					<div className="mt-[3px] text-[11px] text-zinc-400">
						{p.venue} · {p.difficulty} · {p.stack}
					</div>
				</div>
				<span
					aria-hidden="true"
					className="shrink-0 text-base text-zinc-300 transition-transform"
					style={{
						transform: isOpen ? "rotate(180deg)" : "rotate(0)",
					}}
				>
					▾
				</span>
			</div>

			<p className="mt-[10px] text-[13px] leading-[1.7] text-zinc-600">{p.summary}</p>

			{/* Expanded: detail section */}
			{isOpen && (
				<div className="mt-[14px] border-t border-zinc-100 pt-[14px]">
					{/* Links */}
					<div className="mb-3 flex flex-wrap gap-2">
						{p.url && isSafeUrl(p.url) && (
							<a
								href={p.url}
								target="_blank"
								rel="noopener noreferrer"
								onClick={(e) => e.stopPropagation()}
								className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-[10px] py-1 text-xs font-semibold text-blue-600 no-underline"
							>
								📄 論文を読む
							</a>
						)}
						{p.github && isSafeUrl(p.github) && (
							<a
								href={p.github}
								target="_blank"
								rel="noopener noreferrer"
								onClick={(e) => e.stopPropagation()}
								className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-[10px] py-1 text-xs font-semibold text-green-600 no-underline"
							>
								📦 GitHub
							</a>
						)}
					</div>

					{/* Core value */}
					<div className="mb-3">
						<div
							className="mb-1 text-[11px] font-bold tracking-[0.04em]"
							style={{ color: p.color }}
						>
							🎯 根本的な価値
						</div>
						<div
							className="rounded-lg border-l-[3px] px-3 py-2 text-[13px] leading-[1.7] text-zinc-700"
							style={{
								borderLeftColor: p.color,
								backgroundColor: p.color + "08",
							}}
						>
							{p.value}
						</div>
					</div>

					{/* Implementation ideas */}
					<div className="mb-3">
						<div
							className="mb-1.5 text-[11px] font-bold tracking-[0.04em]"
							style={{ color: p.color }}
						>
							💡 社会実装アイデア（×3）
						</div>
						<div className="flex flex-col gap-1.5">
							{p.ideas.map((idea) => (
								<div
									key={idea}
									className="rounded-lg border border-zinc-100 bg-stone-50 px-3 py-2 text-[13px] leading-[1.7] text-zinc-800"
								>
									{idea}
								</div>
							))}
						</div>
					</div>

					{/* Tech stack */}
					<div>
						<div
							className="mb-1 text-[11px] font-bold tracking-[0.04em]"
							style={{ color: p.color }}
						>
							🛠 技術スタック
						</div>
						<div className="flex flex-wrap gap-1">
							{p.stack.split(", ").map((t) => (
								<span
									key={t}
									className="rounded-[10px] bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-600"
								>
									{t}
								</span>
							))}
						</div>
					</div>
				</div>
			)}
		</button>
	);
}
