import rawPapers from "./papers.json";
import type { Paper } from "../types/paper";

export const papers: Paper[] = rawPapers;

export const categories = [...new Set(papers.map((p) => p.category))];

export const categoryCounts = papers.reduce<Record<string, number>>((acc, p) => {
	acc[p.category] = (acc[p.category] || 0) + 1;
	return acc;
}, {});

export const categoryColorMap = papers.reduce<Record<string, string>>((acc, p) => {
	if (!acc[p.category]) acc[p.category] = p.color;
	return acc;
}, {});
