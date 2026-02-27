---
title: "refactor: Claude Artifact → Vite + React + Tailwind CSS Web App"
type: refactor
date: 2026-02-27
deepened: 2026-02-27
---

# refactor: Claude Artifact → Vite + React + Tailwind CSS Web App

## Enhancement Summary

**Deepened on:** 2026-02-27
**Research agents used:** code-simplicity-reviewer, architecture-strategist, performance-oracle

### Key Improvements
1. コンポーネント数を5→3に削減(YAGNI原則)
2. 動的カテゴリカラーのCSS変数+opacity修飾子の互換性リスクを特定・回避
3. `papers.ts` データモジュールで型安全性と派生定数を一元管理
4. Noto Sans JPフォントのセルフホスト化でパフォーマンス改善
5. React.memoでアコーディオン操作時の不要な再レンダリングを防止

---

## Overview

Claude webアーティファクトとして開発した論文実装アイデア一覧（`page.tsx`, 1413行, 50論文）を、Vite + React + Tailwind CSS v4のWebアプリにリファクタリングし、Cloudflare Pagesにデプロイする。

**動機:** 単一ファイル1400行では機能追加が困難。コンポーネント分割・データ分離・ビルド環境整備で拡張性を確保する。

**スコープ:** 現状機能の完全移植のみ。新機能追加は後続タスク。

---

## Proposed Solution

### Phase 1: プロジェクト初期化

Vite + React + TypeScript + Tailwind CSS v4のプロジェクトをセットアップする。

**作成ファイル:**

| ファイル | 内容 |
|---|---|
| `package.json` | react, react-dom, tailwindcss, @tailwindcss/vite, @fontsource/noto-sans-jp |
| `vite.config.ts` | react() + tailwindcss() プラグイン |
| `tsconfig.json` / `tsconfig.app.json` | strict mode, resolveJsonModule: true |
| `index.html` | エントリHTML (フォントはCSS importで読み込み) |
| `src/main.tsx` | ReactDOM.createRoot + CSS import |
| `src/App.tsx` | PaperExplorerをレンダリング |
| `src/index.css` | `@import "tailwindcss"` + @theme設定 |
| `.gitignore` | node_modules, dist等 |

#### Tailwind v4セットアップ (v3とは異なる)

```bash
npm install tailwindcss @tailwindcss/vite
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  --font-sans: 'Noto Sans JP', 'Hiragino Sans', -apple-system, sans-serif;
}
```

- `tailwind.config.ts` は不要 (v4はCSS-first config)
- content glob設定も不要 (v4は自動検出)

#### フォント: セルフホスト推奨

Google Fontsの外部リクエストを排除し、Cloudflare Pagesのエッジキャッシュを活用:

```bash
npm install @fontsource/noto-sans-jp
```

```typescript
// src/main.tsx
import '@fontsource/noto-sans-jp/400.css'
import '@fontsource/noto-sans-jp/700.css'
import '@fontsource/noto-sans-jp/800.css'
```

使用するウェイトのみimport: 400(本文), 700(タイトル), 800(h1)

---

### Phase 2: 型定義 + データモジュール

**作成ファイル:**

#### `src/types/paper.ts`

```typescript
export type Paper = {
  id: number;
  cat: string;
  color: string;       // hex (例: "#6366f1")
  title: string;
  venue: string;
  difficulty: "★☆☆" | "★★☆" | "★★★";
  stack: string;        // カンマ+スペース区切り
  github: string | null;
  url: string;
  summary: string;
  value: string;
  ideas: [string, string, string]; // 常に3件
};
```

#### `src/data/papers.json`

page.tsxのPAPERS配列をそのまま抽出（50件）

#### `src/data/papers.ts` — 型付きre-export + 派生定数

```typescript
import rawPapers from './papers.json';
import type { Paper } from '../types/paper';

export const papers = rawPapers as Paper[];

// 派生定数（コンポーネント内のuseMemoを排除）
export const categories = [...new Set(papers.map(p => p.cat))];

export const catCounts: Record<string, number> = {};
papers.forEach(p => { catCounts[p.cat] = (catCounts[p.cat] || 0) + 1; });

export const categoryColorMap: Record<string, string> = {};
papers.forEach(p => {
  if (!categoryColorMap[p.cat]) categoryColorMap[p.cat] = p.color;
});
```

