# Brainstorm: Claude Artifact -> Vite Web App

**Date:** 2026-02-27
**Status:** Decided

## What We're Building

Claude webのアーティファクトとして開発した論文実装アイデア一覧ページ(`page.tsx`, 1400行, 50論文)を、Vite + React + Tailwind CSSのWebアプリとしてリファクタリングし、Cloudflare Pagesにデプロイする。

**目的:** 機能追加がしやすい構造にする + webからアクセス可能にする

**解かないこと:**
- 新機能の追加(ダークモード、ブックマーク等)は今回スコープ外
- バックエンド/DB連携
- 認証

## Why This Approach

- **Vite + React**: 軽量・高速。静的サイトに最適。Next.jsほどの機能は不要
- **Tailwind CSS**: インラインstyleからの移行が自然。ユーティリティファーストで既存のスタイル構造と親和性が高い
- **JSON分離**: 論文データの追加・編集がJSON編集だけで完結。コンポーネントとデータの関心分離
- **Cloudflare Pages**: 無料、高速、git push自動デプロイ

## Key Decisions

1. **Framework**: Vite + React (NOT Next.js) - SSRやルーティング不要のSPA
2. **Styling**: Tailwind CSS - インラインstyleから全面移行
3. **Data**: `papers.json`に分離 + TypeScript型定義
4. **Deploy**: Cloudflare Pages (GitHub連携自動デプロイ)
5. **Scope**: 現状機能の完全移植のみ。機能追加は後続タスク

## Target Structure

```
paper-ideas/
├── src/
│   ├── App.tsx                  # ルート
│   ├── main.tsx                 # エントリ
│   ├── index.css                # Tailwindベース
│   ├── components/
│   │   ├── PaperExplorer.tsx    # メインページ(フィルタ + リスト)
│   │   ├── PaperCard.tsx        # 論文カード(展開/折りたたみ)
│   │   ├── SearchBar.tsx        # 検索入力
│   │   ├── CategoryFilter.tsx   # カテゴリタブ
│   │   └── DifficultyFilter.tsx # 難易度フィルタ
│   ├── data/
│   │   └── papers.json          # 50件の論文データ
│   └── types/
│       └── paper.ts             # Paper型定義
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .gitignore
```

## Open Questions

- Tailwind v4(CSS-first config)を使うか v3を使うか → v4推奨(2026年時点でstable)
- カテゴリカラーの動的適用方法(Tailwindの制約) → CSS変数 or arbitrary values

## Next

`/workflows:plan` で実装計画を作成する。
