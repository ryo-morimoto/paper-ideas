---
title: "feat: Cloudflare Pages CI/CD with GitHub Actions"
type: feat
date: 2026-02-27
deepened: 2026-02-27
---

# feat: Cloudflare Pages CI/CD with GitHub Actions

## Enhancement Summary

**Deepened on:** 2026-02-27
**Research agents used:** best-practices-researcher, framework-docs-researcher, security-sentinel, code-simplicity-reviewer, performance-oracle

### Key Improvements
1. Fork PR ハンドリングを削除（YAGNI — 個人プロジェクト）
2. `--branch` フラグ追加で production/preview の自動ルーティング
3. `paths-ignore` でドキュメント変更時の CI スキップ
4. Concurrency グループ名を `github.head_ref || github.run_id` パターンに修正（main push 同士が干渉しない）

### New Considerations Discovered
- Cloudflare Pages は 2025年4月に非推奨化。動作継続するが新機能は Workers Static Assets のみ
- GitHub Actions Node 24 移行が **2026年3月4日**（5日後）。action の node20 → node24 更新を監視
- Wrangler CLI v3 は Q1 2026 でバグ修正終了、Q1 2027 でセキュリティパッチ終了

---

## Overview

Vite + React + Tailwind の静的SPAを Cloudflare Pages に自動デプロイする CI/CD パイプラインを構築する。
`cloudflare/wrangler-action@v3` と GitHub Actions を使い、1ファイルのワークフローで lint → build → deploy を実行する。

## Proposed Solution

`.github/workflows/ci.yml` を1つ作成し、以下のフローを実現する:

- **main push** → production deploy (`paper-ideas.pages.dev`)
- **PR** → preview deploy（GitHub Deployment ステータス表示）
- **docs のみ変更** → CI スキップ

### `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
    paths-ignore:
      - "**.md"
      - LICENSE
  pull_request:
    paths-ignore:
      - "**.md"
      - LICENSE

concurrency:
  group: ${{ github.workflow }}-${{ github.head_ref || github.run_id }}
  cancel-in-progress: true

jobs:
  ci:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Build
        run: pnpm build

      - name: Deploy to Cloudflare Pages
        if: github.event_name == 'push' || github.event_name == 'pull_request'
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist --project-name=paper-ideas --branch=${{ github.head_ref || github.ref_name }}
          packageManager: pnpm
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

### Research Insights

**`--branch` フラグが重要:**
- `--branch=main` → production deploy
- `--branch=feat/xyz` → preview deploy（ブランチ名ベースの一意URL生成）
- `github.head_ref`（PR のソースブランチ）を優先し、push 時は `github.ref_name` にフォールバック

**Fork PR ハンドリングは不要（YAGNI）:**
- 個人プロジェクトで外部コントリビューターなし
- fork PR を受け入れる場合は deploy ステップに `if` 条件を追加するだけ（2分で対応可能）

**`paths-ignore` で無駄な CI を排除:**
- README や LICENSE の変更で build + deploy が走るのを防止
- 推定 30-40 秒/回の CI 時間を節約

**Concurrency パターン:**
- `github.head_ref || github.run_id` により PR は同一ブランチで cancel、main push は各 run_id でユニークなため干渉しない
- `cancel-in-progress: true` で古い実行をキャンセル

## Technical Considerations

| Item | Decision | Rationale |
|---|---|---|
| Node.js version | 22 (LTS) | ローカルは v24 だが CI は LTS が安定。Vite 6 は Node >= 18 |
| Concurrency | `head_ref \|\| run_id` + cancel-in-progress | PR は同一ブランチで cancel、main push 同士は干渉しない |
| Permissions | `contents: read`, `deployments: write` | 最小権限。GitHub Deployments 連携に `deployments: write` が必要 |
| pnpm setup | `pnpm/action-setup@v4` | `packageManager` フィールドから自動検出。`setup-node` の前に実行必須 |
| Cache | `actions/setup-node` の `cache: pnpm` | pnpm store をキャッシュ。warm cache で install 3-5秒 |
| wrangler.toml | 不要 | CLI引数で完結。将来 Workers 移行時に追加検討 |
| wrangler version | ピン留めしない | `wrangler-action@v3` に委任。Wrangler CLI v3 は Q1 2027 までセキュリティパッチ継続 |
| Action SHA pinning | tag のみ（`@v4`） | 個人プロジェクトではタグ参照で十分。OSS化時に SHA ピン留め検討 |