**設計根拠:**
- JSON直接importではなくtsファイル経由にすることで、型安全性を確保
- データ移行時(将来的にAPI化する場合等)の変更箇所が1ファイルに限定される
- `catCounts`/`categories`/`categoryColorMap`はデータ由来の定数なのでモジュールスコープで計算

---

### Phase 3: コンポーネント分割

**3ファイル構成** (当初5から削減):

```
src/components/
├── PaperExplorer.tsx    # メインページ: 状態管理 + 検索バー + 難易度フィルタ + リスト
├── PaperCard.tsx        # 論文カード: 折りたたみ/展開表示
└── CategoryFilter.tsx   # カテゴリタブ群(独自のカラー管理を持つため分離)
```

**SearchBarとDifficultyFilterを独立コンポーネントにしない理由:**
- SearchBarは10行のinput要素。独自ロジックなし
- DifficultyFilterは15行のボタン群。props経由の状態のみ
- 分離するとファイル2つ + import + prop threadingが増えるだけで、再利用の見込みもない

#### PaperExplorer.tsx (メインコンテナ)

```
state:
  - selectedCat: string        (カテゴリフィルタ)
  - expandedId: number | null  (展開中カードID)
  - search: string             (検索クエリ)
  - diffFilter: string         (難易度フィルタ)

useMemo:
  - filtered: Paper[]  (3条件のANDフィルタ)
  ※ catCountsは papers.ts のモジュール定数を使用(useMemo不要)

レンダリング:
  - ヘッダー(h1 + サブタイトル)
  - 検索バー(インラインinput)
  - 難易度フィルタ(インラインボタン群)
  - <CategoryFilter selected={selectedCat} onSelect={setSelectedCat} />
  - 件数表示
  - filtered.map(p => <PaperCard ... />)
  - 空状態メッセージ
```

#### PaperCard.tsx (論文カード)

```
props:
  - paper: Paper
  - isOpen: boolean
  - onToggle: () => void

React.memoでラップ (カスタム比較関数付き):
  prev.isOpen === next.isOpen && prev.paper.id === next.paper.id

折りたたみ時(常時表示):
  - カテゴリバッジ
  - #id + タイトル + GitHub バッジ(条件付き)
  - venue · difficulty · stack (メタ行)
  - ▾ シェブロン(回転アニメーション)
  - サマリー

展開時(isOpen):
  - リンク行: 📄 論文を読む + 📦 GitHub(条件付き)
  - 🎯 根本的な価値セクション
  - 💡 社会実装アイデア(×3)セクション
  - 🛠 技術スタックタグ
```

#### CategoryFilter.tsx

```
props:
  - selected: string
  - onSelect: (cat: string) => void

内部で papers.ts から categories, catCounts, categoryColorMap をimport:
  - カテゴリ一覧、件数、色はデータ由来の定数なのでprops不要
  - "All" ボタン(papers.length件) + カテゴリボタン群
```

---

### Phase 4: インラインstyle → Tailwind CSS移行

#### 静的スタイル → Tailwindクラス

レイアウト、スペーシング、タイポグラフィ、静的カラーは全てTailwindクラスに変換:

| 用途 | Hex | Tailwindクラス |
|---|---|---|
| ページ背景 | `#fafaf9` | `bg-stone-50` |
| 見出し | `#18181b` | `text-zinc-900` |
| サブテキスト | `#71717a` | `text-zinc-500` |
| メタ・カウント | `#a1a1aa` | `text-zinc-400` |
| カード背景 | `#fff` | `bg-white` |
| カードボーダー | `#e4e4e7` | `border-zinc-200` |
| 本文 | `#52525b` | `text-zinc-600` |
| 価値テキスト | `#3f3f46` | `text-zinc-700` |
| アイデアテキスト | `#27272a` | `text-zinc-800` |
| リンク背景/テキスト | `#eff6ff`/`#2563eb` | `bg-blue-50`/`text-blue-600` |
| GitHubバッジ | `#f0fdf4`/`#16a34a` | `bg-green-50`/`text-green-600` |

#### 動的カテゴリカラー → インラインstyle維持

**重要: CSS変数 + Tailwind opacity修飾子の互換性リスク**

`bg-[var(--cat-color)]/[0.07]` はTailwind v4でCSS変数がhex値の場合、正しく動作しない可能性がある（opacity修飾子がRGBチャンネル形式を期待する場合がある）。

