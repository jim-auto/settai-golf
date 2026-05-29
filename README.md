# Settai Golf

「ゴルフが上手いだけでは勝てない」日本社会シミュレーターです。

Play: https://jim-auto.github.io/settai-golf/

プレイヤーは日本企業の若手社員として、上司、取引先、社内政治を読みながら、完璧な接待ゴルフを成立させます。重要なのはスコアではなく、空気、忖度、会話、微妙な負け方です。

## 遊び方

1. タイトル画面で「接待を開始」を押します。
2. 1ホールごとに会話イベントが発生します。
3. 空気を読みながら返答を選びます。
4. ティーショット、アプローチ、パットの方針を選びます。
5. 各打で動くタイミングゲージを止めます。
6. 上司と同じか、少しだけ悪いホール結果を目指します。
7. 4ホール終了後、接待指数と最終称号が出ます。

勝ちすぎると嫌われます。わざとミスしすぎてもバレます。理想は、自然に見える小さな敗北です。

## 現在入っている要素

- 会話イベント
- 突発の事件カード
- 相手ごとの好み
- タイミング式ショットミニゲーム
- 2Dトップダウン風ホール表示
- 1ホール3打構成: ティーショット、アプローチ、パット
- パット専用グリーン画面
- フェアウェイ、ラフ、バンカー、池、グリーンのライ判定
- キャラ表情と場の反応
- 隠し評価ゲージ
- 接待メモ
- 最終称号
- リザルト詳細コメント

## コンセプト

Settai Golf は本格ゴルフゲームではありません。

平成から令和の日本企業、高級ゴルフ場、PowerPoint感、名刺文化、微妙な圧を混ぜた、軽量な接待シミュレーターです。

## スクリーンショット

### AI生成キービジュアル

![Settai Golf key visual](public/generated/key-visual.png)

### タイトル

![Title screen](docs/screenshots/title.png)

### 会話イベント

![Conversation screen](docs/screenshots/conversation.png)

### ショットミニゲーム

![Shot minigame](docs/screenshots/shot-minigame.png)

### 最終評価

![Result screen](docs/screenshots/result.png)

## AI生成アート

- [Key visual](public/generated/key-visual.png)
- [Boss portrait](public/generated/boss-portrait.png)
- [Clubhouse incident](public/generated/clubhouse-incident.png)
- [Okochi conversation portrait](public/generated/portrait-okochi.png)
- [Client conversation portrait](public/generated/portrait-client.png)
- [Makino conversation portrait](public/generated/portrait-makino.png)
- [Kanzaki conversation portrait](public/generated/portrait-kanzaki.png)

## 開発方法

```bash
npm install
npm run dev
```

スクリーンショット更新:

```bash
npm run screenshots
```

ビルド確認:

```bash
npm run build
npm run preview
```

## GitHub Pages

Vite の `base` は `/settai-golf/` に設定済みです。

`gh-pages` ブランチへビルド成果物をデプロイします。リポジトリ設定の Pages で Source を `Deploy from a branch`、Branch を `gh-pages`、Folder を `/ (root)` にしてください。

公開URL:

```text
https://jim-auto.github.io/settai-golf/
```

デプロイ:

```bash
npm run deploy
```

## 技術構成

- Vite
- TypeScript
- HTML5 Canvas
- Web Audio API
- GitHub Pages 対応

## Repository

https://github.com/jim-auto/settai-golf