### Security Notes

- **Supply chain:** action を SHA でピン留めすると supply chain 攻撃を防げるが、個人プロジェクトでは tag 参照で許容範囲
- **Secrets:** `CLOUDFLARE_API_TOKEN` は Account > Cloudflare Pages > Edit の最小スコープで作成
- **`--frozen-lockfile`:** lockfile 改ざん攻撃を防止

### Performance Profile

| Step | 推定時間 (warm cache) |
|---|---|
| checkout | 1-2s |
| pnpm/action-setup | 1-2s |
| setup-node + cache restore | 3-6s |
| pnpm install | 3-5s |
| pnpm lint (oxlint + oxfmt) | 1-2s |
| pnpm build (tsc -b + vite build) | 5-8s |
| wrangler pages deploy | 5-15s |
| **Total** | **~20-40s** |

## Acceptance Criteria

- [ ] main push で `paper-ideas.pages.dev` に自動デプロイされる（Secrets 登録後に検証）
- [ ] PR 作成で preview deploy が実行され、GitHub Deployment ステータスが表示される（Secrets 登録後に検証）
- [x] lint エラー時に build/deploy がスキップされる（GitHub Actions のステップ順序で保証）
- [x] type check エラー時に deploy がスキップされる（`tsc -b && vite build` の `&&` で保証）
- [x] `**.md` のみの変更で CI がスキップされる（`paths-ignore` で設定済み）

## Prerequisites (手動設定)

以下はワークフロー作成前に手動で設定が必要:

1. **Cloudflare Pages プロジェクト作成**
   - Cloudflare Dashboard → Workers & Pages → Create → Pages → Direct Upload
   - プロジェクト名: `paper-ideas`
   - Production branch: `main`

2. **GitHub Secrets 登録**
   - リポジトリ → Settings → Secrets and variables → Actions → New repository secret

   | Secret | 取得方法 |
   |---|---|
   | `CLOUDFLARE_API_TOKEN` | Cloudflare Dashboard → API Tokens → Create Token → Custom Token → Account / Cloudflare Pages / Edit |
   | `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard → Workers & Pages → 右サイドバー Account ID |

## Implementation Steps

1. `.github/workflows/ci.yml` を作成（上記 YAML）
2. Cloudflare Pages プロジェクトを手動作成（production branch = `main`）
3. GitHub Secrets を登録
4. テスト: ブランチを作成し PR を開いて preview deploy を確認
5. テスト: main にマージして production deploy を確認

## Scope Outside

- カスタムドメイン設定
- Cloudflare Workers / Functions への移行
- テストの追加
- `_redirects` / `_headers` ファイル（ルーティング追加時に対応）
- 環境変数による環境分離（staging等）
- Slack/Discord 通知
- build artifact のアップロード
- Action SHA ピン留め + Dependabot（OSS化時に対応）
- PR コメントへの preview URL 投稿

## Future Considerations

- **Cloudflare Pages → Workers Static Assets 移行:** Pages は非推奨（2025年4月）。新機能は Workers のみ。移行時は `wrangler.toml` に `[assets]` セクション追加が必要
- **Node 24 移行:** GitHub Actions runner が 2026年3月4日に Node 24 デフォルト化。`pnpm/action-setup`, `actions/setup-node@v4`, `wrangler-action` の更新を監視

## References

- [cloudflare/wrangler-action](https://github.com/cloudflare/wrangler-action)
- [Cloudflare Pages Direct Upload CI Guide](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)
- [Cloudflare Workers CI/CD: GitHub Actions](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/)
- [Migrate from Pages to Workers](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)
- [GitHub Actions Concurrency Docs](https://docs.github.com/actions/writing-workflows/choosing-what-your-workflow-does/control-the-concurrency-of-workflows-and-jobs)
- [GitHub Security Lab: Preventing pwn requests](https://securitylab.github.com/resources/github-actions-preventing-pwn-requests/)
- [Brainstorm](../brainstorms/2026-02-27-cloudflare-pages-cicd-brainstorm.md)