**採用するアプローチ: 動的カラーのみinline style**

7つの動的カラー用途は全てデータ駆動なので、inline styleで直接適用する:

```tsx
// PaperCard.tsx — 動的カラーの適用例
<span style={{
  color: paper.color,
  backgroundColor: paper.color + '12',  // hex + 8bit alpha (7% opacity)
}}>
  {paper.cat}
</span>

// 価値ボックス
<div style={{
  borderLeftColor: paper.color,
  backgroundColor: paper.color + '08',  // 3% opacity
}}>
  {paper.value}
</div>
```

**根拠:**
- 7箇所のみなので管理負担は低い
- hex + 2桁alpha (例: `#6366f112`) は全モダンブラウザ対応
- CSS変数の変換ユーティリティが不要になり、コードがシンプル
- Tailwindは静的スタイル(レイアウト/スペーシング/タイポグラフィ)に専念

---

### Phase 5: デプロイ設定

Cloudflare Pages (GitHub連携):
- Build command: `npm run build`
- Build output: `dist`
- Branch: `main`
- Preview deployments: PR作成時に自動プレビュー

---

## Technical Considerations

### 保持すべきインバリアント

1. **アコーディオン**: expandedIdは単一number。一度に1カードのみ展開
2. **カテゴリ順序**: PAPERS配列の挿入順を維持(`new Set`の挿入順保証)
3. **"All"の件数**: 常にpapers.length(50)
4. **カテゴリタブの件数**: 全体件数(フィルタ影響なし)
5. **難易度に件数なし**
6. **検索case sensitivity**: title/cat/stackはcase-insensitive、summary/value/ideasはcase-sensitive(元の挙動を忠実に維持。コードコメントで注記)
7. **外部リンク**: `target="_blank" rel="noopener noreferrer"`
8. **サマリー常時表示**: 折りたたみ状態でも表示
9. **stackの分割**: `stack.split(", ")`

### ファイル構成(最終形)

```
paper-ideas/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── .gitignore
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types/
│   │   └── paper.ts
│   ├── data/
│   │   ├── papers.json
│   │   └── papers.ts
│   └── components/
│       ├── PaperExplorer.tsx
│       ├── PaperCard.tsx
│       └── CategoryFilter.tsx
├── docs/
│   ├── brainstorms/
│   └── plans/
└── page.tsx (削除予定)
```

---

## Acceptance Criteria

- [x] `npm run dev` でローカル開発サーバーが起動し、全50論文が表示される
- [x] カテゴリフィルタ、難易度フィルタ、検索が元と同じ挙動で動作する
- [x] カード展開/折りたたみが元と同じ挙動で動作する(1カードのみ)
- [x] 外部リンク(論文URL/GitHub)が新タブで正しく開く
- [x] `npm run build` が成功し、`dist/` に静的ファイルが生成される
- [ ] 見た目が元のアーティファクトとほぼ同一である
- [x] Noto Sans JPフォントがセルフホストで正しく表示される

---

## Implementation Order

```
 1. package.json + vite.config.ts + tsconfig.json → npm install
 2. index.html + src/main.tsx + src/App.tsx + src/index.css → 空のページが表示される
 3. src/types/paper.ts → Paper型定義
 4. src/data/papers.json → page.tsxからデータ抽出
 5. src/data/papers.ts → 型付きre-export + 派生定数
 6. src/components/CategoryFilter.tsx → カテゴリタブ
 7. src/components/PaperCard.tsx → カード表示(React.memo付き)
 8. src/components/PaperExplorer.tsx → 全体統合(検索+難易度フィルタをインラインで含む)
 9. page.tsx削除
10. npm run build → ビルド確認
11. Cloudflare Pages設定
```

---

## References

- Source: `page.tsx` (current single-file artifact)
- Brainstorm: `docs/brainstorms/2026-02-27-refactor-to-web-app-brainstorm.md`
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs) — CSS-first config, @tailwindcss/vite plugin
- [@tailwindcss/vite npm](https://www.npmjs.com/package/@tailwindcss/vite) — v4.2.1
- [Tailwind v4.0 Blog](https://tailwindcss.com/blog/tailwindcss-v4) — v4の変更点
- [@fontsource/noto-sans-jp](https://fontsource.org/fonts/noto-sans-jp) — セルフホストフォント
