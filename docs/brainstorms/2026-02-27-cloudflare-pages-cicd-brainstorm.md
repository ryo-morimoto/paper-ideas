# Cloudflare Pages デプロイ & CI/CD 構築

**Date:** 2026-02-27
**Status:** Brainstorm

## What We're Building

Vite + React + Tailwind の静的SPAを Cloudflare Pages にデプロイするための CI/CD パイプライン。
`cloudflare/wrangler-action@v3` と GitHub Actions を使い、push ベースで自動デプロイする。

## Why This Approach

- **Wrangler Action v3** が Cloudflare Pages デプロイの公式標準（旧 `pages-action` は非推奨）
- 1ファイルのワークフローで production/preview を自動判別（main = production、それ以外 = preview）
- `wrangler.toml` 不要 — コマンドライン引数で完結するのが Pages の標準パターン
- CIパイプラインに lint/type check/build を組み込み、品質ゲートとして機能させる

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| デプロイ方式 | `cloudflare/wrangler-action@v3` | 公式推奨。`pages-action` は非推奨 |
| ワークフロー構成 | 1ファイル (`ci.yml`) | 公式ドキュメントの標準パターン。DRY |
| トリガー | `push` (全ブランチ) + `pull_request` | main push → production、PR → preview |
| wrangler.toml | 不要 | CLI引数 (`pages deploy dist --project-name=paper-ideas`) で完結 |
| パッケージマネージャ | pnpm (wrangler-action の `packageManager` で明示) | プロジェクトで採用済み |
| GitHub Deployments | 有効 (`gitHubToken` 設定) | PR/push に deploy status が表示される |
| ドメイン | *.pages.dev (デフォルト) | 後から独自ドメイン追加可能 |

## Scope

### やること

1. `.github/workflows/ci.yml` の作成
   - Lint (biome check) → Type Check (tsc -b) → Build (vite build) → Deploy (wrangler pages deploy)
   - main push → production deploy
   - PR → preview deploy + GitHub Deployments ステータス
2. GitHub Secrets の設定手順を README またはドキュメントに記載
   - `CLOUDFLARE_API_TOKEN` (Pages:Edit 権限のカスタムトークン)
   - `CLOUDFLARE_ACCOUNT_ID`

### やらないこと

- `wrangler.toml` の作成（CLI引数で完結）
- カスタムドメイン設定
- Cloudflare Workers / Functions
- テストの追加（テストフレームワーク未導入）
- 環境変数による環境分離（staging等）

## Architecture

```
main push ──→ ci.yml ──→ pnpm install → Lint → Type Check → Build → Deploy (production)

PR push   ──→ ci.yml ──→ pnpm install → Lint → Type Check → Build → Deploy (preview)
                                                                        ↓
                                                              GitHub Deployment status
```

### ファイル構成

```
.github/
  workflows/
    ci.yml              # CI + デプロイ（1ファイルで完結）
```

### GitHub Secrets (手動設定)

| Secret | 取得方法 |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare Dashboard → API Tokens → Custom Token → Account / Cloudflare Pages / Edit |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard → Workers & Pages → Account ID |

## Open Questions

- Cloudflare Pages プロジェクト名は `paper-ideas` でよいか？（`wrangler pages project create paper-ideas` で事前作成が必要）
